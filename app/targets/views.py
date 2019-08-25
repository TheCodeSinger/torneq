from django.http import JsonResponse
from factionstats import settings
from . import models as tmodels
from keymanager import models as kmodels
from celery import group


def _async_stat_updates_(req, minStats: int, maxStats: int, targetCount: int):
    accounts = kmodels.Account.objects.filter(api_ready=True)
    spy_reports = tmodels.SpyReport.objects.filter(archived=False)

    if minStats is not None:
        spy_reports = spy_reports.filter(total__gte=minStats)
    if maxStats is not None:
        spy_reports = spy_reports.filter(total__lte=maxStats)

    if minStats is not None:
        spy_reports = spy_reports.order_by('total')
    else:
        spy_reports = spy_reports.order_by('-total')

    spy_reports = spy_reports.select_related('torn_id')[:min(targetCount, settings.TORN_API_MAX_TARGET_RETURN)]

    tmpjobs = list()
    update_permissions = settings.TORN_API_UNAUTHD_UPDATES or \
                         req.user.has_perm('keymanager.generate_updates') or \
                         req.user.has_perm('keymanager.generate_updates_override')
    for index, report in enumerate(spy_reports):
        tmpjobs.append(
            tmodels.update_profile_job.s(target_pk=report.torn_id_id,
                                         account_pk=accounts[index % len(accounts)].pk,
                                         update=update_permissions))
    batchresult = group(tmpjobs).apply_async().join()

    return batchresult


def targets_json_async(request):
    try:
        minStats = int(request.GET.get('minStats'))
    except (ValueError, TypeError):
        minStats = None

    try:
        maxStats = int(request.GET.get('maxStats'))
    except (ValueError, TypeError):
        maxStats = None

    try:
        targetCount = int(request.GET.get('targetCount', 10))
    except (ValueError, TypeError):
        targetCount = 10

    results = _async_stat_updates_(req=request, minStats=minStats, maxStats=maxStats, targetCount=targetCount)
    return JsonResponse({'targets': results})

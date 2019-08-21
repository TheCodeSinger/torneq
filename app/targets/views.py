from django.shortcuts import render
from django.http import JsonResponse
from factionstats import settings
from . import models as tmodels
from keymanager import models as kmodels
from celery import group


def _async_stat_updates_(req, minStats: int, maxStats: int, targetCount: int):
    accounts = kmodels.Account.objects.filter(api_ready=True)
    spy_reports = tmodels.SpyReport.objects.filter(total__gte=minStats, total__lte=maxStats, archived=False) \
                      .order_by('total', '-date_spied') \
                      .select_related('torn_id')[:min(targetCount, settings.TORN_API_MAX_TARGET_RETURN)]
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
        minStats = int(request.GET.get('minStats', 100))
    except ValueError:
        minStats = 100

    try:
        maxStats = int(request.GET.get('maxStats', 500))
    except ValueError:
        maxStats = 500

    try:
        targetCount = int(request.GET.get('targetCount', 8))
    except ValueError:
        targetCount = 8

    results = _async_stat_updates_(req=request, minStats=minStats, maxStats=maxStats, targetCount=targetCount)
    return JsonResponse({'targets': results}, json_dumps_params={'indent': 2})


def targets_pretty(request):
    try:
        minStats = int(request.GET.get('minStats', 100))
    except ValueError:
        minStats = 100

    results = _async_stat_updates_(req=request, minStats=minStats)
    return render(request, 'targets/list.html', {'targets': results, 'minStats': minStats})

from django.shortcuts import render
from django.http import JsonResponse
from factionstats import settings
from . import models as tmodels
from keymanager import models as kmodels
from celery import group


def targets_json_async(request):
    try:
        minStats = int(request.GET.get('minStats', 100))
    except ValueError:
        minStats = 100

    try:
        targetCount = int(request.GET.get('targetCount', 8))
    except ValueError:
        targetCount = 8

    accounts = kmodels.Account.objects.filter(api_ready=True)
    spy_reports = tmodels.SpyReport.objects.filter(total__gte=minStats, archived=False)\
        .order_by('total', '-date_spied')\
        .select_related('torn_id')[:min(targetCount, settings.TORN_API_MAX_TARGET_RETURN)]
    tmpjobs = list()
    for index, report in enumerate(spy_reports):
        # print(index, index % len(accounts), 'updated', report.torn_id, sep='\t')
        tmpjobs.append(tmodels.update_profile_job.s(target_pk=report.torn_id_id, account_pk=accounts[index%len(accounts)].pk))
    batchresult = group(tmpjobs).apply_async()
    return JsonResponse({'targets': batchresult.join()}, json_dumps_params={'indent': 2})

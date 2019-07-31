from django.shortcuts import render
from factionstats import settings
from . import models as tmodels
from keymanager import models as kmodels
from celery import group


def all(request):
    accounts = kmodels.Account.objects.filter(api_ready=True)
    target_list = tmodels.Target.objects.all()[:4]
    for index, target in enumerate(target_list):
        target.update_profile(account=accounts[index % len(accounts)])
        print(index, 'updated', target, sep='\t')
    page_data = {'targets': target_list}
    return render(request, 'targets/list.html', page_data)


def stats_target(request, total_stats=0, count=10):
    accounts = kmodels.Account.objects.filter(api_ready=True)
    # target_list = tmodels.Target.objects.all()[:min(count, settings.TORN_API_MAX_TARGET_RETURN)]
    # spy_reports = tmodels.SpyReport.objects.filter(total__gte=total_stats)\
    #     .order_by('total', 'torn_id', '-date_spied')\
    #     .distinct('total', 'torn_id')\
    #     .select_related('torn_id')[:min(count, settings.TORN_API_MAX_TARGET_RETURN)]
    spy_reports = tmodels.SpyReport.objects.filter(total__gte=total_stats, archived=False)\
        .order_by('total', '-date_spied')\
        .select_related('torn_id')[:min(count, settings.TORN_API_MAX_TARGET_RETURN)]
    for index, report in enumerate(spy_reports):
        report.torn_id.update_profile(account=accounts[index % len(accounts)])
        print(index, index % len(accounts), 'updated', report.torn_id, sep='\t')
    page_data = {'spy_reports': spy_reports}
    return render(request, 'targets/list.html', page_data)


def stats_target_async(request, total_stats=0, count=10):
    accounts = kmodels.Account.objects.filter(api_ready=True)
    spy_reports = tmodels.SpyReport.objects.filter(total__gte=total_stats, archived=False)\
        .order_by('total', '-date_spied')\
        .select_related('torn_id')[:min(count, settings.TORN_API_MAX_TARGET_RETURN)]
    tmpjobs = list()
    for index, report in enumerate(spy_reports):
        # report.torn_id.update_profile(account=accounts[index % len(accounts)])
        print(index, index % len(accounts), 'updated', report.torn_id, sep='\t')
        tmpjobs.append(tmodels.update_profile_job.s(target_pk=report.torn_id_id, account_pk=accounts[index%len(accounts)].pk))
    batchresult = group(tmpjobs).apply_async()
    batchresult.join()
    page_data = {'spy_reports': spy_reports.all()}
    return render(request, 'targets/list.html', page_data)

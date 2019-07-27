from django.contrib import admin
from . import models


@admin.register(models.Target)
class TargetAdmin(admin.ModelAdmin):
    list_display = ['torn_id', 'torn_name', 'added', 'last_action', 'status_updated']


@admin.register(models.SpyReport)
class SpyReportAdmin(admin.ModelAdmin):
    pass

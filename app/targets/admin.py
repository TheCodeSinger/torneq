from django.contrib import admin
from . import models


@admin.register(models.Target)
class TargetAdmin(admin.ModelAdmin):
    list_display = ['torn_id', 'torn_name', 'factionId', 'factionName', 'status', 'status2', 'added', 'last_action', 'status_updated']
    search_fields = ['torn_id', 'torn_name', 'factionId', 'factionName']

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(models.SpyReport)
class SpyReportAdmin(admin.ModelAdmin):
    list_display = ['torn_id', 'date_spied', 'level', 'total']

    def has_change_permission(self, request, obj=None):
        return False

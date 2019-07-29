from django.contrib import admin
from . import models


@admin.register(models.Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['torn_name', 'api_ready', 'torn_id', 'api_key', 'api_status']
    readonly_fields = ['api_ready', 'api_status', 'created', 'updated']
    fields = ['torn_id', 'torn_name', 'api_key'].extend(readonly_fields)


@admin.register(models.APILog)
class APILogAdmin(admin.ModelAdmin):
    list_display = ['url', 'status_code', 'account', 'key', 'activity_time', 'originating_ip']

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

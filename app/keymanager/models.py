from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Permission
import datetime
import requests
import socket
from factionstats import settings


class KeyManagerException(Exception):
    pass


class APINotReadyException(KeyManagerException):
    pass


class NextKeyManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(api_ready=True).earliest('api_last_used')


class Account(models.Model):
    torn_id = models.CharField(max_length=16)
    torn_name = models.CharField(max_length=32, blank=True)
    api_key = models.CharField(max_length=64, primary_key=True)
    api_ready = models.BooleanField(default=False)
    api_status = models.CharField(max_length=32, default='Untested', db_index=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    fsuser_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    objects = models.Manager()
    next_key = NextKeyManager()

    class Meta:
        permissions = [('generate_updates', 'Can cause target updates'),
                       ('generate_updates_override', 'Will always trigger target updates')]

    def __str__(self):
        return self.torn_id

    def __api_call__(self, endpoint, selections, override=False):
        try:
            if self.api_ready or override:
                results = requests.get(url=f"""{settings.TORN_API_BASE_URL}{endpoint}?selections={selections}&key={self.api_key}""")
                APILog(
                    originating_ip=socket.gethostname(),
                    account=self,
                    key=self.api_key,
                    status_code=results.status_code,
                    url=results.request.url,
                    body=results.text,
                ).save()
                if results.json().get('error'):
                    self.api_ready = False
                    self.api_status = results.json().get('error').get('error')
                    raise APINotReadyException('API Call resulted in error ' + results.json().get('error', {}).get('error'))
            else:
                raise APINotReadyException
        except KeyManagerException as errobj:
            if 'Incorrect key' in str(errobj):
                self.api_ready = False
                self.api_status = 'Incorrect key'
            else:
                self.api_ready = False
                self.api_status = 'UNK Error from API'

        return results or {}

    def test_key_validity(self):
        """
        Test if the API Key is valid and can be used in further requests

        :return: True is the key is active, otherwise False
        """
        if self.api_key is not None:
            if len(self.api_key) > 10:
                request = self.__api_call__(endpoint='user', selections='timestamp', override=True)
                if request.json().get('error'):
                    self.api_status = f"""Error: {request.json().get('error').get('error')}"""
                    self.api_ready = False
                    return False
                elif request.status_code == 200 and request.json().get('timestamp'):
                    self.api_status = 'Active'
                    self.api_ready = True
                    return True
                else:
                    self.api_status = 'Unknown error'
                    self.api_ready = False
                    return False
        self.api_ready = False
        self.api_status = "No Key"
        return False


class APILog(models.Model):
    activity_time = models.DateTimeField(auto_now_add=True, db_index=True)
    originating_ip = models.CharField(max_length=64, blank=True)
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    key = models.CharField(max_length=64)
    status_code = models.CharField(max_length=16, blank=True)
    url = models.CharField(max_length=128, blank=True)
    body = models.TextField(blank=True)

    class Meta:
        get_latest_by = ['activity_time']


@receiver(pre_save, sender=Account)
def test_key_on_save(sender, instance, **kwargs):
    can_generate_updates_perm = Permission.objects.get(codename='generate_updates')
    requser = instance.fsuser_id
    valid_key = instance.test_key_validity()
    if valid_key:
        if instance.fsuser_id is not None:
            requser.user_permissions.add(can_generate_updates_perm)
    else:
        requser.user_permissions.remove(can_generate_updates_perm)
    requser.save()



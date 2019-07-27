from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
import requests
import socket
from factionstats import settings


class Account(models.Model):
    torn_id = models.CharField(max_length=16, primary_key=True)
    torn_name = models.CharField(max_length=32, blank=True)
    api_key = models.CharField(max_length=64, blank=True, null=True, unique=True)
    api_ready = models.BooleanField(default=False)
    api_status = models.CharField(max_length=32, default='Untested', db_index=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    api_last_used = models.DateTimeField(blank=True, null=True, db_index=True)

    def __str__(self):
        return self.torn_id

    def __api_call__(self, endpoint, selections):
        results = requests.get(url=f"""{settings.TORN_API_BASE_URL}{endpoint}/?selections={selections}&key={self.api_key}""")
        APILog(
            originating_ip=socket.gethostname(),
            key=self.api_key,
            status_code=results.status_code,
            url=results.request.url,
            body=results.text,
        ).save()
        return results

    def test_key_validity(self):
        """
        Test if the API Key is valid and can be used in further requests

        :return: True is the key is active, otherwise False
        """
        if self.api_key is not None:
            if len(self.api_key) > 10:
                request = self.__api_call__(endpoint='user', selections='timestamp')
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
    datetime = models.DateTimeField(auto_now_add=True, db_index=True)
    originating_ip = models.CharField(max_length=64, blank=True)
    key = models.CharField(max_length=64)
    status_code = models.CharField(max_length=16, blank=True)
    url = models.CharField(max_length=128, blank=True)
    body = models.TextField(blank=True)


@receiver(pre_save, sender=Account)
def test_key_on_save(sender, instance, **kwargs):
    instance.test_key_validity()

from django.db import models
from keymanager import models as kmModels
import datetime as dt

class Target(models.Model):
    added = models.DateTimeField(auto_now_add=True)
    torn_id = models.CharField(max_length=16, primary_key=True)
    torn_name = models.CharField(max_length=32, blank=True, null=True)
    status = models.CharField(max_length=64, blank=True, null=True)
    status2 = models.CharField(max_length=64, blank=True, null=True)
    life_current = models.IntegerField(blank=True, null=True)
    life_max = models.IntegerField(blank=True, null=True)
    status_updated = models.DateTimeField(null=True, blank=True)
    level = models.IntegerField(blank=True, null=True)
    rank = models.CharField(max_length=32, blank=True, null=True)
    gender = models.CharField(max_length=16, blank=True, null=True)
    signup = models.CharField(max_length=32, blank=True, null=True)
    forum_posts = models.IntegerField(blank=True, null=True)
    karma = models.IntegerField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    role = models.CharField(max_length=32, blank=True, null=True)
    donator = models.BooleanField(blank=True, null=True)
    property = models.IntegerField(blank=True, null=True)
    last_action = models.BigIntegerField(blank=True, null=True)
    spouse = models.IntegerField(blank=True, null=True)

    def __str__(self):
        if self.torn_name:
            return self.torn_name + " " + self.torn_id
        else:
            return self.torn_id

    def update_profile(self):
        if self.status_updated:
            if self.status_updated - dt.timedelta(minutes=10) > dt.datetime.now():
                return 'Run query'
        else:
            return 'Query first time'


class SpyReport(models.Model):
    added = models.DateTimeField(auto_now_add=True)
    date_spied = models.DateTimeField(null=True, blank=True)
    torn_id = models.ForeignKey(Target, on_delete=models.CASCADE)
    spy = models.ForeignKey(kmModels.Account, on_delete=models.PROTECT, blank=True, null=True)
    strength = models.FloatField(blank=True)
    defense = models.FloatField(blank=True)
    speed = models.FloatField(blank=True)
    dexterity = models.FloatField(blank=True)
    total = models.FloatField(blank=True)

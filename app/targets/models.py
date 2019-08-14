from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import make_aware
from factionstats import celery
from keymanager import models as kmModels
import datetime as dt
import time
import pytz
from factionstats import settings


def relative_time(utcdatetime):
    diffseconds = (dt.datetime.utcnow().replace(tzinfo=pytz.UTC) - utcdatetime).total_seconds()
    if diffseconds is None:
        return None
    elif diffseconds == 1:
        return f"{int(diffseconds)} sec"
    elif diffseconds < 60:
        return f"{int(diffseconds)} secs"
    elif diffseconds <= 119:
        return f"{int(diffseconds / 60)} min"
    elif diffseconds < 3600:
        return f"{int(diffseconds / 60)} mins"
    elif diffseconds <= 7199:
        return f"{int(diffseconds / 60 / 60)} hr"
    elif diffseconds < 86400:
        return f"{int(diffseconds / 60 / 60)} hrs"
    elif diffseconds <= 172799:
        return f"{int(diffseconds / 60 / 60 / 24)} day"
    else:
        return f"{int(diffseconds / 60 / 60 / 24)} days"

class Target(models.Model):
    added = models.DateTimeField(auto_now_add=True)
    torn_id = models.CharField(max_length=16, primary_key=True)
    torn_name = models.CharField(max_length=32, blank=True, null=True)
    status = models.CharField(max_length=128, blank=True, null=True)
    status2 = models.CharField(max_length=128, blank=True, null=True)
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
    property_id = models.IntegerField(blank=True, null=True)
    last_action = models.BigIntegerField(blank=True, null=True)
    spouse = models.IntegerField(blank=True, null=True)

    @property
    def status_updated_relative(self):
        return relative_time(self.status_updated)


    @property
    def last_action_relative(self):
        return relative_time(dt.datetime.utcfromtimestamp(self.last_action).replace(tzinfo=pytz.UTC))

    def __str__(self):
        if self.torn_name:
            return self.torn_name + " " + self.torn_id
        else:
            return self.torn_id

    def update_profile(self, account, wait=settings.TORN_API_RATE):
        if self.status_updated:
            if (self.status_updated + dt.timedelta(minutes=settings.TORN_API_MIN_STATUS_DWELL_MINUTES)) < \
                    dt.datetime.utcnow().replace(tzinfo=pytz.UTC):
                try:
                    tmpprofile = self.__get_profile__(account=account)
                    for attr, value in tmpprofile.items():
                        setattr(self, attr, value)
                    self.save()
                except kmModels.APINotReadyException:
                    return False
                time.sleep(wait)
                return True
            else:
                return False
        else:
            tmpprofile = self.__get_profile__(account=account)

            for attr, value in tmpprofile.items():
                setattr(self, attr, value)
            self.save()

            time.sleep(wait)
            return True

    def __get_profile__(self, account):
        tmpcall = account.__api_call__(endpoint='user/' + self.torn_id, selections='profile')
        tmpprofile = tmpcall.json()
        output = dict()

        output['torn_name'] = tmpprofile.get('name')
        try:
            output['status'] = tmpprofile.get('status')[0]
            output['status2'] = tmpprofile.get('status')[1]
        except IndexError:
            pass
        output['life_current'] = tmpprofile.get('life').get('current')
        output['life_max'] = tmpprofile.get('life').get('maximum')
        output['status_updated'] = make_aware(dt.datetime.utcnow())
        output['level'] = tmpprofile.get('level')
        output['rank'] = tmpprofile.get('rank')
        output['gender'] = tmpprofile.get('gender')
        output['signup'] = tmpprofile.get('signup')
        output['forum_posts'] = tmpprofile.get('forum_posts')
        output['karma'] = tmpprofile.get('karma')
        output['age'] = tmpprofile.get('age')
        output['role'] = tmpprofile.get('role')
        output['donator'] = tmpprofile.get('donator')
        output['property'] = tmpprofile.get('property_id')
        output['last_action'] = tmpprofile.get('last_action').get('timestamp')
        return output


class SpyReport(models.Model):
    added = models.DateTimeField(auto_now_add=True)
    date_spied = models.DateTimeField(null=True, blank=True)
    torn_id = models.ForeignKey(Target, on_delete=models.CASCADE)
    spy = models.ForeignKey(kmModels.Account, on_delete=models.PROTECT, blank=True, null=True)
    level = models.IntegerField(blank=True)
    strength = models.FloatField(blank=True)
    defense = models.FloatField(blank=True)
    speed = models.FloatField(blank=True)
    dexterity = models.FloatField(blank=True)
    total = models.FloatField(blank=True)
    archived = models.BooleanField(default=False)

    def mark_archived(self):
        self.archived = True


# @receiver(post_save, sender=SpyReport)
def mark_previous_reports_as_archived(sender, instance, created, **kwargs):
    if created:
        SpyReport.objects.filter(torn_id=instance.torn_id, archived=False).exclude(pk=instance.pk).update(archived=True)


@celery.app.task
def update_profile_job(target_pk, account_pk, wait=settings.TORN_API_RATE):
    target = Target.objects.get(pk=target_pk)
    account = kmModels.Account.objects.get(pk=account_pk)
    if target.status_updated:
        if (target.status_updated + dt.timedelta(minutes=settings.TORN_API_MIN_STATUS_DWELL_MINUTES)) < \
                dt.datetime.utcnow().replace(tzinfo=pytz.UTC):
            try:
                tmpprofile = target.__get_profile__(account=account)
                for attr, value in tmpprofile.items():
                    setattr(target, attr, value)
                target.save()
            except kmModels.APINotReadyException:
                pass
            time.sleep(wait)



    else:
        tmpprofile = target.__get_profile__(account=account)

        for attr, value in tmpprofile.items():
            setattr(target, attr, value)
        target.save()

        time.sleep(wait)

    spyrep = target.spyreport_set.filter(archived=False).last()

    results = {
        'age': target.age,
        'level': target.level,
        'life_current': target.life_current,
        'life_max': target.life_max,
        'rank': target.rank,
        'status': target.status,
        'status2': target.status2,
        'torn_id': target.torn_id,
        'torn_name': target.torn_name,
        'last_action_relative': target.last_action_relative,
        'refreshed': target.status_updated_relative,
    }

    if spyrep:
        results['defense'] = spyrep.defense
        results['dexterity'] = spyrep.dexterity
        results['speed'] = spyrep.speed
        results['strength'] = spyrep.strength
        results['total'] = spyrep.total
    else:
        results['defense'] = None
        results['dexterity'] = None
        results['speed'] = None
        results['strength'] = None
        results['total'] = None

    return results

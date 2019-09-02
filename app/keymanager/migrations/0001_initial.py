# Generated by Django 2.2.4 on 2019-09-02 02:29

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('torn_id', models.CharField(max_length=16)),
                ('torn_name', models.CharField(blank=True, max_length=32)),
                ('api_key', models.CharField(max_length=64, primary_key=True, serialize=False)),
                ('api_ready', models.BooleanField(default=False)),
                ('api_status', models.CharField(db_index=True, default='Untested', max_length=32)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('fsuser_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'permissions': [('generate_updates', 'Can cause target updates'), ('generate_updates_override', 'Will always trigger target updates')],
            },
        ),
        migrations.CreateModel(
            name='APILog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_time', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('originating_ip', models.CharField(blank=True, max_length=64)),
                ('key', models.CharField(max_length=64)),
                ('status_code', models.CharField(blank=True, max_length=16)),
                ('url', models.CharField(blank=True, max_length=128)),
                ('body', models.TextField(blank=True)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='keymanager.Account')),
            ],
            options={
                'get_latest_by': ['activity_time'],
            },
        ),
    ]

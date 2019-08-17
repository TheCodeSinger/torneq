# Generated by Django 2.2.4 on 2019-08-17 09:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('keymanager', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='account',
            options={'permissions': [('generate_updates', 'Can cause target updates'), ('generate_updates_override', 'Will always trigger target updates')]},
        ),
        migrations.AddField(
            model_name='account',
            name='fsuser_id',
            field=models.ForeignKey(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
    ]

# Generated by Django 2.2.4 on 2019-09-04 07:36

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('keymanager', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='apilog',
            old_name='originating_ip',
            new_name='originating_worker',
        ),
        migrations.AddField(
            model_name='apilog',
            name='user_requested',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
    ]
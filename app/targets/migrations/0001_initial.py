# Generated by Django 2.2.4 on 2019-09-02 02:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Target',
            fields=[
                ('added', models.DateTimeField(auto_now_add=True)),
                ('torn_id', models.CharField(max_length=16, primary_key=True, serialize=False)),
                ('torn_name', models.CharField(blank=True, max_length=32, null=True)),
                ('status', models.CharField(blank=True, max_length=128, null=True)),
                ('status2', models.CharField(blank=True, max_length=128, null=True)),
                ('life_current', models.IntegerField(blank=True, null=True)),
                ('life_max', models.IntegerField(blank=True, null=True)),
                ('status_updated', models.DateTimeField(blank=True, null=True)),
                ('timestamp_hospital', models.BigIntegerField(blank=True, null=True)),
                ('timestamp_jail', models.BigIntegerField(blank=True, null=True)),
                ('level', models.IntegerField(blank=True, null=True)),
                ('rank', models.CharField(blank=True, max_length=32, null=True)),
                ('gender', models.CharField(blank=True, max_length=16, null=True)),
                ('signup', models.CharField(blank=True, max_length=32, null=True)),
                ('forum_posts', models.IntegerField(blank=True, null=True)),
                ('karma', models.IntegerField(blank=True, null=True)),
                ('age', models.IntegerField(blank=True, null=True)),
                ('role', models.CharField(blank=True, max_length=32, null=True)),
                ('donator', models.BooleanField(blank=True, null=True)),
                ('property_id', models.IntegerField(blank=True, null=True)),
                ('last_action', models.BigIntegerField(blank=True, null=True)),
                ('spouse', models.IntegerField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='SpyReport',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('added', models.DateTimeField(auto_now_add=True)),
                ('date_spied', models.DateTimeField(blank=True, null=True)),
                ('level', models.IntegerField(blank=True)),
                ('strength', models.BigIntegerField(blank=True)),
                ('defense', models.BigIntegerField(blank=True)),
                ('speed', models.BigIntegerField(blank=True)),
                ('dexterity', models.BigIntegerField(blank=True)),
                ('total', models.BigIntegerField(blank=True)),
                ('archived', models.BooleanField(default=False)),
                ('torn_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='targets.Target')),
            ],
        ),
    ]

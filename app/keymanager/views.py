from django.shortcuts import render
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib import auth
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from factionstats import settings
from . import models as kmodels
import requests
import json

eqFactionIds = [9524, 10296]

@csrf_exempt
@require_http_methods(['POST'])
def tornauth(request):
    user_apikey = json.loads(request.body).get('apikey')
    if user_apikey:
        if 13 < len(user_apikey) < 23:
            results = requests.get(
                url=f"""{settings.TORN_API_BASE_URL}user/?selections=profile&key={user_apikey}""")
            if 'error' in results.json():
                return JsonResponse(data=results.json())
            elif 'player_id' in results.json():
                if results.json()['faction']['faction_id'] in eqFactionIds:
                    login_user = User.objects.get_or_create(username=results.json()['name'])
                    api_account = kmodels.Account.objects.get_or_create(torn_id=results.json()['player_id'],
                                                                        torn_name=results.json()['name'],
                                                                        api_key=user_apikey,
                                                                        fsuser_id=login_user[0])
                    if api_account[0].test_key_validity():
                        auth.login(request, login_user[0])
                        return JsonResponse(data={'login': True, 'name': login_user[0].username, 'tornid': api_account[0].torn_id})
                else:
                    return JsonResponse(data={'login': False, 'error': 'Not in the righteous faction.'})

    return JsonResponse(data={'login': False, 'error': 'API Key is invalid'})

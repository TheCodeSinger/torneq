from django.urls import path
from . import views

urlpatterns = [
    path('json', views.targets_json_async, name='API Results'),
    path('view/<int:minStats>', views.targets_pretty, name='Functional View')
]
from django.urls import path
from . import views

urlpatterns = [
    path('tornauth', views.tornauth, name='Torn API Auth'),
]
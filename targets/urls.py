from django.urls import path
from . import views

urlpatterns = [
    path('all/', views.all, name='All Targets'),
    path('<int:total_stats>/<int:count>', views.stats_target, name='Targeted list'),
]
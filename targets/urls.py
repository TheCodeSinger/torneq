from django.urls import path
from . import views

urlpatterns = [
    path('all/', views.all, name='All Targets'),
    path('<int:total_stats>/<int:count>', views.stats_target, name='Targeted list'),
    path('async/<int:total_stats>/<int:count>', views.stats_target_async, name='Targeted list'),
]
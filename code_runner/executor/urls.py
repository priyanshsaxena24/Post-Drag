from django.urls import path
from .views import execute_code

urlpatterns = [
    path("api/execute/<str:language>/", execute_code, name="execute_code"),
]


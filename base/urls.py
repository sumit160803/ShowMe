from django.urls import path
from . import views

urlpatterns=[
    path('',views.lobby),
    path('room/',views.room),
    path('get-token/',views.getToken),
    path('create_user/',views.createUser),
    path('get_user/',views.getUser),
    path('delete_user/',views.deleteUser),
    
]
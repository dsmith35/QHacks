from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r"^blog$|^blog/(?P<string>.+)$|^$", views.spa_and_admin_handler, name="frontend"),
    re_path(r"^.*\.(js|png)$", views.frontend_files_handler, name="frontend"),
    re_path(r"^log-in$", views.spa_and_admin_handler, name="frontend"),
    re_path(r"^sign-up$", views.spa_and_admin_handler, name="frontend"),
    re_path(r"^profile$", views.spa_and_admin_handler, name="frontend"),
    re_path(r"^invoice/(?P<string>.+)$", views.spa_and_admin_handler, name="frontend"),
    re_path(r"^auction-gallery$|^auction-gallery/(?P<string>.+)$|^$", views.spa_and_admin_handler, name="frontend"),
]

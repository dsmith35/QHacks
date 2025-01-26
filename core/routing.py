from django.urls import re_path
from core import consumers

websocket_urlpatterns = [
    re_path(r'ws/auction/(?P<auc_id>\d+)/$', consumers.AuctionConsumer.as_asgi()),
]
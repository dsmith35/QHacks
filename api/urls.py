from django.urls import re_path, path, include
from django.views.generic import TemplateView
from api.views.publications import (
    PublicationsEndpoint,
    PublicationsQueryEndpoint,
    PaginatedPublicationsQueryEndpoint,
    PaginatedPublicationsEndpoint,
    PublicationEndpoint,
)
from api.views.auction import (
    AuctionItemsEndpoint,
    AuctionItemsQueryEndpoint,
    PaginatedAuctionItemsQueryEndpoint,
    PaginatedAuctionItemsEndpoint,
    AuctionItemEndpoint,
    AuctionBidsEndpoint,
    PinAuctionItemView,
    UnpinAuctionItemView,
)
from api.views.auth import (LoginEndpoint, LogoutEndpoint, CheckAuthEndpoint, RegisterEndpoint)
from api.views.users import UserInfoEndpoint, PublicUserInfoEndpoint
from api.views.reviews import ReviewsEndpoint
from api.views.orders import OrderEndpoint, UserOrdersEndpoint
from api.views.invoices import InvoicesEndpoint
from api.views.inboxes import InboxEndpoint

urlpatterns = [
    re_path(r"^publications/p/$", PaginatedPublicationsEndpoint.as_view()),
    re_path(r"^publications/filter/$", PublicationsQueryEndpoint.as_view()),
    re_path(r"^publications/p/filter/$", PaginatedPublicationsQueryEndpoint.as_view()),
    re_path(r"^publications/(?P<slug>[\w\-]+)/$", PublicationEndpoint.as_view()),
    re_path(r"^publications/$", PublicationsEndpoint.as_view()),  
    re_path(r"^publications/(?P<pub_id>\d+)/reviews/$", ReviewsEndpoint.as_view()),
    path('auth/register/', RegisterEndpoint.as_view(), name='register'),
    path('auth/login/', LoginEndpoint.as_view(), name='login'),
    path('userinfo/', UserInfoEndpoint.as_view(), name='user_info'),
    re_path(r"^userinfo/public/(?P<user_id>\d+)/$", PublicUserInfoEndpoint.as_view(), name='public_user_info'),
    path('auth/logout/', LogoutEndpoint.as_view(), name='logout'),
    re_path(r"^orders/$", UserOrdersEndpoint.as_view()), 
    re_path(r"^orders/(?P<order_number>[\w\-]+)/$", OrderEndpoint.as_view(), name='orders'),
    re_path(r"^invoices/(?P<order_number>[\w\-]+)/$", InvoicesEndpoint.as_view(), name='invoices'),
    path('auth/checkauth/', CheckAuthEndpoint.as_view(), name='check_auth'),
    path('inbox/', InboxEndpoint.as_view(), name='inbox'),
    re_path(r"^auction-items/p/$", PaginatedAuctionItemsEndpoint.as_view()),
    re_path(r"^auction-items/filter/$", AuctionItemsQueryEndpoint.as_view()),
    re_path(r"^auction-items/p/filter/$", PaginatedAuctionItemsQueryEndpoint.as_view()),
    re_path(r"^auction-items/(?P<slug>[\w\-]+)/$", AuctionItemEndpoint.as_view()),
    re_path(r"^auction-items/$", AuctionItemsEndpoint.as_view()), 
    re_path(r"^auction-items/(?P<auc_id>\d+)/bids/$", AuctionBidsEndpoint.as_view()),
    re_path(r"^auction-items/(?P<auc_id>\d+)/pin/$", PinAuctionItemView.as_view()),
    re_path(r"^auction-items/(?P<auc_id>\d+)/unpin/$", UnpinAuctionItemView.as_view()),
]

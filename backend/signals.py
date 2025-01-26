from .models.users import User
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.utils.timezone import now
from .models import AuctionItem
from threading import Timer
from .models.orders import Order
from .models.invoices import Invoice, InvoiceItem
from .models.inboxes import Inbox, InboxMessage
from django.core.exceptions import ObjectDoesNotExist

#generates token for superuser
@receiver(post_save, sender=User)
def create_superuser_token(sender, instance=None, created=False, **kwargs):
    if created and instance.is_superuser:
        Token.objects.get_or_create(user=instance)

@receiver(post_save, sender=AuctionItem)
def schedule_auction_end(sender, instance, created, **kwargs):
    if not created: # only on save, not on create
        # Calculate the delay in seconds
        delay = (instance.end_time - now()).total_seconds()

        # Schedule a function to run when the auction ends
        a = Timer(delay, mark_auction_as_ended, args=[instance.id]).start()

def mark_auction_as_ended(auc_id):
    try:
        auction = AuctionItem.objects.get(id=auc_id)
        print(f"Auction {auction.title} has ended.")
        order = Order.objects.create(
            sender_id=auction.seller.id,
            recipient_id=auction.highest_bid_user,
            invoice_ready=False,
            complete=True,
        )
        invoice = Invoice.objects.create(order=order)
        invoice_item = InvoiceItem.objects.create(
            invoice=invoice,
            description=auction.title,
            quantity=1,
            price=auction.highest_bid,
        )
        inbox = Inbox.objects.get(user=auction.highest_bid_user)
        inbox_message = InboxMessage.objects.create(
            inbox=inbox,
            content=f"Congratulations! You won the auction for {auction.title}. Click here to see!",
            redirect=f"/auction-gallery/{auction.slug}/",
        )
    except AuctionItem.DoesNotExist:
        pass

@receiver(post_save, sender=User)
def create_inbox_for_new_user(sender, instance, created, **kwargs):
    """
    Create an Inbox object whenever a new User is created.
    """
    if created:
        Inbox.objects.create(user=instance)
from django.db import models
from django_better_admin_arrayfield.models.fields import ArrayField

from backend.models.inboxes import InboxMessage  # If needed
from .base import TextBlock  # Assuming similar base functionalities
from cloudinary.models import CloudinaryField  # If AuctionItem has images
from backend.models import User  # User model
from backend.utils import Strings, compress_image  # Custom utilities
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from urllib.request import urlopen
import string
import secrets
from django.utils import timezone
from datetime import timedelta


# backend/models.py


class AuctionItem(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auction_items', null=False, blank=False)
    title = models.CharField(max_length=100, null=False, blank=False)
    description = models.TextField(
        max_length=500,
        verbose_name=Strings.DESCRIPTION,
        help_text=Strings.DESCRIPTION_HELPER,
        blank=True,
    )
    min_bid_increment = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=1.00,
        verbose_name=Strings.MIN_BID_INCREMENT,
        help_text=Strings.MIN_BID_INCREMENT_HELPER,
    )
    starting_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        default=0.00,
        verbose_name=Strings.STARTING_PRICE,
        help_text=Strings.STARTING_PRICE_HELPER,
    )
    highest_bid = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        default=0.00,
    )
    highest_bid_user = models.IntegerField(null=True, blank=True)
    duration = models.DurationField(
        default=timedelta(days=7),  # Default auction duration: 7 days
        verbose_name=Strings.DURATION,
        help_text=Strings.DURATION_HELPER,
    )
    end_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    visible = models.BooleanField(default=True)
    slug = models.SlugField(max_length=250, unique=True, null=True, blank=True)
    
    # **Add the image field here**
    image = CloudinaryField(Strings.IMAGE, null=True, blank=True)  # Ensure Strings.IMAGE is defined

    # Many-to-many relationship for pinned items
    pinned_by = models.ManyToManyField(User, related_name='pinned_auctions', blank=True)
    
    def save(self, *args, **kwargs):
        self.end_time = timezone.now() + self.duration
        if not self.slug:
            self.slug = self.generate_random_slug()
        if not self.image:
            # Handle default image logic if needed
            default_image_path = 'backend/static/backend/logo.png'
            if default_image_path:
                try:
                    with open(default_image_path, 'rb') as f:
                        img_temp = NamedTemporaryFile()
                        img_temp.write(f.read())
                        img_temp.flush()
                        self.image = compress_image(File(img_temp))
                except FileNotFoundError:
                    pass  # Handle missing default image appropriately
        else:
            try:
                self.image = compress_image(self.image)
            except AttributeError:
                img_temp = NamedTemporaryFile()
                img_temp.write(urlopen(self.image.url).read())
                img_temp.flush()
                self.image = compress_image(File(img_temp))
        super(AuctionItem, self).save(*args, **kwargs)
    
    def generate_random_slug(self):
        length = 15
        characters = string.ascii_letters + string.digits
        random_slug = ''.join(secrets.choice(characters) for _ in range(length))
        while AuctionItem.objects.filter(slug=random_slug).exists():
            random_slug = ''.join(secrets.choice(characters) for _ in range(length))
        return random_slug
    
    def is_active(self):
        return timezone.now() < self.end_time
    
    def __str__(self):
        return self.title


class AuctionBid(models.Model):
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auction_bids', null=False, blank=False)
    auction_item = models.ForeignKey(AuctionItem, on_delete=models.CASCADE, related_name='bids', null=False, blank=False)
    
    bid_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        null=False, 
        blank=False,
        verbose_name=Strings.BID_AMOUNT,
        help_text=Strings.BID_AMOUNT_HELPER,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if self.bid_amount < (self.auction_item.highest_bid + self.auction_item.min_bid_increment):
            raise ValueError("Bid must be at least current price plus the min bid increment.")
        
        old_highest_user = self.auction_item.highest_bid_user

        self.auction_item.highest_bid = self.bid_amount
        
        self.auction_item.highest_bid_user = self.bidder.id
        self.auction_item.save()

        super().save(*args, **kwargs)

        if old_highest_user != self.bidder:
            InboxMessage.objects.create(
                inbox_id=old_highest_user,
                content=f"You were outbid on {self.auction_item.title}! Click to go!",
                redirect=f"/auction-gallery/{self.auction_item.slug}",
            )
    
    def __str__(self):
        return f"{self.bidder} bid {self.bid_amount} on {self.auction_item}"
    
    class Meta:
        verbose_name = Strings.AUCTION_BID
        verbose_name_plural = Strings.AUCTION_BIDS
        ordering = ["-created_at"]
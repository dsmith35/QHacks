from django.db import models
from backend.models import User
import string
import secrets

class Profile(models.Model):
    order_number = models.TextField(blank=False, null=True)
from django.db import models
from backend.models import User
import string
import secrets

class Order(models.Model):
    order_number = models.TextField(blank=False, null=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, null=False, related_name='sent_orders')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, null=False, related_name='received_orders')
    complete = models.BooleanField(default=False, null=False)
    invoice_ready = models.BooleanField(default=False, null=False)
    invoice_paid = models.BooleanField(default=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order_number}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super(Order, self).save(*args, **kwargs)

    def generate_order_number(self):
        length = 12  # Length of the order number
        characters = string.ascii_uppercase + string.digits
        characters = characters.replace('I', '').replace('O', '').replace('L', '').replace('Q', '')
        
        order_number = ''.join(secrets.choice(characters) for i in range(length))
        
        # Ensure the order number is unique
        while Order.objects.filter(order_number=order_number).exists():
            order_number = ''.join(secrets.choice(characters) for i in range(length))
        
        return order_number
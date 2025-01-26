from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from backend.models.orders import Order
from backend.models.inboxes import Inbox, InboxMessage


class Invoice(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=False, related_name='invoices')
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order.order_number}"

    def save(self, *args, **kwargs):
        # Save the instance first to generate a primary key
        if not self.pk:  # Check if the instance is not saved yet
            super().save(*args, **kwargs)

        # Calculate the total cost after the instance has a primary key
        self.total_cost = sum(item.price * item.quantity for item in self.items.all())
        super().save(update_fields=['total_cost'])  # Update only the total_cost field

        # Update the order to mark it as having an invoice
        if not self.order.invoice_ready:
            self.order.invoice_ready = True
            self.order.save(update_fields=['invoice_ready'])


    def delete(self, *args, **kwargs):
        # Mark the order as not having an invoice
        if self.order.invoice_ready:
            self.order.invoice_ready = False
            self.order.save(update_fields=['invoice_ready'])
        super().delete(*args, **kwargs)


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.description} - {self.quantity} x ${self.price}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update invoice total cost after saving an invoice item
        self.invoice.total_cost = sum(item.price * item.quantity for item in self.invoice.items.all())
        self.invoice.save(update_fields=['total_cost'])


@receiver(post_save, sender=InvoiceItem)
def update_invoice_total_on_save(sender, instance, **kwargs):
    # Recalculate the total cost directly in the Invoice save method
    instance.invoice.save()


@receiver(post_delete, sender=InvoiceItem)
def update_invoice_total_on_delete(sender, instance, **kwargs):
    # Recalculate the total cost directly in the Invoice save method
    instance.invoice.save()


@receiver(post_save, sender=Invoice)
def handle_invoice_save(sender, instance, created, **kwargs):
    if created:
        recipient_inbox = Inbox.objects.filter(user=instance.order.recipient).first()
        if recipient_inbox:
            InboxMessage.objects.create(
                inbox=recipient_inbox,
                content="New invoice available (Click here)",
                redirect="/invoice/" + instance.order.order_number
            )

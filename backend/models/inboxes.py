from django.db import models
from backend.models import User

class Inbox(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, related_name='inbox')
    count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Inbox - {self.user.first_name} {self.user.last_name}"

    class Meta:
        verbose_name = "Inbox"
        verbose_name_plural = "Inboxes"

class InboxMessage(models.Model):
    inbox = models.ForeignKey(Inbox, on_delete=models.CASCADE, null=False, related_name='messages')
    content = models.TextField(blank=False, null=False)
    redirect = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

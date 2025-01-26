from django.db import models
from backend.models import User, Publication

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()  # Rating out of 100
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.publication.title} ({self.rating})'
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.publication.update_rating()

    def delete(self, *args, **kwargs):
        publication = self.publication
        super().delete(*args, **kwargs)
        publication.update_rating()
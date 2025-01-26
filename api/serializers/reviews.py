from rest_framework import serializers
from backend.models import Review


class ReviewsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = (
            "user",
            "publication",
            "rating",
            "comment",
            "created_at",
        )
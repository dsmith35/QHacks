from rest_framework import serializers
from backend.models import Publication


class PublicationsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(read_only=True)

    def get_image(self, instance):
        return instance.image.url

    class Meta:
        model = Publication
        fields = (
            "id",
            "user",
            "title",
            "slug",
            "image",
            "description",
            "about",
            "tag",
            "created_at",
            "rating",
            "num_ratings",
            "visible",
            "available",
            "hr_rate",
        )

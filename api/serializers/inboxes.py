from rest_framework import serializers
from backend.models import Inbox, InboxMessage

class InboxMessageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = InboxMessage
        fields = (
            "content",
            "redirect",
            "created_at",
        )

class InboxSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Inbox
        fields = ['user', 'count', 'messages']

    def get_messages(self, obj):
        # Use the correct related name to access the messages
        messages = obj.messages.all().order_by('-created_at')
        return InboxMessageSerializer(messages, many=True).data
from rest_framework import generics, status
from rest_framework.response import Response
from backend.models import Inbox, InboxMessage
from api.serializers.inboxes import InboxSerializer
from api.utils import validate_auth_token

class InboxEndpoint(generics.RetrieveAPIView):
    serializer_class = InboxSerializer

    def get_object(self):
        user = self.request.user
        try:
            inbox = Inbox.objects.get(user=user)
            # Annotate the Inbox with sorted InboxMessages
            return inbox
        except Inbox.DoesNotExist:
            return None

    def get(self, request, *args, **kwargs):
        # Validate the auth token
        error_response, user = validate_auth_token(request)
        if error_response:
            return error_response

        request.user = user  # Ensure request.user is set
        
        try:
            inbox = self.get_object()
            if not inbox:
                return Response({"detail": "Inbox not found for this user."}, status=status.HTTP_404_NOT_FOUND)

            # Sort the InboxMessages directly in the serializer
            serialized_inbox = self.serializer_class(inbox)
            return Response(serialized_inbox.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

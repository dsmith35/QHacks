import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AuctionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.auc_id = self.scope['url_route']['kwargs']['auc_id']
        self.auction_group_name = f'auction_{self.auc_id}'

        await self.channel_layer.group_add(
            self.auction_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.auction_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        bid = data['bid']

        await self.channel_layer.group_send(
            self.auction_group_name,
            {
                'type': 'auction_bid',
                'bid': bid
            }
        )

    async def auction_bid(self, event):
        bid = event['bid']

        await self.send(text_data=json.dumps({
            'bid': bid
        }))
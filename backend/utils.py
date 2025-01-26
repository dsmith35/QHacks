import sys
from django.utils.text import slugify
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile


class Strings:
    BUTTON_LABEL = "Button's label"
    BUTTON_LINK = "Button's link"
    IMAGE = "Image"
    DESCRIPTION = "Description"
    DESCRIPTION_HELPER = "(500 character max)"
    TITLE = "Title"
    BIOGRAPHY = "Biography"
    SUBTITLE = "Subtitle"
    ABOUT = "Your skills and experience"
    ABOUT_HELPER = "(500 character max)"
    PREVIEW = ""
    BODY = "Text body"
    CREATED_AT = "Created at"
    NAME = "Name"
    EMAIL = "Email"
    MESSAGE = "Message"
    CONTACT = "Contact"
    CONTACT_METHOD = "Contact method"
    AGE = "Age"
    CELLPHONE = "Cellphone"
    KEYWORD = "Keyword"
    PUBLICATION = "Publication"
    ADVANCED_OPTIONS = "Advanced options"
    OPTIONAL_FIELDS = "Optional fields"
    MIN_BID_INCREMENT = "Minimum bid increment"
    MIN_BID_INCREMENT_HELPER = "Minimum amount to increase bid by"
    STARTING_PRICE = "Starting price"
    STARTING_PRICE_HELPER = "Initial price of the auction item"
    DURATION = "Duration"
    DURATION_HELPER = "Length of time the auction will run"
    AUCTION_ITEM = "Auction Item"
    AUCTION_ITEMS = "Auction Items"
    AUCTION_BID = "Auction Bid"
    MINIMUM_BID = "Minimum bid"
    BID_AMOUNT = "Bid amount"
    BID_AMOUNT_HELPER = "Amount to bid"
    AUCTION_BIDS = "Auction Bids"
    BIDDER = "Bidder"
    AUCTION_DETAILS = "Auction Details"




def unique_slug_generator(model_instance):
    slug = slugify(model_instance.title)
    model_class = model_instance.__class__

    while model_class._default_manager.filter(slug=slug).exists():
        object_pk = model_class._default_manager.latest("pk")
        object_pk = object_pk.pk + 1
        slug = f"{slug}-{object_pk}"

    return slug


def compress_image(image):
    img = Image.open(image)
    if img.mode != "RGB":
        img = img.convert("RGB")
    io_stream = BytesIO()
    img.save(io_stream, format="JPEG", quality=60)
    io_stream.seek(0)

    return InMemoryUploadedFile(
        io_stream,
        "CloudinaryField",
        "%s.jpg" % image.name.split(".")[0],
        "image/jpeg",
        sys.getsizeof(io_stream),
        None,
    )


def smart_truncate(content, length=300, suffix="..."):
    if len(content) <= length:
        return content
    else:
        return " ".join(content[: length + 1].split(" ")[0:-1]) + suffix


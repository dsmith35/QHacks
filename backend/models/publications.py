from django.db import models
from django_better_admin_arrayfield.models.fields import ArrayField
from .base import TextBlock
from cloudinary.models import CloudinaryField
from backend.models import User
from backend.utils import Strings, compress_image
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from urllib.request import urlopen
import string
import secrets



class Publication(TextBlock):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False, blank=False, related_name='publication')

    title = models.TextField(max_length=50, null=True)

    image = CloudinaryField(Strings.IMAGE, null=True, blank=True)
    description = models.TextField(
        max_length=50,
        verbose_name=Strings.DESCRIPTION,
        help_text=Strings.DESCRIPTION_HELPER,
        blank=True,
    )
    tag = ArrayField(
        models.CharField(max_length=200), null=True, verbose_name=Strings.KEYWORD
    )
    slug = models.SlugField(max_length=250, unique=True, null=True)

    rating = models.SmallIntegerField(default=100)

    num_ratings = models.IntegerField(default=0)

    about = models.TextField(
        max_length=500,
        verbose_name=Strings.ABOUT,
        help_text=Strings.ABOUT_HELPER,
        blank=True,
        null=False,
    )

    visible = models.BooleanField(default=True) # Toggles publication visibility (overrides available)

    available = models.BooleanField(default=True) # determines if publication will show up to users through searching / matching (pub can still be viewed via url)

    hr_rate = models.SmallIntegerField(null=False, default=50)

    

    def save(self, *args, **kwargs):
        user = User.objects.get(id=self.user.id)

        if not self.image:
            default_image_path = 'backend/static/backend/logo.png'
            if default_image_path:
                with open(default_image_path, 'rb') as f:
                    img_temp = NamedTemporaryFile()
                    img_temp.write(f.read())
                    img_temp.flush()
                    self.image = compress_image(File(img_temp))
        else:
            try:
                self.image = compress_image(self.image)
            except AttributeError:
                img_temp = NamedTemporaryFile()
                img_temp.write(urlopen(self.image.url).read())
                img_temp.flush()
                self.image = compress_image(File(img_temp))
        
        # Generate a random slug if not provided
        if not self.slug:
            self.slug = self.generate_random_slug()

        # Set title to user's full name
        self.title = f"{user.first_name} {user.last_name[0]}."

        super(Publication, self).save(*args, **kwargs)

    def generate_random_slug(self):
        length = 15  # Length of the random slug
        characters = string.ascii_letters + string.digits
        random_slug = ''.join(secrets.choice(characters) for i in range(length))
        
        # Ensure the random slug is unique
        while Publication.objects.filter(slug=random_slug).exists():
            random_slug = ''.join(secrets.choice(characters) for i in range(length))
        
        return random_slug

    def __str__(self):
        return self.title
    
    def update_rating(self):
        reviews = self.reviews.all()
        self.num_ratings = reviews.count()
        self.rating = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0.0
        self.save()

    class Meta:
        verbose_name = Strings.PUBLICATION
        ordering = ["-created_at"]

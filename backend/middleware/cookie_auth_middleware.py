class CookieAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if 'auth_token' in request.COOKIES:
            request.META['HTTP_AUTHORIZATION'] = 'Token ' + request.COOKIES['auth_token']
        response = self.get_response(request)
        return response


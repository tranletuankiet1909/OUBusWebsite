from rest_framework import pagination

class TripPaginator(pagination.PageNumberPagination):
    page_size = 10
from oubus.models import *
from django.db.models import Count, Sum

def get_ticket_per_route(start_date, end_date):

    bus_trips = BusTrip.objects.filter(
        trip_status='finish',
        start_time__range=[start_date, end_date]
    )

    ticket_sales = Ticket.objects.filter(
        active=True,
        seat_bustrip__trip__in=bus_trips,
        invoice_ticket__isnull=False
    ).values('seat_bustrip__trip__route__route_code').annotate(total_sales=Count('id')).order_by('seat_bustrip__trip__route__route_code')
    print(ticket_sales)
    return ticket_sales

def get_review_by_rating(start_date, end_date):
    review = Review.objects.filter(
        parent__isnull=True,
        ticket__seat_bustrip__trip__start_time__range=[start_date, end_date]
    ).values('rating').annotate(total_review=Count('id')).order_by('rating')
    print(review)
    return review



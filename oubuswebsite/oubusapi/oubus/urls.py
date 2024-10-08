from django.urls import path, include
from rest_framework import routers

from oubus import views

r = routers.DefaultRouter()
r.register('students', views.StudentViewSet, basename='students')
r.register('users', views.UserViewSet, basename='users')
r.register('stations', views.StationViewSet, basename='stations')
r.register('routes', views.RouteViewSet, basename='routes')
r.register('buses', views.BusViewSet, basename='buses')
r.register('drivers', views.DriverViewSet, basename='drivers')
r.register('bustrips', views.BusTripViewSet, basename='bustrips')
r.register('tickets', views.TicketViewSet, basename='tickets')
r.register('comboes', views.ComboViewSet, basename='comboes')
r.register('reviews', views.ReviewViewSet, basename='reviews')
r.register('paymethods', views.PayMethodViewSet, basename='paymethods')
r.register('invoices', views.InvoiceViewSet, basename='invoices')
urlpatterns = [
    path('', include(r.urls)),
    path('payment-return', views.payment_callback, name='payment-return')
]
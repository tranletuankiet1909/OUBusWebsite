from django.contrib import admin
from oubus.models import (User, Student, Staff, Station, Route, BusTrip, Bus, Driver, Seat, SeatBustrip, Quotation,
                          PayMethod, Invoice, Combo, StudentCombo, Ticket, Review)

admin.site.register(User)
admin.site.register(Student)
admin.site.register(Staff)
admin.site.register(Station)
admin.site.register(Route)
admin.site.register(Bus)
admin.site.register(Seat)
admin.site.register(SeatBustrip)
admin.site.register(BusTrip)
admin.site.register(Driver)
admin.site.register(PayMethod)
admin.site.register(Invoice)
admin.site.register(Quotation)
admin.site.register(Combo)
admin.site.register(StudentCombo)
admin.site.register(Ticket)
admin.site.register(Review)
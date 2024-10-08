from datetime import timedelta, datetime
from django.db import transaction
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError
from oubus import serializers, paginators, perms
from django.db.models import Q
from django.utils import timezone
import datetime
from django.db.models import Count
from oubus.models import (User, Student, Staff, Station, Route, BusTrip, Driver, Bus, Review,
                          Ticket, SeatBustrip, Quotation, PayMethod, Invoice, Combo, StudentCombo)
from django.shortcuts import get_object_or_404, render
from decimal import Decimal
from oubus import vnpay
from oubusapi import settings
from oubus.mailjet import send_email_alert

def check_student_combo(combo):
    if combo.remaining_ticket == 0:
        student_email = combo.student.email
        status_code, response = send_email_alert(student_email)
        if status_code == 200:
            print("Email đã được gửi thành công.")
        else:
            print("Có lỗi khi gửi email:", response)
class StudentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Student.objects.all()
    serializer_class = serializers.StudentSerializer
    permission_classes = [perms.IsStaff]


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['get_tickets', 'get_invoices']:
            return [perms.IsStudent()]
        if self.action in ['get_current_user', 'change_password']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


    def create(self, request, *args, **kwargs):
        user_code = request.data.get('user_code')
        password = request.data.get('password')
        avatar = request.FILES.get('avatar')
        role = request.data.get('role')

        if role == 'student':
            try:
                student = Student.objects.get(student_code=user_code)
            except Student.DoesNotExist:
                return Response({"error": "Không tồn tại mã số sinh viên trên"}, status=status.HTTP_400_BAD_REQUEST)
            if student.user:
                return Response({"error": "Tai khoan sinh vien da ton tai"}, status=status.HTTP_400_BAD_REQUEST)
        elif role == 'staff':
            try:
                staff = Staff.objects.get(staff_code=user_code)
            except Staff.DoesNotExist:
                return Response({"error": "Khong ton tai ma nhan vien tren"}, status=status.HTTP_400_BAD_REQUEST)
            if staff.user:
                return Response({"error": "Tai khoan nhan vien da ton tai"}, status=status.HTTP_400_BAD_REQUEST)

        user = User(username=user_code, avatar=avatar, role=role)
        user.set_password(password)
        user.save()

        if role == 'student':
            student.user = user
            student.save()
        elif role == 'staff':
            staff.user = user
            staff.save()

        return Response(serializers.UserSerializer(user).data, status=status.HTTP_201_CREATED)


    @action(methods=['get', 'patch'], url_path='user-profile', detail=False)
    def get_current_user(self, request):
        user = request.user

        if request.method.__eq__('PATCH'):
            avatar = request.FILES.get('avatar')
            if avatar:
                user.avatar = avatar
                user.save()
                if user.role == 'student':
                    student = user.student_profile
                    return Response(serializers.StudentSerializer(student).data)
                staff = user.staff_profile
                return Response(serializers.StaffSerializer(staff).data)
            return Response({"error": "No avatar provided"}, status=status.HTTP_400_BAD_REQUEST)

        if user.role == 'student':
            student = user.student_profile
            return Response(serializers.StudentSerializer(student).data)
        staff = user.staff_profile
        return Response(serializers.StaffSerializer(staff).data)

    @action(methods=['patch'], url_path='change-password', detail=False)
    def change_password(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        user = request.user

        if not check_password(current_password, user.password):
            return Response({"error": "Mat khau hien tai khong chinh xac"})

        user.set_password(new_password)
        user.save()

        return Response({"message": "Mat khau da duoc thay doi thanh cong"})

    @action(methods=['get'], url_path='tickets', detail=False)
    def get_tickets(self, request):
        student = request.user.student_profile
        tickets = Ticket.objects.filter(student=student)
        return Response(serializers.TicketSerializer(tickets, many=True).data)

    @action(methods=['get'], url_path='invoices', detail=False)
    def get_invoices(self, request):
        student = request.user.student_profile
        invoices = Invoice.objects.filter(Q(student_combo__student=student) | Q(ticket__student=student) )
        return Response(serializers.InvoiceSerializer(invoices, many=True).data)

    @action(methods=['get'], url_path='combo', detail=False)
    def get_combo(self, request):
        student = request.user.student_profile
        try:
            combo = StudentCombo.objects.get(student=student, is_active=True)
        except StudentCombo.DoesNotExist:
            return Response(None)

        return Response(serializers.StudentComboSerializer(combo).data)


class StationViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Station.objects.all()
    serializer_class = serializers.StationSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PATCH', 'DELETE']:
            return [perms.IsStaff()]
        return [permissions.AllowAny()]

class RouteViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Route.objects.all()
    serializer_class = serializers.RouteSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PATCH', 'DELETE']:
            return [perms.IsStaff()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        route_code = request.data.get('route_code')
        starting_point_id = request.data.get('starting_point')
        ending_point_id = request.data.get('ending_point')

        if starting_point_id == ending_point_id:
            return Response({"error": "Diem den va di khong trung nhau"})

        try:
            starting_point = Station.objects.get(id=starting_point_id)
        except Station.DoesNotExist:
            return Response({"error": "Điểm đi không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ending_point = Station.objects.get(id=ending_point_id)
        except Station.DoesNotExist:
            return Response({"error": "Điểm đến không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        if starting_point and ending_point:
            route = Route(route_code=route_code,starting_point=starting_point,ending_point=ending_point)
            route.save()
            return Response(serializers.RouteSerializer(route).data, status=status.HTTP_201_CREATED)
        return Response({"error": "Diem di/den khong hop le"})

    def update(self, request, *args, **kwargs):
        route_id = kwargs.get('pk')
        route = Route.objects.filter(id=route_id).first()

        if not route:
            return Response({"error": "Không tìm thấy tuyến xe"}, status=status.HTTP_404_NOT_FOUND)

        route_code = request.data.get('route_code', route.route_code)  # Dùng giá trị hiện tại nếu không có dữ liệu mới
        starting_point_id = request.data.get('starting_point', route.starting_point)
        ending_point_id = request.data.get('ending_point', route.ending_point)

        if starting_point_id == ending_point_id:
            return Response({"error": "Điểm đến và đi không được trùng nhau"}, status=status.HTTP_400_BAD_REQUEST)

        if starting_point_id:
            try:
                starting_point = Station.objects.get(id=starting_point_id)
            except Station.DoesNotExist:
                return Response({"error": "Điểm đi không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            starting_point = route.starting_point

        if ending_point_id:
            try:
                ending_point = Station.objects.get(id=ending_point_id)
            except Station.DoesNotExist:
                return Response({"error": "Điểm đến không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            ending_point = route.ending_point

        route.route_code = route_code
        route.starting_point = starting_point
        route.ending_point = ending_point
        route.save()

        return Response(serializers.RouteSerializer(route).data, status=status.HTTP_200_OK)


class BusViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = serializers.BusSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PATCH', 'DELETE']:
            return [perms.IsStaff()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        name = request.data.get('name')
        license_plate = request.data.get('license_plate')
        station_id = request.data.get('station')
        seat_number = request.data.get('seat_number')
        image = request.FILES.get('image')

        try:
            station = Station.objects.get(id=station_id)
        except Station.DoesNotExist:
            return Response({'error': 'Không tồn tại xe bus '}, status=status.HTTP_400_BAD_REQUEST)

        bus = Bus.objects.create(name=name, license_plate=license_plate, station=station, seat_number=seat_number, image=image)
        return Response(serializers.BusSerializer(bus).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        bus_id = kwargs.get('pk')
        bus = Bus.objects.filter(id=bus_id).first()

        if not bus:
            return Response({"error": "Không tìm thấy xe"}, status=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name', bus.name)
        license_plate = request.data.get('license_plate', bus.license_plate)
        station_id = request.data.get('station', bus.station)
        seat_number = request.data.get('seat_number', bus.seat_number)
        available = request.data.get('available', bus.available)
        image = request.FILES.get('image')

        if station_id:
            try:
                station = Station.objects.get(id=station_id)
            except Station.DoesNotExist:
                return Response({'error': 'Không tồn tại xe bus '}, status=status.HTTP_400_BAD_REQUEST)
        else:
            station = bus.station

        bus.name = name
        bus.license_plate = license_plate
        bus.station = station
        bus.seat_number = seat_number
        bus.available = available
        bus.image = image
        bus.save()

        return Response(serializers.BusSerializer(bus).data)

class DriverViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Driver.objects.all()
    serializer_class = serializers.DriverSerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PATCH', 'DELETE']:
            return [perms.IsStaff()]
        return [permissions.IsAuthenticated()]

class BusTripViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = BusTrip.objects.all()
    serializer_class = serializers.BusTripSerializer
    pagination_class = paginators.TripPaginator

    def get_queryset(self):
        queryset = self.queryset
        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(Q(route__starting_point__name__icontains=q) | Q(route__ending_point__name__icontains=q))

            route_id = self.request.query_params.get('route_id')
            trip_status = self.request.query_params.get('trip_status')
            start_time = self.request.query_params.get('start_time')

            if start_time:
                start_time_date = datetime.strptime(start_time, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date=start_time_date)
            if route_id:
                queryset = queryset.filter(route=route_id)
            if trip_status:
                queryset = queryset.filter(trip_status=trip_status)

        return queryset

    def get_permissions(self):
        if self.action in ['booking_ticket']:
            return [permissions.IsAuthenticated()]
        if self.request.method in ['POST', 'PATCH', 'DELETE']:
            return [perms.IsStaff()]
        return [permissions.AllowAny()]

    def get_driver(self, driver_id):
        try:
            driver = Driver.objects.get(id=driver_id)
            if not driver.active:
                raise ValidationError("Tài xế hiện không khả dụng")
            return driver
        except Driver.DoesNotExist:
            raise ValidationError("Tài xế không tồn tại")

    def get_route(self, route_id):
        try:
            return Route.objects.get(id=route_id)
        except Route.DoesNotExist:
            raise ValidationError("Tuyến xe không tồn tại")

    def get_bus(self, bus_id):
        try:
            return Bus.objects.get(id=bus_id)
        except Bus.DoesNotExist:
            raise ValidationError("Xe không tồn tại")

    def validate_time(self, start_time, end_time):
        if start_time >= end_time:
            raise ValidationError("Thời gian không hợp lệ: thời gian bắt đầu phải trước thời gian kết thúc")

    def validate_driver_availability(self, driver, start_time, end_time, current_trip_id=None):
        overlapping_trips = BusTrip.objects.filter(
            driver=driver,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        if current_trip_id:
            overlapping_trips = overlapping_trips.exclude(id=current_trip_id)
        if overlapping_trips.exists():
            raise ValidationError(f"Tài xế {driver.name} đang bận trong khoảng thời gian này")

    def validate_bus_availability(self, bus, start_time, end_time, current_trip_id=None):
        overlapping_trips = BusTrip.objects.filter(
            bus=bus,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        if current_trip_id:
            overlapping_trips = overlapping_trips.exclude(id=current_trip_id)
        if overlapping_trips.exists():
            raise ValidationError(f"Xe buýt {bus.license_plate} đang bận trong khoảng thời gian này")

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        trip_status = request.data.get('trip_status', 'ready')
        driver_id = request.data.get('driver')
        route_id = request.data.get('route')
        bus_id = request.data.get('bus')

        driver = self.get_driver(driver_id)
        route = self.get_route(route_id)
        bus = self.get_bus(bus_id)
        self.validate_time(start_time, end_time)
        self.validate_driver_availability(driver, start_time, end_time)
        self.validate_bus_availability(bus, start_time, end_time)

        bustrip = BusTrip(
            start_time=start_time,
            end_time=end_time,
            available_seat=bus.seat_number,
            driver=driver,
            bus=bus,
            route=route,
            trip_status=trip_status
        )
        bustrip.save()

        return Response(serializers.BusTripSerializer(bustrip).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        bustrip_id = kwargs.get('pk')
        bustrip = BusTrip.objects.filter(id=bustrip_id).first()

        if not bustrip:
            return Response({'error': 'Không tìm thấy chuyến đi'}, status=status.HTTP_404_NOT_FOUND)

        start_time = request.data.get('start_time', bustrip.start_time)
        end_time = request.data.get('end_time', bustrip.end_time)
        route_id = request.data.get('route', bustrip.route.id)
        bus_id = request.data.get('bus', bustrip.bus.id)
        driver_id = request.data.get('driver', bustrip.driver.id)
        trip_status = request.data.get('trip_status', bustrip.trip_status)

        driver = self.get_driver(driver_id)
        route = self.get_route(route_id)
        bus = self.get_bus(bus_id)
        self.validate_time(start_time, end_time)
        self.validate_driver_availability(driver, start_time, end_time, current_trip_id=bustrip_id)
        self.validate_bus_availability(bus, start_time, end_time, current_trip_id=bustrip_id)

        bustrip.start_time = start_time
        bustrip.end_time = end_time
        bustrip.driver = driver
        bustrip.route = route
        bustrip.bus = bus
        bustrip.available_seat = bus.seat_number
        bustrip.trip_status = trip_status
        bustrip.save()

        return Response(serializers.BusTripSerializer(bustrip).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        bustrip_id = kwargs.get('pk')
        bustrip = BusTrip.objects.filter(id=bustrip_id).first()

        if not bustrip:
            return Response({'error': 'Không tìm thấy chuyến đi'}, status=status.HTTP_404_NOT_FOUND)

        bustrip.delete()

        return Response({'message': 'Chuyến đi đã bị xóa'}, status=status.HTTP_204_NO_CONTENT)

    @action(methods=['get'], url_path='seats', detail=True)
    def get_seats(self, request, pk):
        seats = self.get_object().seat_bustrip.select_related('seat').order_by('-id')
        return Response(serializers.SeatBustripSerializer(seats, many=True).data)


    @action(methods=['post'], url_path='booking', detail=True)
    def booking_ticket(self, request, pk):
        try:
            bus_trip = BusTrip.objects.get(id=pk)
            if(bus_trip.trip_status != 'ready'):
                return Response({'error': 'Chuyến xe không khả thi để đặt vé'}, status=status.HTTP_400_BAD_REQUEST)
            expiration_date = request.data.get('expiration_date', bus_trip.end_time)
            seat_bustrip_id = request.data.get('seat_bustrip')

            if request.user.role == 'student':
                student = request.user.student_profile
                staff, created = Staff.objects.get_or_create(staff_code='system', fullname='Hệ thống', position='Hệ thống')
            elif request.user.role == 'staff':
                staff = request.user.staff_profile
                student_id = request.data.get('student')
                student = Student.objects.get(id=student_id)

            seat_bustrip = SeatBustrip.objects.get(id=seat_bustrip_id, trip=bus_trip)
            if not seat_bustrip.available:
                raise ValidationError("This seat has already booked")

            quotation = Quotation.objects.get(route=bus_trip.route)
            ticket = Ticket.objects.create(
                student=student,
                staff=staff,
                seat_bustrip=seat_bustrip,
                price=quotation.price,
                expiration_date=expiration_date,
            )

            seat_bustrip.available = False
            seat_bustrip.save()

            active_combo = StudentCombo.objects.filter(student=student, is_active=True, expiration_date__gte=timezone.now(), remaining_ticket__gt=0).first()
            if active_combo:
                active_combo.remaining_ticket -= 1
                if active_combo.remaining_ticket == 0:
                    active_combo.is_active = False
                    check_student_combo(active_combo)
                    active_combo.save()
                payment_method, created = PayMethod.objects.get_or_create(pay_code='Combo', name='Combo')
                invoice = Invoice.objects.create(
                    ticket=ticket,
                    payment_method= payment_method,
                    total_price=ticket.price,
                )

            return Response(serializers.TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        except SeatBustrip.DoesNotExist:
            return Response({'error': 'Seat does not exist or is unavailable.'}, status=status.HTTP_400_BAD_REQUEST)
        except Student.DoesNotExist:
            return Response({'error': 'Student does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ComboViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Combo.objects.all()
    serializer_class = serializers.ComboSerializer

    def get_permissions(self):
        if self.action in ['register_combo']:
            return [perms.IsStudent()]

        if self.request.method in ['PATCH', 'DELETE']:
            return [perms.IsStaff()]

        return [permissions.IsAuthenticated()]

    @action(methods=['post'], url_path='register-combo', detail=True)
    def resister_combo(self, request, pk):
        student = request.user.student_profile
        combo = Combo.objects.get(id=pk)

        student_combo_list = StudentCombo.objects.filter(student=student, combo=combo, is_active=True)

        if student_combo_list:
            for c in student_combo_list:
                if c.expiration_date < timezone.now() or c.remaining_ticket == 0:
                    c.is_active = False
                    c.save()

        active_combo = StudentCombo.objects.filter(student=student, combo=combo, is_active=True, expiration_date__gt=timezone.now()).first()


        if not active_combo:
            new_combo = StudentCombo.objects.create(
                student=student,
                combo=combo,
                expiration_date=timezone.now() + timedelta(days=combo.duration),
                remaining_ticket=combo.number_of_tickets,
                is_active=True
            )
        else:
            return Response({'error': 'Sinh viên hiện tại đã đăng ký Combo'}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo hóa đơn
        payment_successful = True
        if payment_successful:
            payment_method_id = request.data.get('payment_method')
            try:
                payment_method = PayMethod.objects.get(id=payment_method_id)
            except PayMethod.DoesNotExist:
                return Response({'error': 'Phương thức thanh toán không tồn tại'}, status=status.HTTP_400_BAD_REQUEST)

            invoice = Invoice.objects.create(
                student_combo=new_combo,
                payment_method=payment_method,
                total_price=combo.price
            )

        return Response(serializers.InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)

class TicketViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = serializers.TicketSerializer


    def get_permissions(self):
        if self.action in ['checkout']:
            return [perms.TicketOwner()]

        if self.action in ['add_review', 'get_reviews']:
            return [perms.AddReview()]

        if self.action in ['create_payment', 'payment_callback']:
            return [perms.IsStudent()]
        if self.request.method in ['POST', 'PATCH', 'DELETE']:
            return [perms.IsStaff()]

        return [permissions.IsAuthenticated()]

    @action(methods=['get'], url_path='get_ticket_per_route', detail=False)
    def get_ticket_per_route(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if start_date_str and end_date_str:
            try:
                start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d')
                end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d')
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            today = datetime.datetime.today()
            start_date = today - datetime.timedelta(days=30)
            end_date = today

        bus_trips = BusTrip.objects.filter(
            trip_status='finish',
            start_time__range=[start_date, end_date]
        )

        ticket_sales = Ticket.objects.filter(
            active=True,
            seat_bustrip__trip__in=bus_trips,
            invoice_ticket__isnull=False
        ).values('seat_bustrip__trip__route__route_code').annotate(total_sales=Count('id')).order_by(
            'seat_bustrip__trip__route__route_code'
        )

        if not ticket_sales:
            return Response({"message": "No tickets sold for the given date range."}, status=status.HTTP_204_NO_CONTENT)

        return Response(ticket_sales, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='add-review', detail=True)
    def add_review(self, request, pk):
        ticket = Ticket.objects.get(id=pk)
        if ticket.invoice_ticket and ticket.seat_bustrip.trip.trip_status == 'finish':
            parent_id = request.data.copy().get('parent')
            if parent_id:
                parent = Review.objects.get(id=parent_id)
            else:
                parent = None
            review = self.get_object().review_set.create(content=request.data.get('content'), user=request.user,
                                                    rating=request.data.get('rating'), parent=parent)
            return Response(serializers.ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        if ticket.seat_bustrip.trip.trip_status == 'finish':
            return Response({'error': 'Chuyến đi chưa xuất phát'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Vé chưa thanh toán'}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path='reviews', detail=True)
    def get_reviews(self, request, pk):
        reviews = self.get_object().review_set.select_related('user').order_by('-id')
        return Response(serializers.ReviewSerializer(reviews, many=True).data)

    @action(methods=['get'], url_path='invoice', detail=True)
    def get_invoice(self, request, pk):
        ticket = self.get_object()
        invoice = ticket.invoice_ticket
        if invoice is None:
            return Response({"detail": "Hóa đơn không tồn tại."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializers.InvoiceSerializer(invoice).data)

    @action(methods=['post'], url_path='checkout', detail=True)
    def checkout(self, request, pk):
        try:
            ticket = Ticket.objects.get(id=pk)
            self.check_object_permissions(request, ticket)
        except Ticket.DoesNotExist:
            return Response({"detail": "Không tìm thấy vé."}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(ticket, 'invoice_ticket') and ticket.invoice_ticket is not None:
            return Response({'detail': 'Vé đã được thanh toán'}, status=status.HTTP_400_BAD_REQUEST)

        payment_method_id = request.data.get('payment_method')
        if not payment_method_id:
            return Response({"detail": "Payment method is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            payment_method = PayMethod.objects.get(id=payment_method_id)
        except PayMethod.DoesNotExist:
            return Response({"detail": "Invalid payment method."}, status=status.HTTP_400_BAD_REQUEST)


        payment_successful = True

        if payment_successful:
            invoice = Invoice.objects.create(
                ticket=ticket,
                payment_method=payment_method,
                total_price=ticket.price,
            )
            return Response(serializers.InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)
        return Response({'error':'Thanh toán không thành công'}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], url_path='create-payment', detail=True)
    def create_payment(self, request, pk):
        """
        API tạo URL thanh toán VNPay
        Yêu cầu body: { "ticket_id": <int> }
        """
        ticket = get_object_or_404(Ticket, id=pk, student=request.user.student_profile)

        if hasattr(ticket, 'invoice_ticket') and ticket.invoice_ticket is not None:
            return Response({'detail': 'Vé đã được thanh toán'}, status=status.HTTP_400_BAD_REQUEST)

        order_desc = "Thanh toán hóa đơn " + str(ticket.id) + " bằng VNPay"
        bank_code = request.data.get('bank_code')
        language = "vn"
        ip = get_client_ip(request)
        vnp = vnpay

        vnp.vnpay.requestData['vnp_Version'] = '2.1.0'
        vnp.vnpay.requestData['vnp_Command'] = 'pay'
        vnp.vnpay.requestData['vnp_TmnCode'] = settings.VNPAY_TMN_CODE
        vnp.vnpay.requestData['vnp_Amount'] = int(Decimal(ticket.price) * 100)
        vnp.vnpay.requestData['vnp_CurrCode'] = 'VND'
        vnp.vnpay.requestData['vnp_TxnRef'] = ticket.id
        vnp.vnpay.requestData['vnp_OrderInfo'] = order_desc
        vnp.vnpay.requestData['vnp_OrderType'] = 'billpayment'
        # Check language, default: vn
        if language and language != '':
            vnp.vnpay.requestData['vnp_Locale'] = language
        else:
            vnp.vnpay.requestData['vnp_Locale'] = 'vn'
            # Check bank_code, if bank_code is empty, customer will be selected bank on VNPAY
        if bank_code and bank_code != "":
            vnp.vnpay.requestData['vnp_BankCode'] = bank_code
        vnp.vnpay.requestData['vnp_CreateDate'] = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        vnp.vnpay.requestData['vnp_IpAddr'] = ip
        vnp.vnpay.requestData['vnp_ReturnUrl'] = settings.VNPAY_RETURN_URL
        vnpay_payment_url = vnp.vnpay.get_payment_url(vnp.vnpay, vnpay_payment_url=settings.VNPAY_URL, secret_key=settings.VNPAY_HASH_SECRET)

        return Response({'payment_url': vnpay_payment_url})

def payment_callback(request):
    inputData = request.GET
    if inputData:
        vnp = vnpay
        vnp.vnpay.responseData = inputData.dict()
        ticket_id = inputData['vnp_TxnRef']
        amount = int(inputData['vnp_Amount']) / 100
        order_desc = inputData['vnp_OrderInfo']
        vnp_TransactionNo = inputData['vnp_TransactionNo']
        vnp_ResponseCode = inputData['vnp_ResponseCode']
        vnp_TmnCode = inputData['vnp_TmnCode']
        vnp_PayDate = inputData['vnp_PayDate']
        vnp_BankCode = inputData['vnp_BankCode']
        vnp_CardType = inputData['vnp_CardType']
        if vnp.vnpay.validate_response(vnp.vnpay, secret_key=settings.VNPAY_HASH_SECRET):
            ticket = get_object_or_404(Ticket, id=ticket_id)

            if vnp_ResponseCode == '00':
                try:
                    with transaction.atomic():
                        # Cập nhật ngày hết hạn vé
                        ticket.expiration_date = ticket.seat_bustrip.trip.end_time
                        ticket.save()

                        # Tìm hoặc tạo phương thức thanh toán
                        pay_method, created = PayMethod.objects.get_or_create(
                            pay_code='VNPAY',
                            defaults={'name': 'VNPAY'}
                        )

                        # Tạo hóa đơn
                        invoice = Invoice.objects.create(
                            ticket=ticket,
                            payment_method=pay_method,
                            total_price=amount
                        )

                        # Trả về kết quả thanh toán thành công
                        return render(request, "payment/payment_return.html", {
                            "title": "Kết quả thanh toán",
                            "result": "Thành công",
                            "ticket_id": ticket_id,
                            "amount": amount,
                            "order_desc": order_desc,
                            "vnp_TransactionNo": vnp_TransactionNo,
                            "vnp_ResponseCode": vnp_ResponseCode
                        })

                except Exception as e:
                    # Trả về lỗi nếu xảy ra trong quá trình tạo hóa đơn
                    return render(request, "payment/payment_return.html", {
                        "title": "Kết quả thanh toán",
                        "result": "Lỗi",
                        "ticket_id": ticket_id,
                        "amount": amount,
                        "order_desc": order_desc,
                        "vnp_TransactionNo": vnp_TransactionNo,
                        "vnp_ResponseCode": vnp_ResponseCode,
                        "msg": f"Lỗi khi tạo hóa đơn: {str(e)}"
                    })

            else:
                # Trả về kết quả nếu mã phản hồi không phải là thành công (00)
                return render(request, "payment/payment_return.html", {
                    "title": "Kết quả thanh toán",
                    "result": "Lỗi",
                    "ticket_id": ticket_id,
                    "amount": amount,
                    "order_desc": order_desc,
                    "vnp_TransactionNo": vnp_TransactionNo,
                    "vnp_ResponseCode": vnp_ResponseCode,
                    "msg": "Giao dịch không thành công"
                })

        else:
            # Trường hợp sai checksum
            return render(request, "payment/payment_return.html", {
                "title": "Kết quả thanh toán",
                "result": "Lỗi",
                "ticket_id": ticket_id,
                "amount": amount,
                "order_desc": order_desc,
                "vnp_TransactionNo": vnp_TransactionNo,
                "vnp_ResponseCode": vnp_ResponseCode,
                "msg": "Sai checksum"
            })

    # Trường hợp không có dữ liệu inputData
    return render(request, "payment/payment_return.html", {
        "title": "Kết quả thanh toán",
        "result": "Lỗi",
        "msg": "Không có dữ liệu phản hồi từ VNPAY"
    })
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class ReviewViewSet(viewsets.ViewSet,generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.filter(active=True)
    serializer_class = serializers.ReviewSerializer
    permission_classes = [perms.IsStaff]

    @action(methods=['get'], detail=False, url_path='get_review_by_rating')
    def get_review_by_rating(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if start_date_str and end_date_str:
            try:
                start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d')
                end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d')
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            today = datetime.datetime.today()
            start_date = today - datetime.timedelta(days=30)
            end_date = today

        review = Review.objects.filter(
            parent__isnull=True,
            ticket__seat_bustrip__trip__start_time__range=[start_date, end_date]
        ).values('rating').annotate(total_review=Count('id')).order_by('rating')

        return Response(review, status=status.HTTP_200_OK)



class PayMethodViewSet(viewsets.ViewSet,generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = PayMethod.objects.filter(active=True)
    serializer_class = serializers.PayMethodSerializer
    permission_classes = [permissions.IsAuthenticated]

class InvoiceViewSet(viewsets.ViewSet,generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = Invoice.objects.filter(active=True)
    serializer_class = serializers.InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]



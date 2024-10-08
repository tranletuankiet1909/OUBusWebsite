from rest_framework import serializers
from oubus.models import (User, Student, Staff, Station, BusTrip, Route, Driver, Seat, Bus,
                          SeatBustrip, Ticket, Combo, StudentCombo, PayMethod, Invoice, Review, Quotation)

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'avatar': {'required': False}
        }

        def to_representation(self, instance):
            rep = super().to_representation(instance)
            if instance.avatar:
                rep['avatar'] = instance.avatar.url
            else:
                rep['avatar'] = None
            return rep

        def create(self, validated_data):
            data = validated_data.copy()
            user = User(**data)
            user.set_password(data["password"])
            user.save()
            return user

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Student
        fields = ['id', 'user', 'student_code', 'fullname', 'email', 'birth', 'year', 'major']


class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Staff
        fields = ['id', 'user', 'staff_code', 'fullname', 'position']

class StationSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image:
            rep['image'] = instance.image.url
        else:
            rep['image'] = None
        return rep

    class Meta:
        model = Station
        fields = ['id', 'name', 'address', 'image']

class RouteSerializer(serializers.ModelSerializer):
    starting_point = StationSerializer()
    ending_point = StationSerializer()

    class Meta:
        model = Route
        fields = ['id', 'route_code', 'starting_point', 'ending_point']

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ['id', 'name', 'id_number', 'phone', 'avatar', 'active']
        extra_kwargs = {
            'avatar': {'required': False}
        }

        def to_representation(self, instance):
            rep = super().to_representation(instance)
            if instance.avatar:
                rep['avatar'] = instance.avatar.url
            else:
                rep['avatar'] = None
            return rep

class BusSerializer(serializers.ModelSerializer):
    station = StationSerializer()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image:
            rep['image'] = instance.image.url
        else:
            rep['image'] = None
        return rep

    class Meta:
        model = Bus
        fields = ['id', 'license_plate', 'name', 'station', 'image', 'seat_number', 'available']


class BusTripSerializer(serializers.ModelSerializer):
    route = RouteSerializer()
    bus = BusSerializer()
    driver = DriverSerializer()

    class Meta:
        model = BusTrip
        fields = ['id', 'start_time', 'end_time', 'available_seat', 'route', 'bus', 'driver', 'trip_status']

class SeatSerializer(serializers.ModelSerializer):
    bus = BusSerializer()

    class Meta:
        model = Seat
        fields = ['id', 'code', 'bus']

class SeatBustripSerializer(serializers.ModelSerializer):
    seat = SeatSerializer()
    trip = BusTripSerializer()

    class Meta:
        model = SeatBustrip
        fields = ['id', 'trip', 'seat', 'available']

class QuotationSerializer(serializers.ModelSerializer):
    route = RouteSerializer()

    class Meta:
        model = Quotation
        fields = ['id', 'route', 'price']

class TicketSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    staff = StaffSerializer()
    seat_bustrip = SeatBustripSerializer()

    class Meta:
        model = Ticket
        fields = ['id', 'student', 'staff', 'seat_bustrip', 'price', 'expiration_date']

class ComboSerializer(serializers.ModelSerializer):

    class Meta:
        model = Combo
        fields = ['id', 'combo_code', 'name', 'description', 'number_of_tickets', 'duration', 'price']

class StudentComboSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    combo = ComboSerializer()

    class Meta:
        model = StudentCombo
        fields = ['id', 'student', 'combo', 'remaining_ticket', 'expiration_date', 'is_active']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    ticket = TicketSerializer()

    def get_parent(self, obj):
        if obj.parent:
            parent = Review.objects.get(pk=obj.parent.id)
            serializer = ReviewSerializer(parent)
            return serializer.data
        else:
            return None

    class Meta:
        model = Review
        fields = ['id', 'user', 'ticket', 'content', 'rating', 'parent', 'created_date', 'updated_date', 'active']

class PayMethodSerializer(serializers.ModelSerializer):

    class Meta:
        model = PayMethod
        fields = ['id', 'pay_code', 'name', 'active']

class InvoiceSerializer(serializers.ModelSerializer):
    ticket = TicketSerializer()
    student_combo = StudentComboSerializer()
    payment_method = PayMethodSerializer()

    class Meta:
        model = Invoice
        fields = ['id', 'ticket', 'student_combo', 'payment_method', 'total_price', 'active']
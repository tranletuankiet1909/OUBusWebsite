from django.db import models
from ckeditor.fields import RichTextField
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from cloudinary.models import CloudinaryField
from datetime import timedelta

class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ['-id']

class User(AbstractUser):
    avatar = CloudinaryField(folder='avatars/users/')
    role = models.CharField(max_length=20, choices=[('student', 'Sinh viên'), ('staff', 'Nhân viên')], default='student')

    def __str__(self):
        return self.username

class Student(models.Model):
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='student_profile', limit_choices_to={'role':'student'})
    student_code = models.CharField(unique=True, max_length=10)
    birth = models.DateField(auto_now=True)
    year = models.CharField(max_length=10)
    major = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    fullname = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.fullname} - {self.student_code}'


class Staff(models.Model):
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='staff_profile', limit_choices_to={'role':'staff'})
    staff_code = models.CharField(unique=True, max_length=10)
    position = models.CharField(max_length=100)
    fullname = models.CharField(max_length=100)


    def __str__(self):
        return f'{self.fullname} - {self.staff_code}'


class Station(BaseModel):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    image = CloudinaryField(null=True, folder='stations/')

    def __str__(self):
        return self.name
class Bus(BaseModel):
    license_plate = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=20)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='bus_station')
    image = CloudinaryField(null=True, folder='buses/')
    seat_number = models.IntegerField(null=True, default=0)
    available = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.license_plate} / {self.name}'

class Route(BaseModel):
    route_code = models.CharField(max_length=20, unique=True)
    starting_point = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='starting_point')
    ending_point = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='ending_point')

    class Meta:
        unique_together = ('starting_point', 'ending_point')

    def __str__(self):
        return self.route_code

class Seat(BaseModel):
    code = models.CharField(max_length=10)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='seat')

    def __str__(self):
        return self.code

    class Meta:
        unique_together = ('code', 'bus')


class Driver(BaseModel):
    name = models.CharField(max_length=50)
    id_number = models.CharField(max_length=12, unique=True)
    phone = models.CharField(max_length=10)
    avatar = CloudinaryField(null=True, folder="avatars/drivers/")

    def __str__(self):
        return self.name

class BusTrip(BaseModel):
    STATUS_CHOICE = [
        ('ready', 'Chưa khởi hành'),
        ('ongoing', 'Đang di chuyển'),
        ('finish', 'Hoàn thành')
    ]
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    available_seat = models.IntegerField(null=True, default=0)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='bus_trip_route')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='bus_trip')
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='bus_trip_driver')
    trip_status = models.CharField(max_length=50, choices=STATUS_CHOICE, default='ready')

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError('End time must be greater than start time')

        current_trip_id = self.id
        # Kiểm tra tài xế có đang bận trong một chuyến xe khác không
        if current_trip_id is not None:
            overlapping_trips = BusTrip.objects.filter(
                driver=self.driver,
                start_time__lt=self.end_time,  # Các chuyến xe bắt đầu trước khi chuyến hiện tại kết thúc
                end_time__gt=self.start_time  # Các chuyến xe kết thúc sau khi chuyến hiện tại bắt đầu
            ).exclude(id=current_trip_id)

            if overlapping_trips.exists():
                raise ValidationError(f"Driver {self.driver.name} is already assigned to another trip during this time.")

            overlapping_trips = BusTrip.objects.filter(
                bus=self.bus,
                start_time__lt=self.end_time,  # Các chuyến đi bắt đầu trước khi chuyến hiện tại kết thúc
                end_time__gt=self.start_time  # Các chuyến đi kết thúc sau khi chuyến hiện tại bắt đầu
            ).exclude(id=current_trip_id)

            if overlapping_trips.exists():
                raise ValidationError(f"Xe buýt {self.bus.license_plate} đang bận trong khoảng thời gian này")

    def save(self, *args, **kwargs):
        self.clean()
        self.available_seat = self.bus.seat_number
        self.bus.save()

        super(BusTrip, self).save(*args, **kwargs)
        if not self.seat_bustrip.exists():
            for seat in self.bus.seat.all():  # Lấy tất cả ghế từ bus
                SeatBustrip.objects.create(
                    seat=seat,
                    trip=self,
                    available=True  # Đặt trạng thái sẵn sàng cho ghế
                )


    def __str__(self):
        return f'{self.route.route_code} - {self.start_time}'

class SeatBustrip(BaseModel):
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='bustrip_seat')
    trip = models.ForeignKey(BusTrip, on_delete=models.CASCADE, related_name='seat_bustrip')
    available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('seat', 'trip')

    def __str__(self):
        return f'{self.seat} / {self.trip}'

class Quotation(BaseModel):
    route = models.OneToOneField(Route, on_delete=models.SET_NULL, related_name='route_price', null=True)
    price = models.DecimalField(max_digits=13, decimal_places=3)

    def __str__(self):
        return f'{self.route}: {self.price}'


class Ticket(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='tickets')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='tickets_staff')
    seat_bustrip = models.OneToOneField(SeatBustrip, on_delete=models.CASCADE, related_name='ticket')
    price = models.DecimalField(max_digits=13, decimal_places=3)
    expiration_date = models.DateTimeField()



    def __str__(self):
        return f'{self.student} - {self.seat_bustrip} - {self.price}'

    def save(self, *args, **kwargs):
        if not self.pk and Ticket.objects.filter(student=self.student,
                                                 seat_bustrip__trip=self.seat_bustrip.trip).exists():
            raise ValidationError("Sinh viên này đã đặt vé cho chuyến xe này.")

        self.seat_bustrip.available = False
        self.seat_bustrip.save()
        super().save(*args, **kwargs)

class Combo(BaseModel):
    combo_code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    description = RichTextField()
    number_of_tickets = models.PositiveIntegerField(default=0)
    duration = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=13, decimal_places=3)

    def __str__(self):
        return self.name

class StudentCombo(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='combo')
    combo = models.ForeignKey(Combo, on_delete=models.CASCADE, related_name='combo_students')
    remaining_ticket = models.PositiveIntegerField()
    expiration_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.student} - {self.combo}'


class Review(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    content = models.CharField(max_length=255)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    parent = models.OneToOneField('Review', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} - {self.ticket}'



class PayMethod(BaseModel):
    pay_code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.pay_code


class Invoice(BaseModel):
    ticket = models.OneToOneField(Ticket, on_delete=models.SET_NULL, related_name='invoice_ticket', null=True, blank=True)
    student_combo = models.OneToOneField(StudentCombo, on_delete=models.SET_NULL, related_name='invoice_combo', null=True, blank=True)
    payment_method = models.ForeignKey(PayMethod, on_delete=models.CASCADE, related_name='invoices')
    total_price = models.DecimalField(decimal_places=3, max_digits=13)


    def __str__(self):
        return f'Invoice: {self.total_price}'


    def clean(self):
        if (self.ticket and self.student_combo) or (not self.ticket and not self.student_combo):
            raise ValidationError("Invoice must be associated with either a Ticket or a StudentCombo, but not both.")




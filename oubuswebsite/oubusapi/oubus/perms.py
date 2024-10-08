from rest_framework import permissions

class IsStudent(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'student'

class IsStaff(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'staff'

class TicketOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, ticket):
        return super().has_permission(request, view) and request.user.role == 'student' and request.user.student_profile == ticket.student

class AddReview(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, ticket):
        return (
            super().has_permission(request, view) and
            (
                (request.user.role == 'student' and request.user.student_profile == ticket.student) or
                request.user.role == 'staff'
            )
        )

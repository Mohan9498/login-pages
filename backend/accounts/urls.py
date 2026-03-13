from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UsersView ,StudentsView
from .views import (
    RegisterView,
    LoginView,
    GenerateOTP,
    VerifyOTP,
    ResetPassword,
    ProfileView
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("forgot-password/", GenerateOTP.as_view()),
    path("verify-otp/", VerifyOTP.as_view()),
    path("reset-password/", ResetPassword.as_view()),
    path("profile/", ProfileView.as_view()),
    path("students/", StudentsView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
]
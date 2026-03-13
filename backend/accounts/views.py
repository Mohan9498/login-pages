import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from .models import PasswordOTP
from rest_framework.permissions import IsAuthenticated


class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        return Response({
            "username": user.username,
            "id": user.id
        })

class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=201)

        return Response(serializer.errors)


class LoginView(APIView):

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is not None:

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": "admin" if user.is_superuser else "student"
            })

        return Response({"error": "Invalid credentials"}, status=401)

        
class GenerateOTP(APIView):

    def post(self, request):

        username = request.data.get("username")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found"})

        otp = str(random.randint(100000, 999999))

        PasswordOTP.objects.create(
            user=user,
            otp=otp
        )

        return Response({
            "message": "OTP Generated successfully",
            "otp": otp
        })
    

class VerifyOTP(APIView):

    def post(self, request):

        username = request.data.get("username")
        otp = request.data.get("otp")

        try:
            user = User.objects.get(username=username)
            record = PasswordOTP.objects.filter(user=user, otp=otp).last()

            if record and not record.is_expired():
                return Response({"message":"OTP Verified"})
            else:
                return Response({"error":"Invalid OTP"},status=400)

        except:
            return Response({"error":"User not found"})
        

class ResetPassword(APIView):

    def post(self, request):

        username = request.data.get("username")
        new_password = request.data.get("password")

        try:
            user = User.objects.get(username=username)
            user.set_password(new_password)
            user.save()

            return Response({"message":"Password Updated"})
        except User.DoesNotExist:
            return Response({"error":"User not found"})
       


class UsersView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        users = User.objects.all()

        data = []

        for user in users:
            data.append({
                "id": user.id,
                "username": user.username,
                "role": "admin" if user.is_superuser else "student"
            })

        return Response(data)


class StudentsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        students = User.objects.filter(is_superuser=False)

        data = []

        for s in students:
            data.append({
                "id": s.id,
                "username": s.username,
                "role": "student"
            })

        return Response(data)
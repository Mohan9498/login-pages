import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const generateOTP = async () => {

  if (!username.trim()) {
    alert("Please enter username");
    return;
  }

  try {

    const res = await axios.post(
      "http://127.0.0.1:8000/api/forgot-password/",
      { username }
    );

    console.log("API Response:", res.data);

    if (res.data && res.data.otp) {

      alert("Your OTP is: " + res.data.otp);

      setStep(2);

    } else {

      alert(res.data.error || "OTP not generated");

    }

  } catch (error) {

    console.error("API Error:", error);

    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert("Server error");
    }

  }
};

  const verifyOTP = async () => {
    try {

      await axios.post(
        "http://127.0.0.1:8000/api/verify-otp/",
        { username, otp }
      );

      alert("OTP Verified");
      setStep(3);

    } catch (error) {
      alert("Invalid OTP");
    }
  };

  const resetPassword = async () => {
    try {

      await axios.post(
        "http://127.0.0.1:8000/api/reset-password/",
        { username, password }
      );

      alert("Password Updated");

      navigate("/login");   // redirect here

    } catch (error) {
      alert("Reset failed");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">

    <div className="bg-white shadow-lg rounded-lg p-8 w-96">

      <h2 className="text-2xl font-bold text-center mb-6">
        Forgot Password
      </h2>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-6">

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            className="w-full border rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={generateOTP}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
          >
            Generate OTP
          </button>

        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e)=>setOtp(e.target.value)}
            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={verifyOTP}
            className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition"
          >
            Verify OTP
          </button>

        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4">

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={resetPassword}
            className="w-full bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600 transition"
          >
            Reset Password
          </button>

        </div>
      )}

    </div>

  </div>
);
}
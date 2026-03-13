import { useState } from "react";
import API from "./api";
import "./styles/auth.css";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!data.username || !data.password) {
      alert("Please enter username and password");
      return;
    }

    try {

      setLoading(true);

      const res = await API.post("login/", data);

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }

    } catch (error) {

      alert("Invalid username or password");
      console.error(error);

    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h2 className="auth-title">Login</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="auth-input"
            value={data.username}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input"
            value={data.password}
            onChange={handleChange}
          />

          <button className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <Link to="/register" className="auth-link">
            Register
          </Link>

          <Link to="/forgot-password" className="auth-link">
            Forgot Password
          </Link>

        </form>

      </div>

    </div>
  );
}
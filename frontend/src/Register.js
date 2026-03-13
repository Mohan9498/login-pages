import { useState } from "react";
import axios from "axios";
import "./styles/auth.css";

export default function Register(){

  const [data, setData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/register/",
        data
      );

      alert("Registered Successfully");
    } catch (error) {
      alert("Registration Failed");
      console.error(error);
    }
  };

  return(
    <div className="auth-container">

      <div className="auth-card">

        <h2 className="auth-title">Register</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="auth-input"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Repeat Password"
            className="auth-input"
            onChange={handleChange}
          />

          <button className="auth-btn">
            Register
          </button>

          <a href="/login" className="auth-link">
            Already have an account? Login
          </a>

        </form>

      </div>

    </div>
  );
}
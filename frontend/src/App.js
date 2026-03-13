import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin-dashboard" element={ <ProtectedRoute role="admin"> <AdminDashboard /> </ProtectedRoute> } />
        <Route path="/student-dashboard" element={ <ProtectedRoute role="student" > <StudentDashboard /> </ProtectedRoute> } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
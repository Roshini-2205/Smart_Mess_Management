import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // we'll create this next

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [message, setMessage] = useState("");
const [isError, setIsError] = useState(false);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setIsError(false);
setMessage(res.data.message);

      // redirect to login after success
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      if (err.response) {
        setIsError(true);
setMessage(err.response.data.message);

      } else {
        setMessage("Server error");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Your Account</h2>
        <p>Join Smart Hostel Mess Management System</p>

        {message && <div className={`message ${isError ? "error" : "success"}`}>
  {message}
</div>
}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create a secure password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <select name="role" value={formData.role} onChange={handleChange}>
            {/* <option value="student"></option> */}
            <option value="student">User</option>
             <option value="admin">Admin</option>
            <option value="waste">Organic Waste Team</option>
          </select>

          <button type="submit" className="register-btn">Register</button>
        </form>

        <p className="login-link">
          Already have an account? <span onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;

// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";

// const Login = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [message, setMessage] = useState("");
//   const [isError, setIsError] = useState(false);

//   // =============================
//   // handle input change
//   // =============================
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // =============================
//   // handle login submit
//   // =============================
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     localStorage.clear();   // ⭐ prevents old organic/admin reuse

//     const res = await axios.post(
//       "http://localhost:5000/api/auth/login",
//       {
//         email: formData.email,
//         password: formData.password,
//       }
//     );

//     const role = res.data.user.role?.trim().toLowerCase();

//     // store fresh session
//    // store fresh session
// localStorage.setItem("userId", res.data.user.id);   // ⭐ IMPORTANT
// localStorage.setItem("email", res.data.user.email);
// localStorage.setItem("role", role);
// localStorage.setItem("hostel", res.data.user.hostel);
// localStorage.setItem("isLoggedIn", "true");


//     if (role === "admin") navigate("/admin");
//     else if (role === "organic") navigate("/organic-dashboard");
//     else navigate("/student-dashboard");

//   } catch (err) {
//     setIsError(true);
//     setMessage(err.response?.data?.message || "Server error");
//   }
// };


//   // =============================
//   // UI
//   // =============================
//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <h2>Welcome Back</h2>
//         <p>Login to your account</p>

//         {message && (
//           <div className={`message ${isError ? "error" : "success"}`}>
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <input
//             type="email"
//             name="email"
//             placeholder="Enter your email address"
//             value={formData.email}
//             onChange={handleChange}
//             className="login-field"
//             required
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Enter your password"
//             value={formData.password}
//             onChange={handleChange}
//             className="login-field"
//             required
//           />

//           <button type="submit" className="login-btn">
//             Login
//           </button>
//         </form>

//         <p className="register-link">
//           Don't have an account?{" "}
//           <span onClick={() => navigate("/register")}>Register</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // =============================
  // Handle input change
  // =============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =============================
  // Handle login submit
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // clear old session
      sessionStorage.clear();

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const user = res.data.user;

      // sanitize role
      const role = user.role?.trim().toLowerCase();

      // =============================
      // store session
      // =============================
     // store session per tab
sessionStorage.setItem("user", JSON.stringify(user));
sessionStorage.setItem("userId", user.id);
sessionStorage.setItem("email", user.email);
sessionStorage.setItem("role", role);
sessionStorage.setItem("hostel", user.hostel);
sessionStorage.setItem("isLoggedIn", "true");

      // =============================
      // redirect based on role
      // =============================
      if (role === "admin") navigate("/admin");
      else if (role === "organic") navigate("/organic-dashboard");
      else navigate("/student-dashboard"); // student

    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || "Server error");
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Login to your account</p>

        {message && (
          <div className={`message ${isError ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            className="login-field"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="login-field"
            required
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="register-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
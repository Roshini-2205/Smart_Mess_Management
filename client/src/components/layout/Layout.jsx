import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./layout.css";

const pageTitles = {
  "/student-dashboard": "Dashboard",
  "/student-attendance": "Attendance",
  "/student-menu": "Weekly Menu",
  "/student-feedback": "Feedback",

  "/admin": "Admin Dashboard",
  "/admin/attendance": "Attendance",
  "/admin/menu": "Food Menu",
  "/admin/stock": "Stock",
  "/admin/waste": "Manage Waste",
  "/admin/reports": "Feedback",

  "/organic-dashboard": "Organic Dashboard",
  "/organic/received": "Received Waste",
  "/organic/segregation": "Segregation & Processing",
  "/organic/status": "Waste Status",
  "/organic/reports": "Reports",
  "/organic/suggestions": "Feedback & Suggestions",
};

const Layout = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const title = pageTitles[location.pathname] || `${role?.toUpperCase()} Dashboard`;

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Profile redirect logic
  const handleViewProfile = () => {
    if (!role) {
      navigate("/"); // fallback if role is missing
      return;
    }
    switch (role) {
      case "student":
        navigate("/profile/student"); // student profile route
        break;
      case "admin":
        navigate("/profile/admin"); // admin profile route
        break;
      case "organic":
        navigate("/profile/organic"); // organic team profile route
        break;
      default:
        navigate("/"); // fallback
    }
  };

  return (
    <div className="layout">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="logo">🍽 DineTrack</div>
        <h2 className="page-title">{title}</h2>

        <div className="profile-wrapper" ref={menuRef}>
          <div className="profile" onClick={() => setOpen(!open)}>
            <span className="avatar">👤</span>
          </div>

          {open && (
            <div className="dropdown">
              <div onClick={handleViewProfile}>View Profile</div>
              <div onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div className="body">
        {/* ===== SIDEBAR ===== */}
        <aside className="sidebar">
          <ul>
            {role === "student" && (
              <>
                <li
                  className={location.pathname === "/student-dashboard" ? "active" : ""}
                  onClick={() => navigate("/student-dashboard")}
                >
                  📊 Dashboard
                </li>

                <li
                  className={location.pathname === "/student-attendance" ? "active" : ""}
                  onClick={() => navigate("/student-attendance")}
                >
                  📱 Attendance
                </li>

                <li
                  className={location.pathname === "/student-menu" ? "active" : ""}
                  onClick={() => navigate("/student-menu")}
                >
                  📅 Weekly Menu
                </li>

                <li
                  className={location.pathname === "/student-feedback" ? "active" : ""}
                  onClick={() => navigate("/student-feedback")}
                >
                  💬 Feedback
                </li>
              </>
            )}

            {role === "admin" && (
              <>
                <li
                  className={location.pathname === "/admin" ? "active" : ""}
                  onClick={() => navigate("/admin")}
                >
                  📊 Dashboard
                </li>

                <li
                  className={location.pathname === "/admin/attendance" ? "active" : ""}
                  onClick={() => navigate("/admin/attendance")}
                >
                  📱 Attendance
                </li>
                <li
  className={location.pathname === "/admin/floating" ? "active" : ""}
  onClick={() => navigate("/admin/floating")}
>
  📈 Floating Analysis
</li>

                <li
                 className={
  location.pathname.startsWith("/admin/menu")
    ? "active"
    : ""
}
                  onClick={() => navigate("/admin/menu")}
                >
                  📅 Weekly Menu
                </li>

                <li
                  className={
  location.pathname.startsWith("/admin/stock") ||
  location.pathname === "/admin/demand-analysis"
    ? "active"
    : ""
}
                  onClick={() => navigate("/admin/stock")}
                >
                  📦 Stock
                </li>

                <li
                  className={location.pathname === "/admin/waste" ? "active" : ""}
                  onClick={() => navigate("/admin/waste")}
                >
                  🗑 Manage Waste
                </li>

                <li
                  className={location.pathname === "/admin/reports" ? "active" : ""}
                  onClick={() => navigate("/admin/reports")}
                >
                  💬 Feedback
                </li>
              </>
            )}

            {role === "organic" && (
              <>
                <li
                  className={location.pathname === "/organic-dashboard" ? "active" : ""}
                  onClick={() => navigate("/organic-dashboard")}
                >
                  📊 Dashboard
                </li>

                <li
                  className={location.pathname === "/organic-received" ? "active" : ""}
                  onClick={() => navigate("/organic-received")}
                >
                  📥 Received Waste
                </li>

                <li
                  classN ame={location.pathname === "/organic/segregation" ? "active" : ""}
                  onClick={() => navigate("/organic/segregation")}
                >
                  ♻️ Segregation
                </li>

                <li
                  className={location.pathname === "/organic/reports" ? "active" : ""}
                  onClick={() => navigate("/organic/reports")}
                >
                  📑 Reports
                </li>

                <li
                  className={location.pathname === "/organic/suggestions" ? "active" : ""}
                  onClick={() => navigate("/organic/suggestions")}
                >
                  💬 Suggestions
                </li>
              </>
            )}
          </ul>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="main">
          <p className="date">Today • {today}</p>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
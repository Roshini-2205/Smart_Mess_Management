import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = ({ role }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Read user from localStorage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/"); // redirect if not logged in
    }
  }, [navigate]);

  if (!user) return <p>Loading profile...</p>; // show loading instead of blank

  const renderFields = () => {
    const userRole = role || user.role; // fallback to prop role if provided

    switch (userRole) {
      case "student":
        if (user.user_type === "Dayscholar") {
          return (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Roll No:</strong> {user.college_id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Gender:</strong> {user.gender}</p>
              <p><strong>Phone:</strong> {user.phone || "—"}</p>
            </>
          );
        } else {
          return (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Roll No:</strong> {user.college_id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Gender:</strong> {user.gender}</p>
             <p>
  <strong>Hostel:</strong>{" "}
  {user.user_type === "Dayscholar" ? "Dayscholar" : user.hostel || "—"}
</p>
              <p><strong>Room No:</strong> {user.room_no || "—"}</p>
              <p><strong>Phone:</strong> {user.phone || "—"}</p>
            </>
          );
        }

      case "admin":
      case "organic":
        return (
          <>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Phone:</strong> {user.phone || "—"}</p>
            {/* <p><strong>Last Login:</strong> {user.last_login || "—"}</p> */}
          </>
        );

      default:
        return <p>No profile data available</p>;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">👤</div>
        <h2>{user.name}</h2>
        <div className="profile-fields">{renderFields()}</div>
      </div>
    </div>
  );
};

export default Profile;
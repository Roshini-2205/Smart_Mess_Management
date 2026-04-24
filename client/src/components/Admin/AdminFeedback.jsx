import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminFeedback.css";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH FEEDBACK =================
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback");
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // ================= UPDATE STATUS =================
const updateStatus = async (id) => {
  try {
    await axios.put(`http://localhost:5000/api/feedback/${id}`);

    // instantly update UI (no refresh)
    setFeedbacks(prev =>
      prev.map(f =>
        f.id === id ? { ...f, status: "Resolved" } : f
      )
    );
  } catch (err) {
    console.error(err);
    alert("Failed to update status");
  }
};
  return (
    <div className="admin-feedback-container">
      <div className="admin-feedback-card">
        <h2>📋 Admin Feedback Management</h2>
        <p className="subtitle">Review and manage all feedback</p>

        {loading ? (
          <p>Loading feedback...</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
  <tr>
    <th>Date</th>
    <th>Role</th>
    <th>Category</th>
    <th>Meal</th>
    <th>Rating</th>
    <th>Message</th>
    <th>Action</th>
  </tr>
</thead>

<tbody>
  {feedbacks.map(f => (
    <tr key={f.id}>
      <td>{new Date(f.created_at).toLocaleDateString()}</td>
      <td>{f.role === "student" ? "User" : f.role}</td>
      <td>{f.category}</td>
      <td>{f.meal || "-"}</td>
      <td>{f.rating ? "⭐".repeat(f.rating) : "-"}</td>
      <td>{f.message}</td>
      <td>
        {f.status === "Pending" && f.role !== "student" ? (
          <button onClick={() => updateStatus(f.id)}>Resolve</button>
        ) : (
          <span>{f.status === "Resolved" ? "✓ Resolved" : "-"}</span>
        )}
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
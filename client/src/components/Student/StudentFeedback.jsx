import React, { useState } from "react";
import axios from "axios";
import "./StudentFeedback.css";

const StudentFeedback = () => {
  const [form, setForm] = useState({
    category: "",
    meal: "",
    rating: 0,
    message: "",
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);

  // ======================
  // handle input
  // ======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ======================
  // rating click
  // ======================
  const handleRating = (value) => {
    setForm({ ...form, rating: value });
  };

  // ======================
  // submit
  // ======================
  // ======================
// submit
// ======================
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.post("http://localhost:5000/api/feedback", {
      ...form,
      role: "student", // explicitly set role
    });

    setError(false);
    setMsg("✅ Feedback submitted successfully");

    setForm({
      category: "",
      meal: "",
      rating: 0,
      message: "",
    });
  } catch (err) {
    setError(true);
    setMsg("❌ Failed to submit feedback");
    console.error(err); // optional: log for debugging
  }
};

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h2>💬 Mess Feedback</h2>
        <p className="subtitle">Help us improve your dining experience</p>

        {msg && (
          <div className={`message ${error ? "error" : "success"}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* CATEGORY */}
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="Food Quality">Food Quality</option>
            <option value="Quantity">Quantity</option>
            <option value="Hygiene">Hygiene</option>
            <option value="Menu Suggestion">Menu Suggestion</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Other">Other</option>
          </select>

          {/* MEAL */}
          <label>Meal</label>
          <select
            name="meal"
            value={form.meal}
            onChange={handleChange}
            required
          >
            <option value="">Select meal</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>

          {/* RATING */}
          <label>Rating</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= form.rating ? "active" : ""}
                onClick={() => handleRating(star)}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* MESSAGE */}
          <label>Message</label>
          <textarea
            name="message"
            maxLength="300"
            placeholder="Write your feedback here..."
            value={form.message}
            onChange={handleChange}
            required
          />

          <small>{form.message.length}/300 characters</small>

          <button type="submit" className="submit-btn">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentFeedback;

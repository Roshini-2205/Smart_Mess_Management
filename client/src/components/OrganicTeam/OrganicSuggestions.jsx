import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OrganicSuggestions.css";

const categories = ["Waste", "Equipment", "Process", "Other"];

const OrganicSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: "", message: "" });

  // Fetch suggestions
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/feedback/organic/suggestions");
      console.log("Fetched organic suggestions:", res.data);
      setSuggestions(res.data); // backend already returns only organic
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Handle form change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit suggestion
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.message) return alert("Please fill all fields");

    try {
      const res = await axios.post("http://localhost:5000/api/feedback", {
        ...form,
        role: "organic",
      });

      console.log("POST response:", res.data);

      if (res.data.success) {
        setForm({ category: "", message: "" });
        await fetchSuggestions(); // refresh table after submit
        alert("Suggestion submitted successfully");
      }
    } catch (err) {
      console.error("Failed to submit suggestion:", err);
      alert("Failed to submit suggestion");
    }
  };

  return (
    <div className="organic-suggestions-page">
      <h2>💬 Suggestions to Admin</h2>

      {/* FORM */}
      <form className="suggestion-form" onSubmit={handleSubmit}>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Type your suggestion here..."
        />
        <button type="submit">Submit</button>
      </form>

      {/* TABLE */}
      {loading ? <p>Loading suggestions...</p> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.length === 0 ? (
                <tr><td colSpan="4">No suggestions yet</td></tr>
              ) : (
                suggestions.map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>{s.category}</td>
                    <td>{s.message}</td>
                    <td>{s.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrganicSuggestions;
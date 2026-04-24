import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ReceivedWaste.css";

const ReceivedWaste = () => {
  const [waste, setWaste] = useState([]);
  const [hostelFilter, setHostelFilter] = useState("all");

  // =========================
  // Fetch waste
  // =========================
  const fetchWaste = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/waste?hostel=${hostelFilter}`
      );
      setWaste(res.data);
    } catch (err) {
      console.error(err);
      setWaste([]);
    }
  };

  useEffect(() => {
    fetchWaste();
  }, [hostelFilter]);

  // =========================
  // Receive action
  // =========================
  const receiveWaste = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/waste/${id}`, {
        status: "received",
      });
      fetchWaste();
    } catch (err) {
      console.error(err);
    }
  };

const total = waste.reduce(
  (sum, w) =>
    sum +
    parseFloat(w.raw_waste || 0) +
    parseFloat(w.cooked_waste || 0),
  0
);

  return (
    <div className="received-container">
      <h2>📥 Received Waste</h2>

      {/* Filter */}
      <div className="filter-bar">
        <label>Show: </label>
        <select
          value={hostelFilter}
          onChange={(e) => setHostelFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="boys">Boys</option>
          <option value="girls">Girls</option>
        </select>
      </div>

      {/* Stats */}
      <div className="stats-card">
        Total Waste: <b>{total.toFixed(2)} kg</b>
      </div>

      {/* Table */}
      <table className="waste-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Hostel</th>
            <th>Date</th>
            <th>Raw</th>
            <th>Cooked</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

      <tbody>
  {waste.map((item, index) => {
    const raw = parseFloat(item.raw_waste || 0);
    const cooked = parseFloat(item.cooked_waste || 0);
    const total = raw + cooked;

    return (
      <tr key={item.id}>
        <td>{index + 1}</td>
        <td>{item.hostel}</td>
        <td>{new Date(item.waste_date).toLocaleDateString("en-GB")}</td>

        <td>{raw.toFixed(2)}</td>
        <td>{cooked.toFixed(2)}</td>
        <td>{total.toFixed(2)}</td>

        <td>
          <span className={`badge ${item.status}`}>
            {item.status}
          </span>
        </td>

        <td>
  {item.status === "pending" ? (
    <button
      className="receive-btn"
      onClick={() => receiveWaste(item.id)}
    >
      Receive
    </button>
  ) : (
    <button className="receive-btn done-btn" disabled>
      Received ✓
    </button>
  )}
</td>
      </tr>
    );
  })}
</tbody>
      
      </table>
    </div>
  );
};

export default ReceivedWaste;
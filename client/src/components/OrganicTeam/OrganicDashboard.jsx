import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OrganicDashboard.css";

const OrganicDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    raw: 0,
    cooked: 0,
    pending: 0,
    processing: 0,
    completed: 0,
  });

  // ==============================
  // Fetch waste data from backend
  // ==============================
  const fetchStats = async () => {
    try {
      // Get all waste records
      const res = await axios.get("http://localhost:5000/api/waste");
      const data = res.data;

      // Filter by status
      const pending = data.filter(w => w.status === "pending");
      const processing = data.filter(w => w.status === "received" || w.status === "collected");
      const completed = data.filter(w => w.status === "completed");

      // Sum totals
      const sumRaw = data.reduce((sum, w) => sum + parseFloat(w.raw_waste || 0), 0);
      const sumCooked = data.reduce((sum, w) => sum + parseFloat(w.cooked_waste || 0), 0);
      const sumTotal = sumRaw + sumCooked;

      setStats({
        total: sumTotal.toFixed(2),
        raw: sumRaw.toFixed(2),
        cooked: sumCooked.toFixed(2),
        pending: pending.reduce((sum, w) => sum + parseFloat(w.raw_waste || 0) + parseFloat(w.cooked_waste || 0), 0).toFixed(2),
        processing: processing.reduce((sum, w) => sum + parseFloat(w.raw_waste || 0) + parseFloat(w.cooked_waste || 0), 0).toFixed(2),
        completed: completed.reduce((sum, w) => sum + parseFloat(w.raw_waste || 0) + parseFloat(w.cooked_waste || 0), 0).toFixed(2),
      });

    } catch (err) {
      console.error("Failed to fetch waste stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Optional: refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="organic-dashboard">
      <h2 className="page-title">Organic Waste Dashboard</h2>

      {/* ============================= STAT CARDS ============================= */}
      <div className="stats-grid">
        <div className="card">
          <h3>Total Waste Today</h3>
          <p>{stats.total} kg</p>
        </div>
        <div className="card">
          <h3>Raw Waste</h3>
          <p>{stats.raw} kg</p>
        </div>
        <div className="card">
          <h3>Cooked Waste</h3>
          <p>{stats.cooked} kg</p>
        </div>
        <div className="card">
          <h3>Processing Now</h3>
          <p>{stats.processing} kg</p>
        </div>
      </div>

      {/* ============================= STATUS SECTION ============================= */}
      <div className="status-section">
        <div className="status-box pending">
          Pending: {stats.pending} kg
        </div>
        <div className="status-box processing">
          Processing: {stats.processing} kg
        </div>
        <div className="status-box completed">
          Completed: {stats.completed} kg
        </div>
      </div>

      {/* ============================= SIMPLE BAR CHART ============================= */}
     <div className="chart-box">
  <h3>Raw vs Cooked Comparison</h3>
  <div className="bar-container">
    {/* Calculate total before JSX */}
    {(() => {
      const total = parseFloat(stats.raw) + parseFloat(stats.cooked) || 1; // avoid divide by 0
      return (
        <>
          <div
            className="bar raw-bar"
            style={{ width: `${(stats.raw / total) * 100}%` }}
          >
            Raw
          </div>

          <div
            className="bar cooked-bar"
            style={{ width: `${(stats.cooked / total) * 100}%` }}
          >
            Cooked
          </div>
        </>
      );
    })()}
  </div>
</div>
    </div>
  );
};

export default OrganicDashboard;
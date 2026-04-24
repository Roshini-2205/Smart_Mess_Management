import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FloatingAnalysis.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function FloatingAnalysis() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("month");

  // ✅ Fetch Data
const fetchData = async () => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/floating?filter=${filter}`
    );

    console.log("👉 API RESPONSE:", res.data);

    setData(res.data);
  } catch (err) {
    console.error("❌ API ERROR:", err);
  }
};

  // ✅ Auto Refresh
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 10000); // every 10 sec
    return () => clearInterval(interval);
  }, [filter]);

  // ✅ Format Date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Correct Totals (IMPORTANT FIX)
  const totalExpected = data.reduce(
    (sum, d) => sum + Number(d.expected_count || 0),
    0
  );

const totalActual = data.reduce(
  (sum, d) => sum + Number(d.actual || 0),
  0
);

  const totalWaste = data.reduce(
    (sum, d) => sum + Number(d.waste || 0),
    0
  );

  const percentage =
    totalExpected === 0
      ? 0
      : (((totalActual - totalExpected) / totalExpected) * 100).toFixed(2);

  // ✅ Chart Data
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    expected: Number(d.expected_count),
    actual: Number(d.actual),
  }));

  return (
    <div className="floating-container">
      <h2>Floating Population Analysis</h2>

      {/* ✅ FILTER BUTTONS */}
      <div className="filters">
        <button
          className={filter === "day" ? "active" : ""}
          onClick={() => setFilter("day")}
        >
          Today
        </button>

        <button
          className={filter === "week" ? "active" : ""}
          onClick={() => setFilter("week")}
        >
          Week
        </button>

        <button
          className={filter === "month" ? "active" : ""}
          onClick={() => setFilter("month")}
        >
          Month
        </button>
      </div>

      {/* ✅ SUMMARY */}
      <div className="summary">
        <div className="card">
          <h4>Expected</h4>
          <p>{totalExpected}</p>
        </div>

        <div className="card">
          <h4>Actual</h4>
          <p>{totalActual}</p>
        </div>

        <div className="card">
          <h4>Waste</h4>
          <p>{totalWaste}</p>
        </div>

        <div className="card">
          <h4>Diff %</h4>
          <p>{percentage}%</p>
        </div>
      </div>

      {/* ✅ CHART */}
      <div className="chart">
        <h3>Expected vs Actual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
           <Line type="monotone" dataKey="expected" stroke="#8884d8" name="Expected" />
<Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ TABLE */}
  <table className="floating-table">
  <thead>
    <tr>
      <th>Date</th>
      <th>Meal</th>
      <th>Expected</th>
      <th>Actual</th>
      <th>Difference</th>
      <th>Percentage</th>
      <th>Cooked</th>
      <th>Waste</th>
    </tr>
  </thead>

  <tbody>
    {data.length > 0 ? (
      data.map((row, index) => (
        <tr key={index}>
          <td>{formatDate(row.date)}</td>
          <td>{row.meal}</td>
          <td>{row.expected_count}</td>
          <td>{row.actual}</td>
          <td>{row.difference}</td>
          <td>{row.percentage}%</td>
          <td>{row.cooked}</td>
          <td>{row.waste}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="8" style={{ textAlign: "center" }}>
          No Data Available
        </td>
      </tr>
    )}
  </tbody>
</table>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import "./OrganicReports.css";
const COLORS = ["#FFBB28", "#00C49F", "#0088FE", "#FF8042"];// compost / biogas

export default function OrganicReports() {
  const [records, setRecords] = useState([]);
  const [timeframe, setTimeframe] = useState("daily");

  /* ================= FETCH FROM BACKEND ================= */
  useEffect(() => {
    fetchWaste();
  }, []);

  const fetchWaste = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/waste");

      // Only completed waste for reports
      const completed = res.data.filter(r => r.status === "completed");

      setRecords(completed);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= GROUPING LOGIC ================= */

  const groupData = useMemo(() => {
    const map = {};

    records.forEach(r => {
      const d = new Date(r.waste_date);

      let key;

      if (timeframe === "daily") {
        key = d.toLocaleDateString();
      }

      if (timeframe === "weekly") {
        const week = Math.ceil(d.getDate() / 7);
        key = `Week ${week}`;
      }

      if (timeframe === "monthly") {
        key = d.toLocaleString("default", { month: "short" });
      }

      if (!map[key]) {
        map[key] = { date: key, raw: 0, cooked: 0 };
      }

      map[key].raw += parseFloat(r.raw_waste || 0);
      map[key].cooked += parseFloat(r.cooked_waste || 0);
    });

    return Object.values(map).map(item => ({
      ...item,
      raw: +item.raw.toFixed(2),
      cooked: +item.cooked.toFixed(2)
    }));
  }, [records, timeframe]);

  /* ================= PIE DATA ================= */

  const compostTotal = records.reduce(
    (s, r) =>
      s +
      (r.raw_method === "compost" ? +r.raw_waste : 0) +
      (r.cooked_method === "compost" ? +r.cooked_waste : 0),
    0
  );

  const biogasTotal = records.reduce(
    (s, r) =>
      s +
      (r.raw_method === "biogas" ? +r.raw_waste : 0) +
      (r.cooked_method === "biogas" ? +r.cooked_waste : 0),
    0
  );

  const pieData = [
    { name: "Compost", value: +compostTotal.toFixed(2) },
    { name: "Biogas", value: +biogasTotal.toFixed(2) }
  ];

  /* ================= CSV DOWNLOAD ================= */

  const downloadCSV = () => {
    const headers = ["Date", "Raw (kg)", "Cooked (kg)"];
    const rows = groupData.map(d => [d.date, d.raw, d.cooked]);

    let csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `organic_reports_${timeframe}.csv`;
    link.click();
  };

  /* ================= UI ================= */

  return (
    <div className="organic-reports-page">

      <h2 className="page-title">📑 Organic Waste Reports</h2>

      {/* ================= TIMEFRAME ================= */}
      <div className="timeframe-selector">
        {["daily", "weekly", "monthly"].map(tf => (
          <button
  key={tf}
  className={`toggle-btn ${timeframe === tf ? "active" : ""}`}
  onClick={() => setTimeframe(tf)}
>
  {tf.charAt(0).toUpperCase() + tf.slice(1)}
</button>
        ))}

        <button className="download-btn" onClick={downloadCSV}>
          💾 Download CSV
        </button>
      </div>

      {/* ================= CHARTS FIRST ================= */}
      <div className="charts-wrapper">

        {/* PIE */}
        <div className="chart-card large">
          <h4>Compost vs Biogas Distribution</h4>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={120}
                label
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="chart-card large">
          <h4>Raw vs Cooked Waste Trend</h4>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={groupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="raw" fill="#FFBB28" radius={[6,6,0,0]} />
<Bar dataKey="cooked" fill="#00C49F" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ================= TABLE AFTER CHART ================= */}
      <div className="table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Raw (kg)</th>
              <th>Cooked (kg)</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {groupData.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.raw.toFixed(2)}</td>
                <td>{row.cooked.toFixed(2)}</td>
                <td>{(row.raw + row.cooked).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
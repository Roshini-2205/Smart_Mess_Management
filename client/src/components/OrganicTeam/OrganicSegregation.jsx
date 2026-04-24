import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrganicSegregation.css";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#22c55e", "#f97316"];

export default function Segregation() {
  const [records, setRecords] = useState([]);

  /* ================= FETCH ================= */
  const fetchRecords = async () => {
    const res = await axios.get("http://localhost:5000/api/waste");

    const filtered = res.data.filter(r =>
      ["received", "collected", "completed"].includes(r.status)
    );

    setRecords(filtered);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* ================= UPDATE METHOD ONLY ================= */
  const updateMethod = async (id, field, value) => {
    await axios.put(`http://localhost:5000/api/waste/${id}`, {
      [field]: value
    });
    fetchRecords();
  };

  /* ================= EXISTING ACTIONS (UNCHANGED) ================= */

  const collectWaste = async (id) => {
    await axios.put(`http://localhost:5000/api/waste/${id}`, {
      status: "collected"
    });
    fetchRecords();
  };

  const completeWaste = async (id) => {
    await axios.put(`http://localhost:5000/api/waste/${id}`, {
      status: "completed"
    });
    fetchRecords();
  };

  /* ================= CHART DATA ================= */

  const barData = records.map(r => ({
    date: new Date(r.waste_date).toLocaleDateString(),
    raw: +(+r.raw_waste).toFixed(2),
    cooked: +(+r.cooked_waste).toFixed(2)
  }));

  const compost = +records.reduce(
    (s, r) =>
      s +
      (r.raw_method === "compost" ? +r.raw_waste : 0) +
      (r.cooked_method === "compost" ? +r.cooked_waste : 0),
    0
  ).toFixed(2);

  const biogas = +records.reduce(
    (s, r) =>
      s +
      (r.raw_method === "biogas" ? +r.raw_waste : 0) +
      (r.cooked_method === "biogas" ? +r.cooked_waste : 0),
    0
  ).toFixed(2);

  const pieData = [
    { name: "Compost", value: compost },
    { name: "Biogas", value: biogas }
  ];

  /* ================= UI ================= */

  return (
    <div className="seg-container">

      <h2 className="page-title">♻ Waste Segregation Dashboard</h2>

      {/* ================= CHARTS ================= */}
      <div className="charts-row">

        <div className="chart-card">
          <h4>Raw vs Cooked Waste</h4>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="raw" fill="#22c55e" />
              <Bar dataKey="cooked" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Processing Distribution</h4>
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={120} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>


      {/* ================= TABLE ================= */}
      <div className="table-card">

        <table className="seg-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Raw (kg)</th>
              <th>Method</th>
              <th>Cooked (kg)</th>
              <th>Method</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{new Date(r.waste_date).toLocaleDateString()}</td>

                <td>{(+r.raw_waste).toFixed(2)}</td>

                {/* RAW METHOD (ONLY ADDED) */}
                <td>
                  {r.status === "received" ? (
                    <select
                      value={r.raw_method || ""}
                      onChange={(e) =>
                        updateMethod(r.id, "raw_method", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="compost">Compost</option>
                      <option value="biogas">Biogas</option>
                    </select>
                  ) : (
                    <span className={`method ${r.raw_method}`}>
                      {r.raw_method || "-"}
                    </span>
                  )}
                </td>

                <td>{(+r.cooked_waste).toFixed(2)}</td>

                {/* COOKED METHOD (ONLY ADDED) */}
                <td>
                  {r.status === "received" ? (
                    <select
                      value={r.cooked_method || ""}
                      onChange={(e) =>
                        updateMethod(r.id, "cooked_method", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="compost">Compost</option>
                      <option value="biogas">Biogas</option>
                    </select>
                  ) : (
                    <span className={`method ${r.cooked_method}`}>
                      {r.cooked_method || "-"}
                    </span>
                  )}
                </td>

                {/* YOUR ORIGINAL BUTTONS (UNCHANGED) */}
               <td>
  {r.status === "received" && (
    <button onClick={() => collectWaste(r.id)}>
      Collect
    </button>
  )}

  {r.status === "collected" && (
    <button onClick={() => completeWaste(r.id)}>
      Done ✓
    </button>
  )}

  {r.status === "completed" && (
    <button disabled className="done-btn">
      Done ✓
    </button>
  )}
</td>
<td>
  <span className={`status ${r.status.toLowerCase()}`}>
    {r.status === "received" ? "⏳ Pending" :
     r.status === "collected" ? "🟠 Collected" :
     "✅ Completed"}
  </span>
</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
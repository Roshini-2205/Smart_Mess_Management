import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import "./ManageWaste.css";

export default function WasteManagement() {
  const [records, setRecords] = useState([]);
  const [prediction, setPrediction] = useState({});
  const [form, setForm] = useState({
    waste_date: "",
    raw_waste: "",
    cooked_waste: "",
    evening: "",
    hostel: "boys"
  });
  const [hostelFilter, setHostelFilter] = useState("all"); // All / boys / girls

  // Fetch records by hostel filter
  const fetchWasteRecords = async (filter = "all") => {
    try {
      const res = await axios.get(`http://localhost:5000/api/waste?hostel=${filter}`);
      setRecords(res.data);
    } catch (err) {
      console.error("Fetch waste failed:", err);
    }
  };

  // Fetch prediction based on hostel filter (optional)
  const fetchPrediction = async (filter = "boys") => {
    try {
      const res = await axios.get(`http://localhost:5000/api/predict/attendance?hostel=${filter}`);
      setPrediction(res.data);
    } catch (err) {
      console.error("Fetch prediction failed:", err);
    }
  };

  // Fetch on component mount & when filter changes
  useEffect(() => {
    fetchWasteRecords(hostelFilter);
    if (hostelFilter === "all") {
      fetchPrediction("boys"); // you can choose default for all
    } else {
      fetchPrediction(hostelFilter);
    }
  }, [hostelFilter]);

  // Add record
  const addRecord = async () => {
    if (!form.waste_date) return;
    try {
      await axios.post("http://localhost:5000/api/waste", form);
setForm({
  waste_date: "",
  raw_waste: "",
  cooked_waste: "",
  evening: "",
  hostel: "boys"
});
      fetchWasteRecords(hostelFilter);
    } catch (err) {
      console.error("Add record failed:", err);
    }
  };

  // Delete record
  const deleteRecord = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/waste/${id}`);
      fetchWasteRecords(hostelFilter);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="waste-page">
      <h2>♻ Waste Management</h2>

      {/* Hostel Filter */}
      <div className="hostel-filter">
        Show:{" "}
        <select value={hostelFilter} onChange={(e) => setHostelFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="boys">Boys</option>
          <option value="girls">Girls</option>
        </select>
      </div>

      {/* Predicted Waste
      <div className="prediction-box">
        📈 Predicted Tomorrow Waste:{" "}
        <b>
          Breakfast: {prediction.breakfast || "-"} kg,{" "}
          Lunch: {prediction.lunch || "-"} kg,{" "}
          Evening: {prediction.evening || "-"} kg,{" "}
          Dinner: {prediction.dinner || "-"} kg
        </b>
      </div> */}

      {/* Form */}
      <div className="waste-form">
        <input
          type="date"
          value={form.waste_date}
          onChange={(e) => setForm({ ...form, waste_date: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Raw Waste (kg)"
          value={form.raw_waste}
          onChange={(e) => setForm({ ...form, raw_waste: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Cooked Waste (kg)"
          value={form.cooked_waste}
          onChange={(e) => setForm({ ...form, cooked_waste: e.target.value })}
        />
        <select
          value={form.hostel}
          onChange={(e) => setForm({ ...form, hostel: e.target.value })}
        >
          <option value="boys">Boys</option>
          <option value="girls">Girls</option>
        </select>
        <button onClick={addRecord}>Add Record</button>
      </div>

      {/* Table */}
      <table className="waste-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Hostel</th>
            <th>Raw Waste</th>
            <th>Cooked Waste</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.waste_date).toLocaleDateString("en-GB")}</td>
              <td>{r.hostel}</td>
              <td>{parseFloat(r.raw_waste).toFixed(2)}</td>
              <td>{parseFloat(r.cooked_waste).toFixed(2)}</td>
              <td>{(parseFloat(r.raw_waste) + parseFloat(r.cooked_waste)).toFixed(2)}</td>
                     <td>
  <span className={`badge ${r.status}`}>
    {r.status}
  </span>
</td>
              <td>
                <FaTrash onClick={() => deleteRecord(r.id)} />
              </td>
       
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
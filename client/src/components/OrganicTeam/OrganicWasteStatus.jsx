import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import "./OrganicWasteStatus.css";

const methodOptions = ["Biogas", "Compost"];
const statusFlow = ["Pending", "Processing", "Converted", "Disposed"];

const COLORS = ["#FFBB28", "#00C49F", "#0088FE", "#FF8042"];

const OrganicWasteStatus = () => {
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= DUMMY DATA =================
  const dummyWaste = [
    {
      id: 1,
      date: "2026-02-09",
      meal: "Breakfast",
      raw: 12,
      cooked: 5,
      raw_method: "",
      cooked_method: "",
      status: "Pending",
    },
    {
      id: 2,
      date: "2026-02-09",
      meal: "Lunch",
      raw: 18,
      cooked: 10,
      raw_method: "",
      cooked_method: "",
      status: "Pending",
    },
  ];

  // ================= FETCH WASTE DATA =================
  const fetchWaste = async () => {
    try {
      // Uncomment below if backend is ready
      // const res = await axios.get("http://localhost:5000/api/organic/waste");
      // setWasteData(res.data);

      // For now, use dummy data
      setWasteData(dummyWaste);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaste();
  }, []);

  // ================= HANDLE METHOD CHANGE =================
  const handleMethodChange = (id, type, value) => {
    setWasteData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [type + "_method"]: value } : item
      )
    );
  };

  // ================= HANDLE STATUS UPDATE =================
  const handleStatusUpdate = (id) => {
    const item = wasteData.find(w => w.id === id);
    const currentIndex = statusFlow.indexOf(item.status);
    const nextStatus = currentIndex < statusFlow.length - 1
      ? statusFlow[currentIndex + 1]
      : statusFlow[currentIndex];

    setWasteData(prev =>
      prev.map(w => w.id === id ? { ...w, status: nextStatus } : w)
    );

    // For now, skip backend update
    // axios.put(`http://localhost:5000/api/organic/waste/${id}`, { ... });
  };

  // ================= CALCULATE CHART DATA =================
  const pieData = wasteData.length > 0 ? [
    { name: "Raw", value: wasteData.reduce((sum, w) => sum + w.raw, 0) },
    { name: "Cooked", value: wasteData.reduce((sum, w) => sum + w.cooked, 0) },
  ] : [
    { name: "Raw", value: 1 },
    { name: "Cooked", value: 1 },
  ]; // fallback

  const barData = wasteData.length > 0 ? wasteData.reduce((acc, w) => {
    const found = acc.find(a => a.status === w.status);
    if (found) found.count += 1;
    else acc.push({ status: w.status, count: 1 });
    return acc;
  }, []) : [
    { status: "Pending", count: 1 },
    { status: "Processing", count: 1 },
    { status: "Converted", count: 1 },
    { status: "Disposed", count: 1 },
  ]; // fallback

  return (
    <div className="organic-status-page">
      <h2>♻️ Waste Status & Processing Output</h2>

      {loading ? (
        <p>Loading waste data...</p>
      ) : (
        <>
          {/* ================= TABLE ================= */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meal</th>
                  <th>Raw (kg)</th>
                  <th>Cooked (kg)</th>
                  <th>Raw Method</th>
                  <th>Cooked Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {wasteData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty">No waste data available</td>
                  </tr>
                ) : (
                  wasteData.map(item => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td className="capitalize">{item.meal}</td>
                      <td>{item.raw}</td>
                      <td>{item.cooked}</td>

                      <td>
                        <select
                          value={item.raw_method || ""}
                          onChange={(e) => handleMethodChange(item.id, "raw", e.target.value)}
                        >
                          <option value="">Select</option>
                          {methodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>

                      <td>
                        <select
                          value={item.cooked_method || ""}
                          onChange={(e) => handleMethodChange(item.id, "cooked", e.target.value)}
                        >
                          <option value="">Select</option>
                          {methodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>

                      <td>{item.status}</td>
                      <td>
                        {item.status !== "Disposed" && (
                          <button onClick={() => handleStatusUpdate(item.id)}>Next Stage</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ================= METRICS / CHARTS ================= */}
          <div className="charts-wrapper">
            <div className="chart-card">
              <h4>Raw vs Cooked (kg)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h4>Status Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrganicWasteStatus;

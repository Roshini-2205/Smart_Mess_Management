import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./AdminAttendance.css";

const AdminAttendance = () => {
  const [meal, setMeal] = useState("breakfast");
  const [mess, setMess] = useState("all");
  const [date, setDate] = useState("");

 const [qr, setQr] = useState("");

  /* 🔥 TWO STATES */
  const [records, setRecords] = useState([]);     // filtered → table
  const [allRecords, setAllRecords] = useState([]); // full → counts
  // const [allRecords, setAllRecords] = useState([]); // full → counts

  /* ================= GET QR ================= */
  useEffect(() => {
    fetch(`http://localhost:5000/api/attendance/current-qr?meal=${meal}`)
      .then(res => res.json())
      .then(data => setQr(data.token));
  }, [meal]);



  /* =====================================================
     🔥 FETCH ALL DATA (ONLY FOR COUNTS)
     runs when meal changes
  ===================================================== */
  useEffect(() => {
    fetch(`http://localhost:5000/api/attendance?meal=${meal}`)
      .then(res => res.json())
      .then(data => setAllRecords(Array.isArray(data) ? data : []));
  }, [meal]);



  /* =====================================================
     🔥 FETCH FILTERED DATA (TABLE ONLY)
  ===================================================== */
  useEffect(() => {
    const query = new URLSearchParams();
    query.append("meal", meal);

    if (mess === "boys") query.append("gender", "Male");
    if (mess === "girls") query.append("gender", "Female");

    if (date) query.append("date", date);

    fetch(`http://localhost:5000/api/attendance?${query}`)
      .then(res => res.json())
      .then(data => setRecords(Array.isArray(data) ? data : []));
  }, [meal, mess, date]);



  /* ================= COUNTS (USE allRecords ONLY) ================= */

  // const totalCount = allRecords.length;

  // const boysCount = allRecords.filter(
  //   r => r.mess === "Boys"
  // ).length;

  // const girlsCount = allRecords.filter(
  //   r => r.mess === "Girls"
  // ).length;



  return (
    <div className="attendance-container">

      {/* ===== HEADER ===== */}
      <div className="attendance-header">
        <h2>Mess Attendance</h2>

        {/* <div className="counts-wrapper">
          <span className="count-badge">Total: {totalCount}</span>
          <span className="boys-badge">Boys: {boysCount}</span>
          <span className="girls-badge">Girls: {girlsCount}</span>
        </div> */}
      </div>



   

      {/* ===== QR ===== */}
      <div className="qr-section">
        <div className="qr-card">
          <QRCodeCanvas value={qr} size={240} includeMargin />
          <p className="qr-text">Scan for <b>{meal}</b></p>
        </div>
      </div>



      {/* ===== MEAL TOGGLE ===== */}
      <div className="toggle-wrapper">
        {["Breakfast", "Lunch", "Dinner"].map(label => {
          const value = label.toLowerCase();

          return (
            <button
              key={value}
              className={meal === value ? "active" : ""}
              onClick={() => setMeal(value)}
            >
              {label}
            </button>
          );
        })}
      </div>



      {/* ===== MESS TOGGLE ===== */}
      <div className="toggle-wrapper mess-toggle">
        {["All", "Boys", "Girls"].map(label => {
          const value = label.toLowerCase();

          return (
            <button
              key={value}
              className={mess === value ? "active" : ""}
              onClick={() => setMess(value)}
            >
              {label}
            </button>
          );
        })}
      </div>

   {/* ===== DATE FILTER ===== */}
      <div className="date-filter">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {date && (
          <button onClick={() => setDate("")}>
            Clear
          </button>
        )}
      </div>



      {/* ===== TABLE ===== */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Meal</th>
              <th>Mess</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">No attendance yet</td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td className="capitalize">{r.meal}</td>
                  <td>{r.mess}</td>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminAttendance;

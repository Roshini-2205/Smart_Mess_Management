import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./StudentAttendance.css";

const StudentAttendance = () => {
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("");

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // yyyy-mm-dd

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB").replace(/\//g, "-");

  useEffect(() => {
  const email = sessionStorage.getItem("email");

  if (!email) {
    sessionStorage.clear();
    navigate("/login");
  }
}, [navigate]);

  const fetchAttendanceHistory = useCallback(async (dateValue) => {
    try {
      const email = sessionStorage.getItem("email");
      if (!email) return;

      const res = await fetch(
        `http://localhost:5000/api/attendance/student?email=${email}&date=${dateValue}`
      );
      const data = await res.json();
      if (res.ok) setAttendanceHistory(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceHistory(selectedDate);
  }, [fetchAttendanceHistory, selectedDate]);

  const handleDateChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value);
    fetchAttendanceHistory(value);
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      await scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const markAttendance = useCallback(
    async (scannedToken, scannedMeal) => {
      try {
        const email = sessionStorage.getItem("email");

        const res = await fetch(
          "http://localhost:5000/api/attendance/mark",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, meal: scannedMeal, token: scannedToken }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setStatus("❌ " + data.message);
          stopScanner();
          return;
        }

        setStatus("✅ Attendance Marked Successfully!");
        fetchAttendanceHistory(selectedDate);
        stopScanner();
      } catch {
        setStatus("❌ Server error");
      }
    },
    [selectedDate, fetchAttendanceHistory, stopScanner]
  );

  const startScanner = () => {
    setStatus("");
    setScanning(true);
  };

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        try {
          // ✅ NEW FIX: QR is plain string "meal-timestamp"
          const [meal, tokenId] = decodedText.split("-");
          if (!meal || !tokenId) throw new Error("Invalid QR");

          const token = decodedText; // full token
          markAttendance(token, meal.toLowerCase());
        } catch (err) {
          console.error(err);
          setStatus("❌ Invalid QR code");
        }
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => stopScanner();
  }, [scanning, markAttendance, stopScanner]);

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h2>My Attendance</h2>
      </div>

      <div className="scan-card-wrapper">
        <div className="scan-card">
          {!scanning ? (
            <button onClick={startScanner} className="scan-btn">
              📷 Start Scanning
            </button>
          ) : (
            <>
              <button onClick={stopScanner} className="scan-btn stop">
                📵 Stop Scanning
              </button>
              <div id="qr-reader" className="qr-box"></div>
            </>
          )}
         {status && (
  <p
    className="status"
    style={{
      color: status.startsWith("✅") ? "green" : "red",
      fontWeight: "bold",
    }}
  >
    {status}
  </p>
)}
        </div>
      </div>

      <div className="table-wrapper">
        <div className="history-top">
          <h3>Attendance History</h3>
          <span className="total-count">Total: {attendanceHistory.length}</span>
        </div>

        <div className="date-filter">
          <label>
            Selected Date:
            <strong style={{ marginLeft: "8px" }}>
              {formatDate(selectedDate)}
            </strong>
          </label>
          <input type="date" value={selectedDate} onChange={handleDateChange} />
        </div>

        <table>
          <thead>
            <tr>
              <th>Meal</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty">
                  No attendance yet
                </td>
              </tr>
            ) : (
              attendanceHistory.map((r, i) => (
                <tr key={i}>
                  <td className="capitalize">{r.meal}</td>
                  <td>{formatDate(r.date)}</td>
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

export default StudentAttendance;
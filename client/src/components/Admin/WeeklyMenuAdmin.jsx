import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WeeklyMenuAdmin.css";

const daysOfWeek = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
];

const mealTypes = ["Breakfast","Lunch","Dinner"];

const WeeklyMenuAdmin = () => {

  const navigate = useNavigate();

  const [hostel, setHostel] = useState("boys");
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);

  const [requirement, setRequirement] = useState({
    Breakfast: "0.00",
    Lunch: "0.00",
    Dinner: "0.00"
  });

  const [weekStartISO, setWeekStartISO] = useState("");
  const [weekStartDisplay, setWeekStartDisplay] = useState("");

  // ================= REQUIREMENT =================
  const fetchRequirement = async (hostel) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/meal-requirement?hostel=${hostel}`
      );

      const data = await res.json();

      setRequirement({
        Breakfast: parseFloat(data["Breakfast"] || 0).toFixed(2),
        Lunch: parseFloat(data["Lunch"] || 0).toFixed(2),
        Dinner: parseFloat(data["Dinner"] || 0).toFixed(2)
      });

    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH MENU =================
  const fetchMenu = async (hostel) => {
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/menu/current?hostel=${hostel}`
      );

      const data = await res.json();

      setMenu(data || {});

      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());

      setWeekStartISO(start.toISOString().split("T")[0]);
      setWeekStartDisplay(start.toLocaleDateString("en-GB"));

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // ================= LOAD =================
  useEffect(() => {
    fetchMenu(hostel);
    fetchRequirement(hostel);
  }, [hostel]);

  // ================= HANDLE CHANGE =================
  const handleChange = (day, meal, value) => {
    setMenu(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: value // store as string while typing
      }
    }));
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      const formattedMenu = {};

      for (const day in menu) {
        formattedMenu[day] = {};

        for (const meal in menu[day]) {

          const value = menu[day][meal];

          formattedMenu[day][meal] =
            typeof value === "string"
              ? value.split(",").map(v => v.trim()).filter(Boolean)
              : value; // already array
        }
      }

      await fetch("http://localhost:5000/api/menu/update-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel, menu: formattedMenu })
      });

      alert("✅ Saved successfully");
      fetchMenu(hostel);

    } catch {
      alert("❌ Save failed");
    }
  };

  if (loading) return <p>Loading menu...</p>;

  return (
    <div className="weekly-menu-admin-container">

      <h2>Admin Weekly Menu</h2>
      <p>Week starting: {weekStartDisplay}</p>

      {/* ===== TOP BAR ===== */}
      <div className="top-bar">

        {/* Hostel Toggle */}
        <div className="hostel-toggle">
          <button
            className={hostel === "boys" ? "active" : ""}
            onClick={() => setHostel("boys")}
          >
            Boys
          </button>

          <button
            className={hostel === "girls" ? "active" : ""}
            onClick={() => setHostel("girls")}
          >
            Girls
          </button>
        </div>

        {/* Requirement */}
        <div className="prediction-box">
          📈 Tomorrow’s Requirement:
          <b>
            Breakfast: {requirement.Breakfast} kg,&nbsp;
            Lunch: {requirement.Lunch} kg,&nbsp;
            Dinner: {requirement.Dinner} kg
          </b>
        </div>

        {/* Suggestion */}
        <button
          className="suggestion-btn"
          onClick={() => navigate("/admin/menu-suggestion")}
        >
          🍽 Menu Suggestion
        </button>

      </div>

      {/* ===== TABLE ===== */}
      <table className="weekly-menu-admin-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Date</th>
            {mealTypes.map(meal => <th key={meal}>{meal}</th>)}
          </tr>
        </thead>

        <tbody>
          {daysOfWeek.map((day, index) => {

            const startDate = new Date(weekStartISO);
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + index);

            return (
              <tr key={day}>
                <td>{day}</td>
                <td>{dayDate.toLocaleDateString("en-GB")}</td>

                {mealTypes.map(meal => {

                  const value = menu[day]?.[meal];

                  return (
                    <td key={meal}>
                      <input
                        type="text"
                        value={
                          Array.isArray(value)
                            ? value.join(", ")
                            : value || ""
                        }
                        onChange={e =>
                          handleChange(day, meal, e.target.value)
                        }
                      />
                    </td>
                  );
                })}

              </tr>
            );
          })}
        </tbody>
      </table>

      <button className="save-btn" onClick={handleSave}>
        Save Weekly Menu
      </button>

    </div>
  );
};

export default WeeklyMenuAdmin;
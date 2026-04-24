import { useState, useEffect } from "react";
import "./admin.css";

export default function Dashboard() {
  const [filter, setFilter] = useState("all");
  const [menu, setMenu] = useState({ boys: {}, girls: {} });
  const [loading, setLoading] = useState(true);

  // ================= FETCH TODAY'S MENU =================
  const fetchMenu = async (hostel) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/menu/current?hostel=${hostel}`
      );
      const data = await res.json();
      return data; // structure: { Monday: { Breakfast: [], Lunch: [], Dinner: [] }, ... }
    } catch (err) {
      console.error(err);
      return {};
    }
  };

  useEffect(() => {
    const fetchTodayMenu = async () => {
      setLoading(true);
      const today = new Date();
      const dayName = today.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday"

      const boysMenu = await fetchMenu("boys");
      const girlsMenu = await fetchMenu("girls");

      setMenu({
        boys: {
          breakfast: (boysMenu[dayName]?.Breakfast || []).join(", "),
          lunch: (boysMenu[dayName]?.Lunch || []).join(", "),
          evening: "• Tea\n• Coffee\n• Milk", // fixed evening menu
          dinner: (boysMenu[dayName]?.Dinner || []).join(", "),
        },
        girls: {
          breakfast: (girlsMenu[dayName]?.Breakfast || []).join(", "),
          lunch: (girlsMenu[dayName]?.Lunch || []).join(", "),
          evening: "• Tea\n• Coffee\n• Milk", // fixed evening menu
          dinner: (girlsMenu[dayName]?.Dinner || []).join(", "),
        },
      });

      setLoading(false);
    };

    fetchTodayMenu();
  }, []); // runs once on mount

  const renderSection = (title, data) => (
    <div className="mess-section">
      <h3 className="mess-title">{title}</h3>
      <div className="meal-grid">
        <div className="meal-card">
          <h4>Breakfast</h4>
          <p>{data.breakfast}</p>
        </div>

        <div className="meal-card">
          <h4>Lunch</h4>
          <p>{data.lunch}</p>
        </div>

        <div className="meal-card">
          <h4>Evening</h4>
          {/* render bullet points */}
          <p style={{ whiteSpace: "pre-line" }}>{data.evening}</p>
        </div>

        <div className="meal-card">
          <h4>Dinner</h4>
          <p>{data.dinner}</p>
        </div>
      </div>
    </div>
  );

  if (loading) return <p>Loading today's menu...</p>;

  return (
    <div className="admin-menu-page">
      <h2 className="title">Today's Menu</h2>

      {/* Toggle buttons */}
      <div className="toggle-buttons">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "boys" ? "active" : ""}
          onClick={() => setFilter("boys")}
        >
          Boys
        </button>

        <button
          className={filter === "girls" ? "active" : ""}
          onClick={() => setFilter("girls")}
        >
          Girls
        </button>
      </div>

      {/* Render sections dynamically */}
      {(filter === "all" || filter === "boys") &&
        renderSection("Boys Mess", menu.boys)}

      {(filter === "all" || filter === "girls") &&
        renderSection("Girls Mess", menu.girls)}
    </div>
  );
}
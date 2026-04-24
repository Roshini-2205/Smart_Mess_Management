import React, { useEffect, useState } from "react";

const StudentDashboard = () => {

  const [todayMenu, setTodayMenu] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchMenu = async () => {
      try {
        setLoading(true);

        // ✅ ALWAYS read user object (NOT hostel directly)
        const stored = sessionStorage.getItem("user");
        if (!stored) return;

        const user = JSON.parse(stored);

        // ⭐ SAME logic as WeeklyMenu
        const hostel = user.menu_hostel;

        if (!hostel) return;

        setTodayMenu({
          Breakfast: [],
          Lunch: [],
          Dinner: []
        });

        const res = await fetch(
          `http://localhost:5000/api/menu/current?hostel=${hostel}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        const todayName = new Date().toLocaleDateString("en-US", {
          weekday: "long"
        });

        setTodayMenu(data[todayName] || {});

      } catch (err) {
        console.error("Dashboard menu fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();

  }, []); // run once


  if (loading) return <p>Loading menu...</p>;

  return (
    <>
      <section className="timings-section">
        <h3>Mess Timings</h3>

        <div className="row">
          <div className="card">
            <h4>Breakfast</h4>
            <p>7:00 AM – 8:30 AM</p>
          </div>

          <div className="card">
            <h4>Lunch</h4>
            <p>12:00 PM – 1:30 PM</p>
          </div>

          <div className="card">
            <h4>Evening</h4>
            <p>04:00 PM – 6:00 PM</p>
          </div>

          <div className="card">
            <h4>Dinner</h4>
            <p>7:00 PM – 8:30 PM</p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 30 }}>
        <h3>Today's Menu</h3>

        <div className="row">

          <div className="card menu-card">
            <h4>🌅 Breakfast</h4>
            <ul>
              {(todayMenu.Breakfast || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card menu-card">
            <h4>🍛 Lunch</h4>
            <ul>
              {(todayMenu.Lunch || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card menu-card">
            <h4>☕ Evening Tea</h4>
            <ul>
              <li>Tea</li>
              <li>Coffee</li>
              <li>Milk</li>
            </ul>
          </div>

          <div className="card menu-card">
            <h4>🌙 Dinner</h4>
            <ul>
              {(todayMenu.Dinner || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

        </div>
      </section>
    </>
  );
};

export default StudentDashboard;
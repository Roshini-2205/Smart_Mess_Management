import React, { useEffect, useState } from "react";
import "./WeeklyMenu.css";

const daysOfWeek = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
];

const mealTypes = ["Breakfast","Lunch","Dinner"];

const WeeklyMenu = () => {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(new Date());

  useEffect(() => {

    const fetchMenu = async () => {
      try {
        setLoading(true);

        // ✅ ALWAYS read sessionStorage here
        const stored = sessionStorage.getItem("user");
        if (!stored) return;

        const user = JSON.parse(stored);
        const hostel = user.menu_hostel;

        if (!hostel) return;

        console.log("Fetching menu for:", hostel);

        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        setWeekStart(start);

        const res = await fetch(
          `http://localhost:5000/api/menu/current?hostel=${hostel}`,
          { cache: "no-store" }
        );

        const data = await res.json();
        console.log("MENU DATA:", data);

        setMenu(data || {});
      }
      catch (err) {
        console.error(err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchMenu();

  }, []); // run once

  if (loading) return <p>Loading menu...</p>;

  return (
    <div className="weekly-menu-container">
      <h2>Weekly Menu</h2>
      <p>Week starting: {weekStart.toLocaleDateString("en-GB")}</p>

      <table className="weekly-menu-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Date</th>
            {mealTypes.map(m => <th key={m}>{m}</th>)}
          </tr>
        </thead>

        <tbody>
          {daysOfWeek.map((day, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);

            return (
              <tr key={day}>
                <td>{day}</td>
                <td>{date.toLocaleDateString("en-GB")}</td>
                {mealTypes.map(meal => (
                  <td key={meal}>
                    {menu[day]?.[meal]?.length
                      ? menu[day][meal].join(", ")
                      : "-"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyMenu;
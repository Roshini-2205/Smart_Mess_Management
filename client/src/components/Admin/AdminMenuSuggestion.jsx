import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminMenuSuggestion.css";

const daysOfWeek = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
];

const mealTypes = ["Breakfast", "Lunch", "Dinner"];

const AdminMenuSuggestion = () => {

  const navigate = useNavigate();

  const [hostel, setHostel] = useState("boys");
  const [suggestedMenu, setSuggestedMenu] = useState({});
  const [appliedMeals, setAppliedMeals] = useState({});
  const [insights, setInsights] = useState({
    avg_cost: 0,
    waste_reduction: 0,
    stock_usage: 0
  });

  // ================= APPLY SINGLE =================
  const applySingleMeal = async (day, meal, food) => {
    try {
      await axios.post("http://localhost:5000/api/menu/apply-single-meal", {
        hostel,
        day,
        meal_type: meal.toLowerCase(),
        food
      });

      // mark applied
      setAppliedMeals(prev => ({
        ...prev,
        [`${day}-${meal}`]: true
      }));

    } catch (err) {
      console.error("Error applying meal:", err);
    }
  };

  // ================= FETCH INSIGHTS =================
  const fetchInsights = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/menu-insights?hostel=${hostel}`
      );
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= GENERATE MENU =================
  const generateSuggestions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/menu-suggestion?hostel=${hostel}`
      );

      setSuggestedMenu(res.data);
      fetchInsights();

    } catch (err) {
      console.error(err);
    }
  };

  // ================= APPLY FULL MENU =================
const applyMenu = async () => {
  try {
    const formattedMenu = {};

    for (const day in suggestedMenu) {
      formattedMenu[day] = {};

      for (const meal in suggestedMenu[day]) {
        formattedMenu[day][meal] =
          suggestedMenu[day][meal].map(f => f.food_name);
      }
    }

    await axios.post("http://localhost:5000/api/menu/apply-menu", {
      hostel,
      menu: formattedMenu
    });

    alert("✅ Menu applied successfully!");

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="menu-suggestion-container">

      {/* HEADER */}
      <div className="menu-suggestion-header">
        <h2>Smart Menu Suggestion</h2>
        <button onClick={() => navigate("/admin/menu")}>
          ← Back
        </button>
      </div>

      {/* HOSTEL TOGGLE */}
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

      {/* GENERATE */}
      <button onClick={generateSuggestions}>
        Generate Smart Menu
      </button>

      {/* TABLE */}
      <table className="suggestion-table">
        <thead>
          <tr>
            <th>Day</th>
            {mealTypes.map(meal => (
              <th key={meal}>{meal}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {daysOfWeek.map(day => (
            <tr key={day}>
              <td>{day}</td>

              {mealTypes.map(meal => (
                <td key={meal}>

                  {(suggestedMenu[day]?.[meal.toLowerCase()] || []).map((f, i) => (

                    <div key={i} className="food-row">

                      <span>{f.food_name}</span>

                      <span
                        className={`apply-icon ${
                          appliedMeals[`${day}-${meal}`] ? "applied" : ""
                        }`}
                        onClick={() =>
                          !appliedMeals[`${day}-${meal}`] &&
                          applySingleMeal(day, meal, f.food_name)
                        }
                      >
                        {appliedMeals[`${day}-${meal}`] ? "✔️" : "➕"}
                      </span>

                    </div>

                  ))}

                </td>
              ))}

            </tr>
          ))}
        </tbody>
      </table>

      {/* INSIGHTS
      <div className="insight-container">

        <div className="insight-card">
          💰 <h4>Cost</h4>
          <p>₹ {parseFloat(insights.avg_cost || 0).toFixed(2)}</p>
        </div>

        <div className="insight-card">
          🗑 <h4>Waste</h4>
          <p>{parseFloat(insights.waste_reduction || 0).toFixed(2)}% ↓</p>
        </div>

        <div className="insight-card">
          📦 <h4>Stock Usage</h4>
          <p>{insights.stock_usage}%</p>
        </div> */}

      {/* </div> */}

      {/* APPLY FULL */}
      <button onClick={applyMenu}>
        Apply Full Menu
      </button>

    </div>
  );
};

export default AdminMenuSuggestion;
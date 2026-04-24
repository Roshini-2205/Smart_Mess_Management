const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ FIXED WEEK FUNCTION (NO UTC ISSUE)
const getWeekStart = () => {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - today.getDay());

  const yyyy = start.getFullYear();
  const mm = String(start.getMonth() + 1).padStart(2, "0");
  const dd = String(start.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

// ============================
// GET CURRENT MENU
// ============================
router.get("/current", async (req, res) => {
  try {
    let hostel;

    if (req.query.userId) {
      const [[user]] = await db.query(
        "SELECT hostel FROM mess_users WHERE id=?",
        [req.query.userId]
      );

      if (!user) return res.status(404).json({ error: "User not found" });

      hostel = user.hostel.trim().toLowerCase();
    } else if (req.query.hostel) {
      hostel = req.query.hostel.trim().toLowerCase();
    } else {
      return res.status(400).json({ error: "Hostel required" });
    }

    const weekStart = getWeekStart();

    console.log("Week:", weekStart, "Hostel:", hostel); // DEBUG

    const [rows] = await db.query(
      `SELECT day, meal_type, items
       FROM weekly_menu
       WHERE week_start_date=? 
       AND LOWER(hostel)=LOWER(?)`,
      [weekStart, hostel]
    );

    const menu = {};

    rows.forEach(r => {
      if (!menu[r.day]) menu[r.day] = {};

      const meal =
        r.meal_type.charAt(0).toUpperCase() +
        r.meal_type.slice(1);

      const parsed = JSON.parse(r.items || "[]");

      // ✅ ALWAYS STRING ARRAY
      menu[r.day][meal] = parsed.map(v =>
        typeof v === "object" ? v.food_name : v
      );
    });

    res.json(menu);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// SAVE / UPDATE WEEK
// ============================
router.post("/update-week", async (req, res) => {
  try {
    const { hostel, menu } = req.body;
    const week_start_date = getWeekStart();

    for (const day in menu) {
      for (const meal in menu[day]) {

        const cleanItems = (menu[day][meal] || []).map(v =>
          typeof v === "object" ? v.food_name : v
        );

        await db.query(
          `INSERT INTO weekly_menu
          (week_start_date, hostel, day, meal_type, items)
          VALUES (?, LOWER(?), ?, ?, ?)
          ON DUPLICATE KEY UPDATE items=VALUES(items)`,
          [
            week_start_date,
            hostel,
            day,
            meal.toLowerCase(),
            JSON.stringify(cleanItems)
          ]
        );
      }
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// APPLY SINGLE MEAL
// ============================
router.post("/apply-single-meal", async (req, res) => {
  try {
    const { hostel, day, meal_type, food } = req.body;
    const week_start_date = getWeekStart();

    const [existing] = await db.query(
      `SELECT items FROM weekly_menu
       WHERE week_start_date=? 
       AND LOWER(hostel)=LOWER(?) 
       AND day=? 
       AND meal_type=?`,
      [week_start_date, hostel, day, meal_type]
    );

    let items = [];

    if (existing.length > 0) {
      const parsed = JSON.parse(existing[0].items || "[]");

      items = parsed.map(v =>
        typeof v === "object" ? v.food_name : v
      );
    }

    const cleanFood =
      typeof food === "object" ? food.food_name : food;

    if (!items.includes(cleanFood)) {
      items.push(cleanFood);
    }

    await db.query(
      `INSERT INTO weekly_menu
      (week_start_date, hostel, day, meal_type, items)
      VALUES (?, LOWER(?), ?, ?, ?)
      ON DUPLICATE KEY UPDATE items=VALUES(items)`,
      [
        week_start_date,
        hostel,
        day,
        meal_type,
        JSON.stringify(items)
      ]
    );

    res.json({ message: "Meal applied successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// APPLY FULL MENU
// ============================
router.post("/apply-menu", async (req, res) => {
  try {
    const { hostel, menu } = req.body;
    const week_start_date = getWeekStart();

    for (const day in menu) {
      for (const meal in menu[day]) {

        const cleanItems = (menu[day][meal] || []).map(v =>
          typeof v === "object" ? v.food_name : v
        );

        await db.query(
          `INSERT INTO weekly_menu
          (week_start_date, hostel, day, meal_type, items)
          VALUES (?, LOWER(?), ?, ?, ?)
          ON DUPLICATE KEY UPDATE items=VALUES(items)`,
          [
            week_start_date,
            hostel,
            day,
            meal.toLowerCase(),
            JSON.stringify(cleanItems)
          ]
        );
      }
    }

    res.json({ message: "Full menu applied successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
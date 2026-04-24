const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const filter = req.query.filter || "month";

    let condition = "DATE(f.date) >= CURDATE() - INTERVAL 30 DAY";

    if (filter === "day") {
      condition = "DATE(f.date) = CURDATE()";
    } else if (filter === "week") {
      condition = "DATE(f.date) >= CURDATE() - INTERVAL 7 DAY";
    }

    const query = `
      SELECT 
        f.date,
        f.meal,
        f.expected_count,

        -- ✅ ACTUAL (safe)
        COALESCE(a.actual, 0) AS actual,

        -- ✅ DIFFERENCE
        (COALESCE(a.actual, 0) - f.expected_count) AS difference,

        -- ✅ PERCENTAGE
        ROUND(
          ((COALESCE(a.actual, 0) - f.expected_count) / NULLIF(f.expected_count, 0)) * 100,
          2
        ) AS percentage,

        -- ✅ COOKED
        COALESCE(mp.prepared_count, 0) AS cooked,

        -- ✅ WASTE
        (COALESCE(mp.prepared_count, 0) - COALESCE(a.actual, 0)) AS waste

      FROM floating_population f

      LEFT JOIN (

        SELECT 
          t.date,
          t.meal,

          -- 🔥 REALISTIC VARIATION (ONLY ONCE)
          CASE 
            WHEN t.meal = 'breakfast' THEN ROUND(t.total * (0.85 + RAND() * 0.1))
            WHEN t.meal = 'lunch' THEN ROUND(t.total * (0.80 + RAND() * 0.1))
            WHEN t.meal = 'dinner' THEN ROUND(t.total * (0.90 + RAND() * 0.1))
            ELSE t.total
          END AS actual

        FROM (

          -- 🍳 BREAKFAST → based on previous day's hostel attendance
          SELECT 
            DATE_ADD(date, INTERVAL 1 DAY) AS date,
            'breakfast' AS meal,
            COUNT(DISTINCT user_id) AS total
          FROM hostel_attendance
          WHERE status = 'present'
          GROUP BY date

          UNION ALL

          -- 🍛 LUNCH → based on same day's morning college attendance
          SELECT 
            date,
            'lunch' AS meal,
            COUNT(DISTINCT user_id) AS total
          FROM college_attendance
          WHERE session = 'morning' 
            AND status = 'present'
          GROUP BY date

          UNION ALL

          -- 🌙 DINNER → based on afternoon college attendance (hostellers only)
          SELECT 
            c.date,
            'dinner' AS meal,
            COUNT(DISTINCT c.user_id) AS total
          FROM college_attendance c
          JOIN mess_users u ON u.id = c.user_id
          WHERE c.session = 'afternoon'
            AND c.status = 'present'
            AND u.user_type = 'hosteller'
          GROUP BY c.date

        ) t

      ) a
     ON DATE(f.date) = DATE(a.date) AND f.meal = a.meal

      LEFT JOIN meal_production mp
      ON f.date = mp.date AND f.meal = mp.meal

      WHERE ${condition}

      ORDER BY f.date DESC, FIELD(f.meal, 'breakfast', 'lunch', 'dinner')
    `;

    const [rows] = await db.query(query);

    res.json(rows);

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
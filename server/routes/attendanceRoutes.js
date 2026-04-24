const express = require("express");
const router = express.Router();
const db = require("../config/db");


/* =====================================================
   1️⃣ MARK ATTENDANCE  (student scan)
   POST /api/attendance/mark
===================================================== */
router.post("/mark", async (req, res) => {
  try {
    const { email, meal, token } = req.body;

    if (!email || !meal || !token) {
      return res.status(400).json({ message: "Missing email/meal/token" });
    }

    // VALIDATE TOKEN
    const [valid] = await db.query(
      `SELECT id FROM qr_sessions
       WHERE token = ? AND meal = ?
       ORDER BY id DESC
       LIMIT 1`,
      [token, meal]
    );

    if (!valid.length) {
      return res.status(401).json({ message: "Invalid or expired QR" });
    }

    // FIND USER
    const [users] = await db.query(
      "SELECT id FROM mess_users WHERE email = ?",
      [email]
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = users[0].id;

    // CHECK DUPLICATE
    const [exists] = await db.query(
      `SELECT id FROM attendance
       WHERE user_id = ?
       AND meal = ?
       AND date = CURDATE()`,
      [userId, meal]
    );

    if (exists.length) {
      return res.status(400).json({
        message: "Already attendance marked"
      });
    }

    // INSERT
    await db.query(
      `INSERT INTO attendance (user_id, meal, date, time, token)
       VALUES (?, ?, CURDATE(), CURTIME(), ?)`,
      [userId, meal, token]
    );

    res.json({ message: "Attendance marked successfully" });

  } catch (err) {
    console.error("MARK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   2️⃣ STUDENT HISTORY
   GET /api/attendance/student?email=
===================================================== */
router.get("/student", async (req, res) => {
  try {
    const { email, date } = req.query;

    let sql = `
      SELECT a.meal, a.date, a.time
      FROM attendance a
      JOIN mess_users u ON u.id = a.user_id
      WHERE u.email = ?
    `;

    const params = [email];

    // 🔥 filter by date (default today)
    if (date) {
      sql += " AND a.date = ?";
      params.push(date);
    } else {
      sql += " AND a.date = CURDATE()";
    }

    sql += " ORDER BY a.time DESC";

    const [rows] = await db.query(sql, params);

    res.json(rows);

  } catch (err) {
    console.error("STUDENT HISTORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* =====================================================
   3️⃣ ADMIN FETCH  (meal + boys/girls + date filters)
   GET /api/attendance?meal=lunch&mess=boys&date=2026-02-18
===================================================== */
router.get("/", async (req, res) => {
  try {
    const meal = req.query.meal || null;
    const gender = req.query.gender || null;
    const date = req.query.date || null;

    let sql = `
      SELECT 
        u.name,
        u.email,
        u.gender,

        CASE
          WHEN u.gender = 'Male' THEN 'Boys'
          WHEN u.gender = 'Female' THEN 'Girls'
        END AS mess,

        a.meal,
        a.date,
        a.time

      FROM attendance a
      JOIN mess_users u ON u.id = a.user_id
      WHERE 1=1
    `;

    const params = [];

    if (meal) {
      sql += " AND a.meal = ?";
      params.push(meal);
    }

    if (gender) {
      sql += " AND u.gender = ?";
      params.push(gender);
    }

    if (date) {
      sql += " AND a.date = ?";
      params.push(date);
    }

    sql += " ORDER BY a.time DESC";

    const [rows] = await db.query(sql, params);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   4️⃣ GENERATE CURRENT QR TOKEN
   GET /api/attendance/current-qr?meal=lunch
===================================================== */
// router.get("/current-qr", async (req, res) => {
//   try {
//     const { meal } = req.query;

//     if (!meal) {
//       return res.status(400).json({ message: "Meal required" });
//     }

//     const token = `${meal}-${Date.now()}`;

//     await db.query(
//       `INSERT INTO qr_sessions (meal, token)
//        VALUES (?, ?)`,
//       [meal, token]
//     );

//     res.json({ token });

//   } catch (err) {
//     console.error("QR ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.get("/current-qr", async (req, res) => {
  try {
    const { meal } = req.query;
    if (!meal) return res.status(400).json({ message: "Meal required" });

    const token = `${meal}-${Date.now()}`;

    await db.query(`INSERT INTO qr_sessions (meal, token) VALUES (?, ?)`, [meal, token]);

    // ✅ Return both token and meal in QR JSON
    res.json({ token, meal });
  } catch (err) {
    console.error("QR ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* =====================================================
   5️⃣ TODAY ATTENDANCE
   GET /api/attendance/today
===================================================== */
router.get("/today", async (req, res) => {
  try {
    const [rows] = await db.query(`
     SELECT 
  u.name,
  u.email,
  u.gender,

  CASE
    WHEN u.gender = 'Male' THEN 'Boys'
    WHEN u.gender = 'Female' THEN 'Girls'
  END AS mess,

  a.meal,
  a.date,
  a.time


      FROM attendance a
      JOIN mess_users u ON u.id = a.user_id
      WHERE a.date = CURDATE()
      ORDER BY a.time DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("TODAY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

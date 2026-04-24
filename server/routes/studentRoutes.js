// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get logged-in student info
router.get("/profile/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const [rows] = await db.query(
      "SELECT id, name, email, hostel FROM mess_user WHERE id = ?",
      [studentId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Student not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

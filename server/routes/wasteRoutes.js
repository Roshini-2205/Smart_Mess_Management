// routes/wasteRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all waste records
router.get("/", async (req, res) => {
  const hostel = req.query.hostel; // optional
  let sql = "SELECT * FROM waste ORDER BY waste_date DESC";
  const params = [];
  if(hostel && hostel !== 'all') {
      sql = "SELECT * FROM waste WHERE hostel = ? ORDER BY waste_date DESC";
      params.push(hostel);
  }
  const [rows] = await db.execute(sql, params);
  res.json(rows);
});

// ADD new waste record
router.post("/", async (req, res) => {
  try {
    const { waste_date, raw_waste, cooked_waste, evening, hostel } = req.body;

const [result] = await db.execute(
`INSERT INTO waste (waste_date, raw_waste, cooked_waste, evening, hostel, status)
VALUES (?, ?, ?, ?, ?, 'pending')`,
[waste_date, raw_waste || 0, cooked_waste || 0, evening || 0, hostel]
);

    const [newRow] = await db.execute(
      `SELECT * FROM waste WHERE id = ?`,
      [result.insertId]
    );

    res.json(newRow[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add waste record" });
  }
});

// UPDATE waste record
// UPDATE waste status (organic team receive)
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const fields = req.body;

    const updates = [];
    const values = [];

    for (let key in fields) {
      updates.push(`${key}=?`);
      values.push(fields[key]);
    }

    values.push(id);

    await db.execute(
      `UPDATE waste SET ${updates.join(",")} WHERE id=?`,
      values
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// DELETE waste record
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.execute(`DELETE FROM waste WHERE id = ?`, [id]);
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete waste record" });
  }
});

module.exports = router;
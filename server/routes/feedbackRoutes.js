const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================================
// GET all feedbacks (Admin page)
// ================================

router.get("/", async (req, res) => {
  try {
    console.log("GET /api/feedback called");
    const [rows] = await db.query("SELECT * FROM feedback ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ success: false, message: "Failed to fetch feedbacks" });
  }
});

// ================================
// GET suggestions for Organic team only
// ================================
router.get("/organic/suggestions", async (req, res) => {
  try {
    console.log("GET /api/organic/suggestions called");
    const [rows] = await db.query(
      "SELECT * FROM feedback WHERE role='organic' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching organic suggestions:", err);
    res.status(500).json({ success: false, message: "Failed to fetch suggestions" });
  }
});
// ===================================
// CREATE FEEDBACK (Student / Organic)
// ===================================
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/feedback called with body:", req.body);

    const { category, meal, rating, message, role } = req.body;

    if (!category || !message) {
      console.log("Missing category or message!");
      return res.status(400).json({ success: false, message: "Category and message required" });
    }

    const feedbackRole = role || "student";
    const feedbackRating = feedbackRole === "student" ? rating || 0 : null;
    const feedbackMeal = feedbackRole === "student" ? meal || null : null;

    const sql = `
      INSERT INTO feedback (category, meal, rating, message, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    console.log("Inserting into DB:", [category, feedbackMeal, feedbackRating, message, feedbackRole, "Pending"]);

    await db.query(sql, [category, feedbackMeal, feedbackRating, message, feedbackRole, "Pending"]);

    console.log("Feedback inserted successfully");

    res.json({ success: true, message: "Feedback submitted" });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ success: false, message: "Failed to submit feedback" });
  }
});

// ================================
// UPDATE STATUS (Admin resolves)
// ================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("PUT /api/feedback/:id called with id:", id);

    const sql = "UPDATE feedback SET status='Resolved' WHERE id=?";
    await db.query(sql, [id]);

    console.log("Status updated for feedback id:", id);
    res.json({ success: true, message: "Status updated to Resolved" });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

module.exports = router;
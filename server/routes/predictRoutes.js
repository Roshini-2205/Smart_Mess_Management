// routes/predictRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const regression = require("regression");

// Predict tomorrow attendance based on last 30 days
router.get("/attendance", async (req, res) => {
  try {
    const hostel = req.query.hostel || "boys"; // default boys if not provided

    // Fetch last 30 days
    const [rows] = await db.execute(
      `SELECT date, breakfast, lunch, dinner, evening
       FROM attendance_summary
       WHERE hostel = ?
       ORDER BY date DESC
       LIMIT 30`,
      [hostel]
    );

    if (!rows.length) return res.json({ breakfast: 0, lunch: 0, dinner: 0, evening: 0 });

    // Prepare data for regression
    const breakfastData = [];
    const lunchData = [];
    const dinnerData = [];
    const eveningData = [];

    rows.reverse().forEach((row, index) => {
      breakfastData.push([index, row.breakfast || 0]);
      lunchData.push([index, row.lunch || 0]);
      dinnerData.push([index, row.dinner || 0]);
      eveningData.push([index, row.evening || 0]);
    });

    // Train linear regression
    const breakfastModel = regression.linear(breakfastData);
    const lunchModel = regression.linear(lunchData);
    const dinnerModel = regression.linear(dinnerData);
    const eveningModel = regression.linear(eveningData);

    const nextIndex = rows.length;

    const predicted = {
      breakfast: Math.round(breakfastModel.predict(nextIndex)[1]),
      lunch: Math.round(lunchModel.predict(nextIndex)[1]),
      dinner: Math.round(dinnerModel.predict(nextIndex)[1]),
      evening: Math.round(eveningModel.predict(nextIndex)[1]),
    };

    res.json(predicted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

module.exports = router;
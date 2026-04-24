const express = require("express");
const router = express.Router();
const axios = require("axios");

// call Flask ML service
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://127.0.0.1:5001/predict");
    res.json(response.data);
  } catch (err) {
    console.error("ML service error:", err.message);
    res.status(500).json({ message: "Prediction failed" });
  }
});

module.exports = router;
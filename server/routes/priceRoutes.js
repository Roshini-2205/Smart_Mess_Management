const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../config/db");

router.get("/update-prices", async (req, res) => {

  try {

    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params: {
          "api-key": "579b464db66ec23bdd000001bc83d6627bc54dad76cb8d4ceb5351a9",
          format: "json",
          limit: 500
        },
        timeout: 60000
      }
    );

    const records = response.data.records;

    for (const item of records) {

      if (!item.modal_price || !item.commodity) continue;

      if (item.state !== "Tamil Nadu") continue;

      const pricePerKg = parseFloat(item.modal_price) / 100;

      await db.query(
        `UPDATE stock_items
         SET price_per_unit = ?
         WHERE LOWER(item_name) LIKE CONCAT('%', LOWER(?), '%')`,
        [pricePerKg, item.commodity]
      );

      console.log(`Updated ${item.commodity} -> ${pricePerKg}`);

    }

    res.json({ message: "Prices updated successfully" });

  } catch (err) {

    console.log("PRICE API ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });

  }

});

module.exports = router;
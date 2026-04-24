const express = require("express");
const router = express.Router();
const db = require("../config/db");
const axios = require("axios");


// =============================
// GET STOCK (with hostel filter)
// =============================
router.get("/", async (req, res) => {

  try {

    const hostel = req.query.hostel;

    let query;
    let params = [];

    // 🔹 ALL HOSTELS (combined view)
    if (!hostel || hostel === "all") {

      query = `
        SELECT 
          MIN(id) AS id,
          item_name,
          SUM(quantity) AS quantity,
          unit,
          AVG(price_per_unit) AS price_per_unit
        FROM stock_items
        GROUP BY item_name, unit
        ORDER BY item_name
      `;

    } 
    // 🔹 SPECIFIC HOSTEL
    else {

      query = `
        SELECT * FROM stock_items
        WHERE hostel = ?
        ORDER BY item_name
      `;

      params.push(hostel);
    }

    const [rows] = await db.query(query, params);

    res.json(rows);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Fetch failed" });

  }

});


// =============================
// ADD STOCK ITEM
// =============================
router.post("/", async (req, res) => {

  let { item_name, quantity, unit, price_per_unit, min_threshold, hostel } = req.body;

  try {

    // 🔹 If price empty → fetch from API
    if (!price_per_unit || price_per_unit == 0) {

      const response = await axios.get(
        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
        {
          params: {
            "api-key": "579b464db66ec23bdd000001bc83d6627bc54dad76cb8d4ceb5351a9",
            format: "json",
            limit: 100
          }
        }
      );

      const records = response.data.records;

      // 🔹 Flexible commodity matching
      const match = records.find(r =>
        r.commodity.toLowerCase().includes(item_name.toLowerCase()) ||
        item_name.toLowerCase().includes(r.commodity.toLowerCase())
      );

      if (match && match.modal_price) {
        price_per_unit = Number(match.modal_price);
      } else {
        price_per_unit = 0;
      }

    }

    await db.query(
      `INSERT INTO stock_items
      (item_name, quantity, unit, price_per_unit, min_threshold, hostel)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        item_name,
        quantity || 0,
        unit || "kg",
        price_per_unit || 0,
        min_threshold || 0,
        hostel || "boys"
      ]
    );

    res.json({
      success: true,
      fetched_price: price_per_unit
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Insert failed" });

  }

});


// =============================
// UPDATE STOCK
// =============================
router.put("/:id", async (req, res) => {

  const { quantity, price_per_unit, min_threshold } = req.body;
  const id = req.params.id;

  await db.query(
    `UPDATE stock_items
     SET quantity = ?, price_per_unit = ?, min_threshold = ?
     WHERE id = ?`,
    [quantity, price_per_unit, min_threshold, id]
  );

  res.json({ message: "Stock updated" });

});
// =============================
// DELETE STOCK ITEM
// =============================
router.delete("/:id", async (req, res) => {

  try {

    await db.query(
      "DELETE FROM stock_items WHERE id=?",
      [req.params.id]
    );

    res.json({ success: true });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Delete failed" });

  }

});


module.exports = router;
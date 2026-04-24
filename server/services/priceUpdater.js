const axios = require("axios");
const db = require("../config/db");

const updatePrices = async () => {

  try {

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

    const updated = new Set();   // prevent multiple updates

    for (const item of records) {

      if (!item.modal_price || !item.commodity) continue;
      

  // ✅ Only take Tamil Nadu market data
      if (item.state !== "Tamil Nadu") continue;
   
      const commodity = item.commodity.toLowerCase();

      // skip if already updated
      if (updated.has(commodity)) continue;

      const pricePerKg = parseFloat(item.modal_price) / 100;

      const [result] = await db.query(
        `UPDATE stock_items
         SET price_per_unit = ?
         WHERE LOWER(item_name) LIKE CONCAT('%', ?, '%')`,
        [pricePerKg, commodity]
      );

      if (result.affectedRows > 0) {
        updated.add(commodity);
        console.log("Updated:", commodity, "Price:", pricePerKg);
      }
    }

    console.log("Prices updated successfully");

  } catch (err) {
    console.log("Price update failed:", err.message);
  }

};

module.exports = updatePrices;
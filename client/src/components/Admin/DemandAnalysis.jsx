import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DemandAnalysis.css";

export default function AdminDemand() {
  const [demand, setDemand] = useState([]);
  const [stocks, setStocks] = useState([]);
  const navigate = useNavigate();

  // =========================
  // FETCH ML PREDICTION (Flask)
  // =========================
 const fetchDemand = async ()  => {
  try {
    const res = await axios.get("http://localhost:5000/api/demand");

    setDemand(res.data || []); // ← IMPORTANT
  } catch (err) {
    console.error(err);
    setDemand([]); // ← prevent crash
  }
};
  // =========================
  // FETCH CURRENT STOCK (Node API)
  // =========================
  const fetchStocks = async () => {
    const res = await axios.get("http://localhost:5000/api/stock");
    setStocks(res.data);
  };

  // =========================
  // APPLY SUGGESTION
  // =========================
  const applySuggestion = async (id, qty) => {
    await axios.put(`http://localhost:5000/api/stock/${id}`, {
      quantity: qty,
    });
    fetchStocks();
  };

  // =========================
  // SUGGESTION LOGIC
  // =========================
const getSuggestion = (stock, predicted) => {
    if (!predicted || predicted === 0) return "—";

    const ratio = stock / predicted;

    if (ratio <= 0.5) return "❌ Critical Low";
    if (ratio <= 1) return "🔥 Buy Immediately";
    if (ratio <= 1.3) return "⚠️ Refill Soon";
    if (ratio <= 2) return "✅ Sufficient";
    return "📦 Overstock";
  };


  useEffect(() => {
    fetchDemand();
    fetchStocks();
  }, []);

  return (
    <div className="demand-analysis-page">

      <button className="back-btn" onClick={() => navigate("/admin/stock")}>
        ← Back
      </button>

      <h2>📊 Weekly Demand Analysis</h2>

      <table className="demand-table">
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Current</th>
            <th>Unit</th>
            <th>Predicted (7d)</th>
            <th>Required</th>
            {/* <th>Buy Qty</th> */}
            <th>Cost</th>
            <th>Suggestion</th>
            <th>Action</th>
          </tr>
        </thead>

     <tbody>
  {demand?.map((d) => {

    const stockItem = stocks.find(
      s => s.item_name?.toLowerCase() === d.item?.toLowerCase()
    );

    const current = stockItem?.quantity || 0;
    const unit = stockItem?.unit || "";
    const predicted = d.predicted_qty || 0;

    const required = Math.max(predicted - current, 0);
    const price = stockItem?.price_per_unit || 0;
    const cost = required * price;

    const suggestion = getSuggestion(current, predicted);

    return (
      <tr key={d.item}>
        <td>{d.item}</td>

        <td>{Number(current).toFixed(2)}</td>

        <td>{unit}</td>

        <td>{Number(predicted).toFixed(2)} {unit}</td>

        <td>{Number(required).toFixed(2)}</td>

        <td>₹{Number(cost).toFixed(2)}</td>

        <td>{suggestion}</td>

        <td>
          {required > 0 && stockItem && (
            <button
              onClick={() =>
                applySuggestion(stockItem.id, current + required)
              }
            >
              🛒 Purchase
            </button>
          )}
        </td>
      </tr>
    );
  })}
</tbody>
      </table>
    </div>
  );
}
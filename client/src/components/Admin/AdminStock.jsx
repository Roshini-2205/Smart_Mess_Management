import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminStock.css";

const AdminStock = () => {

  const navigate = useNavigate();

  const [hostel, setHostel] = useState("all");
  const [stockItems, setStockItems] = useState([]);

  const [editIndex, setEditIndex] = useState(null);
  const [editedQty, setEditedQty] = useState("");
 const [editedPrice, setEditedPrice] = useState("");

  // NEW → Add form state
  const [newItem, setNewItem] = useState({
  item_name: "",
  quantity: "",
  unit: "kg",
  price_per_unit: "",
  min_threshold: "",
  hostel: "boys"
});


  // ================= FETCH
  const fetchStock = async () => {
    const res = await fetch(`http://localhost:5000/api/stock?hostel=${hostel}`);
    const data = await res.json();
    setStockItems(data);
  };

  useEffect(() => {
    fetchStock();
  }, [hostel]);


  // ================= ADD
const handleAdd = async () => {

  if(!newItem.item_name){
    alert("Enter item name");
    return;
  }

  await fetch("http://localhost:5000/api/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      item_name: newItem.item_name,
      quantity: Number(newItem.quantity),
      unit: newItem.unit,
      price_per_unit: Number(newItem.price_per_unit),
      min_threshold: Number(newItem.min_threshold),
      hostel: newItem.hostel
    })
  });

  setNewItem({
    item_name: "",
    quantity: "",
    unit: "kg",
    price_per_unit: "",
    min_threshold: "",
    hostel: "boys"
  });

  fetchStock();
};


  // ================= EDIT
  const handleEdit = (index) => {
  setEditIndex(index);
  setEditedQty(stockItems[index].quantity);
  setEditedPrice(stockItems[index].price_per_unit);
};

 const handleSave = async (index) => {

  const item = stockItems[index];

  await fetch(`http://localhost:5000/api/stock/${item.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quantity: editedQty,
      price_per_unit: editedPrice,
      min_threshold: item.min_threshold
    })
  });

  setEditIndex(null);
  fetchStock();
};

//   const handleSave = async (index) => {

//   const item = stockItems[index];

//   await axios.put(`/api/stock/${item.id}`, {
//     quantity: editedQty,
//     price_per_unit: editedPrice
//   });

//   setEditIndex(null);
//   fetchStock();   // reload data

// };
  // ================= DELETE
  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/stock/${id}`, {
      method: "DELETE"
    });

    fetchStock();
  };


  return (
    <div className="admin-stock-container stock-page">

      {/* Top bar */}
      <div className="stock-top-bar">
        <h2>Stock Management</h2>

        <button
          className="demand-btn"
          onClick={() => navigate("/admin/demand-analysis")}
        >
          📊 Demand Analysis
        </button>
      </div>


      {/* ADD FORM */}
      <div className="stock-add-box">
        <input
  placeholder="Item"
  value={newItem.item_name}
  onChange={(e) =>
    setNewItem({ ...newItem, item_name: e.target.value })
  }
/>

<input
  type="number"
  placeholder="Qty"
  value={newItem.quantity}
  onChange={(e) =>
    setNewItem({ ...newItem, quantity: e.target.value })
  }
/>

<select
  value={newItem.unit}
  onChange={(e) =>
    setNewItem({ ...newItem, unit: e.target.value })
  }
>
  <option>kg</option>
  <option>litre</option>
  <option>pcs</option>
</select>

<input
  type="number"
  placeholder="Price per unit"
  value={newItem.price_per_unit}
  onChange={(e) =>
    setNewItem({ ...newItem, price_per_unit: e.target.value })
  }
/>

<input
  type="number"
  placeholder="Min Threshold"
  value={newItem.min_threshold}
  onChange={(e) =>
    setNewItem({ ...newItem, min_threshold: e.target.value })
  }
/>

<select
  value={newItem.hostel}
  onChange={(e) =>
    setNewItem({ ...newItem, hostel: e.target.value })
  }
>
  <option value="boys">Boys</option>
  <option value="girls">Girls</option>
</select>

<button onClick={handleAdd}>Add</button>
      </div>


   <div className="hostel-toggle">

  <button
    className={hostel === "all" ? "active" : ""}
    onClick={() => setHostel("all")}
  >
    All
  </button>

  <button
    className={hostel === "boys" ? "active" : ""}
    onClick={() => setHostel("boys")}
  >
    Boys
  </button>

  <button
    className={hostel === "girls" ? "active" : ""}
    onClick={() => setHostel("girls")}
  >
    Girls
  </button>

</div>


      {/* TABLE */}
      <table className="stock-table">
        <thead>
<tr>
<th>Ingredient</th>
<th>Qty</th>
<th>Unit</th>
<th>Price(₹)</th>
<th>Edit</th>
<th>Delete</th>
</tr>
</thead>
<tbody>
  {stockItems.map((item, index) => (
    <tr key={item.id}>
      
      <td>{item.item_name}</td>

      {/* Quantity */}
      <td>
        {editIndex === index ? (
          <input
            type="number"
            step="0.01"
            value={editedQty}
            onChange={(e) => setEditedQty(e.target.value)}
          />
        ) : (
          Number(item.quantity).toFixed(2)
        )}
      </td>

      {/* Unit */}
      <td>{item.unit}</td>

      {/* Price */}
      <td>
        {editIndex === index ? (
          <input
            type="number"
            step="0.01"
            value={editedPrice}
            onChange={(e) => setEditedPrice(e.target.value)}
          />
        ) : (
          Number(item.price_per_unit).toFixed(2)
        )}
      </td>

      {/* Edit / Save */}
      <td>
        {editIndex === index ? (
          <button onClick={() => handleSave(index)}>Save</button>
        ) : (
          <button onClick={() => handleEdit(index)}>Edit</button>
        )}
      </td>

      {/* Delete */}
      <td>
        <button onClick={() => handleDelete(item.id)}>Delete</button>
      </td>

    </tr>
  ))}
</tbody>
      </table>

    </div>
  );
};

export default AdminStock;
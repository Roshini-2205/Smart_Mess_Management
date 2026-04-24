const db = require("../config/db");

exports.getStock = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM stock");
  res.json(rows);
};

exports.addIngredient = async (req, res) => {
  const { name, quantity, unit, threshold } = req.body;

  await db.query(
    "INSERT INTO stock (name, quantity, unit, threshold) VALUES (?, ?, ?, ?)",
    [name, quantity, unit, threshold]
  );

  res.json({ message: "Ingredient added" });
};

exports.updateStock = async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;

  await db.query(
    "UPDATE stock SET quantity = ? WHERE id = ?",
    [quantity, id]
  );

  res.json({ message: "Stock updated" });
};

exports.useStock = async (req, res) => {
  const { id, used } = req.body;

  await db.query(
    "UPDATE stock SET quantity = quantity - ? WHERE id = ?",
    [used, id]
  );

  res.json({ message: "Usage recorded" });
};

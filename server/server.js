// ==========================
// Imports
// ==========================
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const testRoute = require("./routes/testRoute");

const attendanceRoutes = require("./routes/attendanceRoutes");
const menuRoutes = require("./routes/menuRoutes"); // <- adjust path if needed
const stockRoutes = require("./routes/stockRoutes");
const demandRoutes = require("./routes/demandRoutes");

const feedbackRoutes = require("./routes/feedbackRoutes");

const predictRoutes = require("./routes/predictRoutes");
const wasteRoutes = require("./routes/wasteRoutes");

const priceRoutes = require("./routes/priceRoutes");
const floatingRoutes = require("./routes/floatingRoutes");

const cron = require("node-cron");
const updatePrices = require("./services/priceUpdater");
// ==========================
// App Init
// ==========================
const app = express();

app.use(cors());
app.use(express.json());


// ==========================
// Routes 
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api", testRoute);
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/menu", menuRoutes); 
app.use("/api/feedback", feedbackRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/demand", demandRoutes);

app.use("/api/predict", predictRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/prices", priceRoutes);

app.use("/api/floating", floatingRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Backend running");
});


cron.schedule("0 6 * * *", async () => {
// 5️⃣ Cron Time Explanation
// 0 6 * * *

// Means:

// Field	Value	Meaning
// Minute	0	At minute 0
// Hour	6	At 6 AM
// Day	*	Every day
// Month	*	Every month
// Weekday	*	Any day

  console.log("Running automatic price update...");

  await updatePrices();

});
// ==========================
// DB Connection Test
// ==========================
// ✅ FIXED (removed .promise())
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL Connected Successfully");
  } catch (err) {
    console.log("❌ DB ERROR:", err.message);
  }
})();


// ==========================
// Auto Create Default Admin
// ==========================
async function createDefaultAdmin() {
  try {
    // check if admin exists in mess_users
    const [rows] = await db.query("SELECT id FROM mess_users WHERE role = 'admin' LIMIT 1");
    if (rows.length === 0) {
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await db.query(
        `INSERT INTO mess_users (name, email, role, password, created_at) VALUES (?, ?, 'admin', ?, NOW())`,
        [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, hashedPassword]
      );
      console.log("✅ Default admin created");
    } else {
      console.log("✅ Admin already exists");
    }
  } catch (err) {
    console.error("❌ Admin creation error:", err);
  }
}

// run once on server start
createDefaultAdmin();


// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;
updatePrices(); // run once when server starts
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const db = require("../config/db");


// // ===== REGISTER =====
// router.post("/register", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM mess_users WHERE email = ?",
//       [email]
//     );

//     if (rows.length === 0) {
//       return res.status(400).json({ message: "Email not found in system" });
//     }

//     const user = rows[0];

//     if (user.password) {
//       return res.status(400).json({
//         message: "User already registered, please login"
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await db.query(
//       "UPDATE mess_users SET password = ? WHERE email = ?",
//       [hashedPassword, email]
//     );

//     return res.status(200).json({ message: "Registration successful" });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// });


// // ===== LOGIN =====
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM mess_users WHERE email = ?",
//       [email]
//     );

//     if (rows.length === 0 || !rows[0].password) {
//       return res.status(400).json({ message: "Email not registered" });
//     }

//     const user = rows[0];

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     await db.query(
//       "UPDATE mess_users SET last_login = NOW() WHERE email = ?",
//       [email]
//     );

//     // ⭐ ORIGINAL WORKING LOGIC (boys/girls only)
//     const menuHostel = user.gender === "Male" ? "boys" : "girls";

//     return res.json({
//       message: "Login successful",
//       user: {
//         id: user.id,
//         name: user.name,
//         college_id: user.college_id,
//         email: user.email,
//         gender: user.gender,
//         hostel: menuHostel,   // ← WeeklyMenu depends on this
//         room_no: user.room_no,
//         phone: user.phone,
//         created_at: user.created_at,
//         last_login: user.last_login,
//         user_type: user.user_type,
//         role: user.role
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// module.exports = router;


const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/db");


// ===== REGISTER =====
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM mess_users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Email not found in system" });
    }

    const user = rows[0];

    if (user.password) {
      return res.status(400).json({
        message: "User already registered, please login"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE mess_users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    return res.status(200).json({ message: "Registration successful" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


// ===== LOGIN =====
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM mess_users WHERE email = ?",
      [email]
    );

    if (rows.length === 0 || !rows[0].password) {
      return res.status(400).json({ message: "Email not registered" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    await db.query(
      "UPDATE mess_users SET last_login = NOW() WHERE email = ?",
      [email]
    );

    // ⭐ ORIGINAL WORKING LOGIC (boys/girls only)
    // keep BOTH values
const menuHostel = user.gender === "Male" ? "boys" : "girls";

return res.json({
  message: "Login successful",
  user: {
    id: user.id,
    name: user.name,
    college_id: user.college_id,
    email: user.email,
    gender: user.gender,

    hostel: user.hostel,        // ✅ real block name (Cauvery/Ganga/etc)
    menu_hostel: menuHostel,   // ✅ only for WeeklyMenu

    room_no: user.room_no,
    phone: user.phone,
    created_at: user.created_at,
    last_login: user.last_login,
    user_type: user.user_type,
    role: user.role
  }
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
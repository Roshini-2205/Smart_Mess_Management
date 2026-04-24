const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "smartmess_secret_key";


// ============================
// REGISTER
// ============================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check user exists
    const [user] = await db.query(
      "SELECT * FROM mess_users WHERE email = ?",
      [email]
    );

    if (user.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    await db.query(
      "INSERT INTO ,mess_users (name,email,password,role) VALUES (?,?,?,?)",
      [name, email, hashedPassword, role]
    );

    res.json({ message: "User registered successfully ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};



// ============================
// LOGIN
// ============================
// ============================
// LOGIN
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM mess_users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "1d" }
    );

    // log role for debugging
    console.log("Login role:", user.role);

    // respond with user info
    res.json({
      message: "Login successful ✅",
      token,
      role: user.role.trim().toLowerCase()  // normalize role
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

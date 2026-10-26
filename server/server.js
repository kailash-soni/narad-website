require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://192.168.1.7:5500'
    ]

}));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DATABASE() AS database_name, VERSION() AS mysql_version",
    );

    res.json({
      status: "ok",
      database: rows[0].database_name,
      mysqlVersion: rows[0].mysql_version,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standerdHeaders: 'draft-8',
    legecyHeaders: false,
    message: {
        message: 'Too many enquiries. Please try again in 15 minutes.'
    }
})

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, message } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return res.status(400).json({
      message: "Please provide name, email, and message.",
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  if (
    !cleanName ||
    cleanName.length > 100 ||
    !cleanEmail ||
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    !cleanMessage ||
    cleanMessage.length > 5000
  ) {
    return res.status(400).json({
      message: "Please check your details and try again.",
    });
  }

  try {
    await db.execute(
      `INSERT INTO contact_enquiries (name, email, message)
             VALUES (?, ?, ?)`,
      [cleanName, cleanEmail, cleanMessage],
    );

    res.status(201).json({
      message: "Enquiry saved successfully.",
    });
  } catch (error) {
    console.error("Contact enquiry save failed:", error.message);

    res.status(500).json({
      message: "Unable to save your enquiry right now.",
    });
  }
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Narad backend running on port ${PORT}`);
});

// ===================== SERVER.JS =====================
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the assets directory
app.use("/assets", express.static(path.join(__dirname, "../frontEnd/src/assets")));

// Ensure the assets directory exists
const assetsDir = path.join(__dirname, "../frontEnd/src/assets");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "alumni_entry",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assetsDir); // Save files to C:\ReactMySql\frontEnd\src\assets
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Unique filename
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      short_interview_video: ["video/mp4", "video/quicktime"],
      image_url: ["image/jpeg", "image/png"],
      cv_or_resume: ["application/pdf"],
      memories_at_diu: ["image/jpeg", "image/png", "video/mp4", "video/quicktime"],
    };
    if (allowedTypes[file.fieldname].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`), false);
    }
  },
});

// ================= LOGIN API =================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0)
      res.json({ success: true, message: "Login successful" });
    else
      res.status(401).json({ success: false, message: "Invalid credentials" });
  });
});

// ================= ALUMNI APIs =================

// ✅ 1. Get paginated alumni list
app.get("/api/alumni", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 25;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT id, name, regcode, batch, passing_year, department,
           EMAIL, PHONE_NO, image_url, LinkedIn_Link, Facebook_Link
    FROM alumni_infos
    ORDER BY id ASC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [limit, offset], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ 2. Get detailed alumni info by ID
app.get("/api/alumni/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM alumni_infos WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching alumni detail:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0)
      return res.status(404).json({ error: "Alumni not found" });
    res.json(result[0]);
  });
});

// ✅ 3. Insert edited alumni info into alumni_infos_modified
app.post(
  "/api/alumni/update/:id",
  upload.fields([
    { name: "short_interview_video", maxCount: 1 },
    { name: "image_url", maxCount: 1 },
    { name: "cv_or_resume", maxCount: 1 },
    { name: "memories_at_diu", maxCount: 1 },
  ]),
  (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const files = req.files;

    const sql = `
      INSERT INTO alumni_infos_modifed (
        transcript_id, name, regcode, batch, passing_year, department,
        EMAIL, PHONE_NO, DOB, MAILING_ADD, PARMANENT_ADD, image_url,
        LinkedIn_Link, Facebook_Link, instagram_link, twitter_link,
        short_interview_video, helping_alumni, job_seeker, company_name,
        job_position, job_responsibility, start_date, end_date,
        memories_at_diu, interested_to_join_reunion, interested_to_form_club,
        cv_or_resume, higher_studies, remarks
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
      id,
      data.name || null,
      data.regcode || null,
      data.batch || null,
      data.passing_year || null,
      data.department || null,
      data.EMAIL || null,
      data.PHONE_NO || null,
      data.DOB || null,
      data.MAILING_ADD || null,
      data.PARMANENT_ADD || null,
      files.image_url ? `/assets/${files.image_url[0].filename}` : data.image_url || null,
      data.LinkedIn_Link || null,
      data.Facebook_Link || null,
      data.instagram_link || null,
      data.twitter_link || null,
      data.short_interview_video ? `/assets/${files.short_interview_video[0].filename}` : data.short_interview_video || null,
      data.helping_alumni || null,
      data.job_seeker || null,
      data.company_name || null,
      data.job_position || null,
      data.job_responsibility || null,
      data.start_date || null,
      data.end_date || null,
      files.memories_at_diu ? `/assets/${files.memories_at_diu[0].filename}` : data.memories_at_diu || null,
      data.interested_to_join_reunion || null,
      data.interested_to_form_club || null,
      files.cv_or_resume ? `/assets/${files.cv_or_resume[0].filename}` : data.cv_or_resume || null,
      data.higher_studies || null,
      data.remarks || null,
    ];

    db.query(sql, values, (err) => {
      if (err) {
        console.error("❌ Error inserting updated alumni:", err);
        return res.status(500).json({ error: `Insert failed: ${err.message}` });
      }
      res.json({
        success: true,
        message: "✅ Updated alumni info saved successfully to alumni_infos_modifed",
      });
    });
  }
);

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("✅ Alumni API running successfully!");
});

// ✅ Start server
app.listen(8081, () => {
  console.log("🚀 Server running on port 8081");
});
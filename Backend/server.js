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
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// ===================== DATABASE =====================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "alumni_entry",
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err);
  else console.log("✅ Connected to MySQL database");
});

// ===================== MULTER =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, assetsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
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
    if (allowedTypes[file.fieldname]?.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  },
});

// ===================== LOGIN API =====================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email=? AND password=?", [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0) res.json({ success: true, message: "Login successful" });
    else res.status(401).json({ success: false, message: "Invalid credentials" });
  });
});

// ===================== ALUMNI APIs =====================

// 1️⃣ Paginated list
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
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// 2️⃣ Detailed alumni info
app.get("/api/alumni/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM alumni_infos WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(404).json({ error: "Alumni not found" });
    res.json(result[0]);
  });
});

// 3️⃣ Get jobs for alumni
app.get("/api/alumni/:id/jobs", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT j.*
    FROM alumni_job_details_modified j
    JOIN alumni_infos_modified a ON j.alumni_modified_id = a.id
    WHERE a.transcript_id = ?
    ORDER BY j.id ASC
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// 4️⃣ Update alumni + jobs
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

    // 🔍 1. Verify that original alumni exists
    db.query("SELECT id FROM alumni_infos WHERE id = ?", [id], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error checking alumni" });
      if (rows.length === 0) return res.status(400).json({ error: "Original alumni not found" });

      // 🧩 2. Prepare alumni modified INSERT
      const alumniSql = `
        INSERT INTO alumni_infos_modified (
          transcript_id, name, regcode, batch, passing_year, department,
          EMAIL, PHONE_NO, DOB, MAILING_ADD, PARMANENT_ADD, image_url,
          LinkedIn_Link, Facebook_Link, instagram_link, twitter_link,
          short_interview_video, helping_alumni, job_seeker,
          interested_to_join_reunion, interested_to_form_club,
          cv_or_resume, higher_studies, remarks, created_at, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
      `;

      const alumniValues = [
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
        files.short_interview_video ? `/assets/${files.short_interview_video[0].filename}` : data.short_interview_video || null,
        data.helping_alumni || "No",
        data.job_seeker || "No",
        data.interested_to_join_reunion || "No",
        data.interested_to_form_club || "No",
        files.cv_or_resume ? `/assets/${files.cv_or_resume[0].filename}` : data.cv_or_resume || null,
        data.higher_studies || null,
        data.remarks || null,
      ];

      db.query(alumniSql, alumniValues, (err2, result) => {
        if (err2) {
          console.error("❌ Error inserting alumni:", err2);
          return res.status(500).json({ error: `Insert failed: ${err2.message}` });
        }

        const alumni_modified_id = result.insertId;

        // 🧩 3. Handle jobs
        let jobs = [];
        try {
          jobs = data.jobs ? JSON.parse(data.jobs) : [];
        } catch (err3) {
          console.error("❌ Error parsing jobs JSON:", err3);
        }

        if (!jobs || jobs.length === 0) {
          return res.json({ success: true, message: "Alumni saved (no jobs)" });
        }

        const jobSql = `
          INSERT INTO alumni_job_details_modified
          (alumni_modified_id, company_name, company_address, job_position, start_date, end_date, department, responsibility, created_at, updated_at)
          VALUES ?
        `;

        const jobValues = jobs.map((j) => [
          alumni_modified_id,
          j.company_name || null,
          j.company_address || null,
          j.job_position || null,
          j.start_date || null,
          j.end_date || null,
          j.department || null,
          j.responsibility || null,
          new Date(),
          new Date(),
        ]);

        db.query(jobSql, [jobValues], (err4) => {
          if (err4) {
            console.error("❌ Error inserting jobs:", err4);
            return res.status(500).json({ error: `Jobs insert failed: ${err4.message}` });
          }
          res.json({ success: true, message: "Alumni and jobs saved successfully" });
        });
      });
    });
  }
);

// Root test route
app.get("/", (req, res) => res.send("✅ Alumni API running successfully!"));

// Start server
app.listen(8081, () => console.log("🚀 Server running on port 8081"));

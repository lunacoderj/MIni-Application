const express = require("express");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Static hosting for index.html and validate.js
app.use(express.static(path.join(__dirname)));

// For non-multipart forms (we'll still rely on multer for multipart)
app.use(bodyParser.urlencoded({ extended: true }));

// Multer config for file upload (memory storage; we only log)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Serve index.html at root
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Handle form submission
app.post("/register", upload.single("photo"), (req, res) => {
  // Combine body + file info into a single log payload
  const payload = {
    submittedAt: new Date().toISOString(),
    fields: req.body,
    file: req.file
      ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          sizeBytes: req.file.size,
        }
      : null,
  };

  // If 'skills' was a multi-select, ensure it's an array
  if (payload.fields.skills && !Array.isArray(payload.fields.skills)) {
    // some browsers send as comma-string for multi-select; normalize
    if (typeof payload.fields.skills === "string" && payload.fields.skills.includes(",")) {
      payload.fields.skills = payload.fields.skills.split(",").map((s) => s.trim());
    } else {
      payload.fields.skills = [payload.fields.skills];
    }
  }

  // If 'comm' (checkbox group) comes possibly as string, normalize to array
  if (payload.fields.comm && !Array.isArray(payload.fields.comm)) {
    payload.fields.comm = [payload.fields.comm];
  }

  console.log("=== New Registration ===");
  console.dir(payload, { depth: null, colors: true });

  // Friendly response
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Registration Received</title>
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif; background: #0b1020; color: #e9ecff; display:grid; place-items:center; min-height:100vh; margin:0 }
          .card { background:#121a35; border:1px solid rgba(255,255,255,.12); padding:24px; border-radius:16px; max-width:720px; box-shadow: 0 10px 30px rgba(0,0,0,.35); }
          a { color:#6ea8ff; text-decoration: none; }
          .muted { color:#9fb0ff }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Thank you! 🎉</h1>
          <p>Your registration was received. Check the server console for a full dump of your submission.</p>
          <p class="muted">Timestamp: ${payload.submittedAt}</p>
          <p><a href="/">← Back to form</a></p>
        </div>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Health check (important for Render)
app.get("/", (req, res) => {
  res.send("✅ Voice Notes Backend is running");
});

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".wav";
    cb(null, `audio_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Transcription API
app.post("/transcribe", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const audioPath = req.file.path;
  console.log("🎤 Audio received:", audioPath);

  const command = `python3 run_whisper.py "${audioPath}"`;

  exec(
    command,
    { maxBuffer: 1024 * 1024 * 10 }, // 10MB buffer
    (error, stdout, stderr) => {
      // Cleanup uploaded file
      fs.unlink(audioPath, () => {});

      if (error) {
        console.error("Whisper error:", stderr);
        return res.status(500).json({ error: "Whisper transcription failed" });
      }

      try {
        const result = JSON.parse(stdout);
        res.json({
          text: result.text,
          language: result.language,
        });
      } catch (err) {
        console.error("Invalid Whisper output:", stdout);
        res.status(500).json({ error: "Invalid Whisper output" });
      }
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3000;

app.use(cors());

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/**
 * ✅ Multer storage with file extension preserved
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".wav";
    cb(null, `audio_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

/**
 * 🎤 Transcription API
 */
app.post("/transcribe", upload.single("audio"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const audioPath = req.file.path;
    console.log("🎤 Audio received:", audioPath);

    // IMPORTANT: use Python 3.11 explicitly
    const command = `py -3.11 run_whisper.py "${audioPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Whisper execution error:", error);
        console.error("stderr:", stderr);
        return res.status(500).json({ error: "Whisper transcription failed" });
      }

      try {
        const result = JSON.parse(stdout);

        res.json({
          text: result.text,
          language: result.language,
          file: path.basename(audioPath),
        });
      } catch (parseError) {
        console.error("Failed to parse Whisper output:", stdout);
        res.status(500).json({ error: "Invalid Whisper output" });
      }
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 🚀 Start server
 */
app.listen(PORT, "192.168.0.107", () => {
  console.log(`✅ Local Whisper backend running at http://192.168.0.107:${PORT}`);
});

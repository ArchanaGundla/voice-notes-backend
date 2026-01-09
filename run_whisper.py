import os
import sys
import json

os.environ["PATH"] += os.pathsep + r"C:\ffmpeg-8.0.1-essentials_build\bin"

import whisper

# Better model for Hindi & Indian languages
model = whisper.load_model("small")

audio_path = sys.argv[1]

result = model.transcribe(
    audio_path,
    language=None,
    condition_on_previous_text=False
)

print(json.dumps({
    "text": result["text"],
    "language": result.get("language", "unknown")
}))

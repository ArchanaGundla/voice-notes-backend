FROM node:22

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

# CPU-only PyTorch (NO CUDA)
RUN pip3 install --no-cache-dir --break-system-packages \
    torch --index-url https://download.pytorch.org/whl/cpu

# Whisper
RUN pip3 install --no-cache-dir --break-system-packages openai-whisper

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

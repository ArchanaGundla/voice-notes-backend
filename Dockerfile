FROM node:22

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

# Install CPU-only PyTorch
RUN pip3 install --no-cache-dir \
    torch --index-url https://download.pytorch.org/whl/cpu

# Install Whisper
RUN pip3 install --no-cache-dir openai-whisper

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

FROM node:22

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages \
    torch \
    openai-whisper \
    numpy \
    ffmpeg-python

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

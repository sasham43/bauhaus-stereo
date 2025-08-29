// stereo.js
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';

// Enable __dirname with ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let baseColor = 'white';

// === FLOPPY FUNCTIONS ===
function getFloppyMountPoint() {
  try {
    const output = execSync('lsblk -o NAME,MOUNTPOINT -nr').toString();
    const lines = output.split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length === 2) {
        const [name, mount] = parts;
        if (name.includes('fd') || name.includes('floppy') || name.includes('sda')) {
          return mount;
        }
      }
    }
  } catch (e) {}
  return null;
}

function readFileTrimmed(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8').trim();
  } catch (e) {
    return null;
  }
}

function playAudio(filePath) {
  try {
    console.log(`\nPlaying audio: ${filePath}`);
    const player = spawn('ffplay', ['-nodisp', '-autoexit', filePath], {
      stdio: 'ignore'
    });
    player.on('exit', () => {
      console.log('Done playing.');
    });
  } catch (e) {
    console.error('Error playing audio:', e);
  }
}

function handleFloppyMode() {
  const mount = getFloppyMountPoint();
  if (!mount) {
    console.log('No floppy mounted.');
    return;
  }

  console.log(`\nFloppy mounted at ${mount}`);

  const audioData = readFileTrimmed(path.join(mount, 'audio.txt'));
  if (audioData) {
    const files = audioData.split(/\s+/);
    const randomFile = files[Math.floor(Math.random() * files.length)];
    playAudio(path.join('/home/pi/audio', randomFile));
  }

  const color = readFileTrimmed(path.join(mount, 'color.txt'));
  if (color) {
    baseColor = color;
  }
}

  
// === WEB SERVER ===
const app = express();
const PORT = 3000;

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Simple API endpoint for status
app.get('/api/status', (req, res) => {
  res.json({
    mode: currentMode,
    color: baseColor,
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Web UI available at http://localhost:${PORT}`);
});

// === START YOUR LOOP ===
function startLoop() {
  setInterval(() => {
    if (currentMode === MODE_VISUALIZER) {
      handleFloppyMode();
    }
  }, 5000);
}

// Start loop
startLoop();

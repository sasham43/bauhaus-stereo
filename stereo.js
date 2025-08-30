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

const videosDirectory = '/home/pi/holograms/output'

let baseColor = 'white';
let player;
let displayVideo;

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
    player = spawn('ffplay', ['-nodisp', '-autoexit', filePath], {
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
    if(!player){
        // playAudio(path.join('/home/pi/audio', randomFile));
    }
  }

  const color = readFileTrimmed(path.join(mount, 'color.txt'));
  console.log('color', color)
  if (color) {
    baseColor = color;
  }

  const video = getRandomVideoByColor(baseColor, videosDirectory)
  console.log('video', video)
  if(video){
    displayVideo = video;
  }
}

/**
 * Get a random video file matching the given color.
 * @param {string} color - The color prefix (e.g., 'green')
 * @param {string} videosDir - The directory where videos are stored
 * @returns {string|null} - The random video filename or null if none found
 */
function getRandomVideoByColor(color, videosDir) {
    try {
      // Read all files in the directory
      const files = fs.readdirSync(videosDir);
  
      // Filter only .mp4 files that start with the given color and a hyphen
      const matchingFiles = files.filter(file =>
        file.toLowerCase().startsWith(`${color.toLowerCase()}-`) &&
        file.toLowerCase().endsWith('.mp4')
      );
  
      if (matchingFiles.length === 0) {
        return null; // No matching video found
      }
  
      // Pick a random file
      const randomIndex = Math.floor(Math.random() * matchingFiles.length);
      return path.join(videosDir, matchingFiles[randomIndex]);
    } catch (error) {
      console.error('Error reading video directory:', error);
      return null;
    }
  }

  
// === WEB SERVER ===
const app = express();
const PORT = 3000;

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static('/home/pi/holograms/output'));


// Simple API endpoint for status
app.get('/api/status', (req, res) => {
  res.json({
    color: baseColor,
    video: displayVideo,
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Web UI available at http://localhost:${PORT}`);
});

// === START YOUR LOOP ===
function startLoop() {
  setInterval(() => {
    handleFloppyMode();    
  }, 5000);
}

// Start loop
startLoop();

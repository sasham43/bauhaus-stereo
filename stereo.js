// stereo.js
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// Enable __dirname with ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


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
    barColor = color;
    console.log(`Visualizer color set to: ${barColor}`);
  }
}

  

// === MAIN LOOP ===
function startLoop() {
  setInterval(() => {
    if (currentMode === MODE_VISUALIZER) {
      drawBars(frame);
    } else if (currentMode === MODE_FLOPPY) {
      handleFloppyMode();
      currentMode = MODE_VISUALIZER; // auto-return after one play
    } else if (currentMode === MODE_ROSE) {
      console.log('\n🌹 Rose mode (placeholder)');
    }
    frame++;
  }, 1000 / FPS);
}

console.log('Visualizer started. Press 1 (visualizer), 2 (floppy), 3 (rose), q to quit.');
startLoop();

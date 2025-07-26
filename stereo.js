// stereo.js
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Enable __dirname with ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === GLOBAL SETTINGS ===
const FPS = 10;
const NUM_BARS = 7;
const MODE_VISUALIZER = 'visualizer';
const MODE_FLOPPY = 'floppy';
const MODE_ROSE = 'rose';

let currentMode = MODE_FLOPPY;
let barColor = 'cyan';
let frame = 0;

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

// === VISUALIZER ===
function getSimulatedAmplitude(i, t) {
  const frequency = 0.05 * (i + 1);
  const base = (Math.sin(t * frequency + i * 0.5) + 1) / 2;
  const noise = Math.random() * 0.1 - 0.05;
  return Math.max(0, Math.min(1, base + noise));
}

function drawBars(t) {
  let output = `\n[${barColor}]\n`;
  for (let i = 0; i < NUM_BARS; i++) {
    const amplitude = getSimulatedAmplitude(i, t);
    const height = Math.round(amplitude * 20);
    output += '|'.repeat(height).padEnd(20, ' ') + '\n';
  }
  console.clear();
  console.log(output);
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

// === KEY HANDLING ===
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.name === '1') currentMode = MODE_VISUALIZER;
  else if (key.name === '2') currentMode = MODE_FLOPPY;
  else if (key.name === '3') currentMode = MODE_ROSE;
  else if (key.name === 'q' || key.ctrl && key.name === 'c') {
    process.exit();
  }
});

console.log('Visualizer started. Press 1 (visualizer), 2 (floppy), 3 (rose), q to quit.');
startLoop();

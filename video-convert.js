import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// ✅ Change this to your input directory
const inputDir = '/Users/sashakramer/Documents/holograms';
const outputDir = '/Users/sashakramer/Documents/holograms/output';

const supportedExtensions = ['.mov', '.avi', '.mkv', '.webm', '.gif', '.mp4'];

async function convertVideos() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const files = fs.readdirSync(inputDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!supportedExtensions.includes(ext)) {
      console.log(`Skipping unsupported file: ${file}`);
      continue;
    }

    const inputPath = path.join(inputDir, file);
    const baseName = path.basename(file, ext);
    const outputPath = path.join(outputDir, `${baseName}.mp4`);

    // Skip if already converted
    if (fs.existsSync(outputPath)) {
      console.log(`Already converted: ${file}`);
      continue;
    }

    console.log(`Converting: ${file} → ${baseName}.mp4`);

    try {
      // For GIFs, force frame rate and loop handling
      const ffmpegCommand =
        ext === '.gif'
          ? `ffmpeg -y -i "${inputPath}" -movflags +faststart -pix_fmt yuv420p "${outputPath}"`
          : `ffmpeg -y -i "${inputPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "${outputPath}"`;

      await execPromise(ffmpegCommand);
      console.log(`✅ Converted: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error converting ${file}:`, error.message);
    }
  }
}

convertVideos();

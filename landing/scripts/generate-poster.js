#!/usr/bin/env node

/**
 * Generate poster images from videos
 * Run: bun scripts/generate-poster.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function generatePoster(videoPath) {
  const videoName = path.basename(videoPath, path.extname(videoPath));
  const posterPath = path.join(path.dirname(videoPath), `${videoName}-poster.jpg`);
  
  // Check if poster already exists
  if (fs.existsSync(posterPath)) {
    console.log(`✓ Poster already exists: ${posterPath}`);
    return;
  }
  
  // Generate poster using ffmpeg (extract first frame)
  const command = `ffmpeg -i "${videoPath}" -vf "scale=1920:-1" -frames:v 1 "${posterPath}"`;
  
  try {
    console.log(`Generating poster for: ${videoName}`);
    await execAsync(command);
    console.log(`✓ Generated poster: ${posterPath}`);
  } catch (error) {
    console.error(`Error generating poster: ${error.message}`);
    console.log('Make sure ffmpeg is installed: brew install ffmpeg');
  }
}

// Generate posters for all videos in public folder
async function main() {
  const publicDir = path.resolve('public');
  const videos = fs.readdirSync(publicDir).filter(file => file.endsWith('.mp4'));
  
  console.log(`Found ${videos.length} videos`);
  
  for (const video of videos) {
    await generatePoster(path.join(publicDir, video));
  }
}

main();

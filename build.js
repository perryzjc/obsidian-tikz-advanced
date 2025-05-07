const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the output directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

try {
  // Skip TypeScript compiler check for now
  console.log('Skipping TypeScript check...');

  // Run esbuild
  console.log('Bundling with esbuild...');
  execSync('node esbuild.config.mjs production');

  // Copy files to dist
  console.log('Copying files to dist directory...');
  fs.copyFileSync('main.js', 'dist/main.js');
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
  fs.copyFileSync('styles.css', 'dist/styles.css');

  console.log('Build completed successfully!');
  console.log('Files are available in the dist directory:');
  console.log('- dist/main.js');
  console.log('- dist/manifest.json');
  console.log('- dist/styles.css');
  console.log('\nCopy these files to your Obsidian vault\'s plugins directory:');
  console.log('<vault>/.obsidian/plugins/obsidian-tikz-advanced/');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

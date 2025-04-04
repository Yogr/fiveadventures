const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('\x1b[33m%s\x1b[0m', '.env.local not found.');
    process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\x1b[33m%s\x1b[0m', 'node_modules not found. Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('\x1b[32m%s\x1b[0m', 'Dependencies installed successfully!');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Display welcome message
console.log('\x1b[36m%s\x1b[0m', `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                     FIVE ADVENTURES                           ║
║                                                               ║
║  A daily RPG adventure game with a pixelated art style        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

console.log('\x1b[36m%s\x1b[0m', 'Starting development server...');
console.log('\x1b[36m%s\x1b[0m', 'Once started, you can access the game at: http://localhost:3000');
console.log('\x1b[36m%s\x1b[0m', '--------------------------------------------------------------');

// Start the development server
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', 'Failed to start development server:', error.message);
  process.exit(1);
}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing dependencies for seed-data.js script...');

// Check if dotenv is installed
try {
  require.resolve('dotenv');
  console.log('✅ dotenv is already installed');
} catch (e) {
  console.log('Installing dotenv...');
  execSync('npm install dotenv', { stdio: 'inherit' });
}

// Check if uuid is installed
try {
  require.resolve('uuid');
  console.log('✅ uuid is already installed');
} catch (e) {
  console.log('Installing uuid...');
  execSync('npm install uuid', { stdio: 'inherit' });
}

// Check if @supabase/supabase-js is installed
try {
  require.resolve('@supabase/supabase-js');
  console.log('✅ @supabase/supabase-js is already installed');
} catch (e) {
  console.log('Installing @supabase/supabase-js...');
  execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
}

// Check if glob is installed
try {
  require.resolve('glob');
  console.log('✅ glob is already installed');
} catch (e) {
  console.log('Installing glob...');
  execSync('npm install glob', { stdio: 'inherit' });
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory...');
  fs.mkdirSync(dataDir);
}

console.log('\nAll dependencies installed successfully!');
console.log('\nYou can now run the seed scripts:');
console.log('  npm run seed:items');
console.log('  npm run seed:adventures');
console.log('  npm run seed:worldboss');
console.log('  npm run seed:all');

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Money Tracker servers...\n');

// Start the API server
console.log('Starting API server...');
const apiServer = spawn('node', ['api/simple-server.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Start the React development server
console.log('Starting React development server on port 3000...');
const reactServer = spawn('npm', ['start'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  apiServer.kill();
  reactServer.kill();
  process.exit();
});

apiServer.on('close', (code) => {
  console.log(`API server exited with code ${code}`);
});

reactServer.on('close', (code) => {
  console.log(`React server exited with code ${code}`);
});

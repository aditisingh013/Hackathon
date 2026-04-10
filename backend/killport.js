/**
 * killport.js
 * Kills whatever process is holding PORT (default 5000) before the server starts.
 * Works cross-platform. Called automatically via the "dev" npm script.
 */
const { execSync } = require('child_process');

const PORT = process.env.PORT || 5000;

try {
  if (process.platform === 'win32') {
    // Find PID using netstat, then kill it
    const result = execSync(
      `netstat -ano | findstr :${PORT}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const lines = result.trim().split('\n');
    const pids = new Set();
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      // Only kill LISTENING or lines matching the exact local port
      if (pid && !isNaN(pid) && line.includes(`:${PORT} `)) {
        pids.add(pid);
      }
    });
    pids.forEach(pid => {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`🔪 Killed stale process on port ${PORT} (PID: ${pid})`);
      } catch (_) {}
    });
  } else {
    // macOS / Linux
    execSync(`lsof -ti tcp:${PORT} | xargs kill -9`, { stdio: 'ignore' });
    console.log(`🔪 Killed stale process on port ${PORT}`);
  }
} catch (_) {
  // No process was on the port — nothing to do
}

console.log(`✅ Port ${PORT} is free. Starting server...\n`);

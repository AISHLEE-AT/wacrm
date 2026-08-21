/**
 * TeachO Daily Sync Launcher & Background Process Guard
 * 
 * Automatically detects the next ungenerated day across all 86 courses,
 * spawns the generator in the background if not already active,
 * and maintains continuous, non-blocking generation across the entire curriculum.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SCRIPT_PATH = 'D:/w/scripts/automate_day_wise_content_generation.js';
const LOG_FILE = 'D:/w/scripts/teacho_daily_sync.log';
const LOCK_FILE = 'D:/w/scripts/teacho_sync.lock';

function isProcessRunning() {
  if (!fs.existsSync(LOCK_FILE)) return false;
  try {
    const pid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8').trim(), 10);
    if (!pid || isNaN(pid)) return false;
    process.kill(pid, 0); // test if PID exists
    return true;
  } catch (e) {
    return false;
  }
}

function launchBackgroundSync(dayStart = 1, dayEnd = 200) {
  if (isProcessRunning()) {
    console.log('⚡ TeachO Day-Wise Content Sync is already actively running in the background.');
    return;
  }

  const outStream = fs.openSync(LOG_FILE, 'a');
  const errStream = fs.openSync(LOG_FILE, 'a');

  const child = spawn('node', [SCRIPT_PATH, '--day-start', dayStart.toString(), '--day-end', dayEnd.toString()], {
    detached: true,
    stdio: ['ignore', outStream, errStream],
    cwd: 'D:/w'
  });

  child.unref();
  fs.writeFileSync(LOCK_FILE, child.pid.toString(), 'utf8');

  console.log(`🚀 TeachO Day-Wise Content Sync launched in background (PID: ${child.pid}).`);
  console.log(`📄 Live progress log: ${LOG_FILE}`);
}

launchBackgroundSync();

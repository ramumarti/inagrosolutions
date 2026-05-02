/**
 * Cleanup script to remove ghost route directories
 * that Vercel's build cache keeps restoring.
 * 
 * These directories cause "two parallel pages that resolve 
 * to the same path" errors in Next.js.
 */
const fs = require('fs');
const path = require('path');

const ghostDirs = [
  // Old cuaderno/planes directories that conflict with (protected)/cuaderno/
  path.join(__dirname, 'src', 'app', 'cuaderno'),
];

for (const dir of ghostDirs) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log('[CLEANUP] DELETED ghost route:', dir);
    } else {
      console.log('[CLEANUP] Not found (OK):', dir);
    }
  } catch (e) {
    console.error('[CLEANUP] Error deleting:', dir, e.message);
  }
}

console.log('[CLEANUP] Done. Proceeding to build...');

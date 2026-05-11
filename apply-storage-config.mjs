/**
 * apply-storage-config.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-shot script that:
 *  1. Deploys Storage Security Rules  (storage.rules → Firebase Console)
 *  2. Applies the CORS policy         (cors.json     → GCS bucket)
 *
 * Run ONCE after `npx firebase login`:
 *   node apply-storage-config.mjs
 *
 * Requires firebase-tools to be installed (already in devDependencies).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { execSync } from 'child_process';
import { existsSync }  from 'fs';
import path            from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const firebase  = path.join(__dirname, 'node_modules', '.bin', 'firebase');
const gsutil    = 'gsutil'; // must be on PATH if using Option B below

const BUCKET    = 'skillswap-4c63e.firebasestorage.app';
const CORS_FILE = path.join(__dirname, 'cors.json');
const RULES_FILE= path.join(__dirname, 'storage.rules');

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  console.log(`  $ ${cmd}`);
  try {
    const out = execSync(cmd, { cwd: __dirname, stdio: 'pipe', encoding: 'utf8' });
    if (out.trim()) console.log(' ', out.trim().split('\n').join('\n  '));
    console.log(`  ✅ Done`);
  } catch (err) {
    console.error(`  ❌ Failed: ${err.stderr || err.message}`);
    process.exit(1);
  }
}

console.log('═══════════════════════════════════════════════════════');
console.log(' SkillSwap — Firebase Storage Configuration Deployer  ');
console.log('═══════════════════════════════════════════════════════');

// ── Step 1: Deploy Storage Rules via Firebase CLI ──────────────────────────
if (!existsSync(RULES_FILE)) {
  console.error(`❌ ${RULES_FILE} not found.`); process.exit(1);
}
run(
  `"${firebase}" deploy --only storage --project skillswap-4c63e`,
  'Deploying Firebase Storage Security Rules…'
);

// ── Step 2: Apply CORS via gsutil (Google Cloud SDK) ──────────────────────
// If gsutil is not installed, skip and print manual instructions.
if (!existsSync(CORS_FILE)) {
  console.error(`❌ ${CORS_FILE} not found.`); process.exit(1);
}

try {
  execSync('gsutil version', { stdio: 'pipe' });
  // gsutil is available → apply CORS
  run(
    `gsutil cors set "${CORS_FILE}" gs://${BUCKET}`,
    `Applying CORS policy to gs://${BUCKET}…`
  );
  run(
    `gsutil cors get gs://${BUCKET}`,
    'Verifying applied CORS…'
  );
} catch {
  // gsutil not on PATH → print manual instructions
  console.log('\n⚠️  gsutil not found — CORS must be applied manually.\n');
  console.log('   Open Google Cloud Console:');
  console.log(`   https://console.cloud.google.com/storage/browser/${BUCKET}?project=skillswap-4c63e`);
  console.log('');
  console.log('   Steps:');
  console.log('   1. Click the bucket name');
  console.log('   2. Go to the "Configuration" tab');
  console.log('   3. Click "Edit" next to "Cross-origin resource sharing (CORS)"');
  console.log('   4. Paste the contents of cors.json and save.');
  console.log('');
  console.log('   Or install the Google Cloud SDK and re-run this script:');
  console.log('   https://cloud.google.com/sdk/docs/install');
}

console.log('\n✅ Storage configuration complete.');
console.log('   Refresh your browser (Ctrl+Shift+R) to clear CORS preflight cache.\n');

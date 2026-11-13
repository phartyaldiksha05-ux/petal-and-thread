/**
 * Petal & Thread - Safe Interactive Local Admin Password Reset
 *
 * Updates only `passwordHash` for an existing administrator in
 * `server/data/store.json`, preserving all other admin fields and store data.
 *
 * Usage:
 *   node server/scripts/resetAdminPassword.js [username-or-email]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../data/store.json');

const MIN_PASSWORD_LENGTH = 8;
const DISALLOWED_PASSWORDS = new Set([
  'admin123',
  'admin',
  'password',
  'changeme',
  'your_admin_password',
  'replace_with_strong_local_password'
]);

/**
 * Reads a single password line from an interactive TTY without echoing input.
 */
function promptHidden(promptLabel) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;

    if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      reject(new Error('Interactive TTY terminal is required for hidden password input.'));
      return;
    }

    stdout.write(promptLabel);

    let buffer = '';
    const wasRaw = Boolean(stdin.isRaw);

    const cleanup = () => {
      stdin.removeListener('data', onData);
      if (typeof stdin.setRawMode === 'function') {
        stdin.setRawMode(wasRaw);
      }
      stdin.pause();
    };

    const onData = (chunk) => {
      const text = chunk.toString('utf8');

      for (const ch of text) {
        if (ch === '\u0003') {
          // Ctrl+C
          cleanup();
          stdout.write('\n');
          reject(new Error('Password reset cancelled by user.'));
          return;
        }

        if (ch === '\r' || ch === '\n') {
          cleanup();
          stdout.write('\n');
          resolve(buffer);
          return;
        }

        if (ch === '\u007f' || ch === '\b') {
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
          }
          continue;
        }

        // Ignore other ASCII control characters
        if (ch.charCodeAt(0) < 32) {
          continue;
        }

        buffer += ch;
      }
    };

    stdin.setEncoding('utf8');
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}

function selectTargetAdmin(admins, requestedIdentifier) {
  if (requestedIdentifier) {
    const needle = requestedIdentifier.trim().toLowerCase();
    const matched = admins.find(
      (admin) =>
        (admin.username && admin.username.toLowerCase() === needle) ||
        (admin.email && admin.email.toLowerCase() === needle)
    );

    if (!matched) {
      throw new Error(`No local admin found matching "${requestedIdentifier}".`);
    }
    return matched;
  }

  if (admins.length === 1) {
    return admins[0];
  }

  const labels = admins
    .map((a) => `${a.username || '(no-username)'} <${a.email || 'no-email'}>`)
    .join(', ');
  throw new Error(
    `Multiple local admins exist (${labels}). Pass the target username or email: node server/scripts/resetAdminPassword.js <username-or-email>`
  );
}

function writeStoreAtomically(data) {
  const tempPath = `${DB_PATH}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

async function resetAdminPassword() {
  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Error: Local store file not found at server/data/store.json.');
    console.error('Nothing was modified. Start the server with ADMIN_BOOTSTRAP_* env vars to create an initial admin.');
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (error) {
    console.error('❌ Error: Could not parse server/data/store.json:', error.message);
    console.error('Nothing was modified.');
    process.exit(1);
  }

  const admins = Array.isArray(data?.admins) ? data.admins : [];
  if (admins.length === 0) {
    console.error('❌ Error: No existing admin accounts found in server/data/store.json.');
    console.error('Nothing was modified.');
    process.exit(1);
  }

  let targetAdmin;
  try {
    targetAdmin = selectTargetAdmin(admins, process.argv[2]);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  console.log(`🔒 Rotating local password for admin "${targetAdmin.username}" (${targetAdmin.email || targetAdmin.id}).`);
  console.log(`Password must be at least ${MIN_PASSWORD_LENGTH} characters and must not reuse a default or placeholder value.\n`);

  let newPassword;
  let confirmPassword;
  try {
    newPassword = await promptHidden('Enter new admin password: ');
    confirmPassword = await promptHidden('Confirm new admin password: ');
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    console.error(`❌ Password must be at least ${MIN_PASSWORD_LENGTH} characters. No changes written.`);
    process.exit(1);
  }

  if (DISALLOWED_PASSWORDS.has(newPassword.trim().toLowerCase())) {
    console.error('❌ Chosen password uses a known default or placeholder value. No changes written.');
    process.exit(1);
  }

  if (newPassword !== confirmPassword) {
    console.error('❌ Password confirmation did not match. No changes written.');
    process.exit(1);
  }

  if (targetAdmin.passwordHash && bcrypt.compareSync(newPassword, targetAdmin.passwordHash)) {
    console.error('❌ New password matches the existing password. Choose a different password. No changes written.');
    process.exit(1);
  }

  targetAdmin.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeStoreAtomically(data);

  console.log(`\n✔ Updated passwordHash for "${targetAdmin.username}" atomically in server/data/store.json.`);
  console.log('All other admin fields and store collections were preserved.');
}

resetAdminPassword().catch((error) => {
  console.error('❌ Unexpected error while resetting admin password:', error.message);
  process.exit(1);
});

// File: scripts/dev/reset-testnet.js
// Responsibility: Resets local simulation artifacts for repeatable testing.
// Security: Operates only on local development data paths.

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const dataRoot = path.resolve(process.cwd(), '.cryptodesk-ai');
const databasePath = path.join(dataRoot, 'data', 'cryptodesk.db');

if (fs.existsSync(databasePath)) {
  fs.rmSync(databasePath, { force: true });
}

process.stdout.write(`Reset local test database at ${databasePath}\n`);

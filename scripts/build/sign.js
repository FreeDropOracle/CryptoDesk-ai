// File: scripts/build/sign.js
// Responsibility: Post-pack signing hook placeholder for electron-builder.
// Security: Keeps signing behavior explicit and environment-driven.

'use strict';

exports.default = async function sign(context) {
  if (context.electronPlatformName === 'win32') {
    process.stdout.write('Skipping custom Windows signing hook.\n');
  }

  if (context.electronPlatformName === 'darwin') {
    process.stdout.write('macOS package prepared for notarization.\n');
  }
};

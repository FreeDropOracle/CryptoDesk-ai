// File: scripts/build/notarize.js
// Responsibility: Post-sign notarization hook placeholder for electron-builder.
// Security: Avoids implicit notarization behavior when credentials are absent.

'use strict';

exports.default = async function notarize(context) {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  if (process.env.APPLE_ID === undefined || process.env.APPLE_APP_SPECIFIC_PASSWORD === undefined) {
    process.stdout.write('Skipping notarization because Apple credentials are not configured.\n');
    return;
  }

  // TODO: Integrate @electron/notarize when release credentials and CI secrets are available.
  process.stdout.write('Notarization credentials detected. Integrate @electron/notarize next.\n');
};

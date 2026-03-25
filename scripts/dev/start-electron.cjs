'use strict';

const path = require('node:path');
const { spawn } = require('node:child_process');
const waitOn = require('wait-on');

const projectRoot = path.resolve(__dirname, '..', '..');
const electronBinary = require('electron');
const rendererDevUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';

const launch = async () => {
  await waitOn({
    resources: [
      `http-get://${new URL(rendererDevUrl).host}`,
      path.join(projectRoot, 'dist', 'main', 'main.js'),
      path.join(projectRoot, 'dist', 'preload', 'index.js')
    ],
    delay: 250,
    interval: 500,
    timeout: 120000
  });

  process.stdout.write(`Electron dev runtime starting with renderer ${rendererDevUrl}\n`);

  const child = spawn(electronBinary, ['.'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: (() => {
      const electronEnv = {
      ...process.env,
      APP_ENV: 'development',
      VITE_DEV_SERVER_URL: rendererDevUrl,
      ELECTRON_ENABLE_LOGGING: process.env.ELECTRON_ENABLE_LOGGING ?? '1',
      ELECTRON_ENABLE_STACK_DUMPING: process.env.ELECTRON_ENABLE_STACK_DUMPING ?? '1'
      };

      delete electronEnv.ELECTRON_RUN_AS_NODE;
      return electronEnv;
    })()
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));
  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
};

void launch().catch((error) => {
  process.stderr.write(
    `Failed to launch Electron development runtime: ${
      error instanceof Error ? error.message : 'Unknown error'
    }\n`
  );
  process.exit(1);
});

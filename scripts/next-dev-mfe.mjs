#!/usr/bin/env node
import { execFileSync, execSync, spawn } from 'node:child_process';

// Starts a Next.js app on the port assigned to it in microfrontends.json.
// This Node wrapper replaces Bash-only command substitution so `pnpm dev`
// behaves consistently on Windows, macOS, and Linux.
const IS_WINDOWS = process.platform === 'win32';

function getMicrofrontendPort() {
  const output = IS_WINDOWS
    ? execSync('turbo.cmd get-mfe-port', { encoding: 'utf-8' })
    : execFileSync('turbo', ['get-mfe-port'], { encoding: 'utf-8' });
  const port = output.trim();

  if (!/^\d+$/.test(port)) {
    throw new Error(`Turborepo returned an invalid microfrontend port: "${port}"`);
  }

  return port;
}

function startNextDevServer(port) {
  // Windows resolves .cmd executables through a shell. A command string is used
  // here to avoid Node's DEP0190 warning for argument arrays with `shell: true`.
  if (IS_WINDOWS) {
    return spawn(`next.cmd dev --port ${port}`, {
      shell: true,
      stdio: 'inherit',
    });
  }

  return spawn('next', ['dev', '--port', port], { stdio: 'inherit' });
}

const port = getMicrofrontendPort();
const nextDevServer = startNextDevServer(port);

nextDevServer.on('error', (error) => {
  console.error('Unable to start the Next.js development server.', error);
  process.exit(1);
});

nextDevServer.on('exit', (code) => {
  process.exit(code ?? 0);
});

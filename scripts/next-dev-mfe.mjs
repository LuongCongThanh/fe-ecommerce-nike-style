#!/usr/bin/env node
// Cross-platform stand-in for the shell snippet the Turborepo microfrontends guide shows
// (`next dev --port $(turbo get-mfe-port)`) — that syntax is bash-only and breaks on the
// PowerShell/cmd shells `pnpm run` uses by default on Windows. `turbo get-mfe-port` itself is
// the Node-based turbo CLI, so it works everywhere; only the shell substitution needed replacing.
import { execFileSync, execSync, spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const turboBin = isWindows ? 'turbo.cmd' : 'turbo';

// Same DEP0190 avoidance as the `next dev` spawn below: no array args under `shell: true` on Windows.
const port = (
  isWindows ? execSync(`${turboBin} get-mfe-port`, { encoding: 'utf-8' }) : execFileSync(turboBin, ['get-mfe-port'], { encoding: 'utf-8' })
).trim();

const nextBin = isWindows ? 'next.cmd' : 'next';
// `shell: true` + an args array is flagged by Node as unescaped-argument-injection risk (DEP0190);
// this repo's args are fixed and never user input, but building one string sidesteps the warning.
const child = isWindows
  ? spawn(`${nextBin} dev --port ${port}`, { stdio: 'inherit', shell: true })
  : spawn(nextBin, ['dev', '--port', port], { stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

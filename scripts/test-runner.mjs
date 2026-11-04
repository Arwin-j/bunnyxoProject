#!/usr/bin/env node
/**
 * scripts/test-runner.mjs
 *
 * Standalone, sandbox-resilient test runner for Bunny Hub.
 * Uses pure Node.js child_process.spawn with process.execPath to avoid
 * macOS sandbox shebang resolution errors ('env: node: Operation not permitted').
 *
 * Supported flags:
 *   --contexts          Run only context, hook, and consuming component tests
 *   --watch             Run tests in interactive watch mode
 *   --coverage          Collect code coverage metrics
 *   --filter <pattern>  Filter tests matching a file or test name pattern
 *   --bail              Stop execution immediately on first test failure
 *   -h, --help          Display usage and option documentation
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Locate Vitest entrypoint in node_modules
function findVitestBin(root) {
  const candidates = [
    path.join(root, 'node_modules', 'vitest', 'vitest.mjs'),
    path.join(root, 'node_modules', '.bin', 'vitest'),
    path.join(root, 'node_modules', 'vitest', 'bin', 'vitest.js'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Attempt ESM resolve if file exists
  try {
    const resolved = import.meta.resolve('vitest/cli');
    if (resolved && resolved.startsWith('file://')) {
      const p = fileURLToPath(resolved);
      if (fs.existsSync(p)) return p;
    }
  } catch {}

  return null;
}

function printHelp() {
  console.log(`
Bunny Hub Test Suite Runner

Usage:
  node ./scripts/test-runner.mjs [options] [-- <vitest-options>]

Options:
  --contexts          Execute context providers, custom hooks, and consuming component tests
  --watch             Run tests in interactive watch mode (default: single-run 'run' mode)
  --coverage          Collect and report code test coverage
  -f, --filter <pat>  Filter test files or test names matching <pattern>
  -b, --bail          Stop running tests upon the first failure
  -h, --help          Show this help message

Examples:
  node ./scripts/test-runner.mjs
  node ./scripts/test-runner.mjs --contexts
  node ./scripts/test-runner.mjs --coverage
  node ./scripts/test-runner.mjs --filter AuthContext
  node ./scripts/test-runner.mjs --bail
`);
}

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const options = {
    contexts: false,
    watch: false,
    coverage: false,
    bail: false,
    filter: null,
    help: false,
    passthrough: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--contexts') {
      options.contexts = true;
    } else if (arg === '--watch') {
      options.watch = true;
    } else if (arg === '--coverage') {
      options.coverage = true;
    } else if (arg === '--bail' || arg === '-b') {
      options.bail = true;
    } else if (arg === '--filter' || arg === '-f') {
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options.filter = args[++i];
      }
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.slice('--filter='.length);
    } else if (arg === '--') {
      options.passthrough.push(...args.slice(i + 1));
      break;
    } else {
      options.passthrough.push(arg);
    }
  }

  return options;
}

function setupSignalHandlers(child) {
  const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  for (const sig of signals) {
    process.on(sig, () => {
      if (!child.killed) {
        try {
          child.kill(sig);
        } catch {}
      }
    });
  }
}

function main() {
  const options = parseCliArgs(process.argv);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  // Prepend process.execPath directory to PATH for sandbox resilience
  const nodeBinDir = path.dirname(process.execPath);
  const sanitizedEnv = {
    ...process.env,
    PATH: `${nodeBinDir}:${process.env.PATH || ''}`,
    NODE_ENV: 'test',
  };

  // If --contexts is specified, delegate to scripts/test-contexts.mjs
  if (options.contexts) {
    const contextsScript = path.join(projectRoot, 'scripts', 'test-contexts.mjs');
    if (fs.existsSync(contextsScript)) {
      const forwardedArgs = process.argv
        .slice(2)
        .filter((arg) => arg !== '--contexts');

      const child = spawn(process.execPath, [contextsScript, ...forwardedArgs], {
        stdio: 'inherit',
        env: sanitizedEnv,
        cwd: projectRoot,
      });

      setupSignalHandlers(child);

      child.on('close', (code, signal) => {
        if (signal) {
          process.removeAllListeners(signal);
          process.kill(process.pid, signal);
        } else {
          process.exit(code ?? 1);
        }
      });
      return;
    }
  }

  const vitestBin = findVitestBin(projectRoot);
  if (!vitestBin) {
    console.error('\x1b[31m[test-runner] Error: Vitest binary not found in node_modules.\x1b[0m');
    console.error('Please install testing dependencies:');
    console.error('  npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event\n');
    process.exit(1);
  }

  const vitestArgs = [];

  if (options.watch) {
    vitestArgs.push('watch');
  } else {
    vitestArgs.push('run');
  }

  if (options.coverage) {
    vitestArgs.push('--coverage');
  }

  if (options.bail) {
    vitestArgs.push('--bail', '1');
  }

  if (options.filter) {
    vitestArgs.push(options.filter);
  }

  if (options.passthrough.length > 0) {
    vitestArgs.push(...options.passthrough);
  }

  const child = spawn(process.execPath, [vitestBin, ...vitestArgs], {
    stdio: 'inherit',
    env: sanitizedEnv,
    cwd: projectRoot,
  });

  setupSignalHandlers(child);

  child.on('close', (code, signal) => {
    if (signal) {
      process.removeAllListeners(signal);
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 1);
    }
  });

  child.on('error', (err) => {
    console.error('\x1b[31m[test-runner] Failed to launch test runner process:\x1b[0m', err);
    process.exit(1);
  });
}

main();

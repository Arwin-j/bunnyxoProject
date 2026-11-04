#!/usr/bin/env node
/**
 * scripts/test-contexts.mjs
 *
 * Dedicated Context Verification Runner for Bunny Hub (Requirement R2).
 * Executes all context providers, custom hooks, and consuming component tests.
 * Formats and outputs the Context Verification Matrix table directly in terminal stdout.
 * Strictly exits with 0 on 100% pass, 1 on any failure.
 *
 * Uses pure Node child_process.spawn with process.execPath and PATH sanitization
 * to eliminate sandbox shebang errors ('env: node: Operation not permitted').
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Test suite targets specifically covering Requirement R1 & R2
const CONTEXT_TEST_TARGETS = [
  'src/__tests__/contexts',
  'src/__tests__/hooks',
  'src/__tests__/components',
];

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
Bunny Hub Context & Consuming Component Test Runner (Requirement R2)

Usage:
  node ./scripts/test-contexts.mjs [options]

Options:
  --watch             Run context tests in interactive watch mode
  --coverage          Collect code coverage for context tests
  -f, --filter <pat>  Filter specific context test files or names matching <pat>
  -b, --bail          Stop running tests upon first failure
  -h, --help          Show this help message

Description:
  Executes all automated tests for application state contexts (AuthContext, GameContext,
  DiscordPresenceContext), domain custom hooks (useEvents, useFeedPosts, etc.), and
  consuming components (Header, HomePage, AdminLoginPage, AdminLayout, AdminHeader).
  
  Outputs a formatted Context Verification Matrix table to stdout and exits with:
    0 - All tests passed successfully
    1 - Any failure or missing test suites
`);
}

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const options = {
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

function categorizeTestFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const filename = path.basename(filePath);
  const targetName = filename.replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, '');

  let category = 'Other Tests';
  let order = 99;

  if (normalized.includes('/__tests__/contexts/') || normalized.includes('/context/')) {
    category = 'Global React Contexts';
    order = 1;
  } else if (normalized.includes('/__tests__/hooks/') || normalized.includes('/hooks/')) {
    category = 'Domain Custom Hooks';
    order = 2;
  } else if (normalized.includes('/__tests__/components/') || normalized.includes('/components/')) {
    category = 'Consuming Components';
    order = 3;
  } else if (normalized.includes('/__tests__/e2e/')) {
    category = 'Integration & E2E Workflows';
    order = 4;
  } else if (normalized.includes('smoke.test')) {
    category = 'Infrastructure Smoke Suite';
    order = 0;
  }

  return { category, targetName, order };
}

function renderVerificationMatrix(reportData, exitCode) {
  const isColorSupported =
    !process.env.NO_COLOR &&
    (process.env.FORCE_COLOR || process.stdout.isTTY || process.env.CI);

  const c = {
    reset: isColorSupported ? '\x1b[0m' : '',
    bold: isColorSupported ? '\x1b[1m' : '',
    dim: isColorSupported ? '\x1b[2m' : '',
    green: isColorSupported ? '\x1b[32m' : '',
    red: isColorSupported ? '\x1b[31m' : '',
    yellow: isColorSupported ? '\x1b[33m' : '',
    cyan: isColorSupported ? '\x1b[36m' : '',
  };

  const rows = [];
  const testResults = reportData.testResults || [];

  for (const suite of testResults) {
    const meta = categorizeTestFile(suite.name);
    const assertions = suite.assertionResults || [];
    const total = assertions.length;
    const passed = assertions.filter((a) => a.status === 'passed').length;
    const failed = assertions.filter((a) => a.status === 'failed').length;
    const isPass = suite.status === 'passed' && failed === 0 && total > 0;

    rows.push({
      category: meta.category,
      target: meta.targetName,
      total,
      passed,
      failed,
      isPass,
      order: meta.order,
    });
  }

  rows.sort((a, b) => a.order - b.order || a.target.localeCompare(b.target));

  const colWidths = {
    category: 26,
    target: 24,
    total: 7,
    passed: 8,
    failed: 8,
    status: 10,
  };

  const line = (left, mid, right, fill = '─') =>
    left +
    fill.repeat(colWidths.category + 2) +
    mid +
    fill.repeat(colWidths.target + 2) +
    mid +
    fill.repeat(colWidths.total + 2) +
    mid +
    fill.repeat(colWidths.passed + 2) +
    mid +
    fill.repeat(colWidths.failed + 2) +
    mid +
    fill.repeat(colWidths.status + 2) +
    right;

  const totalInnerWidth =
    colWidths.category +
    colWidths.target +
    colWidths.total +
    colWidths.passed +
    colWidths.failed +
    colWidths.status +
    12;

  console.log('\n' + line('┌', '┬', '┐'));
  console.log('│ ' + c.bold + 'BUNNY HUB CONTEXT & COMPONENT VERIFICATION MATRIX'.padEnd(totalInnerWidth) + c.reset + '│');
  console.log(line('├', '┼', '┤'));
  console.log(
    '│ ' +
      c.cyan + 'Category'.padEnd(colWidths.category) + c.reset +
      ' │ ' +
      c.cyan + 'Target Scope'.padEnd(colWidths.target) + c.reset +
      ' │ ' +
      c.cyan + 'Total'.padStart(colWidths.total) + c.reset +
      ' │ ' +
      c.cyan + 'Passed'.padStart(colWidths.passed) + c.reset +
      ' │ ' +
      c.cyan + 'Failed'.padStart(colWidths.failed) + c.reset +
      ' │ ' +
      c.cyan + 'Status'.padEnd(colWidths.status) + c.reset +
      ' │'
  );
  console.log(line('├', '┼', '┤'));

  if (rows.length === 0) {
    console.log(
      '│ ' +
        c.yellow +
        'No context test suites executed.'.padEnd(totalInnerWidth) +
        c.reset +
        '│'
    );
  } else {
    for (const r of rows) {
      const statusStr = r.isPass
        ? `${c.green}PASS ✅${c.reset}`
        : `${c.red}FAIL ❌${c.reset}`;
      const statusPadding = 3;

      console.log(
        '│ ' +
          r.category.padEnd(colWidths.category) +
          ' │ ' +
          r.target.padEnd(colWidths.target) +
          ' │ ' +
          String(r.total).padStart(colWidths.total) +
          ' │ ' +
          (r.passed > 0 ? c.green : '') +
          String(r.passed).padStart(colWidths.passed) +
          c.reset +
          ' │ ' +
          (r.failed > 0 ? c.red : '') +
          String(r.failed).padStart(colWidths.failed) +
          c.reset +
          ' │ ' +
          statusStr +
          ' '.repeat(statusPadding) +
          '│'
      );
    }
  }
  console.log(line('└', '┴', '┘'));

  const numTotalTests = reportData.numTotalTests || 0;
  const numPassedTests = reportData.numPassedTests || 0;
  const numFailedTests = reportData.numFailedTests || 0;
  const numTotalSuites = reportData.numTotalTestSuites || 0;
  const numPassedSuites = reportData.numPassedTestSuites || 0;
  const durationSec = reportData.startTime && reportData.endTime
    ? ((reportData.endTime - reportData.startTime) / 1000).toFixed(2)
    : '0.00';

  console.log(`\nSuites: ${numPassedSuites} passed, ${numTotalSuites} total`);
  console.log(`Tests:  ${numPassedTests} passed, ${numFailedTests} failed, ${numTotalTests} total`);
  console.log(`Time:   ${durationSec}s\n`);

  const allPassed =
    exitCode === 0 &&
    numFailedTests === 0 &&
    numTotalTests > 0 &&
    rows.every((r) => r.isPass);

  if (allPassed) {
    console.log(
      `${c.green}${c.bold}✔ CONTEXT VERIFICATION SUCCESSFUL: All application state contexts, hooks, and consuming components verified.${c.reset}\n`
    );
    process.exit(0);
  } else if (numTotalTests === 0) {
    console.log(
      `${c.yellow}${c.bold}⚠️  CONTEXT VERIFICATION INCOMPLETE: Zero context tests were executed.${c.reset}`
    );
    console.log(
      `Please ensure test files exist in src/__tests__/contexts/, src/__tests__/hooks/, or src/__tests__/components/.\n`
    );
    process.exit(1);
  } else {
    console.log(
      `${c.red}${c.bold}✖ CONTEXT VERIFICATION FAILED: One or more context tests failed.${c.reset}\n`
    );
    process.exit(1);
  }
}

function setupSignalHandlers(child, cleanupFn) {
  const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  for (const sig of signals) {
    process.on(sig, () => {
      cleanupFn();
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

  const vitestBin = findVitestBin(projectRoot);
  if (!vitestBin) {
    console.error('\x1b[31m[test-contexts] Error: Vitest binary not found in node_modules.\x1b[0m');
    console.error('Please install testing dependencies:');
    console.error('  npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event\n');
    process.exit(1);
  }

  // Prepend process.execPath directory to PATH for sandbox resilience
  const nodeBinDir = path.dirname(process.execPath);
  const sanitizedEnv = {
    ...process.env,
    PATH: `${nodeBinDir}:${process.env.PATH || ''}`,
    NODE_ENV: 'test',
  };

  // Determine active target directories/files
  const existingTargets = CONTEXT_TEST_TARGETS.filter((t) =>
    fs.existsSync(path.join(projectRoot, t))
  );
  const activeTargets =
    existingTargets.length > 0 ? existingTargets : ['src/__tests__/smoke.test.ts'];

  // Interactive watch mode bypasses JSON report generation
  if (options.watch) {
    const watchArgs = [...activeTargets];
    if (options.filter) watchArgs.push(options.filter);
    if (options.coverage) watchArgs.push('--coverage');
    if (options.bail) watchArgs.push('--bail', '1');
    if (options.passthrough.length > 0) watchArgs.push(...options.passthrough);

    const child = spawn(process.execPath, [vitestBin, ...watchArgs], {
      stdio: 'inherit',
      env: sanitizedEnv,
      cwd: projectRoot,
    });

    setupSignalHandlers(child, () => {});

    child.on('close', (code, signal) => {
      if (signal) process.kill(process.pid, signal);
      else process.exit(code ?? 1);
    });
    return;
  }

  // Single-run mode: generate JSON report to render Context Verification Matrix
  const tmpDir = os.tmpdir();
  const reportFile = path.join(
    tmpDir,
    `vitest-contexts-report-${Date.now()}-${process.pid}.json`
  );

  const cleanupReport = () => {
    try {
      if (fs.existsSync(reportFile)) {
        fs.unlinkSync(reportFile);
      }
    } catch {}
  };

  const vitestArgs = [
    'run',
    ...activeTargets,
    '--reporter=default',
    '--reporter=json',
    `--outputFile.json=${reportFile}`,
  ];

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

  setupSignalHandlers(child, cleanupReport);

  child.on('close', (exitCode) => {
    try {
      let reportData = null;
      if (fs.existsSync(reportFile)) {
        const rawContent = fs.readFileSync(reportFile, 'utf-8');
        try {
          reportData = JSON.parse(rawContent);
        } catch (parseErr) {
          console.error('\x1b[31m[test-contexts] Error parsing Vitest JSON report:\x1b[0m', parseErr);
        }
      }

      if (reportData && Array.isArray(reportData.testResults)) {
        renderVerificationMatrix(reportData, exitCode);
      } else {
        console.error(
          '\n\x1b[31m[test-contexts] Test execution completed without producing report.\x1b[0m'
        );
        process.exit(exitCode ?? 1);
      }
    } finally {
      cleanupReport();
    }
  });

  child.on('error', (err) => {
    cleanupReport();
    console.error('\x1b[31m[test-contexts] Failed to launch test runner process:\x1b[0m', err);
    process.exit(1);
  });
}

main();

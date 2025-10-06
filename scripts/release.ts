#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import semver from 'semver';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const { values } = parseArgs({
  options: {
    version: { type: 'string' },
    type: { type: 'string' },
    publish: { type: 'boolean', default: false },
    dryRun: { type: 'boolean', default: false },
  },
});

const dryRun = values.dryRun ?? false;

const run = (command: string, options: { stdio?: 'inherit' | 'pipe' } = { stdio: 'inherit' }) => {
  const stdio = options.stdio ?? 'inherit';
  if (dryRun) {
    console.log(`[dry-run] ${command}`);
    return '';
  }
  return execSync(command, { cwd: projectRoot, stdio })?.toString() ?? '';
};

const runCapture = (command: string) => {
  return execSync(command, { cwd: projectRoot, stdio: 'pipe', encoding: 'utf8' });
};

const ensureCleanWorkingTree = () => {
  const status = runCapture('git status --porcelain');
  if (status.trim().length > 0) {
    throw new Error('Working tree is not clean. Please commit or stash changes before releasing.');
  }
};

ensureCleanWorkingTree();

const pkgPath = path.join(projectRoot, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const currentVersion: string = pkg.version;

const requestedType = values.type as semver.ReleaseType | undefined;
const requestedVersion = values.version as string | undefined;

let nextVersion: string | null = requestedVersion ?? null;
if (!nextVersion) {
  const type: semver.ReleaseType = requestedType ?? 'patch';
  nextVersion = semver.inc(currentVersion, type);
  if (!nextVersion) {
    throw new Error(`Unable to compute next version from ${currentVersion} using type ${type}.`);
  }
}

if (!semver.valid(nextVersion)) {
  throw new Error(`Provided version ${nextVersion} is not a valid semver string.`);
}

console.log(`Releasing ${nextVersion} (current version ${currentVersion}).`);

if (!dryRun) {
  pkg.version = nextVersion;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

if (!dryRun) {
  console.log('Updating dependency lockfile (bun.lock)…');
  run('bun install', { stdio: 'inherit' });
}

console.log('Running type checks…');
run('npm run typecheck');

console.log('Building package…');
run('npm run build');

console.log('Generating changelog…');
run(`npm run generate:changelog -- --version ${nextVersion}`);

if (!dryRun) {
  const filesToStage = ['package.json', 'CHANGELOG.md', 'bun.lock']
    .filter((file) => existsSync(path.join(projectRoot, file)))
    .join(' ');
  if (filesToStage.length > 0) {
    run(`git add ${filesToStage}`);
  }
  console.log('Creating release commit…');
  run(`git commit -m "chore(release): v${nextVersion}"`);
  console.log('Tagging release…');
  run(`git tag v${nextVersion}`);
}

if (values.publish) {
  console.log('Publishing to npm…');
  if (dryRun) {
    console.log('[dry-run] npm publish');
  } else {
    run('npm publish --access public');
  }
}

console.log('Release workflow complete.');
console.log('Next steps: push commits and tags, then npm publish (if not already published).');

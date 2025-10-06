#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import OpenAI from 'openai';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const { values } = parseArgs({
  options: {
    version: { type: 'string' },
    range: { type: 'string' },
  },
});

const pkgPath = path.join(projectRoot, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const targetVersion = values.version ?? pkg.version;

const ensureEnv = (name: string) => {
  if (!process.env[name]) {
    throw new Error(`${name} is required to generate changelog entries.`);
  }
};

ensureEnv('OPENAI_API_KEY');

const findLastTag = () => {
  try {
    const tag = execSync('git describe --tags --abbrev=0', { cwd: projectRoot, encoding: 'utf8' })
      .trim();
    return tag;
  } catch (error) {
    return null;
  }
};

const lastTag = values.range ? null : findLastTag();
const gitRange = values.range ?? (lastTag ? `${lastTag}..HEAD` : '');
const rangePrefix = gitRange ? `${gitRange} ` : '';

const commitLog = execSync(`git log ${rangePrefix}--pretty=format:%H%x09%an%x09%ad%x09%s --date=short`, {
  cwd: projectRoot,
  encoding: 'utf8',
});

if (!commitLog.trim()) {
  console.log('No commits found to include in changelog.');
  process.exit(0);
}

const diffStat = gitRange
  ? execSync(`git diff ${gitRange} --stat`, { cwd: projectRoot, encoding: 'utf8' })
  : '';

const client = new OpenAI();

const prompt = `You are a release note generator for the Sky Pilot project, an unofficial CLI and Ink TUI for OpenAI's Sora 2 video APIs.
Summarize the following commits into a concise changelog entry with subsections when helpful.
Focus on user-facing improvements, CLI/TUI changes, automation, and dependency updates. Avoid generic lines.
If there are breaking changes, call them out explicitly under a "Breaking Changes" subsection.

Target version: ${targetVersion}
Commit log lines (tab separated hash, author, date, subject):
${commitLog}

Diff summary:
${diffStat || 'No aggregated diff available.'}`;

const response = await client.responses.create({
  model: 'gpt-5-mini',
  input: [
    {
      role: 'system',
      content: 'You create succinct, well-structured changelog entries in Markdown.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]
});

const changelogBody = response.output_text.trim();

const changelogPath = path.join(projectRoot, 'CHANGELOG.md');
const today = new Date().toISOString().split('T')[0];
const entry = `## ${targetVersion} - ${today}\n\n${changelogBody}\n\n`;

let baseContent = '# Changelog\n\n';
if (existsSync(changelogPath)) {
  const existing = readFileSync(changelogPath, 'utf8');
  if (existing.trim().length > 0) {
    const withoutHeader = existing.startsWith('# Changelog')
      ? existing.replace(/^# Changelog\s*/u, '').trimStart()
      : existing;
    const lines = withoutHeader.split(/\r?\n/);
    let banner = '';
    if (lines[0]?.startsWith('_') && lines[0]?.endsWith('_')) {
      banner = lines.shift() ?? '';
      while (lines[0] === '') {
        lines.shift();
      }
    }
    const remainder = lines.join('\n').trimStart();
    baseContent = '# Changelog\n\n' + (banner ? `${banner}\n\n` : '') + remainder;
    if (!banner && !remainder) {
      baseContent = '# Changelog\n\n';
    }
  }
}
const headerlessBase = baseContent.replace(/^# Changelog\s*/u, '').trimStart();
const bannerMatch = headerlessBase.startsWith('_') ? headerlessBase.split(/\r?\n/)[0] : '';
const bannerBlock = bannerMatch ? `${bannerMatch}\n\n` : '';
const remainderBlock = bannerMatch
  ? headerlessBase.slice(bannerMatch.length).trimStart()
  : headerlessBase;

const newContent = `# Changelog\n\n${bannerBlock}${entry}${remainderBlock}`.trimEnd() + '\n';
writeFileSync(changelogPath, newContent);

console.log(`Changelog updated for v${targetVersion}.`);

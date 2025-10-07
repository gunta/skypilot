#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const args = parseArgs({
  options: {
    version: { type: 'string' },
    tarballUrl: { type: 'string' },
    dryRun: { type: 'boolean', default: false },
  },
});

const dryRun = args.values.dryRun ?? false;

const readPackage = async () => {
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkgRaw = await readFile(pkgPath, 'utf8');
  return JSON.parse(pkgRaw) as { name: string; version: string; description?: string; homepage?: string; license?: string };
};

const pkg = await readPackage();

const version = args.values.version ?? pkg.version;

if (!version) {
  throw new Error('Unable to determine version. Pass --version or ensure package.json contains a version field.');
}

const tarballUrl = args.values.tarballUrl ?? `https://registry.npmjs.org/${pkg.name}/-/${pkg.name}-${version}.tgz`;

const fetchTarball = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url} (${response.status} ${response.statusText}).`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const buffer = await fetchTarball(tarballUrl);
const sha256 = createHash('sha256').update(buffer).digest('hex');

const formulaDir = path.join(projectRoot, 'Formula');
mkdirSync(formulaDir, { recursive: true });

const description = pkg.description ?? 'Unofficial CLI for OpenAI Sora.';
const homepage = pkg.homepage ?? 'https://github.com/gunta/skypilot';
const license = pkg.license ?? 'MIT';

const formulaBody = `require "language/node"

class ${pkg.name[0]!.toUpperCase()}${pkg.name.slice(1)} < Formula
  desc "${description.replace(/"/g, '\\"')}"
  homepage "${homepage}"
  url "${tarballUrl}"
  sha256 "${sha256}"
  license "${license}"
  head "https://github.com/gunta/skypilot.git", branch: "main"

  depends_on "node"

  def install
    cd "package" do
      system "npm", "install", *Language::Node.local_npm_install_args(libexec)
    end
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    output = shell_output("#{bin}/skypilot --version")
    assert_match version, output
  end
end
`;

const formulaPath = path.join(formulaDir, `${pkg.name}.rb`);

if (dryRun) {
  console.log('[dry-run] would write Formula to', formulaPath);
  console.log(formulaBody);
} else {
  writeFileSync(formulaPath, formulaBody, 'utf8');
  console.log(`Updated Homebrew formula at ${formulaPath}`);
}

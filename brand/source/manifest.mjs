#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

// Run from any directory:
//   node brand/source/manifest.mjs          Regenerate brand/manifest.json.
//   node brand/source/manifest.mjs --verify Check the existing inventory without writing.
// Paths in the manifest are relative to this repository, never to a user's machine.
// No timestamp is recorded: the same files produce the same manifest.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST_PATH = 'brand/manifest.json';
const GENERATOR_PATH = 'brand/source/manifest.mjs';
const GROUPS = ['assets', 'fonts', 'sources', 'derived'];
const MIME = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.json': 'application/json', '.txt': 'text/plain', '.md': 'text/markdown',
  '.swift': 'text/x-swift', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css',
  '.html': 'text/html', '.mp4': 'video/mp4', '.webm': 'video/webm',
};
const comparePath = (a, b) => a < b ? -1 : a > b ? 1 : 0;

async function listFiles(root, directory, optional = false) {
  let entries;
  try {
    entries = await readdir(path.join(root, directory), { withFileTypes: true });
  } catch (error) {
    if (optional && error.code === 'ENOENT') return [];
    throw error;
  }
  const files = [];
  for (const entry of entries.sort((a, b) => comparePath(a.name, b.name))) {
    if (entry.name.startsWith('.')) continue;
    const relative = path.posix.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Inventory does not follow symbolic links: ${relative}`);
    if (entry.isDirectory()) files.push(...await listFiles(root, relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

export function imageDimensions(data, extension) {
  if (extension === '.png' && data.length >= 24 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    if (data.toString('ascii', 12, 16) !== 'IHDR') throw new Error('PNG has no initial IHDR chunk.');
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20), unit: 'px' };
  }
  if (extension === '.svg') {
    const opening = data.toString('utf8').match(/<svg\b[^>]*>/i)?.[0];
    if (!opening) throw new Error('SVG has no opening svg element.');
    const attribute = (name) => opening.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
    const pixels = (value) => value?.match(/^\s*(\d+(?:\.\d+)?)\s*(?:px)?\s*$/i)?.[1];
    const width = Number(pixels(attribute('width')));
    const height = Number(pixels(attribute('height')));
    const viewBox = attribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
    const dimensions = Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0
      ? { width, height, unit: 'px' } : {};
    if (viewBox?.length === 4 && viewBox.every(Number.isFinite)) dimensions.viewBox = viewBox;
    return Object.keys(dimensions).length ? dimensions : undefined;
  }
  if (extension === '.gif' && data.length >= 10 && /^GIF8[79]a$/.test(data.toString('ascii', 0, 6))) {
    return { width: data.readUInt16LE(6), height: data.readUInt16LE(8), unit: 'px' };
  }
  return undefined;
}

async function record(root, relative) {
  const data = await readFile(path.join(root, relative));
  const extension = path.extname(relative).toLowerCase();
  const dimensions = imageDimensions(data, extension);
  return {
    path: relative,
    mediaType: MIME[extension] ?? 'application/octet-stream',
    bytes: data.length,
    sha256: createHash('sha256').update(data).digest('hex'),
    ...(dimensions ? { dimensions } : {}),
  };
}

export async function buildManifest(root = ROOT) {
  const [assetPaths, fontPaths, sourcePaths, motionPaths] = await Promise.all([
    listFiles(root, 'assets/brand'),
    listFiles(root, 'brand/fonts'),
    listFiles(root, 'brand/source'),
    listFiles(root, 'brand/animation-v5', true),
  ]);
  const canonicalPaths = assetPaths.filter((p) => !p.startsWith('assets/brand/preview/'));
  const previewPaths = assetPaths.filter((p) => p.startsWith('assets/brand/preview/'));
  const canonicalSet = new Set(canonicalPaths);
  const records = (paths) => Promise.all(paths.sort(comparePath).map((p) => record(root, p)));
  const [assets, fonts, sources, derived] = await Promise.all([
    records(canonicalPaths), records(fontPaths),
    records([...sourcePaths, ...motionPaths].filter((p) => p !== GENERATOR_PATH && p !== MANIFEST_PATH)), records(previewPaths),
  ]);
  for (const entry of derived) {
    const filename = path.posix.basename(entry.path);
    const exact = path.posix.join('assets/brand', filename);
    const svg = exact.replace(/\.[^.]+$/, '.svg');
    entry.role = 'preview';
    const source = canonicalSet.has(exact) ? exact : canonicalSet.has(svg) ? svg : null;
    if (source) entry.derivedFrom = source;
  }
  return {
    schemaVersion: 1,
    brand: 'heyNag',
    version: '0.4.0',
    status: 'draft',
    generatedBy: GENERATOR_PATH,
    checksumAlgorithm: 'sha256',
    notes: [
      'Paths are relative to the repository root.',
      'Canonical assets, fonts and source records are separate from derived previews.',
      'The manifest and its generator are excluded from the checksum inventory.',
      'Checksums verify file identity; source records describe provenance and creative intent.',
    ],
    assets, fonts, sources, derived,
  };
}

export function compareManifests(saved, current) {
  const differences = [];
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return ['Manifest must be a JSON object.'];
  const metadata = (value) => Object.fromEntries(Object.entries(value).filter(([key]) => !GROUPS.includes(key)));
  if (!isDeepStrictEqual(metadata(saved), metadata(current))) differences.push('Manifest metadata differs from the generator.');
  for (const group of GROUPS) {
    if (!Array.isArray(saved[group])) {
      differences.push(`Missing or invalid inventory group: ${group}`);
      continue;
    }
    const savedEntries = new Map();
    for (const entry of saved[group]) {
      if (!entry || typeof entry.path !== 'string') { differences.push(`Invalid entry in ${group}`); continue; }
      if (savedEntries.has(entry.path)) differences.push(`Duplicate entry: ${entry.path}`);
      savedEntries.set(entry.path, entry);
    }
    const currentEntries = new Map(current[group].map((entry) => [entry.path, entry]));
    for (const [file, entry] of currentEntries) {
      if (!savedEntries.has(file)) differences.push(`Added: ${file}`);
      else if (!isDeepStrictEqual(savedEntries.get(file), entry)) differences.push(`Changed: ${file}`);
    }
    for (const file of savedEntries.keys()) {
      if (!currentEntries.has(file)) differences.push(`Removed: ${file}`);
    }
  }
  return differences;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--verify')) {
    throw new Error('Usage: node brand/source/manifest.mjs [--verify]');
  }
  const current = await buildManifest();
  const count = GROUPS.reduce((sum, group) => sum + current[group].length, 0);
  if (args[0] === '--verify') {
    let saved;
    try { saved = JSON.parse(await readFile(path.join(ROOT, MANIFEST_PATH), 'utf8')); }
    catch (error) {
      if (error.code === 'ENOENT') throw new Error('brand/manifest.json is missing. Run the generator first.');
      throw error;
    }
    const differences = compareManifests(saved, current);
    if (differences.length) throw new Error(`Manifest verification failed:\n${differences.map((line) => `  ${line}`).join('\n')}\nRegenerate after reviewing the intended changes.`);
    console.log(`Verified ${MANIFEST_PATH}: ${count} files match (draft ${current.version}).`);
  } else {
    await writeFile(path.join(ROOT, MANIFEST_PATH), JSON.stringify(current, null, 2) + '\n');
    console.log(`Wrote ${MANIFEST_PATH}: ${current.assets.length} assets, ${current.fonts.length} font/license files, ${current.sources.length} source records, ${current.derived.length} derived previews.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

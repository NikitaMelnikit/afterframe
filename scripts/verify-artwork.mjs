#!/usr/bin/env node
/**
 * Re-checks every TMDB image path in src/data/artwork.json against the CDN.
 *
 * The offline edition only ships artwork paths that resolve on the TMDB image
 * CDN and that were visually confirmed to belong to the right film. Run this
 * periodically: TMDB occasionally retires images, and any path that stops
 * resolving should be set to null so the designed fallback takes over.
 *
 *   npm run verify:artwork
 */
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../src/data/artwork.json', import.meta.url), 'utf8'));
const BASE = 'https://image.tmdb.org/t/p';

async function check(size, path) {
  try {
    const res = await fetch(`${BASE}/${size}${path}`, { method: 'HEAD' });
    return res.ok && (res.headers.get('content-type') ?? '').startsWith('image/');
  } catch {
    return false;
  }
}

const jobs = [];
for (const [id, entry] of Object.entries(manifest)) {
  if (entry.poster) jobs.push({ id, title: entry.title, kind: 'poster', path: entry.poster, size: 'w92' });
  if (entry.backdrop) jobs.push({ id, title: entry.title, kind: 'backdrop', path: entry.backdrop, size: 'w300' });
  for (const alt of entry.alternates ?? []) jobs.push({ id, title: entry.title, kind: 'alternate', path: alt, size: 'w92' });
}

const failures = [];
const CONCURRENCY = 12;
for (let i = 0; i < jobs.length; i += CONCURRENCY) {
  const batch = jobs.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map((j) => check(j.size, j.path)));
  results.forEach((ok, k) => ok || failures.push(batch[k]));
}

const films = Object.keys(manifest).length;
const withoutPoster = Object.values(manifest).filter((e) => !e.poster).length;
console.log(`Checked ${jobs.length} image paths across ${films} films (${withoutPoster} use the designed fallback).`);
if (failures.length) {
  console.error(`\n${failures.length} path(s) no longer resolve:`);
  for (const f of failures) console.error(`  ${f.id} ${f.title} — ${f.kind} ${f.path}`);
  process.exitCode = 1;
} else {
  console.log('All artwork paths resolve.');
}

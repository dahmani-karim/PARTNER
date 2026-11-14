import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const dist = new URL('../../dist/', import.meta.url);
const html = await readFile(new URL('index.html', dist), 'utf8');
const manifestTags = html.match(/<link\b[^>]*\brel="manifest"[^>]*>/g) || [];
assert.equal(manifestTags.length, 1, 'Expected exactly one manifest link');
const manifestPath = manifestTags[0].match(/href="([^"]+)"/)[1].replace(/^\//, '');
const manifest = JSON.parse(await readFile(new URL(manifestPath, dist), 'utf8'));

test('built manifest preserves the origin-root identity and standalone launch', () => {
  assert.equal(manifest.id, '/');
  assert.equal(new URL(manifest.start_url, 'https://example.invalid/').pathname, '/');
  assert.equal(new URL(manifest.scope, 'https://example.invalid/').pathname, '/');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.launch_handler.client_mode, 'navigate-existing');
});

test('every declared PNG icon and shortcut has the advertised format and dimensions', async () => {
  const icons = [...manifest.icons, ...(manifest.shortcuts || []).flatMap(shortcut => shortcut.icons || [])];
  for (const icon of icons) {
    const data = await readFile(new URL(icon.src.replace(/^\//, ''), dist));
    assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', icon.src);
    assert.equal(data.toString('ascii', 12, 16), 'IHDR', icon.src);
    assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`, icon.sizes, icon.src);
    for (const purpose of (icon.purpose || 'any').split(' ')) {
      assert.ok(['any', 'maskable', 'monochrome'].includes(purpose), `${icon.src}: ${purpose}`);
    }
  }
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512'));
});

test('HTML contains a single manifest and no competing injected service worker registration', async () => {
  assert.equal((html.match(/rel="manifest"/g) || []).length, 1);
  assert.equal(html.includes('registerSW.js'), false);
  assert.equal(html.includes('navigator.serviceWorker.register('), false);
});

test('the generated worker waits for the explicit SKIP_WAITING message', async () => {
  const worker = await readFile(new URL('sw.js', dist), 'utf8');
  assert.ok(worker.includes('SKIP_WAITING'));
  assert.ok(worker.includes('clientsClaim'));
  assert.equal(worker.includes('self.skipWaiting();'), false);
});

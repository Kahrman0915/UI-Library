/**
 * Payload sink for the DOM -> Figma bridge (docs/figma-dom-bridge.md).
 *
 * The extractor runs in the Storybook page and produces a scene graph that is
 * tens of kilobytes. POSTing it here writes it straight to disk, so the payload
 * never has to be round-tripped through a chat transcript to be saved.
 *
 *   node scripts/figma-payload-sink.mjs [outDir] [port]
 *
 * Then, in the page:
 *   fetch('http://localhost:7788/marketing-light', {method:'POST', body: JSON.stringify(p)})
 *
 * The last path segment names the file; anything but [\w-] is rejected so a
 * page cannot pick a path. Writes are confined to outDir.
 */
import { createServer } from 'node:http';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const outDir = resolve(process.argv[2] || 'docs/figma-payloads');
const port = Number(process.argv[3] || 7788);

await mkdir(outDir, { recursive: true });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

createServer((req, res) => {
  if (req.method === 'OPTIONS') return res.writeHead(204, CORS).end();
  if (req.method !== 'POST') return res.writeHead(405, CORS).end('POST only');

  const name = (req.url || '').split('/').filter(Boolean).pop() || '';
  if (!/^[\w-]+$/.test(name)) return res.writeHead(400, CORS).end('bad name');

  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', async () => {
    const body = Buffer.concat(chunks);
    const file = join(outDir, `${name}.json`);
    await writeFile(file, body);
    console.log(`${new Date().toISOString()}  ${name}.json  ${body.length} bytes`);
    res.writeHead(200, { ...CORS, 'Content-Type': 'text/plain' }).end(String(body.length));
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`sink listening on http://localhost:${port} -> ${outDir}`);
});

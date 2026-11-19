// Serves app/ on http://localhost:8080 for local testing — plain static
// files, no build step, exactly how a static server will serve them.
// Only a development convenience, not a web server for the internet.
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app/', import.meta.url)));
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

function portFromArgs(argv) {
  const at = argv.indexOf('--port');
  const wanted = at === -1 ? 8080 : Number(argv[at + 1]);
  return Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;
}

// Resolve a request path against appRoot. resolve() drops the root when the
// path is absolute, so a leading slash is stripped first; the result must
// stay inside appRoot (root itself, or root + separator, never a sibling
// whose name merely starts with the same letters).
function fileInsideRoot(requestPath) {
  const cleaned = decodeURIComponent(requestPath).replace(/^\/+/, '') || 'index.html';
  const target = resolve(appRoot, cleaned);
  if (target !== appRoot && !target.startsWith(appRoot + sep)) return null;
  try {
    if (!statSync(target).isFile()) return null;
  } catch {
    return null;
  }
  return target;
}

createServer((req, res) => {
  let target;
  try {
    target = fileInsideRoot(new URL(req.url ?? '/', 'http://127.0.0.1').pathname);
  } catch {
    target = null;
  }
  if (!target) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, {
    'content-type': contentTypes[extname(target).toLowerCase()] ?? 'application/octet-stream',
    'content-length': statSync(target).size,
    'cache-control': 'no-store',
  });
  createReadStream(target).pipe(res);
}).listen(portFromArgs(process.argv.slice(2)), '127.0.0.1', () => {
  console.log(`Vice City Cover Lab at http://localhost:${portFromArgs(process.argv.slice(2))}`);
});

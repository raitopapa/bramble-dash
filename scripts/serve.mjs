import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8']
]);

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(body);
}

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  const normalizedPath = normalize(decodedPath).replace(/^([/\\])+/, '');
  const requestedPath = resolve(rootDir, normalizedPath);
  const isInsideRoot = requestedPath === rootDir || requestedPath.startsWith(`${rootDir}${sep}`);

  if (!isInsideRoot) {
    return null;
  }

  return requestedPath;
}

export function createStaticServer() {
  return createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
      return;
    }

    const requestUrl = new URL(req.url || '/', 'http://localhost');
    const requestedPath = resolveRequestPath(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);

    if (!requestedPath) {
      send(res, 403, 'Forbidden');
      return;
    }

    let filePath = requestedPath;
    let fileStat = await stat(filePath).catch(() => null);

    if (fileStat?.isDirectory()) {
      filePath = join(filePath, 'index.html');
      fileStat = await stat(filePath).catch(() => null);
    }

    if (!fileStat?.isFile()) {
      send(res, 404, 'Not Found');
      return;
    }

    const contentType = MIME_TYPES.get(extname(filePath)) || 'application/octet-stream';
    res.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': fileStat.size,
      'Content-Type': contentType
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    createReadStream(filePath).pipe(res);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8000);
  const host = process.env.HOST || '127.0.0.1';
  const server = createStaticServer();

  server.listen(port, host, () => {
    console.log(`Bramble's Dash is running at http://${host}:${port}/`);
  });
}

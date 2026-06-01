import assert from 'node:assert/strict';
import { once } from 'node:events';
import { get } from 'node:http';
import { createStaticServer } from './serve.mjs';

function requestText(url) {
  return new Promise((resolve, reject) => {
    const req = get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ body, statusCode: res.statusCode });
      });
    });

    req.on('error', reject);
  });
}

const server = createStaticServer();
server.listen(0, '127.0.0.1');
await once(server, 'listening');

const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;
const { body, statusCode } = await requestText(`${baseUrl}/`);

server.close();
await once(server, 'close');

assert.equal(statusCode, 200, 'トップページが HTTP 200 で取得できること');
assert.match(body, /<canvas id="game"><\/canvas>/, 'ゲーム用 canvas が存在すること');
assert.match(body, /BRAMBLE'S DASH/, 'タイトル文字列が存在すること');
assert.match(body, /const LEVELS=\[buildLevel1, buildLevel2, buildLevel3\];/, '3 ステージが登録されていること');
assert.match(body, /addEventListener\('keydown'/, 'キーボード入力ハンドラが存在すること');

console.log('Smoke test passed.');

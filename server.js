// Servidor para Render (o cualquier hosting con Node): sirve la página y la función /api/chat.
// Sin dependencias. Render define PORT; las claves van en las variables de entorno del servicio.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chat from './api/chat.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

// Los mismos encabezados de seguridad que vercel.json.
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const SECURITY_HEADERS = vercel.headers[0].headers;

http.createServer(async (req, res) => {
  for (const h of SECURITY_HEADERS) res.setHeader(h.key, h.value);
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/chat') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 20_000) { res.statusCode = 413; return res.end(); }
    }
    req.body = body;
    res.status = (s) => { res.statusCode = s; return res; };
    res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    return chat(req, res);
  }

  if (url.pathname === '/healthz') return res.end('ok');

  // Solo se sirven index.html y la carpeta assets: nunca .env, api/ ni otros archivos.
  const p = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const allowed = p === '/index.html' || p.startsWith('/assets/');
  const file = path.join(root, p);
  if (!allowed || p.includes('..') || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.statusCode = 404;
    return res.end('No encontrado');
  }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Asistente 4Life en el puerto ${PORT}`));

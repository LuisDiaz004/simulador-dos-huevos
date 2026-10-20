import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.argv[2] || process.env.PORT || 8000);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requestedPath = resolve(root, `.${pathname}`);
    const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
    if (requestedPath !== root && !requestedPath.toLowerCase().startsWith(rootPrefix.toLowerCase())) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    let filePath = requestedPath === root ? join(root, 'index.html') : requestedPath;
    if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No se encontró el archivo.');
  }
});

function listen(candidatePort = port) {
  server.once('error', error => {
    if (error.code === 'EADDRINUSE' && candidatePort < port + 10 && candidatePort < 65535) {
      console.log(`El puerto ${candidatePort} está ocupado; probando ${candidatePort + 1}…`);
      listen(candidatePort + 1);
      return;
    }
    console.error(`No se pudo iniciar el servidor en el puerto ${candidatePort}: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(candidatePort, '127.0.0.1', () => {
    console.log(`Simulador listo en http://127.0.0.1:${candidatePort}/`);
  });
}

listen();

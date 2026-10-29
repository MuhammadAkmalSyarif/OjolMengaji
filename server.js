// ==============================================================================
// OJOL MENGAJI - LOCALHOST HTTP SERVER (Zero-Dependencies)
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let reqUrl = decodeURI(req.url.split('?')[0]);
  if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';
  if (reqUrl === '/admin') reqUrl = '/admin.html';
  if (reqUrl === '/login') reqUrl = '/login.html';
  if (reqUrl === '/daftar' || reqUrl === '/register') reqUrl = '/register.html';

  let filePath = path.join(__dirname, reqUrl);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><body><h2>404 Not Found</h2></body></html>`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  let localIp = '127.0.0.1';
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  console.log('============================================================');
  console.log('  🕋 OJOL MENGAJI - LOCALHOST SERVER SEDANG BERJALAN');
  console.log('============================================================');
  console.log(`  🌐 Akses di Komputer Ini : http://localhost:${PORT}`);
  console.log(`  🛡️ Akses Portal Admin    : http://localhost:${PORT}/admin.html`);
  console.log(`  📱 Akses di HP/Wi-Fi     : http://${localIp}:${PORT}`);
  console.log('------------------------------------------------------------');
});

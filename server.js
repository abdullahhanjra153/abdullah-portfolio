const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

// Configuration
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT_DIR = __dirname;
const shouldOpenBrowser = process.argv.includes('--open') || !process.argv.includes('--no-open');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

// Live reload clients
const sseClients = new Set();

// Client-side live reload script injected into HTML
const LIVE_RELOAD_SCRIPT = `
<!-- Development Live Reload -->
<script>
  (() => {
    let source;
    function connect() {
      source = new EventSource('/__livereload');
      source.onopen = () => console.log('[dev-server] Live reload connected.');
      source.onmessage = (e) => {
        if (e.data === 'reload') {
          console.log('[dev-server] Change detected. Reloading...');
          window.location.reload();
        }
      };
      source.onerror = () => {
        source.close();
        setTimeout(connect, 1500);
      };
    }
    connect();
  })();
</script>
`;

// Helper: Open URL in default browser
function openBrowser(url) {
  const startCmd = process.platform === 'win32' ? `start "" "${url}"` :
                   process.platform === 'darwin' ? `open "${url}"` :
                   `xdg-open "${url}"`;
  exec(startCmd, (err) => {
    if (err) {
      console.warn(`[dev-server] Could not automatically open browser: ${err.message}`);
    }
  });
}

// Helper: Get local network IP addresses
function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// File watcher for auto-reload
let reloadTimer = null;
fs.watch(ROOT_DIR, { recursive: false }, (eventType, filename) => {
  if (!filename) return;
  // Ignore hidden files and lock files
  if (filename.startsWith('.') || filename.endsWith('.log') || filename === 'package-lock.json') return;

  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    console.log(`\x1b[36m[dev-server]\x1b[0m File changed: ${filename} -> Triggering reload`);
    for (const client of sseClients) {
      client.write('data: reload\n\n');
    }
  }, 100);
});

// Request handler
const server = http.createServer((req, res) => {
  const startTime = Date.now();

  // SSE endpoint for live reload
  if (req.url === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });
    res.write('data: connected\n\n');
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // Sanitize path and prevent directory traversal
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    // If directory, try index.html
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (err && (reqPath === '/favicon.ico' || reqPath === 'favicon.ico')) {
      filePath = path.join(ROOT_DIR, 'favicon.svg');
    }

    fs.readFile(filePath, (readErr, content) => {
      const duration = Date.now() - startTime;

      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title><style>body{font-family:sans-serif;padding:40px;text-align:center;background:#f6f5f1;color:#171916;}</style></head><body><h1>404 Not Found</h1><p>The requested file <code>${reqPath}</code> was not found.</p><p><a href="/">Return Home</a></p></body></html>`);
        console.log(`\x1b[31m404\x1b[0m ${req.method} ${req.url} \x1b[90m(${duration}ms)\x1b[0m`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Set development headers (disable caching for instant iteration)
      const headers = {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff'
      };

      // Inject live-reload script if HTML
      if (ext === '.html') {
        let htmlStr = content.toString('utf-8');
        if (htmlStr.includes('</body>')) {
          htmlStr = htmlStr.replace('</body>', `${LIVE_RELOAD_SCRIPT}</body>`);
        } else {
          htmlStr += LIVE_RELOAD_SCRIPT;
        }
        res.writeHead(200, headers);
        res.end(htmlStr);
      } else {
        res.writeHead(200, headers);
        res.end(content);
      }

      console.log(`\x1b[32m200\x1b[0m ${req.method} ${req.url} \x1b[90m(${duration}ms)\x1b[0m`);
    });
  });
});

// Port listening with fallback
function startServer(port) {
  server.listen(port, () => {
    const localUrl = `http://localhost:${port}`;
    const networkAddresses = getNetworkAddresses();

    console.log('\n\x1b[1m\x1b[32m  ✔ Abdullah Hanjra Portfolio — Development Server Running\x1b[0m\n');
    console.log(`  \x1b[1m➜\x1b[0m  \x1b[1mLocal:\x1b[0m    \x1b[36m${localUrl}/\x1b[0m`);
    networkAddresses.forEach(ip => {
      console.log(`  \x1b[1m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m  \x1b[36mhttp://${ip}:${port}/\x1b[0m`);
    });
    console.log(`  \x1b[1m➜\x1b[0m  \x1b[90mLive reload:\x1b[0m \x1b[32mActive (watching changes)\x1b[0m`);
    console.log(`  \x1b[1m➜\x1b[0m  \x1b[90mServing dir:\x1b[0m \x1b[90m${ROOT_DIR}\x1b[0m\n`);

    if (shouldOpenBrowser) {
      openBrowser(localUrl);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`\x1b[33m[dev-server] Port ${port} is in use, trying port ${port + 1}...\x1b[0m`);
      startServer(port + 1);
    } else {
      console.error(`\x1b[31m[dev-server] Server error: ${err.message}\x1b[0m`);
      process.exit(1);
    }
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\x1b[33m[dev-server] Gracefully shutting down...\x1b[0m');
  server.close(() => {
    process.exit(0);
  });
});

startServer(DEFAULT_PORT);

/* Server statis kecil untuk menjalankan Pasar Janapria secara lokal.
   Jalankan: npm start  (atau: node server.js)
   PWA/service worker butuh http:// — jangan buka index.html lewat file:// */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 5173;
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }

  let file = path.join(ROOT, pathname);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.stat(file, (err, stat) => {
    if (!err && stat.isDirectory()) file = path.join(file, "index.html");

    fs.readFile(file, (err2, data) => {
      if (err2) {
        // fallback SPA: kirim index.html untuk path tanpa ekstensi
        if (!path.extname(file)) {
          fs.readFile(path.join(ROOT, "index.html"), (e3, html) => {
            if (e3) { res.writeHead(404).end("Not found"); return; }
            res.writeHead(200, { "Content-Type": MIME[".html"], "Cache-Control": "no-cache" });
            res.end(html);
          });
          return;
        }
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found: " + pathname);
        return;
      }

      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "Service-Worker-Allowed": "/"
      });
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Pasar Janapria siap dibuka:\n  http://${HOST}:${PORT}\n`);
  console.log("  Tekan Ctrl+C untuk berhenti.\n");
});

import http from "http";
import fs from "fs";
import path from "path";

const dir = process.argv[2] || process.env.SERVE_DIR || "./dist";
const port = Number(process.argv[3] || process.env.SERVE_PORT || 4173);

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    }[ext] || "application/octet-stream"
  );
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    let resolved = path.join(dir, urlPath);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      resolved = path.join(resolved, "index.html");
    }
    if (!fs.existsSync(resolved)) {
      // fallback to index.html for SPA
      resolved = path.join(dir, "index.html");
    }
    const stream = fs.createReadStream(resolved);
    res.writeHead(200, { "Content-Type": getContentType(resolved) });
    stream.pipe(res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(String(err));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Serving "+dir+" at http://0.0.0.0:${port}`);
});

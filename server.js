const http = require('http');
const fs = require('fs');
const path = require('path');

process.title = 'info-library-server';

const DATA_DIR = 'D:\\重要数据';
const DATA_FILE = path.join(DATA_DIR, 'info_data.json');
const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB
const BASE_PORT = parseInt(process.argv.find(a => a.startsWith('--port='))?.split('=')[1], 10) || 3456;
let actualPort = BASE_PORT;

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

function tryListen(port, maxPort) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${actualPort}`);
    const pathname = url.pathname;

    // === API: GET /api/data ===
    if (pathname === '/api/data' && req.method === 'GET') {
      try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '读取数据失败' }));
      }
      return;
    }

    // === API: POST /api/data ===
    if (pathname === '/api/data' && req.method === 'POST') {
      let body = '';
      let size = 0;
      let aborted = false;

      req.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_BODY_SIZE) {
          aborted = true;
          req.destroy();
          res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: '数据过大，超出 10MB 限制' }));
          return;
        }
        body += chunk.toString();
      });

      req.on('end', () => {
        if (aborted) return;
        try {
          const data = JSON.parse(body);
          if (!Array.isArray(data)) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: '数据格式错误，期望数组' }));
            return;
          }
          fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'JSON 格式错误' }));
        }
      });
      return;
    }

    // === Static file serving ===
    const filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>404 - 未找到文件</h1>');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>500 - 服务器内部错误</h1>');
        }
        return;
      }
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < maxPort) {
      server.close(() => tryListen(port + 1, maxPort));
    } else if (err.code === 'EADDRINUSE') {
      console.error(`错误：端口 ${port} 已被占用，且已尝试到 ${maxPort}，均不可用`);
      console.error('请关闭占用这些端口的程序后重试');
      process.exit(1);
    } else {
      console.error('服务器启动失败:', err.message);
      process.exit(1);
    }
  });

  server.listen(port, '0.0.0.0', () => {
    actualPort = server.address().port;
    console.log('='.repeat(40));
    console.log('  个人重要信息库 服务已启动');
    console.log('='.repeat(40));
    if (actualPort !== BASE_PORT) {
      console.log(`  配置端口 ${BASE_PORT} 已被占用，自动切换到端口 ${actualPort}`);
    }
    console.log(`  地址: http://localhost:${actualPort}`);
    console.log(`  数据: ${DATA_FILE}`);
    console.log('');
    console.log('  按 Ctrl+C 停止服务');
    console.log('='.repeat(40));

    // Auto-open browser
    const { exec } = require('child_process');
    exec(`start http://localhost:${actualPort}`);
  });
}

tryListen(3456, 3465);

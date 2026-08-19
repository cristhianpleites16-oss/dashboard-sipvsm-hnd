const http = require('http');
const https = require('https');
const url = require('url');

const HOST = '127.0.0.1';
const PORT = 5000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const target = parsedUrl.query.url;

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Accept, Content-Type, Authorization',
    });
    return res.end();
  }

  if (!target) {
    res.writeHead(400, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
    });
    return res.end('Missing url parameter. Use /?url=https://example.com/wms?service=WMS...');
  }

  let targetUrl;
  try {
    targetUrl = new url.URL(target);
  } catch (error) {
    res.writeHead(400, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
    });
    return res.end('Invalid target URL.');
  }

  const client = targetUrl.protocol === 'https:' ? https : http;
  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Node-CORS-Proxy/1.0',
      'Accept': '*/*',
    },
  };

  const proxyReq = client.request(targetUrl, options, (proxyRes) => {
    const headers = {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Accept, Content-Type, Authorization',
    };
    delete headers['content-encoding'];
    delete headers['transfer-encoding'];
    res.writeHead(proxyRes.statusCode || 200, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
    });
    res.end(`Proxy request failed: ${err.message}`);
  });

  proxyReq.end();
});

server.listen(PORT, HOST, () => {
  console.log(`CORS proxy running at http://${HOST}:${PORT}/`);
  console.log('Use it like: http://127.0.0.1:5000/?url=https://example.com/wms?service=WMS...');
});

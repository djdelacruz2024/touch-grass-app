// Local stand-in for Vercel's /api routes. `npm run dev` runs this next to the
// React dev server, which proxies /api/* here (see "proxy" in package.json).
import http from 'node:http';
import analyze from '../api/analyze.mjs';

const PORT = 3001;
const routes = { '/api/analyze': analyze };

http.createServer(async (req, res) => {
  const handler = routes[req.url.split('?')[0]];
  if (!handler) {
    res.writeHead(404).end();
    return;
  }

  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    req.body = raw ? JSON.parse(raw) : {};
  } catch {
    req.body = {};
  }

  // Minimal versions of the helpers Vercel adds to the response object.
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
    return res;
  };

  await handler(req, res);
}).listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

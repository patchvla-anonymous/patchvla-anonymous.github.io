import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.pdf':'application/pdf','.txt':'text/plain; charset=utf-8','.vtt':'text/vtt; charset=utf-8'};
http.createServer((req, res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  let route;
  try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  if (route.split('/').some(part => part.startsWith('.')) || /[\\\0]/.test(route)) { res.writeHead(403); res.end('Forbidden'); return; }
  const file = path.resolve(root, '.' + (route === '/' ? '/index.html' : route));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  let stat;
  try { stat = fs.statSync(file); if (!stat.isFile()) throw new Error(); }
  catch { res.writeHead(404); res.end('Not found'); return; }
  const headers = {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-cache'};
  let start=0, end=stat.size-1, code=200;
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!range || (!range[1] && !range[2])) { res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}); res.end(); return; }
    if (!range[1]) start = Math.max(0,stat.size-Number(range[2]));
    else { start=Number(range[1]); if(range[2]) end=Math.min(end,Number(range[2])); }
    if(start>end || start>=stat.size) { res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}); res.end(); return; }
    code=206; headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length']=end-start+1;
  res.writeHead(code,headers);
  if(req.method==='HEAD') { res.end(); return; }
  const stream=fs.createReadStream(file,{start,end});
  stream.on('error',()=>res.destroy());
  res.on('close',()=>stream.destroy());
  stream.pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`PatchVLA preview: http://127.0.0.1:${port}`));

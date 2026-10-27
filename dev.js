#!/usr/bin/env node
'use strict';
// Dev server: serves docs/ without caching and reloads open pages when a file under docs/ changes.
// Usage: node dev.js [port]   (no dependencies)
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'docs'),PORT=+(process.argv[2]||process.env.PORT||8000);
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff2':'font/woff2'};
const RELOAD="<script>new EventSource('/__reload').onmessage=()=>location.reload();</script>";
const clients=new Set();

http.createServer((req,res)=>{
  const url=decodeURIComponent(req.url.split('?')[0]);
  if(url==='/__reload'){
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store',Connection:'keep-alive'});
    res.write('retry: 500\n\n'); clients.add(res); req.on('close',()=>clients.delete(res)); return;
  }
  let file=path.join(ROOT,path.normalize(url));
  if(!file.startsWith(ROOT)){ res.writeHead(403); res.end(); return; }
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
  fs.readFile(file,(err,data)=>{
    if(err){ res.writeHead(404); res.end('Not found'); return; }
    const ext=path.extname(file);
    if(ext==='.html') data=data.toString().replace('</body>',RELOAD+'</body>');
    res.writeHead(200,{'Content-Type':TYPES[ext]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  });
}).listen(PORT,()=>console.log(`Serving docs/ at http://localhost:${PORT} (reloads on changes)`));

let timer=null;
fs.watch(ROOT,{recursive:true},(ev,name)=>{
  clearTimeout(timer);  // editors write several times per save; reload once
  timer=setTimeout(()=>{ console.log('changed:',name); for(const c of clients) c.write('data: reload\n\n'); },100);
});

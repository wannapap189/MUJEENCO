import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port=Number(process.env.PORT || 8140);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  try{
    const url=new URL(req.url,'http://localhost');
    const requested=decodeURIComponent(url.pathname);
    let file=path.resolve(root,'.'+requested);
    if((file!==root&&!file.startsWith(root+path.sep))||requested.split('/').some(part=>part.startsWith('.'))){res.writeHead(403).end();return;}
    if(fs.statSync(file).isDirectory()){
      if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search}).end();return;}
      file=path.join(file,'index.html');
    }
    const size=fs.statSync(file).size;
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    res.setHeader('Accept-Ranges','bytes');
    let start=0,end=size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
      if(!match[1])start=Math.max(0,size-Number(match[2]));
      else{start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),size-1);}
      if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
      status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);
    }
    res.writeHead(status,{'Content-Length':Math.max(0,end-start+1)});
    if(req.method==='HEAD'||size===0){res.end();return;}
    fs.createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
  }catch{res.writeHead(404).end('Not found');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is in use. Stop the other preview or set PORT to another value.`:error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`MUJEEN: http://127.0.0.1:${port}/`));

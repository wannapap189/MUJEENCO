import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const errors=[];let pages=0,references=0;
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.name.startsWith('.')||entry.name==='node_modules'?[]:entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
function check(file,raw){
  raw=raw.replace(/&quot;/g,'"').replace(/&amp;/g,'&');
  if(!raw||/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw))return;
  const [url,hash]=raw.split('#');const route=url.split('?')[0];
  let target=route?path.resolve(route.startsWith('/')?root:path.dirname(file),decodeURIComponent(route.replace(/^\//,''))):file;
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  references++;
  if(!fs.existsSync(target)){errors.push(`${path.relative(root,file)} -> missing ${raw}`);return;}
  if(hash&&target.endsWith('.html')&&!fs.readFileSync(target,'utf8').includes(`id="${hash}"`))errors.push(`${path.relative(root,file)} -> missing anchor ${raw}`);
}
for(const file of walk(root)){
  if(!/\.(?:html|css)$/.test(file))continue;
  const body=fs.readFileSync(file,'utf8').replace(/&quot;/g,'"');
  if(file.endsWith('.html')){pages++;for(const match of body.matchAll(/\b(?:href|src|poster|data-view|data-mask)=["']([^"']+)["']/g))check(file,match[1]);}
  for(const match of body.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g))check(file,match[1]);
}
console.log(JSON.stringify({pages,references,status:errors.length?'FAIL':'PASS',errors},null,2));
if(errors.length)process.exitCode=1;

import {readFile,writeFile} from 'node:fs/promises';
import {parts,sources} from './h100-content.mjs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const groups={package:'Package and support',gpu:'Across the GPU die',sm:'Inside and around an SM'};
let content='';
for(const [scale,label] of Object.entries(groups)){
 content+=`<h3>${label}</h3>\n`;
 for(const [id,view,system,title,spec,summary,connection,limit,refs] of parts.filter(p=>p[1]===scale)){
  content+=`<details class="part-entry" id="part-${id}" data-scale="${view}" data-system="${system}"><summary>${escape(title)}<span>${escape(spec)}</span></summary><div class="part-body"><p class="part-summary">${escape(summary)}</p><p>${escape(connection)}</p><p class="part-limitation"><strong>Model note.</strong> ${escape(limit)}</p><p class="citation">${refs.map(key=>`<a href="${sources[key][1]}">${sources[key][0]}</a>`).join(' · ')}</p><button class="view-part" data-part="${id}">Inspect in 3D ↑</button></div></details>\n`;
 }
}
const path=new URL('../posts/inside-an-h100.html',import.meta.url);
let html=await readFile(path,'utf8');
html=html.replace(/<!-- parts:start -->[\s\S]*?<!-- parts:end -->/,`<!-- parts:start -->\n${content}<!-- parts:end -->`);
html=html.replace(/<!-- sources:start -->[\s\S]*?<!-- sources:end -->/,`<!-- sources:start -->\n<ol class="source-list">${Object.values(sources).map(([title,url])=>`<li><a href="${url}">${title}</a></li>`).join('')}</ol>\n<!-- sources:end -->`);
await writeFile(path,html);
console.log(`Rendered ${parts.length} H100 component explanations.`);

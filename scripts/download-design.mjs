import {mkdir,writeFile} from 'node:fs/promises';
const ids=['0b365','11fe1','af5d3','3b917','89090','6e369','9c7fa','86155','7c7c8','3e835','a626b','6e5c8','67cda','db555','2e31c'];
await mkdir('public/design',{recursive:true});
await Promise.all(ids.map(async id=>{const r=await fetch(`https://www.figma.com/api/mcp/asset/b963cf56-f427-4639-9881-d553d56b631d/${id}.svg`);if(!r.ok)throw Error(`Asset ${id}: ${r.status}`);const bytes=new Uint8Array(await r.arrayBuffer());await writeFile(`public/design/${id}.svg`,bytes)}));
console.log(`Downloaded ${ids.length} original Figma assets.`);

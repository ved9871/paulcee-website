const fs=require('fs');const out=process.argv[2];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const slugs=new Set();
for(let s=0;s<=245;s+=5){const r=await fetch(`https://www.paulcee.co.uk/blog/index.php?start=${s}&length=5`,{headers:{'user-agent':'Mozilla/5.0 (site migration audit)'}});
const h=await r.text();const m=[...h.matchAll(/href="\?([a-z0-9]+(?:-[a-z0-9]+)+)"/g)].map(x=>x[1]);const before=slugs.size;m.forEach(x=>slugs.add(x));
process.stdout.write(`${s}:${slugs.size-before} `);if(!m.length&&s>10)break;await sleep(250);}
fs.writeFileSync(out,JSON.stringify([...slugs],null,1));console.log('\ntotal',slugs.size);})();

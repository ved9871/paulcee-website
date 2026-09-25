const fs=require('fs');const S=process.argv[2];const slugs=JSON.parse(fs.readFileSync(S+'/live/slugs.json'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{let ok=0;for(const s of slugs){const f=`${S}/live/blog/${s}.html`;if(fs.existsSync(f)){ok++;continue;}
try{const r=await fetch(`https://www.paulcee.co.uk/blog/index.php?${s}`,{headers:{'user-agent':'Mozilla/5.0 (site migration audit)'}});fs.writeFileSync(f,await r.text());ok++;}catch(e){console.log('fail',s,e.message)}await sleep(200);}
console.log('fetched',ok);})();

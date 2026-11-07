const t=await taskSpace(8),p=t.page('p1'),fs=await import('node:fs/promises');
await p.goto('file:///Users/nag/projects/personal/heyNag/brand/reviews/2026-11-07-implementation/evidence/comparison.html');await p.waitForFunction(()=>window.auditReady);
const dir='/tmp/heynag-implementation-frames';await fs.mkdir(dir,{recursive:true});
const cases=await p.evaluate(()=>HeyNagComparison.cases);let frame=0;const manifest=[];
for(const theme of ['day','night']){await p.evaluate(theme=>HeyNagComparison.setTheme(theme),theme);for(let index=0;index<cases.length;index++){
const count=Math.ceil(cases[index].duration*30/1000);manifest.push({theme,index,name:cases[index].name,startFrame:frame,frames:count});
for(let start=0;start<count;start+=20){const images=await p.evaluate(({index,start,count})=>HeyNagComparison.chunk(index,start,count),{index,start,count:Math.min(20,count-start)});for(const data of images){await fs.writeFile(dir+'/'+String(frame++).padStart(5,'0')+'.png',Buffer.from(data,'base64'));}}
console.log(theme+' '+cases[index].name+' exported');}}
await fs.writeFile('/Users/nag/projects/personal/heyNag/brand/reviews/2026-11-07-implementation/evidence/comparison-export.json',JSON.stringify({fps:30,frames:frame,seconds:frame/30,source:'Deterministic browser canvas export, real playback engine sampled at120Hz, every output frame at30fps',segments:manifest},null,2));
console.log({frames:frame,dir});

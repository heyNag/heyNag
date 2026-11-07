(()=>{'use strict';
const cases=[
 {name:'Curious entry',a:'curious',b:'curious',duration:3600},
 {name:'Thinking with glasses',a:'thinking',b:'thinking',duration:4600},
 {name:'One peek / two peeks',a:'mischievous',b:'mischievous-one-peek',duration:3600},
 {name:'Surprise onset',a:'surprised',b:'surprised',duration:3200},
 {name:'Hop contact and recovery',a:'excited',b:'excited',duration:3600},
 {name:'Investigation & sharing',a:'curious',b:'curious-investigate',duration:4700,cue:true},
 {name:'A wry afterthought',a:'curious',b:'curious-wry',duration:5200,cue:true},
 {name:'Worried gesture',a:'worried',b:'worried',duration:4000},
 {name:'Sad → worried',from:'sad',a:'worried',b:'worried',duration:4000},
 {name:'Airborne → curious',from:'excited',fromTime:850,a:'curious',b:'curious-investigate',duration:4700,cue:true},
 {name:'Thoughtful → happy',from:'thinking',a:'happy',b:'happy',duration:3200}
];
const $=id=>document.getElementById(id),canvas=$('film'),ctx=canvas.getContext('2d'),rigs=[BeforeCharacter,HeyNagCharacter].map(C=>new C(document.createElement('div'),{theme:'day'})),models=[BeforeMotion,HeyNagMotion];
let current=0,now=0,engines=[],callbacks=[],playing=false,raf=null,origin=0,theme='day',busy=false,drawGeneration=0;
const api=window.HeyNagComparison={cases};
function init(index){engines.forEach(e=>e.destroy());current=index;now=0;callbacks=[];engines=models.map((M,i)=>{const e=new M.Engine({scheduler:{now:()=>now,requestAnimationFrame:f=>(callbacks[i]=f,1),cancelAnimationFrame:()=>callbacks[i]=null}});const c=cases[current];if(c.from)e.seek(c.from,c.fromTime??M.clips[c.from].duration);e.play(i?c.b:c.a);return e});$('case').value=index;$('time').max=cases[index].duration;}
function tick(target){if(target<now)init(current);while(now<target){now=Math.min(target,now+1000/120);callbacks.forEach((f,i)=>{callbacks[i]=null;if(f)f()})}}
const svgImage=svg=>new Promise((resolve,reject)=>{const u=URL.createObjectURL(new Blob([svg.outerHTML],{type:'image/svg+xml'})),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);resolve(im)};im.onerror=()=>{URL.revokeObjectURL(u);reject(Error('SVG render failed'))};im.src=u});
async function draw(unlabelled=false){const token=++drawGeneration;const images=await Promise.all(rigs.map((r,i)=>{r.setTheme(theme);r.render(engines[i].pose);return svgImage(r.svg)}));if(token!==drawGeneration)return;const c=cases[current];ctx.fillStyle='#f1f1ef';ctx.fillRect(0,0,1280,800);ctx.fillStyle='#252923';ctx.font='26px system-ui';ctx.fillText(unlabelled?'heyNag':c.name,30,44);ctx.font='15px system-ui';ctx.fillText('Frozen control',30,78);ctx.fillText('Updated study',670,78);for(let i=0;i<2;i++){const x=640*i;ctx.fillStyle=theme==='day'?'#eaf0dc':'#202b21';ctx.fillRect(x+12,96,616,638);ctx.drawImage(images[i],x+40,110,c.cue?340:550,c.cue?351:567);if(c.cue){ctx.fillStyle=theme==='day'?'#252923':'#edf2db';ctx.font='18px system-ui';ctx.fillText('What should',x+370,235);ctx.fillText('software remember?',x+370,262);ctx.font='13px system-ui';ctx.fillText('eva.md · Markdown + Git',x+370,297)}}ctx.fillStyle='#526248';ctx.font='14px system-ui';ctx.fillText(`${(now/1000).toFixed(2)} s · ${theme==='day'?'Light':'Dark'} · exact engine samples`,30,775);$('time').value=now;$('clock').textContent=(now/1000).toFixed(1)+' s';}
function pause(){playing=false;cancelAnimationFrame(raf);$('pause').disabled=true;}
api.seek=async(index,time)=>{pause();if(index!==current||time<now)init(index);tick(time);await draw();};
api.setTheme=async value=>{theme=value==='night'?'night':'day';$('theme').value=theme;await draw();};
api.chunk=async(index,start,count,fps=30)=>{pause();const frames=[];for(let f=start;f<start+count;f++){const time=f*1000/fps;if(index!==current||time<now)init(index);tick(time);await draw();frames.push(canvas.toDataURL('image/png').split(',')[1]);}return frames;};
async function loop(ts){if(!playing)return;raf=requestAnimationFrame(loop);if(busy)return;busy=true;try{tick(Math.min(cases[current].duration,ts-origin));await draw();if(now>=cases[current].duration){pause();$('status').textContent='Settled · play again'}}finally{busy=false}}
function play(){pause();init(current);if(matchMedia('(prefers-reduced-motion: reduce)').matches){tick(Math.min(cases[current].duration,1500));draw();$('status').textContent='Still comparison · reduced motion';return}playing=true;origin=performance.now();$('pause').disabled=false;$('status').textContent='Playing once';raf=requestAnimationFrame(loop)}
for(const[cIndex,c]of cases.entries()){const o=document.createElement('option');o.value=cIndex;o.textContent=c.name;$('case').append(o)}
$('case').addEventListener('change',async e=>{pause();init(Number(e.target.value));await draw();$('status').textContent='Still · press play'});$('theme').addEventListener('change',e=>api.setTheme(e.target.value));$('play').addEventListener('click',play);$('pause').addEventListener('click',()=>{pause();$('status').textContent='Paused'});$('time').addEventListener('input',async e=>{await api.seek(current,Number(e.target.value));$('status').textContent='Pose inspection'});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{pause();if(e.matches){tick(Math.min(cases[current].duration,1500));draw()}$('status').textContent=e.matches?'Still comparison · reduced motion':'Paused'});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});init(0);draw().then(()=>window.auditReady=true);
})();

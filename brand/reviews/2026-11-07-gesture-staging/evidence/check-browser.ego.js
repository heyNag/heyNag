const fs = await import('node:fs/promises');
const t = await taskSpace(9), p = t.page('p1');
const base = '/Users/nag/projects/personal/heyNag';
const out = base + '/brand/reviews/2026-11-07-gesture-staging/evidence';
await p.goto('file://' + base + '/brand/animation-v5/signature.html');
await p.waitForFunction(() => Boolean(window.heyNagSignature));
const rows = [];
for (const width of [320, 390, 650, 651, 768, 1440]) {
  await p.cdp('Emulation.setDeviceMetricsOverride', {width, height: 900, deviceScaleFactor: 1, mobile: false});
  await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  rows.push(await p.evaluate(width => {
    const api = heyNagSignature, results = [];
    for (const id of ['curious-investigate', 'curious-wry', 'curious']) {
      const select = document.getElementById('version'); select.value = id; select.dispatchEvent(new Event('change'));
      for (const time of [330, 790, 1190, 1900, 2350, 2720]) {
        api.engine.seek(id, time);
        const day = {...api.staging.renderedPose};
        document.querySelector('[name=theme][value=night]').dispatchEvent(new Event('change'));
        const night = {...api.staging.renderedPose};
        document.querySelector('[name=theme][value=day]').dispatchEvent(new Event('change'));
        results.push({id, time, themeParity: JSON.stringify(day) === JSON.stringify(night),
          direction: api.staging.direction, gaze: [day.gazeX, day.gazeY],
          returnedExactly: time >= 2350 ? JSON.stringify(day) === JSON.stringify(api.staging.rawPose) : null,
          controlUnchanged: id === 'curious' ? JSON.stringify(day) === JSON.stringify(api.staging.rawPose) : null});
      }
    }
    return {width, innerWidth, scrollWidth: document.documentElement.scrollWidth, results};
  }, width));
}
await p.cdp('Emulation.setDeviceMetricsOverride', {width: 390, height: 900, deviceScaleFactor: 1, mobile: false});
await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
await p.evaluate(() => { const s=document.getElementById('version');s.value='curious-investigate';s.dispatchEvent(new Event('change'));heyNagSignature.engine.seek('curious-investigate',1190);document.getElementById('scene').scrollIntoView({block:'start'}); });
const beforeResize=await p.evaluate(()=>({...heyNagSignature.staging.renderedPose}));
await p.cdp('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, deviceScaleFactor: 1, mobile: false});
await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const frozenResize=await p.evaluate(()=>({...heyNagSignature.staging.renderedPose}));
const seekAfterResize=await p.evaluate(()=>{heyNagSignature.engine.seek('curious-investigate',1190);return heyNagSignature.staging});
await p.cdp('Emulation.setDeviceMetricsOverride', {width:390,height:900,deviceScaleFactor:1,mobile:false});
await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const replay=await p.evaluate(()=>{
  const api=heyNagSignature;api.engine.seek('curious-investigate',1190);const before={...api.staging.renderedPose};
  document.getElementById('play').click();const after={...api.staging.renderedPose};api.engine.pause();
  return {before,after,exact:JSON.stringify(before)===JSON.stringify(after),playingAfterPause:api.engine.playing};
});
await p.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await p.waitForFunction(()=>document.getElementById('status').textContent.includes('reduced motion'));
const reduced=await p.evaluate(()=>{document.getElementById('play').click();return {playing:heyNagSignature.engine.playing,status:document.getElementById('status').textContent,label:document.getElementById('play').textContent};});
await p.cdp('Emulation.setEmulatedMedia',{features:[]});
await p.waitForFunction(()=>!document.getElementById('status').textContent.includes('reduced motion'));
console.log(await p.snapshot());
await fs.writeFile(out+'/browser-checks.json',JSON.stringify({scope:'Actual desktop-browser emulation; not physical-phone or spoken-AT evidence.',rows,resize:{before:beforeResize,after:frozenResize,frozen:JSON.stringify(beforeResize)===JSON.stringify(frozenResize),seekAfterResize},replay,reduced},null,2));
console.log({widths:rows.length,poseCases:rows.reduce((n,r)=>n+r.results.length,0),themeMismatches:rows.flatMap(r=>r.results).filter(r=>!r.themeParity).length,overflows:rows.filter(r=>r.scrollWidth>r.width).map(r=>r.width),replayExact:replay.exact});

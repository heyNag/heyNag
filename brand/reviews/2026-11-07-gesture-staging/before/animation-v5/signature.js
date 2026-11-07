(() => {
 'use strict';
 const $=id=>document.getElementById(id),M=HeyNagMotion,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const character=new HeyNagCharacter($('moth'),{theme:'day'});character.svg.setAttribute('aria-hidden','true');
 let selected='curious-investigate',mode='still',last={};
 const descriptions={
  'curious-investigate':'The tiny moth notices the question, investigates, then turns back to share it.',
  'curious-wry':'The tiny moth investigates the question, turns back to share it, then raises a brow with one more thought.',
  'curious':'The tiny moth tilts its head and looks around with curious eyes and attentive antennae.'
 };
 const clip=()=>M.variants?.[selected]||M.clips[selected];
 function update(info){last=info;const c=clip();$('scrub').value=Math.round(info.time/c.duration*1000);$('scrub').setAttribute('aria-valuetext',`${(info.time/1000).toFixed(1)} of ${(c.duration/1000).toFixed(1)} seconds`);$('time').textContent=`${(info.time/1000).toFixed(1)} / ${(c.duration/1000).toFixed(1)} s`;$('pause').disabled=!info.playing&&!info.paused;$('pause').textContent=info.paused?'Resume':'Pause';const status=(mode==='seek'?'Pose inspection':info.paused?'Paused':info.playing?'Following the question':mode==='still'?(reduce.matches?'Still pose':'Still pose · press play'):'Settled · play again')+(reduce.matches?' · reduced motion':'');if($('status').textContent!==status)$('status').textContent=status;}
 const engine=new M.Engine({onFrame(p,i){character.render(p);if(i)update(i)},onChange:update});
 function still(){mode='still';$('moth').setAttribute('aria-label',descriptions[selected]);engine.seek(selected,clip().stillTime)}
 $('version').addEventListener('change',e=>{selected=e.target.value;still()});
 $('play').addEventListener('click',()=>{if(reduce.matches){still();return}mode='play';engine.play(selected)});
 $('pause').addEventListener('click',()=>last.paused?engine.resume():engine.pause());
 $('scrub').addEventListener('input',e=>{mode='seek';engine.seek(selected,Number(e.target.value)/1000*clip().duration)});
 for(const radio of document.querySelectorAll('[name=theme]'))radio.addEventListener('change',()=>{character.setTheme(radio.value);$('scene').dataset.theme=radio.value});
 function preference(){engine.setReducedMotion(reduce.matches);$('play').textContent=reduce.matches?'Show the thought':'Play the thought';still()}
 reduce.addEventListener('change',preference);preference();
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&engine.playing)engine.pause()});
 const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&engine.playing)engine.pause()});observer.observe($('scene'));
 window.heyNagSignature={engine,character,get selected(){return selected}};
})();

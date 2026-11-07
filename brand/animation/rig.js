/* Native SVG performance study. No dependencies, requests, autoplay, or sound.
   Screen-left/right names are deliberate: antenna sidedness never flips. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const base = {
    bodyX:0, bodyY:0, bodyR:0, bodySX:1, bodySY:1,
    headX:0, headY:0, headR:-3,
    antennaL:0, antennaR:0, wingL:0, wingR:0,
    lEX:251, lEY:481, lWX:247, lWY:505, lHR:-12,
    rEX:392, rEY:474, rWX:411, rWY:459, rHR:-135,
    footLX:0, footLY:0, footLR:0, footRX:0, footRY:0, footRR:0,
    gazeX:0, gazeY:0, eyeX:1, eyeY:1, eyeL:1, eyeR:1,
    browLY:0, browRY:0, browLR:0, browRR:0,
    smile:.75, mouthOpen:.3, mouthTilt:-2,
    glasses:0, glassesY:-16, bulb:0, bulbScale:.75, shadow:1,
    seat:0, tree:0, treeSway:0, leafTravel:0, leafLift:0
  };
  const pose = overrides => ({...base, ...overrides});
  const thought = pose({
    bodyR:-2, bodyY:1, headR:-7, headY:5,
    lEX:252, lEY:486, lWX:341, lWY:483, lHR:-92,
    rEX:366, rEY:479, rWX:346, rWY:429, rHR:174,
    gazeX:3, gazeY:3, eyeY:.94, browLY:-1, browRY:-4, browLR:-3,
    smile:.8, mouthOpen:.07, mouthTilt:-3, glasses:1, glassesY:0,
    antennaL:3, antennaR:2, wingL:-1, wingR:1
  });
  const idea = pose({
    bodyY:-9, bodyR:-1, bodySX:1.018, bodySY:1.012,
    headR:2, headY:-4, antennaL:15, antennaR:-9,
    wingL:27, wingR:-27, eyeY:1.12, gazeX:3, gazeY:-4,
    browLY:-8, browRY:-10, smile:1, mouthOpen:.83,
    lEX:247, lEY:467, lWX:221, lWY:446, lHR:125,
    rEX:398, rEY:453, rWX:421, rWY:418, rHR:-165,
    glasses:1, glassesY:0, bulb:1, bulbScale:1, shadow:.96
  });
  const share = pose({
    bodyR:-1, headR:-2, gazeX:-3, gazeY:0, antennaL:4, antennaR:-3,
    wingL:5, wingR:-5, browRY:-4, smile:.9, mouthOpen:.3,
    rEX:395, rEY:470, rWX:429, rWY:454, rHR:-75,
    glasses:1, glassesY:0
  });
  const curious = pose({
    bodyX:7, bodyR:5, headX:3, headR:8, headY:-2,
    antennaL:-7, antennaR:-17, wingL:3, wingR:-2,
    gazeX:7, gazeY:-4, eyeX:1.04, eyeY:1.03,
    browLY:-2, browRY:-10, browRR:12, smile:.4, mouthOpen:.05,
    lEX:254, lEY:484, lWX:260, lWY:496, lHR:15,
    rEX:391, rEY:470, rWX:399, rWY:435, rHR:170
  });
  const shrug = pose({
    bodyY:-3, bodyR:2, headR:-9, headY:4,
    antennaL:-5, antennaR:10, wingL:7, wingR:-7,
    lEX:246, lEY:461, lWX:221, lWY:448, lHR:105,
    rEX:399, rEY:460, rWX:427, rWY:446, rHR:-100,
    gazeX:-5, eyeY:.76, browLY:4, browRY:-8, browRR:6,
    smile:.38, mouthOpen:.02, mouthTilt:-7
  });
  const tense = pose({
    bodyY:5, bodyR:-2, bodySX:1.025, bodySY:.975,
    headR:2, headY:5, antennaL:-9, antennaR:12, wingL:-5, wingR:5,
    lEX:247, lEY:473, lWX:270, lWY:470, lHR:175,
    rEX:399, rEY:473, rWX:378, rWY:470, rHR:-175,
    gazeY:3, eyeY:.72, browLY:6, browRY:7, browLR:22, browRR:-24,
    smile:-.8, mouthOpen:.04, mouthTilt:0
  });
  const surprise = pose({
    bodyY:-7, bodyR:-5, bodySX:.97, bodySY:1.025,
    headY:-5, headR:-6, antennaL:18, antennaR:-13,
    wingL:18, wingR:-18, eyeX:1.12, eyeY:1.2, gazeY:-1,
    browLY:-11, browRY:-12, smile:0, mouthOpen:.72, mouthTilt:0,
    lEX:242, lEY:466, lWX:225, lWY:431, lHR:170,
    rEX:401, rEY:462, rWX:423, rWY:427, rHR:-170,
    footLR:3, footRR:-3, shadow:.97
  });
  const sad = pose({
    bodyY:7, bodyR:3, bodySX:1.02, bodySY:.97,
    headY:12, headR:7, antennaL:-13, antennaR:15,
    wingL:-7, wingR:7, gazeX:-3, gazeY:7, eyeY:.79,
    browLY:-3, browRY:-2, browLR:-16, browRR:16,
    smile:-.65, mouthOpen:.02, mouthTilt:0,
    lEX:257, lEY:491, lWX:262, lWY:516, lHR:8,
    rEX:383, rEY:492, rWX:377, rWY:517, rHR:-9,
    footLR:4, footRR:-4
  });
  const laugh = pose({
    bodyY:3, bodyR:-3, bodySX:1.035, bodySY:.975,
    headY:3, headR:-8, antennaL:9, antennaR:-5, wingL:9, wingR:-9,
    lEX:252, lEY:475, lWX:289, lWY:482, lHR:-83,
    rEX:389, rEY:462, rWX:371, rWY:420, rHR:168,
    eyeY:.08, browLY:-4, browRY:-6, smile:1, mouthOpen:.9
  });
  const peaceful = pose({
    bodyX:-30, bodyY:3, bodyR:0, bodySX:.92, bodySY:.92,
    headR:-1, headY:3, antennaL:-3, antennaR:3, wingL:-4, wingR:4,
    lEX:248, lEY:497, lWX:233, lWY:555, lHR:-80,
    rEX:391, rEY:497, rWX:407, rWY:555, rHR:80,
    footLX:-30, footRX:-30, eyeL:.035, eyeR:.035,
    gazeY:1, browLY:3, browRY:3, browLR:-3, browRR:3,
    smile:.3, mouthOpen:.015, mouthTilt:0,
    seat:1, tree:1, shadow:1.03
  });
  const peek = {
    ...peaceful, eyeR:.48, gazeX:8, gazeY:0, headR:-2,
    browRY:-7, browRR:9, antennaR:-10, antennaL:-1,
    smile:.57, mouthTilt:-6, leafTravel:1
  };
  const key = (t, p) => ({t, p});
  const clips = {
    thought: {
      name:'A thought → an idea', duration:4800, still:3100,
      desc:'Glasses on. Chin dip. One foot tap. A small idea, then an invitation.',
      beats:[[0,'Getting comfortable with a thought.'],[900,'Absorbed. A small chin dip.'],[1700,'One impatient foot.'],[2470,'Wait — there it is.'],[3100,'The idea opens the whole body.'],[3800,'And now he wants to tell you.']],
      keys:[key(0,pose({})), key(480,{...thought,glasses:.45,glassesY:-8,headY:2}), key(900,thought), key(1310,{...thought,headY:8,headR:-8,mouthTilt:-4}), key(1590,thought), key(1830,{...thought,footLR:11,footLY:-1,antennaR:4}), key(2040,thought), key(2470,{...thought,gazeX:7,gazeY:-5,antennaR:-8,antennaL:6,browRY:-8}), key(2660,{...thought,bodyY:5,headY:7,eyeY:.08,wingL:-3,wingR:3,bulb:.2,bulbScale:.65}), key(3050,idea), key(3260,{...idea,bodyY:-6,antennaL:10,antennaR:-5,wingL:23,wingR:-23,bulbScale:1.04}), key(3710,{...share,bodyY:-2,headR:-6,gazeX:-6,wingL:10,wingR:-11,bulb:.8,bulbScale:1}), key(4230,{...share,bulb:.1,bulbScale:.92}), key(4800,share)]
    },
    thinking: {
      name:'Working it out',duration:4600,still:1450,
      desc:'A supported elbow, a chin dip, one foot tap. The grin stays quietly amused.',
      beats:[[0,'Glasses on. Settle into the thought.'],[1300,'A tiny chin dip, not a worried frown.'],[2300,'One foot taps. The other stays planted.'],[3200,'Still thinking. Quite happy here.']],
      keys:[key(0,pose({})),key(640,{...thought,glasses:.7,glassesY:-4}),key(1100,thought),key(1580,{...thought,headY:8,headR:-8}),key(1900,thought),key(2440,{...thought,footLR:11,footLY:-1}),key(2660,thought),key(3070,{...thought,eyeY:.08}),key(3220,thought),key(4600,thought)]
    },
    hello: {
      name:'Oh, hey',duration:3200,still:1320,
      desc:'Notice you, lift the hand, two small wrist waves, then leave the conversation open.',
      beats:[[0,'Oh, someone’s here.'],[850,'A compact hello, near the face.'],[2300,'The hand settles; the welcome stays.']],
      keys:[key(0,pose({})),key(310,pose({headR:1,gazeX:-5,eyeY:.85,bodyY:2})),key(850,pose({bodyY:-3,bodyR:-2,headR:-6,rEX:402,rEY:440,rWX:428,rWY:374,rHR:178,wingR:-8,antennaL:8,antennaR:-4,smile:1,mouthOpen:.55})),key(1150,pose({bodyY:-3,bodyR:-2,headR:-6,rEX:402,rEY:440,rWX:428,rWY:374,rHR:149,wingR:-8,antennaL:6,antennaR:-3,smile:1,mouthOpen:.55})),key(1400,pose({bodyY:-3,bodyR:-2,headR:-6,rEX:402,rEY:440,rWX:428,rWY:374,rHR:187,wingR:-8,smile:1,mouthOpen:.55})),key(1650,pose({bodyY:-2,bodyR:-2,headR:-5,rEX:402,rEY:440,rWX:428,rWY:374,rHR:152,wingR:-6,smile:1,mouthOpen:.45})),key(1930,pose({bodyY:-2,headR:-5,rEX:402,rEY:443,rWX:428,rWY:380,rHR:177,wingR:-6,smile:1,mouthOpen:.4})),key(2660,{...share,glasses:0,glassesY:-16}),key(3200,{...share,glasses:0,glassesY:-16})]
    },
    curious: {
      name:'Wait. What’s that?',duration:3800,still:2180,
      desc:'The long antenna finds it first. Eyes follow. The body leans in a beat later.',
      beats:[[0,'An antenna hears something.'],[650,'Eyes find it before the body moves.'],[1450,'A little double take.'],[2400,'Leaning closer, interested.']],
      keys:[key(0,pose({})),key(350,pose({antennaR:-16,antennaL:3})),key(700,pose({antennaR:-13,antennaL:1,gazeX:7,gazeY:-4,browRY:-7})),key(1120,curious),key(1470,{...curious,headR:-5,bodyR:1,gazeX:-3,eyeY:.15,antennaL:10,antennaR:4}),key(1690,{...curious,headR:-2,bodyR:1,gazeX:0,antennaL:7,antennaR:-1}),key(2170,{...curious,headR:11,bodyX:9,bodyR:6,gazeX:8,browRY:-12}),key(2820,{...curious,antennaR:-11,antennaL:-4,smile:.65}),key(3800,{...curious,antennaR:-11,antennaL:-4,smile:.65})]
    },
    oops: {
      name:'Well. That happened.',duration:3600,still:2100,
      desc:'A delayed blink, a sideways look, then both palms admit the obvious.',
      beats:[[0,'Let that sink in.'],[850,'The look says enough.'],[1700,'A small, crooked shrug.'],[2800,'Well. There we are.']],
      keys:[key(0,pose({})),key(400,pose({eyeY:.06,smile:.2,mouthOpen:0,headR:0})),key(850,pose({eyeY:.74,gazeX:-6,browRY:-8,browLY:3,smile:.3,mouthOpen:.01,mouthTilt:-6,antennaR:7})),key(1500,{...shrug,lWX:228,lWY:458,rWX:420,rWY:454,bodyY:0}),key(1970,shrug),key(2310,{...shrug,headR:-6,bodyY:-1,antennaR:7}),key(2950,{...shrug,bodyY:2,bodyR:1,lWY:461,rWY:459,wingL:3,wingR:-3,smile:.5}),key(3600,{...shrug,bodyY:2,bodyR:1,lWY:461,rWY:459,wingL:3,wingR:-3,smile:.5})]
    },
    frustrated: {
      name:'This again.',duration:4000,still:1700,
      desc:'Hands tense, wings pull in, and a small head shake lets the frustration out.',
      beats:[[0,'The shoulders tighten.'],[1000,'Not this again.'],[2200,'A breath out.'],[3200,'Still annoyed. Back in control.']],
      keys:[key(0,pose({})),key(560,{...tense,bodyY:2,headY:2}),key(1050,tense),key(1310,{...tense,headR:-5,antennaR:15}),key(1560,{...tense,headR:6,antennaL:-12,antennaR:8}),key(1790,{...tense,headR:-3,antennaL:-7,antennaR:13}),key(2230,{...tense,eyeY:.12,bodyY:2,bodySX:1.01,bodySY:1,headY:1,mouthOpen:.16}),key(2880,{...tense,bodyY:4,bodySX:1,bodySY:1,headY:4,headR:-2,eyeY:.82,browLR:13,browRR:-14,lWX:258,lWY:491,lHR:8,rWX:389,rWY:489,rHR:-8,smile:-.35}),key(4000,{...tense,bodyY:4,bodySX:1,bodySY:1,headY:4,headR:-2,eyeY:.82,browLR:13,browRR:-14,lWX:258,lWY:491,lHR:8,rWX:389,rWY:489,rHR:-8,smile:-.35})]
    },
    surprised: {
      name:'Oh!',duration:2800,still:700,
      desc:'A brief recoil opens eyes, hands and wings together; the antennae catch up.',
      beats:[[0,'A small compression before the surprise.'],[450,'Oh!'],[1400,'The surprise becomes interest.']],
      keys:[key(0,pose({})),key(200,pose({bodyY:4,headY:3,eyeY:.45,antennaL:-3,antennaR:3,mouthOpen:.05})),key(560,surprise),key(810,{...surprise,bodyY:-4,antennaL:11,antennaR:-5,wingL:14,wingR:-14}),key(1250,{...surprise,bodyY:-1,headR:-3,eyeY:1.07,mouthOpen:.48,smile:.2,antennaL:8,antennaR:-6}),key(2200,pose({headR:-4,antennaL:5,antennaR:-4,browRY:-5,smile:.8,mouthOpen:.35,wingL:4,wingR:-4})),key(2800,pose({headR:-4,antennaL:5,antennaR:-4,browRY:-5,smile:.8,mouthOpen:.35,wingL:4,wingR:-4}))]
    },
    sad: {
      name:'A quieter moment',duration:4200,still:2450,
      desc:'The hands lose their lift, the antennae soften, and the body takes one quiet breath.',
      beats:[[0,'The energy leaves the hands first.'],[1200,'Head, wings and antennae follow.'],[2200,'One quiet breath.'],[3400,'Room to feel it.']],
      keys:[key(0,pose({})),key(650,pose({lEX:257,lEY:491,lWX:262,lWY:516,lHR:8,rEX:383,rEY:492,rWX:377,rWY:517,rHR:-9,smile:.1,mouthOpen:.04,gazeY:4})),key(1500,sad),key(2280,{...sad,bodyY:4,bodySX:1.008,bodySY:.99,headY:10,eyeY:.52}),key(3090,{...sad,bodyY:7,headY:12,eyeY:.76}),key(4200,sad)]
    },
    fun: {
      name:'Couldn’t help it',duration:3500,still:1400,
      desc:'The grin escapes first, then a short shoulder laugh and a hand half-hiding it.',
      beats:[[0,'Trying to keep a straight face.'],[800,'Nope.'],[1800,'A last little shoulder laugh.'],[2700,'Still amused.']],
      keys:[key(0,pose({})),key(430,pose({headR:-4,gazeX:-4,eyeY:.85,smile:1,mouthOpen:.08,mouthTilt:-5})),key(870,laugh),key(1110,{...laugh,bodyY:-3,headY:-1,bodySY:1.01,bodySX:1.01,antennaL:5,antennaR:1,wingL:6,wingR:-6}),key(1390,{...laugh,bodyY:4,headY:5,bodySY:.975,wingL:11,wingR:-11}),key(1630,{...laugh,bodyY:-2,headY:0,bodySY:1.01,bodySX:1.01,antennaL:4,antennaR:1,wingL:5,wingR:-5}),key(1900,{...laugh,bodyY:3,headY:4,bodySY:.98,mouthOpen:.65}),key(2640,pose({headR:-5,eyeY:.87,smile:1,mouthOpen:.4,antennaL:4,antennaR:-2,rEX:390,rEY:479,rWX:375,rWY:478,rHR:170})),key(3500,pose({headR:-5,eyeY:.87,smile:1,mouthOpen:.4,antennaL:4,antennaR:-2,rEX:390,rEY:479,rWX:375,rWY:478,rHR:170}))]
    },
    peaceful: {
      name:'Very peaceful. Probably.',duration:8000,still:5050,
      desc:'Cross-legged beside a tree. One breath, a long calm pause, a breeze — then one eye checks whether anyone is watching.',
      beats:[[0,'Settling beside the tree.'],[1450,'A breath. Nothing to do.'],[2800,'Very peaceful.'],[3900,'Just a little breeze.'],[4550,'Probably.'],[6300,'Completely composed. Naturally.']],
      keys:[
        key(0,pose({})),
        key(750,{...peaceful,eyeL:.65,eyeR:.65,headY:1,smile:.4}),
        key(1450,peaceful),
        key(2150,{...peaceful,bodyY:1,bodySY:.927,headY:2,antennaL:-2,antennaR:2}),
        key(2800,peaceful),
        key(3700,peaceful),
        key(3860,{...peaceful,treeSway:1.7}),
        key(3980,{...peaceful,treeSway:3,leafTravel:.18,leafLift:2}),
        key(4270,{...peaceful,treeSway:4.2,leafTravel:.72,leafLift:7,antennaR:-7,antennaL:-1}),
        key(4650,{...peek,eyeR:.41,treeSway:-1.3,leafLift:2,smile:.45,mouthTilt:-4}),
        key(5050,{...peek,treeSway:.6}),
        key(5480,{...peek,gazeX:-4,headR:1,antennaR:-7,treeSway:0}),
        key(5840,{...peek,gazeX:0,headR:0,antennaR:-5,smile:.65,mouthTilt:-7}),
        key(6320,{...peaceful,antennaR:-1,eyeR:.035,smile:.4,mouthTilt:-2,leafTravel:1}),
        key(6700,{...peaceful,leafTravel:1}),
        key(8000,{...peaceful,leafTravel:1})
      ]
    }
  };
  const ids = ['body-motion','hands-motion','head','antenna-l','antenna-r','wing-l','wing-r','foot-l','foot-r','eye-l','eye-r','brow-l','brow-r','mouth','glasses','hand-l','hand-r','arm-l-outline','arm-l-fill','arm-r-outline','arm-r-fill','shadow','bulb','tree','tree-trunk','tree-canopy','ground-leaves','wandering-leaf','seated-legs','progress'];
  const nodes = Object.fromEntries(ids.map(id => [id,$(id)]));
  const set = (id, attribute, value) => nodes[id].setAttribute(attribute,value);
  const rotate = (r,x,y) => `rotate(${r} ${x} ${y})`;
  let current = {...base};
  function render(p) {
    current = {...p};
    const bodyTransform=`translate(${p.bodyX} ${p.bodyY}) translate(320 520) rotate(${p.bodyR}) scale(${p.bodySX} ${p.bodySY}) translate(-320 -520)`;
    set('body-motion','transform',bodyTransform);
    set('hands-motion','transform',bodyTransform);
    set('head','transform',`translate(${p.headX} ${p.headY}) ${rotate(p.headR,320,407)}`);
    set('antenna-l','transform',rotate(p.antennaL,302,219));
    set('antenna-r','transform',rotate(p.antennaR,325,213));
    set('wing-l','transform',rotate(p.wingL,278,422));
    set('wing-r','transform',rotate(p.wingR,364,422));
    set('foot-l','transform',`translate(${p.footLX} ${p.footLY}) ${rotate(p.footLR,298,608)}`);
    set('foot-r','transform',`translate(${p.footRX} ${p.footRY}) ${rotate(p.footRR,355,608)}`);
    nodes['foot-l'].style.opacity=1-p.seat;
    nodes['foot-r'].style.opacity=1-p.seat;
    nodes['seated-legs'].style.opacity=p.seat;
    set('seated-legs','transform',`translate(${p.bodyX} 0) translate(320 612) scale(1 ${.35+.65*p.seat}) translate(-320 -612)`);
    nodes.tree.style.opacity=p.tree;
    nodes['ground-leaves'].style.opacity=p.tree;
    set('tree-canopy','transform',rotate(p.treeSway,490,405));
    set('tree-trunk','transform',rotate(p.treeSway*.13,493,612));
    set('wandering-leaf','transform',`translate(${p.leafTravel*43} ${-p.leafLift}) ${rotate(p.leafTravel*36,420,617)}`);
    for (const [side,shoulder,x,y,wx,wy,hr] of [['l',[273,438],p.lEX,p.lEY,p.lWX,p.lWY,p.lHR],['r',[369,438],p.rEX,p.rEY,p.rWX,p.rWY,p.rHR]]) {
      const d = `M${shoulder[0]} ${shoulder[1]} L${x} ${y} L${wx} ${wy}`;
      set(`arm-${side}-outline`,'d',d); set(`arm-${side}-fill`,'d',d);
      set(`hand-${side}`,'transform',`translate(${wx} ${wy}) rotate(${hr})`);
    }
    for (const [side,x,y,tilt] of [['l',283,314,-12],['r',375,306,-14]]) {
      const openness=p.eyeY*(side==='l'?p.eyeL:p.eyeR);
      set(`eye-${side}`,'transform',`translate(${x+p.gazeX} ${y+p.gazeY}) rotate(${tilt}) scale(${p.eyeX} ${Math.max(.045,openness)}) translate(${-x} ${-y})`);
    }
    set('brow-l','transform',`translate(0 ${p.browLY}) ${rotate(p.browLR,277,268)}`);
    set('brow-r','transform',`translate(0 ${p.browRY}) ${rotate(p.browRR,375,259)}`);
    const edge = 360-p.smile*4, center = 360+p.smile*7, right = edge+p.mouthTilt;
    if(p.mouthOpen < .11) {
      set('mouth','d',`M313 ${edge} Q337 ${center+4} 360 ${right}`);nodes.mouth.style.fill='none';
    } else {
      const bottom = Math.max(center+4,edge+p.mouthOpen*35);
      const width = 23*(.56+.44*Math.min(1,Math.abs(p.smile)+.25));
      set('mouth','d',`M${337-width} ${edge} Q337 ${center} ${337+width} ${right} Q${337+width-3} ${bottom} 337 ${bottom} Q${337-width+3} ${bottom} ${337-width} ${edge} Z`);nodes.mouth.style.fill='var(--green)';
    }
    nodes.glasses.style.opacity=p.glasses;set('glasses','transform',`translate(0 ${p.glassesY})`);
    nodes.bulb.style.opacity=p.bulb;set('bulb','transform',`translate(512 204) scale(${p.bulbScale})`);
    set('shadow','transform',`translate(${320+p.bodyX} 612) scale(${p.shadow} 1) translate(-320 -612)`);
  }
  const blend = (a,b,t) => Object.fromEntries(Object.keys(base).map(k => [k,a[k]+(b[k]-a[k])*t]));
  const ease = t => t*t*(3-2*t);
  let selected = 'thought', frame = 0, started = 0, elapsed = 0, running = false, activeKeys = null, beatIndex = -1;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  $('still').checked = reduced.matches;
  function sample(keys,t) {
    const last = keys[keys.length-1];
    if(t>=last.t) return {...last.p};
    for(let i=1;i<keys.length;i++) if(t<=keys[i].t) {
      const before=keys[i-1], after=keys[i];
      return blend(before.p,after.p,ease(Math.max(0,(t-before.t)/(after.t-before.t))));
    }
    return {...keys[0].p};
  }
  function cancel() {cancelAnimationFrame(frame);frame=0;running=false;$('stop').disabled=true;}
  function updateButtons(label) {$('play').textContent=label || ($('still').checked?'Show still pose':'Replay performance');}
  function finish() {cancel();updateButtons();$('stage-caption').textContent=`${clips[selected].name} · Held pose`;}
  function tick(now) {
    if(!running)return;
    elapsed=Math.min(now-started,clips[selected].duration);
    render(sample(activeKeys,elapsed));
    nodes.progress.style.width=`${elapsed/clips[selected].duration*100}%`;
    const beats=clips[selected].beats;
    let next=0;for(let i=0;i<beats.length;i++)if(elapsed>=beats[i][0])next=i;
    if(next!==beatIndex){beatIndex=next;$('stage-caption').textContent=beats[next][1];}
    if(elapsed>=clips[selected].duration){finish();return;}
    frame=requestAnimationFrame(tick);
  }
  function play(restart=true) {
    cancel();
    const clip=clips[selected];
    $('mascot-desc').textContent=`The heyNag moth performs “${clip.name}”. ${clip.desc}`;
    if($('still').checked){render(sample(clip.keys,clip.still));nodes.progress.style.width='100%';$('stage-caption').textContent=`${clip.name} · Still pose`;updateButtons();return;}
    if(restart || !activeKeys){elapsed=0;activeKeys=clip.keys.map((k,i)=>({t:k.t,p:i===0?{...current}:k.p}));beatIndex=-1;}
    running=true;started=performance.now()-elapsed;
    $('stop').disabled=false;$('stop').textContent='Pause';updateButtons('Replay');
    frame=requestAnimationFrame(tick);
  }
  function choose(name) {
    selected=name;activeKeys=null;elapsed=0;
    document.querySelectorAll('[data-clip]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.clip===name)));
    $('beat').textContent=clips[name].desc;play();
  }
  function pause() {
    if(!running)return;
    cancel();$('stop').disabled=false;$('stop').textContent='Resume';$('stage-caption').textContent=`${clips[selected].name} · Paused`;
  }
  function rest() {
    cancel();activeKeys=null;elapsed=0;render(base);nodes.progress.style.width='0%';updateButtons('Play performance');$('stop').textContent='Pause';$('stage-caption').textContent='At rest. Pick a performance.';$('mascot-desc').textContent='The heyNag moth is at rest, smiling with folded wings and relaxed hands.';
  }
  $('play').addEventListener('click',()=>play());
  $('stop').addEventListener('click',()=>running?pause():play(false));
  $('rest').addEventListener('click',rest);
  document.querySelectorAll('[data-clip]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.clip)));
  $('still').addEventListener('change',()=>{if($('still').checked)play();else {cancel();activeKeys=null;updateButtons('Play performance');$('stage-caption').textContent='Motion enabled. Play when you’re ready.';}});
  reduced.addEventListener('change',event=>{if(event.matches){$('still').checked=true;play();}});
  $('theme').addEventListener('click',()=>{
    const dark=document.documentElement.dataset.theme!=='dark';
    document.documentElement.dataset.theme=dark?'dark':'light';$('theme').textContent=dark?'Day':'Night';$('theme').setAttribute('aria-label',`Switch to ${dark?'light':'dark'} background`);
  });
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.metaKey||event.ctrlKey||event.target.matches('input,textarea,select,button,a'))return;
    const names=Object.keys(clips);
    if(/^[1-9]$/.test(event.key)){event.preventDefault();choose(names[Number(event.key)-1]);}
    else if(event.key.toLowerCase()==='p'){event.preventDefault();choose('peaceful');}
    else if(event.code==='Space'){event.preventDefault();if(running)pause();else if(activeKeys&&elapsed<clips[selected].duration)play(false);else play();}
    else if(event.key.toLowerCase()==='r'){event.preventDefault();play();}
    else if(event.key==='0'){event.preventDefault();rest();}
    else if(event.key==='Escape')pause();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)pause();});
  // Antenna edge separation is a material detail, not a color-coded emotion.
  for(const side of ['l','r']) {
    const group=nodes[`antenna-${side}`], original=group.querySelector('path');
    const rim=original.cloneNode();rim.classList.add('night-rim');rim.setAttribute('aria-hidden','true');group.prepend(rim);
  }
  render(base);
  if($('still').checked)updateButtons('Show still pose');
})();

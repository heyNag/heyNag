import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('./motion.js', import.meta.url), 'utf8'), context);
const { neutral, clips, sample, Engine } = context.HeyNagMotion;
const plain = value => JSON.parse(JSON.stringify(value));
const contract = JSON.parse(readFileSync(new URL('./contract.json', import.meta.url), 'utf8'));
const catalogue = JSON.parse(readFileSync(new URL('../expressions/acting.json', import.meta.url), 'utf8'));
function clock() {
  let now = 0, nextID = 0;
  const pending = new Map();
  return {
    now: () => now,
    requestAnimationFrame(fn) { pending.set(++nextID, fn); return nextID; },
    cancelAnimationFrame(id) { pending.delete(id); },
    tick(ms = 1000 / 60) {
      now += ms;
      const callbacks = [...pending.values()]; pending.clear();
      callbacks.forEach(fn => fn(now));
    },
    get pending() { return pending.size; }
  };
}

test('all 24 clips preserve the numeric anatomy contract throughout playback', () => {
  assert.deepEqual(plain(neutral), contract.neutral);
  assert.deepEqual(Object.keys(clips), catalogue.groups.flatMap(group => group.states.map(state => state.id)));
  const signatures = new Set();
  for (const [id, clip] of Object.entries(clips)) {
    assert.ok(clip.stillTime > 0 && clip.stillTime < clip.duration);
    for (let t = 0; t <= clip.duration + 17; t += 1000 / 60) {
      const pose = sample(id, t);
      assert.deepEqual(Object.keys(pose), Object.keys(neutral));
      for (const [key, value] of Object.entries(pose)) assert.ok(Number.isFinite(value), `${id} ${key} ${t}`);
      for (const [side, x, y] of [['L',270,456],['R',368,447]]) {
        assert.ok(Math.hypot(pose[`hand${side}X`]-x, pose[`hand${side}Y`]-y) <= 48.00001, `${id} hand reach`);
      }
      if (id !== 'excited') assert.equal(pose.bodyY, 0, `${id} must stay grounded`);
      for (const key of ['wingLF','wingRF']) assert.ok(pose[key] >= -18 && pose[key] <= 22);
      for (const key of ['wingLH','wingRH']) assert.ok(pose[key] >= -14 && pose[key] <= 25);
    }
    signatures.add(JSON.stringify(sample(id, clip.duration)));
    assert.deepEqual(plain(sample(id, -100)), plain(sample(id, 0)));
    assert.deepEqual(plain(sample(id, clip.duration + 100)), plain(sample(id, clip.duration)));
  }
  assert.equal(signatures.size, 24);
});

test('each performance completes once and leaves no scheduled animation frame', () => {
  for (const [id, clip] of Object.entries(clips)) {
    const scheduler = clock(); let completions = 0;
    const engine = new Engine({scheduler, onChange(info) { if (info.id === id && info.time === info.duration && !info.playing) completions++; }});
    engine.play(id);
    for (let elapsed = 0; elapsed < clip.duration + 100; elapsed += 16) scheduler.tick(16);
    assert.equal(completions, 1, id);
    assert.equal(scheduler.pending, 0, id);
    assert.equal(engine.playing, false);
    assert.deepEqual(plain(engine.pose), plain(sample(id, clip.duration)));
    engine.destroy();
  }
});

test('rapid interruption starts from the actual pose, including a paused pose', () => {
  const scheduler = clock();
  const engine = new Engine({scheduler});
  engine.play('excited'); scheduler.tick(610);
  const before = plain(engine.pose);
  engine.play('sad');
  assert.deepEqual(plain(engine.pose), before);
  scheduler.tick(100);
  engine.pause();
  const paused = plain(engine.pose), time = engine.time;
  scheduler.tick(3000);
  assert.deepEqual(plain(engine.pose), paused);
  assert.equal(engine.time, time);
  assert.equal(scheduler.pending, 0);
  engine.resume();
  assert.deepEqual(plain(engine.pose), paused);
  scheduler.tick(17);
  assert.equal(engine.time, time + 17);
  engine.pause(); const pausedAgain = plain(engine.pose);
  engine.play('thinking');
  assert.deepEqual(plain(engine.pose), pausedAgain);
  assert.equal(scheduler.pending, 1);
  engine.destroy();
  assert.equal(scheduler.pending, 0);
});

test('seek, rest, and reduced-motion playback are deterministic and finite', () => {
  const scheduler = clock();
  const engine = new Engine({scheduler});
  engine.seek('thinking', 2630);
  assert.deepEqual(plain(engine.pose), plain(sample('thinking', 2630)));
  assert.equal(scheduler.pending, 0);
  const before = plain(engine.pose);
  engine.rest();
  assert.deepEqual(plain(engine.pose), before);
  scheduler.tick(400);
  assert.deepEqual(plain(engine.pose), plain(neutral));
  assert.equal(scheduler.pending, 0);
  engine.play('curious'); scheduler.tick(150);
  engine.setReducedMotion(true);
  assert.deepEqual(plain(engine.pose), plain(sample('curious', clips.curious.stillTime)));
  assert.equal(scheduler.pending, 0);
  for (const id of Object.keys(clips)) {
    engine.play(id);
    assert.deepEqual(plain(engine.pose), plain(sample(id, clips[id].stillTime)));
    assert.equal(engine.playing, false);
    assert.equal(scheduler.pending, 0);
  }
  engine.rest();
  assert.deepEqual(plain(engine.pose), plain(neutral));
  engine.destroy();
});

test('distinct wing acting survives in held poses and key motion is independent', () => {
  const wing = id => ['wingLF','wingRF','wingLH','wingRH'].map(key => sample(id, clips[id].duration)[key]);
  for (const pair of [['happy','excited'],['sad','scared'],['curious','aha'],['frustrated','angry']]) assert.notDeepEqual(wing(pair[0]), wing(pair[1]));
  assert.notEqual(sample('thinking',2590).footRR, sample('thinking',2770).footRR);
  assert.notEqual(sample('curious',160).antennaR, sample('curious',0).antennaR);
  assert.ok(sample('excited',720).bodyY < 0);
  assert.equal(sample('excited',clips.excited.duration).bodyY,0);
});

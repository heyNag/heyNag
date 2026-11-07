import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const context = vm.createContext({});
vm.runInContext(source('./motion.js'), context);
vm.runInContext(source('./staging.js'), context);
const M = context.HeyNagMotion;
const S = context.HeyNagStaging;
const phoneHost = {left: 39, top: 500, width: 300, height: 300};
const phoneHeading = {left: 106, top: 300, width: 245, height: 96};
const phone = S.measureDirection(phoneHost, phoneHeading);
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test('target bearing accounts for SVG letterboxing and is invariant to page translation and scale', () => {
  assert.ok(phone.x > 0 && phone.x < 0.2, 'The phone target is only slightly to the right.');
  assert.ok(phone.y < -0.98, 'The phone target is above the eyes.');
  const transform = r => ({left: r.left * 2 + 70, top: r.top * 2 - 600, width: r.width * 2, height: r.height * 2});
  const shifted = S.measureDirection(transform(phoneHost), transform(phoneHeading));
  near(shifted.x, phone.x); near(shifted.y, phone.y);
  near(phone.eye.x, 39 + (300 - 640 * 300 / 660) / 2 + 334 * 300 / 660);
  assert.equal(S.measureDirection({...phoneHost, width: 0}, phoneHeading), null);
  assert.equal(S.measureDirection(phoneHost, {...phoneHeading, top: NaN}), null);
});

test('the notice and entire reading hold look up toward the phone question while preserving the scan', () => {
  for (const id of ['curious-investigate', 'curious-wry']) {
    const gaze = [];
    for (const time of [330, 790, 1190, 1610, 1900]) {
      const staged = S.mapPose(M.sample(id, time), id, time, phone);
      assert.ok(staged.gazeY < -3.5, `${id} at ${time} must not read downward.`);
      assert.ok(staged.gazeX > 0 && staged.gazeX < 1.5);
      assert.ok(staged.gazeX * phone.x + staged.gazeY * phone.y > 0);
      if (time >= 790) {
        assert.ok(staged.headY < 0 && staged.headY >= -3.1);
        assert.ok(Math.abs(staged.headR) < 1);
      }
      gaze.push(staged.gazeY);
    }
    assert.ok(Math.max(...gaze) - Math.min(...gaze) > 0.8, 'Keep a small authored reading scan.');
  }
});

test('only the five attention channels change; visitor return, original curious and anatomy remain exact', () => {
  for (const id of ['curious-investigate', 'curious-wry', 'curious']) {
    const duration = (M.variants[id] || M.clips[id]).duration;
    for (let time = 0; time <= duration; time += 10) {
      const raw = M.sample(id, time), copy = plain(raw);
      const mapped = S.mapPose(raw, id, time, phone);
      assert.deepEqual(plain(raw), copy, 'Mapping must not mutate the engine pose.');
      if (id === 'curious' || time <= 150 || time >= 2350) assert.deepEqual(plain(mapped), copy);
      for (const key of Object.keys(raw)) {
        assert.ok(Number.isFinite(mapped[key]));
        if (!S.adjustedKeys.includes(key)) assert.equal(mapped[key], raw[key], `${key} must remain authored.`);
      }
      for (const key of ['gazeX', 'gazeY']) assert.ok(mapped[key] >= -5 && mapped[key] <= 5);
    }
  }
  const raw = M.sample('curious-investigate', 1190);
  assert.deepEqual(plain(S.mapPose(raw, 'curious-investigate', 1190, {x: 1, y: 0})), plain(raw));
});

test('mid-play and repeated retargeting is continuous, finite and reaches the newest bearing', () => {
  let transition = S.retarget(null, {x: 1, y: 0}, 0, true);
  transition = S.retarget(transition, phone, 100);
  assert.deepEqual(plain(S.directionAt(transition, 100)), {x: 1, y: 0});
  const current = S.directionAt(transition, 240);
  transition = S.retarget(transition, {x: -1, y: 0}, 240);
  assert.deepEqual(plain(S.directionAt(transition, 240)), plain(current));
  for (let t = 240; t <= 620; t++) {
    const dir = S.directionAt(transition, t);
    assert.ok(Number.isFinite(dir.x) && Number.isFinite(dir.y));
  }
  assert.deepEqual(plain(S.directionAt(transition, 620)), {x: -1, y: 0});
});

test('replay carries the currently displayed correction before meeting the new authored entry', () => {
  const raw = M.sample('curious-investigate', 1190);
  const rendered = S.mapPose(raw, 'curious-investigate', 1190, phone);
  const correction = S.correction(raw, rendered);
  const entry = S.mapPose(raw, 'curious-investigate', 0, phone);
  assert.deepEqual(plain(S.carryCorrection(raw, entry, correction, 0)), plain(rendered));
  const later = M.sample('curious-investigate', 380);
  const mappedLater = S.mapPose(later, 'curious-investigate', 380, phone);
  assert.deepEqual(plain(S.carryCorrection(later, mappedLater, correction, 380)), plain(mappedLater));
});

function mountStudy() {
  let now = 0, frameId = 0, layoutReads = 0;
  const pending = new Map(), observers = {};
  class Element {
    constructor(id, value = '') { this.id = id; this.value = value; this.dataset = {}; this.attrs = {}; this.listeners = {}; this.textContent = ''; }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    dispatch(name) { this.listeners[name]?.({target: this}); }
    getBoundingClientRect() { layoutReads++; return {...this.rect}; }
  }
  const ids = ['moth', 'scene', 'question-heading', 'scrub', 'time', 'pause', 'status', 'version', 'play'];
  const elements = Object.fromEntries(ids.map(id => [id, new Element(id)]));
  elements.moth.rect = {...phoneHost}; elements['question-heading'].rect = {...phoneHeading};
  const radios = [new Element('day', 'day'), new Element('night', 'night')];
  const reduced = {matches: false, addEventListener(name, callback) { this.change = callback; }};
  const document = {
    hidden: false, listeners: {}, getElementById: id => elements[id], querySelectorAll: () => radios,
    addEventListener(name, callback) { this.listeners[name] = callback; }
  };
  const ctx = vm.createContext({
    document, matchMedia: () => reduced, performance: {now: () => now},
    requestAnimationFrame(callback) { pending.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { pending.delete(id); },
    addEventListener(name, callback) { observers[name] = callback; },
    ResizeObserver: class { constructor(callback) { observers.layout = callback; } observe() {} },
    IntersectionObserver: class { constructor(callback) { observers.intersection = callback; } observe() {} },
    HeyNagCharacter: class {
      constructor() { this.svg = new Element('svg'); }
      render(pose) { this.pose = {...pose}; }
      setTheme(theme) { this.theme = theme; }
    }
  });
  ctx.window = ctx;
  for (const name of ['./motion.js', './staging.js', './signature.js']) vm.runInContext(source(name), ctx);
  return {
    api: ctx.heyNagSignature, elements, radios, reduced, document, observers,
    get reads() { return layoutReads; }, get scheduled() { return pending.size; },
    tick(ms) { now += ms; const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(now)); }
  };
}

test('controller caches layout, freezes paused resize, preserves theme pose, and resumes a bounded retarget', () => {
  const study = mountStudy(), {api, elements, observers} = study;
  api.engine.seek('curious-investigate', 1190);
  assert.ok(api.staging.renderedPose.gazeY < -3.5, 'Direct inspection uses the cached phone bearing.');
  elements.play.dispatch('click'); study.tick(800); study.tick(390);
  const reads = study.reads, before = plain(api.staging.renderedPose);
  study.tick(20);
  assert.equal(study.reads, reads, 'A character frame must not read DOM layout.');
  elements.pause.dispatch('click');
  const paused = plain(api.staging.renderedPose);
  elements['question-heading'].rect = {left: 450, top: 620, width: 245, height: 96};
  observers.layout();
  assert.deepEqual(plain(api.staging.renderedPose), paused, 'Resize alone must not alter a paused inspection frame.');
  assert.equal(study.scheduled, 0);
  study.radios[1].dispatch('change');
  assert.deepEqual(plain(api.staging.renderedPose), paused, 'Theme only changes paint.');
  elements.pause.dispatch('click');
  study.tick(1);
  for (const key of ['gazeX', 'gazeY', 'headX', 'headY', 'headR']) assert.ok(Math.abs(api.staging.renderedPose[key] - paused[key]) < 0.1);
  study.tick(380);
  assert.ok(api.staging.direction.x > 0.99);
  api.engine.seek('curious-investigate', 1190);
  assert.deepEqual(plain(api.staging.renderedPose), plain(api.staging.rawPose), 'An explicit seek adopts the new horizontal layout.');
  assert.ok(Object.isFrozen(api.staging) && Object.isFrozen(api.staging.renderedPose));
  assert.ok(before.gazeY < -3.5);
});

test('replay starts from the displayed pose and reduced motion never schedules staging animation', () => {
  const study = mountStudy(), {api, elements, reduced} = study;
  api.engine.seek('curious-investigate', 1190);
  const displayed = plain(api.staging.renderedPose);
  elements.play.dispatch('click');
  assert.deepEqual(plain(api.staging.renderedPose), displayed);
  study.tick(100);
  reduced.matches = true; reduced.change();
  assert.equal(api.engine.playing, false);
  assert.equal(study.scheduled, 0);
  assert.deepEqual(plain(api.staging.renderedPose), plain(api.staging.rawPose));
  api.engine.seek('curious-investigate', 1190);
  assert.ok(api.staging.renderedPose.gazeY < -3.5);
  assert.equal(study.scheduled, 0);
  reduced.matches = false; reduced.change();
  assert.equal(study.scheduled, 0);
});

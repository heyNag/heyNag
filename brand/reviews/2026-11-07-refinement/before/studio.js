/* Local motion review; plain scripts also work when opened directly from disk. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const catalogue = window.HEYNAG_EXPRESSIONS;
  const motion = window.HeyNagMotion;
  const Character = window.HeyNagCharacter;
  if (!catalogue || !motion || !Character) {
    $('playback-status').textContent = 'The motion files could not load. Keep this folder together and reload.';
    for (const control of document.querySelectorAll('button,input')) control.disabled = true;
    return;
  }
  const states = catalogue.groups.flatMap(group => group.states);
  const day = new Character($('moth-day'), { theme: 'day' });
  const night = new Character($('moth-night'), { theme: 'night' });
  day.svg.setAttribute('aria-hidden', 'true');
  night.svg.setAttribute('aria-hidden', 'true');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 'thinking';
  let sequence = false;
  let sequenceTimer = null;
  let mode = 'still';
  let lastInfo = {};
  let engine;
  const stateButtons = new Map();
  const thumbnails = [];

  function cancelSequence() {
    sequence = false;
    clearTimeout(sequenceTimer);
    sequenceTimer = null;
    $('sequence').setAttribute('aria-pressed', 'false');
    $('sequence').innerHTML = 'Play all 24 <span aria-hidden="true">↗</span>';
  }
  function updateInfo(info) {
    lastInfo = info;
    const duration = info.duration || motion.clips[selected].duration;
    const time = info.time || 0;
    $('scrub').value = duration ? Math.round(time / duration * 1000) : 0;
    $('scrub').setAttribute('aria-valuetext', `${(time / 1000).toFixed(1)} of ${(duration / 1000).toFixed(1)} seconds`);
    $('timecode').textContent = `${(time / 1000).toFixed(1)} / ${(duration / 1000).toFixed(1)} s`;
    $('pause').disabled = !info.playing && !info.paused;
    $('pause').textContent = info.paused ? 'Resume' : 'Pause';
    const status = reduced.matches ? 'Still pose · reduced motion' : info.paused ? 'Paused' : info.playing ? (sequence ? 'Playing the collection' : 'Playing') : mode === 'rest' ? 'At rest' : mode === 'seek' ? 'Pose inspection' : mode === 'still' ? 'Still pose · press play' : 'Settled · play again';
    // No live-region updates on each animation frame.
    if ($('playback-status').textContent !== status) $('playback-status').textContent = status;
  }
  function onChange(info) {
    updateInfo(info);
    if (sequence && !info.playing && !info.paused && !info.transitioning && info.time >= info.duration && info.duration > 0) {
      clearTimeout(sequenceTimer);
      sequenceTimer = setTimeout(() => {
        const index = states.findIndex(state => state.id === selected);
        if (index === states.length - 1) { cancelSequence(); return; }
        choose(states[index + 1].id, true, true);
      }, 600);
    }
  }
  engine = new motion.Engine({
    onFrame(pose, info) { day.render(pose); night.render(pose); if (info) updateInfo(info); },
    onChange
  });

  function choose(id, animate = true, fromSequence = false) {
    if (!fromSequence) cancelSequence();
    selected = id;
    const index = states.findIndex(state => state.id === id);
    const state = states[index];
    const clip = motion.clips[id];
    document.documentElement.dataset.expression = id;
    $('feeling-name').textContent = state.label;
    $('feeling-number').textContent = `${String(index + 1).padStart(2, '0')} / 24`;
    $('performance-note').textContent = clip.description;
    $('moth-day').setAttribute('aria-label', `${state.label} moth in daylight`);
    $('moth-night').setAttribute('aria-label', `${state.label} moth after dark`);
    for (const [key, button] of stateButtons) button.setAttribute('aria-pressed', String(key === id));
    mode = animate && !reduced.matches ? 'play' : 'still';
    if (animate) engine.play(id);
    else engine.seek(id, clip.stillTime);
  }

  for (const group of catalogue.groups) {
    const section = document.createElement('div');
    section.className = 'feeling-group';
    const heading = document.createElement('h3');
    heading.textContent = group.title;
    section.append(heading);
    const grid = document.createElement('div');
    grid.className = 'feeling-grid';
    for (const state of group.states) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'feeling-button';
      button.dataset.state = state.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `Choose ${state.label.toLowerCase()}`);
      const host = document.createElement('span');
      host.className = 'mini';
      host.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.textContent = state.label;
      button.append(host, name);
      grid.append(button);
      stateButtons.set(state.id, button);
      const thumb = new Character(host, { theme: 'day' });
      thumb.svg.setAttribute('aria-hidden', 'true');
      thumb.render(motion.sample(state.id, motion.clips[state.id].stillTime));
      thumbnails.push(thumb);
      button.addEventListener('click', () => {
        // Bring the performance into view before playing it; no forced focus movement.
        document.querySelector('.player').scrollIntoView({ behavior: 'instant', block: 'start' });
        choose(state.id);
      });
    }
    section.append(grid);
    $('feelings').append(section);
  }

  $('play').addEventListener('click', () => choose(selected));
  $('pause').addEventListener('click', () => {
    if (lastInfo.paused) engine.resume(); else engine.pause();
  });
  $('rest').addEventListener('click', () => { cancelSequence(); mode = 'rest'; engine.rest(); });
  $('scrub').addEventListener('input', event => {
    cancelSequence(); mode = 'seek';
    engine.seek(selected, Number(event.target.value) / 1000 * motion.clips[selected].duration);
  });
  $('sequence').addEventListener('click', () => {
    if (sequence) { cancelSequence(); engine.pause(); return; }
    sequence = true;
    $('sequence').setAttribute('aria-pressed', 'true');
    $('sequence').textContent = 'Stop collection';
    choose(states[0].id, true, true);
  });
  for (const radio of document.querySelectorAll('[name=appearance]')) {
    radio.addEventListener('change', () => { $('stages').dataset.view = radio.value; });
  }
  function applyMotionPreference() {
    cancelSequence();
    engine.setReducedMotion(reduced.matches);
    $('motion-preference').hidden = !reduced.matches;
    $('sequence').disabled = reduced.matches;
    $('play').textContent = reduced.matches ? 'Show feeling' : 'Play feeling';
    choose(selected, false);
  }
  reduced.addEventListener('change', applyMotionPreference);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelSequence(); if (lastInfo.playing) engine.pause(); }
  });
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting && lastInfo.playing) { cancelSequence(); engine.pause(); }
  }, { threshold: 0 });
  observer.observe(document.querySelector('.player'));
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || /INPUT|SELECT|TEXTAREA|BUTTON|SUMMARY|A/.test(event.target.tagName)) return;
    const index = states.findIndex(state => state.id === selected);
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      choose(states[(index + (event.key === 'ArrowRight' ? 1 : states.length - 1)) % states.length].id);
    } else if (event.code === 'Space') {
      event.preventDefault();
      if (lastInfo.playing) engine.pause(); else if (lastInfo.paused) engine.resume(); else choose(selected);
    } else if (event.key === 'Escape') { cancelSequence(); mode = 'rest'; engine.rest(); }
  });
  applyMotionPreference();
  // Public local inspection hook; also useful when integrating the rig into a future site.
  window.heyNagStudio = { engine, day, night, thumbnails, choose, get selected() { return selected; }, get info() { return lastInfo; } };
})();

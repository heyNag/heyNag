(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const motion = HeyNagMotion;
  const staging = HeyNagStaging;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const character = new HeyNagCharacter($('moth'), {theme: 'day'});
  character.svg.setAttribute('aria-hidden', 'true');

  let selected = 'curious-investigate';
  let mode = 'still';
  let last = {};
  let lastFrame = null;
  let rawPose = null;
  let renderedPose = null;
  let replayCorrection = null;
  let stageTime = 0;
  let measured = null;
  let directionTransition = null;

  const descriptions = {
    'curious-investigate': 'The tiny moth notices the question, investigates, then turns back to share it.',
    'curious-wry': 'The tiny moth investigates the question, turns back to share it, then raises a brow with one more thought.',
    'curious': 'The tiny moth tilts its head and looks around with curious eyes and attentive antennae.'
  };
  const clip = () => motion.variants?.[selected] || motion.clips[selected];

  function update(info) {
    last = info;
    const current = clip();
    $('scrub').value = Math.round(info.time / current.duration * 1000);
    $('scrub').setAttribute('aria-valuetext', `${(info.time / 1000).toFixed(1)} of ${(current.duration / 1000).toFixed(1)} seconds`);
    $('time').textContent = `${(info.time / 1000).toFixed(1)} / ${(current.duration / 1000).toFixed(1)} s`;
    $('pause').disabled = !info.playing && !info.paused;
    $('pause').textContent = info.paused ? 'Resume' : 'Pause';
    const status = (mode === 'seek' ? 'Pose inspection' : info.paused ? 'Paused'
      : info.playing ? 'Following the question' : mode === 'still'
        ? (reduce.matches ? 'Still pose' : 'Still pose · press play') : 'Settled · play again')
      + (reduce.matches ? ' · reduced motion' : '');
    if ($('status').textContent !== status) $('status').textContent = status;
  }

  function render(pose, info) {
    if (info && !info.playing && !info.paused) {
      // Also covers direct engine.seek inspection used by the local reviewer.
      // A seek is deliberate; a resize by itself never changes a frozen frame.
      replayCorrection = null;
      useMeasuredDirection(true);
    }
    // The staging clock advances only with the clip. Paused/hidden/reduced
    // motion and static inspection cannot run an independent tween.
    if (info?.playing && lastFrame?.playing && info.id === lastFrame.id && info.time >= lastFrame.time) {
      stageTime += info.time - lastFrame.time;
    }
    lastFrame = info ? {...info} : null;
    rawPose = pose;
    const direction = staging.directionAt(directionTransition, stageTime);
    const mapped = staging.mapPose(pose, info?.id, info?.time, direction);
    renderedPose = staging.carryCorrection(pose, mapped, replayCorrection, info?.time || 0);
    if (info?.time >= staging.transitionDuration) replayCorrection = null;
    character.render(renderedPose);
    if (info) update(info);
  }

  const engine = new motion.Engine({onFrame: render, onChange: update});

  function measureLayout() {
    // Layout reads occur only here, in response to actual layout changes.
    const next = staging.measureDirection($('moth').getBoundingClientRect(), $('question-heading').getBoundingClientRect());
    if (!next) return;
    measured = next;
    if (!directionTransition || last.playing) {
      directionTransition = staging.retarget(directionTransition, next, stageTime, !directionTransition);
    }
    // An inspected/paused frame stays frozen until the next explicit action.
  }

  function useMeasuredDirection(immediate) {
    if (measured) directionTransition = staging.retarget(directionTransition, measured, stageTime, immediate);
  }

  function still() {
    mode = 'still';
    replayCorrection = null;
    useMeasuredDirection(true);
    $('moth').setAttribute('aria-label', descriptions[selected]);
    engine.seek(selected, clip().stillTime);
  }

  $('version').addEventListener('change', event => {
    selected = event.target.value;
    still();
  });
  $('play').addEventListener('click', () => {
    if (reduce.matches) { still(); return; }
    // Carry the displayed correction alongside the engine's raw-pose handoff,
    // so a replay from a staged investigation cannot snap back horizontally.
    replayCorrection = rawPose && renderedPose ? staging.correction(rawPose, renderedPose) : null;
    useMeasuredDirection(false);
    mode = 'play';
    engine.play(selected);
  });
  $('pause').addEventListener('click', () => {
    if (last.paused) {
      useMeasuredDirection(false);
      engine.resume();
    } else engine.pause();
  });
  $('scrub').addEventListener('input', event => {
    mode = 'seek';
    replayCorrection = null;
    useMeasuredDirection(true);
    engine.seek(selected, Number(event.target.value) / 1000 * clip().duration);
  });
  for (const radio of document.querySelectorAll('[name=theme]')) {
    radio.addEventListener('change', () => {
      // Paint changes reuse the exact displayed numeric pose.
      character.setTheme(radio.value);
      $('scene').dataset.theme = radio.value;
    });
  }

  function preference() {
    replayCorrection = null;
    engine.setReducedMotion(reduce.matches);
    $('play').textContent = reduce.matches ? 'Show the thought' : 'Play the thought';
    still();
  }
  reduce.addEventListener('change', preference);
  measureLayout();
  preference();

  const layoutObserver = new ResizeObserver(measureLayout);
  for (const element of [$('scene'), $('moth'), $('question-heading')]) layoutObserver.observe(element);
  window.addEventListener('resize', measureLayout);
  document.fonts?.ready.then(measureLayout);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && engine.playing) engine.pause();
  });
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting && engine.playing) engine.pause();
  });
  observer.observe($('scene'));

  window.heyNagSignature = {
    engine, character,
    get selected() { return selected; },
    get staging() {
      return Object.freeze({
        measured: measured && Object.freeze({...measured,
          eye: Object.freeze({...measured.eye}), target: Object.freeze({...measured.target})}),
        direction: Object.freeze(staging.directionAt(directionTransition, stageTime)),
        rawPose: rawPose && Object.freeze({...rawPose}),
        renderedPose: renderedPose && Object.freeze({...renderedPose}),
        stageTime
      });
    }
  };
})();

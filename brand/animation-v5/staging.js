/* Composition-aware attention for the project-question study only.
 * All functions are pure; layout is measured by signature.js, never per frame.
 */
(function (global) {
  'use strict';
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const ease = value => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };
  const mix = (from, to, amount) => from + (to - from) * amount;
  const supported = new Set(['curious-investigate', 'curious-wry']);
  const adjustedKeys = Object.freeze(['gazeX', 'gazeY', 'headX', 'headY', 'headR']);
  // Matches the existing engine's pose handoff, not the short UI feedback curve.
  const transitionDuration = 380;

  function measureDirection(host, heading) {
    if (![host.left, host.top, host.width, host.height,
      heading.left, heading.top, heading.width, heading.height].every(Number.isFinite)
      || host.width <= 0 || host.height <= 0 || heading.width <= 0 || heading.height <= 0) return null;
    // xMidYMid meet, 640 × 660 viewBox; neutral eye midpoint (334,276.5)
    // plus the rig's fixed +30 artwork offset. Never feed animation into layout.
    const scale = Math.min(host.width / 640, host.height / 660);
    const eye = {
      x: host.left + (host.width - 640 * scale) / 2 + 334 * scale,
      y: host.top + (host.height - 660 * scale) / 2 + 306.5 * scale
    };
    const target = {x: heading.left + heading.width / 2, y: heading.top + heading.height / 2};
    const dx = target.x - eye.x, dy = target.y - eye.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) return null;
    return {x: dx / distance, y: dy / distance, eye, target};
  }

  function attention(time, start, ready) {
    // The existing antenna/gaze/head sequence leads. Return is fully authored
    // again at 2350ms, before the small offering hand arrives.
    return ease((time - start) / (ready - start)) * (1 - ease((time - 1900) / 450));
  }

  function mapPose(pose, id, time, direction) {
    const result = {...pose};
    if (!supported.has(id) || !Number.isFinite(time) || !direction) return result;
    const upward = clamp(-direction.y, 0, 1);
    const gazeAmount = attention(time, 150, 330) * upward;
    const headAmount = attention(time, 330, 790) * upward;
    if (!gazeAmount && !headAmount) return result;
    // Retain the authored scan, reduced to at most 0.75 viewBox units. An
    // above-head question therefore stays above throughout the reading scan.
    const gazeX = clamp(direction.x * 5, -5, 5);
    const gazeY = clamp(direction.y * 4.5 + pose.gazeY * 0.25, -5, 5);
    result.gazeX = mix(pose.gazeX, gazeX, gazeAmount);
    result.gazeY = mix(pose.gazeY, gazeY, gazeAmount);
    result.headX = mix(pose.headX, pose.headX * Math.max(0.2, Math.abs(direction.x)), headAmount);
    result.headY = mix(pose.headY, pose.headY * 0.25 - 3, headAmount);
    result.headR = mix(pose.headR, pose.headR * 0.15, headAmount);
    return result;
  }

  function directionAt(transition, time) {
    if (!transition) return {x: 1, y: 0};
    const amount = ease((time - transition.start) / transitionDuration);
    // No normalization: crossing right-to-left remains finite at its midpoint.
    return {x: mix(transition.from.x, transition.to.x, amount), y: mix(transition.from.y, transition.to.y, amount)};
  }

  function retarget(transition, target, time, immediate = false) {
    const to = {x: target.x, y: target.y};
    return {from: immediate ? to : directionAt(transition, time), to, start: time};
  }

  function correction(raw, rendered) {
    return Object.fromEntries(adjustedKeys.map(key => [key, rendered[key] - raw[key]]));
  }

  function carryCorrection(raw, mapped, from, time) {
    if (!from || time >= transitionDuration) return mapped;
    const amount = ease(time / transitionDuration);
    const result = {...mapped};
    for (const key of adjustedKeys) result[key] = raw[key] + mix(from[key], mapped[key] - raw[key], amount);
    return result;
  }

  global.HeyNagStaging = Object.freeze({
    measureDirection, mapPose, directionAt, retarget, correction, carryCorrection,
    adjustedKeys, transitionDuration
  });
})(typeof window !== 'undefined' ? window : globalThis);

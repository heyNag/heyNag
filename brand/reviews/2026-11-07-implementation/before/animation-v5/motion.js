/* V5 motion catalogue. Geometry lives in character.js; this file never scales anatomy.
 * IDs and acting choices follow ../expressions/acting.json.
 * Scheduler injection: new Engine({scheduler: {now, requestAnimationFrame, cancelAnimationFrame}}).
 */
(function (global) {
  'use strict';

  const neutral = Object.freeze({
    bodyX: 0, bodyY: 0, bodyR: 0,
    headX: 0, headY: 0, headR: 0,
    antennaL: 0, antennaR: 0,
    wingLF: 0, wingRF: 0, wingLH: 0, wingRH: 0,
    handLX: 255, handLY: 478, handLR: 0,
    handRX: 387, handRY: 444, handRR: 0,
    footLR: 0, footRR: 0,
    eyeL: 1, eyeR: 1, eyeJoy: 0,
    gazeX: 0, gazeY: 0,
    browL: 0, browR: 0, browLY: 0, browRY: 0,
    mouthSmile: 0.75, mouthOpen: 0.35, mouthO: 0,
    mouthX: 0, glasses: 0, glassesY: 0,
    bulb: 0, heart: 0, tear: 0, breath: 0
  });
  const keys = Object.keys(neutral);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
  const ease = value => value * value * (3 - 2 * value);
  // Authored per-channel tangents are SVG units (or degrees) per millisecond.
  // Unspecified channels keep their deliberate eased stops.
  const hermite = (a, b, amount, duration, outgoing, incoming) => {
    const t2 = amount * amount, t3 = t2 * amount;
    return (2 * t3 - 3 * t2 + 1) * a + (t3 - 2 * t2 + amount) * duration * outgoing
      + (-2 * t3 + 3 * t2) * b + (t3 - t2) * duration * incoming;
  };
  const ranges = {
    bodyX: [-5, 5], bodyY: [-18, 0], bodyR: [-2.5, 2.5],
    headX: [-8, 8], headY: [-7, 9], headR: [-8, 8],
    antennaL: [-20, 20], antennaR: [-20, 20],
    wingLF: [-18, 22], wingRF: [-18, 22], wingLH: [-14, 25], wingRH: [-14, 25],
    handLR: [-38, 38], handRR: [-38, 38], footLR: [-12, 12], footRR: [-12, 12],
    eyeL: [0, 1.15], eyeR: [0, 1.15], eyeJoy: [-1, 1],
    gazeX: [-5, 5], gazeY: [-5, 5],
    browL: [-18, 18], browR: [-18, 18], browLY: [-9, 9], browRY: [-9, 9],
    mouthSmile: [-1, 1], mouthOpen: [0, 1], mouthO: [0, 1], mouthX: [-4, 4],
    glasses: [0, 1], glassesY: [-4, 4], bulb: [0, 1], heart: [0, 1], tear: [0, 1], breath: [0, 1]
  };

  function pose(patch) {
    const result = {};
    for (const key of keys) {
      const value = finite(patch && patch[key], neutral[key]);
      result[key] = ranges[key] ? clamp(value, ranges[key][0], ranges[key][1]) : value;
    }
    // The small wrist discs are convex, so normal keyframe interpolation also stays in reach.
    for (const [side, x, y] of [['L', 270, 456], ['R', 368, 447]]) {
      const dx = result[`hand${side}X`] - x;
      const dy = result[`hand${side}Y`] - y;
      const distance = Math.hypot(dx, dy);
      if (distance > 48) {
        result[`hand${side}X`] = x + dx * 48 / distance;
        result[`hand${side}Y`] = y + dy * 48 / distance;
      }
    }
    return result;
  }

  function mix(a, b, amount) {
    const result = {};
    for (const key of keys) result[key] = a[key] + (b[key] - a[key]) * amount;
    return result;
  }

  const clips = {};
  const catalogue = new Map((global.HEYNAG_EXPRESSIONS?.groups || [])
    .flatMap(group => group.states.map(state => [state.id, {...state, group: group.id}])));

  function add(id, label, duration, stillTime, description, target, frames) {
    const settled = Object.freeze(pose(target));
    const keyframes = [{time: 0, pose: neutral, inherited: Object.freeze([...keys])}];
    for (const [time, patch, base, tangents = {}] of frames) {
      keyframes.push({time, pose: Object.freeze(pose({...(base === 'neutral' ? neutral : settled), ...patch})),
        inherited: Object.freeze(base === 'neutral' ? keys.filter(key => !Object.hasOwn(patch, key)) : []),
        tangents: Object.freeze(Object.fromEntries(Object.entries(tangents)
          .map(([key, value]) => [key, Object.freeze(Array.isArray(value) ? [...value] : [value, value])])))});
    }
    keyframes.push({time: duration, pose: settled});
    for (const frame of keyframes) Object.freeze(frame);
    clips[id] = Object.freeze({
      id, label: catalogue.get(id)?.label || label, duration, stillTime, description,
      group: catalogue.get(id)?.group || (Object.keys(clips).length < 6 ? 'anchors' : Object.keys(clips).length < 12 ? 'joy' : Object.keys(clips).length < 18 ? 'mind' : 'tender'),
      keyframes: Object.freeze(keyframes)
    });
  }

  // Each pose is a held emotional silhouette, not a shared idle with a different face.
  // Frame patches are relative to that settled pose unless explicitly marked neutral.
  // Antenna bends are screen-space rotations: L+ / R- perks tips upward;
  // L- / R+ lowers them. Sideward attention and recoil intentionally break that pairing.
  add('curious', 'Curious', 2800, 1160,
    'The long antenna notices first; gaze, head and body follow, one wing opens toward the interest, then a glance shares the discovery.',
    {headX: 4, headY: 1, headR: 3, bodyR: 0.7, antennaL: 3, antennaR: 9,
      gazeX: 1, gazeY: -1, browL: -5, browR: 4, browLY: -4, browRY: -1,
      mouthSmile: 0.4, mouthOpen: 0.03, wingLF: -2, wingRF: 9, wingLH: 1, wingRH: 5,
      handLX: 260, handLY: 479, handRX: 378, handRY: 472},
    [[160, {antennaR: 14, antennaL: -1}, 'neutral'],
      [320, {antennaR: 14, antennaL: 2, gazeX: 5, gazeY: -2, browRY: -4}, 'neutral'],
      [680, {headX: 6, headR: 5, bodyR: 0, gazeX: 5, antennaR: 14, wingRF: 11, wingRH: 2}],
      [1160, {headX: 6, headR: 5, bodyR: 1.1, gazeX: 5, wingRF: 12, wingRH: 7}],
      [1620, {headX: 5, headR: 4, gazeX: 5}],
      [2040, {gazeX: -1, gazeY: 0, headR: 2, mouthSmile: 0.6}],
      [2400, {}]]);

  add('thinking', 'Thinking', 4100, 1400,
    'The head meets a short chin mitten, glasses settle, one tiny chin nod considers the thought, and one heel-pivot toe tap punctuates it.',
    {headY: 7, headR: -3, antennaL: -4, antennaR: -8,
      gazeX: -2, gazeY: -4, browL: -9, browR: 4, browLY: -3, browRY: 1,
      eyeL: 0.93, eyeR: 0.93, mouthSmile: 0.25, mouthOpen: 0,
      glasses: 1, handLX: 281, handLY: 479, handLR: 8,
      handRX: 338, handRY: 423, handRR: -20,
      wingLF: -7, wingRF: -8, wingLH: 1, wingRH: 2},
    [[420, {glasses: 1, glassesY: 2, gazeY: -2, handLX: 276, handLY: 479, handRX: 354, handRY: 436, mouthOpen: 0}, 'neutral'],
      [980, {headY: 5, glassesY: 0, antennaR: -10}],
      [1400, {}], [1730, {headY: 5, handRY: 421, gazeY: -5}],
      [1920, {headY: 8, handRY: 424}], [2130, {}],
      [2590, {footRR: -10}], [2770, {footRR: 0}], [3350, {}]]);

  add('happy', 'Happy', 2500, 1050,
    'A small head lift welcomes the viewer while two tiny mittens rise and the four wings open into an easy held smile.',
    {headY: -2, antennaL: -4, antennaR: 4, eyeL: 1.04, eyeR: 1.04,
      browLY: -3, browRY: -3, mouthSmile: 0.95, mouthOpen: 0.5,
      handLX: 252, handLY: 449, handLR: -15, handRX: 386, handRY: 430, handRR: 14,
      wingLF: 6, wingRF: 7, wingLH: 4, wingRH: 5},
    [[300, {headY: 2, eyeL: 0.85, eyeR: 0.85, wingLF: -3, wingRF: -3, mouthOpen: 0.2}, 'neutral'],
      [760, {headY: -5, antennaL: -7, antennaR: 7, wingLF: 9, wingRF: 10, wingLH: 3, wingRH: 4}],
      [1050, {antennaL: -6, antennaR: 8, wingLH: 6, wingRH: 7}], [1700, {}], [2180, {}]]);

  add('mischievous', 'Mischievous', 3100, 1550,
    'A peaceful pretend-sleep pose hides one soft half-eye peek; the long antenna betrays the joke while the wings stay tucked.',
    {headR: 3, headY: 2, antennaL: -9, antennaR: -7,
      eyeL: 0.04, eyeR: 0.4, eyeJoy: 0.75, gazeX: 2,
      browL: -1, browR: -4, browRY: -3, mouthSmile: 0.6, mouthOpen: 0,
      handLX: 286, handLY: 466, handLR: 12, handRX: 365, handRY: 414, handRR: -13,
      wingLF: -7, wingRF: -6, wingLH: 1, wingRH: 3},
    [[440, {eyeL: 0.05, eyeR: 0.05, eyeJoy: 0.8, headY: 3, antennaL: -9, antennaR: 5, mouthSmile: 0.4, mouthOpen: 0}, 'neutral'],
      [910, {eyeR: 0.04, antennaR: 3, wingRF: -8}],
      [1250, {eyeR: 0.48, antennaR: -10, gazeX: 3}],
      [1550, {eyeR: 0.48, antennaR: -9}], [2190, {eyeR: 0.08, antennaR: -6}],
      [2520, {eyeR: 0.38}], [2800, {}]]);

  add('aha', 'Aha', 2800, 1390,
    'A brief thoughtful dip becomes a bright discovery; one mitten lifts and the wings answer with a delayed asymmetric opening.',
    {headY: -4, headR: -1, antennaL: 6, antennaR: -12,
      eyeL: 1.09, eyeR: 1.09, browLY: -6, browRY: -6,
      mouthSmile: 0.8, mouthOpen: 0.6, mouthO: 0.2,
      handLX: 274, handLY: 478, handRX: 380, handRY: 414, handRR: 24,
      wingLF: 7, wingRF: 14, wingLH: 4, wingRH: 9, bulb: 1},
    [[390, {headY: 5, eyeL: 0.7, eyeR: 0.7, gazeY: -3, antennaR: 6, wingLF: -5, wingRF: -5, mouthOpen: 0}, 'neutral'],
      [700, {bulb: 0.4, antennaR: -4, antennaL: 2, wingLF: 0, wingRF: 2, wingLH: 0, wingRH: 0}],
      [950, {antennaR: -18, antennaL: 9, wingLF: 5, wingRF: 16, wingLH: 1, wingRH: 4}],
      [1390, {wingLF: 9, wingRF: 17, wingLH: 7, wingRH: 12}], [2060, {}], [2450, {}]]);

  add('oops', 'Oops', 3000, 1430,
    'A small freeze and sideways glance lead the lower cheek to one tiny mitten; the wings hesitate unevenly and settle close.',
    {headY: 4, headR: -4, antennaL: -13, antennaR: 2,
      gazeX: -3, gazeY: 1, browL: -10, browR: 5, browLY: -3, browRY: 1,
      mouthSmile: 0.25, mouthOpen: 0.08,
      handLX: 247, handLY: 470, handLR: -17, handRX: 366, handRY: 416, handRR: -17,
      wingLF: -7, wingRF: -3, wingLH: 1, wingRH: 4},
    [[320, {eyeL: 1.1, eyeR: 1.1, mouthSmile: 0, mouthOpen: 0.35, mouthO: 0.8, antennaR: -8}, 'neutral'],
      [640, {gazeX: -4, headY: 1, handRX: 377, handRY: 433, wingRF: 3}],
      [1070, {headY: 6, antennaL: -17, wingLF: -9, wingRF: -5}],
      [1430, {}], [2170, {gazeX: -1, mouthSmile: 0.4}], [2650, {}]]);

  add('laughing', 'Laughing', 3100, 1450,
    'Two little head chuckles keep the feet grounded; a lower-mouth mitten and two diminishing wing responses share the laugh.',
    {headR: -2, headY: -2, antennaL: -7, antennaR: 7,
      eyeL: 0.03, eyeR: 0.03, eyeJoy: 1, browLY: -2, browRY: -2,
      mouthSmile: 1, mouthOpen: 0.9,
      handLX: 285, handLY: 475, handRX: 365, handRY: 416, handRR: -12,
      wingLF: 10, wingRF: 8, wingLH: 6, wingRH: 5},
    [[380, {headY: 3, eyeL: 0.65, eyeR: 0.65, mouthSmile: 0.9, mouthOpen: 0.3, wingLF: -1, wingRF: -2}, 'neutral'],
      [760, {headY: -6, headR: -4, wingLF: 14, wingRF: 12, antennaL: -11, antennaR: 12}],
      [1050, {headY: 2, mouthOpen: 0.55, wingLF: 7, wingRF: 5}],
      [1450, {headY: -4, headR: -3, mouthOpen: 0.95, wingLF: 12, wingRF: 10, wingLH: 9, wingRH: 7}],
      [1800, {headY: 1, mouthOpen: 0.7}], [2340, {}], [2740, {}]]);

  add('excited', 'Excited', 3000, 720,
    'A tiny whole-character hop lifts the unchanged stub feet; one brief two-beat wing flutter lands into a broad held delight.',
    {headY: -3, antennaL: 10, antennaR: -12,
      eyeL: 1.12, eyeR: 1.12, browLY: -7, browRY: -7,
      mouthSmile: 1, mouthOpen: 0.85,
      handLX: 255, handLY: 422, handLR: -24, handRX: 383, handRY: 414, handRR: 24,
      wingLF: 14, wingRF: 14, wingLH: 10, wingRH: 11},
    [[380, {headY: 6, eyeL: 0.85, eyeR: 0.85, wingLF: -6, wingRF: -6, wingLH: 0, wingRH: 1, mouthSmile: 0.95}, 'neutral'],
      [720, {bodyY: -17, headY: -5, antennaL: 16, antennaR: -17, wingLF: 18, wingRF: 18, wingLH: 14, wingRH: 14}],
      // The wing beat reverses at 900ms; the body continues falling through it.
      [900, {bodyY: -11, wingLF: 8, wingRF: 9, wingLH: 5, wingRH: 6}, null, {bodyY: 0.05}],
      // Landing absorbs downward speed; head compression supplies the settle.
      [1060, {bodyY: 0, headY: 4, antennaL: -7, antennaR: 8, wingLF: 17, wingRF: 18, wingLH: 13, wingRH: 14}, null, {bodyY: [0.075, 0]}],
      [1410, {headY: -4, antennaL: 13, antennaR: -15}],
      [2060, {}], [2650, {}]]);

  add('proud', 'Proud', 3000, 1300,
    'A modest chin lift and tiny belly mittens receive one measured wing opening, with no taller torso or wider stance.',
    {headY: -4, headR: -1, antennaL: 3, antennaR: -5,
      eyeL: 0.04, eyeR: 0.04, eyeJoy: 0.9, browLY: -2, browRY: -2,
      mouthSmile: 0.6, mouthOpen: 0,
      handLX: 298, handLY: 464, handLR: 16, handRX: 341, handRY: 462, handRR: -16,
      wingLF: 11, wingRF: 11, wingLH: 8, wingRH: 8},
    [[430, {headY: 2, eyeL: 0.8, eyeR: 0.8, mouthSmile: 0.45, mouthOpen: 0, wingLF: -2, wingRF: -2}, 'neutral'],
      [910, {headY: -6, wingLF: 7, wingRF: 7, wingLH: 3, wingRH: 3}],
      [1300, {antennaL: 5, antennaR: -7, wingLF: 13, wingRF: 13, wingLH: 9, wingRH: 9}],
      [2150, {}], [2650, {}]]);

  add('grateful', 'Grateful', 3200, 1350,
    'The small mittens meet below the ruff before one gentle acknowledgment bow, and four wings fold softly rather than flap.',
    {headY: 4, headR: 1, antennaL: -4, antennaR: 6,
      eyeL: 0.97, eyeR: 0.97, gazeY: 0, browL: -5, browR: 5, browLY: -2, browRY: -2,
      mouthSmile: 0.55, mouthOpen: 0,
      handLX: 306, handLY: 451, handLR: 24, handRX: 333, handRY: 451, handRR: -24,
      wingLF: -6, wingRF: -6, wingLH: 2, wingRH: 2},
    [[490, {handLX: 292, handLY: 456, handRX: 348, handRY: 456, mouthOpen: 0, mouthSmile: 0.5}, 'neutral'],
      [960, {headY: 8, eyeL: 0.35, eyeR: 0.35, eyeJoy: 0.6, gazeY: 2, antennaL: -8, antennaR: 10, wingLF: -9, wingRF: -9}],
      [1350, {headY: 6, eyeL: 0.95, eyeR: 0.95}],
      [1950, {headY: 3, eyeL: 0.98, eyeR: 0.98}], [2700, {}]]);

  add('affectionate', 'Affectionate', 3200, 1440,
    'A warm head tilt gathers tiny mittens below the ruff while the wings cup the body and one small heart appears.',
    {headR: 6, headY: 2, antennaL: -8, antennaR: 9,
      eyeL: 0.08, eyeR: 0.08, eyeJoy: 0.95, browLY: -2, browRY: -2,
      mouthSmile: 0.75, mouthOpen: 0.12,
      handLX: 300, handLY: 447, handLR: 20, handRX: 340, handRY: 440, handRR: -20,
      wingLF: -5, wingRF: -5, wingLH: 6, wingRH: 6, heart: 1},
    [[470, {headR: -1, eyeL: 0.75, eyeR: 0.75, mouthSmile: 0.7, handLX: 286, handLY: 458, handRX: 353, handRY: 451}, 'neutral'],
      [990, {headR: 7, heart: 0.5, antennaL: -11, antennaR: 12, wingLF: -8, wingRF: -7, wingLH: 3, wingRH: 3}],
      [1440, {wingLH: 8, wingRH: 8}], [2250, {}], [2800, {}]]);

  add('shy', 'Shy', 3400, 1520,
    'A downward sideways glance leads a small head dip, low tucked mittens and a protective wing close with the lower fans still visible.',
    {headX: -3, headY: 6, headR: -5, antennaL: -6, antennaR: 9,
      eyeL: 0.95, eyeR: 0.95, gazeX: -4, gazeY: 4,
      browL: -5, browR: 5, browLY: -1, browRY: -1,
      mouthSmile: 0.35, mouthOpen: 0,
      handLX: 295, handLY: 477, handLR: 15, handRX: 346, handRY: 475, handRR: -15,
      footLR: 3, footRR: -3, wingLF: -9, wingRF: -8, wingLH: 2, wingRH: 3},
    [[360, {gazeX: -3, gazeY: 3, eyeL: 0.94, eyeR: 0.94, mouthOpen: 0.05}, 'neutral'],
      [880, {headY: 8, headR: -7, wingLF: -5, wingRF: -4, antennaL: -3, antennaR: 5}],
      [1520, {wingLF: -11, wingRF: -10, wingLH: 3, wingRH: 4}],
      [2300, {gazeX: -2, headR: -4}], [2890, {}]]);

  add('confused', 'Confused', 3200, 1470,
    'An uncertain glance becomes a retreating head tilt and two low questioning mittens; opposing wing positions preserve the imbalance.',
    {headX: -3, headY: 3, headR: -5, antennaL: 11, antennaR: 8,
      eyeL: 0.88, eyeR: 1.04, gazeX: -1,
      browL: -9, browR: -3, browLY: -4, browRY: 2,
      mouthSmile: -0.35, mouthOpen: 0.02, mouthX: 2,
      handLX: 241, handLY: 459, handLR: -28, handRX: 399, handRY: 450, handRR: 28,
      wingLF: 6, wingRF: -7, wingLH: 6, wingRH: 1},
    [[340, {gazeX: 3, gazeY: -1, mouthOpen: 0, mouthSmile: 0.1, antennaR: 5}, 'neutral'],
      [840, {headR: 4, headX: 1, antennaL: -6, antennaR: -5, wingLF: -4, wingRF: 5, wingLH: 1, wingRH: 5}],
      [1470, {headR: -7, headX: -5, antennaL: 15, antennaR: 10, wingLF: 9, wingRF: -9}],
      [2240, {}], [2810, {}]]);

  add('focused', 'Focused', 3400, 1330,
    'The glasses settle around a steady gaze; two separated low mittens leave the face clear while head and antennae attend and the wings close once.',
    {headY: 5, headR: 0, antennaL: 5, antennaR: -7,
      eyeL: 0.8, eyeR: 0.8, gazeX: 0, gazeY: 3,
      browL: 5, browR: -5, browLY: 1, browRY: 1,
      mouthSmile: 0, mouthOpen: 0, glasses: 1,
      handLX: 280, handLY: 484, handLR: 4, handRX: 366, handRY: 482, handRR: -4,
      wingLF: -8, wingRF: -8, wingLH: 0, wingRH: 0},
    [[430, {glasses: 1, glassesY: 2, gazeY: 3, mouthSmile: 0.1, mouthOpen: 0, antennaL: 2, antennaR: -3}, 'neutral'],
      [920, {headY: 7, glassesY: 0, wingLF: -5, wingRF: -5}],
      [1330, {antennaL: 7, antennaR: -10, wingLF: -10, wingRF: -10}],
      [2360, {}], [2940, {}]]);

  add('skeptical', 'Skeptical', 3000, 1330,
    'One brow questions, the head draws back a fraction and the folded mittens stay small; the wings hold an understated uneven close.',
    {headX: -2, headY: -1, headR: -3, antennaL: -2, antennaR: -10,
      eyeL: 0.64, eyeR: 0.48, gazeX: 2,
      browL: -10, browR: 1, browLY: -5, browRY: 1,
      mouthSmile: -0.05, mouthOpen: 0, mouthX: -1,
      handLX: 299, handLY: 466, handLR: 18, handRX: 341, handRY: 461, handRR: -18,
      wingLF: -4, wingRF: -8, wingLH: 2, wingRH: 0},
    [[430, {browL: -12, browLY: -6, gazeX: 2, mouthSmile: 0, mouthOpen: 0}, 'neutral'],
      [920, {headX: -4, headR: -5, antennaR: -14, eyeR: 0.38}],
      [1330, {}], [2230, {}], [2630, {}]]);

  add('surprised', 'Surprised', 2600, 850,
    'A quick upright startle opens an O-mouth and two low empty mittens, followed by a broad four-panel wing opening and a measured settle.',
    {headY: -3, antennaL: 6, antennaR: -10,
      eyeL: 1.12, eyeR: 1.12, browLY: -7, browRY: -7,
      mouthSmile: 0, mouthOpen: 0.65, mouthO: 1,
      handLX: 239, handLY: 453, handLR: -24, handRX: 400, handRY: 445, handRR: 24,
      wingLF: 13, wingRF: 13, wingLH: 9, wingRH: 10},
    [[320, {eyeL: 0.9, eyeR: 0.9, headY: 1, mouthOpen: 0.1, wingLF: -2, wingRF: -2}, 'neutral'],
      [540, {headY: -6, antennaL: 11, antennaR: -17, wingLF: 7, wingRF: 7, wingLH: 1, wingRH: 2}],
      [850, {wingLF: 18, wingRF: 18, wingLH: 13, wingRH: 14}],
      [1550, {headY: -4, wingLF: 15, wingRF: 15}], [2220, {}]]);

  add('relieved', 'Relieved', 3400, 1620,
    'A short tense pause melts into one long exhale, a lowered head and wings that sink in sequence while the free mitten loosens.',
    {headY: 5, headR: 2, antennaL: -8, antennaR: 9,
      eyeL: 0.04, eyeR: 0.04, eyeJoy: 0.55,
      mouthSmile: 0.1, mouthOpen: 0.2, mouthO: 0.5,
      handLX: 298, handLY: 450, handLR: 16, handRX: 396, handRY: 464, handRR: 17,
      wingLF: -7, wingRF: -8, wingLH: 2, wingRH: 1, breath: 0.6},
    [[470, {headY: 1, eyeL: 0.8, eyeR: 0.8, browL: -5, browR: 5, mouthOpen: 0, antennaL: 4, antennaR: -5, wingLF: 4, wingRF: 4}, 'neutral'],
      [1030, {headY: 4, antennaL: -4, antennaR: 4, breath: 0.3, wingLF: -3, wingRF: -3, wingLH: 5, wingRH: 5}],
      [1350, {headY: 7, breath: 0.85, antennaL: -6, antennaR: 7, wingLF: -8, wingRF: -9}],
      [1620, {headY: 7, breath: 1, antennaL: -12, antennaR: 14, wingLF: -10, wingRF: -11}],
      [2390, {breath: 0.7}], [2960, {}]]);

  add('sleepy', 'Sleepy', 4100, 1910,
    'Heavy lids lower into one yawn and a cheek-rubbing mitten; the head nods once and the wing panels sag into a quiet held drowse.',
    {headY: 7, headR: 5, antennaL: -12, antennaR: 15,
      eyeL: 0.2, eyeR: 0.2, eyeJoy: -0.2, gazeY: 2,
      browLY: 1, browRY: 1, mouthSmile: 0.1, mouthOpen: 0.12, mouthO: 0.35,
      handLX: 276, handLY: 481, handRX: 367, handRY: 416, handRR: -13,
      wingLF: -10, wingRF: -9, wingLH: 1, wingRH: 2},
    [[620, {eyeL: 0.55, eyeR: 0.55, headY: 3, antennaL: -2, antennaR: 3, mouthOpen: 0.1}, 'neutral'],
      [1260, {headR: 3, mouthOpen: 0.72, mouthO: 0.9, eyeL: 0.08, eyeR: 0.08, handRY: 414, wingLF: -6, wingRF: -6}],
      [1610, {headY: 5, headR: 4, mouthOpen: 0.65, mouthO: 0.9, handRY: 411}],
      [1910, {headY: 9, headR: 6, mouthOpen: 0.45, mouthO: 0.8, handRY: 417, antennaL: -16, antennaR: 19}],
      [2070, {headY: 8, headR: 6, mouthOpen: 0.35, mouthO: 0.65, handRY: 417, antennaL: -18, antennaR: 20}],
      [2700, {headY: 6, handRY: 415, mouthOpen: 0.15}], [3540, {}]]);

  add('sad', 'Sad', 3800, 1700,
    'The gaze falls before the head bows; empty mittens lower, the forewings sink and a single small tear supports the quiet held sadness.',
    {headY: 7, headR: -3, antennaL: -13, antennaR: 15,
      eyeL: 0.78, eyeR: 0.78, eyeJoy: -0.6, gazeY: 4,
      browL: -13, browR: 13, browLY: -2, browRY: -2,
      mouthSmile: -0.7, mouthOpen: 0,
      handLX: 265, handLY: 486, handRX: 375, handRY: 482,
      wingLF: -10, wingRF: -11, wingLH: 2, wingRH: 1, tear: 0.8},
    [[530, {gazeY: 4, mouthSmile: -0.25, mouthOpen: 0, browL: -7, browR: 7}, 'neutral'],
      [930, {headY: 5, tear: 0, antennaL: -2, antennaR: 3, wingLF: -4, wingRF: -5, wingLH: 3, wingRH: 3}],
      [1130, {headY: 5, tear: 0, antennaL: -8, antennaR: 9, wingLF: -6, wingRF: -7, wingLH: 3, wingRH: 3}],
      [1700, {headY: 9, antennaL: -17, antennaR: 19, tear: 0.7}],
      [2670, {}], [3310, {}]]);

  add('worried', 'Worried', 3400, 1510,
    'An unresolved sideways glance draws one mitten inward above a lower supporting mitten; the head gathers and the forewings close protectively.',
    {headY: 5, headR: 2, antennaL: 10, antennaR: -10,
      eyeL: 0.97, eyeR: 0.97, gazeX: 4, gazeY: -1,
      browL: -12, browR: 12, browLY: -2, browRY: -2,
      mouthSmile: -0.32, mouthOpen: 0.02, mouthX: 2,
      handLX: 296, handLY: 480, handLR: 14, handRX: 343, handRY: 454, handRR: -18,
      wingLF: -9, wingRF: -8, wingLH: 1, wingRH: 3},
    [[400, {gazeX: 4, browL: -7, browR: 7, mouthSmile: 0, mouthOpen: 0, antennaR: -5}, 'neutral'],
      [970, {headY: 7, antennaL: 13, antennaR: -14, wingLF: -6, wingRF: -5}],
      [1510, {gazeX: 5, wingLF: -12, wingRF: -10, wingLH: 2, wingRH: 4}],
      [2170, {gazeX: 2, headR: 1}], [2940, {}]]);

  add('scared', 'Scared', 3000, 1050,
    'A compact recoil brings the head to two lower-cheek mittens; the forewings shield inward while the hindwing fans stay visible.',
    {headX: -4, headY: 7, headR: -3, bodyR: -1.2,
      antennaL: -10, antennaR: -14,
      eyeL: 1.12, eyeR: 1.12, gazeX: 3,
      browL: -12, browR: 12, browLY: -6, browRY: -6,
      mouthSmile: -0.1, mouthOpen: 0.65, mouthO: 1,
      handLX: 276, handLY: 418, handLR: 12, handRX: 363, handRY: 410, handRR: -12,
      wingLF: -15, wingRF: -14, wingLH: 10, wingRH: 11},
    [[340, {gazeX: 4, eyeL: 1.06, eyeR: 1.06, mouthSmile: 0, mouthOpen: 0.25, mouthO: 0.7, antennaR: -6}, 'neutral'],
      [590, {headX: -6, headY: 9, bodyR: -2, antennaL: -17, antennaR: -20, wingLF: -5, wingRF: -4, wingLH: 3, wingRH: 4}],
      [1050, {wingLF: -17, wingRF: -16, wingLH: 12, wingRH: 13}],
      [1800, {headX: -5, headY: 8}], [2530, {}]]);

  add('frustrated', 'Frustrated', 3400, 1600,
    'Closed eyes and compact under-ruff mittens hold a small inward protest, with one heel-pivot toe tap and uneven wing tension that releases.',
    {headY: 5, headR: -2, antennaL: 11, antennaR: 8,
      eyeL: 0.03, eyeR: 0.03, eyeJoy: -0.85,
      browL: 12, browR: -9, browLY: 2, browRY: 1,
      mouthSmile: -0.6, mouthOpen: 0, mouthX: 1,
      handLX: 286, handLY: 435, handLR: 19, handRX: 350, handRY: 427, handRR: -19,
      wingLF: -4, wingRF: -8, wingLH: 5, wingRH: 1},
    [[410, {headY: 3, eyeL: 0.5, eyeR: 0.5, mouthSmile: -0.2, mouthOpen: 0, browL: 6, browR: -6}, 'neutral'],
      [940, {headY: 7, antennaL: 17, antennaR: 13, wingLF: 4, wingRF: -9, wingLH: 8, wingRH: 0}],
      [1370, {footRR: -11, headR: -4}],
      [1600, {footRR: 0, headY: 6, wingLF: -6, wingRF: -11}],
      [2290, {headY: 4, mouthOpen: 0, antennaL: 8, antennaR: 6}], [2940, {}]]);

  add('angry', 'Angry', 3000, 1310,
    'A small firm frown faces outward above planted feet and tiny mittens; one decisive wing opening holds the protest without a repetitive flap.',
    {headY: 1, headR: 0, antennaL: -10, antennaR: 12,
      eyeL: 0.87, eyeR: 0.87, gazeY: 1,
      browL: 15, browR: -15, browLY: 3, browRY: 3,
      mouthSmile: -0.75, mouthOpen: 0,
      handLX: 249, handLY: 469, handLR: -10, handRX: 391, handRY: 460, handRR: 10,
      wingLF: 12, wingRF: 12, wingLH: 8, wingRH: 8},
    [[400, {headY: 3, browL: 7, browR: -7, mouthSmile: -0.3, mouthOpen: 0, wingLF: -4, wingRF: -4}, 'neutral'],
      [890, {headY: 0, antennaL: -15, antennaR: 17, wingLF: 16, wingRF: 16, wingLH: 4, wingRH: 4}],
      [1310, {wingLH: 11, wingRH: 11}],
      [2150, {browL: 14, browR: -14, antennaL: -11, antennaR: 13}], [2630, {}]]);

  add('disgusted', 'Disgusted', 3000, 1370,
    'The head leans away before one low mitten declines; the near forewing retracts and the other wing steadies the compact recoil.',
    {headX: -5, headY: -1, headR: -6, bodyR: -1,
      antennaL: -8, antennaR: -12,
      eyeL: 0.45, eyeR: 0.55, eyeJoy: -0.2, gazeX: 3,
      browL: 8, browR: -6, browLY: 1, browRY: 0,
      mouthSmile: -0.7, mouthOpen: 0.08, mouthX: -3,
      handLX: 281, handLY: 476, handRX: 400, handRY: 437, handRR: 29,
      wingLF: -3, wingRF: -11, wingLH: 4, wingRH: 1},
    [[390, {gazeX: 3, mouthSmile: -0.2, mouthOpen: 0.02, eyeL: 0.8, eyeR: 0.8}, 'neutral'],
      [900, {headX: -7, headR: -8, bodyR: -1.6, antennaL: -12, antennaR: -17, handRX: 393, handRY: 445, wingRF: -6}],
      [1370, {wingLF: 0, wingRF: -14, wingLH: 6, wingRH: 2}],
      [2190, {headX: -6, handRR: 25}], [2610, {}]]);

  Object.freeze(clips);
  const hasClip = id => Object.prototype.hasOwnProperty.call(clips, id);
  const transitionFamilies = [
    new Set(['sad', 'worried', 'scared', 'frustrated', 'angry', 'disgusted']),
    new Set(['thinking', 'focused', 'skeptical', 'confused'])
  ];
  // Preserve posture and facial intention through compatible anticipation beats.
  // Transient effects and a previous hop still release instead of being held aloft.
  const continuityKeys = keys.filter(key => !['bodyY', 'footLR', 'footRR', 'bulb', 'heart', 'tear', 'breath'].includes(key));
  const compatible = (from, to) => transitionFamilies.some(family => family.has(from) && family.has(to));
  function entryPose(from) {
    const result = {...neutral};
    for (const key of continuityKeys) result[key] = from[key];
    return result;
  }
  function resolveFrame(frame, entry) {
    if (!entry || !frame.inherited?.length) return frame.pose;
    const result = {...frame.pose};
    for (const key of frame.inherited) result[key] = entry[key];
    return result;
  }

  function clampTime(value, duration) {
    if (value === Infinity) return duration;
    return clamp(finite(value), 0, duration);
  }

  function sample(id, timeMs, entry = null) {
    if (id === null || id === 'rest') return {...neutral};
    if (!hasClip(id)) throw new RangeError(`Unknown V5 performance: ${String(id)}`);
    const clip = clips[id];
    const time = clampTime(timeMs, clip.duration);
    const frames = clip.keyframes;
    if (time <= 0) return {...resolveFrame(frames[0], entry)};
    if (time >= clip.duration) return {...frames[frames.length - 1].pose};
    for (let index = 1; index < frames.length; index++) {
      const next = frames[index];
      if (time <= next.time) {
        const previous = frames[index - 1];
        const duration = next.time - previous.time;
        const amount = (time - previous.time) / duration;
        const from = resolveFrame(previous, entry), to = resolveFrame(next, entry);
        const result = mix(from, to, ease(amount));
        const curved = new Set([...Object.keys(previous.tangents || {}), ...Object.keys(next.tangents || {})]);
        for (const key of curved) {
          result[key] = hermite(from[key], to[key], amount, duration,
            previous.tangents?.[key]?.[1] || 0, next.tangents?.[key]?.[0] || 0);
        }
        return result;
      }
    }
    return {...frames[frames.length - 1].pose};
  }

  const zeroVelocity = () => Object.fromEntries(keys.map(key => [key, 0]));
  const velocityLimit = key => /(?:X|Y)$/.test(key) ? 0.18
    : /^(?:eye|mouth|glasses$|bulb$|heart$|tear$|breath$)/.test(key) ? 0.006 : 0.09;

  class Engine {
    constructor(options = {}) {
      const scheduler = options.scheduler || {};
      this._now = options.now ? options.now.bind(options) : scheduler.now ? scheduler.now.bind(scheduler)
        : () => global.performance?.now?.() ?? Date.now();
      const request = options.requestAnimationFrame || options.raf;
      const scheduledRequest = scheduler.requestAnimationFrame || scheduler.raf;
      const cancel = options.cancelAnimationFrame || options.caf;
      const scheduledCancel = scheduler.cancelAnimationFrame || scheduler.caf;
      this._request = request ? request.bind(options) : scheduledRequest ? scheduledRequest.bind(scheduler)
        : global.requestAnimationFrame ? global.requestAnimationFrame.bind(global)
          : callback => global.setTimeout(() => callback(this._now()), 16);
      this._cancel = cancel ? cancel.bind(options) : scheduledCancel ? scheduledCancel.bind(scheduler)
        : global.cancelAnimationFrame ? global.cancelAnimationFrame.bind(global) : global.clearTimeout.bind(global);
      this._onFrame = typeof options.onFrame === 'function' ? options.onFrame : () => {};
      this._onChange = typeof options.onChange === 'function' ? options.onChange : () => {};
      this._transitionDuration = clamp(finite(options.transitionDuration, 380), 1, 1000);
      this._id = null;
      this._time = 0;
      this._duration = 0;
      this._playing = false;
      this._paused = false;
      this._reducedMotion = Boolean(options.reducedMotion);
      this._destroyed = false;
      this._frame = null;
      this._epoch = 0;
      this._blend = null;
      this._entryPose = null;
      this._pose = {...neutral};
      this._velocity = zeroVelocity();
      this._renderedAt = finite(this._now());
      this._lastTick = this._renderedAt;
      this._onFrame({...this._pose}, this.info);
    }

    get id() { return this._id; }
    get time() { return this._time; }
    get duration() { return this._duration; }
    get playing() { return this._playing; }
    get paused() { return this._paused; }
    get progress() { return this._duration ? clamp(this._time / this._duration, 0, 1) : 0; }
    get transitioning() { return this._blend !== null; }
    get reducedMotion() { return this._reducedMotion; }
    get pose() { return {...this._pose}; }
    get info() {
      return {id: this._id, time: this._time, duration: this._duration,
        playing: this._playing, paused: this._paused, progress: this.progress,
        transitioning: this.transitioning, reducedMotion: this._reducedMotion};
    }

    _stopFrame() {
      this._epoch++;
      if (this._frame !== null) this._cancel(this._frame);
      this._frame = null;
    }

    _emit(next, now, preserveVelocity = false) {
      const safe = pose(next);
      if (!preserveVelocity) {
        const delta = now - this._renderedAt;
        for (const key of keys) {
          this._velocity[key] = delta > 0 && delta <= 150
            ? clamp((safe[key] - this._pose[key]) / delta, -velocityLimit(key), velocityLimit(key)) : 0;
        }
      }
      this._pose = safe;
      this._renderedAt = now;
      this._onFrame({...safe}, this.info);
    }

    _queue() {
      if (this._destroyed || !this._playing || this._paused || this._reducedMotion || this._frame !== null) return;
      const epoch = this._epoch;
      this._frame = this._request(() => {
        if (epoch !== this._epoch || this._destroyed) return;
        this._frame = null;
        this._advance(finite(this._now(), this._lastTick));
        if (epoch === this._epoch) this._queue();
      });
    }

    _advance(now) {
      if (!this._playing) return;
      const epoch = this._epoch;
      const elapsed = Math.max(0, now - this._lastTick);
      this._lastTick = now;
      this._time = Math.min(this._duration, this._time + elapsed);
      let next = this._id === null ? {...neutral} : sample(this._id, this._time, this._entryPose);
      if (this._blend) {
        this._blend.elapsed += elapsed;
        const amount = clamp(this._blend.elapsed / this._blend.duration, 0, 1);
        const blended = mix(this._blend.from, next, ease(amount));
        // This endpoint-safe term carries a bounded source velocity through an interruption.
        // Its value and derivative vanish at the end, meeting the moving target smoothly.
        const carry = this._blend.duration * amount * (1 - amount) * (1 - amount);
        for (const key of keys) blended[key] += this._blend.velocity[key] * carry;
        next = blended;
        if (amount >= 1) this._blend = null;
      }
      const complete = this._time >= this._duration;
      if (complete) {
        this._playing = false;
        this._paused = false;
        this._blend = null;
        next = this._id === null ? {...neutral} : sample(this._id, this._duration);
      }
      this._emit(next, now);
      if (complete) {
        this._velocity = zeroVelocity();
        if (epoch === this._epoch && !this._destroyed) this._onChange(this.info);
      }
    }

    _begin(id) {
      this._stopFrame();
      const now = finite(this._now(), this._lastTick);
      const from = {...this._pose};
      const velocity = this._paused || !this._playing || now - this._renderedAt > 150
        ? zeroVelocity() : {...this._velocity};
      this._entryPose = compatible(this._id, id) ? entryPose(from) : null;
      this._id = id;
      this._duration = id === null ? this._transitionDuration : clips[id].duration;
      this._time = 0;
      this._paused = false;
      this._lastTick = now;
      if (this._reducedMotion) {
        this._time = id === null ? this._duration : clips[id].stillTime;
        this._playing = false;
        this._blend = null;
        this._velocity = zeroVelocity();
        this._emit(id === null ? neutral : sample(id, this._time), now, true);
      } else {
        this._playing = true;
        this._blend = {from, velocity, duration: this._transitionDuration, elapsed: 0};
        this._emit(from, now, true);
      }
      this._onChange(this.info);
      this._queue();
    }

    play(id) {
      if (this._destroyed) return this;
      if (!hasClip(id)) throw new RangeError(`Unknown V5 performance: ${String(id)}`);
      this._begin(id);
      return this;
    }

    pause() {
      if (this._destroyed || !this._playing) return this;
      this._stopFrame();
      this._advance(finite(this._now(), this._lastTick));
      if (!this._playing) return this;
      this._playing = false;
      this._paused = true;
      this._velocity = zeroVelocity();
      this._onChange(this.info);
      return this;
    }

    resume() {
      if (this._destroyed || !this._paused || this._reducedMotion) return this;
      this._paused = false;
      this._playing = true;
      this._lastTick = finite(this._now(), this._lastTick);
      this._renderedAt = this._lastTick;
      this._onChange(this.info);
      this._queue();
      return this;
    }

    rest() {
      if (!this._destroyed) this._begin(null);
      return this;
    }

    seek(id, timeMs) {
      if (this._destroyed) return this;
      if (!hasClip(id)) throw new RangeError(`Unknown V5 performance: ${String(id)}`);
      this._stopFrame();
      this._id = id;
      this._duration = clips[id].duration;
      this._time = clampTime(timeMs, this._duration);
      this._playing = false;
      this._paused = false;
      this._blend = null;
      this._entryPose = null;
      this._velocity = zeroVelocity();
      const now = finite(this._now(), this._lastTick);
      this._lastTick = now;
      this._emit(sample(id, this._time), now, true);
      this._onChange(this.info);
      return this;
    }

    setReducedMotion(value) {
      if (this._destroyed || Boolean(value) === this._reducedMotion) return this;
      this._reducedMotion = Boolean(value);
      if (this._reducedMotion) {
        this._stopFrame();
        this._playing = false;
        this._paused = false;
        this._blend = null;
        this._velocity = zeroVelocity();
        this._time = this._id === null ? this._duration : clips[this._id].stillTime;
        const now = finite(this._now(), this._lastTick);
        this._lastTick = now;
        this._emit(this._id === null ? neutral : sample(this._id, this._time), now, true);
      }
      this._onChange(this.info);
      return this;
    }

    destroy() {
      if (this._destroyed) return;
      this._stopFrame();
      this._destroyed = true;
      this._playing = false;
      this._paused = false;
      this._blend = null;
      this._velocity = zeroVelocity();
      this._onFrame = () => {};
      this._onChange = () => {};
    }
  }

  global.HeyNagMotion = Object.freeze({neutral, clips, sample, Engine});
})(typeof window !== 'undefined' ? window : globalThis);

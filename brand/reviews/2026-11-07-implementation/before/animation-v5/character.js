/* heyNag V5 — self-contained, articulated SVG character.
 * Geometry is drawn from heynag-moth-v5-refined.png, not the earlier V2 rig.
 * Screen-left/right names match contract.json. No timers or animation loop.
 */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  // Reserve room for the long antenna during the raised-head happy hop.
  // This is a fixed composition offset, not a body proportion or pose change.
  const ART_OFFSET_Y = 30;
  const NEUTRAL = Object.freeze({
    bodyX: 0, bodyY: 0, bodyR: 0, headX: 0, headY: 0, headR: 0,
    antennaL: 0, antennaR: 0, wingLF: 0, wingRF: 0, wingLH: 0, wingRH: 0,
    handLX: 255, handLY: 478, handLR: 0, handRX: 387, handRY: 444, handRR: 0,
    footLR: 0, footRR: 0, eyeL: 1, eyeR: 1, eyeJoy: 0, gazeX: 0, gazeY: 0,
    browL: 0, browR: 0, browLY: 0, browRY: 0,
    mouthSmile: 0.75, mouthOpen: 0.35, mouthO: 0, mouthX: 0,
    glasses: 0, glassesY: 0, bulb: 0, heart: 0, tear: 0, breath: 0
  });
  const DAY = {
    ink: '#2C2C27', creamA: '#FFF9F1', creamB: '#F8EDDF',
    foreA: '#E2EFCB', foreB: '#CEDFAE', greenA: '#C9DF6A', greenB: '#B4D052',
    mark: '#9CBE43', tear: '#9ED9DF', bulb: '#FFE299', rim: '#E8E6BE'
  };
  const NIGHT = {
    ink: '#292A22', creamA: '#FFF1D8', creamB: '#F3DDBA',
    foreA: '#D7E1B7', foreB: '#C0CF94', greenA: '#C5DD61', greenB: '#AAC649',
    mark: '#94B53D', tear: '#A8DADD', bulb: '#FFE5A6', rim: '#E4D991'
  };
  const SHORT_ANTENNA = [
    ['M', 294, 197], ['C', 281, 167, 262, 146, 241, 147],
    ['C', 221, 148, 207, 165, 184, 169], ['C', 164, 173, 149, 168, 151, 156],
    ['C', 152, 140, 175, 129, 196, 128], ['C', 231, 125, 269, 150, 294, 197], ['Z']
  ];
  const LONG_ANTENNA = [
    ['M', 319, 190], ['C', 327, 143, 351, 100, 387, 69],
    ['C', 421, 41, 455, 29, 469, 45], ['C', 486, 63, 469, 84, 449, 91],
    ['C', 429, 98, 405, 94, 383, 100], ['C', 354, 108, 332, 149, 319, 190], ['Z']
  ];
  let instanceNumber = 0;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, n) => {
    const t = clamp((n - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const point = n => Number(n.toFixed(3));

  function node(tag, attributes, parent) {
    const el = document.createElementNS(NS, tag);
    if (attributes) Object.keys(attributes).forEach(key => el.setAttribute(key, attributes[key]));
    if (parent) parent.appendChild(el);
    return el;
  }

  function bentPath(commands, anchor, degrees, reach) {
    const angle = degrees * Math.PI / 180;
    return commands.map(command => {
      if (command.length === 1) return command[0];
      const coordinates = [];
      for (let i = 1; i < command.length; i += 2) {
        const dx = command[i] - anchor[0], dy = command[i + 1] - anchor[1];
        const weight = Math.pow(clamp(Math.hypot(dx, dy) / reach, 0, 1), 1.45);
        const a = angle * weight;
        coordinates.push(point(anchor[0] + dx * Math.cos(a) - dy * Math.sin(a)));
        coordinates.push(point(anchor[1] + dx * Math.sin(a) + dy * Math.cos(a)));
      }
      return command[0] + coordinates.join(' ');
    }).join(' ');
  }

  class HeyNagCharacter {
    constructor(host, options = {}) {
      if (!host || typeof host.appendChild !== 'function') throw new TypeError('HeyNagCharacter needs a host element.');
      this.id = 'hn-v5-' + Date.now().toString(36) + '-' + (++instanceNumber);
      this.svg = node('svg', {
        xmlns: NS, viewBox: '0 0 640 660', width: '640', height: '660', role: 'img',
        'aria-labelledby': this.id + '-title ' + this.id + '-description',
        'data-character-version': 'v5', preserveAspectRatio: 'xMidYMid meet',
        style: 'display:block;width:100%;height:100%;overflow:visible'
      });
      node('title', { id: this.id + '-title' }, this.svg).textContent = 'The little heyNag moth';
      node('desc', { id: this.id + '-description' }, this.svg).textContent =
        'A soft cream moth with a very large head, a tiny round body, little mittens, stub feet, four overlapping wings, and a longer antenna on the viewer’s right.';
      const defs = node('defs', null, this.svg);
      this.paintNodes = [];
      this.strokeNodes = [];
      this.gradients = {};
      const gradient = (name, first, last) => {
        const g = node('linearGradient', { id: this.id + '-' + name, x1: '0', y1: '0', x2: '.7', y2: '1' }, defs);
        this.gradients[name] = [node('stop', { offset: '0', 'data-color': first }, g), node('stop', { offset: '1', 'data-color': last }, g)];
      };
      gradient('cream', 'creamA', 'creamB');
      gradient('fore', 'foreA', 'foreB');
      gradient('green', 'greenA', 'greenB');
      const glow = node('radialGradient', { id: this.id + '-bulb-glow' }, defs);
      node('stop', { offset: '0', 'stop-color': '#FFE5A6', 'stop-opacity': '.3' }, glow);
      node('stop', { offset: '1', 'stop-color': '#FFE5A6', 'stop-opacity': '0' }, glow);
      const edge = node('filter', { id: this.id + '-edge', x: '-8%', y: '-8%', width: '116%', height: '116%', 'color-interpolation-filters': 'sRGB' }, defs);
      this.rim = node('feDropShadow', { dx: '0', dy: '0', stdDeviation: '.8', 'flood-color': NIGHT.rim, 'flood-opacity': '.55' }, edge);

      this.shadow = node('ellipse', { cx: '314', cy: String(596 + ART_OFFSET_Y), rx: '105', ry: '7', fill: DAY.ink, opacity: '.12' }, this.svg);
      this.root = node('g', { 'data-part': 'character' }, this.svg);
      this.footL = node('g', { 'data-part': 'foot-left' }, this.root);
      this.footR = node('g', { 'data-part': 'foot-right' }, this.root);
      this.shape(this.footL, 'M252 550 L284 553 L282 574 C285 588 271 594 253 592 C237 591 231 581 241 571 Z', 'green', 8.5);
      this.shape(this.footR, 'M330 554 L360 550 L365 570 C378 581 369 591 351 591 C334 592 327 585 329 575 Z', 'green', 8.5);

      this.body = node('g', { 'data-part': 'body' }, this.root);
      this.wings = {};
      const wing = (key, path, paint, mark) => {
        const g = node('g', { 'data-part': key }, this.body);
        this.shape(g, path, paint, 10);
        if (mark) this.shape(g, mark, 'mark', 0);
        this.wings[key] = g;
      };
      // All four roots remain behind the ruff/torso. Hindwings are drawn first.
      wing('wingLH', 'M269 402 C235 432 199 478 159 510 C150 535 164 555 186 557 C217 563 246 543 260 518 C278 484 282 438 269 402 Z', 'green');
      wing('wingRH', 'M374 403 C408 434 443 480 464 513 C472 539 453 558 432 557 C404 559 382 539 371 510 C357 478 357 434 374 403 Z', 'green');
      wing('wingLF', 'M276 383 C242 377 202 390 169 414 C133 440 105 477 97 506 C88 528 107 536 136 530 C188 522 229 493 258 455 C277 431 286 400 276 383 Z', 'fore',
        'M205 418 C194 444 177 474 158 486 C143 497 126 483 137 465 C151 446 180 431 205 418 Z');
      wing('wingRF', 'M375 382 C410 388 455 413 485 443 C513 472 533 505 524 523 C515 541 487 535 462 527 C417 513 382 484 365 450 C354 420 358 393 375 382 Z', 'fore',
        'M430 419 C446 443 462 465 467 480 C469 495 453 500 442 489 C428 477 420 444 430 419 Z');

      this.shape(this.body, 'M273 429 C249 434 233 455 231 483 C222 512 232 541 257 554 C280 567 325 568 348 558 C376 548 387 525 382 498 C380 466 366 442 348 430 Z', 'cream', 10);
      this.arms = {};
      ['L', 'R'].forEach(side => {
        const g = node('g', { 'data-part': 'arm-' + side }, this.body);
        const outer = node('path', { fill: 'none', 'stroke-width': '31', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        const inner = node('path', { fill: 'none', 'stroke-width': '21', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', stroke: 'url(#' + this.id + '-cream)' }, g);
        this.strokeNodes.push(outer);
        this.arms[side] = { outer, inner };
      });
      this.shape(this.body, 'M261 404 C248 412 244 429 254 439 C263 447 277 441 281 435 C278 450 290 459 303 458 C313 458 319 452 322 444 C330 456 347 454 352 440 C361 448 374 441 374 430 C373 418 359 409 348 404 Z', 'cream', 9);

      this.head = node('g', { 'data-part': 'head' }, this.body);
      // A crisp, local night keyline keeps each thin stem connected to its
      // paddle at small sizes. It follows the same path; anatomy never changes.
      this.antennaEdges = ['L', 'R'].map(side => node('path', {
        'data-part': 'antenna-edge-' + side, fill: 'none', stroke: '#B3C18A',
        'stroke-width': '16', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        opacity: '0', 'aria-hidden': 'true'
      }, this.head));
      this.antennaL = this.shape(this.head, '', 'green', 10);
      this.antennaL.setAttribute('data-part', 'antenna-short-left');
      this.antennaR = this.shape(this.head, '', 'green', 10);
      this.antennaR.setAttribute('data-part', 'antenna-long-right');
      this.shape(this.head,
        'M298 197 C271 180 237 187 213 203 C191 217 181 239 196 247 C203 251 210 250 216 247 C187 271 166 295 162 314 C153 338 166 353 189 345 L199 338 C183 362 190 382 208 386 C218 389 227 384 232 376 C247 399 268 409 291 408 C325 419 369 410 397 390 C423 373 438 351 440 328 C458 338 473 327 472 312 C471 285 454 256 432 235 C415 219 398 208 378 207 C397 198 394 182 377 177 C357 170 338 178 321 185 C313 181 305 187 298 197 Z',
        'cream', 10);
      this.eyes = {};
      [['L', 281, 292, 23, 35, -17], ['R', 387, 261, 20.5, 32, -20]].forEach(([side, x, y, rx, ry, angle]) => {
        const g = node('g', { 'data-part': 'eye-' + side }, this.head);
        const clip = node('clipPath', { id: this.id + '-eye-clip-' + side, clipPathUnits: 'userSpaceOnUse' }, defs);
        const clipShape = node('path', null, clip);
        const iris = node('path', { 'clip-path': 'url(#' + this.id + '-eye-clip-' + side + ')' }, g);
        this.paintNodes.push([iris, 'ink']);
        const closed = node('path', { fill: 'none', 'stroke-width': '7', 'stroke-linecap': 'round' }, g);
        this.strokeNodes.push(closed);
        this.eyes[side] = { g, iris, clipShape, closed, x, y, rx, ry, angle };
      });
      this.brows = {};
      [['L', 254, 237, 'M-17 10 Q-7 -12 16 -9'], ['R', 385, 221, 'M-15 2 Q-2 -12 13 -5']].forEach(([side, x, y, d]) => {
        const g = node('g', { 'data-part': 'brow-' + side }, this.head);
        const path = node('path', { d, fill: 'none', 'stroke-width': '6.5', 'stroke-linecap': 'round' }, g);
        this.strokeNodes.push(path);
        this.brows[side] = { g, path, x, y };
      });
      this.mouth = node('g', { 'data-part': 'mouth' }, this.head);
      this.openMouth = this.shape(this.mouth, '', 'green', 7.5);
      this.closedMouth = node('path', { fill: 'none', 'stroke-width': '6.5', 'stroke-linecap': 'round' }, this.mouth);
      this.strokeNodes.push(this.closedMouth);

      this.glasses = node('g', { 'data-part': 'glasses', opacity: '0', fill: 'none', 'stroke-width': '6.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, this.head);
      this.strokeNodes.push(this.glasses);
      node('rect', { x: '242', y: '250', width: '80', height: '82', rx: '20', transform: 'rotate(-12 282 291)' }, this.glasses);
      node('rect', { x: '351', y: '222', width: '75', height: '78', rx: '19', transform: 'rotate(-12 388.5 261)' }, this.glasses);
      node('path', { d: 'M320 272 Q335 259 352 264 M241 281 L229 280 M426 249 L437 244' }, this.glasses);
      this.lensGlint = node('path', { d: 'M254 267 L262 259 M363 237 L371 230', 'stroke-width': '3', stroke: '#FFF8E8', opacity: '0' }, this.glasses);
      this.tear = node('g', { 'data-part': 'tear', opacity: '0' }, this.head);
      this.shape(this.tear, 'M426 308 C423 317 415 325 418 332 C422 341 435 337 434 329 C433 322 429 314 426 308 Z', 'tear', 4);
      this.breath = node('g', { 'data-part': 'breath', opacity: '0' }, this.head);
      const breathPath = node('path', { d: 'M471 352 C485 361 501 355 500 345 C499 338 490 335 485 340 C480 345 484 349 489 347', fill: 'none', 'stroke-width': '4.5', 'stroke-linecap': 'round' }, this.breath);
      this.paintNodes.push([breathPath, 'creamA', 'stroke']);

      // Hands sit in front of the head so a short mitten can support the chin.
      this.hands = {};
      ['L', 'R'].forEach(side => {
        const g = node('g', { 'data-part': 'mitten-' + side }, this.body);
        const path = this.shape(g, side === 'L'
          ? 'M-7-18 C-17-22-23-12-21 0 C-23 13-15 24-3 24 C7 25 15 19 15 11 C23 15 27 6 23 0 C20-5 16-8 11-10 C8-19 0-23-7-18 Z'
          : 'M-10-14 C-9-26 2-28 8-21 C11-17 9-12 8-9 C17-15 27-9 26 0 C25 13 16 23 2 24 C-12 26-21 18-21 5 C-21-3-17-10-10-14 Z', 'cream', 8.5);
        this.hands[side] = { g, path };
      });

      this.bulb = node('g', { 'data-part': 'bulb', transform: 'translate(510 175)', opacity: '0' }, this.root);
      node('circle', { r: '48', fill: 'url(#' + this.id + '-bulb-glow)' }, this.bulb);
      this.shape(this.bulb, 'M-9 17 V12 C-24 0-17-20 0-20 C17-20 24 0 9 12 V17 Z', 'bulb', 4.5);
      const bulbLines = node('path', { d: 'M-8 22 H8 M-5 27 H5 M0 14 V2 L-5-3 M0 2 L5-3', fill: 'none', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, this.bulb);
      this.strokeNodes.push(bulbLines);
      const rays = node('path', { d: 'M0-31 V-38 M24-22 L30-28 M32 1 H39 M-24-22 L-30-28 M-32 1 H-39', fill: 'none', stroke: '#D3AA48', 'stroke-width': '3.5', 'stroke-linecap': 'round' }, this.bulb);
      rays.setAttribute('aria-hidden', 'true');
      this.heart = node('g', { 'data-part': 'heart', transform: 'translate(510 350)', opacity: '0' }, this.root);
      this.shape(this.heart, 'M0 17 C-6 10-22 1-20-10 C-18-21-5-21 0-12 C5-21 18-21 20-10 C22 1 6 10 0 17 Z', 'green', 4.5);
      this.svg.setAttribute('focusable', 'false');
      host.appendChild(this.svg);
      this.setTheme(options.theme || 'day');
      this.render(NEUTRAL);
    }

    shape(parent, d, paint, strokeWidth) {
      const path = node('path', { d, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
      if (paint === 'cream' || paint === 'fore' || paint === 'green') {
        path.setAttribute('fill', 'url(#' + this.id + '-' + paint + ')');
      } else this.paintNodes.push([path, paint]);
      if (strokeWidth) {
        path.setAttribute('stroke-width', strokeWidth);
        this.strokeNodes.push(path);
      } else path.setAttribute('stroke', 'none');
      return path;
    }

    setTheme(theme) {
      this.theme = theme === 'night' ? 'night' : 'day';
      const p = this.theme === 'night' ? NIGHT : DAY;
      this.svg.setAttribute('data-theme', this.theme);
      this.paintNodes.forEach(([el, key, attribute]) => el.setAttribute(attribute || 'fill', p[key]));
      this.strokeNodes.forEach(el => el.setAttribute('stroke', p.ink));
      Object.values(this.gradients).forEach(stops => stops.forEach(stop => stop.setAttribute('stop-color', p[stop.getAttribute('data-color')])));
      this.root.setAttribute('filter', this.theme === 'night' ? 'url(#' + this.id + '-edge)' : 'none');
      this.shadow.setAttribute('fill', p.ink);
      this.lensGlint.setAttribute('opacity', this.theme === 'night' ? '.45' : '0');
      this.antennaEdges.forEach(edge => edge.setAttribute('opacity', this.theme === 'night' ? '.85' : '0'));
      return this;
    }

    render(input) {
      const p = {};
      Object.keys(NEUTRAL).forEach(key => { p[key] = input && Number.isFinite(input[key]) ? input[key] : NEUTRAL[key]; });
      this.pose = p;
      const bodyR = clamp(p.bodyR, -8, 8), headX = clamp(p.headX, -12, 12), headY = clamp(p.headY, -8, 20);
      this.root.setAttribute('transform', 'translate(' + point(p.bodyX) + ' ' + point(ART_OFFSET_Y + p.bodyY) + ')');
      this.body.setAttribute('transform', 'rotate(' + point(bodyR) + ' 314 552)');
      this.head.setAttribute('transform', 'translate(' + point(headX) + ' ' + point(headY) + ') rotate(' + point(clamp(p.headR, -15, 15)) + ' 315 411)');
      this.shadow.setAttribute('cx', point(314 + p.bodyX));
      this.shadow.setAttribute('rx', point(clamp(105 + p.bodyY * .6, 72, 111)));
      this.shadow.setAttribute('opacity', point(clamp(.12 + p.bodyY * .0014, .065, .14)));
      this.footL.setAttribute('transform', 'rotate(' + point(clamp(p.footLR, -12, 12)) + ' 280 580)');
      this.footR.setAttribute('transform', 'rotate(' + point(clamp(p.footRR, -12, 12)) + ' 336 580)');
      this.wings.wingLF.setAttribute('transform', 'rotate(' + point(clamp(p.wingLF, -18, 22)) + ' 274 402)');
      this.wings.wingRF.setAttribute('transform', 'rotate(' + point(-clamp(p.wingRF, -18, 22)) + ' 369 401)');
      this.wings.wingLH.setAttribute('transform', 'rotate(' + point(clamp(p.wingLH, -14, 25)) + ' 270 408)');
      this.wings.wingRH.setAttribute('transform', 'rotate(' + point(-clamp(p.wingRH, -14, 25)) + ' 372 408)');
      this.antennaL.setAttribute('d', bentPath(SHORT_ANTENNA, [294, 197], clamp(p.antennaL, -20, 20), 155));
      this.antennaR.setAttribute('d', bentPath(LONG_ANTENNA, [319, 190], clamp(p.antennaR, -20, 20), 205));
      this.antennaEdges[0].setAttribute('d', this.antennaL.getAttribute('d'));
      this.antennaEdges[1].setAttribute('d', this.antennaR.getAttribute('d'));

      [['L', 270, 456], ['R', 368, 447]].forEach(([side, sx, sy]) => {
        let x = p['hand' + side + 'X'], y = p['hand' + side + 'Y'];
        const dx = x - sx, dy = y - sy, distance = Math.hypot(dx, dy);
        if (distance > 48) { x = sx + dx * 48 / distance; y = sy + dy * 48 / distance; }
        const bend = side === 'L' ? -8 : 8;
        const d = 'M' + sx + ' ' + sy + ' Q' + point((sx + x) / 2 + bend) + ' ' + point((sy + y) / 2 + 7) + ' ' + point(x) + ' ' + point(y + 5);
        this.arms[side].outer.setAttribute('d', d);
        this.arms[side].inner.setAttribute('d', d);
        this.hands[side].g.setAttribute('transform', 'translate(' + point(x) + ' ' + point(y) + ') rotate(' + point(p['hand' + side + 'R']) + ')');
      });

      ['L', 'R'].forEach(side => {
        const e = this.eyes[side], openness = clamp(p['eye' + side], 0, 1.15);
        // Preserve the rounded eye volume under a descending upper lid.
        // Half-open states must read as a peek or heavy lid, not a squeezed lozenge.
        const rx = e.rx, ry = e.ry * (1 + Math.max(0, openness - 1) * .5), k = .55228475;
        e.g.setAttribute('transform', 'translate(' + point(e.x + clamp(p.gazeX, -6, 6)) + ' ' + point(e.y + clamp(p.gazeY, -6, 6)) + ') rotate(' + e.angle + ')');
        e.iris.setAttribute('d', 'M' + (-rx) + ' 0 C' + (-rx) + ' ' + point(-ry * k) + ' ' + point(-rx * k) + ' ' + point(-ry) + ' 0 ' + point(-ry) + ' C' + point(rx * k) + ' ' + point(-ry) + ' ' + rx + ' ' + point(-ry * k) + ' ' + rx + ' 0 C' + rx + ' ' + point(ry * k) + ' ' + point(rx * k) + ' ' + point(ry) + ' 0 ' + point(ry) + ' C' + point(-rx * k) + ' ' + point(ry) + ' ' + (-rx) + ' ' + point(ry * k) + ' ' + (-rx) + ' 0 Z');
        const lidY = e.ry * (1 - 2 * openness) - 1;
        const lidCurve = 6 * (1 - clamp(openness, 0, 1));
        const clipWidth = rx + 8;
        e.clipShape.setAttribute('d', 'M' + (-clipWidth) + ' ' + point(lidY) + ' Q0 ' + point(lidY + lidCurve) + ' ' + clipWidth + ' ' + point(lidY) + ' V' + (e.ry + 12) + ' H' + (-clipWidth) + ' Z');
        // Oval eyes lean with the source drawing; their upper lids do not inherit
        // that lean. Keep the reveal soft and level in the head's own coordinates.
        e.clipShape.setAttribute('transform', 'rotate(' + (-e.angle) + ')');
        const eyeOpacity = smooth(.045, .19, openness);
        e.iris.setAttribute('opacity', point(eyeOpacity));
        e.closed.setAttribute('d', 'M' + (-rx + 2) + ' 0 Q0 ' + point(-clamp(p.eyeJoy, -1, 1) * 15) + ' ' + (rx - 2) + ' 0');
        e.closed.setAttribute('opacity', point(1 - eyeOpacity));
        const b = this.brows[side];
        const browAngle = clamp(p['brow' + side], -18, 18);
        // The neutral left brow rises inward. Rotating it alone through 18 degrees
        // cannot produce a frown, so gently lower its inner end as it furrows.
        const furrow = clamp((side === 'L' ? browAngle : -browAngle) / 18, 0, 1);
        if (side === 'L') {
          b.path.setAttribute('d', 'M-17 ' + point(mix(10, -2, furrow)) + ' Q-7 ' + point(mix(-12, -2, furrow)) + ' 16 ' + point(mix(-9, 4, furrow)));
        } else {
          b.path.setAttribute('d', 'M-15 ' + point(mix(2, 4, furrow)) + ' Q-2 ' + point(mix(-12, -2, furrow)) + ' 13 ' + point(mix(-5, -2, furrow)));
        }
        b.g.setAttribute('transform', 'translate(' + b.x + ' ' + point(b.y + clamp(p['brow' + side + 'Y'], -9, 9)) + ') rotate(' + point(browAngle) + ')');
      });

      const smile = clamp(p.mouthSmile, -1, 1), open = clamp(p.mouthOpen, 0, 1), round = clamp(p.mouthO, 0, 1);
      // A laugh opens sideways into a rounded U, not a long green tongue.
      // Preserve the existing compact O profile and keep every lower edge above the jaw.
      const smileWidth = 23 + open * 9 + Math.max(smile, 0) * 2;
      const smileHeight = Math.min(48, 44 * Math.sqrt(open) + Math.max(smile, 0) * 4);
      const width = mix(smileWidth, 14 + open * 3, round);
      const height = mix(smileHeight, open * 32 + 1, round);
      const top = mix(smile * 12, -height * .75, round), corner = mix(-smile * 4, 0, round);
      this.mouth.setAttribute('transform', 'translate(' + point(346 + clamp(p.mouthX, -9, 9)) + ' 331) rotate(-12)');
      this.openMouth.setAttribute('d', 'M' + point(-width) + ' ' + point(corner) + ' C' + point(-width * .55) + ' ' + point(top) + ' ' + point(width * .55) + ' ' + point(top) + ' ' + point(width) + ' ' + point(corner) + ' C' + point(width) + ' ' + point(height * .7) + ' ' + point(width * .5) + ' ' + point(height) + ' 0 ' + point(height) + ' C' + point(-width * .5) + ' ' + point(height) + ' ' + point(-width) + ' ' + point(height * .7) + ' ' + point(-width) + ' ' + point(corner) + ' Z');
      this.closedMouth.setAttribute('d', 'M' + point(-width) + ' 0 Q0 ' + point(smile * 18) + ' ' + point(width) + ' 0');
      const mouthOpacity = smooth(.015, .13, open);
      this.openMouth.setAttribute('opacity', point(mouthOpacity));
      this.closedMouth.setAttribute('opacity', point(1 - mouthOpacity));
      this.glasses.setAttribute('opacity', point(clamp(p.glasses, 0, 1)));
      this.glasses.setAttribute('transform', 'translate(0 ' + point(clamp(p.glassesY, -20, 20)) + ')');
      ['bulb', 'heart', 'tear', 'breath'].forEach(key => this[key].setAttribute('opacity', point(clamp(p[key], 0, 1))));
      return this;
    }
  }

  HeyNagCharacter.NEUTRAL = NEUTRAL;
  global.HeyNagCharacter = HeyNagCharacter;
})(window);

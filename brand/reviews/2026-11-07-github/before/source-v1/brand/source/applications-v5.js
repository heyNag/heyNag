/* V5 application exports. Load character.js first. No network or dependencies.
 * The avatar crops the existing head; it never redraws or rescales body parts.
 * Pass the existing outlined wordmark SVG when exporting a profile header.
 */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  function node(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
    if (parent) parent.appendChild(el);
    return el;
  }
  function create(kind, theme = 'day', wordmarkSVG = '') {
    if (!['avatar', 'header'].includes(kind)) throw new RangeError('Choose avatar or header.');
    if (!['day', 'night'].includes(theme)) throw new RangeError('Choose day or night.');
    const width = kind === 'avatar' ? 512 : 1200, height = kind === 'avatar' ? 512 : 360;
    const svg = node('svg', {xmlns: NS, width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-labelledby': 'title description'});
    node('title', {id: 'title'}, svg).textContent = 'heyNag';
    node('desc', {id: 'description'}, svg).textContent = kind === 'avatar'
      ? 'Nag’s tiny curious moth, with a cream face and two complete unequal antenna paddles.'
      : 'The tiny heyNag moth beside Nag’s name, with four layered wings and short attached feet.';
    const ground = theme === 'night' ? '#202B21' : kind === 'avatar' ? '#F1F1EF' : '#A8C84B';
    node('rect', {width, height, fill: ground}, svg);
    const rig = new global.HeyNagCharacter(document.createElement('div'), {theme});
    rig.render(global.HeyNagCharacter.NEUTRAL);
    if (kind === 'avatar') {
      const head = node('svg', {x: 0, y: 0, width, height, viewBox: '92 -25 490 490', overflow: 'hidden'}, svg);
      head.append(rig.svg.querySelector('defs').cloneNode(true));
      head.append(rig.head.cloneNode(true));
    } else {
      const character = rig.svg;
      character.removeAttribute('style');
      character.setAttribute('x', '48'); character.setAttribute('y', '6');
      character.setAttribute('width', '350'); character.setAttribute('height', '350');
      character.setAttribute('aria-hidden', 'true');
      svg.append(character);
      const parsed = new DOMParser().parseFromString(wordmarkSVG, 'image/svg+xml');
      if (parsed.querySelector('parsererror') || !parsed.documentElement.querySelector('path')) throw new TypeError('Pass the existing outlined wordmark SVG.');
      const mark = node('svg', {x: 420, y: 79, width: 690, height: 220, viewBox: parsed.documentElement.getAttribute('viewBox'), 'aria-hidden': 'true'}, svg);
      for (const path of parsed.querySelectorAll('path')) {
        const copy = path.cloneNode(true);
        copy.setAttribute('fill', theme === 'night' ? '#A8C84B' : '#1C1C1C');
        mark.append(copy);
      }
    }
    // Stable standalone IDs make exports reproducible and isolate different
    // kind/theme variants. Use img elements for repeated identical exports;
    // an inline consumer must namespace IDs per instance.
    const prefix = `heynag-v5-${kind}-${theme}`;
    const serialized = svg.outerHTML.replaceAll(rig.id, prefix).replace(/id="title"/g, `id="${prefix}-application-title"`).replace(/id="description"/g, `id="${prefix}-application-description"`).replace('aria-labelledby="title description"', `aria-labelledby="${prefix}-application-title ${prefix}-application-description"`);
    return serialized;
  }
  async function png(svgText) {
    const blobURL = URL.createObjectURL(new Blob([svgText], {type: 'image/svg+xml'}));
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {img.onload = resolve; img.onerror = reject; img.src = blobURL;});
      const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    } finally { URL.revokeObjectURL(blobURL); }
  }
  global.HeyNagApplications = {create, png};
})(window);

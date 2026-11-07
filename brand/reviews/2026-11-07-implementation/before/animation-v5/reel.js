/* Optional local video export. Uses the same rig and engine as the studio.
 * Load this after character.js and motion.js, then HeyNagReel.start().
 * It records in real time; HeyNagReel.download() saves the completed WebM.
 */
(() => {
  'use strict';
  const api = { status: 'idle', index: 0, frameCount: 0, blob: null, error: null };
  let stop;
  api.start = async function (options = {}) {
    if (api.status === 'recording') throw new Error('A recording is already running.');
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('This browser does not support canvas video recording.');
    await document.fonts.ready;
    const ids = options.ids || Object.keys(HeyNagMotion.clips);
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Object.prototype.hasOwnProperty.call(HeyNagMotion.clips, id))) throw new RangeError('Choose one or more valid feeling IDs.');
    const canvas = document.createElement('canvas');
    canvas.width = 1280; canvas.height = 800;
    const ctx = canvas.getContext('2d', { alpha: false });
    const rigs = ['day', 'night'].map(theme => new HeyNagCharacter(document.createElement('div'), { theme }));
    const stream = canvas.captureStream(30);
    const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 5500000 });
    const chunks = [];
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    let pose = { ...HeyNagMotion.neutral };
    let id = ids[0];
    let raf = null;
    let nextTimer = null;
    let cancelled = false;
    let lastFrame = -Infinity;
    let drawBusy = false;
    let recordingStarted = 0;
    api.index = 0; api.frameCount = 0; api.blob = null; api.error = null; api.status = 'recording';
    function renderSVG(svg) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(new Blob([svg.outerHTML], { type: 'image/svg+xml;charset=utf-8' }));
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('The SVG could not be rendered for video.')); };
        img.src = url;
      });
    }
    const engine = new HeyNagMotion.Engine({
      onFrame(current) { pose = current; },
      onChange(info) {
        if (!info.playing && !info.paused && !info.transitioning && info.duration > 0 && info.time >= info.duration) {
          clearTimeout(nextTimer);
          nextTimer = setTimeout(() => {
            if (api.index + 1 === ids.length) { stop(); return; }
            api.index += 1;
            id = ids[api.index];
            engine.play(id);
          }, 500);
        }
      }
    });
    function clean() {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(nextTimer);
      engine.destroy();
      for (const track of stream.getTracks()) track.stop();
    }
    stop = () => { if (recorder.state !== 'inactive') recorder.stop(); };
    const done = new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const seconds = (performance.now() - recordingStarted) / 1000;
        api.captureStats = { seconds, frames: api.frameCount, fps: api.frameCount / seconds };
        if (!api.error && api.captureStats.fps < 22) api.error = 'The browser throttled this capture. Keep the tab active and record again; the live player is unaffected.';
        clean();
        api.blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        api.status = api.error ? 'error' : 'ready';
        if (api.error) reject(new Error(api.error)); else resolve({ bytes: api.blob.size, clips: ids.length, ...api.captureStats });
      };
      recorder.onerror = event => { api.error = event.error?.message || 'Recording failed.'; stop(); };
    });
    async function draw(timestamp) {
      if (cancelled) return;
      raf = requestAnimationFrame(draw);
      if (drawBusy || timestamp - lastFrame < 1000 / 30 - 2) return;
      drawBusy = true; lastFrame = timestamp;
      try {
        const frameID = id, frameIndex = api.index;
        rigs.forEach(rig => rig.render(pose));
        const images = await Promise.all(rigs.map(rig => renderSVG(rig.svg)));
        if (cancelled) return;
        ctx.fillStyle = '#f1f1ef'; ctx.fillRect(0, 0, 1280, 800);
        ctx.fillStyle = '#252923'; ctx.font = '500 38px "Schibsted Grotesk"'; ctx.fillText('heyNag.', 52, 65);
        ctx.font = '400 28px "Schibsted Grotesk"'; ctx.textAlign = 'right'; ctx.fillText(HeyNagMotion.clips[frameID].label, 1228, 63); ctx.textAlign = 'left';
        ctx.fillStyle = '#eaf0dc'; ctx.fillRect(24, 100, 616, 624);
        ctx.fillStyle = '#202b21'; ctx.fillRect(640, 100, 616, 624);
        ctx.fillStyle = '#566647'; ctx.font = '400 14px "Schibsted Grotesk"'; ctx.fillText('Daylight', 48, 132);
        ctx.fillStyle = '#c1cfae'; ctx.fillText('After dark', 664, 132);
        ctx.drawImage(images[0], 54, 123, 560, 578);
        ctx.drawImage(images[1], 670, 123, 560, 578);
        ctx.fillStyle = '#59634f'; ctx.font = '400 16px "Schibsted Grotesk"'; ctx.fillText('A little moth. A lot of feelings.', 52, 769);
        ctx.textAlign = 'right'; ctx.fillText(`${String(frameIndex + 1).padStart(2, '0')} / ${ids.length}`, 1228, 769); ctx.textAlign = 'left';
        api.frameCount += 1;
      } catch (error) { api.error = String(error.message || error); stop(); }
      finally { drawBusy = false; }
    }
    // Paint one frame before the recorder starts so there is no blank lead-in.
    await draw(performance.now());
    if (api.error) { clean(); api.status = 'error'; throw new Error(api.error); }
    recordingStarted = performance.now();
    recorder.start(1000);
    engine.play(id);
    return done;
  };
  api.stop = () => { if (stop) stop(); };
  api.download = function () {
    if (!api.blob || api.status !== 'ready') throw new Error('The reel is not ready.');
    const url = URL.createObjectURL(api.blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'heynag-v5-emotions.webm';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  window.HeyNagReel = api;
})();

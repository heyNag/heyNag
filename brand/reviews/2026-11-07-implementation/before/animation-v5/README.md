# V5 motion studio

Open [index.html](index.html) directly in a browser. The studio uses local fonts and plain JavaScript; it needs no package install, network request, or development server.

Watch the complete [24-feeling light/dark preview](../../assets/brand/preview/heynag-v5-refined-emotions.mp4) for a recorded overview. The interactive studio adds pause, timeline inspection, and direct selection.

The V5 raster master remains the visual reference. This is a separately drawn, articulated SVG interpretation for motion review, with 24 finite performances in paired daylight and night lighting. It is not a Rive or Lottie export, and it does not replace the original PNG drawings.

## Review controls

- Choose a feeling beside the player with the selector or previous/next buttons. Gallery activation moves focus to the player heading so Tab continues through nearby controls; automatic collection changes preserve focus. Play feeling repeats it; Pause and Resume preserve the current moment.
- Drag the timeline to inspect hand contact, antenna bends, toe taps, and the four wing panels.
- Rest returns to the relaxed master pose. A new feeling blends from the current pose, including an interrupted or paused performance.
- Play all 24 runs the collection once. Stop collection pauses it. The page also pauses playback when hidden or when the stage leaves view.
- Light, Dark, and Both change the preview arrangement. Both characters receive the same numeric pose on every frame.
- Reduced motion shows an expressive still without automatic playback. Timeline inspection remains available.

With focus outside a control, arrow keys select neighboring feelings, Space plays or pauses, and Escape returns to rest. Ordinary control keyboard behavior is preserved.

## Source

| File | Purpose |
| --- | --- |
| `character.js` | Self-contained SVG drawing, palette, joint constraints, face and prop rendering |
| `motion.js` | Numeric pose definitions, 24 timed clips, interpolation and finite playback engine |
| `contract.json` | Shared numeric pose fields and anatomical guardrails |
| `studio.js` | Preview controls, synchronized themes, gallery, reduced-motion and visibility handling |
| `studio.css` | Local review layout using the heyNag type and color system |
| `acting-review.md` | Specialist critique and emotional wing direction |
| `reel.js` | Optional local WebM recorder using the same rig and engine |
| `motion.test.mjs` | Deterministic checks for anatomy bounds, finite playback, interruption, pause, seeking and reduced motion |

Wings retain their shape, attached markings, and four-panel construction. Their held posture changes with feeling: opening, asymmetry, inward folds, or a loose droop. Thinking and focus intentionally keep quiet wings. Flutter is brief and reserved for a small number of active reactions.

No torso scaling, taller stance, grown-up shins, or long arms are used to accommodate a pose. The short hands work close to the ruff; the head meets the thinking mitten. Glasses travel with the head; their appearance is a soft transition, not a staged glasses-pickup action.

## Integrating the rig

Load `character.js` and `motion.js` as classic scripts, then:

```js
const character = new HeyNagCharacter(container, { theme: 'day' });
const engine = new HeyNagMotion.Engine({
  onFrame: pose => character.render(pose)
});
engine.setReducedMotion(matchMedia('(prefers-reduced-motion: reduce)').matches);
engine.play('curious');
// Later: engine.pause(), engine.resume(), engine.rest(), engine.destroy().
```

Listen for changes to the media preference and pause when the character is not visible. Do not trigger a performance on every pointer movement. Keep real project content usable throughout.

The named SVG groups and numeric timeline are editable source for later production work. Weather, holidays, tree meditation, and environment transitions remain the next stage; this collection covers the 24 established emotional states.

## Optional video export

Load `reel.js` after the rig and engine. `await HeyNagReel.start()` records all 24 clips in real time on a 1280×800 canvas, with light/dark side by side. Keep the tab active throughout. Call `HeyNagReel.download()` after it finishes to save WebM. `start({ ids: ['thinking', 'curious'] })` records a shorter selection. The recorder checks browser support, reports capture cadence, rejects visibly throttled captures, and performs no network upload.

Use the live studio to inspect fine movement; a video is a captured preview and its frame cadence depends on browser scheduling.

Run the motion checks from the repository root with `node --test brand/animation-v5/motion.test.mjs`. Review provenance and observed checks in `brand/source/animation-v5.json`. Regenerate the shared asset/source inventory with `node brand/source/manifest.mjs` after changes.

The [refinement report](../reviews/2026-11-07-refinement/index.html) records the updated night antenna contour, emotional entry, hop descent, hand staging, and keyboard fixes. Nine deterministic motion tests cover these behaviors. Original character dimensions and numeric theme poses are unchanged.

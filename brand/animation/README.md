# The heyNag moth — articulated motion study

**Earlier v2-derived study, retained for reference.** The favored character foundation is now `assets/brand/heynag-moth-v5.png`: a big soft head, tiny round body, little mittens, and stub feet. The active stage is character plus light/dark review. Expressions and motion follow, then scenes, weather, and holidays. This rig and its existing scenes are parked; they are not the current production model or a reason to grow the character's limbs.

Open `index.html` directly. It works over `file://` with no build, dependency, server, network requests, sound, or autoplay. The default is a still resting character. Select a performance, or press Play. Every clip is finite and ends in an actual held pose; no idle timer runs afterward. The nine short performances last at most 4.8 seconds. The seated vignette lasts 8 seconds so its calm pause and mischievous reveal have room to land.

This is an **experimental native SVG translation** of `assets/brand/heynag-moth-v2.png`, not a traced/vector master or a finished production rig. It demonstrates earlier articulation and timing. The v5 foundation and its candidate refinements are reviewed separately in [the character proof](../character-proof/index.html); this rig does not establish their anatomy or approval.

## Implemented performances

| Performance | Length | Actual motion |
| --- | ---: | --- |
| A thought → an idea | 4.8 s | Arms form the supported-elbow thinking pose; glasses settle; chin dips; one foot taps; antennae and gaze anticipate the idea; a short compression precedes wing/hand opening and a bulb; then a social glance and directional open hand; bulb fades and pose holds. |
| Working it out | 4.6 s | Glasses and crossed forearms settle, amused grin, small chin dip, single foot tap with the other foot planted, blink, thinking hold. |
| Oh, hey | 3.2 s | Recognition, arm lift, two compact wrist waves, open conversational hand and settling wings. |
| Wait. What’s that? | 3.8 s | Long antenna leads, then gaze, then head/torso; a blink and double take; interested forward lean. |
| Well. That happened. | 3.6 s | Delayed blink, side-eye, asymmetric brows, both palms rise into a crooked shrug, then settle. |
| This again. | 4.0 s | Arms tense, wings contract, brows and gaze tighten, restrained head shake, one exhale, controlled annoyed hold. |
| Oh! | 2.8 s | Anticipatory compression, brief recoil, widened eyes, hands and wings open; antenna follow-through; surprise becomes interest. |
| A quieter moment | 4.2 s | Hands lower first, head/antennae/wings follow; one slow breath; subdued hold without a symbolic tear. |
| Couldn’t help it | 3.5 s | Withheld grin, hand rises near mouth, two shoulder-laugh pulses, antenna/wing follow-through, amused recovery. |
| Very peaceful. Probably. | 8.0 s | Settles cross-legged beside one tree, palms resting on the folded legs; closes both eyes; one calm breath and an untouched 0.9-second hold; one breeze moves the canopy, then a ground leaf, then the long antenna; only the right eye half-opens and glances both ways with a raised brow and crooked smile; eye closes and composure returns for a 1.3-second final hold. |

Selection interpolates from the current pose, including a paused pose. Clips do not swap raster faces. Screen-left and screen-right antenna identity is fixed; no mirroring changes their handedness.

## Rig and controls

`index.html` owns the native vector paths and accessible controls. `rig.js` owns authored keyframes, interpolated joint coordinates, and finite playback. `motion.css` owns the compact study UI and material themes. Independent controls include torso translation/rotation/compression, head, each antenna, each wing, both elbow/wrist/hand chains, both feet, eye gaze and independent left/right openness, each brow, mouth shape, glasses, bulb and shadow. The seated scene adds a crossed-leg silhouette, tree canopy/trunk response, and one traveling leaf. Three ground leaves are visible; there is no particle system or looping wind.

The SVG arm origins stay below the shallow three-lobe collar. The thinking forearm crosses to support the opposite elbow, with its hand separately visible; the opposite mitten rests beneath the chin. Feet are outside the torso group so the supporting foot remains planted during the chin motion.

Buttons support replay, pause/resume, and rest. “Still poses” shows each clip’s chosen expressive pose without playing it; the seated vignette shows the unilateral half-eye peek. `prefers-reduced-motion: reduce` initializes still mode; the user may explicitly enable motion. `1–9` selects the nine short performances, `P` selects the seated vignette, `Space` pauses/resumes/replays, `R` replays, `0` rests, and `Escape` pauses. Keyboard shortcuts do not override native controls. Leaving the tab pauses playback. There is no automatic sequence or looping mode. Captions sit beneath the art, clear of the feet and ground props.

Day and night keep the same cream/charcoal/chartreuse identity and all the same poses. Night adds subtle cream shading, a restrained lens reflection, a localized warm bulb glow, and a fine warm edge around the antennae so dark stems remain distinct. Theme changes are still changes; no surprise motion is attached to them.

## Deliberate study limits

The hand and arm deformation is a simple two-joint vector construction, not finished cel animation; hands currently rotate as mitten shapes. The face is interpolated vector geometry and compressed eye ovals, not a production facial rig. Glasses materialize into position rather than being picked up by a hand. Standing and seated leg contours crossfade during the sitting transition; this is not a fully articulated anatomical sit. Fabric/fur deformation, body turns, walking, hand-authored contour inbetweens, original audio, and export to Lottie/Rive/video are future work. No exported animation format is claimed here.

When revisiting this earlier study, the thought-to-idea clip demonstrates its intended timing at full speed and in still mode. Its supported elbow, foot contact, and body energy are experiments, not requirements imposed on v5. Current character review belongs in the character proof; keep the tiny innocent anatomy even if a later performance needs a different drawing approach.

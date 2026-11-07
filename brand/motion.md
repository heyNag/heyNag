# Character performance and motion

The current [V5 motion studio](animation-v5/index.html) gives the 24 established emotions finite, articulated performances. A separately drawn SVG rig follows the favored raster foundation. The original PNGs and [static expression studio](expressions/index.html) remain intact as visual references.

The big soft head, tiny round body, little mittens, and feet immediately below the body take priority over rig convenience. Never lengthen limbs, expose shins, stretch the torso, or impose an adult stance to accommodate a performance.

## Acting grammar

The moth notices an interesting detail and wants to share it. Attention leads, a brief pause gives the reaction comic timing, and the gesture finishes by making room for the work.

1. Give the reaction a reason: a detail, question, result, or visitor.
2. Let the longer antenna notice first, followed by gaze and head, then the little body.
3. Make one readable main gesture. Supporting parts follow with slight delay.
4. Hold long enough for the feeling to register.
5. Settle into that feeling without an endless idle loop.

## The wings carry feeling

Shape and markings are identity. Wing posture is acting. The static sheets repeated their relaxed wing envelope too much, so the motion pass adds distinct held positions as well as movement.

Each side retains a pale forewing over a smaller richer hindwing, with separate tips and markings attached to their panel. Stable upper-back hinges keep all four panels connected. No cape silhouette, detached feathers, or free-floating spots.

- Curious and Aha use different strengths of asymmetric opening.
- Happy, Proud, and Angry use relaxed, modest, and firmer outward postures respectively.
- Shy, Worried, and Scared bring the panels closer with different intent and speed.
- Sad and Sleepy let them hang loosely; Relief releases a close posture.
- Thinking, Focused, Skeptical, and Mischievous keep quiet wings so their small facial actions can speak.
- Excited may have a brief flutter around its single hop. Laughing has a couple of small body-driven responses. Neither repeats indefinitely.

The [24-state specialist review](animation-v5/acting-review.md) records detailed acting direction. Suggested degrees there are artistic starting points; implemented limits and timings live in `animation-v5/character.js` and `animation-v5/motion.js`.

## Anatomy and contact

The head comes down toward the thinking mitten. Short hands stay near the ruff and upper belly. Arm reach is bounded by the rig; no temple or crown reach is forced onto tiny anatomy. Toe taps pivot attached stub feet, and the excitement hop moves the whole character without stretching it.

Face, brows, mouth, gaze, antennae, hands, feet, and four wing panels have separate controls. Glasses follow the head and leave the eyes visible. Their soft appearance transition is implemented; a physical glasses-pickup action is not. Bulb, heart, tear, and breath cues stay subordinate to the face.

Day and night receive identical numeric poses. Theme colors supply warmer cream and restrained edge contrast on the darker ground. Lighting never changes the character's anatomy or emotion.

## Playback

The player offers a nearby feeling selector and previous/next buttons, deliberate selection, finite playback, pause/resume, rest, timeline inspection, and an optional one-pass collection. Switching feelings blends from the current pose, including a paused or interrupted performance. Related difficult or reflective feelings retain their outgoing expression through neutral-inherited anticipation; explicit incoming actions remain intact. The sad↔worried switch no longer flashes the welcoming smile. The excited hop continues descending through the wing reversal before landing. Thinking, focus, worry, and gratitude use more distinct short-hand staging. It does not queue a chain of pointer reactions.

Reduced motion selects an expressive still immediately. There is no initial autoplay, sound, or infinite idle animation. Hidden pages and an out-of-view stage pause the studio. The live region announces playback state changes rather than every animation frame.

The renderer has no internal animation loop. The engine owns timing and stops scheduling frames when a performance finishes, pauses, or is destroyed. Future applications should preserve those lifecycle rules.

## Source and applications

[The motion README](animation-v5/README.md) documents source files, integration, and local video export. The editable source is SVG and JavaScript, not a Rive or Lottie file. Video exports capture the same rig and timelines for review; browser scheduling can affect their frame cadence.

The earlier [V2 pose lab](lab/index.html) swaps illustrated poses with whole-figure CSS movement. The [V2 articulated study](animation/index.html) has older anatomy and a scene experiment. Both remain historical and must not become templates for V5 limbs or proportions.

Weather, holidays, tree meditation, and smooth environment transitions remain the next stage described in [world.md](world.md). The 24 current clips are emotional performances, not all future scene ideas. The heyNag.com portfolio is not built or deployed by this motion study.

GitHub uses still assets and ordinary links. Interactive choreography belongs in the future website; do not depend on executable SVG or JavaScript in a profile README. Nag and the real projects remain the focus.

The four-issue refinement, fresh evidence and nine-role re-review are recorded in [the refinement report](reviews/2026-11-07-refinement/index.html). [The standing team](team.json) also reviews future engineering and website work.

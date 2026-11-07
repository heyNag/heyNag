# V5 wing acting review

This is art direction from the [24-state acting catalogue](../expressions/acting.json), not a visual pass of the new SVG rig. The animation files were not yet present when this review began. Actual rendered poses, contacts, bounds, timing, and day/night treatment still need visual review.

The static sheets rely heavily on faces and mittens while repeating a similar wing envelope. Animation should correct that with **different held wing poses**, not a common flap added to every state. A clip must remain expressive when paused. Some states deliberately share quiet wings because their attention belongs in the face and hands.

## Rig requirements

- Keep four panels: a pale forewing overlapping a smaller rich-green hindwing on each side. Attach each panel to a stable thorax root hidden behind the ruff/body. Move its marking and outline with it. No detached panel translations, sliding spots, missing hindwings, or continuous cape silhouette.
- Give each side an independent opening/tuck angle. Let its hindwing follow at roughly 60–80% of the forewing excursion, with at most a short 40–80ms settling lag. Preserve the overlap throughout; a hindwing must not swing freely ahead of its forewing.
- **Open** means tips lift outward; **tuck** means panels sweep closer behind the little body; **droop** means tips hang low and loosely separated. Tuck should look compact and intentional; droop should look slack. Use stable-root rotation and natural overlap/occlusion. If the rig needs a folded-view shape, keep the root fixed and preserve the panel identity instead of collapsing it with an arbitrary scale effect.
- The angle suggestions below are starting points relative to V5's relaxed rest pose, not validated SVG-axis signs. Mirror opening correctly on opposite sides. Small changes are roughly 5–12 degrees; broad changes are 15–25 degrees. Maintain a useful visible hindwing tip and the four-panel structure.
- Never enlarge the wings, lengthen limbs, stretch the torso, or introduce adult posture to obtain a stronger silhouette. Check the widest opening against the fixed view box. The head stays large and soft; the body stays tiny and round.
- Motion is finite. At most two small flutter beats in Excited, two loose responses to the laugh in Laughing, and one restrained reaction in a few other states. No default perpetual flapping, no identical wing oscillation copied across the library, and no extra wing activity during every blink.

## Twenty-four wing performances

Each row specifies a useful held pose and one bounded transition. Keep the final pose intentional; do not automatically return all states to the same wings while their distinct faces remain active.

| State | Wing pose and bounded action |
| --- | --- |
| **Curious** | Open the wing nearer the interest about 10–12 degrees; keep the other near rest. Let this small balancing lift follow the antenna, gaze, and head. Hold the asymmetry. No flap. |
| **Thinking** | Fold both pairs neatly about 10 degrees closer. Set them once as the head settles to the chin mitten, then keep them still during the little chin nod and toe tap. |
| **Happy** | Both pairs comfortably open about 5–7 degrees. Ease into that relaxed shape with one small buoyant settling response. No sustained wing motion. |
| **Mischievous** | A compact, composed fold around 10–12 degrees. Keep wings deliberately still during the peek; the alert antenna and eye betray the pretend sleep. |
| **Aha** | One forewing lifts about 20 degrees, the other about 10. Begin 80–120ms after the face brightens; the smaller hindwings follow. Hold the delighted asymmetric opening. No hop or repeating flutter. |
| **Oops** | Shrink unevenly: tuck the cheek-mitten side about 15 degrees and the opposite side about 5. A short freeze followed by one small settling fold reinforces the sheepish pause. |
| **Laughing** | Loosen both pairs into a modest 8-degree opening. Let them answer the two compact laugh bobs with two small 3–5-degree pulses, then settle loosely. The body drives the response. |
| **Excited** | Open both pairs broadly, roughly 20–25 degrees. During the single hop allow at most two short, small flutter beats; land and settle to a still 10–12-degree opening. No hovering. |
| **Proud** | Open both pairs modestly, around 8–10 degrees, over 300–400ms. Hold steadily as the chin lifts. No chest expansion, forceful flare, or flap. |
| **Grateful** | Fold both pairs closer by roughly 10–12 degrees during the little bow. Ease to a gentle close hold as the gaze returns to the viewer. |
| **Affectionate** | Make a soft inward cup: forewings tuck about 15–18 degrees and hindwings about 8–10. Hold the enclosing shape through the head tilt. Do not flap around the heart. |
| **Shy** | The narrowest comfortable voluntary fold: approximately 20–25 degrees in the forewings and 12–16 in the hindwings, with all layers still legible. Let the pair on the averted-gaze side close a little more. Hold. |
| **Confused** | Use a small uneven shrug: one pair slightly open, around 5 degrees, the other drooped about 10. Shift into it once as the head retracts and low mittens turn up. No repeated alternating wag. |
| **Focused** | Both pairs close neatly about 10–12 degrees and stay there. A quiet silhouette lets steady gaze, glasses, and low hands carry the attention. |
| **Skeptical** | Keep a restrained close pose, about 8 degrees, with only a few degrees of asymmetry accompanying the head drawing back. Then hold absolutely still. No flutter or mischievous perk. |
| **Surprised** | Snap both pairs evenly open about 20–25 degrees over 100–140ms, freeze briefly, then ease to an open 12-degree hold. One expansion, no oscillation. |
| **Relieved** | Release from a close pose into a relaxed low opening over 500–700ms. Let forewing tips lower a little more than the hindwing tips. Finish loose and still with the exhale. |
| **Sleepy** | Let the forewing tips droop slowly, around 18–20 degrees, while the hindwings trail less and remain visible. One slack settling movement during the yawn; then rest. No alert tip flick or repeated sleep flutter. |
| **Sad** | Both pairs hang low and loosely separated, around 18–20 degrees of droop. Let them sink after the gaze and head over 500–700ms. Keep space beside the low empty hands; this is heaviness, not protective wrapping. |
| **Worried** | Tuck both pairs close, around 15–20 degrees. Make one small extra inward tightening as the mittens clasp, then hold alert and contained. No pendulum sway. |
| **Scared** | Fold into the strongest safe protective brace over roughly 150ms, about 20–25 degrees closer. One tiny 1–2-degree settling tremble may follow, then hold. Do not open outward like Surprise or beat like Excited. |
| **Frustrated** | Start compact and slightly uneven. Give both pairs one short inward tightening with the toe press, at most 5–8 degrees of additional movement, then release slightly into a still close pose. Avoid the proud/angry outward flare. |
| **Angry** | Set a firm outward flare, around 12–16 degrees, with smaller hindwing movement. Hold through the tiny planted protest. Stiffness comes from timing, not sharp new wing shapes or aggressive flapping. |
| **Disgusted** | Fold away asymmetrically: the pair nearer the unwanted subject retracts first, around 18–22 degrees, while the other closes about 8–10. Hold the little “no thanks” shape as the body draws away and one mitten declines. No shudder loop. |

## Expression distinctions to protect

| Comparison | Combined face, body, and wing intention |
| --- | --- |
| Curious / Happy / Aha | Curious approaches with low empty hands, a small closed questioning smile, and one tentatively opened wing. Happy rests with open oval eyes, a rounded smile, and balanced relaxed wings. Aha lifts one mitten with bright eyes, a rounded discovery mouth, and a stronger delayed asymmetric wing lift. |
| Mischievous / Sleepy / Skeptical | Mischievous has one soft peeking oval eye, a centered U-smile, an alert long antenna, and composed quiet wings. Sleepy closes both sides into a yawn and lets the wings go slack. Skeptical keeps an observant eye opening, an unequal brow and flat mouth, with restrained quiet wings. Avoid two narrow diagonal eye slits in all three. |
| Sad / Worried / Scared | Sad looks down and sinks with low empty hands and hanging wings. Worried remains alert, closes its mouth, clasps low mittens, and tucks its wings. Scared recoils with an open mouth, both mittens near the lower cheeks, and a fast protective wing fold. |
| Frustrated / Angry / Disgusted | Frustrated squeezes its eyes shut, contracts inward, and tightens the wings with one tiny toe press. Angry keeps round open eyes, a firm frown, planted feet, and a steady modest flare. Disgusted is gentle aversion: a soft wavy mouth, one declining mitten, and a one-sided withdrawal. No teeth, tongue, new nose, or mature sneer. |

## What the next visual review must establish

Review the actual rest, peak, and held pose for each state. Check wing roots, forewing/hindwing overlap, attached markings, four-panel readability, safe bounds, hand separation, and tiny body proportions. Compare the nearby emotions together, especially Surprise/Scared/Excited and Sad/Worried. Look at both themes and the reduced-motion stills. A scene-wide tilt or scaled raster is not evidence that these articulated actions have been implemented.

The direction above is intentionally specific enough to challenge repeated silhouettes, but no unrendered pose, degree range, animation, or small-scale expression is declared to pass.

## Actual rendered review outcome

The subsequent review inspected the implemented `character.js` and `motion.js`, sampled the 24 intended still poses, and viewed real browser captures in both themes. Evidence included `motion-v5-thinking-pair.png`, the corrected day/night galleries, `motion-v5-face-review.png`, `motion-v5-eyes-final.png`, and `motion-v5-excited-final.png` from the task's local evidence directory.

The final inspected stills preserve the large soft head, tiny round torso, little mittens, and stub feet. Thinking's upper mitten visibly meets the lower jaw, with the supporting mitten contained within the small body. The wings now have useful pose differences: Surprise and Excited spread broadly; Scared folds into a narrower brace; Curious and Aha open asymmetrically; quiet states keep restrained folds. The four panel layers and their markings remain connected in the observed poses.

The reviewed corrections resolved the primary drawing concerns. Laughing and Excited now have rounded mouths instead of long leaflike openings. Angry has readable, gently furrowed brows; Frustrated's closed frown no longer duplicates a sleepy open mouth. Sad, Sleepy, and Relieved lower their antenna tips. Grateful and Shy retain open, warm eyes. Mischievous keeps its deliberate rounded half-eye peek, while the upper-lid edge no longer inherits the pupil's sharp diagonal. Skeptical remains distinct through its flatter mouth and restrained lids without changing the character's anatomy. The final Excited capture shows the complete raised long antenna with visible headroom in both themes.

**No remaining blocking drawing, hand-contact, wing-attachment, or framing defect was visible in the final inspected stills.** The angle table above remains art direction rather than a claim that every suggested numerical value was used. Rig-safe geometry and the actual reviewed output take precedence over those initial ranges.

This verdict is bounded to source inspection and the captured frames. It does not establish smoothness at every intermediate frame, uninterrupted playback, transition behavior, reduced-motion behavior, accessibility, or runtime performance; those require their own live-engine checks. It also does not establish blind recognition of all 24 emotion labels. Subtle neighbors such as Grateful and Shy continue to benefit from context, their different gestures, and motion. General library display remains best at approximately 128–160px cells; 96px is a contextual preview, not a guarantee that every nuance survives. No tiny avatar or public release is approved by this review.

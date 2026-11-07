# The heyNag design system

heyNag is Nag's personal identity across software, projects, notes, and future professional work. The curious moth makes it recognizable. The work gives it substance. This system makes room for both: a character with a full emotional range, and clear stories about how real software is built.

The moth can lead an introduction, react to a surprising result, investigate a project, or take over an illustration. It should feel like an expressive recurring character with its own curiosity. Large artwork, unusual poses, and moments of delight belong here. Readability and truthful engineering details make that playfulness credible.

This directory defines reusable brand ingredients. It is not the heyNag.com website, a finished portfolio, or a collection of production UI controls.

## Identity and recognition

| Role | Use |
| --- | --- |
| Person | Nag |
| Public name | heyNag, with the capital N |
| Future domain | heyNag.com |
| Character | The original curious moth |
| Signature | Exploring ideas worth keeping. |
| Voice | Fun, talkative, curious, geeky, and warm, with dry wit and real work underneath |

The outlined wordmark and the moth should each remain recognizable alone. Use them together for introductions and major brand applications. Let the moth take more space when the purpose is to welcome, express an idea, or establish personality. Keep `heyNag` unmistakable and connect each performance to Nag's words or work. An expressive mascot does not replace a first-person introduction or an actual project destination.

There is no fixed job title in the identity. A résumé or future role-specific introduction can describe Nag's actual experience without changing the name, character, or design system.

## Character direction

The favored foundation is `assets/brand/heynag-moth-v5.png`: a big soft cream head, tiny rounded body, little mitten hands, feet immediately beneath the body, and asymmetric rounded antenna tips. Pale forewings overlap richer green hindwings with restrained markings. Preserve the innocent proportions; no long shins, adult hip stance, or enlarged hands for articulation. Follow `brand/character.md` for construction and review status.

`heynag-moth-v5-refined.png` and `heynag-moth-v5-night.png` are reviewed candidates and local drafts. Visual QA found preserved innocent anatomy and no blocking defect; `brand/character-proof/` shows the day/night, scale, and seam comparisons. The recommended full-body minimum is 96px. This is not final user approval or a public release. The V2 headers, avatar, pose lab, and derived rig remain historical. Current V5 vector headers and a circular-safe head avatar are documented in `brand/source/applications-v5.json`; avatar checks cover 32–160px and phone headers at390px. A manifest entry records an asset, not universal approval. Keep the complete silhouette and the same anatomy across light and dark treatments.

The active library includes the V5 foundation, 24 expressions and articulated motion in light and dark. Scenes, weather and holidays remain later applications. The following ideas must adapt to the tiny body rather than changing its proportions:

| Expression | Performance | Where it helps |
| --- | --- | --- |
| Curious | Wide attentive eyes; one antenna reaching toward the subject; a small supported inclination | A new question or project introduction |
| Investigating | Leaning close, wing held behind the back, eyes following a small object | Debugging, a detail view, or a design decision |
| Focused | Glasses on, antennae angled forward, body absorbed in the detail | A technical passage or difficult implementation |
| Surprised | Open mouth, lifted wings, antennae springing apart | An unexpected finding, with the finding explained in text |
| Delighted | Broad smile, open wings, a short celebratory hop | A real release or a useful result |
| Mischievous | Side glance and a small grin; one antenna slightly curled | A playful experiment or an amusing development note |
| Puzzled | Uneven antennae, an inquisitive glance, hands open | An unresolved question or a candid account of a failed attempt |
| Welcoming | A clear wave with a friendly, open stance | The GitHub header, an introduction, or an About page |

Later poses can use wings, little hands, eye direction, and antennae together while keeping the same head-dominant construction. Do not lengthen arms or legs to obtain a more human pose. Future props come from the story: glasses for deep work, a note worth keeping, or a small idea bulb. Use one meaningful prop at a time. Glasses are situational, not a permanent costume.

The moth belongs to heyNag. Third-party characters, including the unofficial Grok Bot project, stay inside their project stories. They do not substitute for the personal mascot.

Muse, Grok Bots, and ChatGPT's Dots are references for emotional immediacy and the feeling of a companion. The goal is that quick, joyful recognition. The heyNag moth keeps its own anatomy, silhouette, palette, expressions, and movement; it does not borrow those characters' faces or signature behavior.

### Composition with the moth

- On a major introduction, let the moth occupy roughly one third to one half of the composition. Scaling it up must preserve its tiny, innocent proportions.
- Position its gaze toward the name, project, or question it accompanies. Give the eyes something meaningful to attend to.
- Keep layouts and screenshots level. Future reactions stay within the little character's anatomy and its own space.
- Use a complete full-body pose when the posture matters. Use the purpose-made head avatar for small identity marks.
- Avoid placing the moth on every heading or repeating the same pose down a page. Each appearance should add a different beat to the story.
- Keep essential information in live text. Expression adds tone; it does not carry an error message, development status, or action by itself.

## Color roles

| Token | Hex | Role |
| --- | --- | --- |
| `--hn-ink` | `#1C1C1C` | Main text, outlines, dark ground |
| `--hn-paper` | `#F1F1EF` | Light ground, inverse text |
| `--hn-fresh` | `#A8C84B` | Fresh green drawn from the moth's color family; expressive fields and dark-mode actions |
| `--hn-forest` | `#36552D` | Accessible green for links and primary actions on light grounds |
| `--hn-sage` | `#8FA68E` | Legacy supporting token; not a signature field or character stage |

Paper and ink provide a reliable reading surface. Chartreuse (`--hn-fresh`) is the sole signature accent: one large identity field, a character stage, or an important interaction. Forest is its accessible light-theme utility color. Sage is retained only for compatibility and should not compete with chartreuse in new applications. Do not assign a different accent to each project or tint screenshots to fit the palette.

Chartreuse is a surface color on the light theme, not small text on paper. Forest provides that accessible text role. Use ink on chartreuse. The character's cream and pale-green fills belong to the illustration, rather than an additional set of interface accents.

### Verified text and action pairings

These ratios were calculated from the exact sRGB values using WCAG relative luminance. They apply to solid colors, without opacity, texture, or an image behind them.

| Foreground / background | Contrast | Application |
| --- | ---: | --- |
| Ink / Paper | 15.07:1 | Light body text; inverse pairing on dark |
| Paper / Forest | 7.44:1 | Primary action in the light theme |
| Forest / Paper | 7.44:1 | Light-theme links and focus outline |
| Ink / Fresh | 8.95:1 | Fresh fields and primary action in the dark theme |
| Fresh / Ink | 8.95:1 | Dark-theme links and focus outline |
| Ink / Sage | 6.50:1 | Text on a sage field |
| `#555D52` / Paper | 6.04:1 | Muted light-theme text |
| `#B9C3B2` / Ink | 9.34:1 | Muted dark-theme text |

Do not put paper text on fresh or sage. Do not use forest text on fresh; that pairing falls below 4.5:1. Recheck contrast when introducing a new surface, alpha value, or hover state. A passing palette does not replace testing the rendered application.

## Typography

Use Schibsted Grotesk at 400 and 500. The source files and SIL Open Font License live in `brand/fonts/`. `design-system.css` loads them relative to itself; keep that directory relationship when reusing the system.

The exported wordmarks use fixed vector outlines. They are the identity assets. Live headings use the same family but do not reconstruct the wordmark with arbitrary tracking or a different weight.

| Role | CSS class | Intended scale |
| --- | --- | --- |
| Display statement | `.hn-display` | Fluid 52–120px; one deliberate moment |
| Introduction title | `.hn-title` | Fluid 36–72px |
| Section heading | `.hn-heading` | Fluid 30–48px |
| Project or subsection | `.hn-subhead` | Fluid 24–32px |
| Introduction text | `.hn-lead` | Fluid 18–22px |
| Reading text | `.hn-prose` | 16px, 1.6 line height, up to 62 characters per line |
| Supporting detail | `.hn-small` | 14px; never the only home for an essential fact |

Regular weight carries most headings. Medium supplies emphasis and action labels. Use size, spacing, character, and real imagery for expression; weight alone should not do all the work. Keep display sentences short enough to read as one thought. Code uses a monospace face inside actual code only.

## Space, shapes, and layout

The spacing scale is 4, 8, 12, 16, 24, 32, 48, 64, 96, and 128 pixels at the default root size. Components share a fluid outer gutter of 24–64px and a maximum reading composition of 1280px. Left and right edges stay equal.

Most content remains open on the page. A character stage can have a generous 32px radius, reflecting the moth's rounded silhouette. A media frame uses 24px; code uses 8px. Actions use a full pill shape. Avoid turning every paragraph into a panel or every project into a repeated feature card.

At tablet widths, introductory and project-story splits stack text first. At phone widths, introduction actions fill the column. Character artwork scales with its container and stays complete. There is no fixed page or viewport height in these tokens: the future website's actual content and page plan will determine those.

## Reusable components

Load the CSS and apply `.hn-system` to the application root. Choose a theme on that root or the document element with `data-hn-theme="light"` or `data-hn-theme="dark"`. With neither value set, the document follows the system preference. A theme control is a future application decision; this stylesheet does not create one.

### Introduction

`.hn-intro` joins a personal introduction and a substantial character stage. It provides the name, a plain description of the work, and a real destination. Use the signature once. The copy may be friendly and personal; a personal brand does not need a product-sales headline or an invented professional title.

```html
<section class="hn-intro">
  <div class="hn-intro__copy">
    <h1 class="hn-title">I'm Nag. I work in software.</h1>
    <p class="hn-lead hn-intro__body">I build tools, connect systems, and follow the questions that turn into projects.</p>
    <div class="hn-intro__actions">
      <a class="hn-action" href="https://github.com/heyNag">See my projects</a>
    </div>
  </div>
  <div class="hn-character-stage" data-ground="fresh">
    <img class="hn-character" src="assets/brand/heynag-moth-v5.png" alt="The little curious heyNag moth">
  </div>
</section>
```

This example uses the favored v5 foundation for review, not a declaration of release approval. Paths are relative to the application's document. Asset reuse must preserve the manifest and source version described in `brand/README.md`.

### Project story

`.hn-project-story` pairs concise copy with evidence. A story explains the question, Nag's contribution, a decision, and what happened. Its visual is a real demonstration, interface, technical detail, or authored illustration that is identified as such. Do not invent a result or product screen to fill the frame.

Use `.hn-project-story__copy` for the text and `.hn-project-story__evidence` for the visual. `.hn-project-story__status` can state a real status such as “In development.” A linked visual lifts 2px and its image gently enlarges on hover; the underlying project remains readable without hover. Use `.hn-project-story--wide` when a wide demonstration is the primary evidence.

Give each story a distinct visual composition supported by its actual material. One can feature a video; another can show a real diagram, a code detail, or a close comparison. Keep the shared type, spacing, and links consistent.

### Character stage

`.hn-character-stage` is a deliberate space for a pose. It accepts `data-ground="paper"`, `"ink"`, or `"fresh"`. `.hn-character-stage--wide` changes the stage to 3:2; `.hn-character-stage--open` lets the character sit directly on the application ground. The CSS never recolors the source artwork.

The stage can contain a single expressive performance or several authored poses in a purposeful comparison. It is not a generic decorative background. Keep the explanation in nearby live copy, and preserve enough space for the silhouette and finite gestures. If the character is purely decorative and the identity is already stated, use an empty alt attribute.

### Notes and longer writing

`.hn-prose` provides a readable measure, heading rhythm, links, and real code blocks. Use illustrations at meaningful breaks: a new question, a confusing observation, a satisfying result. The moth may be funny or puzzled; the text should remain precise enough to be useful to another person.

## Parked motion direction

The V5 motion studio implements 24 finite performances in paired themes. Retain older experiments as historical studies; do not enlarge the body or limbs to inherit their rig. Contextual interactions should give the moth a reason to notice, react and settle.

The stylesheet provides three optional, finite gestures for a `.hn-character` image:

| Attribute | Timing | Behavior |
| --- | --- | --- |
| `data-gesture="curious"` | 900ms | A small lean toward the subject, then rest |
| `data-gesture="greet"` | 700ms | A brief anticipation and friendly hop |
| `data-gesture="celebrate"` | 1100ms | A larger hop with a smaller settling bounce |

These are supporting gestures, not completed character animation or replacements for expressive pose artwork. An application may set an attribute in response to a deliberate interaction and remove it afterward. Adding the attribute on every render would repeatedly restart the gesture and should be avoided.

Use one clear performance at a time. Let it finish before another begins. Do not make every pointer movement demand attention, attach the character to the cursor, or imply that work is happening when no real process exists. A future looping vignette needs an explicit pause control and a useful still state. Videos and animated image assets require their own playback handling; CSS cannot pause an animated WebP or GIF.

Links visibly underline before hover. Actions rise 2px on hover and press down 1px on activation. Project media can zoom to 1.02 inside its frame. These are the repeated interaction rules; page sections, cards, headings, and screenshots do not wobble or tilt.

Under `prefers-reduced-motion: reduce`, the CSS disables its gestures and transforms and retains all content. Future sprite, video, canvas, or vector animations must separately respect that preference and render an expressive still. The experience should retain the character's personality when no pixels move.

## Future application patterns

| Application | How the identity behaves | What provides substance |
| --- | --- | --- |
| Homepage | A welcoming moth, an unmistakable heyNag identity, and room for one memorable character moment | Selected public projects and clear paths into their stories |
| Project story | A pose responding to the project's actual question; a visual style chosen for its evidence | Problem, contribution, constraints, decisions, demonstration, validation, and lessons |
| Notes | A more conversational, curious character presence with selective illustrations | Useful observations, experiments, failures, and specific learning |
| About | A direct introduction from Nag; an expressive portrait of the moth alongside the personal story | Verified experience, interests, working approach, and any contact route Nag chooses |
| Résumé | Name and work stay easy to scan; the character becomes a small optional signature | Actual roles, contributions, skills, and outcomes, with no invented claims |
| GitHub | A readable header and original mascot, followed by plain project stories and real links | Public repositories, demonstrations, development status, and accessible Markdown |

The playful and professional applications belong to the same person. Adjust the amount of illustration to the task while keeping the name, type, palette, and voice recognizable. A résumé needs less character performance than an experiment page, not a different identity.

## GitHub and future website boundaries

The current application is a GitHub profile. GitHub controls body typography and layout; the profile cannot import this CSS or run custom scripts. Exported wordmarks, headers, poses, and readable Markdown carry the identity there. Do not render the entire profile as one image to force custom typography.

The retained v2 1200 × 360 header study pairs the large name with a complete character. Its day edition uses a chartreuse field and ink name; its night edition uses an ink field and chartreuse name. These are earlier applications, not the current v5 model. The current V5 draft uses `header-v5-light.png` and `header-v5-dark.png`, exported from the unchanged native V5 anatomy and existing outlined wordmark. The root README selects this pair. Circle-safe head avatars are separate V5 applications. Use `source/applications-v5.json` for source, supported sizes and review status.

The future heyNag.com website can use these tokens and components. When that work begins, apply the design-taste-frontend page workflow to the real brief: deal the layout, plan the screens, use actual material, and run its responsive, contrast, layout, motion, and performance checks. A brand proof document and a GitHub README do not inherit its one-section-per-screen requirement.

## Validation before a new application ships

- Check every actual text/background pair, hover state, and focus ring in both themes.
- Inspect at 1440, 1024, 820, 768, and 390px, with a 320px narrow-width check for readable content and controls.
- Check keyboard order, visible focus, link destinations, image alternatives, and reduced motion.
- Inspect the moth at avatar sizes and at large display scale; verify that antennae and wings remain complete.
- Verify that a pose, action, animation, and caption do not imply unimplemented behavior or an unverified result.
- Keep source fonts and their license, accepted artwork provenance, manifest, and source revision with exported assets.

The current color ratios were calculated from the values above. The stylesheet supplies the documented tokens and components. Browser layout, keyboard, motion, and performance checks belong to each application and are not claimed by the existence of this file.

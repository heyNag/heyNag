# heyNag brand

This repository is the source of truth for the heyNag personal identity and its GitHub application. The identity connects useful software, systems work, and curious experiments. It should remain recognizable as the projects and technologies change.

The website at heyNag.com is a future application of this identity. No website or deployment configuration is included here.

## Identity

- **Person:** Nag
- **Full name:** Nagarjuna Boddu
- **Public name:** heyNag, with this exact capitalization
- **Signature:** Exploring ideas worth keeping.
- **Character:** a curious comic moth
- **Voice:** fun, talkative, curious, geeky, and warm, with dry wit and real work underneath

The name is the primary identity. The moth is Nag's tiny, innocent companion: attentive when something is unfamiliar, absorbed in a technical detail, and eager to share a useful result. Preserve the big soft head, tiny round body, little mittens, and stub feet. Current work covers the 24 expressions and their articulated motion studies in both themes. Scenes, weather, and holidays follow. Acting must fit this small character. Keep it visually distinct from project characters such as the unofficial Grok Bot.

## Files

| Location | Purpose |
| --- | --- |
| `README.md` at the repository root | The public GitHub profile story |
| `brand/profile/` | Editable account settings, public project evidence and GitHub-to-website continuity |
| `assets/brand/` | Exported wordmarks, light and dark headers, mascot, and avatar |
| `brand/fonts/` | Source typefaces and their Open Font License |
| `brand/source/build.swift` | Original outlined wordmark and historical V2 header export |
| `brand/source/applications-v5.js` | Reproducible current V5 avatar and header export from the native rig |
| `brand/source/applications-v5.json` | Application use, geometry, export recipe and review status |
| `brand/team.json` | Standing nine-role review team and engineering handoff workflow |
| `brand/source/mascot-prompts.json` | Character generation briefs and provenance |
| `brand/manifest.json` | Asset version, paths, and checksums |
| `brand/story.md` | Voice and project-story guidance |
| `brand/character.md` | Favored v5 construction, review status, and parked behavior ideas |
| `brand/character-proof/` | Character and light/dark candidate review |
| `brand/expressions/` | 24 V5 expressions, paired themes, selectable gallery, and acting catalogue |
| `brand/animation-v5/` | Current V5 vector motion studio: 24 finite performances, synchronized themes, timeline and editable rig |
| `brand/expressions.md` | Expression construction and differentiation guide |
| `assets/brand/expressions-v5/` | Transparent day/night expression sheets; selected versions in the catalogue |
| `brand/source/expressions-v5.json` | Exact generation and correction prompts, selected sheet paths, provenance |
| `brand/motion.md` | Current motion system, acting rules, and earlier study boundaries |
| `brand/design-system.css` | Reusable color, type, spacing, and interaction tokens |
| `brand/design-system.md` | Visual system and future application patterns |
| `brand/lab/` | Earlier v2 pose and interaction study |
| `brand/animation/` | Earlier v2-derived articulation and timing study |

Local character, pose, and motion explorations are retained in this repository and clearly labeled as studies. The V5 motion rig is a vector interpretation of the favored raster foundation and remains open to refinement. Private project research is separate from this brand package.

## Visual system

Use Schibsted Grotesk at regular and medium weights. The exported wordmarks contain fixed vector outlines and do not depend on installed fonts.

| Color | Hex | Use |
| --- | --- | --- |
| Ink | `#1C1C1C` | Main text and dark ground |
| Paper | `#F1F1EF` | Light ground and inverse wordmark |
| Fresh | `#A8C84B` | Signature green, expressive fields and dark-theme actions |
| Forest | `#36552D` | Accessible green links and actions on paper |
| Sage | `#8FA68E` | Legacy supporting token; not a signature field or character stage |

Chartreuse is the one signature accent. Paper and ink carry reading surfaces, while forest supplies accessible green links and actions on paper. Use ink on chartreuse; paper or forest text on chartreuse does not meet 4.5:1. Keep layouts spacious, readable, and aligned. Let the actual projects and the character provide personality. The moth's artwork has its own cream and green fills; preserve them rather than tinting the image to match every surface.

The favored foundation is `assets/brand/heynag-moth-v5.png`. It returns to the original's tiny proportions while adding layered pale forewings, richer green hindwings, and restrained green markings. `heynag-moth-v5-refined.png` and `heynag-moth-v5-night.png` are reviewed candidates and local drafts. Their visual QA preserved the innocent anatomy and found no blocking defect; `brand/character-proof/` shows day/night, scale samples, and the seam cleanup. This is not final user approval or a public release. Full-body artwork has a recommended minimum height of 96px. The V5 head avatar uses the unchanged vector head in a circular-safe crop; 512px day/night SVG and PNG exports are in `assets/brand/heynag-moth-avatar-v5-{day,night}.*`. Full-body drawings are not substitutes for tiny avatars. The V2 avatar is retained as history.

`brand/manifest.json` records asset inventory and checksums; an inventory entry alone is not a release approval. Keep complete antenna tips and transparent edges, and never stretch the character. The original v1 artwork remains the proportion reference behind the v5 direction. V2 and the taller comic studies remain history, not construction guides for new work.

The current V5 GitHub headers join Nag’s name and the complete tiny vector character. The day edition uses chartreuse with an ink wordmark; night uses a forest ground with chartreuse lettering. README.md points to these versioned PNGs. V2 exports remain historical. Application provenance and repeatable export instructions live in `brand/source/applications-v5.json`.

## Updating the assets

The current expression library has 24 static poses in both themes. Open `brand/expressions/index.html` directly for review. `acting.json` maps each selected sheet and zero-based cell; regenerate the browser copy after changing it with `node brand/source/build-expression-data.mjs`. Keep 128–160px cells for general use; 96px is a contextual preview. The renderer clips the final 3% of each cell's empty bottom margin to prevent neighboring-row antenna pixels from entering the selected frame. It preserves the original raster files and all character appendages.

To reproduce the earlier v2 header study from the repository root on macOS:

```sh
swift brand/source/build.swift \
  brand/fonts/SchibstedGrotesk-Regular.ttf \
  assets/brand/heynag-moth-v2.png \
  assets/brand
```

The generator exports outlined SVGs and PNGs. The profile uses PNG headers so it does not depend on nested image support inside an SVG.

For current character work, use the favored v5 foundation and follow `brand/character.md`. Open `brand/animation-v5/index.html` for the articulated 24-state motion studio; its source, controls, and integration notes live beside it. Scenes remain a later stage. Use full-body artwork at 96px or larger; the matching V5 head avatar has circular-mask checks at 32, 48, 64, 96, 128, and 160px. Its smallest tested size is 32px; 24px is not established. Image-generation prompts record provenance and guide edits; they do not reproduce identical pixels.

When a reviewed character version is deliberately adopted into an application, rebuild its headers, refresh `brand/manifest.json`, inspect the profile at desktop and phone widths, and review the Git diff before publishing. A candidate export does not automatically replace the retained header studies.

```sh
node brand/source/manifest.mjs
node brand/source/manifest.mjs --verify
```

The original and v2 pose atlases retain earlier expression experiments. The local lab uses the v2 atlas when available, with an older fallback, and demonstrates pose changes and finite whole-figure gestures. `brand/animation/` separately retains a v2-derived SVG articulation study. Use `brand/animation-v5/` for current motion work; never use V2 proportions as the anatomy template.

## Future website repository

The intended website repository is `heyNag/heynag.com`. Create it when website development begins. It should contain the website source and deployment configuration, plus a versioned copy of the public assets it uses from this repository.

Record the source commit and asset manifest when updating that copy. This keeps one place to maintain the identity while allowing the website and GitHub profile to release changes deliberately.

## Attribution

Schibsted Grotesk is distributed under the SIL Open Font License included in `brand/fonts/OFL.txt`. The moth was created with OpenAI image generation and refined from the selected concept. The brand system and mascot remain local drafts. Review status is scoped to each application; it does not imply publication or audience validation. Material implementation changes follow the standing team workflow in `AGENTS.md` and `brand/team.json`.

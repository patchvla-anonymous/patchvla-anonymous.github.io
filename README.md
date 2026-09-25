# PatchVLA anonymous project page

Project page for **PatchVLA: Process-Aware Control with Critic-Guided Latent Search**.

This preview contains method illustrations and fourteen selected successful simulation videos. The manuscript PDF and quantitative result tables will be added after finalization. This repository is not a release of model or training code.

## Preview locally

Run `npm run dev` or double-click `preview.cmd` on Windows, then open `http://127.0.0.1:4173`. Node.js is required; no package installation or build is needed. Opening `index.html` directly also works.

## Files

- `index.html`: page copy, figure captions, and media links.
- `styles.css`: desktop and mobile layout.
- `script.js`: video controls, figure enlargement, and example tabs.
- `gallery.js` and `gallery.css`: the consolidated rollout gallery and its inline synchronized signal panels.
- `rollout-data.js`: anonymous per-replanning model predictions paired with each displayed video.
- `figure1.webp` through `figure5.webp`: five web figures.
- `lehome-lt/st/lp/sp.mp4`: one successful rollout for each of the four garment categories.
- `libero-01.mp4` through `libero-10.mp4`: one successful rollout for each LIBERO-Long task, in benchmark order (one-based display labels).
- `*.jpg`: frames extracted from the corresponding videos.

Videos appear in a single section. Both galleries use two columns on desktop and one on narrow screens. Every video directly displays the current predicted phase, local progress, selected critic score, a recorded-phase timeline with a playback marker, the selected candidate's forecast, and candidate scores. No enlarged view is required. The recorded timeline uses video seconds; the separate future forecast ribbon uses candidate action offsets. All media retain the original frames, temporal order, frame rate, and playback speed; audio and source metadata were removed.

Process signals are online model predictions, not ground-truth phase annotations. Critic scores are candidate predictions, separate from the official evaluator's binary episode result. Telemetry uses a step hold at the most recent replanning time, without interpolation. LeHome-Fold aligns five control steps per inference to 30 fps; LIBERO-Long preserves its ten-frame settling prefix and aligns control step `k` to frame `k + 10` at 20 fps. The phase dictionary is Transit, Precontact, Engage, Manipulate, Disengage, Settle, Verify.

The LIBERO-Long demonstrations and its mechanism example come from the archived **16 candidates × 2 refinement rounds** controller. Preserve this provenance when updating captions.

## Hosting and anonymity

GitHub Pages uses **Deploy from a branch → main → / (root)**. The site address is `https://patchvla-anonymous.github.io/`. `.nojekyll` enables ordinary static-file delivery.

All website assets and fonts are local. There are no analytics, personal profiles, affiliations, or contact details. `robots.txt` and page metadata discourage indexing during anonymous review; they do not restrict public access.

Use an anonymous Git author for public commits. Do not add raw experiment logs, credentials, internal file paths, private notes, or unreviewed manuscript build files.

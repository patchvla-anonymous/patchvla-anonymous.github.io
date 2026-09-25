# PatchVLA anonymous project page

Project page for **PatchVLA: Process-Aware Control with Critic-Guided Latent Search**.

This preview contains method illustrations and selected successful simulation videos. The manuscript PDF and quantitative result tables will be added after finalization. This repository is not a release of model or training code.

## Preview locally

Run `npm run dev` or double-click `preview.cmd` on Windows, then open `http://127.0.0.1:4173`. Node.js is required; no package installation or build is needed. Opening `index.html` directly also works.

## Files

- `index.html`: page copy, figure captions, and media links.
- `styles.css`: desktop and mobile layout.
- `script.js`: video controls, figure enlargement, and example tabs.
- `figure1.webp` through `figure5.webp`: five web figures.
- `*.mp4`: six real H.264 MP4 rollouts, with audio and source metadata removed.
- `*.jpg`: frames extracted from the corresponding videos.

The LIBERO-Long demonstrations and its mechanism example come from the archived **16 candidates × 2 refinement rounds** controller. Preserve this provenance when updating captions.

## Hosting and anonymity

GitHub Pages uses **Deploy from a branch → main → / (root)**. The site address is `https://patchvla-anonymous.github.io/`. `.nojekyll` enables ordinary static-file delivery.

All website assets and fonts are local. There are no analytics, personal profiles, affiliations, or contact details. `robots.txt` and page metadata discourage indexing during anonymous review; they do not restrict public access.

Use an anonymous Git author for public commits. Do not add raw experiment logs, credentials, internal file paths, private notes, or unreviewed manuscript build files.

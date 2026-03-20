# 创业者48小时生存实验 | Entrepreneur 48-Hour Survival Experiment

## Project Overview

A Black Mirror-style interactive narrative/survival game simulating the high-stakes first 48 hours of a startup founder after quitting their job. Players manage 4 resources (Money, Time, Energy, Social Network) through branching story choices leading to one of 6 possible endings.

## Tech Stack

- **Type**: Pure static frontend — HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Libraries**: html2canvas (CDN), Web Audio API, Google Fonts (CDN)
- **Storage**: LocalStorage for game progress and statistics
- **No build system** — files served directly as-is

## Project Layout

```
index.html          # Main entry point
css/
  style.css         # Black Mirror / Cyberpunk theme
  animations.css    # Glitch and typewriter animations
  preview.css       # Shareable result card styles
js/
  game.js           # Core engine (init, node loading, events)
  story.js          # Narrative content and branching nodes
  resources.js      # Resource management logic
  endings.js        # Ending determination logic
  audio.js          # Sound system
  share.js          # Result card generation and sharing
assets/
  images/           # Game artwork (emotions, endings, scenes)
  sounds/           # Audio files (.wav, .mp3)
```

## Running the App

The app is served via Python's built-in HTTP server:

```
python3 -m http.server 5000 --bind 0.0.0.0
```

Workflow: **Start application** — serves on port 5000 (webview).

## Deployment

Configured as a **static** deployment with `publicDir: "."` — no build step needed.

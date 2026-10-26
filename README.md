# kulstorm

A lane-runner shooter built with three.js, served from `docs/` by GitHub Pages. There is no build step.

## Run locally

```
python3 -m http.server 8000 -d docs
```

Then open http://localhost:8000 (in a Codespace, use the forwarded port).

## Release

```
./bump-version.sh          # or ./bump-version.sh 1.2.0
```

This stamps the version into `docs/js/version.js`, the `?v=` query strings in `docs/index.html`, and `docs/version.json`. Open browsers notice the new `version.json` and reload into the new version once the player is back in the menu, fetching every file fresh.

## Layout

```
docs/
  index.html        markup only
  css/style.css
  js/version.js     version number and update check
  js/main.js        loads the files below, in order
  js/data/          pure data: weapons, upgrades, heroes, enemy stats, zones, weather, options
  js/core/          helpers, DOM lookups, saved settings
  js/render/        three.js: renderer, materials, sky, world, particles, projectiles
  js/audio/         WebAudio sound effects and generated music
  js/game/          game rules and entities
  js/ui/            HUD, input, menus, pause
```

The files are plain scripts that share one global scope, loaded in the order listed in `js/main.js`. A file can use anything from earlier files when it loads, and anything at all inside functions. To add a file, put it in that list.

### Porting to another engine

- `js/data/` has no dependency on three.js, the DOM or game state, so it can be carried over as-is (or turned into JSON).
- `js/render/`, `js/audio/` and `js/ui/` are the engine and platform layers that a port replaces.
- `js/game/` holds the rules, but entities keep their position in their three.js objects (`e.g.position`), so this layer has to be rewritten against the new engine's scene objects. It is the best reference for how the game behaves.

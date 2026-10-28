# kulstorm

An experimental lane-runner shooter built with three.js. For now, it is served from `docs/` by GitHub Pages. There is no build step.

## Run locally

```
node dev.js          # or node dev.js 3000
```

Then open http://localhost:8000 (in a Codespace, use the forwarded port). The page reloads whenever a file under `docs/` changes, and nothing is cached. Without Node, `python3 -m http.server 8000 -d docs` serves the same files without the reload.

### Local devcontainer

Run the development environment on your own computer with Docker and VS Code. The container runs locally, so Codespaces idle timeouts and usage limits do not apply.

1. Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine on Linux), then install [VS Code](https://code.visualstudio.com/) and its [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
2. Clone the repository onto your computer and open it in VS Code:

   ```sh
   git clone https://github.com/nevva/kulstorm.git
   cd kulstorm
   code .
   ```

3. Run **Dev Containers: Reopen in Container** from the command palette. Docker builds on the [Node 24 development image](https://github.com/devcontainers/images/tree/main/src/javascript-node) the first time and installs Codex CLI, Claude Code, and GitHub CLI (`gh`). Node and Git are included; the game needs no dependency installation.
4. Open a terminal inside VS Code and run:

   ```sh
   node dev.js
   ```

VS Code forwards port 8000 and opens the game in your browser. If it does not open automatically, use http://localhost:8000 or the address in VS Code's **Ports** tab. Your edits stay in your local checkout, and changes under `docs/` reload the game automatically.

Press **Ctrl+C** in the terminal to stop the server. Run `node dev.js` again after reopening the container. If you change `.devcontainer/devcontainer.json`, run **Dev Containers: Rebuild Container** to apply it. See the [VS Code devcontainer guide](https://code.visualstudio.com/docs/devcontainers/create-dev-container) for more details.

### Coding assistants and GitHub login

The container includes the `codex`, `claude`, and `gh` commands, plus the Codex and Claude Code VS Code extensions. If you already have the older container, run **Dev Containers: Rebuild Container** first.

Run these sign-in commands one at a time from a terminal inside the container:

```sh
codex login --device-auth
claude auth login
gh auth login --hostname github.com --git-protocol https --web --insecure-storage
```

Follow each command's browser instructions. Codex device login must be enabled in your ChatGPT account or workspace settings. If unavailable, run `codex login` instead; port 1455 is forwarded for its browser callback. For Claude, copy the displayed login URL into your browser and paste the resulting code into the terminal if the browser cannot return to the container. The GitHub login uses file storage so it survives rebuilding; Git is already configured to use `gh` for HTTPS credentials on github.com.

Three Docker named volumes keep the login state and settings outside the repository:

| Tool | Persistent directory | Volume name |
| --- | --- | --- |
| Codex | `/home/node/.codex` | `kulstorm-codex-<devcontainerId>` |
| Claude Code | `/home/node/.claude` | `kulstorm-claude-<devcontainerId>` |
| GitHub CLI | `/home/node/.config/gh` | `kulstorm-gh-<devcontainerId>` |

Codex uses file-based credential storage. `CLAUDE_CONFIG_DIR` keeps Claude's separate `.claude.json` state inside its volume too. Rebuilds reuse these volumes for the same local checkout. Deleting the volumes or moving to a different checkout/computer requires signing in again; expired or revoked sessions may also need a new login. The volumes contain credentials, including plain text tokens, so keep them private. Existing host logins are not copied into them automatically.

See the official [Codex authentication](https://developers.openai.com/codex/auth), [Claude devcontainer persistence](https://code.claude.com/docs/en/devcontainer#persist-authentication-and-settings-across-rebuilds), and [GitHub CLI login](https://cli.github.com/manual/gh_auth_login) documentation.

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
  js/data/          pure data: weapons, upgrades, combos, heroes, enemy stats, zones, weather, options, music genres, tutorial texts, Swedish texts (sv.js)
  js/core/          language (i18n.js), helpers, DOM lookups, saved settings
  js/render/        three.js: renderer, materials, sky, world, particles, projectiles
  js/audio/         WebAudio sound effects and generated music
  js/game/          game rules and entities
  js/ui/            HUD, input, menus, pause
```

The game is written in English. Swedish can be picked on the start menu: `js/data/sv.js` maps each English text to its Swedish one, and code builds visible strings with `tl('Shield {0}',n)` so they translate. Add a new text to `sv.js` when you add it to the game.

The files are plain scripts that share one global scope, loaded in the order listed in `js/main.js`. A file can use anything from earlier files when it loads, and anything at all inside functions. To add a file, put it in that list.

### Porting to another engine

- `js/data/` has no dependency on three.js, the DOM or game state, so it can be carried over as-is (or turned into JSON).
- `js/render/`, `js/audio/` and `js/ui/` are the engine and platform layers that a port replaces.
- `js/game/` holds the rules, but entities keep their position in their three.js objects (`e.g.position`), so this layer has to be rewritten against the new engine's scene objects. It is the best reference for how the game behaves.

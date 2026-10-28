'use strict';
// Loads the game. Every file is a classic script sharing one global scope, so ORDER MATTERS:
// a file may use anything defined in the files before it at load time, and anything at all inside functions.
//   data/   pure data tables, portable to any engine
//   core/   language, small helpers, DOM lookups, saved settings
//   render/ three.js: renderer, materials, sky, world, particles, projectiles
//   audio/  WebAudio sound effects and generated music
//   game/   game rules and entities (still drawn with three.js objects)
//   ui/     HUD, input, menus, pause
// Each file is loaded with ?v=VERSION so a new release bypasses browser and CDN caches.
const FILES=[
  'data/options.js',
  'data/world.js',
  'data/units.js',
  'data/enemies.js',
  'data/economy.js',
  'data/music.js',
  'data/tutorial.js',
  'data/sv.js',
  'core/i18n.js',
  'core/helpers.js',
  'core/options.js',
  'render/materials.js',
  'render/renderer.js',
  'render/daynight.js',
  'render/sky.js',
  'render/world.js',
  'render/particles.js',
  'render/projectiles.js',
  'audio/sfx.js',
  'audio/music.js',
  'game/units.js',
  'game/state.js',
  'game/stats.js',
  'game/squad.js',
  'game/enemies.js',
  'game/bosses.js',
  'game/pickups.js',
  'game/walls.js',
  'game/weather.js',
  'game/obstacles.js',
  'game/unicorns.js',
  'game/chests.js',
  'game/xpshop.js',
  'game/spawning.js',
  'game/player.js',
  'ui/hud.js',
  'ui/input.js',
  'ui/tutorial.js',
  'ui/menus.js',
  'ui/pause.js',
  'game/run.js',
];
if(!window.THREE){
  let sv=false; try{ sv=JSON.parse(localStorage.getItem('kulstorm_lang'))==='sv'; }catch(e){}
  document.getElementById('menu-msg').textContent=sv?'3D-motorn kunde inte laddas. Kontrollera nätet och ladda om sidan.':'The 3D engine could not load. Check your connection and reload the page.';
  document.getElementById('play').disabled=true;
} else {
  for(const f of FILES){
    const s=document.createElement('script');
    s.src='js/'+f+'?v='+encodeURIComponent(VERSION); s.async=false;
    document.body.appendChild(s);
  }
}

'use strict';
// Settings shown in the options menu: [id, name, description]. All default to on.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const OPT_DEFS=[
  ['snake','Snake formation','The squad follows the leader in a smooth chain'],
  ['dyncam','Dynamic camera','The camera zooms out as more join'],
  ['front','Automatic front-runner','The toughest squad member (HP + shield) goes first, checked every second'],
  ['numbers','Damage numbers','Floating numbers on every hit'],
  ['hitcolors','Color-coded hits','Particle color and size follow the damage'],
  ['combos','Combos','Pairs of upgrades give extra effects'],
  ['coins','Coins and hero shop','Enemies drop coins that buy starting heroes'],
  ['team','Team perks','Walls can give perks for the whole squad'],
  ['variance','Varied damage','Each shot deals up to ±25% different damage'],
  ['shake','Screen shake','The camera shakes on big hits'],
  ['gyro','Tilt parallax','Tilting your phone shifts the camera a little for a 3D effect'],
  ['hearts','Heart drops','Enemies drop hearts that heal'],
  ['planet','Tiny planet','The world curves toward the horizon'],
  ['weather','Weather','Rain, fog, storm, snow, thunder and heat that affect play'],
  ['obstacles','Obstacles','Jump over and duck under obstacles (swipe up/down, W/S, Space). Down in the air = ground pound'],
  ['dbljump','Double jump','Jump again in the air; tall spike barricades need it'],
  ['overdrive','Overdrive','Charge a meter and unleash 6 s of super mode (E, middle click or the button). Saves you once at 10% health'],
  ['mouse','Mouse control','A click captures the pointer: movement steers, left click jumps, right click ducks'],
  ['daynight','Day and night','The sun crosses the sky; night brings the moon, stars, lamps and night enemies'],
  ['tutorial','Tutorial','Pauses the game and explains each ability the first time it is needed'],
  ['music','Music','Lofi in its own genre per zone (jazz, bossa nova, hip hop, techno, ambient, trap), shaped by the enemies you blow up'],
  ['heroprog','Hero progression','The leader gathers XP between runs and earns talent points'],
  ['unicorns','Unicorns','Helpers that shoot rainbow roads that halve the damage the squad takes'],
  ['xpshop','XP and roadside shops','Enemies drop XP that levels up the squad as you go, and roadside shops sell items for the run\'s coins'],
];

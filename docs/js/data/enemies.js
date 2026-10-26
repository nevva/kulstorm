'use strict';
// Enemy stats: hp, speed, radius r, contact dmg, unlock distance (m), spawn weight w. Looks are built in js/game/enemies.js.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const SMALL_E=new Set(['crawler','swarm','bats','mole']);
const ENEMY_NAMES={blob:'Blob',runner:'Löpare',swarm:'Svärm',shooter:'Skytt',bomber:'Bombare',tank:'Tank',wolf:'Varg',bats:'Fladdermöss',ghost:'Spöke',shambler:'Zombie',crawler:'Krypande zombie',bloater:'Pösig zombie',knight:'Sköldriddare',splitter:'Delare',mole:'Mullvad',necro:'Nekromantiker',charger:'Noshörning'};
const ENEMY={
  shambler:{hp:22,speed:1.3,r:0.5,dmg:10,unlock:120,w:4,group:[3,5],loose:true,zombie:true},
  crawler:{hp:12,speed:1.0,r:0.45,dmg:6,unlock:120,w:0,zombie:true},
  bloater:{hp:45,speed:0.9,r:0.8,dmg:14,unlock:350,w:3,zombie:true},
  knight:{hp:40,speed:1.2,r:0.6,dmg:14,unlock:500,w:3},
  splitter:{hp:30,speed:1.6,r:0.7,dmg:10,unlock:250,w:4},
  mole:{hp:28,speed:2.4,r:0.55,dmg:12,unlock:700,w:3},
  necro:{hp:50,speed:1.0,r:0.6,dmg:12,unlock:1100,w:2,zombie:true},
  charger:{hp:60,speed:0.9,r:0.8,dmg:30,unlock:800,w:2},
  blob:{hp:20,speed:1.6,r:0.6,dmg:10,unlock:0,w:10},
  wolf:{hp:16,speed:5.4,r:0.5,dmg:9,unlock:60,w:6,night:true},
  bats:{hp:4,speed:4,r:0.3,dmg:3,unlock:120,w:5,group:[6,9],night:true},
  ghost:{hp:26,speed:2.4,r:0.55,dmg:11,unlock:250,w:4,night:true},
  runner:{hp:14,speed:4.6,r:0.45,dmg:8,unlock:80,w:6},
  swarm:{hp:5,speed:3.6,r:0.32,dmg:4,unlock:180,w:5,group:[5,8]},
  shooter:{hp:30,speed:1.4,r:0.6,dmg:12,unlock:320,w:4},
  bomber:{hp:18,speed:3.3,r:0.55,dmg:30,unlock:450,w:3},
  tank:{hp:120,speed:0.9,r:1.1,dmg:30,unlock:600,w:3},
  boss:{hp:300,speed:0,r:2.1,dmg:0,unlock:1e9,w:0},
};

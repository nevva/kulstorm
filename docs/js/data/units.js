'use strict';
// Weapons, squad members and team perks (UPGRADES), combos, starting heroes and hero talents.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const WEAPONS={
  pistol:{id:'pistol',name:'Pistol',rate:4,dmg:10,bullets:1,spread:0,jitter:0.015,speed:32,size:1,color:0xfff176,pitch:900},
  smg:{id:'smg',name:'SMG',rate:9,dmg:6,bullets:1,spread:0,jitter:0.07,speed:36,size:0.8,color:0x80deea,pitch:1200},
  shotgun:{id:'shotgun',name:'Shotgun',rate:1.7,dmg:9,bullets:5,spread:0.42,jitter:0.03,speed:30,size:0.9,color:0xffab40},
  minigun:{id:'minigun',name:'Minigun',rate:15,dmg:4.5,bullets:1,spread:0,jitter:0.13,speed:38,size:0.7,color:0xff8a65,pitch:700},
  rocket:{id:'rocket',name:'Rocket Launcher',rate:1.1,dmg:40,bullets:1,spread:0.25,jitter:0.02,speed:20,size:1.7,color:0xff5252,rocket:true,aoe:2.8},
  laser:{id:'laser',name:'Laser',laser:true,dps:28,color:0x18ffff},
  shuriken:{id:'shuriken',name:'Shuriken',rate:2.4,dmg:13,bullets:3,spread:0.3,jitter:0.03,speed:24,size:1.1,color:0xcfd8dc,shuriken:true},
};
// kind 'gubbe': a wall adds this squad member; kind 'team': a wall grants the whole squad a permanent perk.
const UPGRADES=[
  {id:'smg',kind:'gubbe',weapon:'smg',rarity:'common',name:'SMG Gunner',short:'SMG',desc:'Fires fast with light bullets',shirt:0x80deea},
  {id:'shotgun',kind:'gubbe',weapon:'shotgun',rarity:'rare',name:'Shotgunner',short:'Scatter',desc:'Five bullets in a wide fan',shirt:0xffab40},
  {id:'minigun',kind:'gubbe',weapon:'minigun',rarity:'rare',name:'Minigunner',short:'Minigun',desc:'A hail of bullets that never ends',shirt:0xff8a65},
  {id:'rocket',kind:'gubbe',weapon:'rocket',rarity:'epic',name:'Rocketeer',short:'Rocket',desc:'Explosions that hurt everything nearby',shirt:0xff5252},
  {id:'laser',kind:'gubbe',weapon:'laser',rarity:'epic',name:'Laser Gunner',short:'Laser',desc:'A beam that burns through the whole line',shirt:0x18ffff},
  {id:'firerate',kind:'gubbe',rarity:'common',name:'Sergeant',short:'Sergeant',desc:'+20% fire rate for everyone while he lives',shirt:0xffd21f},
  {id:'damage',kind:'gubbe',rarity:'common',name:'Ammo Expert',short:'Ammo',desc:'+25% damage for everyone while he lives',shirt:0xff5c7a},
  {id:'multishot',kind:'gubbe',rarity:'rare',name:'Double Shot',short:'Double',desc:'+1 bullet per shot for everyone',shirt:0xb07cff},
  {id:'pierce',kind:'gubbe',rarity:'rare',name:'Armor Breaker',short:'Pierce',desc:'Everyone\'s bullets pass through one more enemy',shirt:0x8d6e63},
  {id:'crit',kind:'gubbe',rarity:'rare',name:'Sharpshooter',short:'Crit',desc:'+15% chance of double damage for everyone',shirt:0xffe600},
  {id:'speed',kind:'gubbe',rarity:'common',name:'Runner',short:'Runner',desc:'The squad moves 25% faster sideways',shirt:0x36e2b4},
  {id:'magnet',kind:'gubbe',rarity:'common',name:'Magnet Man',short:'Magnet',desc:'Hearts and coins are pulled to the squad',shirt:0x9e9e9e,unique:true},
  {id:'bounce',kind:'gubbe',rarity:'epic',name:'Bouncer',short:'Bounce',desc:'Everyone\'s bullets bounce off the road edges',shirt:0x8cff3a,unique:true},
  {id:'shield',kind:'gubbe',rarity:'rare',name:'Shield Bearer',short:'Shield',desc:'Blocks the next three hits on the squad',shirt:0x49c3ff},
  {id:'medic',kind:'gubbe',rarity:'common',name:'Field Medic',short:'Medic',desc:'Heals everyone 30 now and 1 HP/s while he lives',shirt:0xffffff},
  {id:'tank',kind:'gubbe',rarity:'rare',name:'The Tank',short:'Tank',desc:'200 HP and takes the front',shirt:0x546e7a,hp:200},
  {id:'recruit',kind:'gubbe',rarity:'common',name:'Recruit',short:'Recruit',desc:'A plain extra squad member with a pistol, 80 HP',shirt:0x7cb342,hp:80},
  {id:'bigbullets',kind:'gubbe',rarity:'common',name:'Cannoneer',short:'Cannon',desc:'+30% bigger bullets for everyone',shirt:0xef5350},
  {id:'veteran',kind:'gubbe',rarity:'epic',name:'The Veteran',short:'Veteran',desc:'His damage grows with the damage he deals: +100% per 1500 damage',shirt:0xff7a00},
  {id:'ninja',kind:'gubbe',weapon:'shuriken',rarity:'epic',name:'The Ninja',short:'Ninja',desc:'Throws shuriken that pass through enemies. Takes no damage when he headbutts walls',shirt:0x1c1c24,unique:true},
  {id:'glass',kind:'gubbe',rarity:'rare',name:'Glass Cannon',short:'Glass',desc:'Damage ×2.5 at full health, dropping the more hurt he is',shirt:0xe040fb},
  {id:'banker',kind:'gubbe',weapon:'smg',rarity:'rare',name:'The Banker',short:'Banker',desc:'Damage rises 1% per coin you carry this run, up to ×4',shirt:0xffc83d,unique:true},
  {id:'eagle',kind:'team',rarity:'epic',name:'Eagle Eye',short:'Eagle Eye',desc:'You see much further: enemies appear and can be shot far earlier',unique:true},
  {id:'ricochet',kind:'team',rarity:'epic',name:'Ricochet',short:'Ricochet',desc:'Bullets that hit split into two new bullets',unique:true},
  {id:'gutter',kind:'team',rarity:'rare',name:'Gutter Blocker',short:'Gutter',desc:'Shots that reach the road edge turn and keep going straight ahead instead of vanishing',unique:true},
  {id:'shock',kind:'team',rarity:'rare',name:'Shockwave',short:'Shockwave',desc:'+60% knockback on all hits and a chance of a shock ring. Can be taken 3 times',max:3},
  {id:'steel',kind:'team',rarity:'common',name:'Steel Rounds',short:'Steel',desc:'+15% damage for the whole squad, for good'},
  {id:'fastload',kind:'team',rarity:'common',name:'Speed Loader',short:'Loader',desc:'+15% fire rate for the whole squad, for good'},
  {id:'armor',kind:'team',rarity:'rare',name:'Heavy Armor',short:'Armor+',desc:'+30 max HP for every squad member, now and later'},
  {id:'unicorn',kind:'pet',rarity:'epic',name:'Unicorn',short:'Unicorn',desc:'Shoots rainbow roads. Stand on them to take half damage'},
  {id:'hospital',kind:'team',rarity:'rare',name:'Field Hospital',short:'Hospital',desc:'Hearts heal twice as much',unique:true},
];
const RARITY={common:'Common',rare:'Rare',epic:'Epic'};
const MAX_SQUAD=9;
// Combos: when both parts are in the squad (or among the team perks), the effect is on. Lose a part and it is gone.
const COMBOS=[
  {id:'burn',name:'Burn Beam',a:'laser',b:'crit',desc:'The laser sets enemies on fire'},
  {id:'rain',name:'Rocket Rain',a:'rocket',b:'multishot',desc:'Every explosion is followed by three small bombs'},
  {id:'chain',name:'Chain Lightning',a:'crit',b:'pierce',desc:'Critical hits jump like lightning to the nearest enemy'},
  {id:'knock',name:'Cannonball',a:'bigbullets',b:'damage',desc:'Hits knock enemies back'},
  {id:'spike',name:'Spike Wall',a:'shotgun',b:'pierce',desc:'The pellets go through everything'},
  {id:'frost',name:'Frost Rounds',a:'smg',b:'speed',desc:'SMG hits slow enemies down'},
  {id:'recharge',name:'Recharge',a:'shield',b:'medic',desc:'Shields regain one charge every 12 seconds'},
  {id:'homing',name:'Homing',a:'steel',b:'magnet',desc:'Bullets curve toward the nearest enemy ahead of them'},
  {id:'napalm',name:'Napalm',a:'rocket',b:'fastload',desc:'Explosions set enemies on fire'},
  {id:'goldrush',name:'Gold Rush',a:'banker',b:'magnet',desc:'Enemies drop twice as many coins'},
  {id:'fortress',name:'Fortress',a:'tank',b:'armor',desc:'The Tank takes only half damage'},
  {id:'crystal',name:'Crystal Cannon',a:'glass',b:'crit',desc:'The Glass Cannon\'s critical hits deal triple damage instead of double'},
  {id:'pinball',name:'Pinball',a:'bounce',b:'gutter',desc:'Every bounce off the road edge gives the bullet +30% damage'},
  {id:'leadrain',name:'Lead Rain',a:'minigun',b:'fastload',desc:'The minigun\'s bullets pass through one more enemy'},
  {id:'fieldhosp',name:'Field Infirmary',a:'medic',b:'hospital',desc:'The Field Medic heals 3 HP/s instead of 1'},
  {id:'hawk',name:'Hawk Eye',a:'eagle',b:'crit',desc:'+10% critical hit chance for everyone'},
];
const HEROES=[
  {id:'rookie',name:'Rookie',price:0,desc:'100 HP and a pistol. The standard hero.',shirt:0xff5c7a,hp:100,weapon:'pistol'},
  {id:'wall',name:'The Juggernaut',price:150,desc:'170 HP, but 15% slower sideways.',shirt:0x546e7a,hp:170,weapon:'pistol',speed:0.85},
  {id:'gunner',name:'The Gunner',price:250,desc:'90 HP, starts with an SMG and +15% fire rate.',shirt:0x80deea,hp:90,weapon:'smg',T:{rate:1.15}},
  {id:'twin',name:'The Twin',price:350,desc:'Starts with a Recruit (80 HP) in the squad.',shirt:0x7cb342,hp:100,weapon:'pistol',extras:['recruit']},
  {id:'mogul',name:'The Mogul',price:500,desc:'+50% coins and a Magnet Man from the start.',shirt:0xffd21f,hp:100,weapon:'pistol',coinMult:1.5,extras:['magnet']},
  {id:'legend',name:'The Legend',price:1200,desc:'Shotgun, 3 shield charges and +20% damage from the start.',shirt:0xb07cff,hp:110,weapon:'shotgun',shield:3,T:{dmg:1.2}},
];
// Hero progression: XP earned across runs gives levels; each level is one talent point.
const TALENTS=[
  {id:'tough',name:'Tough',desc:'+8 max HP for you per point',max:10},
  {id:'sharp',name:'Sharp',desc:'+4% damage for the whole squad per point',max:10},
  {id:'fast',name:'Quick',desc:'+3% fire rate for the whole squad per point',max:10},
  {id:'rich',name:'Rich',desc:'+5% coins per point',max:10},
  {id:'reinf',name:'Reinforcements',desc:'3 points: one random extra squad member from the start. 6 points: two',max:6},
  {id:'path',name:'Pathfinder',desc:'The first wall comes 30 m earlier per point',max:3},
];

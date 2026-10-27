'use strict';
// Weapons, squad members and team perks (UPGRADES), combos, starting heroes and hero talents.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const WEAPONS={
  pistol:{id:'pistol',name:'Pistol',rate:4,dmg:10,bullets:1,spread:0,jitter:0.015,speed:32,size:1,color:0xfff176,pitch:900},
  smg:{id:'smg',name:'K-pist',rate:9,dmg:6,bullets:1,spread:0,jitter:0.07,speed:36,size:0.8,color:0x80deea,pitch:1200},
  shotgun:{id:'shotgun',name:'Hagelgevär',rate:1.7,dmg:9,bullets:5,spread:0.42,jitter:0.03,speed:30,size:0.9,color:0xffab40},
  minigun:{id:'minigun',name:'Minigun',rate:15,dmg:4.5,bullets:1,spread:0,jitter:0.13,speed:38,size:0.7,color:0xff8a65,pitch:700},
  rocket:{id:'rocket',name:'Raketgevär',rate:1.1,dmg:40,bullets:1,spread:0.25,jitter:0.02,speed:20,size:1.7,color:0xff5252,rocket:true,aoe:2.8},
  laser:{id:'laser',name:'Laser',laser:true,dps:28,color:0x18ffff},
  shuriken:{id:'shuriken',name:'Shuriken',rate:2.4,dmg:13,bullets:3,spread:0.3,jitter:0.03,speed:24,size:1.1,color:0xcfd8dc,shuriken:true},
};
// kind 'gubbe': a wall adds this squad member; kind 'team': a wall grants the whole squad a permanent perk.
const UPGRADES=[
  {id:'smg',kind:'gubbe',weapon:'smg',rarity:'common',name:'K-pistgubbe',short:'K-pist',desc:'Skjuter snabbt med lätta kulor',shirt:0x80deea},
  {id:'shotgun',kind:'gubbe',weapon:'shotgun',rarity:'rare',name:'Hagelgubbe',short:'Hagel',desc:'Fem kulor i en bred solfjäder',shirt:0xffab40},
  {id:'minigun',kind:'gubbe',weapon:'minigun',rarity:'rare',name:'Minigunnare',short:'Minigun',desc:'Ett hagel av kulor som aldrig tar slut',shirt:0xff8a65},
  {id:'rocket',kind:'gubbe',weapon:'rocket',rarity:'epic',name:'Raketgubbe',short:'Raket',desc:'Explosioner som skadar allt i närheten',shirt:0xff5252},
  {id:'laser',kind:'gubbe',weapon:'laser',rarity:'epic',name:'Lasergubbe',short:'Laser',desc:'En stråle som bränner igenom hela ledet',shirt:0x18ffff},
  {id:'firerate',kind:'gubbe',rarity:'common',name:'Sergeant',short:'Sergeant',desc:'+20 % eldhastighet för alla så länge han lever',shirt:0xffd21f},
  {id:'damage',kind:'gubbe',rarity:'common',name:'Ammo-expert',short:'Ammo',desc:'+25 % skada för alla så länge han lever',shirt:0xff5c7a},
  {id:'multishot',kind:'gubbe',rarity:'rare',name:'Dubbelskytt',short:'Dubbel',desc:'+1 kula per skott för alla',shirt:0xb07cff},
  {id:'pierce',kind:'gubbe',rarity:'rare',name:'Pansarbrytare',short:'Pansar',desc:'Allas kulor går igenom en fiende till',shirt:0x8d6e63},
  {id:'crit',kind:'gubbe',rarity:'rare',name:'Prickskytt',short:'Krit',desc:'+15 % chans till dubbel skada för alla',shirt:0xffe600},
  {id:'speed',kind:'gubbe',rarity:'common',name:'Löpare',short:'Löpare',desc:'Truppen rör sig 25 % snabbare i sidled',shirt:0x36e2b4},
  {id:'magnet',kind:'gubbe',rarity:'common',name:'Magnetgubbe',short:'Magnet',desc:'Hjärtan och mynt dras till truppen',shirt:0x9e9e9e,unique:true},
  {id:'bounce',kind:'gubbe',rarity:'epic',name:'Studsgubbe',short:'Studs',desc:'Allas kulor studsar mot vägkanterna',shirt:0x8cff3a,unique:true},
  {id:'shield',kind:'gubbe',rarity:'rare',name:'Sköldbärare',short:'Sköld',desc:'Blockerar de tre nästa träffarna på truppen',shirt:0x49c3ff},
  {id:'medic',kind:'gubbe',rarity:'common',name:'Sjukvårdare',short:'Medic',desc:'Läker alla 30 nu och 1 HP/s så länge han lever',shirt:0xffffff},
  {id:'tank',kind:'gubbe',rarity:'rare',name:'Tanken',short:'Tank',desc:'200 HP och ställer sig längst fram',shirt:0x546e7a,hp:200},
  {id:'recruit',kind:'gubbe',rarity:'common',name:'Rekryt',short:'Rekryt',desc:'En vanlig extra gubbe med pistol, 80 HP',shirt:0x7cb342,hp:80},
  {id:'bigbullets',kind:'gubbe',rarity:'common',name:'Kanonjär',short:'Kanon',desc:'+30 % större kulor för alla',shirt:0xef5350},
  {id:'veteran',kind:'gubbe',rarity:'epic',name:'Veteranen',short:'Veteran',desc:'Hans skada växer med skadan han delar ut: +100 % per 1500 skada',shirt:0xff7a00},
  {id:'ninja',kind:'gubbe',weapon:'shuriken',rarity:'epic',name:'Ninjan',short:'Ninja',desc:'Kastar shuriken som går igenom fiender. Tar ingen skada när han skallar väggar',shirt:0x1c1c24,unique:true},
  {id:'glass',kind:'gubbe',rarity:'rare',name:'Glaskanon',short:'Glas',desc:'Skada ×2,5 vid full hälsa, sjunker ju mer skadad han är',shirt:0xe040fb},
  {id:'banker',kind:'gubbe',weapon:'smg',rarity:'rare',name:'Bankiren',short:'Bankir',desc:'Skadan ökar 1 % per mynt du bär på i rundan, upp till ×4',shirt:0xffc83d,unique:true},
  {id:'eagle',kind:'team',rarity:'epic',name:'Eagle Eye',short:'Eagle Eye',desc:'Ni ser mycket längre: fienderna dyker upp och kan skjutas långt tidigare',unique:true},
  {id:'ricochet',kind:'team',rarity:'epic',name:'Rikoschett',short:'Rikoschett',desc:'Kulor som träffar delar sig i två nya kulor',unique:true},
  {id:'gutter',kind:'team',rarity:'rare',name:'Gutter Blocker',short:'Gutter',desc:'Skott som når vägkanten viker av och fortsätter rakt fram i stället för att försvinna',unique:true},
  {id:'shock',kind:'team',rarity:'rare',name:'Tryckvåg',short:'Tryckvåg',desc:'+60 % knuff på alla träffar och chans till en chockring. Kan tas 3 gånger',max:3},
  {id:'steel',kind:'team',rarity:'common',name:'Stålkulor',short:'Stål',desc:'+15 % skada för hela truppen, för alltid'},
  {id:'fastload',kind:'team',rarity:'common',name:'Snabbladdare',short:'Laddare',desc:'+15 % eldhastighet för hela truppen, för alltid'},
  {id:'armor',kind:'team',rarity:'rare',name:'Hårt pansar',short:'Pansar+',desc:'+30 max-HP till alla gubbar, nu och framöver'},
  {id:'unicorn',kind:'pet',rarity:'epic',name:'Enhörning',short:'Enhörning',desc:'Skjuter regnbågsvägar. Stå på dem så är du skyddad'},
  {id:'hospital',kind:'team',rarity:'rare',name:'Fältsjukhus',short:'Sjukhus',desc:'Hjärtan läker dubbelt så mycket',unique:true},
];
const RARITY={common:'Vanlig',rare:'Sällsynt',epic:'Episk'};
const MAX_SQUAD=9;
// Combos: when both parts are in the squad (or among the team perks), the effect is on. Lose a part and it is gone.
const COMBOS=[
  {id:'burn',name:'Brännstråle',a:'laser',b:'crit',desc:'Lasern sätter fienderna i brand'},
  {id:'rain',name:'Raketregn',a:'rocket',b:'multishot',desc:'Varje explosion följs av tre småbomber'},
  {id:'chain',name:'Kedjeblixt',a:'crit',b:'pierce',desc:'Kritiska träffar hoppar som en blixt till närmaste fiende'},
  {id:'knock',name:'Kanonkula',a:'bigbullets',b:'damage',desc:'Träffar knuffar fienderna bakåt'},
  {id:'spike',name:'Spikvägg',a:'shotgun',b:'pierce',desc:'Haglet går igenom allt'},
  {id:'frost',name:'Frostkulor',a:'smg',b:'speed',desc:'K-pistens träffar saktar ner fienderna'},
  {id:'recharge',name:'Återladdning',a:'shield',b:'medic',desc:'Sköldarna laddar om en laddning var 12:e sekund'},
  {id:'homing',name:'Målsökare',a:'steel',b:'magnet',desc:'Kulorna svänger mot närmaste fiende framför dem'},
  {id:'napalm',name:'Napalm',a:'rocket',b:'fastload',desc:'Explosionerna sätter fienderna i brand'},
  {id:'goldrush',name:'Guldregn',a:'banker',b:'magnet',desc:'Fienderna släpper dubbelt så många mynt'},
  {id:'fortress',name:'Bergvägg',a:'tank',b:'armor',desc:'Tanken tar bara halva skadan'},
  {id:'crystal',name:'Kristallkanon',a:'glass',b:'crit',desc:'Glaskanonens kritiska träffar gör tredubbel skada i stället för dubbel'},
  {id:'pinball',name:'Flipper',a:'bounce',b:'gutter',desc:'Varje studs mot vägkanten ger kulan +30 % skada'},
  {id:'leadrain',name:'Blyregn',a:'minigun',b:'fastload',desc:'Minigunnens kulor går igenom en fiende till'},
  {id:'fieldhosp',name:'Fältlasarett',a:'medic',b:'hospital',desc:'Sjukvårdaren läker 3 HP/s i stället för 1'},
  {id:'hawk',name:'Örnöga',a:'eagle',b:'crit',desc:'+10 % chans till kritisk träff för alla'},
];
const HEROES=[
  {id:'rookie',name:'Rookie',price:0,desc:'100 HP och en pistol. Standardgubben.',shirt:0xff5c7a,hp:100,weapon:'pistol'},
  {id:'wall',name:'Pansarvagnen',price:150,desc:'170 HP, men 15 % långsammare i sidled.',shirt:0x546e7a,hp:170,weapon:'pistol',speed:0.85},
  {id:'gunner',name:'Skytten',price:250,desc:'90 HP, startar med K-pist och +15 % eldhastighet.',shirt:0x80deea,hp:90,weapon:'smg',T:{rate:1.15}},
  {id:'twin',name:'Tvillingen',price:350,desc:'Startar med en Rekryt (80 HP) i truppen.',shirt:0x7cb342,hp:100,weapon:'pistol',extras:['recruit']},
  {id:'mogul',name:'Magnaten',price:500,desc:'+50 % mynt och en Magnetgubbe från start.',shirt:0xffd21f,hp:100,weapon:'pistol',coinMult:1.5,extras:['magnet']},
  {id:'legend',name:'Legenden',price:1200,desc:'Hagelgevär, 3 sköldladdningar och +20 % skada från start.',shirt:0xb07cff,hp:110,weapon:'shotgun',shield:3,T:{dmg:1.2}},
];
// Hero progression: XP earned across runs gives levels; each level is one talent point.
const TALENTS=[
  {id:'tough',name:'Tålig',desc:'+8 max-HP för dig per poäng',max:10},
  {id:'sharp',name:'Skarp',desc:'+4 % skada för hela truppen per poäng',max:10},
  {id:'fast',name:'Snabb',desc:'+3 % eldhastighet för hela truppen per poäng',max:10},
  {id:'rich',name:'Rik',desc:'+5 % mynt per poäng',max:10},
  {id:'reinf',name:'Förstärkning',desc:'3 poäng: en slumpad extra gubbe från start. 6 poäng: två',max:6},
  {id:'path',name:'Vägvisare',desc:'Första väggen kommer 30 m tidigare per poäng',max:3},
];

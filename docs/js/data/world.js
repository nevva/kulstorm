'use strict';
// Zones (colours and prop theme) and weather types. Colours are 0xRRGGBB.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const ZONES=[
  {name:'Staden',sky:0x8ecbff,fog:0xbfe3ff,ground:0x6b7a8a,road:0x3d4556,road2:0x444d5e,stripe:0xffd21f,curb:0x9aa5b1,props:'city'},
  {name:'Djungeln',sky:0x9fe3b5,fog:0xb4ecc2,ground:0x4caf50,road:0x6d4c2f,road2:0x76532f,stripe:0xd7ccc8,curb:0x2e7d32,props:'jungle'},
  {name:'Öknen',sky:0xffd98a,fog:0xffe3b0,ground:0xe8bb63,road:0xd1a052,road2:0xd8a858,stripe:0xfff3d0,curb:0xc48f44,props:'desert'},
  {name:'Neonstaden',sky:0x1a1140,fog:0x2b1a5e,ground:0x1a1340,road:0x241c4c,road2:0x2a2154,stripe:0xff2fd0,curb:0x19e6ff,props:'neon',dark:true},
  {name:'Isvidderna',sky:0xcdeeff,fog:0xe4f6ff,ground:0xeaf7ff,road:0xb0dff2,road2:0xbbe5f5,stripe:0xffffff,curb:0x8fd3ff,props:'ice'},
  {name:'Lavafälten',sky:0x3a1818,fog:0x4b2424,ground:0x2a2222,road:0x3a3030,road2:0x423636,stripe:0xff7a00,curb:0x5a3b3b,props:'lava',dark:true},
];

const WEATHER={
  clear:{id:'clear',name:'Klart'},
  rain:{id:'rain',name:'Regn',tint:0x5a6b80,tintAmt:0.45,light:0.7},
  fog:{id:'fog',name:'Dimma',tint:0xc8ccd4,tintAmt:0.65,light:0.85,fogNear:6,fogFar:36},
  storm:{id:'storm',name:'Storm',tint:0x4a5260,tintAmt:0.5,light:0.65},
  snow:{id:'snow',name:'Snö',tint:0xe8f2ff,tintAmt:0.5,light:0.95,ground:0xf4f8ff},
  thunder:{id:'thunder',name:'Åska',tint:0x2c3040,tintAmt:0.6,light:0.5},
  night:{id:'night',name:'Natt',tint:0x070a1e,tintAmt:0.88,light:0.16},
  heat:{id:'heat',name:'Hetta',tint:0xff9a40,tintAmt:0.35,light:1.1},
};
const ZONE_WEATHER={city:['rain','fog','storm','thunder'],jungle:['rain','fog','thunder'],desert:['heat','storm'],neon:['rain','fog','thunder'],ice:['snow','fog','storm'],lava:['heat','storm','thunder']};

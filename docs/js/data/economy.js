'use strict';
// XP dropped per enemy type, and the coin cost of squad levels in the buy screen.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const XP_VAL={shambler:1,crawler:1,bloater:3,knight:3,splitter:1,mole:2,necro:4,charger:4,blob:1,runner:1,swarm:1,wolf:1,bats:1,ghost:2,shooter:2,bomber:2,tank:5,spiderling:1,boss:25};
const LVL_COST=[0,10,20,35,55];
// Coin price of a hero talent point when you have no free one, by how many you have bought before.
const TALENT_COST=b=>40+20*b;
// Power-ups: one-off effects that only come out of chests.
const POWERUPS=[
  {id:'cash',kind:'power',rarity:'common',name:'Coin Bag',desc:'A burst of 10–20 coins',color:0xffc83d},
  {id:'patch',kind:'power',rarity:'common',name:'Heart Pack',desc:'Heals the whole squad 40 HP',color:0xff3d6e},
  {id:'frenzy',kind:'power',rarity:'common',name:'Frenzy',desc:'Double fire rate for 10 seconds',color:0xff8a3d},
  {id:'power',kind:'power',rarity:'common',name:'Power Shot',desc:'Double damage for 10 seconds',color:0xff5c7a},
  {id:'bubble',kind:'power',rarity:'rare',name:'Bubble',desc:'Two shield charges that each block a hit',color:0x49c3ff},
  {id:'bomb',kind:'power',rarity:'rare',name:'Bomb',desc:'Blasts every enemy near the front',color:0x37474f},
  {id:'battery',kind:'power',rarity:'rare',name:'Overdrive Battery',desc:'Fills the Overdrive meter',color:0xfff176},
  {id:'line',kind:'power',rarity:'rare',name:'Line Up',desc:'The whole squad runs side by side across the road for 12 seconds',color:0x36e2b4},
  {id:'nade',kind:'power',rarity:'rare',name:'Grenade Jump',desc:'For 15 seconds every jump throws a grenade ahead',color:0x558b2f},
  {id:'slowmo',kind:'power',rarity:'rare',name:'Slow-Mo Roll',desc:'For 15 seconds time slows down while you roll',color:0x8fd3ff},
  {id:'divine',kind:'power',rarity:'epic',name:'Divine Touch',desc:'Your next Overdrive stops time: tap enemies to make them vanish. Bosses only get hurt, so tap them again and again',color:0xfff3a0},
  {id:'jackpot',kind:'power',rarity:'epic',name:'Jackpot',desc:'A rain of 60 coins',color:0xffd21f},
];
// Permanent Armory purchases; these do not drop from chests.
const ABILITIES=[
  {id:'payback',kind:'ability',rarity:'common',name:'Payback Time',desc:'Start every run with double fire rate.',color:0xff8a3d},
  {id:'moneymaker',kind:'ability',rarity:'common',name:'Money Maker',desc:'Enemies drop full coin stacks, chests give rewards, and coins are picked up from further away.',color:0xffc83d},
  {id:'bulletproof',kind:'ability',rarity:'common',name:'Bullet Proof',desc:'Double base health for the whole squad in every run.',color:0x49c3ff},
  {id:'tackle',kind:'ability',rarity:'common',name:'Slide Tackle',desc:'Duck as an enemy comes at you to slide into it feet first, knocking it back and hurting it',color:0x36e2b4},
  {id:'dbljump',kind:'ability',rarity:'common',name:'Double Jump',desc:'Jump again in the air. Tall spike barricades need it',color:0x8fd3ff},
  {id:'pound',kind:'ability',rarity:'common',name:'Ground Pound',desc:'Duck in the air to slam down, hurting and knocking back enemies near the front',color:0xfff3c4},
  {id:'overdrive',kind:'ability',rarity:'common',name:'Overdrive',desc:'Charge a meter and unleash 6 seconds of super mode. Saves you once at 10% health',color:0xffe066},
];
// Coin drops grow with experience: in the first runs every coin drops on its own, and the biggest stack an enemy can drop
// grows by one every two runs, up to 5. Bosses drop four of the biggest stacks. Chest coins come in the same stacks.
const coinStackMax=runs=>Math.min(5,1+Math.floor(runs/2));
// Armory: what a new player has in the chests from the start, and the coin price to unlock the rest.
// Unlocking buys a chance: the item can then come out of chests and walls.
const STARTER_ITEMS=['cash','patch'];
const RARITY_PRICE={common:60,rare:150,epic:320};
const ITEM_PRICE={payback:5,moneymaker:8,bulletproof:10,tackle:12,dbljump:15,pound:20,overdrive:30,frenzy:25,recruit:30,power:35,steel:40,medic:45,fastload:45,bubble:80,bomb:90,battery:110,line:70,slowmo:100,nade:120,divine:300,jackpot:220};
const itemPrice=u=>ITEM_PRICE[u.id]||RARITY_PRICE[u.rarity];
// Coins from the run it costs to take a locked item (or a mystery item from an empty chest) for that run only.
const RUN_PRICE={common:10,rare:20,epic:35};
const runPrice=u=>Math.round(RUN_PRICE[u.rarity]*(1+dist/1500));

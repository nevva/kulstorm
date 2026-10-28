'use strict';
// ---------- weapons, gubbar, team perks, combos, heroes
for(const k in WEAPONS) WEAPONS[k].colorL=C(WEAPONS[k].color);
const defById=id=>UPGRADES.find(u=>u.id===id);
const heroById=id=>HEROES.find(h=>h.id===id)||HEROES[0];
const HERO=Object.assign({xp:0,lvl:0,pts:{}},load('kulstorm_heroprog',{}));
if(!HERO.pts) HERO.pts={};
let runHeroXp=0;
const heroNeed=l=>Math.round(60+l*30);
function heroSpent(){ let n=0; for(const k in HERO.pts) n+=HERO.pts[k]||0; return n; }
// Talent points: one per hero level, plus any bought with coins.
const heroFree=()=>HERO.lvl+(HERO.bought||0)-heroSpent();
function saveHero(){ store('kulstorm_heroprog',HERO); }
function commitHeroXp(){
  if(labRun||!OPT.heroprog||runHeroXp<=0) return {gain:0,ups:0};
  const gain=Math.round(runHeroXp); HERO.xp+=gain; runHeroXp=0; let ups=0;
  while(HERO.xp>=heroNeed(HERO.lvl)){ HERO.xp-=heroNeed(HERO.lvl); HERO.lvl++; ups++; }
  saveHero(); return {gain,ups};
}
let bank=load('kulstorm_coins',0),owned=load('kulstorm_owned',['rookie']),heroId=load('kulstorm_hero','rookie');
if(owned.indexOf('rookie')<0) owned.push('rookie');
if(owned.indexOf(heroId)<0) heroId='rookie';
// Bought gubbar join the start group unless opted out (benched). The free Rookie never joins as an extra.
let benched=load('kulstorm_bench',[]);
// Items unlocked in the Armory: only these come out of chests and walls. Lab runs, and play without coins, have everything.
let unlocked=load('kulstorm_unlocked',STARTER_ITEMS.slice()),runsDone=load('kulstorm_runs',0);
const isUnlocked=id=>labRun||!OPT.coins||unlocked.indexOf(id)>=0;
// An ability works when its setting is on and it is unlocked.
const hasAbility=id=>(id==='pound'?OPT.obstacles:OPT[id])&&isUnlocked(id);
const stackMax=()=>labRun||!OPT.coins?5:coinStackMax(runsDone);
function saveBank(){ store('kulstorm_coins',Math.round(bank)); store('kulstorm_owned',owned); store('kulstorm_hero',heroId); store('kulstorm_bench',benched); store('kulstorm_unlocked',unlocked); store('kulstorm_runs',runsDone); }
// End of a real run: bank its coins and count it (the first runs are played at an easier pace, see easeK).
function bankRun(){ if(labRun) return; if(OPT.coins&&coinsRun>0) bank+=coinsRun; runsDone++; saveBank(); }
const startCompanions=()=>HEROES.filter(h=>h.price>0&&h.id!==heroId&&owned.indexOf(h.id)>=0&&benched.indexOf(h.id)<0);
function companionDef(h){ return {id:'hero_'+h.id,kind:'gubbe',name:h.name,short:h.name,desc:h.desc,weapon:h.weapon||'pistol',hp:h.hp||100,shirt:h.shirt}; }

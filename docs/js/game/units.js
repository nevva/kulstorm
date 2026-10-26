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
function saveBank(){ store('kulstorm_coins',Math.round(bank)); store('kulstorm_owned',owned); store('kulstorm_hero',heroId); }

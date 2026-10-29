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
  if(!labRun&&runHeroXp>0){ WARD.xp+=Math.round(runHeroXp); saveWardrobe(); }
  if(labRun||!OPT.heroprog||runHeroXp<=0){ runHeroXp=0; return {gain:0,ups:0}; }
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
const abilityEnabled=id=>id==='payback'||id==='moneymaker'||id==='bulletproof'||(id==='pound'||id==='tackle'?OPT.obstacles:OPT[id]);
const hasAbility=id=>abilityEnabled(id)&&isUnlocked(id);
const memberBaseHealth=def=>Math.max(1,Math.round((def.hp||60)*STARTING_HEALTH_MULTIPLIER*(hasAbility('bulletproof')?2:1)));
const stackMax=()=>labRun||!OPT.coins?5:coinStackMax(runsDone);
function saveBank(){ store('kulstorm_coins',Math.round(bank)); store('kulstorm_owned',owned); store('kulstorm_hero',heroId); store('kulstorm_bench',benched); store('kulstorm_unlocked',unlocked); store('kulstorm_runs',runsDone); }
// End of a real run: bank its coins and count it (the first runs are played at an easier pace, see easeK).
let WARD=load('kulstorm_wardrobe',{xp:0,own:[]}),OUTFITS=load('kulstorm_outfits',{});
function saveWardrobe(){ store('kulstorm_wardrobe',WARD); store('kulstorm_outfits',OUTFITS); }
const defaultOutfit=h=>({fem:false,skin:SKIN_COL[0],hair:'short',hairCol:HAIR_COL[0],hat:null,hatCol:0,shirt:h.shirt,pants:PANTS_COL[0]});
// A hero's chosen outfit, or null for a random look.
const heroOutfit=id=>{ const o=OUTFITS[id]; return o&&o.custom?o:null; };
// Free pieces: the hero's own shirt colour, the first trousers and going without a hat.
const outfitOwned=(item,h)=>item==='hat:'||item==='shirt:'+h.shirt||item==='pants:'+PANTS_COL[0]||WARD.own.indexOf(item)>=0;
let VET=load('kulstorm_vet',{}),vetRun={},lastPromos=[];
// The leader counts as their hero, so a hero earns medals whether leading or joining as a companion.
const vetKey=m=>m.def.id==='leader'?'hero_'+((lastCfg&&lastCfg.hero)||heroId):m.def.id;
const vetRank=key=>(VET[key]&&VET[key].rank)||0;
// "★★☆☆☆ · Silver Star · next 4/10 min" for cards.
function vetLine(key){
  const r=vetRank(key),t=(VET[key]&&VET[key].t)||0,min=s=>Math.floor(s/60);
  return '★'.repeat(r)+'☆'.repeat(MEDALS.length-r)+(r?' · '+tl(MEDALS[r-1].name):'')+(r<MEDALS.length?' · '+tl('next {0}/{1} min',min(t),min(VET_NEED[r])):'');
}
function vetBoost(m,stat){ let k=1; const r=vetRank(vetKey(m)); for(let i=0;i<r;i++) k*=MEDALS[i][stat]||1; return k; }
function trackVeterans(dt){ for(const m of squad) if(!m.dead){ const k=vetKey(m); vetRun[k]=(vetRun[k]||{t:0,name:m.def.id==='leader'?heroById((lastCfg&&lastCfg.hero)||heroId).name:m.def.name}); vetRun[k].t+=dt; } }
// End of a real run: add this run's squad time and collect the medals earned.
function awardVeterans(){
  lastPromos=[];
  for(const k in vetRun){
    const v=VET[k]=VET[k]||{t:0,rank:0}; v.t+=vetRun[k].t; v.name=vetRun[k].name;
    while(v.rank<MEDALS.length&&v.t>=VET_NEED[v.rank]){ lastPromos.push({key:k,name:v.name,rank:v.rank+1,medal:MEDALS[v.rank]}); v.rank++; }
  }
  vetRun={}; store('kulstorm_vet',VET);
}
function bankRun(){ if(labRun) return; if(OPT.coins&&coinsRun>0) bank+=coinsRun; runsDone++; saveBank(); }
const startCompanions=()=>HEROES.filter(h=>h.price>0&&h.id!==heroId&&owned.indexOf(h.id)>=0&&benched.indexOf(h.id)<0);
function companionDef(h){ return {id:'hero_'+h.id,kind:'gubbe',name:h.name,short:h.name,desc:h.desc,weapon:h.weapon||'pistol',hp:h.hp||100,shirt:h.shirt,outfit:heroOutfit(h.id)}; }

'use strict';
// ---------- run summary: how much damage each gubbe, team perk, combo and ability did, for the game-over screen.
// Every hit is credited once. Hits from a combo or perk effect (chain lightning, burning, ricochet…) go to that source (dmgSrc).
// A plain weapon hit goes to the gubbe who fired it, except the bonus on top of the base damage: that is split between the
// multipliers that were active (Stålkulor, Ammo-expert, Overdrive, Flow…) in proportion to log(multiplier), so the parts add up.
// Aura gubbar (Sergeant, Ammo-expert…) get their own shots plus their share of everyone's bonus. Aura shares are estimates.
const RUN={members:[],src:{},combos:new Set(),uid:0};
let dmgSrc=null,hitBoost=null;  // set around a hit: the source to credit all of it to, or extra multipliers for this hit only
function runReset(){ RUN.members=[]; RUN.src={}; RUN.combos=new Set(); RUN.uid=0; }
function runAddMember(m){ m.uid=++RUN.uid; RUN.members.push(m); }
function credit(key,amt){ RUN.src[key]=(RUN.src[key]||0)+amt; }
// Multipliers from powerups, rebuilt by recomputeAuras. k = how much they multiply the squad's damage per second.
function runBoosts(A){
  const B=[];
  for(const m of squad){
    const id=m.def.id,key='m:'+m.uid;
    if(id==='firerate') B.push({key,k:1.2});
    else if(id==='damage') B.push({key,k:1.25});
    else if(id==='crit') B.push({key,k:(1+A.crit)/(1+Math.max(0,A.crit-0.15))});
    else if(id==='multishot') B.push({key,k:(1+A.extra)/Math.max(1,A.extra)});
    else if(id==='pierce') B.push({key,k:1.15});
    else if(id==='bigbullets') B.push({key,k:1.1});
  }
  for(const p of S.perks){ if(p.id==='steel') B.push({key:'p:steel',k:1.15}); else if(p.id==='fastload') B.push({key:'p:fastload',k:1.15}); }
  if(S.combos.has('hawk')) B.push({key:'c:hawk',k:(1+A.crit)/(1+A.crit-0.1)});
  return B;
}
function creditDamage(dmg,owner){
  if(owner) owner.dealt+=dmg;
  if(dmgSrc){ credit(dmgSrc,dmg); return; }
  if(!owner){ credit('x:weather',dmg); return; }
  const f=(S.boosts||[]).slice();
  if(S.odT>0) f.push({key:'a:od',k:odK()*odRate()});
  if(S.flowT>0) f.push({key:'a:flow',k:flowK()*flowK()});
  if(hitBoost) f.push(...hitBoost);
  let K=1; for(const b of f) K*=b.k;
  if(K>1.0001){ const bonus=dmg-dmg/K,L=Math.log(K); for(const b of f) if(b.k>1) credit(b.key,bonus*Math.log(b.k)/L); dmg/=K; }
  credit('m:'+owner.uid,dmg);
}
// Rows for the summary, biggest damage first. Sources without damage (Magnet, Sköld…) come last with their description.
function runSummary(){
  const rows=[],src=RUN.src,dmgOf=k=>src[k]||0;
  for(const m of RUN.members) rows.push({name:m.def.id==='leader'?'Du · '+WEAPONS[m.def.weapon||'pistol'].name:m.def.name,kind:'Gubbe'+(m.dead&&m.def.id!=='leader'?' · stupade':''),dmg:dmgOf('m:'+m.uid),desc:m.def.desc});
  const perks={}; S.perks.forEach(p=>{ perks[p.id]=perks[p.id]||{p,n:0}; perks[p.id].n++; });
  for(const id in perks){ const {p,n}=perks[id]; rows.push({name:p.name+(n>1?' ×'+n:''),kind:'Lagvinst',dmg:dmgOf('p:'+id),desc:p.desc}); }
  for(const c of COMBOS) if(RUN.combos.has(c.id)) rows.push({name:c.name,kind:'Kombo',dmg:dmgOf('c:'+c.id),desc:c.desc});
  if(src['a:od']) rows.push({name:'Overdrive',kind:'Förmåga',dmg:src['a:od']});
  if(src['a:flow']) rows.push({name:'Flow',kind:'Förmåga',dmg:src['a:flow']});
  if(src['a:pound']) rows.push({name:'Markstöt',kind:'Förmåga',dmg:src['a:pound']});
  if(src['x:weather']) rows.push({name:'Åska och väder',kind:'Väder',dmg:src['x:weather']});
  rows.sort((a,b)=>b.dmg-a.dmg);
  return rows;
}

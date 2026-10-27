'use strict';
// ---------- spawning & events
function pickType(){
  const list=[]; let tot=0;
  const nightOn=OPT.daynight&&DN.nightF>0.6,moonK=0.6+DN.moonB;
  const zp=ZONES[zoneIdx].props;
  for(const k in ENEMY){ const e=ENEMY[k]; if(LABOFF.has(k)||!e.w) continue; if(e.night&&!nightOn) continue; if(dist>=e.unlock){ let w=e.w; if(k==='blob') w=Math.max(3,10-dist/150); if(k==='swarm'&&dist>800) w=7; if(e.night) w*=moonK;
    if(e.zombie&&(zp==='city'||zp==='jungle')) w*=1.6; if(k==='mole'&&zp==='desert') w*=2; if(k==='knight'&&zp==='neon') w*=2; if(k==='splitter'&&zp==='ice') w*=2; if(k==='bloater'&&zp==='lava') w*=2;
    list.push([k,w]); tot+=w; } }
  if(!list.length) return null;
  let r=Math.random()*tot;
  for(const [k,w] of list){ r-=w; if(r<=0) return k; }
  return list[0][0];
}
// Pacing: waves of ~20 s with 4 s breathers, extra pauses after bosses and when a shop appears, and a cap on enemies alive.
let waveClock=0,spawnPause=0;
const enemyCap=()=>Math.round(Math.min(30,10+dist/150));
const aliveCount=()=>{ let n=0; for(const e of enemies) if(!e.dead&&e.type!=='boss') n++; return n; };
function spawner(dt){
  const prevWave=Math.floor(waveClock/24); waveClock+=dt;
  if(Math.floor(waveClock/24)>prevWave&&OPT.unicorns&&unicorns.length<2&&!wildUni.active&&dist>200&&Math.random()<0.02) startWildUnicorn();
  if(spawnPause>0){ spawnPause-=dt; return; }
  if(waveClock%24>20) return;
  spawnT-=dt;
  if(spawnT>0) return;
  spawnT=DIFF.spawn/DIFF.crowd*(boss?2.4:1)*rand(0.7,1.3);
  if(aliveCount()>=enemyCap()){ spawnT=0.35; return; }
  const sz=VIEW.spawn;
  if(dist>1500&&!LABOFF.has('shambler')&&Math.random()<0.025){
    const lane=ri(0,LANES-1),n=ri(6,9);
    for(let i=0;i<n;i++){ const e=spawnEnemy(Math.random()<0.2&&!LABOFF.has('crawler')?'crawler':'shambler',lane,sz-Math.floor(i/3)*1.3); e.g.position.x=LANE_X[lane]+((i%3)-1)*1.15; clampLane(e); }
    toast('Zombiehorde!'); sfx.zone(); return;
  }
  const type=pickType(); if(!type) return;
  const def=ENEMY[type],lane=ri(0,LANES-1);
  if(def.group){ const n=type==='shambler'?(dist>600?ri(3,5):ri(2,3)):ri(def.group[0],def.group[1]); for(let i=0;i<n;i++){ const t2=(type==='shambler'&&Math.random()<0.25&&!LABOFF.has('crawler'))?'crawler':type; spawnEnemy(t2,lane,sz-i*(def.loose?1.6:0.9)); } }
  else{
    spawnEnemy(type,lane,sz);
    if(dist>1800&&Math.random()<0.35) spawnEnemy(type,(lane+ri(1,2))%LANES,sz-2);
    if(dist>3500&&Math.random()<0.3){ const t3=pickType(); if(t3) spawnEnemy(t3,ri(0,LANES-1),sz-4); }
  }
}
function checkEvents(){
  if(dist>=zoneDistNext){
    zoneDistNext+=400;
    let i; do{ i=ri(0,ZONES.length-1); }while(i===zoneIdx);
    setZone(i,false); toast('Zon: '+ZONES[i].name+(OPT.music&&MUSIC.zones[ZONES[i].props]?' · '+GENRES[MUSIC.zones[ZONES[i].props].genre].name:'')); sfx.zone();
    weatherZoneCheck();
  }
  if(OPT.weather&&dist>=W.next){ W.next+=300; rollWeather(); }
  if(dist>=nextUpgradeAt){ nextUpgradeAt+=upgradeStep; upgradeStep+=25; spawnRandomWalls(); }
  if(dist>=nextBossAt&&!boss){
    nextBossAt+=600; bossNo++;
    boss=spawnEnemy('boss',1,VIEW.spawn); boss.maxHp=boss.hp=300*DIFF.hp*(1+0.35*bossNo)*PF;
    bossNameEl.textContent='BOSS '+bossNo; bossBar.hidden=false;
    toast('BOSS!',true); sfx.boss(); shake(0.6);
  }
}
function bossDefeated(){
  bossBar.hidden=true; spawnPause=Math.max(spawnPause,5); toast('Boss besegrad!'); shake(0.8); kills+=10;
  setTimeout(()=>{ if(mode==='playing') spawnWalls([0,1,2],true); },300);
}

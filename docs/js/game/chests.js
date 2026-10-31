'use strict';
// ---------- chests: turn up on the road now and then; run into one for a random item. Shots and blasts pass them by.
// The roll covers every item in the game (squad members, team perks, the unicorn and the power-ups in POWERUPS).
// Only items unlocked in the Armory come out. Before Money Maker chests are empty, but run coins can buy a mystery item from them.
// Golden chests drop after a boss when there is no boss reward wall to pick, and roll with boss odds.
let chests=[],nextChestAt=60;
const needsPaybackCoins=()=>!labRun&&OPT.coins&&!isUnlocked('payback')&&bank+coinsRun<ITEM_PRICE.payback;
const chestWood=mat(0x9a6238,{r:0.6}),chestBand=mat(0xffc83d,{r:0.25,m:0.6,e:0.25}).clone(),chestGold=mat(0xffd21f,{r:0.2,m:0.7,e:0.45}).clone(),chestIn=mat(0x2a160c,{r:0.8});
// Soft additive glow: a halo behind the chest and a pool of light on the road, pulsing so chests stand out as pickups.
const chestGlowTex=(function(){
  const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.35,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=gr; x.fillRect(0,0,128,128); return new THREE.CanvasTexture(c);
})();
const glowOpts=col=>({map:chestGlowTex,color:C(col),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const chestHalo=[new THREE.SpriteMaterial(glowOpts(0xffb84a)),new THREE.SpriteMaterial(glowOpts(0xffe066))];
const chestFloorGlow=[new THREE.MeshBasicMaterial(glowOpts(0xffb84a)),new THREE.MeshBasicMaterial(glowOpts(0xffe066))];
function pulseChestGlow(){
  const k=0.5+0.5*Math.sin(time*4);
  chestHalo.forEach((m,i)=>m.opacity=(i?0.75:0.55)+0.25*k); chestFloorGlow.forEach((m,i)=>m.opacity=(i?0.7:0.5)+0.25*k);
  chestBand.emissiveIntensity=0.4+0.8*k; chestGold.emissiveIntensity=0.5+0.6*k;
}
function buildChest(gold){
  const g=new THREE.Group(),body=gold?chestGold:chestWood,band=gold?chestWood:chestBand;
  g.add(M(G.box,body,[1.3,0.66,0.86],[0,0.33,0]));
  g.add(M(G.box,chestIn,[1.18,0.04,0.74],[0,0.67,0],false));
  [-0.42,0.42].forEach(x=>g.add(M(G.box,band,[0.13,0.68,0.9],[x,0.34,0],false)));
  // The lid hinges at the back (-z); the lock faces the camera (+z).
  const lid=new THREE.Group(); lid.position.set(0,0.66,-0.43);
  lid.add(M(G.box,body,[1.34,0.3,0.9],[0,0.15,0.43]));
  [-0.42,0.42].forEach(x=>lid.add(M(G.box,band,[0.14,0.32,0.94],[x,0.15,0.43],false)));
  lid.add(M(G.box,chestBand,[0.24,0.28,0.08],[0,0.02,0.9],false));
  g.add(lid);
  const halo=new THREE.Sprite(chestHalo[gold?1:0]); halo.scale.set(3.2,2.6,1); halo.position.set(0,0.6,-0.3); halo.renderOrder=-1; g.add(halo);
  const pool=new THREE.Mesh(G.plane,chestFloorGlow[gold?1:0]); pool.rotation.x=-Math.PI/2; pool.scale.set(3.4,3.4,1); pool.position.y=0.03; g.add(pool);
  if(gold) g.scale.setScalar(1.25);
  g.userData={lid};
  return g;
}
function spawnChest(gold){
  if(!gold){
    nextChestAt=dist+rand(120,170);
    // keep clear of walls and obstacles near the horizon; try again a little later
    if(walls.some(w=>!w.dead&&w.g.position.z<VIEW.spawn+10)||obstacles.some(o=>o.z<VIEW.spawn+10)){ nextChestAt=dist+15; return; }
  }
  const lane=(gold||needsPaybackCoins())?1:ri(0,LANES-1),g=buildChest(gold);
  g.position.set(LANE_X[lane],0,VIEW.spawn); g.rotation.y=gold?0:rand(-0.25,0.25); scene.add(g);
  chests.push({g,lid:g.userData.lid,gold:!!gold,openT:-1,sparkT:0,dead:false});
  if(gold){ toast(tl('Golden chest!')); sfx.combo(); }
}
// Power-ups that need an option that is off (Overdrive, jumping and rolling) never drop and are hidden in the Armory.
const powerOn=u=>(OPT.overdrive||(u.id!=='battery'&&u.id!=='divine'))&&(OPT.obstacles||(u.id!=='nade'&&u.id!=='slowmo'));
// Battery and Divine Touch only drop once Overdrive is unlocked.
const powerUsable=u=>hasAbility('overdrive')||(u.id!=='battery'&&u.id!=='divine');
function chestPool(){
  return UPGRADES.filter(upgradeFits).concat(POWERUPS.filter(u=>(OPT.coins||(u.id!=='cash'&&u.id!=='jackpot'))&&powerOn(u)));
}
const freeChestPool=()=>chestPool().filter(u=>isUnlocked(u.id)&&powerUsable(u));
function rollChest(gold,pool){
  const ws=pool.map(u=>rarityW(u,gold)*(u.kind==='power'?1.4:u.kind==='team'?0.7:1));
  let r=Math.random()*ws.reduce((a,b)=>a+b,0),i=0;
  for(;i<ws.length-1;i++){ r-=ws[i]; if(r<=0) break; }
  return pool[i];
}
function openChest(c){
  const p=c.g.position;
  c.openT=0; addOD(0.05);
  sfx.upgrade(); shake(0.35);
  for(let i=0;i<22;i++){ const a=rand(0,Math.PI*2),sp=rand(1.5,4); blobs.spawn(p.x,0.8,p.z,Math.cos(a)*sp,rand(3,7),Math.sin(a)*sp,rand(0.5,0.9),0.16,0.05,WHITE,GOLD,C(0xff8a3d),-1,1,false,rand(1,4)); }
  if(!hasAbility('moneymaker')){ offerMystery(c); return; }
  const pool=freeChestPool(),reward=!c.gold&&needsPaybackCoins()?POWERUPS.find(u=>u.id==='cash'):rollChest(c.gold,pool);
  grantItem(reward,p);
  if(c.gold) grantItem(rollChest(true,pool),p);
}
const MYSTERY_PRICE=10,MYSTERY_STEP=5,WALL_GAMBLE_WIN=0.5;
// Each mystery item bought in a run makes the next one cost MYSTERY_STEP more (doubled for golden chests and boss walls).
const mysteryCost=gold=>(MYSTERY_PRICE+MYSTERY_STEP*R.mysteries)*(gold?2:1);
// Free coins from an empty chest follow the same boosts as enemy drops: Gold Rush, the Banker and the heat wave.
function chestCoinRoll(gold){
  const k=(S.combos.has('goldrush')?2:1)*(hasPart('banker')?1.5:1)*(isW('heat')?1.5:1)*(gold?3:1);
  return Math.max(1,Math.round(ri(3,8)*k));
}
// An empty chest pauses the game: gamble run coins for a random item (locked or not) for this run, or take a random handful of coins.
function offerMystery(c){
  const p=c.g.position.clone();
  if(mode!=='playing'){ sayAt(p.x,2.6,p.z,tl('Empty'),'#b9bde0'); return; }
  openItemShop(c.gold?tl('Empty golden chest'):tl('Empty chest'),[{type:'mystery',cost:mysteryCost(c.gold),gold:c.gold,p},{type:'coins',cost:0,gold:c.gold,p}]);
}
// Won coins go straight into the run's purse, the same as picking them up.
function collectCoins(n){
  const h=headMember(); coinsRun+=n*S.T.coinMult; hudCoins=-1; sfx.coin();
  if(h){ const p=h.g.position; fxSparkle(p.x,1.6,p.z,GOLD); pushDmg(p.x,2.8,p.z,'+'+n,'#ffc83d',true); }
}
// Slot-machine reveal on the offer card: names flicker past, slow down and land on what was won, then the shop closes.
function spinMystery(o){
  const coins=o.type==='coins',n=coins?chestCoinRoll(o.gold):0,pool=chestPool().filter(powerUsable),won=[];
  // A wall gamble lands on the wall's perk half the time, otherwise on something else.
  if(!coins) won.push(o.target?(Math.random()<WALL_GAMBLE_WIN?o.target:rollChest(o.gold,pool.filter(u=>u!==o.target))):rollChest(o.gold,pool));
  if(o.gold&&!coins) won.push(rollChest(true,pool));
  const coinText=v=>tl('{0} coins',v);
  const card=$('offer'+R.offers.indexOf(o)),h=card.querySelector('h4'),sw=card.querySelector('.sw'),p=card.querySelector('p'),pr=card.querySelector('.price');
  const css=u=>u.kind==='power'?hexCss(u.color):u.kind==='gubbe'?hexCss(u.shirt):WALL_CSS[u.rarity];
  R.spinning=true; card.classList.add('spinning'); p.textContent=''; pr.textContent=tl('Spinning…');
  let t=0,delay=45,timer=0,landed=false;
  const finish=()=>{ clearTimeout(timer); R.spinning=false; R.skipSpin=null; won.forEach(u=>grantItem(u,o.p)); if(afterPick()) closeShop(); if(coins) collectCoins(n); };
  const land=()=>{
    landed=true;
    if(coins){ h.textContent=coinText(n); p.textContent=''; }
    else { h.textContent=won.map(u=>u.name).join(' + '); sw.style.background=css(won[0]); p.textContent=won.map(u=>u.desc).join(' · '); }
    pr.textContent=tl('You won!'); card.classList.remove('spinning'); card.classList.add('won'); sfx.unlock();
    timer=setTimeout(finish,1100);
  };
  const tick=()=>{
    if(mode!=='shop'){ R.spinning=false; R.skipSpin=null; return; }
    if(t++<22){ if(coins) h.textContent=coinText(Math.max(1,Math.round(n*rand(0.3,1.8)))); else { const u=pick(pool); h.textContent=u.name; sw.style.background=css(u); } sfx.coin(); delay*=1.12; timer=setTimeout(tick,delay); return; }
    land();
  };
  // A tap or key press during the spin jumps to the result; another one closes right away.
  R.skipSpin=()=>{ if(landed) finish(); else { clearTimeout(timer); land(); } };
  tick();
}
function grantItem(u,p){
  const css=u.kind==='power'?hexCss(u.color):u.kind==='gubbe'?hexCss(u.shirt):WALL_CSS[u.rarity];
  roadText(u.kind==='gubbe'?tl('{0} joins!',u.name):u.name+'!',u.desc,css);
  if(u.kind==='pet') addUnicorn();
  else if(u.kind==='gubbe'){ const m=addMember(u); fxSparkle(m.g.position.x,1.2,m.g.position.z,C(u.shirt)); updatePower(0,true); }
  else if(u.kind==='team'){ applyTeamPerk(u); updatePower(0,true); }
  else applyPowerup(u,p);
}
// Road paint: what you just got is painted in big stretched letters on your lane ahead, like BUS or STOP markings,
// in worn, lit paint that the squad runs over.
const roadTexts=[],roadTexCache={};
const ROAD_TEXT_LEN=6.5,ROAD_TEXT_W=3.4,roadTextGeo=new THREE.PlaneGeometry(1,1,1,10).rotateX(-Math.PI/2);
function roadTextTex(title,sub,css){
  const key=title+'|'+sub+'|'+css; if(roadTexCache[key]) return roadTexCache[key];
  const c=document.createElement('canvas'); c.width=512; c.height=360; const x=c.getContext('2d');
  x.textAlign='center'; x.textBaseline='middle'; x.fillStyle=css;
  let fs=150; x.font=fs+'px Bungee, Impact, sans-serif'; while(x.measureText(title).width>480&&fs>60){ fs-=8; x.font=fs+'px Bungee, Impact, sans-serif'; }
  x.fillText(title,256,sub?110:180);
  if(sub){ x.fillStyle='#fff8e6'; x.font='800 44px Nunito, sans-serif'; wrapText(x,sub,480).slice(0,3).forEach((l,i)=>x.fillText(l,256,230+i*46)); }
  // wear: knock small flecks out of the paint so it reads as painted on the tarmac
  x.globalCompositeOperation='destination-out';
  for(let i=0;i<900;i++){ x.globalAlpha=Math.random()*0.7; const r=Math.random()*3+0.5; x.beginPath(); x.arc(Math.random()*512,Math.random()*360,r,0,6.283); x.fill(); }
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=4;
  const keys=Object.keys(roadTexCache); if(keys.length>24){ roadTexCache[keys[0]].dispose(); delete roadTexCache[keys[0]]; }
  return roadTexCache[key]=t;
}
function roadText(title,sub,css){
  let d=roadTexts.find(q=>q.t<=0);
  if(!d){ if(roadTexts.length>=3) d=roadTexts.reduce((a,b)=>a.t<b.t?a:b); else { const m=new THREE.Mesh(roadTextGeo,new THREE.MeshStandardMaterial({transparent:true,roughness:0.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})); m.renderOrder=1; scene.add(m); d={m,t:0}; roadTexts.push(d); } }
  // a later message on the same lane goes a bit further up the road so they don't overlap
  const lane=laneOf(S.x),busy=roadTexts.filter(q=>q!==d&&q.t>0&&q.lane===lane).reduce((z,q)=>Math.min(z,q.m.position.z),-14);
  d.m.material.map=roadTextTex(title,sub||'',css); d.m.material.needsUpdate=true; d.m.material.opacity=0.9;
  d.m.scale.set(ROAD_TEXT_W,1,ROAD_TEXT_LEN); d.m.position.set(LANE_X[lane],0.03,Math.min(-14,busy-ROAD_TEXT_LEN-1)); d.m.visible=true; d.t=1; d.lane=lane;
}
function updateRoadText(dt){
  for(const d of roadTexts){ if(d.t<=0) continue; const p=d.m.position; p.z+=scroll*dt; if(p.z>2){ d.m.material.opacity=Math.max(0,0.9-(p.z-2)*0.25); } if(p.z>8){ d.t=0; d.m.visible=false; } }
}
function clearRoadText(){ roadTexts.forEach(d=>{ d.t=0; d.m.visible=false; }); }
// Timed power-ups: Frenzy doubles fire rate and Power Shot doubles damage while their timers run.
const PW_T=10;
const pwK=()=>S.pwDmg>0?2:1, pwRate=()=>S.pwRate>0?2:1;
function applyPowerup(u,p){
  switch(u.id){
    case 'cash': spawnCoins(p.x,p.z,ri(10,20),needsPaybackCoins()?0.45:1.2); break;
    case 'jackpot': spawnCoins(p.x,p.z,60,2.2); sfx.combo(); break;
    case 'patch': squad.forEach(m=>healMember(m,40)); sfx.pickup(); break;
    case 'frenzy': S.pwRate=PW_T; break;
    case 'power': S.pwDmg=PW_T; break;
    case 'bubble': squad[0].charges+=2; hudShield=-1; sfx.shield(); break;
    case 'line': S.pwLine=12; break;
    case 'nade': S.pwNade=15; break;
    case 'slowmo': S.pwSlow=15; break;
    case 'divine': S.divine++; showHint(tl('Divine Touch: your next Overdrive stops time')); break;
    case 'battery': if(S.odT<=0){ S.odLock=0; addOD(1); } break;
    case 'bomb': {
      // Normal enemies near the front take most of a fresh enemy's health; bosses lose an eighth of theirs.
      dmgSrc='a:bomb'; shake(1.0); sfx.explode(2);
      for(const e of enemies){ if(e.dead||e.under) continue; const q=e.g.position; if(q.z<-40||q.z>3) continue; const dv=e.isBoss?e.maxHp*0.12:Math.max(e.maxHp*0.7,50*DIFF.hp); fxExplosion(q.x,q.y+e.r*0.7,q.z,1.2,FIRE1); hitEnemy(e,dv,false,3,null,true); }
      dmgSrc=null; break;
    }
  }
}
function updateChests(dt){
  if(mode==='playing') for(const k of ['pwRate','pwDmg','pwLine','pwNade','pwSlow']) if(S[k]>0){ S[k]=Math.max(0,S[k]-dt); if(k==='pwLine'&&!S[k]) layoutSquad(); }
  updateNades(dt);
  if(chests.length) pulseChestGlow();
  for(const c of chests){
    const p=c.g.position,s0=c.gold?1.25:1; p.z+=scroll*dt;
    if(c.openT>=0){
      c.openT+=dt; c.lid.rotation.x=-1.9*Math.min(1,c.openT*7);
      if(c.openT>0.7){ const k=Math.max(0.01,1-(c.openT-0.7)*2.5); c.g.scale.setScalar(s0*k); }
      if(c.openT>1.1) c.dead=true;
    } else {
      c.lid.rotation.x=-0.08*Math.max(0,Math.sin(time*6+p.x));
      c.sparkT-=dt; if(c.sparkT<=0){ c.sparkT=c.gold?0.05:0.14; blobs.spawn(p.x+rand(-0.6,0.6),rand(0.4,1.2),p.z+rand(-0.4,0.4),0,rand(0.5,1.4),0,0.5,0.1,0.03,WHITE,GOLD,C(0xffb300),-1,1,false,0); }
      if(mode==='playing') for(const m of squad){ const q=m.g.position; if(Math.abs(q.x-p.x)<0.95&&Math.abs(q.z-p.z)<0.8){ openChest(c); break; } }
      if(p.z>4) c.dead=true;
    }
    if(c.dead) scene.remove(c.g);
  }
  chests=chests.filter(c=>!c.dead);
}
function clearChests(){ chests.forEach(c=>scene.remove(c.g)); chests=[]; nades.forEach(n=>scene.remove(n.g)); nades=[]; divineEl.hidden=true; }
// Line Up: the squad's spot in a row across the road, centred on the steering point and kept on the road.
function lineSlotX(i,n){
  const sp=n>1?Math.min(1.05,(2*HALF-0.8)/(n-1)):0,half=sp*(n-1)/2,c=clamp(S.x,-HALF+0.4+half,HALF-0.4-half);
  return c-half+i*sp;
}
// Grenade Jump: each jump wave lobs a grenade from the front-runner that bursts about 11 m ahead.
let nades=[];
const nadeMat=mat(0x558b2f,{r:0.45});
function throwNade(){
  const h=headMember(); if(!h) return; const p=h.g.position;
  const g=M(G.sph,nadeMat,[0.22,0.26,0.22],[p.x,1.4,p.z-0.4],false); scene.add(g);
  nades.push({g,x:p.x,z0:p.z-0.4,t:0});
}
const NADE_T=0.6,NADE_D=11;
function updateNades(dt){
  for(const n of nades){
    n.t+=dt; n.z0+=scroll*dt; const q=Math.min(1,n.t/NADE_T);
    n.g.position.set(n.x,1.4+5*q*(1-q)-1.0*q,n.z0-NADE_D*q); n.g.rotation.x-=dt*12;
    if(q>=1){ n.dead=true; scene.remove(n.g); if(mode==='playing'){ const d=45*DIFF.hp*PF; dmgSrc='a:nade'; explodeAt(n.x,0.5,n.g.position.z,3,d,d,false,null,1); dmgSrc=null; } }
  }
  nades=nades.filter(n=>!n.dead);
}
// Slow-Mo Roll: while the front-runner rolls on the ground, the whole game runs at a third of its speed.
function slowK(){
  if(!S||!(S.pwSlow>0)||mode!=='playing'||!squad.length) return 1;
  const h=headMember(); return h.duckT>0&&!((h.jy||0)>0)?0.35:1;
}
// Divine Touch: an Overdrive with a charge stops the world for DIVINE_T s. Each tap on an enemy makes it vanish; a boss loses a slice of its health per tap.
const DIVINE_T=5,divineEl=$('divine'),dvV=new THREE.Vector3();
let divineT=0,divineRelock=false;
function startDivine(){
  S.divine--; divineT=DIVINE_T; divineRelock=locked(); unlockMouse();
  mode='divine'; keys.l=keys.r=false; drag=null; divineEl.hidden=false; sfx.combo();
}
function updateDivine(dt){
  divineT-=dt; $('divine-t').textContent=Math.max(0,divineT).toFixed(1);
  blobs.update(dt,0); chunks.update(dt,0);
  if(divineT<=0){ divineEl.hidden=true; mode='playing'; last=performance.now(); if(divineRelock&&OPT.mouse) lockMouse(); divineRelock=false; }
}
function divineTap(cx,cy){
  const r=canvas.getBoundingClientRect(); let best=null,bd=1e9;
  for(const e of enemies){
    if(e.dead||e.under) continue; const p=e.g.position;
    dvV.set(p.x,p.y+e.r*0.7,p.z).project(camera); if(dvV.z>1) continue;
    const sx=r.left+(dvV.x+1)/2*r.width,sy=r.top+(1-dvV.y)/2*r.height,d=Math.hypot(sx-cx,sy-cy),reach=e.isBoss?110:60;
    if(d<reach&&d<bd){ bd=d; best=e; }
  }
  if(!best) return;
  const p=best.g.position;
  for(let i=0;i<16;i++){ const a=rand(0,6.28),sp=rand(2,5); blobs.spawn(p.x,p.y+best.r*0.7,p.z,Math.cos(a)*sp,rand(1,4),Math.sin(a)*sp,rand(0.5,0.9),0.2,0.05,WHITE,C(0xfff3a0),C(0xffd21f),-1,1,false,0); }
  sfx.upgrade();
  if(best.isBoss){ dmgSrc='a:divine'; hitEnemy(best,best.maxHp*0.06,true,4,null,true); dmgSrc=null; sayAt(p.x,p.y+best.r*1.6,p.z,'-6'+PCT,'#fff3a0'); }
  else { sayAt(p.x,p.y+best.r+0.6,p.z,'POOF','#fff3a0'); killEnemy(best,true); }
}
canvas.addEventListener('pointerdown',e=>{ if(mode==='divine'){ e.preventDefault(); divineTap(e.clientX,e.clientY); } });

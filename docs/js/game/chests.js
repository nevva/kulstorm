'use strict';
// ---------- chests: turn up on the road now and then; shoot one open or run into it for a random item.
// The roll covers every item in the game (squad members, team perks, the unicorn and the power-ups in POWERUPS).
// An item unlocked in the Armory comes out as it is; a locked one pays out coins instead and shows what you could have had.
// Golden chests drop after a boss when there is no boss reward wall to pick, and roll with boss odds.
let chests=[],nextChestAt=60;
const needsPaybackCoins=()=>!labRun&&OPT.coins&&!isUnlocked('payback')&&bank+coinsRun<ITEM_PRICE.payback;
const chestWood=mat(0x9a6238,{r:0.6}),chestBand=mat(0xffc83d,{r:0.25,m:0.6,e:0.25}),chestGold=mat(0xffd21f,{r:0.2,m:0.7,e:0.45}),chestIn=mat(0x2a160c,{r:0.8});
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
  const hp=(gold?60:22)*DIFF.hp*PF;
  chests.push({g,lid:g.userData.lid,gold:!!gold,hp,maxHp:hp,openT:-1,sq:0,sparkT:0,dead:false});
  if(gold){ toast(tl('Golden chest!')); sfx.combo(); }
}
function hitChest(c,dmg,x,y,z){
  if(c.openT>=0) return;
  c.hp-=dmg; c.sq=1; fxHit(x,y,z,GOLD);
  if(c.hp<=0) openChest(c);
}
// Power-ups that need an option that is off (Overdrive, jumping and rolling) never drop and are hidden in the Armory.
const powerOn=u=>(OPT.overdrive||(u.id!=='battery'&&u.id!=='divine'))&&(OPT.obstacles||(u.id!=='nade'&&u.id!=='slowmo'));
// Battery and Divine Touch only drop for real once Overdrive is unlocked; until then they are coin teasers like any locked item.
const powerUsable=u=>hasAbility('overdrive')||(u.id!=='battery'&&u.id!=='divine');
function chestPool(){
  return UPGRADES.filter(upgradeFits).concat(POWERUPS.filter(u=>(OPT.coins||(u.id!=='cash'&&u.id!=='jackpot'))&&powerOn(u)));
}
function rollChest(gold){
  const pool=chestPool(),ws=pool.map(u=>rarityW(u,gold)*(u.kind==='power'?1.4:u.kind==='team'?0.7:1));
  let r=Math.random()*ws.reduce((a,b)=>a+b,0),i=0;
  for(;i<ws.length-1;i++){ r-=ws[i]; if(r<=0) break; }
  return pool[i];
}
function openChest(c){
  const p=c.g.position;
  c.openT=0; addOD(0.05);
  sfx.upgrade(); shake(0.35);
  for(let i=0;i<22;i++){ const a=rand(0,Math.PI*2),sp=rand(1.5,4); blobs.spawn(p.x,0.8,p.z,Math.cos(a)*sp,rand(3,7),Math.sin(a)*sp,rand(0.5,0.9),0.16,0.05,WHITE,GOLD,C(0xff8a3d),-1,1,false,rand(1,4)); }
  const reward=!c.gold&&needsPaybackCoins()?POWERUPS.find(u=>u.id==='cash'):rollChest(c.gold);
  grantItem(reward,p,c.gold);
  if(c.gold) grantItem(rollChest(true),p,true);
}
function grantItem(u,p,gold){
  if(!isUnlocked(u.id)||(u.kind==='power'&&!powerUsable(u))){
    const n=Math.round(LOCKED_COINS[u.rarity]*(gold?3:1)*(1+dist/1500));
    spawnCoins(p.x,p.z,n,1.2);
    sayAt(p.x,2.6,p.z,u.name,'#b9bde0',tl('Locked · unlock it in the Armory'));
    toast(tl('Locked: {0}',u.name));
    return;
  }
  const css=u.kind==='power'?hexCss(u.color):u.kind==='gubbe'?hexCss(u.shirt):WALL_CSS[u.rarity];
  sayAt(p.x,2.6,p.z,u.name,css,u.desc);
  if(u.kind==='pet'){ addUnicorn(); toast(tl('A unicorn joins!')); }
  else if(u.kind==='gubbe'){ const m=addMember(u); fxSparkle(m.g.position.x,1.2,m.g.position.z,C(u.shirt)); toast(tl('{0} joins!',u.name)); updatePower(0,true); }
  else if(u.kind==='team'){ applyTeamPerk(u); toast(u.name+'!'); updatePower(0,true); }
  else { applyPowerup(u,p); toast(u.name+'!'); }
}
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
  for(const c of chests){
    const p=c.g.position,s0=c.gold?1.25:1; p.z+=scroll*dt;
    if(c.openT>=0){
      c.openT+=dt; c.lid.rotation.x=-1.9*Math.min(1,c.openT*7);
      if(c.openT>0.7){ const k=Math.max(0.01,1-(c.openT-0.7)*2.5); c.g.scale.setScalar(s0*k); }
      if(c.openT>1.1) c.dead=true;
    } else {
      if(c.sq>0){ c.sq*=Math.exp(-dt*12); const k=1+0.1*c.sq; c.g.scale.set(s0*k,s0/k,s0*k); }
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

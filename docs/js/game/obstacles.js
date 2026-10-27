'use strict';
// ---------- obstacles: low ones to jump over, high ones to duck under. The squad jumps/ducks as a wave down the chain.
const JUMP_T=0.75,DUCK_T=0.85,GRAV=21.3,JUMP_V=8,DJUMP_V=10;
// Jump is real vertical motion now: first press jumps, a second press in the air double-jumps (once).
function doJump(m){
  if((m.jy||0)>0.05){ if(OPT.dbljump&&!m.dbUsed){ m.vy=DJUMP_V; m.dbUsed=true; const p=m.g.position,ninj=hasPart('ninja'); for(let i=0;i<(ninj?14:6);i++) blobs.spawn(p.x+rand(-0.3,0.3),p.y,p.z+rand(-0.2,0.2),rand(-1,1),rand(-1,0),rand(-1,1),ninj?0.8:0.45,ninj?0.3:0.22,ninj?0.6:0.05,ninj?C(0x757575):WHITE,ninj?C(0x424242):C(0xe0e0e0),C(0x9e9e9e),-1,1.5,false,ninj?2:0); } }
  else { m.vy=JUMP_V; m.dbUsed=false; m.duckT=0; }
}
function squadWave(kind){
  if(mode!=='playing'||!OPT.obstacles||!squad.length) return;
  const hz=headMember().g.position.z,sp=Math.max(4,scroll);
  for(const m of squad){
    const d=Math.max(0,m.g.position.z-hz)/sp;
    if(kind==='jump'){ m.jumpDelay=d; m.duckDelay=-1; }
    else { m.duckDelay=d; m.jumpDelay=-1; }
  }
  if(kind==='jump'){ if((headMember().jy||0)>0.05&&OPT.dbljump) sfx.jump2(); else sfx.jump(); } else sfx.duck();
  tutAct(kind);
}
const squadJump=()=>squadWave('jump'),squadDuck=()=>squadWave('duck');
// Ground pound: ducking in the air does a quick somersault, hanging for POUND_SPIN s, then slams the gubbe down. When the front gubbe lands, a shockwave hits enemies within
// POUND_R and pulls the ones just outside it (up to POUND_PULL) toward him.
const POUND_V=-24,POUND_SPIN=0.22,POUND_R=4.5,POUND_PULL=9;
const poundRing=new THREE.Mesh(G.ring,new THREE.MeshBasicMaterial({color:C(0xfff3c4),transparent:true,depthWrite:false}));
poundRing.rotation.x=Math.PI/2; poundRing.visible=false; scene.add(poundRing);
let poundT=0;
function groundPound(m){
  const p=m.g.position;
  for(let i=0;i<10;i++){ const a=rand(0,6.28); blobs.spawn(p.x,0.1,p.z,Math.cos(a)*rand(1.5,3),rand(0.3,1),Math.sin(a)*rand(1.5,3),rand(0.4,0.7),0.25,0.7,SMOKE1,SMOKE1,SMOKE,-1,2,false,0); }
  if(m!==headMember()){ shake(0.1); return; }
  for(const e of enemies){
    if(e.dead||e.under) continue;
    const q=e.g.position,d=Math.hypot(q.x-p.x,q.z-p.z);
    if(d<POUND_R+e.r){
      const k=1-0.5*Math.min(1,d/POUND_R),dv=e.isBoss?e.maxHp*0.04:Math.min(e.maxHp*0.7,35*DIFF.hp*PF)*k;
      dmgSrc='a:pound'; hitEnemy(e,dv,false,3,m,true); dmgSrc=null;
      if(!e.isBoss&&e.type!=='tank'&&e.type!=='charger') e.kb=Math.min(4,(e.kb||0)+2.2*k);
      e.sq=Math.max(e.sq||0,0.8);
    } else if(d<POUND_PULL&&!e.isBoss) e.pull=1.2;
  }
  for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; chunks.spawn(p.x,0.3,p.z,Math.cos(a)*10,0.8,Math.sin(a)*10,0.4,0.22,0.05,C(0xfff3c4),C(0xffd21f),C(0xffb74d),2,1.5,false,rand(4,10)); }
  poundRing.position.set(p.x,0.15,p.z); poundRing.visible=true; poundT=0;
  shake(0.9); sfx.smack(); sfx.explode(0.9);
}
function updatePound(dt){
  if(!poundRing.visible) return;
  poundT+=dt; const k=poundT/0.35;
  if(k>=1){ poundRing.visible=false; return; }
  const s=0.5+POUND_R*k; poundRing.scale.set(s,s,1.5); poundRing.material.opacity=0.85*(1-k); poundRing.position.z+=scroll*dt;
}
const OBS={wood:mat(0x8d6e63,{r:0.5}),plank:mat(0xffb74d,{r:0.4}),stone:mat(0x9e9e9e,{r:0.6}),barrel:mat(0xef5350,{r:0.3}),band:mat(0x37474f,{r:0.3,m:0.4}),post:mat(0xfff8e6,{r:0.35}),stripe:mat(0xffd21f,{r:0.3}),dark:mat(0x263238,{r:0.3}),laser:mat(0xff1744,{e:1.5})};
function buildObstacle(type,w){
  const g=new THREE.Group(),hw=w/2,v=type==='low'?pick(['fence','rocks','barrels']):type==='tall'?pick(['spikes','stack']):pick(['bar','laser']);
  if(v==='fence'){
    for(let x=-hw;x<=hw+0.01;x+=Math.max(1,w/Math.ceil(w/1.6))) g.add(M(G.box,OBS.wood,[0.16,0.8,0.16],[x,0.4,0]));
    g.add(M(G.box,OBS.plank,[w,0.16,0.1],[0,0.62,0])); g.add(M(G.box,OBS.plank,[w,0.16,0.1],[0,0.3,0]));
  }else if(v==='rocks'){
    for(let x=-hw+0.4;x<=hw-0.3;x+=rand(0.6,0.9)){ const r=rand(0.35,0.5); g.add(M(G.dod,OBS.stone,[r,r*0.9,r],[x,r*0.7,rand(-0.15,0.15)])); }
  }else if(v==='barrels'){
    const roll=new THREE.Group();
    for(let x=-hw+0.5;x<=hw-0.4;x+=1.05){ const b=M(G.cyl,OBS.barrel,[0.38,0.9,0.38],[x,0,0]); b.rotation.z=Math.PI/2; roll.add(b); const s=M(G.cyl,OBS.band,[0.4,0.08,0.4],[x,0,0]); s.rotation.z=Math.PI/2; roll.add(s); }
    roll.position.y=0.38; g.add(roll); g.userData.roll=roll;
  }else if(v==='spikes'){
    g.add(M(G.box,OBS.wood,[w,1.5,0.3],[0,0.75,0]));
    for(let x=-hw+0.3;x<hw;x+=0.9){ g.add(M(G.box,OBS.plank,[0.12,1.6,0.34],[x,0.8,0])); const sp=M(G.cone4,OBS.band,[0.16,0.55,0.16],[x,1.75,0]); g.add(sp); }
    g.add(M(G.box,OBS.stripe,[w,0.14,0.36],[0,1.2,0],false));
  }else if(v==='stack'){
    for(let x=-hw+0.5;x<=hw-0.4;x+=1.05){ for(let k=0;k<2;k++){ const b=M(G.cyl,OBS.barrel,[0.42,0.95,0.42],[x,0.48+k*0.95,0]); g.add(b); g.add(M(G.cyl,OBS.band,[0.44,0.08,0.44],[x,0.48+k*0.95,0])); } }
  }else{
    [-hw,hw].forEach(x=>{ g.add(M(G.box,OBS.post,[0.22,2.4,0.22],[x,1.2,0])); g.add(M(G.box,OBS.dark,[0.4,0.16,0.4],[x,0.08,0])); });
    if(v==='bar'){ g.add(M(G.box,OBS.stripe,[w,0.36,0.3],[0,1.55,0])); for(let x=-hw+0.4;x<hw;x+=0.8) g.add(M(G.box,OBS.dark,[0.3,0.38,0.32],[x,1.55,0],false)); }
    else { g.add(M(G.box,OBS.laser,[w,0.14,0.14],[0,1.45,0],false)); g.add(M(G.box,OBS.laser,[w,0.08,0.08],[0,1.85,0],false)); }
  }
  return g;
}
let obstacles=[],nextObsAt=150,obsHinted={low:false,high:false,tall:false};
function spawnObstacle(type,s,n,z){
  const w=n*LANE_W-0.3,g=buildObstacle(type,w),x=(LANE_X[s]+LANE_X[s+n-1])/2;
  g.position.set(x,0,z); scene.add(g);
  obstacles.push({g,type,x0:x-w/2,x1:x+w/2,z,hit:new Set(),roll:!!g.userData.roll,cleared:0,failed:false,judged:false});
}
function spawnObstacleSet(){
  for(const wl of walls) if(wl.g.position.z<VIEW.spawn+14){ nextObsAt+=20; return; }
  const big=Math.min(0.35,0.1+dist/6000),r=Math.random();
  const n=r<big?3:r<big+0.35?2:1,s=ri(0,LANES-n),tr=Math.random(),type=(OPT.dbljump&&dist>600&&tr<0.22)?'tall':(tr<0.61?'low':'high');
  spawnObstacle(type,s,n,VIEW.spawn);
  if(dist>800&&Math.random()<Math.min(0.45,dist/4000)) spawnObstacle(type==='high'?'low':'high',s,n,VIEW.spawn-8);
}
function updateObstacles(dt){
  const playing=mode==='playing';
  if(playing&&OPT.obstacles&&dist>=nextObsAt){ nextObsAt=dist+Math.max(30,80-dist/50)*rand(0.8,1.3); spawnObstacleSet(); }
  for(const o of obstacles){
    o.z+=(scroll+(o.roll?2.5:0))*dt; o.g.position.z=o.z;
    if(o.roll) o.g.userData.roll.rotation.x-=dt*6;
    if(playing&&!obsHinted[o.type]&&o.z>-16){ obsHinted[o.type]=true; if(!tutWants(o.type==='low'?'jump':o.type==='high'?'duck':'tall')) showHint(o.type==='low'?'Hoppa! Svep upp, W, Space eller pil upp':o.type==='tall'?'Dubbelhopp! Hoppa och hoppa igen i luften':'Ducka! Svep ner, S, pil ner eller Shift'); }
    if(playing) for(const m of squad.slice()){
      if(o.hit.has(m)) continue;
      const p=m.g.position;
      if(Math.abs(o.z-p.z)<0.4&&p.x>o.x0-0.25&&p.x<o.x1+0.25){
        o.hit.add(m);
        const ok=o.type==='low'?p.y>0.45:o.type==='tall'?p.y>1.85:m.duckT>0;
        if(!ok){ o.failed=true; hurtMember(m,15*DIFF.dmg,true); m.hurtT=0.5; fxHit(p.x,o.type==='high'?1.5:0.6,p.z,o.type==='high'?C(0xff1744):C(0x8d6e63)); }
        else { o.cleared++; healMember(m,Math.max(3,Math.round(m.maxHp*0.03))); }
      }
    }
    if(playing&&!o.judged&&o.cleared>0&&squad.length){ let back=-1e9; for(const m of squad) back=Math.max(back,m.g.position.z); if(o.z>back+0.6){ o.judged=true; if(!o.failed){ for(const m of squad) healMember(m,5); toast('Perfekt!'); sfx.clear(); } addFlow(o.failed?1:2); addOD(o.failed?0.04:0.07); } }
    if(o.z>9){ o.dead=true; scene.remove(o.g); }
  }
  obstacles=obstacles.filter(o=>!o.dead);
}
function healMember(m,amt){ const before=m.hp; m.hp=Math.min(m.maxHp,m.hp+amt); const p=m.g.position; if(m.hp>before) pushDmg(p.x,2.4,p.z,'+'+Math.round(m.hp-before),'#36e2b4',false); for(let i=0;i<3;i++) blobs.spawn(p.x+rand(-0.3,0.3),rand(0.6,1.6),p.z,rand(-0.5,0.5),rand(1,2),rand(-0.5,0.5),0.45,0.16,0.04,WHITE,C(0x36e2b4),C(0x1d9a79),-1,1,false,0); }
// Flow: clearing obstacles stacks a short boost (+15 % damage, rate of fire and sideways speed per stack, max 3, 4 s).
const FLOW_COL=C(0xffc23d),OD_COL=C(0xfff6c8);
function addFlow(n){ if(mode!=='playing') return; S.flow=Math.min(3,S.flow+n); S.flowT=4; hudFlow=-1; sfx.flow(); addOD(0.025*n); }
// OVERDRIVE: a meter charged by kills, obstacle clears, Flow and walls; trigger for 6 s of ×3 damage, ×2 fire rate, piercing shots and invulnerability.
const OD_T=6;
function addOD(x){ if(!OPT.overdrive||mode!=='playing'||S.odT>0||S.odLock>0) return; const was=S.od; S.od=Math.min(1,S.od+x); if(was<1&&S.od>=1){ toast('OVERDRIVE redo! Tryck E'); sfx.combo(); } }
function triggerOD(force){
  if(!OPT.overdrive||mode!=='playing'||S.odT>0||(S.od<1&&!force)) return;
  S.od=0; S.odT=OD_T; S.odUsed=true; tutAct('od'); sfx.odStart(); shake(1.2); toast(force?'NÖD-OVERDRIVE!':'OVERDRIVE!',!!force);
  for(const e of enemies){ if(e.dead||e.isBoss||e.under) continue; if(e.g.position.z>-22){ e.kb=Math.min(4,(e.kb||0)+2.6); e.stun=1; e.sq=1; } }
  const p=headMember().g.position; for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; chunks.spawn(p.x,0.6,p.z-0.5,Math.cos(a)*9,rand(1,3),Math.sin(a)*9-3,0.6,0.3,0.08,C(0xffe066),C(0xffc23d),C(0xff8a3d),4,1.2,false,rand(4,10)); }
}
const odK=()=>S.odT>0?3:1, odRate=()=>S.odT>0?2:1;
function updateOD(dt){
  if(S.odT>0){ S.odT-=dt; if(S.odT<=0){ S.odT=0; S.odLock=5; sfx.odEnd(); } }
  else if(S.odLock>0) S.odLock-=dt;
  document.body.classList.toggle('od-on',S.odT>0);
}
const flowK=()=>S.flowT>0?1+0.15*S.flow:1;
function clearObstacles(){ obstacles.forEach(o=>scene.remove(o.g)); obstacles=[]; }

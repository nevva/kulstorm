'use strict';
// ---------- weather runtime: precipitation, hail, lightning, wind debris, heat shimmer
const flash2=$('flash2');
const PRECIP_N=260,RAIN_COL=C(0xbfdfff);
const precipMat=new THREE.MeshBasicMaterial({color:C(0xbfdfff)});
const precip=new THREE.InstancedMesh(G.box,precipMat,PRECIP_N); precip.frustumCulled=false; precip.castShadow=false;
precip.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(precip);
const pdrops=[];
function resetDrop(p,top){ p.x=rand(-17,17); p.y=top?rand(11,17):rand(0,17); p.z=rand(-75,12); }
for(let i=0;i<PRECIP_N;i++){ const p={x:0,y:0,z:0,s:rand(0,6.3)}; resetDrop(p,false); pdrops.push(p); precip.setMatrixAt(i,ZERO); }
const warnMat=new THREE.MeshBasicMaterial({color:C(0xffd21f)}),warnMat2=new THREE.MeshBasicMaterial({color:C(0x8fd3ff)});
const warns=[];
function addWarn(type,x,z,lane){
  let m;
  if(type==='bolt'){ m=new THREE.Mesh(G.strip,warnMat); m.scale.set(LANE_W-0.4,0.05,30); m.position.set(LANE_X[lane],0.08,-16); }
  else { m=new THREE.Mesh(G.ring,warnMat2); m.rotation.x=Math.PI/2; m.scale.set(1.3,1.3,1.3); m.position.set(x,0.1,z); }
  scene.add(m); warns.push({m,type,x,z,lane,t:1});
  if(type==='hail') chunks.spawn(x,15,z,0,-15,0,1.0,0.4,0.4,ICE,ICE,WHITE,0,0,false,rand(2,5));
}
// Storm clouds: before a bolt, a small dark cloud drifts in over the lane and the bolt comes down from it.
// After the strike it rides along with the world, past the camera (fading via cloudFade), and is reused.
const CLOUD_IN=1.2,CLOUD_Y=6.2,CLOUD_Z=-16;
const stormClouds=[];
for(let i=0;i<3;i++){
  const m=new THREE.MeshStandardMaterial({color:C(0x5d6475),roughness:0.95,flatShading:true,transparent:true,emissive:C(0xcfe8ff),emissiveIntensity:0});
  const g=new THREE.Group();
  for(let k=0;k<5;k++){ const r=rand(0.9,1.4); g.add(M(G.ico,m,[r,r*0.6,r],[k*0.9-1.8,rand(-0.15,0.25),rand(-0.5,0.5)],false)); }
  g.visible=false; scene.add(g); stormClouds.push({g,m,state:'idle',lane:0,t:0,fromX:0,glow:0});
}
function stormCloudIn(lane){
  const c=stormClouds.find(q=>q.state==='idle');
  if(!c){ addWarn('bolt',0,0,lane); return; }
  const side=lane===0?-1:lane===LANES-1?1:(Math.random()<0.5?-1:1);
  c.state='in'; c.lane=lane; c.t=0; c.fromX=side*16; c.glow=0;
  c.g.position.set(c.fromX,CLOUD_Y,CLOUD_Z); c.g.visible=true;
}
function updateStormClouds(dt){
  for(const c of stormClouds){
    if(c.state==='idle') continue;
    const p=c.g.position;
    if(c.state==='in'){
      c.t+=dt; const k=smooth(0,1,c.t/CLOUD_IN);
      p.x=lerp(c.fromX,LANE_X[c.lane],k); p.y=CLOUD_Y+Math.sin(c.t*2)*0.15;
      if(c.t>=CLOUD_IN){ c.state='warn'; addWarn('bolt',0,0,c.lane); warns[warns.length-1].cloud=c; }
    } else if(c.state==='warn'){
      c.glow=Math.random()<dt*8?0.9:c.glow*Math.exp(-dt*12);
    } else {
      p.z+=scroll*dt; p.y+=0.4*dt;
      if(p.z>camera.position.z+4){ c.state='idle'; c.g.visible=false; }
    }
    if(c.state==='out') c.glow*=Math.exp(-dt*5);
    c.m.emissiveIntensity=c.glow;
    cloudFade(c.g,c.m);
  }
}
// A jagged bolt from (x1,y1,z1) down to the ground at (x2,z2).
function boltFx(x1,y1,z1,x2,z2){
  const N=4; let px=x1,py=y1,pz=z1;
  for(let i=1;i<=N;i++){
    const k=i/N,j=i<N?0.7:0;
    const nx=lerp(x1,x2,k)+rand(-j,j),ny=lerp(y1,0.1,k),nz=lerp(z1,z2,k)+rand(-j,j);
    zapFx(px,py,pz,nx,ny,nz,0.2); px=nx; py=ny; pz=nz;
  }
}
function setWeather(id,quiet){
  if(!OPT.weather) id='clear';
  if(W.id===id) return;
  W.id=id; W.mix=0; W.hailT=2; W.boltT=3;
  W.wind=id==='storm'?(Math.random()<0.5?-1:1)*rand(4,6):0;
  if(!quiet&&id!=='clear'){ toast('Väder: '+WEATHER[id].name); sfx.zone(); }
  else if(!quiet) toast('Väder: Klart');
}
function rollWeather(){
  if(W.fixed){ setWeather(W.fixed); return; }
  const opts=ZONE_WEATHER[ZONES[zoneIdx].props]||[];
  const list=[['clear',Math.max(1.2,5-dist/400)]].concat(opts.map(o=>[o,1+dist/1500]));
  let tot=0; list.forEach(l=>tot+=l[1]);
  let r=Math.random()*tot,id='clear';
  for(const [k,w] of list){ r-=w; if(r<=0){ id=k; break; } }
  setWeather(id);
}
function weatherZoneCheck(){
  if(W.fixed||W.id==='clear') return;
  const opts=ZONE_WEATHER[ZONES[zoneIdx].props]||[];
  if(opts.indexOf(W.id)<0) rollWeather();
}
function strikeLane(lane,cloud){
  const lx=LANE_X[lane];
  for(let i=0;i<3;i++){
    const z=rand(-28,-4);
    if(cloud){ const p=cloud.g.position; boltFx(p.x+rand(-1,1),p.y-0.5,p.z+rand(-0.5,0.5),lx+rand(-0.5,0.5),z); }
    else zapFx(lx+rand(-1,1),26,z,lx+rand(-0.5,0.5),0.1,z);
    fxExplosion(lx+rand(-1,1),0.4,z,1.1,CYAN);
  }
  if(cloud){ cloud.state='out'; cloud.glow=2; }
  for(const e of enemies){ if(e.dead) continue; const p=e.g.position; if((e.isBoss?laneOf(p.x):e.lane)===lane&&p.z>-30){ const dv=(e.isBoss?0.08:0.45)*e.maxHp; hitEnemy(e,dv,false,3,null); fxDamage(p.x,p.y+e.r,p.z,3); } }
  for(const wl of walls){ if(!wl.dead&&wl.lane===lane&&wl.g.position.z>-30) hitWall(wl,wl.maxHp*0.3,wl.g.position.x,1.2,wl.g.position.z,false,3); }
  if(mode==='playing') for(const m of squad.slice()){ if(laneOf(m.g.position.x)===lane) hurtMember(m,18*DIFF.dmg,true); }
  flash2.classList.add('on'); setTimeout(()=>flash2.classList.remove('on'),70);
  sfx.zap(); sfx.explode(1.6); shake(0.8);
}
function hailImpact(x,z){
  for(let i=0;i<8;i++){ const a=rand(0,6.28),sp=rand(1,4); chunks.spawn(x,0.3,z,Math.cos(a)*sp,rand(2,5),Math.sin(a)*sp,rand(0.4,0.8),0.18,0.08,ICE,WHITE,ICE,16,0.5,true,rand(4,10)); }
  for(const e of enemies){ if(e.dead) continue; const p=e.g.position,dx=p.x-x,dz=p.z-z; if(dx*dx+dz*dz<(1.4+e.r)*(1.4+e.r)){ const dv=Math.min(e.maxHp*0.35,20*DIFF.hp*PF); hitEnemy(e,dv,false,2,null); } }
  if(mode==='playing') for(const m of squad.slice()){ const p=m.g.position,dx=p.x-x,dz=p.z-z; if(dx*dx+dz*dz<1.5) hurtMember(m,8*DIFF.dmg,true); }
  sfx.hit(); shake(0.15);
}
function updateWeather(dt){
  W.mix=Math.min(1,W.mix+dt*0.5);
  const id=W.id,playing=mode==='playing';
  // precipitation
  const rainy=id==='rain'||id==='thunder'||id==='storm',snowy=id==='snow';
  const n=Math.floor((rainy?(id==='storm'?150:PRECIP_N):snowy?200:0)*W.mix);
  if(rainy) precipMat.color.copy(RAIN_COL); else if(snowy) precipMat.color.setRGB(1,1,1);
  for(let i=0;i<PRECIP_N;i++){
    if(i>=n){ precip.setMatrixAt(i,ZERO); continue; }
    const p=pdrops[i];
    if(rainy){ p.y-=24*dt; p.x+=W.wind*1.4*dt; }
    else { p.y-=2.6*dt; p.x+=(W.wind*0.6+Math.sin(time*1.8+p.s)*0.8)*dt; }
    p.z+=scroll*dt;
    if(p.y<0){ if(rainy&&Math.random()<0.12) blobs.spawn(p.x,0.05,p.z,rand(-0.8,0.8),rand(1,2),rand(-0.8,0.8),0.22,0.12,0.03,C(0xbfdfff),C(0xbfdfff),C(0x8fb8d8),12,0.5,true,0); resetDrop(p,true); }
    if(p.z>14||Math.abs(p.x)>18) resetDrop(p,true);
    if(rainy){ tmpQ.setFromEuler(tmpE.set(0,0,-W.wind*0.06)); tmpM.compose(tmpV.set(p.x,p.y,p.z),tmpQ,tmpS.set(0.035,0.6,0.035)); }
    else { tmpQ.setFromEuler(tmpE.set(p.s+time,p.s,0)); tmpM.compose(tmpV.set(p.x,p.y,p.z),tmpQ,tmpS.set(0.13,0.13,0.13)); }
    precip.setMatrixAt(i,tmpM);
  }
  precip.instanceMatrix.needsUpdate=true;
  // ambient fx
  W.fxT-=dt;
  if(W.fxT<=0){
    if(id==='storm'){ W.fxT=0.06; const sx=W.wind>0?-14:14; chunks.spawn(sx,rand(0.5,4),rand(-40,6),W.wind*rand(2.5,4),rand(-0.5,1),0,rand(2.5,3.5),0.16,0.16,pick([C(0x7cb342),C(0x8d6e63),C(0xd7a86e)]),C(0x6d4c41),C(0x4e342e),0.6,0.1,false,rand(4,9)); }
    else if(id==='heat'){ W.fxT=0.08; blobs.spawn(rand(-12,12),0.2,rand(-40,6),0,rand(0.8,1.6),0,rand(1,1.6),0.12,0.04,C(0xffc070),C(0xff8a3d),C(0xffd0a0),-0.5,0.2,false,0); }
    else W.fxT=0.2;
  }
  // hazards
  if(playing&&id==='snow'){ W.hailT-=dt; if(W.hailT<=0){ W.hailT=rand(1.8,3.5); addWarn('hail',rand(-HALF+0.6,HALF-0.6),rand(-24,-3)); } }
  if(playing&&id==='thunder'){ W.boltT-=dt; if(W.boltT<=0){ W.boltT=rand(4,7); stormCloudIn(ri(0,LANES-1)); } }
  for(let i=warns.length-1;i>=0;i--){
    const w=warns[i]; w.t-=dt;
    if(w.type==='hail'){ w.z+=scroll*dt; w.m.position.z=w.z; const s=1.3*(0.6+0.4*w.t); w.m.scale.set(s,s,s); }
    else { w.m.visible=Math.floor(w.t*12)%2===0; }
    if(w.t<=0){ scene.remove(w.m); warns.splice(i,1); if(w.type==='hail') hailImpact(w.x,w.z); else strikeLane(w.lane,w.cloud); }
  }
  updateStormClouds(dt);
  // night headlamp follows the squad
  if(spot.intensity>0.01){ spot.position.set(S.x,4.5,2.5); spot.target.position.set(S.x*0.6,0,-24); }
}
function clearWeatherFx(){ warns.forEach(w=>scene.remove(w.m)); warns.length=0; stormClouds.forEach(c=>{ c.state='idle'; c.g.visible=false; }); }

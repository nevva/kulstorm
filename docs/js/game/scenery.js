'use strict';
// ---------- scenery that reacts: stray shots and blasts hit roadside props, onlookers cheer, and each zone has its own life
// (birds and swinging monkeys, tumbleweeds and a sandworm, neon on the beat, snowmen that watch you, erupting lava pillars).
const glassMat=new THREE.MeshStandardMaterial({color:C(0x1a1f2e),roughness:0.9,flatShading:true});
function eachProp(fn){ for(const t of tiles){ const tz=t.position.z; for(const p of t.userData.props.children) fn(p,p.userData,tz+p.position.z); } }
const propCol=p=>{ let c=null; p.traverse(o=>{ if(!c&&o.material&&o.material.color) c=o.material.color; }); return c||SMOKE1; };
function hitProp(p,u,wz,power){
  const x=p.position.x,col=propCol(p);
  if(u.kind==='barrel'){ if(u.hit) return; u.hit=1; p.visible=false; dmgSrc='x:barrel'; explodeAt(x,0.6,wz,3.6,45*DIFF.hp*PF,45*DIFF.hp*PF,false,null,1); dmgSrc=null; return; }
  if(u.kind==='piggy'){ if(u.hit) return; u.hit=1; p.visible=false; for(let i=0;i<14;i++){ const a=rand(0,6.28); blobs.spawn(x,0.6,wz,Math.cos(a)*rand(1,3),rand(3,6),Math.sin(a)*rand(1,3),0.7,0.14,0.04,WHITE,GOLD,GOLD,-1,1,false,rand(2,5)); } if(OPT.coins&&mode==='playing') collectCoins(ri(6,14)); sfx.combo(); return; }
  if(u.kind==='none') return;
  for(let i=0;i<5+power*4;i++) chunks.spawn(x+rand(-0.5,0.5),rand(0.5,2),wz+rand(-0.5,0.5),-u.side*rand(0,3),rand(2,5),rand(-2,2),rand(0.5,0.9),0.2,0.1,col,col,SMOKE,16,0.5,true,rand(3,9));
  if(u.kind==='building'){
    u.wob=Math.min(1.5,u.wob+0.5*power);
    const w=u.windows&&u.windows.find(m=>m.material!==glassMat);
    if(w){ w.material=glassMat; const q=w.getWorldPosition(new THREE.Vector3()); for(let i=0;i<8;i++) blobs.spawn(q.x,q.y,q.z,rand(-1.5,1.5),rand(0,2),rand(0.5,2.5),0.5,0.08,0.02,WHITE,C(0x9fd8ff),C(0x9fd8ff),-1,1,false,rand(3,8)); sfx.hit(); }
  } else if(!u.fall){ u.fall=0.001; fxSmoke(x,0.3,wz); sfx.smack(); }
  if(u.tree) scareBirds(x,wz);
}
// A shot leaving the road: follow its line to the first prop on that side.
function sceneryShot(d){
  if(!d.vx) return; const side=Math.sign(d.vx); let best=null,bx=1e9;
  eachProp((p,u,wz)=>{ if(u.side!==side||u.kind==='none'||(u.hit&&(u.kind==='barrel'||u.kind==='piggy'))) return; const px=p.position.x,zAt=d.z+(px-d.x)*d.vz/d.vx; if(Math.abs(zAt-wz)<u.r&&Math.abs(px)<bx){ bx=Math.abs(px); best=[p,u,wz]; } });
  if(best) hitProp(best[0],best[1],best[2],1);
}
function sceneryBlast(x,z,radius){ eachProp((p,u,wz)=>{ const dx=p.position.x-x,dz=wz-z,r=radius+u.r+1; if(dx*dx+dz*dz<r*r) hitProp(p,u,wz,2); }); }
// Onlookers: cheer when you score kills, duck while a boss is around, celebrate when it falls.
let cheerT=0,partyT=0,lastKills=0;
function sceneryBoss(arrived){
  if(!arrived){ partyT=4; return; }
  if(ZONES[zoneIdx].props!=='city') return;
  // one or two buildings ahead crumble as the boss stomps in
  const ahead=[]; eachProp((p,u,wz)=>{ if(u.kind==='building'&&u.windows&&wz>-60&&wz<-25&&!u.collapse) ahead.push(p); });
  shuffle(ahead).slice(0,2).forEach(p=>{ p.userData.collapse=0.001; });
}
// Birds burst out of jungle trees.
const birdMat=new THREE.MeshBasicMaterial({color:0x1b1b24}),birds=[];
for(let i=0;i<24;i++){ const b=new THREE.Group(); [-1,1].forEach(k=>{ const w=new THREE.Mesh(G.box,birdMat); w.scale.set(0.3,0.03,0.12); w.position.x=k*0.15; b.add(w); }); b.visible=false; scene.add(b); birds.push({g:b,t:0,vx:0,vy:0,vz:0}); }
let birdCd=0;
function scareBirds(x,z){
  if(birdCd>0) return; birdCd=1.2;
  for(let i=0;i<6;i++){ const b=birds.find(q=>q.t<=0); if(!b) return; b.t=3; b.g.position.set(x+rand(-1,1),rand(2.5,4),z+rand(-1,1)); b.vx=Math.sign(x)*rand(2,4); b.vy=rand(2.5,4); b.vz=rand(-3,-1); b.g.visible=true; }
}
// Desert: tumbleweeds roll across the road, and now and then a sandworm breaches far off.
const tumbleMat=new THREE.MeshStandardMaterial({color:C(0xa1887f),wireframe:true}),tumbles=[];
for(let i=0;i<3;i++){ const m=new THREE.Mesh(G.ico,tumbleMat); m.scale.setScalar(0.55); m.visible=false; scene.add(m); tumbles.push({m,on:false,vx:0}); }
const wormMat=pal(0xc49a5a,{r:0.8}),worm={g:new THREE.Group(),t:-1,segs:[]};
for(let i=0;i<9;i++){ const s=new THREE.Mesh(G.sph,wormMat); s.scale.setScalar(1.3-i*0.08); worm.g.add(s); worm.segs.push(s); }
worm.g.visible=false; scene.add(worm.g);
let tumbleT=4,wormT=20,eruptT=2;
function clearScenery(){ birds.forEach(b=>{ b.t=0; b.g.visible=false; }); tumbles.forEach(t=>{ t.on=false; t.m.visible=false; }); worm.t=-1; worm.g.visible=false; cheerT=partyT=0; lastKills=0; }
function updateScenery(dt){
  const zone=ZONES[zoneIdx].props,playing=mode==='playing',bossOn=!!boss&&!boss.dead;
  if(kills>lastKills){ if(kills-lastKills>=1) cheerT=Math.max(cheerT,0.5); lastKills=kills; }
  cheerT=Math.max(0,cheerT-dt); partyT=Math.max(0,partyT-dt); birdCd=Math.max(0,birdCd-dt);
  const nb=zone==='neon'?music.beat():0;
  if(zone==='neon') neonMats.forEach(m=>m.emissiveIntensity=0.8+2.2*nb);
  blinkMat.emissiveIntensity=Math.sin(time*5)>0?2.5:0.2;
  eachProp((p,u,wz)=>{
    if(u.wob>0){ u.wob=Math.max(0,u.wob-dt*2.5); p.rotation.z=u.side*0.06*u.wob*Math.sin(time*32); }
    if(u.fall>0&&u.fall<1){ u.fall=Math.min(1,u.fall+dt*2.2); p.rotation.z=-u.side*1.35*u.fall*u.fall; }
    if(u.collapse>0&&u.collapse<1){ u.collapse=Math.min(1,u.collapse+dt*0.6); p.position.y=-(u.h||4)*u.collapse; p.rotation.z=u.side*0.15*u.collapse; if(Math.random()<dt*20) fxSmoke(p.position.x+rand(-1,1),0.4,wz+rand(-1,1)); if(u.collapse>=1) p.visible=false; }
    if(u.specs) u.specs.forEach((s,i)=>{ const ph=time*9+i*1.7+p.position.x;
      if(bossOn&&!partyT){ s.position.y+=((u.h||0)-0.45-s.position.y)*Math.min(1,dt*8); s.children[2].rotation.z=s.children[3].rotation.z=0; }
      else{ const jump=partyT>0?Math.abs(Math.sin(ph))*0.5:cheerT>0?Math.abs(Math.sin(ph))*0.25:0; s.position.y=(u.h||0)+jump; const arm=partyT>0||cheerT>0?2.6+Math.sin(ph*1.3)*0.4:0.2; s.children[2].rotation.z=arm; s.children[3].rotation.z=-arm; }
    });
    if(u.swing) u.swing.rotation.z=Math.sin(time*2.2+p.position.x)*0.6;
    if(u.head){ const a=Math.atan2(S.x-p.position.x,-wz); u.head.rotation.y=clamp(a,-1.3,1.3); }
    if(u.ufo){ u.ufo.rotation.y+=dt*2; u.ufo.position.y=(u.uy||0)+Math.sin(time*2+p.position.x)*0.2; }
  });
  // birds
  for(const b of birds){ if(b.t<=0) continue; b.t-=dt; const q=b.g.position; q.x+=b.vx*dt; q.y+=b.vy*dt; q.z+=(b.vz+scroll)*dt; b.g.children[0].rotation.z=Math.sin(time*30+q.x)*0.7; b.g.children[1].rotation.z=-b.g.children[0].rotation.z; if(b.t<=0) b.g.visible=false; }
  if(zone==='jungle'&&playing&&Math.random()<dt*0.08){ const trees=[]; eachProp((p,u,wz)=>{ if(u.tree&&wz>-40&&wz<-10) trees.push([p.position.x,wz]); }); if(trees.length){ const t=pick(trees); scareBirds(t[0],t[1]); } }
  // tumbleweeds
  tumbleT-=dt;
  if(zone==='desert'&&playing&&tumbleT<=0){ tumbleT=rand(5,11); const t=tumbles.find(q=>!q.on); if(t){ const s=Math.random()<0.5?-1:1; t.on=true; t.vx=-s*rand(3,4.5); t.m.position.set(s*(HALF+4),0.55,rand(-40,-18)); t.m.visible=true; } }
  for(const t of tumbles){ if(!t.on) continue; const q=t.m.position; q.x+=t.vx*dt; q.z+=scroll*dt; q.y=0.55+Math.abs(Math.sin(time*7+q.x))*0.35; t.m.rotation.z-=t.vx*dt*1.6; if(Math.abs(q.x)>HALF+6||q.z>6){ t.on=false; t.m.visible=false; } }
  // sandworm
  wormT-=dt;
  if(zone==='desert'&&worm.t<0&&wormT<=0){ wormT=rand(25,45); worm.t=0; worm.side=Math.random()<0.5?-1:1; worm.g.position.set(worm.side*rand(22,30),0,-58); worm.g.visible=true; }
  if(worm.t>=0){
    worm.t+=dt; worm.g.position.z+=scroll*dt*0.5;
    worm.segs.forEach((s,i)=>{ const a=Math.PI*clamp((worm.t-i*0.12)/2.6,0,1); s.position.set(-worm.side*Math.cos(a)*6,Math.sin(a)*5-1.4,0); });
    if(worm.t<0.3||Math.abs(worm.t-2.7)<0.15) for(let i=0;i<2;i++) fxSmoke(worm.g.position.x+rand(-6,6)*0.2-worm.side*(worm.t<1?6:-6),0.2,worm.g.position.z);
    if(worm.t>3.8){ worm.t=-1; worm.g.visible=false; }
  }
  // lava pillars erupt
  eruptT-=dt;
  if(zone==='lava'&&eruptT<=0){ eruptT=rand(1.2,2.6); const ps=[]; eachProp((p,u,wz)=>{ if(u.erupt&&wz>-50&&wz<-4) ps.push([p.position.x,u.erupt,wz]); });
    if(ps.length){ const [x,h,z]=pick(ps); for(let i=0;i<18;i++){ const a=rand(0,6.28),sp=rand(0.5,2.5); blobs.spawn(x,h,z,Math.cos(a)*sp,rand(5,9),Math.sin(a)*sp,rand(0.8,1.3),0.18,0.6,FIRE0,FIRE1,SMOKE2,-1,1.4,false,rand(1,4)); } fxSmoke(x,h,z); } }
}

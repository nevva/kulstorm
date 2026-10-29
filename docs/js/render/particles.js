'use strict';
// ---------- solid particles (fire, smoke, debris): instanced low-poly chunks, no transparency
const tmpM=new THREE.Matrix4(),tmpQ=new THREE.Quaternion(),tmpE=new THREE.Euler(),tmpV=new THREE.Vector3(),tmpS=new THREE.Vector3(),tmpC=new THREE.Color();
class Particles{
  constructor(geo,max,o){
    const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:o.rough||0.5,metalness:0,flatShading:true});
    if(o.glow){
      m.emissive=new THREE.Color(0xffffff); m.emissiveIntensity=o.glow;
      m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;','vec3 totalEmissiveRadiance = emissive * vColor;'); };
    }
    this.mesh=new THREE.InstancedMesh(geo,m,max);
    this.mesh.castShadow=!!o.shadow; this.mesh.receiveShadow=false; this.mesh.frustumCulled=false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for(let i=0;i<max;i++){ this.mesh.setMatrixAt(i,ZERO); this.mesh.setColorAt(i,WHITE); }
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.free=[]; this.alive=[]; this.d=[];
    for(let i=max-1;i>=0;i--) this.free.push(i);
    for(let i=0;i<max;i++) this.d.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,life:1,max:1,s0:1,s1:1,c0:WHITE,c1:WHITE,c2:WHITE,g:0,drag:0,bounce:false,rx:0,ry:0,spin:0});
    scene.add(this.mesh);
  }
  spawn(x,y,z,vx,vy,vz,life,s0,s1,c0,c1,c2,g,drag,bounce,spin){
    const i=this.free.pop(); if(i===undefined) return;
    const d=this.d[i];
    d.x=x; d.y=y; d.z=z; d.vx=vx; d.vy=vy; d.vz=vz; d.life=d.max=life; d.s0=s0; d.s1=s1; d.c0=c0; d.c1=c1; d.c2=c2; d.g=g; d.drag=drag; d.bounce=bounce; d.rx=rand(0,6.3); d.ry=rand(0,6.3); d.spin=spin||0;
    this.alive.push(i);
  }
  update(dt,scrollZ){
    const al=this.alive; let n=0;
    for(let k=0;k<al.length;k++){
      const i=al[k],d=this.d[i];
      d.life-=dt;
      if(d.life<=0){ this.free.push(i); this.mesh.setMatrixAt(i,ZERO); continue; }
      al[n++]=i;
      d.vy-=d.g*dt;
      const dr=Math.max(0,1-d.drag*dt); d.vx*=dr; d.vz*=dr; if(d.g<0) d.vy*=dr;
      d.x+=d.vx*dt; d.y+=d.vy*dt; d.z+=(d.vz+scrollZ)*dt;
      const t=1-d.life/d.max;
      let s=lerp(d.s0,d.s1,t);
      if(t<0.12) s*=t/0.12; else if(t>0.7) s*=(1-t)/0.3;
      if(d.bounce&&d.y<s*0.5){ d.y=s*0.5; d.vy=-d.vy*0.45; d.vx*=0.7; d.vz*=0.7; }
      d.rx+=d.spin*dt; d.ry+=d.spin*0.7*dt;
      if(t<0.45) tmpC.copy(d.c0).lerp(d.c1,t/0.45); else tmpC.copy(d.c1).lerp(d.c2,(t-0.45)/0.55);
      tmpQ.setFromEuler(tmpE.set(d.rx,d.ry,0));
      tmpM.compose(tmpV.set(d.x,d.y,d.z),tmpQ,tmpS.set(s,s,s));
      this.mesh.setMatrixAt(i,tmpM); this.mesh.setColorAt(i,tmpC);
    }
    al.length=n;
    this.mesh.instanceMatrix.needsUpdate=true; this.mesh.instanceColor.needsUpdate=true;
  }
  clear(){ for(const i of this.alive){ this.free.push(i); this.mesh.setMatrixAt(i,ZERO); } this.alive.length=0; this.mesh.instanceMatrix.needsUpdate=true; }
}
const blobs=new Particles(G.part,600,{shadow:true,glow:0.45,rough:0.55});
const chunks=new Particles(G.chunk,420,{shadow:true,rough:0.45});
const FIRE0=C(0xfff3a0),FIRE1=C(0xff7a1a),SMOKE=C(0x4b4b55),SMOKE1=C(0x70707c),SMOKE2=C(0x2a2a33),SPARK=C(0xfff176),PINK=C(0xff5c7a),CYAN=C(0x18ffff),GOLD=C(0xffc83d),ICE=C(0x8fd3ff);
function fxExplosion(x,y,z,size,col){
  const nf=Math.round(8*size)+4;
  for(let i=0;i<nf;i++){
    const a=rand(0,6.28),el=rand(-0.3,1.1),sp=rand(1.5,5)*size,ce=Math.cos(el);
    blobs.spawn(x+rand(-0.3,0.3)*size,y+rand(-0.2,0.2)*size,z+rand(-0.3,0.3)*size,Math.cos(a)*sp*ce,Math.sin(el)*sp+1.5*size,Math.sin(a)*sp*ce,rand(0.5,0.95)*(0.7+size*0.3),0.3*size,1.15*size,FIRE0,FIRE1,SMOKE,-2.2,2.6,false,rand(1,4));
  }
  const ns=Math.round(3*size);
  for(let i=0;i<ns;i++){
    const a=rand(0,6.28),sp=rand(0.5,1.5)*size;
    blobs.spawn(x,y+0.3*size,z,Math.cos(a)*sp,rand(1.5,3)*size,Math.sin(a)*sp,rand(1,1.5),0.45*size,1.6*size,SMOKE1,SMOKE,SMOKE2,-1.5,2,false,rand(0.5,2));
  }
  const dark=col?col.clone().multiplyScalar(0.45):SMOKE2;
  const nd=Math.round(7*size)+3;
  for(let i=0;i<nd;i++){
    const a=rand(0,6.28),sp=rand(2,7)*size;
    chunks.spawn(x,y,z,Math.cos(a)*sp,rand(3,9)*size,Math.sin(a)*sp,rand(0.7,1.4),0.26*size,0.16*size,col||SMOKE,col||SMOKE,dark,18,0.6,true,rand(4,12));
  }
}
function fxHit(x,y,z,col){
  for(let i=0;i<3;i++){ const a=rand(0,6.28),sp=rand(1.5,4); chunks.spawn(x,y,z,Math.cos(a)*sp,rand(2,5),Math.sin(a)*sp-2,rand(0.3,0.6),0.16,0.08,col,col,col,16,0.5,true,rand(4,10)); }
}
function fxSpark(x,y,z,col){
  blobs.spawn(x+rand(-0.1,0.1),y+rand(-0.1,0.1),z,rand(-1.5,1.5),rand(0.5,2.5),rand(-1,1),rand(0.12,0.22),0.3,0.05,WHITE,col,col,0,0,false,0);
}
function fxMuzzle(x,y,z,col){
  blobs.spawn(x,y,z-0.1,0,0,-3,0.07,0.42,0.1,WHITE,col,col,0,0,false,0);
}
function fxSmoke(x,y,z){
  blobs.spawn(x+rand(-0.08,0.08),y,z,rand(-0.4,0.4),rand(0.3,0.9),rand(-0.3,0.3),rand(0.5,0.8),0.22,0.6,SMOKE1,SMOKE,SMOKE2,-1,1.5,false,rand(0.5,2));
}
function fxFlame(x,y,z){
  blobs.spawn(x+rand(-0.2,0.2),y,z+rand(-0.2,0.2),rand(-0.3,0.3),rand(1,2.2),rand(-0.3,0.3),rand(0.3,0.5),0.3,0.45,FIRE0,FIRE1,SMOKE,-2,2,false,rand(1,3));
}
function fxSparkle(x,y,z,col){
  for(let i=0;i<8;i++){ const a=rand(0,6.28),sp=rand(1,3); blobs.spawn(x,y,z,Math.cos(a)*sp,rand(1,4),Math.sin(a)*sp,rand(0.4,0.7),0.22,0.05,WHITE,col,col,-1,1,false,0); }
}
function fxShield(x,y,z){
  for(let i=0;i<14;i++){ const a=i/14*6.28; chunks.spawn(x+Math.cos(a)*0.8,y,z+Math.sin(a)*0.8,Math.cos(a)*5,rand(1,3),Math.sin(a)*5,0.5,0.2,0.05,C(0xffd21f),C(0xffd21f),C(0xff8a00),10,1,false,rand(3,8)); }
}
// Shattering walls: real box pieces that fly, tumble, bounce on the road and ride along with it until they shrink away.
const SHARD_N=72,shards=[];
const shardGroup=new THREE.Group(); scene.add(shardGroup);
for(let i=0;i<SHARD_N;i++){ const m=new THREE.Mesh(G.box,mat(0xffffff)); m.visible=false; m.castShadow=true; shardGroup.add(m); shards.push({m,t:0,life:0,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,sx:1,sy:1,sz:1}); }
function shard(material,x,y,z,sx,sy,sz,cx,cy,cz,force){
  const s=shards.find(q=>q.t>=q.life); if(!s) return;
  s.m.material=material; s.m.visible=true; s.m.position.set(x,y,z); s.m.rotation.set(0,0,0);
  s.sx=sx; s.sy=sy; s.sz=sz; s.m.scale.set(sx,sy,sz);
  s.vx=(x-cx)*rand(1.2,2.4)*force+rand(-1,1); s.vy=(y-cy)*1.2*force+rand(2,5.5); s.vz=-rand(1.5,6)*force+rand(-0.5,0.5);
  s.rx=rand(-8,8); s.ry=rand(-6,6); s.rz=rand(-8,8); s.t=0; s.life=rand(1.6,2.2);
}
// Breaks a wall built by buildWall (panel 3.6 x 2.3, two posts, top beam) at x,z into pieces.
function fxShatter(x,z,panelMat,postMat,force){
  force=force||1;
  const cols=4,rows=3,pw=3.6/cols,ph=2.3/rows;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const k=rand(0.8,1);
    shard(panelMat,x-1.8+pw*(c+0.5)+rand(-0.1,0.1),ph*(r+0.5),z,pw*k,ph*k,0.5*rand(0.7,1),x,1.15,z+0.6,force);
  }
  [-1,1].forEach(s=>{ shard(postMat,x+s*1.8,0.66,z,0.22,1.3,0.62,x,1.15,z+0.6,force); shard(postMat,x+s*1.8,1.98,z,0.22,1.3,0.62,x,1.15,z+0.6,force); });
  shard(postMat,x-0.95,2.54,z,1.9,0.22,0.62,x,1.15,z+0.6,force); shard(postMat,x+0.95,2.54,z,1.9,0.22,0.62,x,1.15,z+0.6,force);
  for(let i=0;i<10;i++) blobs.spawn(x+rand(-1.8,1.8),rand(0.2,1.6),z+rand(-0.3,0.3),rand(-1.5,1.5),rand(0.5,1.8),rand(-1.5,0.5),rand(0.7,1.1),0.4,1.3,SMOKE1,SMOKE1,SMOKE,-1,2,false,rand(0.5,2));
}
function updateShards(dt){
  for(const s of shards){
    if(s.t>=s.life) continue;
    s.t+=dt; const p=s.m.position;
    s.vy-=18*dt; p.x+=s.vx*dt; p.y+=s.vy*dt; p.z+=(s.vz+scroll)*dt;
    const floor=s.sy*0.5;
    if(p.y<floor){ p.y=floor; if(s.vy<0) s.vy*=-0.3; s.vx*=0.6; s.vz*=0.6; s.rx*=0.5; s.ry*=0.5; s.rz*=0.5; }
    s.m.rotation.x+=s.rx*dt; s.m.rotation.y+=s.ry*dt; s.m.rotation.z+=s.rz*dt;
    const k=clamp((s.life-s.t)/0.4,0,1); s.m.scale.set(s.sx*k,s.sy*k,s.sz*k);
    if(s.t>=s.life||p.z>16){ s.t=s.life; s.m.visible=false; }
  }
}
function clearShards(){ for(const s of shards){ s.t=s.life; s.m.visible=false; } }
// Damage feedback: colour and size follow how hard the hit was, relative to that weapon's base damage.
const TIER_COL=[C(0x8fd3ff),C(0xffe14d),C(0xff8a3d),C(0xff3b3b),C(0xff5cf3)],TIER_CSS=['#8fd3ff','#ffe14d','#ff8a3d','#ff3b3b','#ff5cf3'];
function dmgTier(ratio,crit){ if(crit) return 4; if(ratio<0.85) return 0; if(ratio<1.1) return 1; if(ratio<1.5) return 2; return 3; }
function fxDamage(x,y,z,tier){
  if(!OPT.hitcolors){ fxSpark(x,y,z,SPARK); return; }
  const col=TIER_COL[tier];
  if(tier===4){
    for(let i=0;i<10;i++){ const a=i/10*6.28; chunks.spawn(x,y,z,Math.cos(a)*5,1.5,Math.sin(a)*5,0.45,0.2,0.06,col,col,col,6,1.2,false,rand(4,10)); }
    for(let i=0;i<5;i++) blobs.spawn(x,y,z,rand(-2,2),rand(1,4),rand(-2,2),0.3,0.5,0.1,WHITE,col,col,0,0.5,false,0);
  }else{
    const n=2+tier,s=0.18+0.06*tier;
    for(let i=0;i<n;i++) blobs.spawn(x+rand(-0.1,0.1),y+rand(-0.1,0.1),z,rand(-2,2),rand(1,3.5),rand(-1.5,1.5),rand(0.15,0.3),s,0.04,WHITE,col,col,4,0.3,false,0);
  }
}
const dmgLayer=$('dmgs'),dmgPool=[],dmgLive=[];
for(let i=0;i<40;i++){ const el=document.createElement('div'); el.className='dmg'; el.hidden=true; dmgLayer.appendChild(el); dmgPool.push(el); }
// sub: optional smaller second line under the text; life: seconds on screen (default 0.75)
function pushDmg(x,y,z,text,css,big,force,sub,life){
  if(!OPT.numbers&&!force) return;
  const el=dmgPool.pop(); if(!el) return;
  el.hidden=false; el.textContent=text; if(sub){ const s=document.createElement('small'); s.textContent=sub; el.appendChild(s); } el.style.color=css; el.style.opacity='1'; el.classList.toggle('big',!!big);
  life=life||0.75; dmgLive.push({el,x,y,z,life,max:life,vx:life>1?0:rand(-0.6,0.6)});
}
// A message that floats up from an enemy, like the hit numbers but readable for longer.
function sayAt(x,y,z,text,css,sub){ pushDmg(x,y,z,text,css||'#fff',true,true,sub,1.8); }
function updateDmg(dt){
  const w=window.innerWidth,h=window.innerHeight;
  for(let i=dmgLive.length-1;i>=0;i--){
    const n=dmgLive[i]; n.life-=dt;
    if(n.life<=0){ n.el.hidden=true; dmgPool.push(n.el); dmgLive.splice(i,1); continue; }
    n.y+=1.4*dt; n.x+=n.vx*dt; n.z+=scroll*dt;
    tmpV.set(n.x,n.y-curveDrop(n.x,n.z),n.z).project(camera);
    if(tmpV.z>1){ n.el.style.opacity='0'; continue; }
    const t=n.life/n.max;
    n.el.style.opacity=String(t<0.4?t/0.4:1);
    n.el.style.transform='translate(-50%,-50%) translate('+((tmpV.x+1)/2*w).toFixed(1)+'px,'+((1-tmpV.y)/2*h).toFixed(1)+'px)';
  }
}
function clearDmg(){ dmgLive.forEach(n=>{ n.el.hidden=true; dmgPool.push(n.el); }); dmgLive.length=0; }
// Chain-lightning bolts: a few solid white bars flashed between two points.
const zaps=[]; const zapMat=new THREE.MeshBasicMaterial({color:0xffffff});
for(let i=0;i<20;i++){ const b=new THREE.Mesh(G.box,zapMat); b.visible=false; scene.add(b); zaps.push({m:b,t:0}); }
const zA=new THREE.Vector3(),zB=new THREE.Vector3();
function zapFx(x1,y1,z1,x2,y2,z2,life){
  const z=zaps.find(q=>q.t<=0)||zaps[0];
  zA.set(x1,y1,z1); zB.set(x2,y2,z2);
  const len=zA.distanceTo(zB); z.m.position.copy(zA).lerp(zB,0.5); z.m.lookAt(zB); z.m.scale.set(0.09,0.09,len); z.m.visible=true; z.t=life||0.09;
  for(let i=0;i<4;i++){ const p=zA.clone().lerp(zB,i/3); blobs.spawn(p.x,p.y,p.z,rand(-1,1),rand(1,2),rand(-1,1),0.2,0.25,0.05,WHITE,CYAN,CYAN,0,0,false,0); }
}
function updateZaps(dt){ for(const z of zaps){ if(z.t>0){ z.t-=dt; z.m.position.z+=scroll*dt; if(z.t<=0) z.m.visible=false; } } }
// Blob shadows: a soft dark disc on the road under every gubbe, enemy and unicorn, shrinking as they leave the ground.
// They show day and night and make jumps easy to read; the sun's real shadows still fall as before.
const BLOB_SHADOW_N=220;
const blobShadowTex=(function(){
  const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(0.55,'rgba(0,0,0,.7)'); gr.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c);
})();
const blobShadows=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:blobShadowTex,color:0x000000,transparent:true,opacity:0.42,depthWrite:false}),BLOB_SHADOW_N);
blobShadows.frustumCulled=false; blobShadows.renderOrder=-1; scene.add(blobShadows);
const blobM=new THREE.Matrix4(),blobS=new THREE.Vector3(),blobP=new THREE.Vector3(),blobQ=new THREE.Quaternion();
function updateBlobShadows(){
  let n=0;
  const put=(x,z,r,h)=>{ if(n>=BLOB_SHADOW_N) return; const k=clamp(1-h*0.18,0.3,1),s=r*2*k; blobM.compose(blobP.set(x,0.04,z),blobQ,blobS.set(s,1,s*0.8)); blobShadows.setMatrixAt(n++,blobM); };
  for(const m of squad){ if(m.dead||!m.g.visible) continue; const p=m.g.position; put(p.x,p.z,0.42*m.g.scale.x,m.jy||0); }
  for(const e of enemies){ if(e.dead||e.under||!e.g.visible) continue; const p=e.g.position; put(p.x,p.z,e.r*(e.isBoss?0.9:1.05),p.y); }
  for(const u of unicorns){ const p=u.g.position; put(p.x,p.z,0.7,Math.max(0,p.y)); }
  blobShadows.count=n; blobShadows.instanceMatrix.needsUpdate=true;
}

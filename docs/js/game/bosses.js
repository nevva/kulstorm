'use strict';
// ---------- bosses: one every 600 m, a different kind each time (never the same twice in a row).
// Shared rules use e.isBoss (no knockback, heart and coin rain on death); each kind has a look (build*) and an attack loop (BOSS_AI).
// Lane attacks are telegraphed with a flashing strip so the player can dodge into another lane.
const BOSS_Z=-9,BOSS_TYPES=['boss','snake','hydra','spider','golem','mech','wraith','plant'];
const VENOM=C(0x76ff03),FIREB=C(0xff8a1f),WEB=C(0xeeeeee),ROCK=C(0xffb74d),MISSILE=C(0xff6d00),SOUL=C(0x69f0ae);
let bossForce=null,lastBoss=null;
function pickBoss(){
  if(bossForce) return bossForce;
  let t; do{ t=pick(BOSS_TYPES); }while(t===lastBoss);
  return lastBoss=t;
}

// The troll king: the original boss, fans of shots and aimed bursts.
function buildBoss(){
  const g=new THREE.Group(),m=matV(0x8e24aa),dark=mat(0x4a148c),gold=mat(0xffd21f,{r:0.25,m:0.6}),horn=mat(0xfff3d0,{r:0.3});
  g.add(M(G.box,m,[3.2,2.8,2.2],[0,2.0,0])); g.add(M(G.dod,m,[1.1,1.0,1.1],[0,3.9,0.4]));
  g.add(M(G.cyl,gold,[0.75,0.3,0.75],[0,4.85,0.4]));
  for(let i=0;i<6;i++){ const a=i/6*6.28; g.add(M(G.cone,gold,[0.16,0.5,0.16],[Math.cos(a)*0.65,5.15,0.4+Math.sin(a)*0.65])); }
  [-1,1].forEach(s=>{ const h=M(G.cone,horn,[0.3,1.1,0.3],[s*1.4,3.9,0]); h.rotation.z=-s*0.7; g.add(h); g.add(M(G.sph,m,[0.72,0.72,0.72],[s*2.15,1.6,0.6])); });
  const legL=new THREE.Group(),legR=new THREE.Group(); legL.position.set(-0.9,1.0,0); legR.position.set(0.9,1.0,0);
  [legL,legR].forEach(l=>{ l.add(M(G.box,dark,[0.9,1.0,0.9],[0,-0.5,0])); g.add(l); });
  eyes(g,4.0,1.2,0.24,0.42,mat(0xff1744,{e:1}));
  g.userData={mats:[m],legL,legR}; return g;
}
// The giant snake: a long body that weaves across all lanes, spits venom and strikes down a lane.
function buildSnake(){
  const g=new THREE.Group(),m=matV(0x43a047),belly=matV(0xd4e157),dark=mat(0x1b5e20),fang=mat(0xfff8e1,{r:0.3});
  const segs=[];
  for(let i=0;i<16;i++){ const s=1.0-i*0.045; const sg=M(G.sph,i%3===2?belly:m,[s,s*0.85,s*1.1],[0,s*0.8,-(i+1)*0.85]); g.add(sg); segs.push(sg); }
  const head=new THREE.Group(); head.position.set(0,1.3,0.4); g.add(head);
  head.add(M(G.box,m,[1.5,0.8,1.6],[0,0,0.2])); head.add(M(G.box,dark,[1.3,0.25,1.2],[0,0.45,0.1]));
  const jaw=new THREE.Group(); jaw.position.set(0,-0.35,-0.4); head.add(jaw); jaw.add(M(G.box,belly,[1.3,0.3,1.4],[0,-0.1,0.65]));
  [-1,1].forEach(s=>{ const f=M(G.cone,fang,[0.1,0.35,0.1],[s*0.4,-0.4,0.85]); f.rotation.x=Math.PI; head.add(f); });
  const tongue=new THREE.Group(); tongue.position.set(0,-0.2,1.0); head.add(tongue);
  tongue.add(M(G.box,mat(0xe53935),[0.1,0.05,0.7],[0,0,0.35],false));
  eyes(head,0.25,0.95,0.16,0.42,mat(0xffd21f,{e:1.2}));
  g.userData={mats:[m,belly],segs,head,jaw,tongue}; return g;
}
// The three-headed dragon: each head breathes fire; heads fall off at 2/3 and 1/3 hp and the rest get angrier.
function buildHydra(){
  const g=new THREE.Group(),m=matV(0xc62828),belly=matV(0xffb300),dark=mat(0x4a0d0d),horn=mat(0xfff3d0,{r:0.3}),wingM=mat(0x7f1d1d,{r:0.5});
  g.add(M(G.ico,m,[2.0,1.6,2.2],[0,2.0,-0.4])); g.add(M(G.ico,belly,[1.4,1.1,0.9],[0,1.8,0.9]));
  const legL=new THREE.Group(),legR=new THREE.Group(); legL.position.set(-1.1,1.1,0.4); legR.position.set(1.1,1.1,0.4);
  [legL,legR].forEach(l=>{ l.add(M(G.box,dark,[0.7,1.1,0.8],[0,-0.55,0])); l.add(M(G.box,horn,[0.75,0.15,0.3],[0,-1.05,0.45])); g.add(l); });
  const wings=[-1,1].map(s=>{ const w=new THREE.Group(); w.position.set(s*1.4,3.0,-0.8); w.add(M(G.box,wingM,[2.6,0.08,1.6],[s*1.3,0,0])); w.add(M(G.box,dark,[2.8,0.16,0.16],[s*1.4,0.05,0.75])); g.add(w); return w; });
  for(let i=0;i<5;i++){ const t=M(G.cone,i%2?belly:m,[0.55-i*0.09,0.9,0.55-i*0.09],[0,1.4-i*0.18,-2.4-i*0.75]); t.rotation.x=-Math.PI/2; g.add(t); }
  const heads=[[-1.8,3.9,1.5],[0,4.7,1.8],[1.8,3.9,1.5]].map((base,i)=>{
    const sh=[(i-1)*0.9,2.8,0.9],grp=new THREE.Group(); grp.position.set(base[0],base[1],base[2]); g.add(grp);
    const hm=matV(0xc62828);
    grp.add(M(G.box,hm,[0.8,0.7,0.8],[0,0,0])); grp.add(M(G.box,hm,[0.6,0.4,0.7],[0,-0.1,0.65])); grp.add(M(G.box,belly,[0.55,0.15,0.6],[0,-0.32,0.6]));
    [-1,1].forEach(s=>{ const h=M(G.cone,horn,[0.1,0.5,0.1],[s*0.25,0.5,-0.2]); h.rotation.x=-0.6; grp.add(h); });
    eyes(grp,0.15,0.4,0.1,0.22,mat(0xffd21f,{e:1.4}));
    const neck=[]; for(let k=0;k<4;k++){ const n=M(G.sph,k%2?belly:hm,[0.42,0.42,0.42],[0,0,0]); g.add(n); neck.push(n); }
    return {grp,neck,base,sh,mat:hm};
  });
  g.userData={mats:[m,belly].concat(heads.map(h=>h.mat)),legL,legR,wings,heads}; return g;
}
// The spider queen: skitters and leaps around, shoots webs and hatches spiderlings.
function buildSpider(){
  const g=new THREE.Group(),m=matV(0x4a2a6a),dark=mat(0x1a1026),mark=mat(0xff1744,{e:0.8});
  const body=new THREE.Group(); g.add(body);
  body.add(M(G.sph,m,[1.6,1.3,1.9],[0,2.0,-1.6])); body.add(M(G.box,mark,[0.5,0.08,0.9],[0,3.25,-1.6],false));
  body.add(M(G.sph,m,[1.0,0.85,1.0],[0,1.8,0.6]));
  [[-0.25,2.2,1.5],[0.25,2.2,1.5],[-0.45,2.0,1.45],[0.45,2.0,1.45],[-0.15,2.45,1.35],[0.15,2.45,1.35]].forEach(q=>body.add(M(G.sph,mat(0xff1744,{e:1.6}),[0.11,0.11,0.11],q,false)));
  [-1,1].forEach(s=>{ const f=M(G.cone,dark,[0.12,0.5,0.12],[s*0.25,1.35,1.4]); f.rotation.x=Math.PI; body.add(f); });
  const legs=[];
  for(let i=0;i<4;i++) [-1,1].forEach(s=>{
    const l=new THREE.Group(); l.position.set(s*0.8,2.0,0.9-i*0.55); l.rotation.y=s*(0.5-i*0.35); body.add(l);
    const up=M(G.box,dark,[1.7,0.18,0.18],[s*0.85,0.5,0]); up.rotation.z=s*0.6; l.add(up);
    const lo=M(G.box,dark,[0.16,2.0,0.16],[s*1.75,0,0]); lo.rotation.z=-s*0.25; l.add(lo);
    l.userData.s=s; legs.push(l);
  });
  g.userData={mats:[m],body,legs}; return g;
}
// The stone golem: slow and heavy, slams lanes with its fists and hurls rocks; below half hp it quakes all but one lane.
function buildGolem(){
  const g=new THREE.Group(),m=matV(0x78909c,{r:0.9}),dark=mat(0x455a64,{r:0.9}),lava=mat(0xff8a1f,{e:1.3}),moss=mat(0x689f38,{r:0.9});
  const body=new THREE.Group(); g.add(body);
  body.add(M(G.dod,m,[2.0,1.8,1.5],[0,2.6,0])); body.add(M(G.box,moss,[1.6,0.25,1.2],[0,4.1,-0.2]));
  body.add(M(G.box,lava,[0.12,1.6,0.05],[0.3,2.6,1.45],false)); body.add(M(G.box,lava,[0.9,0.1,0.05],[-0.3,2.2,1.45],false));
  const head=M(G.box,m,[1.0,0.8,0.9],[0,4.4,0.5]); body.add(head);
  [-1,1].forEach(s=>body.add(M(G.box,lava,[0.22,0.12,0.05],[s*0.25,4.5,0.96],false)));
  const arms=[-1,1].map(s=>{ const a=new THREE.Group(); a.position.set(s*2.3,3.4,0.2); body.add(a); a.add(M(G.box,dark,[0.8,1.6,0.8],[0,-0.8,0])); a.add(M(G.dod,m,[0.85,0.85,0.85],[0,-1.9,0.1])); return a; });
  const legL=new THREE.Group(),legR=new THREE.Group(); legL.position.set(-0.9,1.1,0); legR.position.set(0.9,1.1,0);
  [legL,legR].forEach(l=>{ l.add(M(G.box,dark,[1.0,1.1,1.0],[0,-0.55,0])); g.add(l); });
  g.userData={mats:[m],body,arms,legL,legR}; return g;
}
// The war machine: a robot on treads. Twin cannon bursts, missile pods, and a laser that sweeps lane by lane.
function buildMech(){
  const g=new THREE.Group(),m=matV(0x607d8b,{r:0.4,m:0.4}),dark=mat(0x263238,{r:0.4,m:0.4}),red=mat(0xff1744,{e:1.4}),yel=mat(0xffd21f,{r:0.3});
  const body=new THREE.Group(); g.add(body);
  body.add(M(G.box,m,[2.6,2.0,1.8],[0,2.5,0])); body.add(M(G.box,yel,[2.62,0.18,1.82],[0,1.6,0],false));
  body.add(M(G.sph,m,[0.85,0.7,0.85],[0,3.75,0.1])); body.add(M(G.box,red,[1.0,0.18,0.1],[0,3.8,0.85],false));
  [-1,1].forEach(s=>{ body.add(M(G.box,dark,[0.8,0.6,1.4],[s*1.6,3.75,-0.1])); for(let i=0;i<2;i++) body.add(M(G.cyl,yel,[0.12,0.1,0.12],[s*1.6+(i?0.18:-0.18),3.85,0.62],false)); });
  const arms=[-1,1].map(s=>{ const a=new THREE.Group(); a.position.set(s*1.75,2.6,0.2); a.add(M(G.box,dark,[0.6,0.6,0.6],[0,0,0])); const c=M(G.cyl,m,[0.22,1.4,0.22],[0,-0.1,0.7]); c.rotation.x=Math.PI/2; a.add(c); body.add(a); return a; });
  [-1,1].forEach(s=>g.add(M(G.box,dark,[0.8,0.9,2.4],[s*1.1,0.45,0])));
  g.userData={mats:[m],body,arms}; return g;
}
// The wraith queen: a floating crowned ghost that teleports between lanes, fires slow soul orbs and summons ghosts.
function buildWraith(){
  const g=new THREE.Group(),m=matV(0x4a148c,{r:0.5}),pale=matV(0xe1bee7,{r:0.4}),gold=mat(0xffd21f,{r:0.25,m:0.6}),soul=mat(0x69f0ae,{e:1.4});
  [m,pale].forEach(x=>{ x.transparent=true; x.opacity=0.92; });
  const body=new THREE.Group(); g.add(body);
  const cloak=M(G.cone,m,[1.5,3.2,1.5],[0,1.9,0]); cloak.rotation.x=Math.PI; body.add(cloak);
  body.add(M(G.sph,pale,[0.62,0.68,0.62],[0,3.75,0.1])); body.add(M(G.sph,m,[0.75,0.75,0.75],[0,3.85,-0.12]));
  for(let i=0;i<5;i++){ const a=i/5*6.28; body.add(M(G.cone,gold,[0.1,0.35,0.1],[Math.cos(a)*0.45,4.55,0.1+Math.sin(a)*0.45])); }
  const hands=[-1,1].map(s=>{ const h=M(G.sph,soul,[0.3,0.3,0.3],[s*1.5,2.6,0.6],false); body.add(h); return h; });
  eyes(body,3.8,0.62,0.16,0.22,mat(0x69f0ae,{e:1.5}));
  g.userData={mats:[m,pale],body,hands}; return g;
}
// The thorn bloom: a giant flower rooted in the road. Sends roots burrowing under the squad that burst into thorns,
// lobs pollen bombs, spits seeds and slams a vine down a lane.
function buildPlant(){
  const g=new THREE.Group(),stem=matV(0x388e3c,{r:0.6}),petal=matV(0xec407a,{r:0.5}),core=mat(0xffd21f,{r:0.4,e:0.3}),leaf=mat(0x66bb6a,{r:0.6}),dark=mat(0x1b5e20,{r:0.7});
  [-1,0,1].forEach(s=>{ const r=M(G.cyl,dark,[0.25,0.5,0.25],[s*0.9,0.2,s?0.3:-0.2]); r.rotation.z=s*0.6; g.add(r); });
  g.add(M(G.cyl,stem,[0.45,2.6,0.45],[0,1.5,0]));
  [-1,1].forEach(s=>{ const l=M(G.sph,leaf,[1.0,0.12,0.45],[s*0.95,1.4,0.1]); l.rotation.z=s*0.35; g.add(l); });
  const head=new THREE.Group(); head.position.set(0,3.2,0.2); g.add(head);
  for(let i=0;i<8;i++){ const a=i/8*6.28,pt=M(G.sph,petal,[0.75,0.32,0.5],[Math.cos(a)*1.0,Math.sin(a)*1.0,0]); pt.rotation.z=a; head.add(pt); }
  head.add(M(G.sph,core,[0.8,0.8,0.5],[0,0,0.2]));
  head.add(M(G.sph,dark,[0.45,0.28,0.2],[0,-0.25,0.55],false));
  eyes(head,0.25,0.62,0.16,0.3,mat(0x1b5e20,{r:0.3}));
  const vines=[-1,1].map(s=>{ const v=new THREE.Group(); v.position.set(s*0.5,2.2,0); const c=M(G.cyl,stem,[0.14,1.8,0.14],[0,0.9,0]); v.add(c); v.add(M(G.sph,leaf,[0.3,0.12,0.2],[0,1.8,0])); v.rotation.z=s*0.9; g.add(v); return v; });
  g.userData={mats:[stem,petal],head,vines}; return g;
}
Object.assign(ENEMY_BUILD,{plant:buildPlant,boss:buildBoss,snake:buildSnake,hydra:buildHydra,spider:buildSpider,golem:buildGolem,mech:buildMech,wraith:buildWraith});
BOSS_TYPES.forEach(k=>{ ENEMY[k].build=ENEMY_BUILD[k]; });

// ---------- shared boss helpers
const bossWarns=[];
function laneWarn(lane,t,col){
  const m=new THREE.Mesh(G.strip,new THREE.MeshBasicMaterial({color:col||0xff1744,transparent:true,opacity:0.2,depthWrite:false}));
  m.scale.set(LANE_W-0.4,0.04,12); m.position.set(LANE_X[lane],0.07,-2); scene.add(m); bossWarns.push({m,t,t0:t});
}
// Shot tells: before a boss shoots, an orb charges at the muzzle and flashing lines on the road show where each shot will go.
// The aim locks when the tell starts, so stepping out of the lines dodges the volley.
const TELL=0.6;
const aimAt=(x,z)=>Math.atan2(S.x-x,-z);
const fanAngles=(a0,n,spread)=>Array.from({length:n},(_,k)=>a0+(k-(n-1)/2)*spread);
function shotTell(x,y,z,angles,t,col){
  const glow={color:col,transparent:true,depthWrite:false};
  const orb=new THREE.Mesh(G.sph,new THREE.MeshBasicMaterial(Object.assign({blending:THREE.AdditiveBlending},glow)));
  orb.position.set(x,y,z); scene.add(orb); bossWarns.push({m:orb,t,t0:t,orb:true});
  angles.forEach(a=>{
    const L=(1.5-z)/Math.cos(a),m=new THREE.Mesh(G.strip,new THREE.MeshBasicMaterial(glow));
    m.scale.set(0.35,0.04,L); m.rotation.y=a; m.position.set(x+Math.sin(a)*L/2,0.08,z+Math.cos(a)*L/2); scene.add(m); bossWarns.push({m,t,t0:t});
  });
}
// Tell now, then fire the locked volley after `t` (repeated `reps` times, `gap` apart).
function volley(b,x,y,z,angles,spd,col,t,reps,gap){
  shotTell(x,y,z,angles,t,col);
  for(let r=0;r<(reps||1);r++) b.q.push({t:t+r*(gap||0),fn:()=>{ angles.forEach(a=>fireRaw(x,y,z,Math.sin(a)*spd,Math.cos(a)*spd,col)); sfx.hit(); }});
}
function updateBossFx(dt){
  updateBossAttacks(dt);
  for(let i=bossWarns.length-1;i>=0;i--){
    const w=bossWarns[i],k=1-w.t/w.t0; w.t-=dt;
    if(w.orb){ w.m.scale.setScalar(0.15+0.45*k); w.m.material.opacity=0.35+0.55*k; }
    else w.m.material.opacity=0.12+0.4*k*(0.6+0.4*Math.sin(time*(10+24*k)));
    if(w.t<=0){ scene.remove(w.m); w.m.material.dispose(); bossWarns.splice(i,1); }
  }
}
function clearBossFx(){ bossWarns.forEach(w=>{ scene.remove(w.m); w.m.material.dispose(); }); bossWarns.length=0; clearBossAttacks(); }
// ---------- shared boss attacks that move through the world
// Shockwave: a slow ring rolling out along the ground from a stomp. Jump over it; anyone on the ground when it passes is hit.
// Lob: a ball arcs high and lands slowly on a marked spot. Move off the circle.
// Root: something burrows toward a locked spot (a dirt mound trail), then thorns burst up there. Move off the circle.
const shocks=[],lobs=[],roots=[];
const ringFlat=(col,op)=>{ const m=new THREE.Mesh(G.ring,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false})); m.rotation.x=Math.PI/2; scene.add(m); return m; };
function shockwave(x,z,speed,dmg,col){
  const m=ringFlat(col||0xffb74d,0.85); m.position.set(x,0.15,z);
  shocks.push({m,x,z,r:0.6,speed,dmg,hit:new Set()});
}
function lob(x0,y0,z0,tx,tz,T,dmg,col,radius){
  const ball=new THREE.Mesh(G.sph,mat(col||0xff8a1f,{e:0.8})); ball.scale.setScalar(0.38); scene.add(ball);
  const mark=ringFlat(0xff1744,0.5); mark.position.set(tx,0.07,tz);
  lobs.push({ball,mark,x0,y0,z0,tx,tz,t:T,T,dmg,col:C(col||0xff8a1f),r:radius||1.5}); sfx.jump();
}
function rootStrike(x0,z0,tx,tz,T,dmg){
  const mound=new THREE.Mesh(G.sph,mat(0x5d4037,{r:0.9})); mound.scale.set(0.45,0.2,0.45); scene.add(mound);
  const mark=ringFlat(0x76ff03,0); mark.position.set(tx,0.07,tz);
  roots.push({mound,mark,x0,z0,tx,tz,t:T,T,dmg,spikes:null,st:0});
}
const dz2=(m,x,z)=>{ const p=m.g.position; return (p.x-x)**2+(p.z-z)**2; };
function updateBossAttacks(dt){
  const playing=mode==='playing';
  for(let i=shocks.length-1;i>=0;i--){
    const s=shocks[i]; s.r+=s.speed*dt; s.z+=scroll*dt; s.m.position.z=s.z; s.m.scale.setScalar(s.r); s.m.material.opacity=Math.max(0,0.85-s.r/40);
    if(playing) for(const m of squad.slice()){ if(m.dead||s.hit.has(m)) continue; const d=Math.sqrt(dz2(m,s.x,s.z)); if(Math.abs(d-s.r)<0.45){ s.hit.add(m); if((m.jy||0)<0.35){ hurtMember(m,s.dmg*DIFF.dmg,true); fxHit(m.g.position.x,0.4,m.g.position.z,C(0xffb74d)); } } }
    if(Math.random()<dt*30){ const a=rand(0,6.28); blobs.spawn(s.x+Math.cos(a)*s.r,0.2,s.z+Math.sin(a)*s.r,0,rand(0.5,1.5),0,0.5,0.25,0.4,SMOKE1,SMOKE1,SMOKE,-1,1.5,false,0); }
    if(s.r>32){ scene.remove(s.m); s.m.material.dispose(); shocks.splice(i,1); }
  }
  for(let i=lobs.length-1;i>=0;i--){
    const l=lobs[i]; l.t-=dt; l.tz+=scroll*dt; l.z0+=scroll*dt; const k=1-l.t/l.T;
    l.ball.position.set(l.x0+(l.tx-l.x0)*k,l.y0+(0.3-l.y0)*k+7*Math.sin(Math.PI*k),l.z0+(l.tz-l.z0)*k);
    l.mark.position.z=l.tz; l.mark.scale.setScalar(l.r*(0.35+0.65*k)); l.mark.material.opacity=0.25+0.5*k*(0.6+0.4*Math.sin(time*(8+20*k)));
    if(l.t<=0){
      fxExplosion(l.tx,0.4,l.tz,1.2,l.col); sfx.explode(1.1); shake(0.35);
      if(playing) for(const m of squad.slice()) if(!m.dead&&dz2(m,l.tx,l.tz)<l.r*l.r&&!tryParry(m)) hurtMember(m,l.dmg*DIFF.dmg,true);
      scene.remove(l.ball); scene.remove(l.mark); l.mark.material.dispose(); lobs.splice(i,1);
    }
  }
  for(let i=roots.length-1;i>=0;i--){
    const r=roots[i]; r.t-=dt; r.tz+=scroll*dt; r.z0+=scroll*dt;
    if(r.st===0){
      const k=1-Math.max(0,r.t)/r.T; r.mound.position.set(r.x0+(r.tx-r.x0)*k,0.05,r.z0+(r.tz-r.z0)*k); r.mark.position.z=r.tz;
      r.mark.scale.setScalar(1.1); r.mark.material.opacity=k>0.55?0.35+0.4*Math.sin(time*24):0;
      if(Math.random()<dt*25) blobs.spawn(r.mound.position.x+rand(-0.3,0.3),0.15,r.mound.position.z,rand(-0.5,0.5),rand(0.5,1.5),rand(-0.5,0.5),0.5,0.2,0.4,C(0x8d6e63),C(0x6d4c41),SMOKE,-1,1.5,false,0);
      if(r.t<=0){
        r.st=1; r.t=0.7; scene.remove(r.mound);
        r.spikes=new THREE.Group(); r.spikes.position.set(r.tx,0,r.tz); const th=mat(0x558b2f,{r:0.6}),tip=mat(0xc0ca33,{r:0.5});
        for(let j=0;j<5;j++){ const a=j/5*6.28,rr=j?0.5:0,c=M(G.cone,j%2?tip:th,[0.16,1.4,0.16],[Math.cos(a)*rr,0.7,Math.sin(a)*rr]); c.rotation.z=-Math.cos(a)*rr*0.5; c.rotation.x=Math.sin(a)*rr*0.5; r.spikes.add(c); }
        scene.add(r.spikes); sfx.smack(); shake(0.3);
        if(playing) for(const m of squad.slice()) if(!m.dead&&dz2(m,r.tx,r.tz)<1.2*1.2&&!tryParry(m)){ hurtMember(m,r.dmg*DIFF.dmg,true); pushDmg(m.g.position.x,2.6,m.g.position.z,tl('THORNS!'),'#ff5c7a',true,true); }
      }
    } else {
      r.spikes.position.z=r.tz; const k=r.t/0.7; r.spikes.scale.y=k>0.8?(1-k)*5:Math.min(1,k*2); r.mark.material.opacity=0;
      if(r.t<=0){ scene.remove(r.spikes); scene.remove(r.mark); r.mark.material.dispose(); roots.splice(i,1); }
    }
  }
}
function clearBossAttacks(){
  shocks.forEach(s=>{ scene.remove(s.m); s.m.material.dispose(); }); shocks.length=0;
  lobs.forEach(l=>{ scene.remove(l.ball); scene.remove(l.mark); l.mark.material.dispose(); }); lobs.length=0;
  roots.forEach(r=>{ scene.remove(r.mound); if(r.spikes) scene.remove(r.spikes); scene.remove(r.mark); r.mark.material.dispose(); }); roots.length=0;
}
// Spots near the squad to aim lobs and roots at: each gubbe's position, nudged a little.
const squadSpots=n=>{ const live=squad.filter(m=>!m.dead); return Array.from({length:n},(_,i)=>{ const m=live[i%Math.max(1,live.length)]; const p=m?m.g.position:{x:S.x,z:0}; return [clamp(p.x+rand(-1.2,1.2),-HALF+0.6,HALF-0.6),p.z+rand(-1,1)]; }); };
// Hurt every gubbe standing in the lane.
function laneHit(lane,dmg,label,col){
  let hit=false;
  for(const m of squad.slice()){ const p=m.g.position; if(laneOf(p.x)!==lane) continue; if(tryParry(m)) continue; if(!hit){ hit=true; pushDmg(p.x,2.8,p.z,label,'#ff5c7a',true,true); } hurtMember(m,dmg*DIFF.dmg,true); }
  for(let i=0;i<14;i++) chunks.spawn(LANE_X[lane]+rand(-1.6,1.6),0.2,rand(-6,2),rand(-1,1),rand(3,7),rand(-1,1),rand(0.6,1.1),0.25,0.1,col,col,SMOKE,16,0.5,true,rand(4,10));
  shake(hit?0.8:0.4); sfx.smack();
}
function bossInit(e){
  const u=e.u;
  e.bs={t:0,wt:0,cd:2,n:0,st:'idle',st_t:0,lane:1,lunge:0,hit:false,q:[],tx:0,y:0,heads:3,swing:-1,arm:0};
  if(u.heads) u.heads.forEach(h=>{ h.dead=false; h.grp.visible=true; h.neck.forEach(n=>n.visible=true); });
  if(u.segs) u.segs.forEach(sg=>sg.position.x=0);
}
// Moves the boss in to BOSS_Z, then runs its attack loop. Returns forward speed for updateEnemies.
function updateBoss(e,dt,playing){
  const p=e.g.position,b=e.bs; let fwd=0;
  if(p.z<BOSS_Z) fwd=scroll+3; else { p.z=BOSS_Z; e.hold=true; }
  b.t+=dt;
  for(let i=b.q.length-1;i>=0;i--){ const a=b.q[i]; a.t-=dt; if(a.t<=0){ b.q.splice(i,1); if(playing) a.fn(); } }
  BOSS_AI[e.type](e,dt,b,playing&&e.hold);
  return fwd;
}
function headPos(e,h){ const p=e.g.position,q=h.grp.position; return [p.x+q.x,p.y+q.y,p.z+q.z+0.9]; }

const BOSS_AI={
  plant(e,dt,b,act){
    const p=e.g.position,u=e.u;
    if(e.hold) p.x+=(Math.sin(e.t*0.4)*1.6-p.x)*(1-Math.exp(-dt*1.5));
    u.head.rotation.z=Math.sin(e.t*1.3)*0.15; u.head.rotation.y=Math.sin(e.t*0.9)*0.2;
    u.vines.forEach((v,i)=>{ v.rotation.z=(i?-1:1)*(0.9+Math.sin(e.t*2+i)*0.2)-(b.st==='vine'&&i===b.vineArm?(i?-1:1)*b.arm:0); });
    if(b.st==='vine'){ b.st_t-=dt; b.arm=Math.min(1.6,b.arm+dt*3); if(b.st_t<=0){ b.st='idle'; b.arm=0; b.lanes.forEach(l=>laneHit(l,24,tl('WHIP!'),C(0x66bb6a))); sfx.smack(); } return; }
    if(!act) return;
    b.cd-=dt; if(b.cd>0) return;
    b.n++; const angry=e.hp<e.maxHp*0.5,pat=b.n%4;
    if(pat===1){ // roots burrow toward the squad and burst into thorns
      squadSpots(angry?5:3).forEach(([tx,tz],k)=>b.q.push({t:k*0.25,fn:()=>rootStrike(p.x+rand(-1,1),p.z+1,tx,tz,1.7,20)}));
      sayAt(p.x,5,p.z,tl('Roots!'),'#76ff03',tl('Watch the ground')); sfx.boss(); b.cd=2.6;
    } else if(pat===2){ // pollen bombs lobbed high
      squadSpots(angry?5:4).forEach(([tx,tz],k)=>b.q.push({t:k*0.2,fn:()=>lob(p.x,4,p.z+0.5,tx,tz,2.3,18,0xfff176,1.4)})); b.cd=2.2;
    } else if(pat===3){ // a seed spray
      const z=p.z+1; volley(b,p.x,3,z,fanAngles(aimAt(p.x,z),angry?7:5,0.18),8+DIFF.speed,C(0xc0ca33),TELL); b.cd=1.6;
    } else { // a vine whips down the squad's lane
      const l=laneOf(S.x),lanes=angry?[l,(l+ri(1,2))%3]:[l]; b.st='vine'; b.st_t=1.2; b.arm=0; b.vineArm=S.x<p.x?0:1; b.lanes=lanes; lanes.forEach(x=>laneWarn(x,1.2,0x66bb6a)); b.cd=1.5;
    }
  },
  mech(e,dt,b,act){
    const p=e.g.position,u=e.u;
    if(e.hold) p.x+=(Math.sin(e.t*0.5)*2.2-p.x)*(1-Math.exp(-dt*2));
    u.arms.forEach((a,i)=>{ a.rotation.x=Math.sin(e.t*2+i)*0.08-(b.aimT>0?0.25:0); }); if(b.aimT>0) b.aimT-=dt;
    if(!act) return;
    b.cd-=dt; if(b.cd>0) return;
    b.n++; const angry=e.hp<e.maxHp*0.5,pat=b.n%4;
    if(pat===0&&b.n>3){ // mortar: shells arc up from the pods and drop on marked spots
      squadSpots(angry?5:3).forEach(([tx,tz],k)=>b.q.push({t:k*0.3,fn:()=>lob(p.x+(k%2?1.6:-1.6),3.9,p.z+0.5,tx,tz,2.0,20,0x90a4ae,1.4)})); b.cd=2.2;
    } else if(pat===1){ // twin cannon bursts along locked lines
      [-1,1].forEach(s=>{ const x=p.x+s*1.75,z=p.z+1.6; volley(b,x,2.5,z,[aimAt(x,z)],12+DIFF.speed,EB_COL,TELL,angry?4:3,0.15); }); b.aimT=TELL; b.cd=1.9;
    } else if(pat===2){ // missile pods: a fan from each shoulder
      [-1,1].forEach(s=>{ const x=p.x+s*1.6,z=p.z+0.8; volley(b,x,3.8,z,fanAngles(aimAt(x,z),angry?4:3,0.2),8+DIFF.speed,MISSILE,TELL+0.1); }); b.cd=2.0;
    } else { // laser sweep: lane after lane, so keep moving the way it came from
      const order=Math.random()<0.5?[0,1,2]:[2,1,0],gap=angry?0.35:0.5;
      order.forEach((l,i)=>{ laneWarn(l,1.0+i*gap,0xff1744); b.q.push({t:1.0+i*gap,fn:()=>{ laneHit(l,22,tl('LASER!'),CYAN); for(let z=-6;z<3;z+=1.5) fxSpark(LANE_X[l]+rand(-1.2,1.2),0.4,z,CYAN); }}); });
      sayAt(p.x,5,p.z,tl('Laser sweep!'),'#ff5c7a',tl('Keep moving')); sfx.zap(); b.cd=1.0+2*gap+1.6;
    }
  },
  wraith(e,dt,b,act){
    const p=e.g.position,u=e.u,ms=e.mats;
    p.y=0.6+Math.sin(e.t*2)*0.3; u.body.rotation.y=Math.sin(e.t*0.8)*0.2;
    u.hands.forEach((h,i)=>{ h.position.y=2.6+Math.sin(e.t*3+i*2)*0.25; });
    // teleport: fade out, jump to another spot, fade back in
    if(b.st==='fade'){ b.st_t-=dt; ms.forEach(m=>m.opacity=0.12+0.8*Math.max(0,b.st_t/0.4)); if(b.st_t<=0){ p.x=b.tx; b.st='appear'; b.st_t=0.4; for(let i=0;i<14;i++) blobs.spawn(p.x+rand(-1,1),rand(1,4),p.z+0.5,rand(-1,1),rand(0.5,2),rand(-1,1),0.8,0.3,0.03,WHITE,C(0xce93d8),C(0x4a148c),-1,0,false,0); } return; }
    if(b.st==='appear'){ b.st_t-=dt; ms.forEach(m=>m.opacity=0.92-0.8*Math.max(0,b.st_t/0.4)); if(b.st_t<=0) b.st='idle'; return; }
    if(!act) return;
    b.cd-=dt; if(b.cd>0) return;
    b.n++; const angry=e.hp<e.maxHp*0.5,pat=b.n%3;
    if(pat===1){ // slow soul orbs, easy to read and weave through
      const z=p.z+1; volley(b,p.x,2.4,z,fanAngles(aimAt(p.x,z),angry?9:7,0.2),6+DIFF.speed,SOUL,TELL+0.1); b.cd=angry?1.5:2.0;
    } else if(pat===2){ // summon ghosts in every lane
      for(let i=0;i<(angry?4:3);i++){ const l=i%LANES; pendSpawn.push({t:i*0.2,type:'ghost',lane:l,x:LANE_X[l]+rand(-1,1),z:p.z+2}); }
      sayAt(p.x,5,p.z,tl('Rise!'),'#ce93d8'); b.cd=2.2;
    } else { // vanish and reappear over another lane
      b.st='fade'; b.st_t=0.4; b.tx=clamp(LANE_X[ri(0,LANES-1)]+rand(-0.8,0.8),-3.6,3.6); sfx.zap(); b.cd=angry?0.9:1.4;
    }
  },
  boss(e,dt,b,act){
    const p=e.g.position,u=e.u;
    if(e.hold) p.x=Math.sin(e.t*0.7)*2.6;
    u.legL.rotation.x=Math.sin(e.t*4)*0.35; u.legR.rotation.x=-u.legL.rotation.x;
    if(!act) return;
    e.fireCd-=dt;
    if(e.fireCd<=0){
      e.pattern=(e.pattern+1)%4; const x=p.x,z=p.z+1.4;
      if(e.pattern===3){ sayAt(x,5,p.z,tl('JUMP!'),'#ffb74d',tl('Shockwave')); b.q.push({t:0.7,fn:()=>{ shockwave(p.x,p.z+1.5,6,20,0xce93d8); sfx.explode(1.6); shake(0.7); }}); e.fireCd=2.4; }
      else if(e.pattern<2){ volley(b,x,1.6,z,fanAngles(e.pattern?0.1:0,5,0.2),8,EB_COL,TELL); e.fireCd=1.6; }
      else{ volley(b,x,1.6,z,[aimAt(x,z)],11+DIFF.speed,EB_COL,TELL,3,0.18); e.fireCd=2.4; }
    }
  },
  snake(e,dt,b,act){
    const p=e.g.position,u=e.u;
    const X=t=>Math.sin(t*0.9)*3.6+Math.sin(t*2.3)*0.5;
    if(b.st==='aim'){
      b.st_t-=dt; p.x+=(LANE_X[b.lane]-p.x)*(1-Math.exp(-dt*6)); u.head.rotation.x=-0.3; u.jaw.rotation.x=0.5;
      if(b.st_t<=0){ b.st='strike'; b.st_t=0.6; b.hit=false; sfx.jump(); }
    } else if(b.st==='strike'){
      b.st_t-=dt; const k=Math.sin(Math.PI*clamp(1-b.st_t/0.6,0,1)); b.lunge=k*8; u.head.rotation.x=0.2; u.jaw.rotation.x=0.7*k;
      if(!b.hit&&b.st_t<0.3){ b.hit=true; laneHit(b.lane,24,tl('BITE!'),VENOM); spawnPuddle(b.lane,LANE_X[b.lane],-3); }
      if(b.st_t<=0){ b.st='idle'; b.lunge=0; b.cd=1.4; b.wt=Math.asin(clamp(p.x/4.1,-1,1))/0.9; }
    } else {
      b.wt=(b.wt||0)+dt; const tx=e.hold?X(b.wt):0; p.x+=(tx-p.x)*(1-Math.exp(-dt*4));
      u.head.rotation.x*=Math.exp(-dt*5); u.jaw.rotation.x*=Math.exp(-dt*5);
      if(act){ b.cd-=dt; if(b.cd<=0){ b.n++;
        if(b.n%3===0){ b.st='aim'; b.st_t=1.0; b.lane=laneOf(S.x); laneWarn(b.lane,1.3,0x76ff03); sfx.zap(); }
        else { u.jaw.rotation.x=0.6; const z=p.z+1.5; volley(b,p.x,1.3,z,fanAngles(aimAt(p.x,z),b.n%3===1?3:5,0.22),9+DIFF.speed,VENOM,TELL); b.cd=1.3; }
      } }
    }
    // body follows where the head was, the first segments are dragged along by a strike
    u.head.position.z=0.4+b.lunge; u.head.position.y=1.3+Math.sin(e.t*3)*0.12;
    u.segs.forEach((sg,i)=>{ const lag=(i+1)*0.16; sg.position.x=(e.hold&&b.st==='idle'?X(b.wt-lag):p.x)-p.x+Math.sin(e.t*4-i*0.6)*0.25*Math.min(1,i/3); sg.position.z=-(i+1)*0.85+b.lunge*Math.max(0,1-i/5); });
    u.tongue.scale.z=Math.sin(e.t*9)>0.6?1:0.01;
  },
  hydra(e,dt,b,act){
    const p=e.g.position,u=e.u,hs=u.heads;
    if(e.hold) p.x=Math.sin(e.t*0.5)*2;
    u.legL.rotation.x=Math.sin(e.t*3)*0.25; u.legR.rotation.x=-u.legL.rotation.x;
    u.wings.forEach((w,i)=>{ w.rotation.z=(i?-1:1)*(0.3+Math.sin(e.t*2.5)*0.35); });
    // lose a side head at 2/3 and 1/3 hp
    const want=e.hp>e.maxHp*2/3?3:e.hp>e.maxHp/3?2:1;
    while(b.heads>want){
      const alive=hs.filter((h,i)=>!h.dead&&i!==1),h=alive.length?pick(alive):hs[1]; h.dead=true; b.heads--;
      const q=headPos(e,h); fxExplosion(q[0],q[1],q[2],1.6,FIREB); sfx.explode(2); shake(0.8);
      h.grp.visible=false; h.neck.forEach(n=>n.visible=false); sayAt(q[0],q[1]+1,q[2],b.heads===2?tl('A head fell!'):tl('Only one head left!'),'#ff5c7a',b.heads===2?tl('The dragon is enraged'):'');
    }
    const rage=1+(3-b.heads)*0.35;
    hs.forEach((h,i)=>{
      if(h.dead) return;
      const aimH=b.st==='breath'&&b.who===i,sw=aimH?b.sweep:Math.sin(e.t*1.6+i*2)*0.35;
      h.grp.position.set(h.base[0]+sw*1.2,h.base[1]+Math.sin(e.t*2.2+i)*0.25-(aimH?0.6:0),h.base[2]+(aimH?0.8:0));
      h.grp.rotation.y=sw*0.8; h.grp.rotation.x=aimH?0.35:0;
      const q=h.grp.position; h.neck.forEach((n,k)=>{ const f=(k+1)/5; n.position.set(h.sh[0]+(q.x-h.sh[0])*f,h.sh[1]+(q.y-h.sh[1])*f+Math.sin(Math.PI*f)*0.5,h.sh[2]+(q.z-h.sh[2])*f); });
    });
    if(!act) return;
    const live=hs.map((h,i)=>i).filter(i=>!hs[i].dead);
    if(b.st==='inhale'){ b.st_t-=dt; if(b.st_t<=0){ b.st='breath'; b.st_t=1.8; b.fire=0; } return; }
    if(b.st==='breath'){
      b.st_t-=dt; b.sweep=Math.sin((1-b.st_t/1.8)*Math.PI*2)*0.9; b.fire-=dt;
      if(b.fire<=0){ b.fire=0.07; const h=hs[b.who],q=headPos(e,h); if(!h.dead){ const a=Math.atan2(S.x-q[0],-q[2])*0.3+b.sweep*0.5; fireRaw(q[0],1.4,q[2],Math.sin(a)*10,Math.cos(a)*10,FIREB); fxFlame(q[0],q[1]-0.3,q[2]+0.3); } }
      if(b.st_t<=0){ b.st='idle'; b.cd=1.6/rage; }
      return;
    }
    b.cd-=dt; if(b.cd>0) return;
    b.n++;
    const pat=b.n%4;
    if(pat===3){ // each head lobs a fireball high; they come down slowly on marked spots
      squadSpots(live.length+1).forEach(([tx,tz],k)=>{ const h=hs[live[k%live.length]],q=headPos(e,h); b.q.push({t:k*0.25,fn:()=>{ if(!h.dead) lob(q[0],q[1],q[2],tx,tz,2.2,22,0xff8a1f,1.5); }}); });
      b.cd=2.4/rage;
    } else if(pat===1){ // each head spits a fireball volley in turn
      live.forEach((i,k)=>b.q.push({t:k*0.3,fn:()=>{ const h=hs[i]; if(h.dead) return; const q=headPos(e,h); volley(b,q[0],1.6,q[2],fanAngles(aimAt(q[0],q[2]),3,0.18),9+DIFF.speed,FIREB,TELL); fxFlame(q[0],q[1],q[2]); }}));
      b.cd=2.0/rage;
    } else if(pat===2){ // one head sweeps a stream of fire
      b.st='inhale'; b.st_t=TELL+0.2; b.who=pick(live); b.sweep=0; sfx.zap();
      const q=headPos(e,hs[b.who]); shotTell(q[0],1.4,q[2],fanAngles(aimAt(q[0],q[2])*0.3,3,0.45),b.st_t,FIREB);
    } else { // fire rains on lanes, one more lane per lost head
      const lanes=shuffle([0,1,2]).slice(0,Math.min(2,4-b.heads));
      if(lanes.indexOf(laneOf(S.x))<0) lanes[0]=laneOf(S.x);
      lanes.forEach(l=>{ laneWarn(l,1.3,0xff8a1f); b.q.push({t:1.3,fn:()=>{ laneHit(l,22,tl('FIRE!'),FIREB); for(let z=-6;z<3;z+=1.5) fxFlame(LANE_X[l]+rand(-1.4,1.4),0.4,z); }}); });
      b.cd=2.6/rage;
    }
  },
  spider(e,dt,b,act){
    const p=e.g.position,u=e.u;
    const step=b.st==='leap'?0:Math.sin(e.t*(b.st==='run'?18:6));
    u.legs.forEach((l,i)=>{ l.rotation.x=(i%2?step:-step)*0.25; l.position.y=2.0+Math.max(0,(i%2?step:-step))*0.15; });
    u.body.rotation.z=Math.sin(e.t*5)*0.03;
    if(b.st==='leap'){
      b.st_t-=dt; const k=1-b.st_t/0.8; p.x=b.x0+(b.tx-b.x0)*k; p.y=Math.sin(Math.PI*k)*3.5;
      if(b.st_t<=0){ p.y=0; b.st='idle'; b.cd=1.2; shake(0.7); sfx.explode(1.4);
        for(let i=0;i<12;i++) chunks.spawn(p.x+rand(-1.5,1.5),0.2,p.z+rand(-1,1),rand(-3,3),rand(2,5),rand(-1,3),0.8,0.25,0.1,SMOKE,SMOKE,SMOKE,14,0.5,true,rand(3,8));
        if(act) for(let k2=0;k2<9;k2++){ const a=(k2-4)*0.17; fireRaw(p.x,1,p.z+1.2,Math.sin(a)*8,Math.cos(a)*8,WEB); } }
      return;
    }
    if(e.hold){ if(Math.abs(b.tx-p.x)<0.2&&Math.random()<dt*0.8) b.tx=rand(-3.5,3.5); const d=b.tx-p.x; b.st=Math.abs(d)>0.3?'run':'idle'; p.x+=clamp(d,-1,1)*dt*4; }
    if(!act) return;
    b.cd-=dt; if(b.cd>0) return;
    b.n++;
    const pat=b.n%3;
    if(pat===1){ // web fan, a little slower than bullets so it can be weaved through
      const z=p.z+1.6; volley(b,p.x,1.5,z,fanAngles(aimAt(p.x,z),7,0.16),7+DIFF.speed,WEB,TELL); b.cd=1.6;
    } else if(pat===2){ // hatch spiderlings in every lane
      let alive=0; for(const o of enemies) if(!o.dead&&o.type==='spiderling') alive++;
      const n=Math.max(0,Math.min(e.hp<e.maxHp*0.5?6:4,14-alive));
      for(let i=0;i<n;i++){ const l=i%LANES; pendSpawn.push({t:i*0.12,type:'spiderling',lane:l,x:LANE_X[l]+rand(-1,1),z:p.z+1.5}); }
      for(let i=0;i<10;i++) blobs.spawn(p.x+rand(-1,1),1.5,p.z-1.6,rand(-2,2),rand(1,3),rand(0,2),0.6,0.3,0.05,WHITE,C(0xce93d8),C(0x4a2a6a),-1,1,false,0);
      if(n>0) sayAt(p.x,3.4,p.z,tl('Spiderlings!'),'#ce93d8'); b.cd=2.2;
    } else { // leap to a new spot and land with a web burst
      b.st='leap'; b.st_t=0.8; b.x0=p.x; b.tx=clamp(S.x+rand(-2,2),-3.6,3.6); sfx.jump(); b.cd=99;
      shotTell(b.tx,1,p.z+1.2,fanAngles(0,9,0.17),b.st_t,WEB);
    }
  },
  golem(e,dt,b,act){
    const p=e.g.position,u=e.u;
    if(e.hold) p.x+=(Math.sin(e.t*0.35)*1.8-p.x)*(1-Math.exp(-dt*2));
    u.legL.rotation.x=Math.sin(e.t*2)*0.2; u.legR.rotation.x=-u.legL.rotation.x;
    // arms: rest swing, raised while winding up a slam
    const up=b.st==='wind'||b.st==='pound'; b.arm+=((up?1:0)-b.arm)*(1-Math.exp(-dt*(up?3:14)));
    u.arms.forEach((a,i)=>{ a.rotation.x=-b.arm*2.6+Math.sin(e.t*2+i*3)*0.15; a.rotation.z=(i?-1:1)*b.arm*0.3; });
    u.body.rotation.x=-b.arm*0.15;
    if(b.st==='wind'){ b.st_t-=dt; if(b.st_t<=0){ b.st='idle'; b.cd=1.5; b.lanes.forEach(l=>laneHit(l,26,tl('CRUSH!'),ROCK)); sfx.explode(2); } return; }
    if(b.st==='pound'){ b.st_t-=dt; if(b.st_t<=0){ b.st='idle'; b.cd=1.6; shockwave(p.x,p.z+1.8,5.5,22,0xffb74d); sfx.explode(2); shake(0.9); } return; }
    if(!act) return;
    b.cd-=dt; if(b.cd>0) return;
    b.n++;
    const angry=e.hp<e.maxHp*0.5;
    if(b.n%3===0){ // ground pound: both fists down, a slow shockwave rolls out to jump over
      b.st='pound'; b.st_t=1.0; sayAt(p.x,5,p.z,tl('JUMP!'),'#ffb74d',tl('Shockwave')); sfx.boss();
    } else if(b.n%2===1){ // slam one lane (two when angry), or quake all but one lane
      let lanes=[laneOf(S.x)];
      if(angry&&b.n%4===3){ const safe=ri(0,2); lanes=[0,1,2].filter(l=>l!==safe); sayAt(e.g.position.x,4.6,e.g.position.z,tl('Earthquake!'),'#ff5c7a',tl('Find the safe lane')); }
      else if(angry){ const o=ri(0,1); lanes.push([0,1,2].filter(l=>l!==lanes[0])[o]); }
      b.st='wind'; b.st_t=1.4; b.lanes=lanes; lanes.forEach(l=>laneWarn(l,1.4,0xffb74d)); sfx.boss();
    } else { // hurl a burst of rocks
      for(let k=0;k<(angry?5:3);k++){ const x=p.x+rand(-1,1),z=p.z+1.5; volley(b,x,2.4,z,[aimAt(x,z)],10+DIFF.speed,ROCK,TELL+k*0.22); }
      b.cd=1.8;
    }
  },
};

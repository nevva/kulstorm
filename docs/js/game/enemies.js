'use strict';
// ---------- enemies
function eyes(g,y,z,r,spread,pupil){
  const w=enemyEyeMat,b=pupil||mat(0x111111,{r:0.2});
  [-1,1].forEach(s=>{ g.add(M(G.sph,w,[r,r,r],[s*spread,y,z],false)); g.add(M(G.sph,b,[r*0.5,r*0.5,r*0.5],[s*spread,y,z+r*0.65],false)); });
}
function buildBlob(){ const g=new THREE.Group(),m=matV(0x66bb6a); const body=M(G.ico,m,[0.65,0.55,0.65],[0,0.5,0]); g.add(body); eyes(g,0.65,0.45,0.13,0.22); g.userData={body,mats:[m]}; return g; }
function buildRunner(){
  const g=new THREE.Group(),m=matV(0xff7043),dark=mat(0x4e342e);
  g.add(M(G.box,m,[0.5,0.8,0.4],[0,0.95,0])); g.add(M(G.box,m,[0.46,0.4,0.46],[0,1.6,0]));
  const legL=new THREE.Group(),legR=new THREE.Group(); legL.position.set(-0.15,0.55,0); legR.position.set(0.15,0.55,0);
  [legL,legR].forEach(l=>{ l.add(M(G.box,dark,[0.18,0.5,0.18],[0,-0.25,0])); g.add(l); });
  const arm=M(G.box,m,[0.14,0.5,0.14],[0.38,0.9,0]); arm.rotation.x=-0.6; g.add(arm);
  const arm2=M(G.box,m,[0.14,0.5,0.14],[-0.38,0.9,0]); arm2.rotation.x=0.6; g.add(arm2);
  eyes(g,1.65,0.24,0.09,0.12); g.userData={mats:[m],legL,legR}; return g;
}
function buildTank(){
  const g=new THREE.Group(),m=matV(0x7e57c2),dark=mat(0x311b92),horn=mat(0xfff3d0,{r:0.3});
  g.add(M(G.box,m,[1.6,1.4,1.1],[0,1.0,0])); g.add(M(G.dod,m,[0.55,0.5,0.55],[0,1.95,0.2]));
  [-1,1].forEach(s=>{ const h=M(G.cone,horn,[0.14,0.5,0.14],[s*0.4,2.3,0.2]); h.rotation.z=-s*0.5; g.add(h); g.add(M(G.sph,m,[0.36,0.36,0.36],[s*1.0,0.8,0.35])); });
  const legL=new THREE.Group(),legR=new THREE.Group(); legL.position.set(-0.45,0.6,0); legR.position.set(0.45,0.6,0);
  [legL,legR].forEach(l=>{ l.add(M(G.box,dark,[0.45,0.6,0.45],[0,-0.3,0])); g.add(l); });
  eyes(g,2.0,0.6,0.12,0.2); g.userData={mats:[m],legL,legR}; return g;
}
function buildShooter(){
  const g=new THREE.Group(),m=matV(0xef5350),dark=mat(0x37474f,{r:0.3});
  g.add(M(G.sph,m,[0.55,0.55,0.55],[0,0.65,0]));
  const can=M(G.cyl,dark,[0.14,0.8,0.14],[0,0.6,0.55]); can.rotation.x=Math.PI/2; g.add(can);
  g.add(M(G.cone,dark,[0.32,0.42,0.32],[0,1.35,0]));
  [-1,1].forEach(s=>g.add(M(G.box,dark,[0.18,0.3,0.18],[s*0.22,0.15,0])));
  eyes(g,0.8,0.42,0.1,0.2); g.userData={mats:[m]}; return g;
}
function buildSwarm(){
  const g=new THREE.Group(),m=matV(0xffee58);
  const body=M(G.tet,m,[0.36,0.36,0.36],[0,0.4,0]); g.add(body);
  g.add(M(G.sph,mat(0xffffff,{r:0.2}),[0.12,0.12,0.12],[0,0.45,0.25],false)); g.add(M(G.sph,mat(0x111111,{r:0.2}),[0.06,0.06,0.06],[0,0.45,0.34],false));
  g.userData={mats:[m],body}; return g;
}
function buildSpiderling(){
  const g=new THREE.Group(),m=matV(0x4a2a6a),leg=mat(0x1a1026);
  const body=M(G.sph,m,[0.3,0.22,0.36],[0,0.35,0]); g.add(body);
  const legs=[]; for(let i=0;i<4;i++) [-1,1].forEach(s=>{ const l=M(G.box,leg,[0.5,0.05,0.05],[s*0.3,0.3,0.2-i*0.13],false); l.rotation.z=s*0.5; g.add(l); legs.push(l); });
  [-1,1].forEach(s=>g.add(M(G.sph,mat(0xff1744,{e:1.4}),[0.05,0.05,0.05],[s*0.08,0.42,0.33],false)));
  g.userData={mats:[m],body,legs}; return g;
}
function buildBomber(){
  const g=new THREE.Group(),m=matV(0x37474f,{r:0.22});
  const body=M(G.sph,m,[0.5,0.5,0.5],[0,0.55,0]); g.add(body);
  g.add(M(G.cyl,mat(0xd7ccc8),[0.05,0.35,0.05],[0,1.15,0],false));
  const flame=M(G.sph,mat(0xffab00,{e:1.5}),[0.14,0.18,0.14],[0,1.38,0],false); g.add(flame);
  eyes(g,0.65,0.4,0.11,0.18,mat(0xff1744,{e:0.8})); g.userData={mats:[m],body,flame}; return g;
}
// Night-only enemies
function buildWolf(){
  const g=new THREE.Group(),m=matV(0x3a3f55,{r:0.4}),dark=mat(0x23263a,{r:0.5}),eye=mat(0xffd21f,{e:1.8});
  g.add(M(G.box,m,[0.55,0.5,1.1],[0,0.75,0])); g.add(M(G.box,m,[0.42,0.38,0.5],[0,1.0,0.6])); g.add(M(G.box,dark,[0.22,0.16,0.3],[0,0.92,0.92]));
  [-1,1].forEach(s=>g.add(M(G.cone4,m,[0.1,0.25,0.1],[s*0.13,1.3,0.5])));
  const tail=M(G.box,m,[0.12,0.12,0.5],[0,0.98,-0.72]); tail.rotation.x=-0.6; g.add(tail);
  const legs=[]; [[-0.18,0.35],[0.18,0.35],[-0.18,-0.35],[0.18,-0.35]].forEach(q=>{ const l=new THREE.Group(); l.position.set(q[0],0.55,q[1]); l.add(M(G.box,dark,[0.13,0.5,0.13],[0,-0.25,0])); g.add(l); legs.push(l); });
  [-1,1].forEach(s=>g.add(M(G.sph,eye,[0.065,0.065,0.065],[s*0.12,1.07,0.86],false)));
  g.userData={mats:[m],legs}; return g;
}
function buildBats(){
  const g=new THREE.Group(),m=matV(0x4a2a6a,{r:0.4}),eye=mat(0xff1744,{e:1.6});
  g.add(M(G.sph,m,[0.2,0.22,0.2],[0,0,0]));
  const wl=new THREE.Group(),wr=new THREE.Group(); wl.position.x=-0.12; wr.position.x=0.12;
  wl.add(M(G.box,m,[0.5,0.04,0.28],[-0.25,0,0])); wr.add(M(G.box,m,[0.5,0.04,0.28],[0.25,0,0])); g.add(wl); g.add(wr);
  [-1,1].forEach(s=>{ g.add(M(G.cone4,m,[0.05,0.12,0.05],[s*0.08,0.22,0])); g.add(M(G.sph,eye,[0.04,0.04,0.04],[s*0.07,0.04,0.17],false)); });
  g.userData={mats:[m],wl,wr}; return g;
}
function buildGhost(){
  const g=new THREE.Group(),m=matV(0xdfe8ff,{r:0.3}); m.transparent=true; m.opacity=0.22; m.depthWrite=false;
  g.add(M(G.sph,m,[0.45,0.45,0.45],[0,1.25,0],false));
  const body=M(G.cone,m,[0.5,1.0,0.5],[0,0.62,0],false); body.rotation.x=Math.PI; g.add(body);
  const eye=mat(0x0d1030,{r:0.3}); [-1,1].forEach(s=>g.add(M(G.sph,eye,[0.08,0.11,0.06],[s*0.15,1.3,0.4],false)));
  g.userData={mats:[m],gm:m}; return g;
}
// Zombie family and other new enemies
const zSkin=()=>matV(pick([0x8bc34a,0x9ccc65,0x7cb342,0xa5c66a]),{r:0.45});
function buildShambler(){
  const g=new THREE.Group(),skin=zSkin(),shirt=matV(pick([0x5c6bc0,0x8d6e63,0xb0bec5,0xef9a9a,0x4db6ac]),{r:0.6}),pants=mat(0x37474f,{r:0.6});
  const body=new THREE.Group(); g.add(body);
  body.add(M(G.box,shirt,[0.55,0.6,0.36],[0,0.95,0])); body.add(M(G.box,skin,[0.42,0.42,0.42],[0.04,1.5,0.04]));
  body.add(M(G.box,mat(0x3e2723,{r:0.6}),[0.2,0.06,0.04],[0.04,1.38,0.26],false));
  const armL=new THREE.Group(),armR=new THREE.Group(); armL.position.set(-0.36,1.15,0); armR.position.set(0.36,1.15,0);
  [armL,armR].forEach(a=>{ a.add(M(G.box,skin,[0.15,0.15,0.62],[0,0,0.31])); body.add(a); });
  const legL=new THREE.Group(),legR=new THREE.Group(); legL.position.set(-0.14,0.62,0); legR.position.set(0.14,0.62,0);
  [legL,legR].forEach(l=>{ l.add(M(G.box,pants,[0.2,0.6,0.2],[0,-0.3,0])); g.add(l); });
  eyes(body,1.56,0.26,0.075,0.11);
  g.userData={mats:[skin,shirt],body,armL,armR,legL,legR}; return g;
}
function buildCrawler(){
  const g=new THREE.Group(),skin=zSkin(),shirt=matV(pick([0x5c6bc0,0x8d6e63,0xb0bec5]),{r:0.6});
  g.add(M(G.box,shirt,[0.5,0.28,0.62],[0,0.22,0])); g.add(M(G.box,skin,[0.38,0.36,0.38],[0,0.36,0.44]));
  const armL=new THREE.Group(),armR=new THREE.Group(); armL.position.set(-0.3,0.28,0.25); armR.position.set(0.3,0.28,0.25);
  [armL,armR].forEach(a=>{ a.add(M(G.box,skin,[0.13,0.13,0.55],[0,-0.05,0.25])); g.add(a); });
  eyes(g,0.42,0.64,0.07,0.1);
  g.userData={mats:[skin,shirt],armL,armR}; return g;
}
function buildBloater(){
  const g=new THREE.Group(),skin=matV(0xc0ca33,{r:0.3}),pus=mat(0xff7043,{r:0.3}),dark=mat(0x558b2f,{r:0.5});
  const belly=M(G.ico,skin,[0.85,0.8,0.8],[0,0.95,0]); g.add(belly);
  g.add(M(G.sph,skin,[0.32,0.3,0.32],[0,1.85,0.1]));
  for(let i=0;i<7;i++){ const a=rand(0,6.28),y=rand(0.6,1.4); g.add(M(G.sph,pus,[0.12,0.12,0.12],[Math.cos(a)*0.8,y,Math.sin(a)*0.75],false)); }
  [-1,1].forEach(sd=>g.add(M(G.box,dark,[0.22,0.35,0.22],[sd*0.35,0.17,0])));
  eyes(g,1.9,0.36,0.07,0.11);
  g.userData={mats:[skin],belly}; return g;
}
function buildKnight(){
  const g=new THREE.Group(),armor=matV(0x90a4ae,{r:0.25,m:0.5}),dark=mat(0x37474f,{r:0.4}),gold=mat(0xffd21f,{r:0.25,m:0.6});
  g.add(M(G.box,armor,[0.62,0.7,0.42],[0,1.0,0])); g.add(M(G.box,armor,[0.46,0.46,0.46],[0,1.6,0]));
  g.add(M(G.box,mat(0x111111,{r:0.4}),[0.36,0.08,0.05],[0,1.62,0.24],false));
  g.add(M(G.cone,mat(0xe53935,{r:0.4}),[0.06,0.35,0.06],[0,2.0,0]));
  [-1,1].forEach(sd=>g.add(M(G.box,dark,[0.2,0.6,0.2],[sd*0.16,0.32,0])));
  const shield=new THREE.Group(); shield.position.set(0,1.0,0.5);
  const sm=matV(0x1e88e5,{r:0.25,m:0.2}); shield.add(M(G.box,sm,[0.95,1.15,0.12],[0,0,0])); shield.add(M(G.box,gold,[0.18,0.85,0.14],[0,0,0.02],false)); shield.add(M(G.box,gold,[0.6,0.16,0.14],[0,0.15,0.02],false));
  g.add(shield);
  const sword=M(G.box,mat(0xeceff1,{r:0.2,m:0.7}),[0.08,0.9,0.08],[0.45,1.2,0.1]); sword.rotation.x=0.6; g.add(sword);
  const bar=new THREE.Group(); bar.position.set(0,2.4,0); bar.add(M(G.box,barBg,[0.8,0.1,0.08],[0,0,0],false)); const fg=M(G.box,mat(0x49c3ff,{e:0.6}),[0.76,0.07,0.12],[0,0,0],false); bar.add(fg); g.add(bar);
  g.userData={mats:[armor,sm],shield,sbar:bar,sfg:fg}; return g;
}
function buildSplitter(){
  const g=new THREE.Group(),m=matV(pick([0xff4fd8,0x40c4ff,0x69f0ae]),{r:0.12});
  const body=M(G.ico,m,[0.7,0.62,0.7],[0,0.62,0]); g.add(body);
  g.add(M(G.ico,mat(0xffffff,{r:0.1}),[0.18,0.12,0.12],[0.25,0.98,0.35],false));
  eyes(g,0.8,0.55,0.12,0.2);
  g.userData={mats:[m],body}; return g;
}
function buildMole(){
  const g=new THREE.Group(),fur=matV(0x6d4c41,{r:0.7}),pink=mat(0xf48fb1,{r:0.4}),claw=mat(0xfff3e0,{r:0.3});
  const body=new THREE.Group(); g.add(body);
  body.add(M(G.sph,fur,[0.55,0.5,0.6],[0,0.55,0])); body.add(M(G.sph,pink,[0.12,0.1,0.12],[0,0.6,0.6],false));
  [-1,1].forEach(sd=>{ body.add(M(G.box,pink,[0.28,0.06,0.2],[sd*0.42,0.35,0.35])); for(let i=-1;i<=1;i++) body.add(M(G.cone,claw,[0.03,0.12,0.03],[sd*0.42+i*0.07,0.35,0.5],false)); });
  eyes(body,0.78,0.45,0.05,0.14);
  const mound=new THREE.Group(),dirt=mat(0x795548,{r:0.9});
  for(let i=0;i<6;i++) mound.add(M(G.dod,dirt,[rand(0.25,0.4),rand(0.15,0.25),rand(0.25,0.4)],[rand(-0.35,0.35),0.1,rand(-0.35,0.35)]));
  g.add(mound);
  g.userData={mats:[fur],body,mound}; return g;
}
function buildNecro(){
  const g=new THREE.Group(),robe=matV(0x4a148c,{r:0.5}),bone=mat(0xeceff1,{r:0.4}),orbM=mat(0x76ff03,{e:1.6});
  g.add(M(G.cone,robe,[0.6,1.6,0.6],[0,0.8,0])); g.add(M(G.cone,robe,[0.32,0.5,0.32],[0,1.85,0]));
  g.add(M(G.sph,bone,[0.22,0.24,0.22],[0,1.62,0.08]));
  const ey=mat(0x76ff03,{e:1.8}); [-1,1].forEach(sd=>g.add(M(G.sph,ey,[0.045,0.045,0.04],[sd*0.08,1.65,0.27],false)));
  const staff=new THREE.Group(); staff.position.set(0.45,0,0.15); staff.add(M(G.cyl,mat(0x4e342e,{r:0.6}),[0.04,2.1,0.04],[0,1.05,0]));
  const orb=M(G.ico,orbM,[0.16,0.16,0.16],[0,2.15,0],false); staff.add(orb); g.add(staff);
  g.userData={mats:[robe],orb}; return g;
}
function buildCharger(){
  const g=new THREE.Group(),hide=matV(0x78909c,{r:0.45}),dark=mat(0x455a64,{r:0.5}),horn=mat(0xfff3d0,{r:0.3});
  g.add(M(G.box,hide,[1.1,0.95,1.6],[0,0.95,0])); g.add(M(G.box,hide,[0.7,0.6,0.75],[0,1.0,1.05]));
  const h1=M(G.cone,horn,[0.12,0.5,0.12],[0,1.42,1.35]); h1.rotation.x=0.4; g.add(h1);
  g.add(M(G.cone,horn,[0.08,0.25,0.08],[0,1.38,1.05]));
  [-1,1].forEach(sd=>g.add(M(G.cone4,hide,[0.1,0.2,0.1],[sd*0.25,1.4,0.8])));
  const legs=[]; [[-0.35,0.5],[0.35,0.5],[-0.35,-0.5],[0.35,-0.5]].forEach(q=>{ const l=new THREE.Group(); l.position.set(q[0],0.6,q[1]); l.add(M(G.box,dark,[0.28,0.6,0.28],[0,-0.3,0])); g.add(l); legs.push(l); });
  eyes(g,1.12,1.42,0.06,0.25);
  g.userData={mats:[hide],legs}; return g;
}
const ENEMY_BUILD={shambler:buildShambler,crawler:buildCrawler,bloater:buildBloater,knight:buildKnight,splitter:buildSplitter,mole:buildMole,necro:buildNecro,charger:buildCharger,blob:buildBlob,wolf:buildWolf,bats:buildBats,ghost:buildGhost,runner:buildRunner,swarm:buildSwarm,shooter:buildShooter,bomber:buildBomber,tank:buildTank,spiderling:buildSpiderling};
for(const k in ENEMY) ENEMY[k].build=ENEMY_BUILD[k];
let LABOFF=new Set();
let enemies=[]; const pools={}; let necroSeen=false;
const pendSpawn=[],DEATHS=[],puddles=[];
// Elites: a rare tougher, bigger, gold-tinted version with a crown that drops three times the loot.
const ELITE_CHANCE=0.04,ELITE_HP=3,ELITE_SIZE=1.3,NO_ELITE=new Set(['swarm','bats','spiderling','mole']);
function makeElite(e){
  e.elite=true; e.maxHp=e.hp=e.maxHp*ELITE_HP; e.r*=ELITE_SIZE; e.base*=ELITE_SIZE; e.g.scale.setScalar(e.base);
  if(!e.crown){
    e.crown=new THREE.Group(); const top=new THREE.Box3().setFromObject(e.g).max.y/e.base,gold=mat(0xffd21f,{r:0.25,m:0.6,e:0.4});
    e.crown.add(M(G.cyl,gold,[0.2,0.1,0.2],[0,0,0],false)); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; e.crown.add(M(G.cone,gold,[0.05,0.14,0.05],[Math.cos(a)*0.17,0.11,Math.sin(a)*0.17],false)); }
    e.crown.position.y=top+0.08; e.g.add(e.crown);
  }
  e.crown.visible=true;
}
function spawnEnemy(type,lane,z){
  const def=ENEMY[type];
  let e=pools[type]&&pools[type].pop();
  if(!e){ const g=def.build(); e={type,g,u:g.userData,mats:g.userData.mats,colorL:g.userData.mats[0].color}; }
  e.isBoss=!!def.boss; e.dead=false; e.flash=0; e.flashOn=false; e.sq=0; e.lunge=0; e.atkCd=0.4; e.t=rand(0,100); e.phase=rand(0,6.3); e.fireCd=rand(1,2.2); e.burst=0; e.burstT=0; e.pattern=0; e.hold=false; e.windup=0; e.elite=false; e.emi=-1; if(e.crown) e.crown.visible=false;
  e.accDmg=0; e.accTier=0; e.accT=-1; e.dmgN=null; e.burn=0; e.burnDps=0; e.burnOwner=null; e.burnFx=0; e.slow=0; e.kb=0; e.tilt=0; e.stun=0; e.pull=0; if(e.u.gm) e.u.gm.opacity=0.2;
  e.under=false; e.shieldHp=0; e.gen=0; e.base=1; e.state=0; e.stateT=0; e.rise=0; e.riseMax=1; e.revived=false; e.raiseT=3.5;
  if(type==='mole'){ e.under=true; e.popZ=rand(-17,-11); e.u.body.visible=false; e.u.mound.visible=true; }
  e.r=def.r; e.speed=def.speed*DIFF.speed*(isW('rain')?rand(0.85,1.15):1)*(isW('heat')?1.15:1); e.dmg=def.dmg; e.maxHp=e.hp=def.hp*DIFF.hp*PF; e.lane=lane;
  const lim=Math.max(0,LANE_W/2-def.r-0.3);
  const x=def.boss?0:LANE_X[lane]+rand(-lim,lim);
  e.g.position.set(x,0,z); e.g.scale.set(1,1,1); e.g.rotation.x=0; e.g.rotation.z=0; e.roam=false; e.g.visible=true; scene.add(e.g); enemies.push(e);
  if(!def.boss&&!NO_ELITE.has(type)&&dist>150&&Math.random()<ELITE_CHANCE) makeElite(e);
  if(type==='knight'){ e.shieldHp=e.maxHp*0.9; e.u.shield.visible=true; e.u.sbar.visible=true; e.u.sfg.scale.x=1; e.u.sfg.position.x=0; }
  if(def.boss) bossInit(e);
  if(type==='necro'&&!necroSeen){ necroSeen=true; sayAt(x,2.6,z,tl('Necromancer!'),'#b07cff',tl('Kill him first')); }
  return e;
}
function clampLane(e){
  const p=e.g.position;
  if(e.isBoss||e.roam){ p.x=clamp(p.x,-HALF+e.r*0.8,HALF-e.r*0.8); if(e.roam) e.lane=laneOf(p.x); return; }
  const lx=LANE_X[e.lane],lim=Math.max(0,LANE_W/2-e.r*0.8);
  p.x=clamp(p.x,lx-lim,lx+lim);
}
function killEnemy(e,byPlayer){
  if(e.dead) return;
  {
    const px=e.g.position.x,pz=e.g.position.z;
    DEATHS.push({x:px,z:pz,d:dist,lane:e.lane,t:time}); if(DEATHS.length>20) DEATHS.shift();
    if(e.type==='shambler'&&byPlayer&&Math.random()<0.3) pendSpawn.push({t:0.5,type:'crawler',lane:e.lane,x:px,z:pz,rise:0.5});
    if(e.type==='bloater') spawnPuddle(e.lane,px,pz);
    if(e.type==='splitter'&&e.gen<2&&byPlayer){ for(const sd of [-1,1]) pendSpawn.push({t:0,type:'splitter',lane:e.lane,x:px+sd*0.5,z:pz,gen:e.gen+1,hp:e.maxHp*0.45,kb:0.8}); }
  }
  e.dead=true; e.g.visible=false; scene.remove(e.g);
  e.mats.forEach(m=>m.emissive.setRGB(0,0,0));
  (pools[e.type]||(pools[e.type]=[])).push(e);
  const p=e.g.position,size=Math.min(2.6,e.r*1.4);
  fxExplosion(p.x,p.y+e.r*0.7,p.z,size,e.colorL);
  sfx.explode(Math.min(2,size));
  if(byPlayer){
    music.note(e.isBoss?'boss':e.type);
    kills++;
    addOD(e.isBoss?0.4:(e.maxHp>60*DIFF.hp*PF?0.03:0.012));
    if(!labRun) runHeroXp+=(XP_VAL[e.isBoss?'boss':e.type]||1)*(DN.full&&DN.nightF>0.5?1.5:1);
    const dropK=isW('heat')?1.5:1;
    if(OPT.hearts){ const chance=(e.type==='tank'||e.isBoss)?1:0.08*dropK; if(Math.random()<chance) spawnHeart(p.x,p.z,e.isBoss?40:e.type==='tank'?ri(15,30):ri(5,30)); }
    if(xpOn()){ const v=(XP_VAL[e.isBoss?'boss':e.type]||1)*(DN.full&&DN.nightF>0.5?1.5:1); if((e.type!=='swarm'&&e.type!=='bats')||Math.random()<0.5) spawnXp(p.x+rand(-0.5,0.5),p.z+rand(-0.5,0.5),v); }
    if(OPT.coins){
      // Bosses and big enemies drop fixed amounts; small ones sometimes drop a stack worth 1-5. Without Money Maker every drop is a single coin.
      const sm=stackMax(),n=e.isBoss?4*sm:e.type==='tank'?sm:(e.type==='knight'||e.type==='necro'||e.type==='charger'||e.type==='bloater')?Math.min(sm,ri(2,4)):(Math.random()<0.35*dropK?rollCoinStack():0);
      if(n) spawnCoins(p.x,p.z,hasAbility('moneymaker')?n*(S.combos.has('goldrush')?2:1):1);
    }
  }
  if(byPlayer) deathFx(e,p);
  if(byPlayer&&e.elite){ sayAt(p.x,2.4,p.z,tl('Elite down!'),'#ffd21f'); if(OPT.coins) spawnCoins(p.x,p.z,hasAbility('moneymaker')?3*stackMax():3,1.2); if(!labRun) runHeroXp+=2*(XP_VAL[e.type]||1); }
  if(e.type==='bomber') explodeAt(p.x,0.5,p.z,3,45*DIFF.hp,45*DIFF.hp,byPlayer,null,1);
  if(e.isBoss){ boss=null; bossDefeated(p); }
}
// Death flourishes: small fry pop into confetti, big ones leave a squashed pancake on the road, ghosts drift up as wisps.
const CONFETTI=new Set(['swarm','bats','spiderling','blob','runner','crawler','splitter']),PANCAKE=new Set(['tank','bloater','charger','knight','shambler','wolf']);
const pancakes=[];
for(let i=0;i<8;i++){ const m=new THREE.Mesh(G.cyl,new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,roughness:0.8,flatShading:true,depthWrite:false})); m.visible=false; scene.add(m); pancakes.push({m,t:0}); }
function deathFx(e,p){
  if(CONFETTI.has(e.type)) for(let i=0;i<14;i++){ const a=rand(0,6.28),sp=rand(2,5); chunks.spawn(p.x,p.y+e.r*0.6,p.z,Math.cos(a)*sp,rand(3,6),Math.sin(a)*sp,rand(0.6,1),0.09,0.05,pick(RAINBOW),pick(RAINBOW),WHITE,14,0.5,false,rand(5,14)); }
  else if(PANCAKE.has(e.type)){ const c=pancakes.reduce((a,b)=>a.t<=b.t?a:b); c.t=1.8; c.m.material.color.copy(e.colorL); c.m.material.opacity=0.9; c.m.scale.set(e.r*1.5,0.03,e.r*1.3); c.m.position.set(p.x,0.03,p.z); c.m.visible=true; }
  else if(e.type==='ghost') for(let i=0;i<10;i++) blobs.spawn(p.x+rand(-0.4,0.4),p.y+rand(0.3,1.2),p.z,rand(-0.3,0.3),rand(1,2.5),rand(-0.3,0.3),rand(0.8,1.4),0.25,0.02,WHITE,C(0xd1c4e9),C(0x9575cd),-1,0,false,0);
}
function updateDeathFx(dt){ for(const c of pancakes){ if(c.t<=0) continue; c.t-=dt; c.m.position.z+=scroll*dt; c.m.material.opacity=Math.min(0.9,c.t); if(c.t<=0) c.m.visible=false; } }
function clearDeathFx(){ pancakes.forEach(c=>{ c.t=0; c.m.visible=false; }); }
// Each enemy or wall keeps one hit number: new damage adds into it and keeps it hovering above the target until the hits stop.
// Really big stacked totals celebrate each milestone (1 000, 2 500, 5 000 …): the number grows, punches and flashes
// through hot colours, and a chime climbs in pitch.
const DMG_MILESTONES=[1000,2500,5000,10000,25000,50000,100000,250000];
const msLevel=v=>{ let i=0; while(i<DMG_MILESTONES.length&&v>=DMG_MILESTONES[i]) i++; return i; };
function restartAnim(el,cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function dmgMilestone(n,lv,x,y,z){
  const el=n.el; el.style.fontSize=Math.min(44,(n.tier===4?27:12)+lv*5)+'px';
  restartAnim(el,lv>=3?'ms-hi':'ms'); n.life=n.max+0.4;
  sfx.milestone(lv+3); if(lv>=2) shake(0.15+0.05*lv);
}
function pushNum(t,x,y,z,val,tier){
  if(!OPT.numbers) return;
  const n=t.dmgN;
  if(n&&n.life>0&&dmgLive.indexOf(n)>=0){
    const lv0=msLevel(n.num); n.num+=val; n.tier=Math.max(n.tier,tier); n.el.textContent=String(Math.round(n.num)); n.el.style.color=TIER_CSS[n.tier]; n.el.classList.toggle('big',n.tier===4);
    n.x=x; n.y=y; n.z=z; n.life=n.max;
    const lv=msLevel(n.num);
    if(lv>lv0) dmgMilestone(n,lv,x,y,z);
    return;
  }
  const before=dmgLive.length; pushDmg(x,y,z,String(Math.round(val)),TIER_CSS[tier],tier===4);
  if(dmgLive.length>before){ const m=dmgLive[dmgLive.length-1]; m.num=val; m.tier=tier; m.vx=0; t.dmgN=m; }
}
function flushDmg(t,x,y,z){
  if(t.accDmg<=0){ t.accT=-1; return; }
  pushNum(t,x,y,z,t.accDmg,t.accTier);
  t.accDmg=0; t.accTier=0; t.accT=-1;
}
function flushEnemyDmg(e){ const p=e.g.position; flushDmg(e,p.x,p.y+e.r*1.7+0.5,p.z); }
function breakShield(e){
  const p=e.g.position; e.u.shield.visible=false; e.u.sbar.visible=false; e.shieldHp=0;
  for(let i=0;i<10;i++){ const a=rand(-1,1),sp=rand(2,6); chunks.spawn(p.x+rand(-0.4,0.4),rand(0.6,1.5),p.z+0.5,Math.sin(a)*sp,rand(2,5),rand(1,4),rand(0.6,1.1),0.22,0.12,C(0x1e88e5),C(0x1e88e5),C(0x0d47a1),16,0.5,true,rand(4,10)); }
  sfx.shield(); pushDmg(p.x,2.6,p.z,tl('SHIELD BROKEN'),'#49c3ff',true,true);
}
function hitEnemy(e,dmg,crit,tier,owner,heavy){
  if(e.dead||e.under) return;
  if(e.shieldHp>0){ e.shieldHp-=dmg*(heavy?2.5:1); dmg*=0.3; const f=Math.max(0,e.shieldHp/(e.maxHp*0.9)); e.u.sfg.scale.x=Math.max(0.001,f); e.u.sfg.position.x=-0.38*(1-f); if(e.shieldHp<=0) breakShield(e); }
  if(S.odT>0&&e.isBoss) dmg*=2/3;
  creditDamage(dmg,owner);
  e.hp-=dmg; e.flash=0.08;
  const mass=e.isBoss?0.05:(e.type==='tank'||e.type==='charger')?0.25:(e.type==='bloater'||e.type==='knight')?0.6:(e.type==='swarm'||e.type==='bats'||e.type==='crawler')?1.6:1;
  const push=(0.25+0.6*Math.min(1,dmg/Math.max(1,e.maxHp*0.5)))*(crit?1.8:1)*mass*S.T.kb;
  if(S.T.shockLv&&Math.random()<0.1*S.T.shockLv) shockRing(e);
  e.kb=Math.min(3,(e.kb||0)+push); e.tilt=Math.min(0.55,(e.tilt||0)+push*0.35);
  e.sq=Math.max(e.sq,Math.min(1,0.45+0.55*push));
  e.accDmg+=dmg; e.accTier=Math.max(e.accTier,tier||0); if(e.accT<0) e.accT=0;
  if(crit){ sfx.crit(); flushEnemyDmg(e); }
  if(e.hp<=0){ flushEnemyDmg(e); killEnemy(e,true); }
}
function chainFrom(e,dmg,owner){
  const p=e.g.position; let best=null,bd=25;
  for(const o of enemies){ if(o.dead||o===e) continue; const q=o.g.position,dx=q.x-p.x,dz=q.z-p.z,d2=dx*dx+dz*dz; if(d2<bd){ bd=d2; best=o; } }
  if(!best) return;
  const q=best.g.position;
  zapFx(p.x,p.y+e.r*0.8,p.z,q.x,q.y+best.r*0.8,q.z); sfx.zap();
  const was=dmgSrc; dmgSrc='c:chain'; hitEnemy(best,dmg*0.5,false,4,owner); dmgSrc=was; fxDamage(q.x,q.y+best.r*0.8,q.z+best.r*0.5,4);
}
function shockRing(src){
  const p=src.g.position;
  for(const o of enemies){ if(o.dead||o===src||o.isBoss||o.under) continue; const q=o.g.position,d2=(q.x-p.x)**2+(q.z-p.z)**2; if(d2<5){ const m=o.type==='tank'||o.type==='charger'?0.4:1; o.kb=Math.min(4,(o.kb||0)+1.1*m); o.sq=Math.max(o.sq,0.6); } }
  for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; chunks.spawn(p.x,0.35,p.z,Math.cos(a)*6,0.6,Math.sin(a)*6,0.35,0.18,0.05,C(0x8fd3ff),C(0x8fd3ff),C(0x49c3ff),2,1.5,false,rand(4,10)); }
  sfx.hit();
}
function onHitEffects(e,d){
  if(d.wid==='shuriken'&&d.crit){ const p0=e.g.position; let best=null,bd=64; for(const o of enemies){ if(o.dead||o.under||d.hits.indexOf(o)>=0) continue; const q=o.g.position,d2=(q.x-p0.x)**2+(q.z-p0.z)**2; if(d2<bd){ bd=d2; best=o; } } if(best){ const q=best.g.position,sp=Math.hypot(d.vx,d.vz),dx=q.x-d.x,dz=q.z-d.z,l=Math.hypot(dx,dz)||1; d.vx=dx/l*sp; d.vz=dz/l*sp; d.pierce=Math.max(d.pierce,1); } }
  const p=e.g.position;
  if(S.combos.has('knock')&&!e.isBoss){ e.kb=Math.min(4,(e.kb||0)+0.9); }
  if(S.combos.has('frost')&&d.wid==='smg'){ e.slow=2; fxSpark(p.x,p.y+e.r*0.9,p.z+e.r*0.5,ICE); }
  if(S.combos.has('chain')&&d.crit) chainFrom(e,d.dmg,d.owner);
}
function explodeAt(x,y,z,radius,dmg,base,hurtPlayer,owner,depth){
  fxExplosion(x,y,z,radius/1.7,FIRE1);
  sfx.explode(1.4); shake(0.4); sceneryBlast(x,z,radius);
  const napalm=S.combos.has('napalm');
  for(const e of enemies){ if(e.dead||e.under) continue; const p=e.g.position,dx=p.x-x,dz=p.z-z,rr=radius+e.r; if(dx*dx+dz*dz<rr*rr){ const dv=dmg*varyDmg(0.8,1.2),tier=dmgTier(dv/base,false); hitEnemy(e,dv,false,tier,owner,true); fxDamage(p.x,p.y+e.r*0.8,p.z+e.r*0.5,tier); if(napalm&&!e.dead){ e.burn=3; e.burnDps=Math.max(e.burnDps,dmg*0.15); e.burnOwner=owner; e.burnSrc='c:napalm'; } } }
  for(const wl of walls){ const wp=wl.g.position; if(!wl.dead&&Math.abs(wp.z-z)<radius+0.3&&Math.abs(wp.x-x)<radius+1.8) hitWall(wl,dmg,wp.x,1.15,wp.z+0.3,false,1); }
  if(hurtPlayer) blastSquad(x,z,radius,20*DIFF.dmg);
  if(!depth&&S.combos.has('rain')){ for(let i=0;i<3;i++) delayed.push({t:0.35+i*0.12,x:clamp(x+rand(-2.5,2.5),-HALF,HALF),z:z+rand(-2.5,2.5),radius:radius*0.7,dmg:dmg*0.5,base,owner}); }
}
function fireAimed(x,y,z,spd,col){
  const i=ebullets.take(); if(i<0) return; const d=ebullets.d[i];
  const dx=S.x-x,dz=0-z,len=Math.hypot(dx,dz)||1;
  d.x=x; d.y=y; d.z=z; d.vx=dx/len*spd; d.vz=dz/len*spd; d.col=col||EB_COL;
}
function fireRaw(x,y,z,vx,vz,col){
  const i=ebullets.take(); if(i<0) return; const d=ebullets.d[i];
  d.x=x; d.y=y; d.z=z; d.vx=vx; d.vz=vz; d.col=col||EB_COL;
}
function necroRaise(e){
  const p=e.g.position,spots=[];
  for(const d of DEATHS){ const z=d.z+(dist-d.d); if(time-d.t<8&&z>-34&&z<-4) spots.push({x:d.x,z,lane:d.lane}); }
  shuffle(spots);
  const list=spots.slice(0,1); if(!list.length) list.push({x:p.x,z:p.z+2.5,lane:e.lane});
  for(const sp of list){
    pendSpawn.push({t:0,type:'shambler',lane:sp.lane,x:sp.x,z:sp.z,rise:0.9});
    zapFx(p.x+0.45,2.15,p.z+0.15,sp.x,0.3,sp.z);
    for(let i=0;i<8;i++) blobs.spawn(sp.x+rand(-0.5,0.5),0.2,sp.z+rand(-0.5,0.5),0,rand(1,2.5),0,rand(0.5,0.9),0.2,0.05,WHITE,C(0x76ff03),C(0x33691e),-1,1,false,0);
  }
  DEATHS.length=0; sfx.zap();
}
function spawnPuddle(lane,x,z){
  const m=new THREE.Mesh(G.cyl,mat(0x9ccc65,{e:0.45,r:0.15})); m.scale.set(1.9,0.03,1.9); m.position.set(x,0.03,z); scene.add(m);
  puddles.push({m,lane,x,z,t:4,tick:0});
  for(let i=0;i<14;i++){ const a=rand(0,6.28),sp=rand(1,4); blobs.spawn(x,0.6,z,Math.cos(a)*sp,rand(2,5),Math.sin(a)*sp,rand(0.5,0.9),0.3,0.1,C(0xc0ca33),C(0x9ccc65),C(0x558b2f),12,0.5,true,0); }
}
function updatePuddles(dt){
  for(let i=puddles.length-1;i>=0;i--){
    const q=puddles[i]; q.t-=dt; q.z+=scroll*dt; q.m.position.z=q.z; const f=Math.min(1,q.t/0.6); q.m.scale.set(1.9*f,0.03,1.9*f);
    if(Math.random()<dt*6) blobs.spawn(q.x+rand(-1.2,1.2),0.1,q.z+rand(-1.2,1.2),0,rand(0.5,1.2),0,0.4,0.12,0.02,C(0xc0ca33),C(0x9ccc65),C(0x558b2f),-0.5,0.5,false,0);
    q.tick-=dt;
    if(mode==='playing'&&q.tick<=0){ q.tick=0.5; for(const m of squad.slice()){ const mp=m.g.position; if((mp.x-q.x)**2+(mp.z-q.z)**2<3.4) hurtMember(m,4*DIFF.dmg,true); } }
    if(q.t<=0||q.z>10){ scene.remove(q.m); puddles.splice(i,1); }
  }
}
function updateEnemies(dt){
  const playing=mode==='playing';
  for(let i=pendSpawn.length-1;i>=0;i--){
    const q=pendSpawn[i]; q.t-=dt; q.z+=scroll*dt; if(q.t>0) continue; pendSpawn.splice(i,1);
    if(mode!=='playing'&&mode!=='menu') continue;
    const c=spawnEnemy(q.type,q.lane,Math.min(q.z,-1.5)); c.g.position.x=q.x; clampLane(c);
    if(q.gen){ c.gen=q.gen; c.base=Math.pow(0.68,q.gen); c.r=ENEMY[q.type].r*c.base; c.maxHp=c.hp=q.hp; c.g.scale.setScalar(c.base); }
    if(q.kb) c.kb=q.kb;
    if(q.rise){ c.rise=c.riseMax=q.rise; c.g.position.y=-1.4; if(q.type==='crawler') c.revived=true; }
  }
  updatePuddles(dt);
  for(const e of enemies){
    if(e.dead) continue;
    const p=e.g.position,u=e.u; e.t+=dt;
    const stopZ=FRONT-e.r*0.6;
    const front=!e.isBoss&&p.z>=stopZ-0.02;
    if(e.slow>0) e.slow-=dt;
    if(e.stun>0) e.stun-=dt;
    let fwd=front?0:scroll+e.speed*(e.slow>0?0.6:1)*(isW('snow')?0.8:1);
    switch(e.type){
      case 'blob': p.y=Math.abs(Math.sin(e.t*5))*(front?0.12:0.3); u.body.scale.y=0.55*(1+0.12*Math.sin(e.t*10)); break;
      case 'runner': if(!front) p.x+=Math.sin(e.t*2.5+e.phase)*dt*2.2; u.legL.rotation.x=Math.sin(e.t*18)*(front?0.3:1); u.legR.rotation.x=-u.legL.rotation.x; break;
      case 'tank': u.legL.rotation.x=Math.sin(e.t*5)*(front?0.15:0.5); u.legR.rotation.x=-u.legL.rotation.x; p.y=Math.abs(Math.sin(e.t*5))*0.08; break;
      case 'shooter': if(!front&&p.z>-14) fwd=scroll*0.3+0.3; p.y=0.1*Math.sin(e.t*4);
        if(playing&&!front&&p.z>-30){ e.fireCd-=dt; if(e.fireCd<=0){ e.fireCd=isW('fog')?3.4:1.7; fireRaw(p.x,0.7,p.z+0.7,0,9+DIFF.speed); } } break;
      case 'swarm': if(!front) p.x+=Math.sin(e.t*5+e.phase)*dt*2.5; u.body.rotation.y+=dt*5; u.body.rotation.x+=dt*2; p.y=0.15*Math.sin(e.t*7+e.phase); break;
      case 'wolf': { const sw=Math.sin(e.t*16)*(front?0.25:0.9); u.legs[0].rotation.x=sw; u.legs[3].rotation.x=sw; u.legs[1].rotation.x=-sw; u.legs[2].rotation.x=-sw; p.y=front?0:Math.abs(Math.sin(e.t*8))*0.12; break; }
      case 'bats': { if(!front) p.x+=Math.sin(e.t*4+e.phase)*dt*3.2; const f=Math.sin(e.t*22)*0.8; u.wl.rotation.z=f; u.wr.rotation.z=-f; p.y=1.25+0.3*Math.sin(e.t*3+e.phase); break; }
      case 'ghost': { const vis=(p.z>-12||e.flash>0)?0.9:0.2; u.gm.opacity+=(vis-u.gm.opacity)*(1-Math.exp(-dt*5)); p.y=0.25+0.15*Math.sin(e.t*2.5+e.phase); break; }
      case 'shambler': { const w=Math.sin(e.t*3+e.phase); u.body.rotation.z=w*0.14; u.legL.rotation.x=w*0.5; u.legR.rotation.x=-w*0.5; u.armL.rotation.x=-0.1+Math.sin(e.t*4)*0.15; u.armR.rotation.x=-0.1-Math.sin(e.t*4)*0.15; if(front){ u.armL.rotation.x=-0.5+Math.sin(e.t*9)*0.5; u.armR.rotation.x=-0.5-Math.sin(e.t*9)*0.5; } if(!front) p.x+=w*dt*0.6; break; }
      case 'crawler': { const w=Math.sin(e.t*6+e.phase); u.armL.rotation.x=w*0.6; u.armR.rotation.x=-w*0.6; break; }
      case 'bloater': { const b=1+0.06*Math.sin(e.t*4); u.belly.scale.set(0.85*b,0.8/b,0.8*b); break; }
      case 'knight': p.y=Math.abs(Math.sin(e.t*5))*0.05; break;
      case 'splitter': { u.body.scale.y=0.62*(1+0.15*Math.sin(e.t*8+e.phase)); if(!front) p.y=Math.abs(Math.sin(e.t*5+e.phase))*0.25*e.base; break; }
      case 'mole': {
        if(e.under){ fwd=front?0:scroll+e.speed*1.2; u.mound.rotation.y+=dt*4; u.mound.position.y=0.05*Math.sin(e.t*20);
          if(Math.random()<dt*14) chunks.spawn(p.x+rand(-0.3,0.3),0.15,p.z,rand(-1,1),rand(1,2.5),rand(-0.5,0.5),0.5,0.12,0.06,C(0x795548),C(0x795548),C(0x4e342e),12,0.5,true,rand(3,8));
          if(p.z>e.popZ){ e.under=false; u.body.visible=true; u.mound.visible=false; for(let i=0;i<12;i++){ const a=rand(0,6.28),sp=rand(1,4); chunks.spawn(p.x,0.3,p.z,Math.cos(a)*sp,rand(3,6),Math.sin(a)*sp,rand(0.6,1),0.22,0.1,C(0x795548),C(0x795548),C(0x4e342e),16,0.5,true,rand(3,8)); } sfx.hit(); e.sq=1; } }
        break; }
      case 'necro': {
        if(!front&&p.z>-24) fwd=0;
        u.orb.scale.setScalar(0.16*(1+0.25*Math.sin(e.t*6))); p.y=0.12*Math.sin(e.t*2);
        if(playing){ e.raiseT-=dt; if(e.raiseT<=0){ e.raiseT=6; necroRaise(e); } }
        break; }
      case 'charger': {
        const sw=Math.sin(e.t*(e.state===2?24:8))*(front?0.2:0.8); u.legs[0].rotation.x=sw; u.legs[3].rotation.x=sw; u.legs[1].rotation.x=-sw; u.legs[2].rotation.x=-sw;
        if(e.state===0&&p.z>-20){ e.state=1; e.stateT=1.2; }
        if(e.state===1){ fwd=0; e.stateT-=dt; u.legs[0].rotation.x=Math.sin(e.t*20)*0.8; if(Math.random()<dt*10) chunks.spawn(p.x+rand(-0.4,0.4),0.1,p.z+0.3,rand(-1,1),rand(1,2),rand(-0.5,0.5),0.6,0.15,0.05,C(0xbcaaa4),C(0xbcaaa4),C(0x8d6e63),8,0.5,true,rand(2,5)); if(e.stateT<=0){ e.state=2; sfx.jump(); } }
        if(e.state===2&&!front) fwd=scroll+15;
        break; }
      case 'spiderling': { const w=Math.sin(e.t*26+e.phase); u.legs.forEach((l,i)=>{ l.rotation.y=(i%2?w:-w)*0.35; }); if(!front) p.x+=Math.sin(e.t*4+e.phase)*dt*1.8; break; }
      case 'bomber': { u.body.rotation.x+=dt*7; const f=1+0.4*Math.sin(e.t*30); u.flame.scale.set(0.14*f,0.18*f,0.14*f); break; }
      default: if(e.isBoss) fwd=updateBoss(e,dt,playing);
    }
    if(e.stun>0) fwd=0;
    if(e.rise>0){ e.rise-=dt; fwd=0; p.y=-1.4*Math.max(0,e.rise)/e.riseMax; if(Math.random()<dt*12) chunks.spawn(p.x+rand(-0.3,0.3),0.1,p.z,rand(-1,1),rand(1.5,3),rand(-0.5,0.5),0.5,0.14,0.06,C(0x5d4037),C(0x5d4037),C(0x3e2723),14,0.5,true,rand(3,8)); }
    if(e.pull>0){
      // pulled by a ground pound: slide toward the front gubbe, changing lane if needed
      e.pull-=dt; const h=headMember();
      if(h){ const hx=h.g.position.x; p.x+=clamp(hx-p.x,-1,1)*7*dt; e.lane=laneOf(p.x); fwd+=4; }
    }
    p.z+=fwd*dt;
    if(!e.isBoss&&p.z>stopZ) p.z=stopZ;
    clampLane(e);
    if(front){
      if(e.type==='bomber'){ if(playing) blastSquad(p.x,p.z,3,e.dmg*DIFF.dmg); killEnemy(e,false); continue; }
      if(e.rise>0||e.under) continue;
      if(e.type==='charger'&&e.state===2){
        e.state=3; let tg=null,bd2=1e9;
        if(playing) for(const m of squad){ const mp=m.g.position; if(laneOf(mp.x)!==e.lane) continue; const d2=(mp.x-p.x)**2+(mp.z-p.z)**2; if(d2<bd2){ bd2=d2; tg=m; } }
        if(tg&&tryParry(tg)) e.stun=0.8;
        else if(tg){ hurtMember(tg,e.dmg*DIFF.dmg,true); tg.hurtT=0.7; shake(0.9); sfx.smack(); pushDmg(tg.g.position.x,2.8,tg.g.position.z,'RAM!','#ff5c7a',true,true); }
        e.atkCd=1.4;
      }
      // At the wall they shuffle sideways toward the squad, crossing lanes, and hit anyone within reach.
      const reach=1.4+e.r,gx=S.x-p.x;
      if(playing&&!(e.stun>0)&&Math.abs(gx)>0.3){ e.roam=true; p.x+=clamp(gx,-1,1)*2.6*dt/Math.max(0.6,e.r); clampLane(e); e.g.rotation.z=clamp(-gx*0.1,-0.3,0.3); }
      else e.g.rotation.z*=Math.exp(-dt*6);
      let target=null,bd=1e9;
      if(playing) for(const m of squad){ const mp=m.g.position; if(laneOf(mp.x)!==e.lane&&Math.abs(mp.x-p.x)>reach) continue; const dx=mp.x-p.x,dz=mp.z-p.z,d2=dx*dx+dz*dz; if(d2<bd){ bd=d2; target=m; } }
      // wind-up tell: the last 0.35 s before a hit it rears back and glows red, so the hit (and a parry) can be timed
      if(target&&!(e.stun>0)){
        e.atkCd-=dt; e.windup=clamp(1-e.atkCd/0.35,0,1);
        if(e.atkCd<=0){ e.windup=0; e.atkCd=(e.type==='tank'||e.type==='charger')?1.2:0.8; e.lunge=1; if(tryParry(target)) e.stun=0.6; else hurtMember(target,e.dmg*0.5*DIFF.dmg); fxSpark(target.g.position.x+rand(-0.3,0.3),1,target.g.position.z-0.2,e.colorL); }
      } else { e.atkCd=Math.min(e.atkCd,0.3); e.windup=0; }
    }
    else if(e.g.rotation.z) e.g.rotation.z*=Math.exp(-dt*6);
    if(e.burn>0){
      e.burn-=dt; const bd=e.burnDps*dt;
      e.hp-=bd; e.accDmg+=bd; e.accTier=Math.max(e.accTier,2); if(e.accT<0) e.accT=0; if(e.burnOwner) e.burnOwner.dealt+=bd; credit(e.burnSrc||'c:burn',bd);
      e.burnFx-=dt; if(e.burnFx<=0){ e.burnFx=0.09; fxFlame(p.x,p.y+e.r*0.9,p.z); }
      if(e.hp<=0){ flushEnemyDmg(e); killEnemy(e,true); continue; }
    }
    if(e.accT>=0){ e.accT+=dt; if(e.accT>0.12) flushEnemyDmg(e); }
    if(e.kb>0.002){ p.z=Math.max(VIEW.spawn,p.z-e.kb*dt*9); e.kb*=Math.exp(-dt*9); } else e.kb=0;
    if(e.lunge>0||e.tilt>0||e.windup>0){ e.lunge*=Math.exp(-dt*8); e.tilt*=Math.exp(-dt*7); if(e.lunge<0.01) e.lunge=0; if(e.tilt<0.01) e.tilt=0; e.g.rotation.x=0.45*e.lunge-e.tilt-0.35*e.windup; }
    if(e.sq>0){ e.sq*=Math.exp(-dt*10); const k=(1-0.24*e.sq)*e.base; e.g.scale.set(k*(1+0.06*e.sq),k,k*(1+0.06*e.sq)); if(e.sq<0.01){ e.sq=0; e.g.scale.setScalar(e.base); } }
    if(e.flash>0){ e.flash-=dt; if(!e.flashOn){ e.flashOn=true; e.mats.forEach(m=>{ m.emissive.setRGB(1,1,1); m.emissiveIntensity=0.9; }); } }
    else{
      // resting glow: red during a wind-up, a gold tint for elites
      const w=Math.round(e.windup*10)/10,key=w+(e.elite?10:0);
      if(e.flashOn||key!==e.emi){ e.flashOn=false; e.emi=key; e.mats.forEach(m=>{ m.emissive.setRGB(w*0.9+(e.elite?0.28:0),e.elite?0.18:0,0); m.emissiveIntensity=1; }); }
    }
    if(p.z>6) killEnemy(e,false);
  }
  // Separation: the horde jostles into a pile instead of stacking inside each other.
  const near=[];
  for(const e of enemies){ if(!e.dead&&!e.isBoss&&e.g.position.z>-14) near.push(e); }
  for(let i=0;i<near.length;i++){
    const a=near[i],pa=a.g.position;
    for(let j=i+1;j<near.length;j++){
      const b=near[j],pb=b.g.position;
      let dx=pb.x-pa.x,dz=pb.z-pa.z,d2=dx*dx+dz*dz;
      const minD=(a.r+b.r)*0.85;
      if(d2>=minD*minD) continue;
      if(d2<1e-4){ dx=rand(-0.1,0.1); dz=rand(-0.1,0.1); d2=dx*dx+dz*dz; }
      const d=Math.sqrt(d2),push=(minD-d),nx=dx/d,nz=dz/d,wa=b.r/(a.r+b.r),wb=a.r/(a.r+b.r);
      pa.x-=nx*push*wa; pa.z-=nz*push*wa; pb.x+=nx*push*wb; pb.z+=nz*push*wb;
    }
  }
  for(const e of near){ const p=e.g.position,stopZ=FRONT-e.r*0.6; if(p.z>stopZ) p.z=stopZ; clampLane(e); }
  enemies=enemies.filter(e=>!e.dead);
}

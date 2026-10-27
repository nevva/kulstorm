'use strict';
// ---------- squad
const FORM=[[0,0],[-1,0.85],[1,0.85],[0,1.7],[-1,1.7],[1,1.7],[-0.5,2.55],[0.5,2.55],[0,3.4]];
const FRONT_SLOT=[0,-0.75];
const barBg=mat(0x0d1030,{r:0.5}),barGreen=mat(0x36e2b4,{e:0.5,r:0.3}),barRed=mat(0xff5c7a,{e:0.5,r:0.3});
function buildGun(def,g){
  const w=def.weapon||'pistol',gunM=mat(0x546e7a,{r:0.3,m:0.4}),gunA=mat(0xffd21f,{r:0.3}),wood=mat(0x8d6e63,{r:0.5});
  const gun=new THREE.Group(); gun.position.set(0.12,1.0,-0.62);
  let tipZ=-0.74;
  if(w==='shotgun'){ gun.add(M(G.box,wood,[0.16,0.2,0.6],[0,0,0.1])); const b=M(G.cyl,gunM,[0.08,0.8,0.08],[0,0.05,-0.5]); b.rotation.x=Math.PI/2; gun.add(b); const b2=M(G.cyl,gunM,[0.08,0.8,0.08],[0.12,0.05,-0.5]); b2.rotation.x=Math.PI/2; gun.add(b2); tipZ=-0.95; }
  else if(w==='minigun'){ gun.add(M(G.box,gunM,[0.22,0.24,0.5],[0,0,0.1])); for(let i=0;i<3;i++){ const a=i/3*6.28; const b=M(G.cyl,mat(0x263238,{r:0.3,m:0.5}),[0.05,0.8,0.05],[Math.cos(a)*0.08,0.04+Math.sin(a)*0.08,-0.5]); b.rotation.x=Math.PI/2; gun.add(b); } tipZ=-0.95; }
  else if(w==='rocket'){ const t=M(G.cyl,mat(0x558b2f,{r:0.4}),[0.14,1.0,0.14],[0,0.1,-0.25]); t.rotation.x=Math.PI/2; gun.add(t); gun.add(M(G.box,gunM,[0.14,0.22,0.3],[0,-0.12,0.15])); const c=M(G.cone,mat(0xff5252,{e:0.4}),[0.13,0.25,0.13],[0,0.1,-0.85],false); c.rotation.x=-Math.PI/2; gun.add(c); tipZ=-0.95; }
  else if(w==='laser'){ gun.add(M(G.box,mat(0xeceff1,{r:0.2,m:0.3}),[0.18,0.22,0.7],[0,0,0])); gun.add(M(G.ico0,mat(0x18ffff,{e:1.6}),[0.11,0.11,0.11],[0,0.04,-0.45],false)); gun.add(M(G.box,mat(0x18ffff,{e:1.2}),[0.2,0.05,0.4],[0,0.14,-0.05],false)); tipZ=-0.6; }
  else if(w==='shuriken'){ const st=new THREE.Mesh(starGeo,mat(0xcfd8dc,{r:0.25,m:0.8})); st.scale.setScalar(0.8); st.rotation.x=Math.PI/2; st.position.set(0,0.05,-0.15); gun.add(st); tipZ=-0.3; }
  else if(w==='smg'){ gun.add(M(G.box,gunM,[0.14,0.18,0.62],[0,0,0])); gun.add(M(G.box,mat(0x263238,{r:0.3}),[0.1,0.28,0.1],[0,-0.2,0.05])); const b=M(G.cyl,gunM,[0.05,0.3,0.05],[0,0.03,-0.45]); b.rotation.x=Math.PI/2; gun.add(b); tipZ=-0.65; }
  else { gun.add(M(G.box,gunM,[0.16,0.2,0.7],[0,0,0])); const b=M(G.cyl,gunM,[0.06,0.4,0.06],[0,0.04,-0.5]); b.rotation.x=Math.PI/2; gun.add(b); gun.add(M(G.box,gunA,[0.18,0.08,0.3],[0,0.13,-0.1],false)); gun.add(M(G.box,gunM,[0.12,0.25,0.12],[0,-0.2,0.15])); }
  const tip=new THREE.Object3D(); tip.position.set(0,0.04,tipZ); gun.add(tip);
  g.add(gun);
  return {gun,tip};
}
function buildGubbe(def){
  const g=new THREE.Group();
  const ninja=def.id==='ninja';
  const skin=mat(0xffcc9c,{r:0.45}),shirt=mat(def.shirt,{r:0.28}),pants=ninja?mat(0x1c1c24,{r:0.5}):mat(0x3949ab,{r:0.4}),boots=mat(0x263238,{r:0.3}),hair=mat(pick([0x3e2723,0xffeb3b,0x212121,0xd84315,0xfafafa]),{r:0.5});
  const legL=new THREE.Group(),legR=new THREE.Group();
  legL.position.set(-0.15,0.55,0); legR.position.set(0.15,0.55,0);
  [legL,legR].forEach(l=>{ l.add(M(G.box,pants,[0.22,0.45,0.22],[0,-0.22,0])); l.add(M(G.box,boots,[0.24,0.14,0.32],[0,-0.5,-0.04])); g.add(l); });
  g.add(M(G.box,shirt,[0.62,0.62,0.38],[0,0.9,0]));
  g.add(M(G.box,skin,[0.46,0.44,0.46],[0,1.45,0]));
  let band=null;
  if(def.id==='tank'){ g.add(M(G.sph,mat(0x37474f,{r:0.3,m:0.3}),[0.3,0.26,0.3],[0,1.6,0])); }
  else if(ninja){
    const hood=mat(0x1c1c24,{r:0.5}),red=mat(0xe53935,{r:0.35});
    g.add(M(G.box,hood,[0.5,0.5,0.5],[0,1.47,0.01])); g.add(M(G.box,hood,[0.48,0.24,0.06],[0,1.36,-0.24],false));
    g.add(M(G.box,red,[0.52,0.09,0.52],[0,1.66,0]));
    band=new THREE.Group(); band.position.set(0,1.66,0.27); band.add(M(G.box,red,[0.06,0.06,0.42],[-0.06,0,0.2],false)); band.add(M(G.box,red,[0.06,0.06,0.36],[0.06,-0.03,0.17],false)); g.add(band);
  }
  else { g.add(M(G.box,hair,[0.5,0.16,0.5],[0,1.72,0])); g.add(M(G.box,hair,[0.5,0.22,0.1],[0,1.57,0.22],false)); }
  if(def.id==='medic'){ const red=mat(0xff1744,{r:0.3}); g.add(M(G.box,red,[0.08,0.26,0.04],[0,0.95,-0.2],false)); g.add(M(G.box,red,[0.26,0.08,0.04],[0,0.95,-0.2],false)); }
  if(def.id==='leader'){ g.add(M(G.box,mat(0xffd21f,{r:0.3}),[0.54,0.1,0.54],[0,1.82,0],false)); }
  const w=mat(0xffffff,{r:0.2}),b=mat(0x111111,{r:0.2});
  [-1,1].forEach(s=>{ g.add(M(G.box,w,[0.1,0.1,0.04],[s*0.11,1.47,-0.235],false)); g.add(M(G.box,b,[0.05,0.06,0.03],[s*0.11,1.46,-0.255],false)); });
  const armL=new THREE.Group(),armR=new THREE.Group();
  armL.position.set(-0.4,1.12,0); armR.position.set(0.4,1.12,0);
  [armL,armR].forEach(a=>{ a.add(M(G.box,shirt,[0.18,0.5,0.18],[0,-0.25,0])); a.add(M(G.box,skin,[0.19,0.14,0.19],[0,-0.55,0])); a.rotation.x=1.35; g.add(a); });
  const {gun,tip}=buildGun(def,g);
  const bar=new THREE.Group(); bar.position.set(0,2.12,0);
  bar.add(M(G.box,barBg,[0.74,0.12,0.1],[0,0,0],false));
  const fg=M(G.box,barGreen,[0.7,0.09,0.14],[0,0,0],false); bar.add(fg);
  g.add(bar);
  if(def.id==='tank') g.scale.setScalar(1.22);
  g.userData={legL,legR,armL,armR,gun,tip,barFg:fg,band};
  return g;
}
let squad=[];
function headMember(){ return (S.frontM&&!S.frontM.dead&&squad.indexOf(S.frontM)>=0)?S.frontM:squad[0]; }
function chainOrder(){ const h=headMember(); const out=[h]; for(const m of squad) if(m!==h) out.push(m); return out; }
function layoutSquad(){
  if(S.frontM&&squad.indexOf(S.frontM)<0) S.frontM=null;
  let i=0;
  for(const m of squad){
    if(m===S.frontM&&!OPT.snake){ m.slot=FRONT_SLOT; continue; }
    m.slot=FORM[Math.min(i,FORM.length-1)]; i++;
  }
}
function cycleFront(dir){ return;
  if(mode!=='playing'||!squad.length||!OPT.front) return;
  const n=squad.length,idx=squad.indexOf(S.frontM);
  const next=idx<0?(dir>0?0:n-1):(idx+dir+n)%n;
  S.frontM=squad[next]; layoutSquad();
  toast(S.frontM.def.name+' i front'); sfx.zone();
}
function addMember(def){
  const g=buildGubbe(def); scene.add(g);
  const hp=(def.hp||60)+(def.id==='leader'?0:S.T.hpBonus);
  const m={def,g,hp,maxHp:hp,cd:rand(0,0.3),phase:rand(0,6.3),recoil:0,beams:[],laserTick:rand(0,0.1),invuln:0,charges:def.id==='shield'?3:0,rt:0,hurtT:0,slot:FORM[0],dead:false,dealt:0,lvl:1,jumpT:0,duckT:0,jumpDelay:-1,duckDelay:-1,jy:0,vy:0,dbUsed:false,flip:0};
  squad.push(m); runAddMember(m);
  if(def.id==='tank'&&OPT.front){ S.frontM=m; }
  layoutSquad();
  const last=squad.length>1?squad[squad.length-2].g.position:null;
  if(OPT.snake&&last) g.position.set(last.x,0,last.z+0.78); else g.position.set(S.x+m.slot[0],0,m.slot[1]);
  if(def.id==='medic') squad.forEach(o=>{ o.hp=Math.min(o.maxHp,o.hp+30); });
  recomputeAuras();
  return m;
}
function hasPart(id){ return squad.some(m=>m.def.id===id)||S.perks.some(p=>p.id===id); }
function recomputeAuras(){
  const A={rate:S.T.rate,dmg:S.T.dmg,extra:0,pierce:0,crit:0,speed:S.T.speed,magnet:false,bounce:false,regen:0,bullet:1};
  for(const m of squad){
    switch(m.def.id){
      case 'firerate': A.rate*=1.2; break; case 'damage': A.dmg*=1.25; break; case 'multishot': A.extra++; break;
      case 'pierce': A.pierce++; break; case 'crit': A.crit+=0.15; break; case 'speed': A.speed*=1.25; break;
      case 'magnet': A.magnet=true; break; case 'bounce': A.bounce=true; break; case 'medic': A.regen+=1; break; case 'bigbullets': A.bullet*=1.3; break;
    }
  }
  A.extra=Math.min(A.extra,4); A.pierce=Math.min(A.pierce,4); A.crit=Math.min(A.crit,0.75);
  S.A=A;
  const prev=S.combos; S.combos=new Set();
  if(OPT.combos) for(const c of COMBOS) if(hasPart(c.a)&&hasPart(c.b)) S.combos.add(c.id);
  if(S.combos.has('fieldhosp')) A.regen+=2*squad.filter(m=>m.def.id==='medic').length;
  if(S.combos.has('hawk')) A.crit=Math.min(0.75,A.crit+0.1);
  S.boosts=runBoosts(A); if(mode==='playing') S.combos.forEach(c=>RUN.combos.add(c));
  if(mode==='playing') for(const c of COMBOS) if(S.combos.has(c.id)&&!prev.has(c.id)){ toast('KOMBO: '+c.name+'!'); sfx.combo(); }
}
// Per-member damage multiplier: the Veteran snowballs with damage dealt, the Glass Cannon scales with his own health.
function memberMult(m){
  let k=1;
  if(m.def.id==='veteran') k*=Math.min(10,1+m.dealt/1500);
  if(m.def.id==='glass') k*=0.5+2*clamp(m.hp/m.maxHp,0,1);
  if(m.def.id==='banker') k*=Math.min(4,1+coinsRun*0.01);
  k*=1+0.2*((m.lvl||1)-1);
  return k;
}
// Squad power: estimated total damage per second relative to one lone pistol gubbe (4 shots/s × 10 = 40).
const BASE_DPS=40;
function memberDps(m,A,combos,ricochet){
  const w=WEAPONS[m.def.weapon||'pistol'],crit=1+A.crit;
  let dps;
  if(w.laser) dps=w.dps*A.dmg*A.rate*Math.min(3,1+A.extra)*crit*1.6;
  else{
    dps=w.rate*A.rate*w.dmg*A.dmg*(w.bullets+A.extra)*crit*(1+0.35*A.pierce);
    if(w.id==='shotgun') dps*=0.75;
    if(w.rocket) dps*=1.8;
    if(ricochet) dps*=1.5;
  }
  return dps*memberMult(m)*(1+0.12*combos);
}
function squadPower(){
  if(!S.A||!squad.length) return 1;
  let t=0; for(const m of squad) t+=memberDps(m,S.A,S.combos.size,S.T.ricochet);
  return Math.max(1,t/BASE_DPS);
}
let PF=1,PFraw=1,pfT=0;
function updatePower(dt,instant){
  pfT-=dt; if(pfT<=0||instant){ pfT=0.5; PFraw=Math.pow(squadPower(),0.8); }
  PF=instant?PFraw:PF+(PFraw-PF)*(1-Math.exp(-dt*0.8));
}
function chipText(m){ const k=memberMult(m); return m.def.short+((m.lvl||1)>1?' nv'+m.lvl:'')+' '+Math.ceil(m.hp)+(Math.abs(k-1)>0.05?' ×'+k.toFixed(1):''); }
function applyTeamPerk(u){
  S.perks.push(u);
  switch(u.id){
    case 'eagle': S.T.eagle=true; VIEW.scale=1.3; VIEW.fogNear=60; VIEW.fogFar=122; VIEW.spawn=-105; break;
    case 'ricochet': S.T.ricochet=true; break;
    case 'gutter': S.T.gutter=true; break;
    case 'steel': S.T.dmg*=1.15; break;
    case 'fastload': S.T.rate*=1.15; break;
    case 'armor': S.T.hpBonus+=30; squad.forEach(m=>{ m.maxHp+=30; m.hp+=30; }); break;
    case 'hospital': S.T.heartMult=2; break;
    case 'shock': S.T.kb+=0.6; S.T.shockLv++; break;
  }
  recomputeAuras();
}
const beamOuter=new THREE.MeshBasicMaterial({color:CYAN}),beamInner=new THREE.MeshBasicMaterial({color:0xffffff});
function ensureBeams(m,n){
  while(m.beams.length<n){
    const b=new THREE.Group();
    b.add(M(G.beam,beamOuter,[0.2,0.2,110],[0,0,0],false)); b.add(M(G.beam,beamInner,[0.08,0.08,110],[0,0,0],false));
    b.visible=false; scene.add(b); m.beams.push(b);
  }
}
const shieldRing=M(G.ring,mat(0xffd21f,{e:0.6,r:0.3}),[1,1,1],[0,0.9,0],false); shieldRing.rotation.x=Math.PI/2; shieldRing.visible=false; scene.add(shieldRing);
const frontMarker=M(G.cone,mat(0xffd21f,{e:0.7,r:0.3}),[0.22,0.4,0.22],[0,2.9,0],false); frontMarker.rotation.x=Math.PI; frontMarker.visible=false; scene.add(frontMarker);
function totalShield(){ let n=0; for(const m of squad) n+=m.charges; return n; }
function hurtMember(m,d,force){
  if(mode!=='playing'||m.dead) return;
  if(S.odT>0){ if(Math.random()<0.4){ const p=m.g.position; fxSparkle(p.x,1.2,p.z,C(0xffe066)); } return; }
  if(m.invuln>0&&!force) return;
  m.invuln=0.3;
  const p=m.g.position;
  const sb=squad.find(x=>x.charges>0);
  if(sb){ sb.charges--; sfx.shield(); fxShield(p.x,0.9,p.z); hudShield=-1; return; }
  if(m.def.id==='tank'&&S.combos.has('fortress')) d*=0.5;
  if(m.safeT>0){ d*=0.5; fxSparkle(p.x,1.2,p.z,pick(RAINBOW)); }
  m.hp-=d; m.hurtT=0.3;
  // Emergency OVERDRIVE: once per run, if you never fired it yourself, it saves you at 10 % HP (even from a lethal hit).
  if(m===squad[0]&&OPT.overdrive&&!S.odUsed&&S.odT<=0&&m.hp<=m.maxHp*0.1){ m.hp=Math.max(m.hp,m.maxHp*0.25); triggerOD(true); sfx.heartbeat(); flashEl.classList.add('on'); setTimeout(()=>flashEl.classList.remove('on'),120); }
  pushDmg(p.x,2.5,p.z,'-'+Math.round(d),'#ff5c7a',false);
  if(m===squad[0]){ flash(); shake(0.6); sfx.hurt(); } else { shake(0.2); sfx.hit(); }
  if(m.hp<=0){ m.hp=0; killMember(m); }
}
function blastSquad(x,z,radius,dmg){
  for(const m of squad){ const p=m.g.position,dx=p.x-x,dz=p.z-z; if(dx*dx+dz*dz<radius*radius) hurtMember(m,dmg,true); }
}
function killMember(m){
  m.dead=true; const p=m.g.position;
  fxExplosion(p.x,1,p.z,1.1,C(m.def.shirt));
  scene.remove(m.g); m.beams.forEach(b=>scene.remove(b));
  if(m===squad[0]){ die(); return; }
  squad=squad.filter(x=>x!==m); if(S.frontM===m){ S.frontM=null; } layoutSquad(); recomputeAuras();
  toast(m.def.name+' stupade!'); sfx.explode(1.2);
}

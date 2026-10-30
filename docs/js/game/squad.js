'use strict';
// ---------- squad
const FORM=[[0,0],[-1,0.85],[1,0.85],[0,1.7],[-1,1.7],[1,1.7],[-0.5,2.55],[0.5,2.55],[0,3.4]];
const FRONT_SLOT=[0,-0.75];
const barBg=mat(0x0d1030,{r:0.5}),barGreen=mat(0x36e2b4,{e:0.5,r:0.3}),barRed=mat(0xff5c7a,{e:0.5,r:0.3});
// Each weapon type's metal slowly fades through its own colours; one shared material per type, animated in updateSquad.
const WEAPON_FADES={pistol:[0xff5c7a,0xffd21f,0x36e2b4],smg:[0x18ffff,0x2979ff,0xb388ff],shotgun:[0xff6d00,0xff1744,0xffd21f],minigun:[0xff1744,0xff9100,0xffea00],rocket:[0x76ff03,0x00bfa5,0xffd21f],laser:[0x18ffff,0xffffff,0xff4fd8],shuriken:[0xcfd8dc,0x80d8ff,0xb388ff]};
const weaponMats={};
const weaponMat=w=>weaponMats[w]||(weaponMats[w]=new THREE.MeshStandardMaterial({color:C(WEAPON_FADES[w][0]),roughness:0.3,metalness:0.45,flatShading:true,emissive:C(WEAPON_FADES[w][0]),emissiveIntensity:0.35}));
const fadeA=new THREE.Color(),fadeB=new THREE.Color();
function updateWeaponFades(){
  for(const w in weaponMats){ const pal=WEAPON_FADES[w],t=time*0.45+w.length,i=Math.floor(t)%pal.length,k=t-Math.floor(t),e=k*k*(3-2*k);
    fadeA.set(pal[i]).lerp(fadeB.set(pal[(i+1)%pal.length]),e); const m=weaponMats[w]; m.color.copy(fadeA).convertSRGBToLinear(); m.emissive.copy(m.color); if(w==='laser') beamOuter.color.copy(m.color); }
}
function buildGun(def,g){
  const w=def.weapon||'pistol',gunM=weaponMat(WEAPON_FADES[w]?w:'pistol'),gunA=mat(0xffd21f,{r:0.3}),wood=mat(0x8d6e63,{r:0.5});
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
// Haircuts and hats. The head is a 0.46 box centred at y 1.45 (top 1.67); the face points to -z, so the camera sees the back (+z).
const HAIR_M=['short','short','buzz','spiky','mohawk','afro','curly','bald','semibald','quiff'];
const HAIR_F=['long','long','ponytail','buns','bob','braids','afro','pixie','curly'];
const HAT_OK=new Set(['short','buzz','bald','semibald','long','ponytail','bob','braids','pixie']);
const HATS=['bowler','cap','tophat','beanie','cowboy','beret','hardhat','fedora','party','viking'];
const HAT_COL=[0x212121,0x37474f,0x5d4037,0xc62828,0x1565c0,0x2e7d32,0xf9a825,0x6a1b9a,0xfafafa];
// o: a chosen outfit (fixed haircut, hat and hat colour); without it everything is random.
function buildHairHat(g,fem,hair,skin,leader,o){
  let style=o?o.hair:pick(fem?HAIR_F:HAIR_M);
  const hat=o?o.hat:!leader&&Math.random()<0.4?pick(HATS):null;
  const hc=arr=>o?HAT_COL[o.hatCol]:pick(arr);
  if(hat&&!HAT_OK.has(style)) style=o?(fem?'long':'short'):fem?pick(['long','ponytail','bob']):pick(['short','buzz','bald']);
  const top=()=>g.add(M(G.rsph,hair,[0.268,0.17,0.268],[0,1.58,0.01])),back=(h)=>g.add(M(G.rsph,hair,[0.25,(h||0.22)*0.75,0.13],[0,1.62-(h||0.22)/2,0.15],false));
  const dome=()=>{};
  switch(style){
    case 'short': top(); back(); break;
    case 'pixie': top(); back(0.3); g.add(M(G.box,hair,[0.3,0.08,0.14],[-0.08,1.77,-0.18],false)); break;
    case 'buzz': g.add(M(G.rsph,hair,[0.258,0.12,0.258],[0,1.6,0.01])); break;
    case 'spiky': g.add(M(G.box,hair,[0.48,0.08,0.48],[0,1.7,0])); for(const [x,z] of [[-0.14,-0.12],[0.14,-0.12],[0,0],[-0.14,0.13],[0.14,0.13]]) g.add(M(G.cone4,hair,[0.1,0.24,0.1],[x,1.85,z],false)); back(0.18); break;
    case 'mohawk': g.add(M(G.box,hair,[0.12,0.24,0.5],[0,1.78,0.01])); break;
    case 'afro': g.add(M(G.sph,hair,[0.36,0.3,0.36],[0,1.72,0.05])); break;
    case 'curly': top(); back(); for(const [x,z] of [[-0.15,-0.14],[0.15,-0.14],[0,-0.05],[-0.16,0.1],[0.16,0.1],[0,0.18]]) g.add(M(G.sph,hair,[0.11,0.1,0.11],[x,1.81,z],false)); break;
    case 'bald': dome(); break;
    case 'semibald': dome(); g.add(M(G.box,hair,[0.48,0.2,0.06],[0,1.52,0.235],false)); [-1,1].forEach(s=>g.add(M(G.box,hair,[0.05,0.2,0.3],[s*0.235,1.52,0.06],false))); break;
    case 'quiff': top(); back(); { const q=M(G.box,hair,[0.42,0.14,0.18],[0,1.83,-0.15],false); q.rotation.x=0.35; g.add(q); } break;
    case 'long': top(); g.add(M(G.box,hair,[0.52,0.62,0.12],[0,1.38,0.22],false)); [-1,1].forEach(s=>g.add(M(G.box,hair,[0.07,0.42,0.4],[s*0.255,1.5,0.03],false))); break;
    case 'bob': top(); g.add(M(G.box,hair,[0.52,0.36,0.1],[0,1.5,0.22],false)); [-1,1].forEach(s=>g.add(M(G.box,hair,[0.07,0.34,0.44],[s*0.255,1.52,0.01],false))); break;
    case 'ponytail': top(); back(); ponytailOn(g,hair); break;
    case 'buns': top(); back(); [-1,1].forEach(s=>g.add(M(G.sph,hair,[0.13,0.13,0.13],[s*0.21,1.8,0.12],false))); break;
    case 'braids': top(); back(); [-1,1].forEach(s=>{ g.add(M(G.box,hair,[0.1,0.5,0.1],[s*0.16,1.32,0.28],false)); g.add(M(G.box,mat(hc(HAT_COL),{r:0.4}),[0.12,0.05,0.12],[s*0.16,1.08,0.28],false)); }); break;
  }
  if(!hat) return style==='afro'?2.02:style==='spiky'||style==='mohawk'?1.97:1.84;
  const c=mat(hc(HAT_COL),{r:0.4}),c2=mat(o?HAT_COL[(o.hatCol+3)%HAT_COL.length]:pick(HAT_COL),{r:0.4});
  switch(hat){
    case 'bowler': { const k=mat(0x1a1a1a,{r:0.35}); g.add(M(G.sph,k,[0.25,0.2,0.25],[0,1.78,0])); g.add(M(G.cyl,k,[0.33,0.03,0.33],[0,1.76,0],false)); g.add(M(G.cyl,c2,[0.252,0.04,0.252],[0,1.79,0],false)); return 1.98; }
    case 'cap': { const back=!o&&Math.random()<0.4; g.add(M(G.sph,c,[0.26,0.13,0.26],[0,1.75,0])); g.add(M(G.box,c,[0.4,0.03,0.24],[0,1.73,back?0.33:-0.33],false)); g.add(M(G.sph,c2,[0.04,0.03,0.04],[0,1.88,0],false)); return 1.9; }
    case 'tophat': { const k=mat(hc([0x1a1a1a,0x1a1a1a,0x4e342e,0x6a1b9a]),{r:0.35}); g.add(M(G.cyl,k,[0.34,0.03,0.34],[0,1.76,0])); g.add(M(G.cyl,k,[0.22,0.42,0.22],[0,1.98,0])); g.add(M(G.cyl,c2,[0.225,0.07,0.225],[0,1.82,0],false)); return 2.19; }
    case 'beanie': g.add(M(G.sph,c,[0.27,0.22,0.27],[0,1.7,0])); g.add(M(G.cyl,c2,[0.275,0.09,0.275],[0,1.69,0],false)); g.add(M(G.sph,c2,[0.08,0.08,0.08],[0,1.94,0],false)); return 2.02;
    case 'cowboy': { const k=mat(hc([0x8d6e63,0x5d4037,0xd7ccc8,0x212121]),{r:0.5}); const b=M(G.cyl,k,[0.46,0.03,0.46],[0,1.77,0]); g.add(b); g.add(M(G.cyl,k,[0.2,0.22,0.22],[0,1.89,0])); g.add(M(G.cyl,c2,[0.205,0.05,0.225],[0,1.81,0],false)); [-1,1].forEach(s=>{ const r=M(G.box,k,[0.16,0.03,0.6],[s*0.38,1.8,0],false); r.rotation.z=s*0.5; g.add(r); }); return 2.0; }
    case 'beret': { const b=M(G.sph,c,[0.29,0.07,0.29],[0.04,1.8,0.02]); b.rotation.z=-0.25; g.add(b); g.add(M(G.cyl,c,[0.02,0.06,0.02],[0.04,1.88,0.02],false)); return 1.9; }
    case 'hardhat': { const y=mat(hc([0xffc107,0xff9800,0xfafafa]),{r:0.3}); g.add(M(G.sph,y,[0.27,0.19,0.27],[0,1.72,0])); g.add(M(G.cyl,y,[0.31,0.025,0.33],[0,1.72,-0.02],false)); g.add(M(G.box,y,[0.06,0.05,0.5],[0,1.89,0],false)); return 1.94; }
    case 'fedora': { const k=mat(hc([0x5d4037,0x455a64,0x8d6e63,0x212121]),{r:0.45}); g.add(M(G.cyl,k,[0.36,0.03,0.36],[0,1.76,0])); g.add(M(G.cyl,k,[0.22,0.2,0.22],[0,1.87,0])); g.add(M(G.cyl,c2,[0.225,0.05,0.225],[0,1.8,0],false)); g.add(M(G.box,k,[0.04,0.04,0.3],[0,1.97,0],false)); return 2.0; }
    case 'party': { const p=M(G.cone,c,[0.17,0.38,0.17],[0,1.9,0]); g.add(p); g.add(M(G.sph,c2,[0.06,0.06,0.06],[0,2.1,0],false)); return 2.16; }
    case 'viking': { const steel=mat(0x90a4ae,{r:0.3,m:0.5}),horn=mat(0xfff3d0,{r:0.35}); g.add(M(G.sph,steel,[0.27,0.2,0.27],[0,1.71,0])); g.add(M(G.cyl,mat(0x8d6e63,{r:0.4}),[0.28,0.05,0.28],[0,1.68,0],false)); [-1,1].forEach(s=>{ const h=M(G.cone,horn,[0.06,0.26,0.06],[s*0.3,1.86,0],false); h.rotation.z=-s*0.6; g.add(h); }); return 1.98; }
  }
  return 1.84;
}
function ponytailOn(g,hair){ g.add(M(G.box,hair,[0.14,0.1,0.1],[0,1.6,0.27],false)); const t=M(G.box,hair,[0.16,0.44,0.14],[0,1.42,0.36],false); t.rotation.x=-0.25; g.add(t); }
// Squad members are chibi: rounded, smoothly shaded pieces with short legs, a small body and a big head. Parts are
// modelled at full size and then fitted together: legs and body scale down from the hip, the head scales up from the
// neck. The face points to -z (the camera mostly sees the back), so role gear and medal ribbons sit on the back.
const HIP_Y=0.4,LEG_K=0.72,BODY_K=0.75,HEAD_K=1.45,BODY_PIVOT=0.55,HEAD_PIVOT=1.2;
const NECK_Y=HIP_Y+(HEAD_PIVOT-BODY_PIVOT)*BODY_K;
function buildGubbe(def){
  const g=new THREE.Group(),body=new THREE.Group(),head=new THREE.Group();
  const ninja=def.id==='ninja',o=def.outfit,fem=o?o.fem:Math.random()<0.5;
  const S_=c=>mat(c,{r:0.45,s:true});
  const skin=S_(o?o.skin:SKIN_COL[0]),shirt=mat(o?o.shirt:def.shirt,{r:0.32,s:true}),pants=ninja?S_(0x1c1c24):S_(o?o.pants:PANTS_COL[0]),boots=mat(0x263238,{r:0.3,s:true}),hair=S_(o?o.hairCol:pick(HAIR_COL));
  const legL=new THREE.Group(),legR=new THREE.Group();
  legL.position.set(-0.12,HIP_Y,0); legR.position.set(0.12,HIP_Y,0);
  [legL,legR].forEach(l=>{ l.add(M(G.rcyl,pants,[0.12,0.42,0.12],[0,-0.2,0])); l.add(M(G.rsph,boots,[0.14,0.1,0.19],[0,-0.47,-0.04])); l.scale.setScalar(LEG_K); g.add(l); });
  const tr=fem?0.26:0.29;
  body.add(M(G.rsph,pants,[tr*0.95,0.13,tr*0.72],[0,0.62,0]));
  body.add(M(G.rcyl,shirt,[tr,0.46,tr*0.74],[0,0.86,0]));
  body.add(M(G.rsph,shirt,[tr,0.14,tr*0.74],[0,1.09,0]));
  body.add(M(G.rcyl,skin,[0.09,0.1,0.09],[0,1.2,0],false));
  head.add(M(G.rsph,skin,[0.25,0.24,0.25],[0,1.45,0]));
  let band=null,hatTop=0;
  if(def.id==='tank'){ head.add(M(G.rsph,mat(0x37474f,{r:0.3,m:0.3,s:true}),[0.29,0.22,0.29],[0,1.56,0.01])); if(fem) ponytailOn(head,hair); }
  else if(ninja){
    const hood=S_(0x1c1c24),red=S_(0xe53935);
    head.add(M(G.rsph,hood,[0.27,0.27,0.27],[0,1.46,0.01])); head.add(M(G.box,hood,[0.4,0.16,0.06],[0,1.38,-0.22],false));
    head.add(M(G.rcyl,red,[0.275,0.08,0.275],[0,1.6,0]));
    band=new THREE.Group(); band.position.set(0,1.6,0.26); band.add(M(G.box,red,[0.06,0.06,0.42],[-0.06,0,0.2],false)); band.add(M(G.box,red,[0.06,0.06,0.36],[0.06,-0.03,0.17],false)); head.add(band);
  }
  else hatTop=buildHairHat(head,fem,hair,skin,def.id==='leader',o);
  if(def.id==='leader'&&!(o&&o.hat)) head.add(M(G.rcyl,mat(0xffd21f,{r:0.3,m:0.4,s:true}),[0.27,0.08,0.27],[0,1.62,0],false));
  // face: big eyes (they blink), brows and a small mouth
  const w=mat(0xffffff,{r:0.2,s:true}),b=mat(0x111111,{r:0.2,s:true}),eyes=[];
  [-1,1].forEach(s=>{ const e=new THREE.Group(); e.position.set(s*0.095,1.46,-0.21); e.add(M(G.rsph,w,[0.065,0.08,0.035],[0,0,0],false)); e.add(M(G.rsph,b,[0.04,0.05,0.02],[0,-0.008,-0.025],false)); e.add(M(G.rsph,w,[0.014,0.014,0.01],[0.015,0.015,-0.042],false)); head.add(e); eyes.push(e);
    const br=M(G.box,hair,[0.08,0.022,0.02],[s*0.095,1.56,-0.215],false); br.rotation.z=-s*0.15; head.add(br); });
  head.add(M(G.box,mat(0x7b3b2b,{r:0.5}),[0.06,0.02,0.02],[0,1.35,-0.24],false));
  const armL=new THREE.Group(),armR=new THREE.Group();
  const ax=tr+0.08; armL.position.set(-ax,1.08,0); armR.position.set(ax,1.08,0);
  [armL,armR].forEach(a=>{ a.add(M(G.rcyl,shirt,[0.09,0.42,0.09],[0,-0.2,0])); a.add(M(G.rsph,skin,[0.1,0.1,0.1],[0,-0.46,0])); a.rotation.x=1.35; body.add(a); });
  roleGear(body,head,def,tr);
  medalRibbons(body,def,tr);
  const {gun,tip}=buildGun(def,body);
  // fit the parts together around the hip and neck
  body.children.forEach(c=>c.position.y-=BODY_PIVOT); body.position.y=HIP_Y; body.scale.setScalar(BODY_K); g.add(body);
  head.children.forEach(c=>c.position.y-=HEAD_PIVOT); head.position.y=NECK_Y; head.scale.setScalar(HEAD_K); g.add(head);
  const bar=new THREE.Group(); bar.position.set(0,NECK_Y+(Math.max(1.84,hatTop)-HEAD_PIVOT)*HEAD_K+0.16,0);
  bar.add(M(G.box,barBg,[0.74,0.12,0.1],[0,0,0],false));
  const fg=M(G.box,barGreen,[0.7,0.09,0.14],[0,0,0],false); bar.add(fg);
  g.add(bar);
  if(def.id==='tank') g.scale.setScalar(1.22);
  g.userData={legL,legR,armL,armR,gun,tip,barFg:fg,band,eyes};
  return g;
}
// Back-mounted gear so every recruit type reads at a glance from behind.
// Head-worn gear (bands, the glass helmet) goes on the head group so it scales with the head.
function roleGear(g,head,def,tr){
  const zb=tr*0.74,S_=(c,o)=>mat(c,Object.assign({r:0.4,s:true},o||{})),add=(geo,m,s,p,rot,onHead)=>{ const x=M(geo,m,s,p,false); if(rot) x.rotation.set(rot[0],rot[1],rot[2]); (onHead?head:g).add(x); return x; };
  const red=S_(0xff1744),white=S_(0xfafafa),gold=S_(0xffd21f,{m:0.5,r:0.3}),steel=S_(0x90a4ae,{m:0.5,r:0.3}),brown=S_(0x6d4c41),dark=S_(0x37474f);
  const pack=(c,w,h)=>add(G.box,S_(c),[w||0.34,h||0.38,0.16],[0,0.9,zb+0.08]);
  switch(def.id){
    case 'medic': pack(0xfafafa); add(G.box,red,[0.06,0.2,0.02],[0,0.92,zb+0.17]); add(G.box,red,[0.2,0.06,0.02],[0,0.92,zb+0.17]); break;
    case 'magnet': { const m=S_(0xe53935); [-1,1].forEach(s=>{ add(G.rcyl,m,[0.05,0.3,0.05],[s*0.1,0.95,zb+0.1]); add(G.rcyl,steel,[0.052,0.08,0.052],[s*0.1,0.77,zb+0.1]); }); add(G.rcyl,m,[0.05,0.25,0.05],[0,1.1,zb+0.1],[0,0,Math.PI/2]); break; }
    case 'banker': add(G.rsph,S_(0x7cb342),[0.17,0.19,0.13],[0.18,0.78,zb+0.08]); add(G.rcyl,gold,[0.05,0.06,0.05],[0.18,0.97,zb+0.08]); break;
    case 'tank': [-1,1].forEach(s=>add(G.rsph,dark,[0.17,0.11,0.16],[s*(tr+0.04),1.12,0])); break;
    case 'shield': add(G.rcyl,S_(0x1e88e5),[0.24,0.05,0.24],[0,0.92,zb+0.06],[Math.PI/2,0,0]); add(G.rcyl,gold,[0.08,0.06,0.08],[0,0.92,zb+0.09],[Math.PI/2,0,0]); break;
    case 'smg': case 'minigun': add(G.box,brown,[0.08,0.62,0.04],[0,0.88,zb+0.02],[0,0,0.6]); break;
    case 'rocket': add(G.rcyl,S_(0x558b2f),[0.09,0.5,0.09],[0.12,1.02,zb+0.08],[0,0,0.2]); add(G.cone,red,[0.09,0.16,0.09],[0.17,1.33,zb+0.08],[0,0,0.2]); break;
    case 'laser': pack(0xeceff1,0.26,0.32); add(G.rcyl,S_(0x18ffff,{e:1.4}),[0.05,0.24,0.05],[0,0.92,zb+0.17]); break;
    case 'firerate': [-1,1].forEach(s=>[0,1].forEach(i=>add(G.box,gold,[0.1,0.025,0.03],[s*(tr+0.09),0.98-i*0.05,0.06],[0,0,s*0.5]))); break;
    case 'damage': pack(0x5d4037,0.36,0.3); add(G.box,gold,[0.3,0.04,0.02],[0,0.95,zb+0.17]); break;
    case 'multishot': [-1,1].forEach(s=>add(G.box,brown,[0.07,0.66,0.04],[0,0.88,zb+0.02],[0,0,s*0.6])); break;
    case 'pierce': [-1,1].forEach(s=>{ add(G.rsph,steel,[0.15,0.1,0.15],[s*(tr+0.04),1.12,0]); add(G.cone,steel,[0.04,0.14,0.04],[s*(tr+0.06),1.24,0]); }); break;
    case 'crit': add(G.rcyl,red,[0.262,0.05,0.262],[0,1.5,0],null,true); break;
    case 'speed': add(G.rcyl,S_(0xffffff),[0.262,0.05,0.262],[0,1.56,0],null,true); break;
    case 'bounce': for(let i=0;i<3;i++) add(G.ring,steel,[0.1,0.1,0.1],[0,0.78+i*0.1,zb+0.1],[Math.PI/2,0,0]); break;
    case 'bigbullets': add(G.rsph,S_(0x212121,{m:0.4,r:0.3}),[0.2,0.2,0.2],[0,0.92,zb+0.12]); break;
    case 'veteran': add(G.box,S_(0x2e7d32),[0.08,0.6,0.04],[0,0.88,zb+0.02],[0,0,-0.6]); break;
    case 'glass': add(G.rsph,new THREE.MeshStandardMaterial({color:C(0xb3f0ff),transparent:true,opacity:0.35,roughness:0.1}),[0.31,0.3,0.31],[0,1.47,0],null,true); break;
  }
}
// Earned medals as a little row of coloured ribbons on the upper back.
function medalRibbons(g,def,tr){
  const key=def.id==='leader'?'hero_'+((lastCfg&&lastCfg.hero)||heroId):def.id,r=vetRank(key);
  for(let i=0;i<r;i++) g.add(M(G.box,mat(parseInt(MEDALS[i].color.slice(1),16),{r:0.3,e:MEDALS[i].epic?0.4:0}),[0.06,0.05,0.02],[-0.15+i*0.07,1.04,tr*0.74+0.01],false));
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
  toast(tl('{0} at the front',S.frontM.def.name)); sfx.zone();
}
function addMember(def){
  const g=buildGubbe(def); scene.add(g);
  const hp=memberBaseHealth(def)+(def.id==='leader'?0:S.T.hpBonus);
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
  if(mode==='playing') for(const c of COMBOS) if(S.combos.has(c.id)&&!prev.has(c.id)){ toast(tl('COMBO: {0}!',c.name)); sfx.combo(); }
}
// Dagsform: the start group's HP, damage and fire rate are rolled within ±15 % each run (not in the lab). Run levels stack on top.
function rollForm(m){
  const r=()=>Math.round(rand(0.85,1.15)*100)/100;
  m.form={hp:r(),dmg:r(),rate:r()};
  m.maxHp=Math.round(m.maxHp*m.form.hp*vetBoost(m,'hp')); m.hp=m.maxHp;
  const vr=vetRank(vetKey(m)); if(vr>=4) m.charges+=MEDALS[3].shield; m.legend=vr>=5;
}
const formRate=m=>(m.form?m.form.rate:1)*vetBoost(m,'rate');
function formText(m){ if(!m.form) return ''; const f=k=>(k>=1?'+':'−')+Math.round(Math.abs(k-1)*100)+PCT; return 'HP '+f(m.form.hp)+' · '+tl('Damage')+' '+f(m.form.dmg)+' · '+tl('Fire rate')+' '+f(m.form.rate); }
// Per-member damage multiplier: the Veteran snowballs with damage dealt, the Glass Cannon scales with his own health.
function memberMult(m){
  let k=m.form?m.form.dmg:1;
  if(m.def.id==='veteran') k*=Math.min(10,1+m.dealt/1500);
  if(m.def.id==='glass') k*=0.5+2*clamp(m.hp/m.maxHp,0,1);
  if(m.def.id==='banker') k*=Math.min(4,1+coinsRun*0.01);
  k*=1+0.2*((m.lvl||1)-1);
  return k*vetBoost(m,'dmg');
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
  return dps*memberMult(m)*formRate(m)*(1+0.12*combos);
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
function chipText(m){ const k=memberMult(m),r=vetRank(vetKey(m)); return (r?'★'.repeat(r)+' ':'')+m.def.short+((m.lvl||1)>1?' '+tl('lv {0}',m.lvl):'')+' '+Math.ceil(m.hp)+(Math.abs(k-1)>0.05?' ×'+k.toFixed(1):''); }
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
// Parry: the start of a ground roll blocks an enemy hit, and the squad hits harder for a moment after.
const PARRY_WIN=0.25,PARRY_T=1.5,PARRY_K=2;
const parryK=()=>S.parryT>0?PARRY_K:1;
function tryParry(m){
  if(mode!=='playing'||m.dead||!(m.duckT>DUCK_T-PARRY_WIN)||(m.jy||0)>0.05) return false;
  const p=m.g.position,fresh=!(S.parryT>PARRY_T-0.15);
  S.parryT=PARRY_T; m.invuln=Math.max(m.invuln,0.2); fxShield(p.x,0.9,p.z);
  if(fresh){ fxSparkle(p.x,1.2,p.z,C(0xffe066)); pushDmg(p.x,2.8,p.z,tl('PARRY!'),'#ffe066',true,true,tl('Strike back now')); sfx.crit(); shake(0.3); addOD(0.04); }
  return true;
}
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
  if(m===squad[0]&&hasAbility('overdrive')&&!S.odUsed&&S.odT<=0&&m.hp<=m.maxHp*0.1){ m.hp=Math.max(m.hp,m.maxHp*0.25); triggerOD(true); sfx.heartbeat(); flashEl.classList.add('on'); setTimeout(()=>flashEl.classList.remove('on'),120); }
  pushDmg(p.x,2.5,p.z,'-'+Math.round(d),'#ff5c7a',false);
  if(m===squad[0]){ flash(); shake(0.6); sfx.hurt(); } else { shake(0.2); sfx.hit(); }
  if(m.hp<=0){ m.hp=0; killMember(m); }
}
function blastSquad(x,z,radius,dmg){
  for(const m of squad){ const p=m.g.position,dx=p.x-x,dz=p.z-z; if(dx*dx+dz*dz<radius*radius) hurtMember(m,dmg,true); }
}
function killMember(m){
  m.dead=true; const p=m.g.position;
  m.beams.forEach(b=>scene.remove(b));
  if(m===squad[0]){ fxExplosion(p.x,1,p.z,1.1,C(m.def.shirt)); scene.remove(m.g); die(); return; }
  m.g.userData.bar=null; fallen.push({g:m.g,t:0,vx:rand(-2,2),vy:rand(5,7),vz:rand(2,4),spin:rand(8,12)*(Math.random()<0.5?-1:1),col:m.def.shirt}); fxSpark(p.x,1,p.z,C(m.def.shirt));
  squad=squad.filter(x=>x!==m); if(S.frontM===m){ S.frontM=null; } layoutSquad(); recomputeAuras();
  toast(tl('{0} has fallen!',m.def.name)); sfx.explode(1.2);
}

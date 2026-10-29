'use strict';
// ---------- world: ground, road tiles, props, clouds
const ROAD_W=12,HALF=ROAD_W/2,TILE_L=10,TILES=14;
const LANES=3,LANE_W=4,LANE_X=[-4,0,4],FRONT=-1.0;
const laneOf=x=>clamp(Math.round(x/LANE_W)+1,0,LANES-1);
const groundMat=new THREE.MeshStandardMaterial({color:C(0x6b7a8a),roughness:0.75,flatShading:true});
const roadMat=new THREE.MeshStandardMaterial({color:C(0x3d4556),roughness:0.55,flatShading:true});
const roadMat2=new THREE.MeshStandardMaterial({color:C(0x444d5e),roughness:0.55,flatShading:true});
const stripeMat=new THREE.MeshStandardMaterial({color:C(0xffd21f),roughness:0.4,flatShading:true,emissive:C(0xffd21f),emissiveIntensity:0});
const curbMat=new THREE.MeshStandardMaterial({color:C(0x9aa5b1),roughness:0.45,flatShading:true,emissive:C(0x9aa5b1),emissiveIntensity:0});
const ground=M(G.slab,groundMat,[90,0.4,200],[0,-0.3,-60],false); ground.receiveShadow=true; scene.add(ground);

// Props: each is built in its own group around (x, z) and returns what scenery.js needs to make it react:
// kind 'building' wobbles and chips when hit, 'small' gets knocked over; extra fields drive per-zone animations.
const neonMats=[0xff2fd0,0x19e6ff,0x8cff3a,0xffe600].map(c=>new THREE.MeshStandardMaterial({color:C(c),emissive:C(c),emissiveIntensity:1.6,roughness:0.4,flatShading:true}));
const blinkMat=new THREE.MeshStandardMaterial({color:C(0xff1744),emissive:C(0xff1744),emissiveIntensity:2,flatShading:true});
const SPEC_SHIRTS=[0xff5c7a,0x49c3ff,0xffd21f,0x7cb342,0xb07cff,0xff9800];
// A tiny onlooker for rooftops; scenery.js makes them cheer and duck.
function spectator(g,x,y,z){
  const s=new THREE.Group(); s.position.set(x,y,z);
  s.add(M(G.box,pal(pick(SPEC_SHIRTS)),[0.3,0.36,0.22],[0,0.3,0])); s.add(M(G.box,pal(pick(SKIN_COL)),[0.24,0.24,0.24],[0,0.62,0]));
  [-1,1].forEach(k=>{ const a=new THREE.Group(); a.position.set(k*0.19,0.44,0); a.add(M(G.box,pal(pick(SPEC_SHIRTS)),[0.08,0.3,0.08],[0,0.13,0],false)); s.add(a); });
  g.add(s); return s;
}
function roofSpectators(g,x,h,z,w){ const out=[]; if(Math.random()<0.35) for(let i=0,n=ri(1,2);i<n;i++) out.push(spectator(g,x+rand(-w/3,w/3),h,z+rand(-0.4,0.4))); return out; }
const PROPS={
  city(g,x,z,side){
    if(Math.random()<0.1) return billboard(g,x,z,side);
    const w=rand(1.4,3),h=rand(2,8),d=rand(1.4,3),info={kind:'building',r:Math.max(w,d)/2+0.3,h,windows:[],specs:[]};
    g.add(M(G.box,pal(pick([0x5c6bc0,0x26a69a,0xef5350,0xffa726,0x42a5f5,0xab47bc,0xf5f5f5])),[w,h,d],[x,h/2,z]));
    if(Math.random()<0.6){ const wm=Math.random()<0.7?windowMat:windowMat2,rows=Math.min(3,Math.floor(h/1.6)); for(let r=0;r<rows;r++){ const wn=M(G.box,wm,[w*0.72,0.32,0.05],[x,1.0+r*1.5,z+d/2+0.02],false); g.add(wn); info.windows.push(wn); } }
    const top=Math.random(); let roof=h;
    if(top<0.25){ const h2=rand(1,2.5); g.add(M(G.box,pal(0xcfd8dc),[w*0.6,h2,d*0.6],[x,h+h2/2,z])); roof=h+h2; info.h=roof; }
    else if(top<0.45){ const tw=pal(0x8d6e63); [-1,1].forEach(k=>g.add(M(G.box,tw,[0.08,0.8,0.08],[x+k*0.3,h+0.4,z],false))); g.add(M(G.cyl,tw,[0.42,0.6,0.42],[x,h+1.05,z])); g.add(M(G.cone,tw,[0.46,0.3,0.46],[x,h+1.5,z],false)); }
    else if(top<0.75){ g.add(M(G.cyl,pal(0x90a4ae),[0.06,rand(1,2.2),0.06],[x+w/4,h+0.8,z])); const l=M(G.sph,blinkMat,[0.09,0.09,0.09],[x+w/4,h+1.9,z],false); g.add(l); }
    if(Math.random()<0.4){ const aw=M(G.box,pal(pick([0xef5350,0x26a69a,0xffd21f])),[0.12,0.08,1.1],[x-side*(w/2+0.25),1.4,z],false); aw.rotation.z=side*0.5; g.add(aw); }
    if(Math.random()<0.3){ g.add(M(G.cyl,pal(0x455a64),[0.08,2.4,0.08],[x-w/2-0.6,1.2,z])); g.add(M(G.sph,pal(0xfff59d,{e:1.2}),[0.24,0.24,0.24],[x-w/2-0.6,2.5,z],false)); }
    info.specs=roofSpectators(g,x,roof,z,w);
    return info;
  },
  jungle(g,x,z){
    if(Math.random()<0.72){
      const h=rand(1.4,3.2),info={kind:'small',r:1,tree:true}; g.add(M(G.cyl,pal(0x6d4c41),[0.28,h,0.28],[x,h/2,z]));
      const r=rand(0.9,1.8); g.add(M(G.ico,pal(pick([0x43a047,0x2e7d32,0x66bb6a,0x7cb342])),[r,r*0.9,r],[x,h+r*0.5,z]));
      if(Math.random()<0.5) g.add(M(G.ico,pal(0x66bb6a),[r*0.6,r*0.5,r*0.6],[x+rand(-0.5,0.5),h+r*1.1,z]));
      // a monkey swinging from the canopy
      if(Math.random()<0.18){ const pv=new THREE.Group(); pv.position.set(x+r*0.6,h+r*0.3,z+0.4); pv.add(M(G.box,pal(0x5d4037),[0.06,0.7,0.06],[0,-0.35,0],false)); pv.add(M(G.sph,pal(0x6d4c41),[0.22,0.26,0.2],[0,-0.82,0])); pv.add(M(G.sph,pal(0xd7a86e),[0.15,0.14,0.12],[0,-0.55,0.1],false)); g.add(pv); info.swing=pv; }
      return info;
    }
    const r=rand(0.5,0.9); g.add(M(G.ico,pal(0x7cb342),[r,r*0.7,r],[x,r*0.5,z]));
    if(Math.random()<0.6) g.add(M(G.sph,pal(pick([0xff4081,0xffd600,0xff6e40])),[0.18,0.18,0.18],[x,r*0.95,z],false));
    if(Math.random()<0.35){ const sx=x+rand(-0.8,0.8),sz=z+rand(-0.8,0.8),sm=Math.random()<0.5?shroomMat:shroomMat2; g.add(M(G.cyl,pal(0xfff3e0),[0.07,0.35,0.07],[sx,0.17,sz])); g.add(M(G.sph,sm,[0.28,0.14,0.28],[sx,0.38,sz],false)); }
    return {kind:'small',r:r+0.2,tree:true};
  },
  desert(g,x,z){
    const k=Math.random();
    if(k<0.45){ const h=rand(1.2,2.6),m=pal(0x43a047); g.add(M(G.cyl,m,[0.3,h,0.3],[x,h/2,z])); g.add(M(G.cyl,m,[0.2,0.9,0.2],[x+0.5,h*0.55,z])); g.add(M(G.cyl,m,[0.5,0.2,0.2],[x+0.3,h*0.4,z])); return {kind:'small',r:0.7}; }
    if(k<0.85){ const r=rand(0.5,1.3); g.add(M(G.dod,pal(0xd7a86e),[r,r*0.7,r],[x,r*0.4,z])); return {kind:'building',r:r+0.2}; }
    const s=rand(2.5,5); g.add(M(G.cone4,pal(0xe6b85c),[s,s*0.8,s],[x*1.6,s*0.4,z])); return {kind:'none'};
  },
  neon(g,x,z){
    const w=rand(1.2,2.6),h=rand(2.5,9),nm=pick(neonMats);
    g.add(M(G.box,pal(0x1b1540,{r:0.25}),[w,h,w],[x,h/2,z]));
    g.add(M(G.box,nm,[w+0.12,0.18,w+0.12],[x,rand(0.5,h-0.5),z],false));
    if(Math.random()<0.6) g.add(M(G.box,nm,[0.15,h*0.8,0.15],[x+w/2+0.08,h/2,z+w/2+0.08],false));
    if(Math.random()<0.3) g.add(M(G.ico0,pal(0x19e6ff,{e:1.5}),[0.4,0.4,0.4],[x,h+1,z],false));
    return {kind:'building',r:w/2+0.3,h,specs:roofSpectators(g,x,h,z,w)};
  },
  ice(g,x,z){
    if(Math.random()<0.7){
      const r=rand(0.4,1.1),h=rand(1.5,5); g.add(M(G.cone,Math.random()<0.3?iceGlowMat:pal(0xb3f0ff,{r:0.12}),[r,h,r],[x,h/2,z]));
      if(Math.random()<0.5) g.add(M(G.cone,pal(0xd8f8ff,{r:0.12}),[r*0.6,h*0.6,r*0.6],[x+r*0.8,h*0.3,z+0.3]));
      return {kind:'small',r:r+0.3};
    }
    const m=pal(0xffffff,{r:0.6});
    g.add(M(G.sph,m,[0.6,0.6,0.6],[x,0.55,z])); g.add(M(G.sph,m,[0.45,0.45,0.45],[x,1.35,z]));
    // the head turns to watch the squad go by
    const head=new THREE.Group(); head.position.set(x,1.95,z);
    head.add(M(G.sph,m,[0.32,0.32,0.32],[0,0,0]));
    const c=M(G.cone,pal(0xff7a00),[0.08,0.4,0.08],[0,0,0.45],false); c.rotation.x=Math.PI/2; head.add(c);
    head.add(M(G.cyl,pal(0x212121),[0.3,0.3,0.3],[0,0.4,0]));
    [-1,1].forEach(k=>head.add(M(G.sph,pal(0x212121),[0.05,0.05,0.05],[k*0.12,0.08,0.28],false)));
    g.add(head);
    return {kind:'small',r:0.8,head};
  },
  lava(g,x,z){
    const k=Math.random();
    if(k<0.5){ const r=rand(0.6,1.5); g.add(M(G.dod,pal(0x3a2f2f,{r:0.7}),[r,r*0.8,r],[x,r*0.4,z])); return {kind:'building',r:r+0.2}; }
    if(k<0.85){ const h=rand(1,3.5); g.add(M(G.cyl,pal(0xff6a00,{e:1.3}),[0.35,h,0.35],[x,h/2,z])); g.add(M(G.dod,pal(0x3a2f2f,{r:0.7}),[0.6,0.4,0.6],[x,0.2,z])); return {kind:'building',r:0.6,erupt:h}; }
    const s=rand(3,6); g.add(M(G.cone,pal(0x4e342e,{r:0.8}),[s,s*0.7,s],[x*1.5,s*0.35,z])); g.add(M(G.cyl,pal(0xff6a00,{e:1.3}),[s*0.3,0.3,s*0.3],[x*1.5,s*0.7,z],false)); return {kind:'none'};
  },
};
// City billboard: shows the best distance or the starting hero; textures are made once per text.
const bbTex={};
function billboardTex(text){
  if(bbTex[text]) return bbTex[text];
  const c=document.createElement('canvas'); c.width=256; c.height=128; const x=c.getContext('2d');
  x.fillStyle='#0d1030'; x.fillRect(0,0,256,128); x.fillStyle='#ffd21f'; x.fillRect(6,6,244,116); x.fillStyle='#0d1030';
  x.textAlign='center'; x.textBaseline='middle'; let fs=40; x.font=fs+'px Bungee, Impact, sans-serif'; while(x.measureText(text).width>220&&fs>16){ fs-=3; x.font=fs+'px Bungee, Impact, sans-serif'; }
  x.fillText(text,128,66); const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; return bbTex[text]=t;
}
function billboard(g,x,z,side){
  const post=pal(0x455a64); [-1,1].forEach(k=>g.add(M(G.box,post,[0.12,3,0.12],[x,1.5,z+k*1.1])));
  const text=pick([tl('BEST')+' '+fmt(best)+' m',heroById(heroId).name.toUpperCase(),'KULSTORM']);
  const sign=new THREE.Mesh(G.plane,new THREE.MeshBasicMaterial({map:billboardTex(text)})); sign.scale.set(2.8,1.4,1); sign.position.set(x-side*0.1,3.4,z); sign.rotation.y=-side*1.0; g.add(sign);
  return {kind:'building',r:1.4,h:4.1};
}
// Rare oddities, about one prop in 30: a giant rubber duck, a statue of the leader, or a UFO parked on a roof.
function rareProp(g,x,z,side){
  const k=Math.random();
  if(k<0.34){ const y=pal(0xffd600); g.add(M(G.sph,y,[1.3,1,1.1],[x,1,z])); g.add(M(G.sph,y,[0.75,0.75,0.75],[x,2.2,z+0.4])); const b=M(G.box,pal(0xff7a00),[0.5,0.18,0.5],[x,2.1,z+1.1],false); g.add(b); [-1,1].forEach(e=>g.add(M(G.sph,pal(0x212121),[0.09,0.09,0.09],[x+e*0.3,2.4,z+0.95],false))); return {kind:'building',r:1.4,h:3}; }
  if(k<0.67){ const st=pal(0x9e9e9e,{r:0.7}); g.add(M(G.box,st,[1.4,0.8,1.4],[x,0.4,z])); g.add(M(G.box,st,[0.5,0.9,0.4],[x,1.25,z])); g.add(M(G.box,st,[0.7,0.8,0.45],[x,2.1,z])); g.add(M(G.box,st,[0.5,0.5,0.5],[x,2.8,z])); const arm=M(G.box,st,[0.18,0.8,0.18],[x+0.45,2.8,z],false); arm.rotation.z=-0.5; g.add(arm); g.add(M(G.box,pal(0xffd21f),[0.56,0.1,0.56],[x,3.1,z],false)); return {kind:'building',r:0.9,h:3.2}; }
  const h=rand(3,6); g.add(M(G.box,pal(0x37474f),[2,h,2],[x,h/2,z]));
  const ufo=new THREE.Group(); ufo.position.set(x,h+1.2,z); ufo.add(M(G.cyl,pal(0xb0bec5,{r:0.2}),[1.2,0.18,1.2],[0,0,0])); ufo.add(M(G.sph,pal(0x80deea,{e:0.8}),[0.55,0.4,0.55],[0,0.15,0])); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; ufo.add(M(G.sph,blinkMat,[0.08,0.08,0.08],[Math.cos(a)*1.1,-0.02,Math.sin(a)*1.1],false)); } g.add(ufo);
  return {kind:'building',r:1.2,h,ufo,uy:h+1.2};
}
// Barrels and piggy banks by the curb: shoot a barrel to blow up nearby enemies, a piggy bank for coins.
function roadside(g,side,z){
  const x=side*(HALF+0.8);
  if(Math.random()<0.6){ const m=pal(0xd32f2f,{r:0.4}); g.add(M(G.cyl,m,[0.4,0.9,0.4],[x,0.45,z])); g.add(M(G.cyl,pal(0xffd21f),[0.42,0.08,0.42],[x,0.6,z],false)); return {kind:'barrel',r:0.6}; }
  const p=pal(0xff8fb1,{r:0.35}); g.add(M(G.sph,p,[0.45,0.38,0.38],[x,0.42,z])); g.add(M(G.cyl,p,[0.16,0.12,0.16],[x,0.42,z+0.42],false)); [-1,1].forEach(k=>[-1,1].forEach(j=>g.add(M(G.cyl,p,[0.07,0.2,0.07],[x+k*0.2,0.1,z+j*0.2],false)))); g.add(M(G.box,pal(0x212121),[0.2,0.04,0.04],[x,0.8,z],false));
  return {kind:'piggy',r:0.6};
}
let zoneIdx=0;
const tgt={sky:RAW(ZONES[0].sky),fog:RAW(ZONES[0].fog),ground:C(ZONES[0].ground),road:C(ZONES[0].road),road2:C(ZONES[0].road2),stripe:C(ZONES[0].stripe),curb:C(ZONES[0].curb),hemiSky:C(ZONES[0].sky),hemiGround:C(ZONES[0].ground),glow:0};
function setZone(i,instant){
  zoneIdx=i; const z=ZONES[i];
  tgt.sky=RAW(z.sky); tgt.fog=RAW(z.fog); tgt.ground=C(z.ground); tgt.road=C(z.road); tgt.road2=C(z.road2); tgt.stripe=C(z.stripe); tgt.curb=C(z.curb);
  tgt.hemiSky=C(z.sky); tgt.hemiGround=C(z.ground); tgt.glow=z.dark?0.9:0;
  if(instant) updateColors(100);
}
const wSky=new THREE.Color(),wFog=new THREE.Color(),wGround=new THREE.Color(),wTint=new THREE.Color(),wTintL=new THREE.Color();
const LIGHT0={sun:1.05,hemi:0.8,fill:0.35};
const NT=C(0x010207),NH=C(0x060a18),TW_TOP=C(0x4b3f8f),DUSK_HOR=C(0xff8a5c),DAWN_HOR=C(0xffb38a),MOON_BLUE=C(0x8fa6ff),WARM=C(0xffb070),GUTTER_GOLD=C(0xffd21f);
const cTop=C(0x4a90d9),cHor=C(0xbfe3ff),tTop=new THREE.Color(),tHor=new THREE.Color(),tTmp=new THREE.Color(),tZone=new THREE.Color(),lightCol=new THREE.Color(),hemiT=new THREE.Color();
function updateColors(dt){
  const k=1-Math.exp(-dt*1.4);
  const wd=weatherDef(),lv=wd.light!==undefined?wd.light:1,amt=(wd.tintAmt||0)*(0.35+0.65*DN.dayF);
  wTintL.set(wd.tint||0xffffff).convertSRGBToLinear();
  // sky colours: night → dawn/dusk glow → the zone's day colours, then the weather tint on top
  tZone.copy(tgt.fog).convertSRGBToLinear();
  tTop.copy(tgt.sky).convertSRGBToLinear(); tTop.lerp(tTmp.setRGB(tTop.r*0.45,tTop.g*0.62,tTop.b*0.95),0.7);
  tTmp.copy(NT).lerp(tTop,DN.dayF); tTop.copy(tTmp).lerp(TW_TOP,DN.twi*0.55);
  tZone.lerp(tTop,0.5); tTmp.copy(NH).lerp(tZone,0.025).lerp(tZone,DN.dayF); tHor.copy(tTmp).lerp(DN.u<0.25||DN.u>0.9?DAWN_HOR:DUSK_HOR,DN.twi*0.85);
  tTop.lerp(wTintL,amt); tHor.lerp(wTintL,amt*0.85);
  cTop.lerp(tTop,k); cHor.lerp(tHor,k);
  skyU.top.value.copy(cTop); skyU.hor.value.copy(cHor); skyU.bot.value.copy(cHor).lerp(cTop,0.5).multiplyScalar(0.8);
  scene.fog.color.copy(cHor);
  wGround.copy(tgt.ground); if(wd.ground) wGround.lerp(C(wd.ground),0.6);
  const fn=wd.fogNear!==undefined?Math.min(VIEW.fogNear,wd.fogNear):VIEW.fogNear,ff=wd.fogFar!==undefined?Math.min(VIEW.fogFar,wd.fogFar):VIEW.fogFar;
  scene.fog.near=lerp(scene.fog.near,fn,k); scene.fog.far=lerp(scene.fog.far,ff,k);
  // lights: the sun by day, moonlight by night (brighter at full moon), warm at dawn/dusk
  const moonLight=(0.07+0.33*DN.moonB)*(DN.moonUp?1:0.45);
  sun.intensity=lerp(sun.intensity,LIGHT0.sun*lv*DN.dayF*(1-0.35*DN.twi)+moonLight*DN.nightF,k);
  lightCol.setRGB(1,1,1).lerp(WARM,DN.twi*0.8).lerp(MOON_BLUE,DN.nightF); sun.color.lerp(lightCol,k);
  hemi.intensity=lerp(hemi.intensity,LIGHT0.hemi*Math.max(0.25,lv)*(0.16+0.84*DN.dayF)+0.06*DN.moonB*DN.nightF,k);
  fill.intensity=lerp(fill.intensity,LIGHT0.fill*lv*(0.12+0.88*DN.dayF),k);
  spot.intensity=lerp(spot.intensity,2.6*smooth(0.35,0.75,DN.nightF),k);
  groundMat.color.lerp(wGround,k); roadMat.color.lerp(tgt.road,k); roadMat2.color.lerp(tgt.road2,k);
  const glow=Math.max(tgt.glow,DN.glowF*0.45);
  stripeMat.color.lerp(tgt.stripe,k); stripeMat.emissive.copy(stripeMat.color); stripeMat.emissiveIntensity=lerp(stripeMat.emissiveIntensity,glow,k);
  const gutter=S&&S.T&&S.T.gutter;
  curbMat.color.lerp(gutter?GUTTER_GOLD:tgt.curb,k); curbMat.emissive.copy(curbMat.color); curbMat.emissiveIntensity=lerp(curbMat.emissiveIntensity,gutter?0.7:glow*0.6,k);
  hemiT.copy(tgt.hemiSky).lerp(NH,DN.nightF*0.85); hemi.color.lerp(hemiT,k); hemi.groundColor.lerp(tgt.hemiGround,k);
  for(const g of NIGHT_GLOW) g.m.emissiveIntensity=g.base*DN.glowF;
  envAmb.intensity=0.01*(0.1+0.9*DN.dayF)*Math.max(0.35,lv);
  lampPoolMat.opacity=0.28*DN.glowF;
}
function updateSky(dt){
  const u=cycU(); DN.u=u;
  DN.dayF=smooth(0.02,0.11,u)*(1-smooth(0.45,0.55,u));
  DN.nightF=1-DN.dayF;
  DN.glowF=smooth(0.3,0.75,DN.nightF);
  DN.twi=Math.max(Math.exp(-Math.pow((u-0.06)/0.04,2)),Math.exp(-Math.pow((u-0.5)/0.045,2)),Math.exp(-Math.pow((u-1.06)/0.04,2)));
  const pi=moonPhaseIdx(); DN.phaseIdx=pi; DN.phase=pi/8; DN.moonB=1-Math.abs(DN.phase-0.5)*2; DN.full=pi===4;
  const sa=(u-0.02)/0.53,ma=(u-0.5)/0.49;
  DN.sunUp=sa>0&&sa<1; DN.moonUp=OPT.daynight&&ma>0&&ma<1;
  arcDir(sunDirV,clamp(sa,0,1)); arcDir(moonDirV,clamp(ma,0,1));
  skyGroup.position.copy(camera.position);
  sunMesh.position.copy(sunDirV).multiplyScalar(130); sunMesh.visible=DN.sunUp;
  sunU.col.value.setRGB(1,0.95,0.8).lerp(WARM,DN.twi*0.7);
  moonMesh.position.copy(moonDirV).multiplyScalar(125); moonMesh.visible=DN.moonUp&&pi!==0; moonMesh.lookAt(camera.position); moonU.phase.value=DN.phase;
  skyU.sunDir.value.copy(sunDirV); skyU.moonDir.value.copy(moonDirV);
  skyU.sunCol.value.setRGB(1,0.85,0.6).lerp(DUSK_HOR,DN.twi*0.6);
  skyU.sunGlow.value=DN.sunUp?(0.5+0.8*DN.twi)*Math.max(DN.dayF,DN.twi):0;
  skyU.moonGlow.value=moonMesh.visible?(0.3+0.7*DN.moonB)*DN.nightF:0;
  const wd=weatherDef(),clouds=W.id==='clear'||W.id==='heat'?0:Math.min(1,(wd.tintAmt||0)*1.6);
  const starVis=DN.nightF*DN.nightF*(1-0.85*clouds)*(1-0.45*DN.moonB*(DN.moonUp?1:0));
  starU.night.value=starVis; starU.time.value=time;
  skyU.milky.value=starVis*0.5; skyU.time.value=time;
  if(mode==='playing'||mode==='menu'){
    // shooting stars
    shoot.cd-=dt;
    if(shoot.t<=0&&shoot.cd<=0&&starVis>0.4){ shoot.cd=rand(3,9); shoot.t=0.8; const a=rand(-0.9,0.9),y=rand(0.08,0.3); shoot.from.set(Math.sin(a),y,-Math.cos(a)).normalize().multiplyScalar(128); const s=Math.random()<0.5?-1:1; shoot.to.set(Math.sin(a+s*0.3),y-0.12,-Math.cos(a+s*0.3)).normalize().multiplyScalar(128); }
    if(shoot.t>0){ shoot.t-=dt; const f=1-shoot.t/0.8; const p=tmpV.copy(shoot.from).lerp(shoot.to,f); shootMesh.position.copy(p); shootMesh.lookAt(tmpS.copy(shoot.to).add(skyGroup.position)); shootMesh.scale.set(0.12,0.12,6*(1-Math.abs(f-0.5))); shootU.a.value=Math.sin(Math.PI*f)*starVis; shootMesh.visible=true; } else shootMesh.visible=false;
  }
  const auroraOn=ZONES[zoneIdx].props==='ice'?1:0;
  auroraU.a.value=lerp(auroraU.a.value,auroraOn*starVis*1.1,1-Math.exp(-dt*0.8)); auroraU.time.value=time;
  auroras.forEach(r=>{ r.visible=auroraU.a.value>0.01; });
}
const tiles=[];
(function makeTiles(){
  for(let i=0;i<TILES;i++){
    const g=new THREE.Group();
    const road=M(G.tile,i%2?roadMat2:roadMat,[ROAD_W,0.3,TILE_L],[0,-0.15,0],false); road.receiveShadow=true; g.add(road);
    const cl=M(G.box,curbMat,[0.6,0.36,TILE_L],[-HALF-0.3,-0.02,0]); cl.receiveShadow=true; g.add(cl);
    const cr=M(G.box,curbMat,[0.6,0.36,TILE_L],[HALF+0.3,-0.02,0]); cr.receiveShadow=true; g.add(cr);
    [-2,2].forEach(x=>g.add(M(G.box,stripeMat,[0.22,0.14,TILE_L],[x,0.07,0],false)));
    [-1,1].forEach(sd=>{
      const x=sd*(HALF+0.95),z=sd*2.5;
      g.add(M(G.box,lampPoleMat,[0.14,3.2,0.14],[x,1.6,z]));
      g.add(M(G.box,lampPoleMat,[0.9,0.1,0.1],[x-sd*0.45,3.15,z]));
      g.add(M(G.box,lampHeadMat,[0.42,0.14,0.26],[x-sd*0.85,3.05,z],false));
      const pool=new THREE.Mesh(G.cyl,lampPoolMat); pool.scale.set(1.6,0.01,1.6); pool.position.set(x-sd*1.3,0.03,z); g.add(pool);
    });
    const props=new THREE.Group(); g.add(props); g.userData.props=props;
    g.position.z=-110+i*TILE_L; scene.add(g); tiles.push(g);
  }
})();
function fillProps(props){
  while(props.children.length) props.remove(props.children[0]);
  const fn=PROPS[ZONES[zoneIdx].props];
  // each prop sits in its own group at (x,0,z) so it can wobble, tip over or animate on its own
  const place=(build,x,z,side)=>{ const sub=new THREE.Group(),info=build(sub,x,z,side)||{}; sub.children.forEach(c=>{ c.position.x-=x; c.position.z-=z; }); sub.position.set(x,0,z); sub.userData=Object.assign({kind:'small',r:1,side,hit:0,wob:0,fall:0},info); props.add(sub); };
  for(const side of [-1,1]){
    const n=ri(2,4); for(let k=0;k<n;k++) place(Math.random()<1/30?rareProp:fn,side*(HALF+1.3+rand(0,8)),rand(-TILE_L/2+0.6,TILE_L/2-0.6),side);
    if(Math.random()<0.16) place((g,x,z)=>roadside(g,side,z),side*(HALF+0.8),rand(-TILE_L/2+0.6,TILE_L/2-0.6),side);
  }
}
function rebuildTiles(){ tiles.forEach(t=>fillProps(t.userData.props)); }
const clouds=[];
(function makeClouds(){
  const m0=mat(0xffffff,{r:0.9});
  for(let i=0;i<10;i++){
    const g=new THREE.Group(),n=ri(3,5),m=m0.clone(); m.transparent=true; g.userData.m=m;
    for(let k=0;k<n;k++){ const r=rand(1,2.4); g.add(M(G.ico,m,[r,r*0.65,r],[k*1.6-n*0.8,rand(-0.2,0.3),rand(-0.6,0.6)],false)); }
    g.position.set(rand(-34,34),rand(11,18),rand(-110,10)); scene.add(g); clouds.push(g);
  }
})();
// Clouds close to the camera turn see-through so they never hide the lanes.
function cloudFade(g,m){
  const o=clamp((g.position.distanceTo(camera.position)-8)/14,0.25,1);
  m.opacity=o; m.depthWrite=o>0.99;
}
function updateWorld(dt){
  tiles.forEach(t=>{ t.position.z+=scroll*dt; if(t.position.z>28){ t.position.z-=TILES*TILE_L; fillProps(t.userData.props); } });
  clouds.forEach(c=>{ c.position.z+=scroll*0.25*dt; if(c.position.z>20){ c.position.z=-115; c.position.x=rand(-34,34); } cloudFade(c,c.userData.m); });
}

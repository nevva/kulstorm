'use strict';
// ---------- day/night cycle state
// u runs 0→1 over CYC.len metres: ~0.06 dawn, day until ~0.45, dusk ~0.5, night 0.55→1. Each new cycle is a new night with the next moon phase.
const CYC={start:0,off:0.12,moon0:4,len:900};
let menuSky=true;
const DN={u:0.25,dayF:1,nightF:0,twi:0,glowF:0,phase:0.5,phaseIdx:4,moonB:1,full:false,sunUp:true,moonUp:false};
const MOON_NAMES=['Nymåne','Växande skära','Halvmåne','Växande måne','Fullmåne','Avtagande måne','Halvmåne','Avtagande skära'];
function cycU(){
  if(!OPT.daynight) return 0.25;
  if(menuSky) return (0.4+time*0.006)%1;
  return (((dist-CYC.start)/CYC.len+CYC.off)%1+1)%1;
}
function nightIndex(){ return menuSky?Math.floor(0.4+time*0.006):Math.floor((dist-CYC.start)/CYC.len+CYC.off); }
function moonPhaseIdx(){ return ((CYC.moon0+nightIndex())%8+8)%8; }
const smooth=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };

// Materials that light up at night (lamps, windows, mushrooms, enemy eyes). Their emissive intensity follows DN.glowF.
const NIGHT_GLOW=[];
function glowMat(color,emissive,base,o){
  o=o||{};
  const m=new THREE.MeshStandardMaterial({color:C(color),emissive:C(emissive),emissiveIntensity:0,roughness:o.r!==undefined?o.r:0.35,flatShading:true});
  NIGHT_GLOW.push({m,base}); return m;
}
const lampHeadMat=glowMat(0xfff3d0,0xffd27a,2.4,{r:0.2});
const windowMat=glowMat(0x2a3550,0xffd27a,1.6,{r:0.15}),windowMat2=glowMat(0x2a3550,0x9fd8ff,1.4,{r:0.15});
const shroomMat=glowMat(0x4dd0e1,0x18ffff,1.8,{r:0.3}),shroomMat2=glowMat(0xf48fb1,0xff4fd8,1.8,{r:0.3});
const iceGlowMat=glowMat(0xb3f0ff,0x6fe6ff,1.2,{r:0.12});
const enemyEyeMat=glowMat(0xffffff,0xfff3a0,1.6,{r:0.2});
const lampPoleMat=mat(0x37474f,{r:0.4,m:0.3});
const lampPoolMat=new THREE.MeshBasicMaterial({color:C(0xffc870),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});

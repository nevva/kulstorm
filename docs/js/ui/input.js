'use strict';
// ---------- input
let drag=null;
// Mouse: a click captures the pointer (pointer lock). Sideways movement steers, left click jumps, right click ducks, middle click = OVERDRIVE.
let mouseSens=load('kulstorm_msens',1),mouseHinted=false;
const locked=()=>document.pointerLockElement===canvas;
function lockMouse(){ try{ const r=canvas.requestPointerLock&&canvas.requestPointerLock(); if(r&&r.catch) r.catch(()=>{}); }catch(err){} }
function unlockMouse(){ try{ if(locked()) document.exitPointerLock(); }catch(err){} }
function mouseButton(b){ if(b===0) squadJump(); else if(b===2) squadDuck(); else if(b===1) triggerOD(); }
document.addEventListener('pointerlockchange',()=>{ if(!locked()&&mode==='playing') pauseGame(); });
document.addEventListener('mousemove',e=>{ if(locked()&&mode==='playing') S.targetX=clamp(S.targetX+e.movementX*0.012*mouseSens,-HALF+0.5,HALF-0.5); });
document.addEventListener('mousedown',e=>{ if(locked()&&mode==='playing'){ e.preventDefault(); mouseButton(e.button); } });
canvas.addEventListener('contextmenu',e=>{ if(mode==='playing') e.preventDefault(); });
canvas.addEventListener('mousemove',()=>{ if(OPT.mouse&&mode==='playing'&&!locked()&&!mouseHinted){ mouseHinted=true; showHint('Klicka för att ta muskontroll · Esc släpper'); } });
canvas.addEventListener('pointerdown',e=>{
  if(mode!=='playing') return;
  if(e.pointerType==='mouse'&&OPT.mouse){
    if(locked()) return;
    if(canvas.requestPointerLock){ lockMouse(); return; }
    if(e.button!==0){ e.preventDefault(); mouseButton(e.button); return; }
  }
  drag={sx:e.clientX,sy:e.clientY,px:S.targetX,moved:false,vdone:false}; try{ canvas.setPointerCapture(e.pointerId); }catch(err){} });
canvas.addEventListener('pointermove',e=>{
  if(!drag||mode!=='playing') return;
  const dxp=e.clientX-drag.sx,dyp=e.clientY-drag.sy;
  if(Math.abs(dxp)>6||Math.abs(dyp)>6) drag.moved=true;
  S.targetX=clamp(drag.px+dxp/window.innerWidth*ROAD_W*1.5,-HALF+0.5,HALF-0.5);
  if(!drag.vdone&&Math.abs(dyp)>40&&Math.abs(dyp)>Math.abs(dxp)*1.2){
    drag.vdone=true;
    if(OPT.obstacles){ if(dyp<0) squadJump(); else squadDuck(); }
    else cycleFront(dyp<0?1:-1);
  }
});
canvas.addEventListener('pointerup',e=>{
  if(drag&&!drag.moved&&mode==='playing'&&e.pointerType==='mouse'&&OPT.mouse) squadJump();
  drag=null;
});
// Tap a squad chip in the HUD to put that gubbe in front.
chipsEl.addEventListener('click',e=>{
  return;
  const el=e.target.closest('.chip.sq'); if(!el||mode!=='playing'||!OPT.front) return;
  const m=squad.find(x=>x.chip===el); if(!m) return;
  S.frontM=m; layoutSquad(); hudFront=null; toast(m.def.name+' i front'); sfx.zone();
});
canvas.addEventListener('pointercancel',()=>{ drag=null; });
window.addEventListener('keydown',e=>{
  if(mode==='shop'){
    const n=R.offers.length,k=e.key;
    if(k==='ArrowLeft'||k==='a'||k==='A'){ e.preventDefault(); R.sel=(R.sel-1+n)%n; renderBuy(); sfx.duck(); }
    else if(k==='ArrowRight'||k==='d'||k==='D'){ e.preventDefault(); R.sel=(R.sel+1)%n; renderBuy(); sfx.duck(); }
    else if(k===' '||k==='Enter'){ e.preventDefault(); if(!e.repeat){ const o=R.offers[R.sel]; if(o&&buyOffer(o)) closeShop(); } e.stopImmediatePropagation(); return; }
    else if(k==='Escape'){ e.preventDefault(); closeShop(); }
    else if(k==='r'||k==='R'){ e.preventDefault(); shopReroll(); }
    else if(/^[1-3]$/.test(k)){ const i=+k-1; if(R.offers[i]){ R.sel=i; if(buyOffer(R.offers[i])) closeShop(); else { const msg=$('shopwallet').textContent; renderBuy(); $('shopwallet').textContent=msg; } } }
    e.stopImmediatePropagation(); return;
  }
  if(e.target&&(e.target.tagName==='BUTTON'||e.target.tagName==='SELECT'||e.target.tagName==='INPUT')) return;
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){ e.preventDefault(); keys.l=true; }
  if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){ e.preventDefault(); keys.r=true; }
  if(mode==='playing'&&(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W')){ e.preventDefault(); if(!e.repeat) squadJump(); }
  if(mode==='playing'&&(e.key==='ArrowDown'||e.key==='Shift'||e.key==='s'||e.key==='S')){ e.preventDefault(); if(!e.repeat) squadDuck(); }
  if(mode==='playing'&&(e.key==='e'||e.key==='E')){ e.preventDefault(); if(!e.repeat) triggerOD(); }
  if((e.key==='Enter'||e.key===' ')&&((mode==='menu'&&!$('menu-main').hidden)||(mode==='dead'&&overShown))){ e.preventDefault(); startGame(); }
});
window.addEventListener('keyup',e=>{
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') keys.l=false;
  if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') keys.r=false;
});
$('mute').addEventListener('click',()=>{ sfx.enabled=!sfx.enabled; const on=sfx.enabled; $('spk1').hidden=!on; $('spk2').hidden=!on; $('spkx').hidden=on; });
$('play').addEventListener('click',()=>startGame());
$('again').addEventListener('click',()=>startGame(lastCfg));
$('to-menu').addEventListener('click',()=>{ overEl.hidden=true; clearRun(); mode='menu'; showMenu('main'); });

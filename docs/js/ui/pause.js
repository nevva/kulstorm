'use strict';
// ---------- pause
const pauseEl=$('pause');
function pauseGame(){
  if(mode==='playing') unlockMouse();
  if(mode!=='playing') return;
  mode='paused'; keys.l=keys.r=false; drag=null;
  $('pdist').textContent=fmt(dist); $('pkills').textContent=fmt(kills); $('pcoins').textContent=fmt(coinsRun);
  $('ppower').textContent='Fiender på skärmen: '+aliveCount()+' / '+enemyCap()+' · Truppstyrka ×'+squadPower().toFixed(1)+' · Fiende-HP ×'+(DIFF.hp*PF).toFixed(1)+' · Fiendeskada ×'+DIFF.dmg.toFixed(1);
  const ps=$('psquad'); ps.innerHTML='';
  squad.forEach(m=>{ const el=document.createElement('span'); el.className='chip sq'; el.style.borderColor=hexCss(m.def.shirt); el.textContent=chipText(m); ps.appendChild(el); });
  S.perks.forEach(p=>{ const el=document.createElement('span'); el.className='chip tp'; el.textContent=p.short; ps.appendChild(el); });
  COMBOS.forEach(c=>{ if(!S.combos.has(c.id)) return; const el=document.createElement('span'); el.className='chip combo'; el.textContent=c.name; ps.appendChild(el); });
  $('pause-main').hidden=false; $('pause-opts').hidden=true;
  pauseEl.hidden=false; $('p-resume').focus({preventScroll:true});
}
function resumeGame(){
  if(mode!=='paused') return;
  pauseEl.hidden=true; mode='playing'; last=performance.now(); sfx.resume();
  rebuildChips(); updateHUD();
}
$('pausebtn').addEventListener('click',pauseGame);
$('odbtn').addEventListener('click',e=>{ e.stopPropagation(); triggerOD(); });
$('p-resume').addEventListener('click',resumeGame);
$('p-restart').addEventListener('click',()=>{ pauseEl.hidden=true; startGame(lastCfg); });
$('p-opts').addEventListener('click',()=>{ renderOpts('popts'); $('pause-main').hidden=true; $('pause-opts').hidden=false; });
$('p-opts-back').addEventListener('click',()=>{ $('pause-opts').hidden=true; $('pause-main').hidden=false; });
$('p-menu').addEventListener('click',()=>{
  if(!labRun&&OPT.coins&&coinsRun>0){ bank+=coinsRun; saveBank(); }
  commitHeroXp();
  pauseEl.hidden=true; hudEl.hidden=true; clearRun(); mode='menu'; showMenu('main');
});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){
    if(mode==='playing'){ e.preventDefault(); pauseGame(); }
    else if(mode==='paused'){ e.preventDefault(); if(!$('pause-opts').hidden){ $('pause-opts').hidden=true; $('pause-main').hidden=false; } else resumeGame(); }
  }
});
document.addEventListener('visibilitychange',()=>{ if(document.hidden) pauseGame(); });
window.addEventListener('blur',()=>pauseGame());

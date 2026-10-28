'use strict';
// ---------- pause
const pauseEl=$('pause');
function pauseGame(){
  if(mode==='playing') unlockMouse();
  if(mode!=='playing') return;
  mode='paused'; keys.l=keys.r=false; drag=null;
  $('pdist').textContent=fmt(dist); $('pkills').textContent=fmt(kills); $('pcoins').textContent=fmt(coinsRun);
  $('ppower').textContent=tl('Enemies on screen: {0} / {1} · Squad power ×{2} · Enemy HP ×{3} · Enemy damage ×{4}',aliveCount(),enemyCap(),squadPower().toFixed(1),(DIFF.hp*PF).toFixed(1),DIFF.dmg.toFixed(1));
  const ps=$('psquad'),pd=$('pdesc'); ps.innerHTML=''; pd.textContent=tl('Tap a squad member or upgrade to read more');
  // Each chip is a button: tapping it shows its name and what it does under the list.
  const chip=(cls,text,name,desc)=>{ const el=document.createElement('button'); el.type='button'; el.className='chip '+cls; el.textContent=text;
    el.addEventListener('click',()=>{ ps.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); pd.textContent=name+(desc?' – '+desc:''); });
    ps.appendChild(el); return el; };
  const hero=heroById(lastCfg&&lastCfg.hero);
  squad.forEach(m=>{ const lead=m.def.id==='leader'; chip('sq'+(OPT.front&&m===S.frontM?' front':''),chipText(m),lead?tl('You ({0})',hero.name):m.def.name,(lead?hero.desc:m.def.desc)+(m.form?'. '+tl('Daily form')+': '+formText(m):'')).style.borderColor=hexCss(m.def.shirt); });
  S.perks.forEach(p=>chip('tp',p.short,p.name,p.desc));
  { const u=UPGRADES.find(x=>x.id==='unicorn'); unicorns.forEach(()=>chip('uni',u.short,u.name,u.desc)); }
  COMBOS.forEach(c=>{ if(S.combos.has(c.id)) chip('combo',c.name,tl('Combo')+': '+c.name,c.desc); });
  renderEffects();
  $('pause-main').hidden=false; $('pause-opts').hidden=true;
  pauseEl.hidden=false; $('p-resume').focus({preventScroll:true});
}
// Combined effects: what all gubbar, team upgrades, combos and talents add up to right now. Only non-default values are listed.
function renderEffects(){
  const A=S.A,T=S.T,L=[],pct=k=>(k>=1?'+':'')+Math.round((k-1)*100)+PCT;
  if(A){
    if(Math.abs(A.dmg-1)>0.005) L.push([tl('Damage'),pct(A.dmg)]);
    if(Math.abs(A.rate-1)>0.005) L.push([tl('Fire rate'),pct(A.rate)]);
    if(A.extra) L.push([tl('Extra bullets'),'+'+A.extra]);
    if(A.pierce) L.push([tl('Piercing'),'+'+A.pierce]);
    if(A.crit>0) L.push([tl('Crit chance'),Math.round(A.crit*100)+PCT]);
    if(Math.abs(A.bullet-1)>0.005) L.push([tl('Bullet size'),pct(A.bullet)]);
    if(Math.abs(A.speed-1)>0.005) L.push([tl('Speed'),pct(A.speed)]);
    if(A.regen>0) L.push([tl('Healing'),A.regen+' HP/s']);
    if(A.magnet) L.push([tl('Magnet'),tl('on')]);
    if(A.bounce) L.push([tl('Bouncing bullets'),tl('on')]);
  }
  if(T.hpBonus) L.push([tl('Max HP'),'+'+T.hpBonus]);
  if(T.heartMult!==1) L.push([tl('Hearts'),pct(T.heartMult)]);
  if(Math.abs(T.coinMult-1)>0.005) L.push([tl('Coins'),pct(T.coinMult)]);
  if(Math.abs(T.kb-1)>0.005) L.push([tl('Knockback'),pct(T.kb)]);
  if(T.shockLv) L.push([tl('Shock ring'),tl('{0}% chance',Math.round(10*T.shockLv))]);
  if(T.ricochet) L.push([tl('Ricochet'),tl('on')]);
  if(T.gutter) L.push([tl('Edge bounces'),tl('on')]);
  if(T.eagle) L.push([tl('Longer sight'),tl('on')]);
  const el=$('peffects'); el.innerHTML=''; $('peffects-h').hidden=!L.length;
  for(const [k,v] of L){ const r=document.createElement('div'); const a=document.createElement('span'); a.textContent=k; const b=document.createElement('b'); b.textContent=v; r.append(a,b); el.appendChild(r); }
}
function resumeGame(){
  if(mode!=='paused') return;
  pauseEl.hidden=true; mode='playing'; last=performance.now(); sfx.resume();
  updateHUD();
}
$('pausebtn').addEventListener('click',pauseGame);
$('odbtn').addEventListener('click',e=>{ e.stopPropagation(); triggerOD(); });
$('p-resume').addEventListener('click',resumeGame);
$('p-restart').addEventListener('click',()=>{ pauseEl.hidden=true; startGame(lastCfg); });
$('p-opts').addEventListener('click',()=>{ renderOpts('popts'); $('pause-main').hidden=true; $('pause-opts').hidden=false; });
$('p-opts-back').addEventListener('click',()=>{ $('pause-opts').hidden=true; $('pause-main').hidden=false; });
$('p-menu').addEventListener('click',()=>{
  bankRun();
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

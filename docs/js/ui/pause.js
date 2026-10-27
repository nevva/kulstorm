'use strict';
// ---------- pause
const pauseEl=$('pause');
function pauseGame(){
  if(mode==='playing') unlockMouse();
  if(mode!=='playing') return;
  mode='paused'; keys.l=keys.r=false; drag=null;
  $('pdist').textContent=fmt(dist); $('pkills').textContent=fmt(kills); $('pcoins').textContent=fmt(coinsRun);
  $('ppower').textContent='Fiender på skärmen: '+aliveCount()+' / '+enemyCap()+' · Truppstyrka ×'+squadPower().toFixed(1)+' · Fiende-HP ×'+(DIFF.hp*PF).toFixed(1)+' · Fiendeskada ×'+DIFF.dmg.toFixed(1);
  const ps=$('psquad'),pd=$('pdesc'); ps.innerHTML=''; pd.textContent='Tryck på en gubbe eller uppgradering för att läsa mer';
  // Each chip is a button: tapping it shows its name and what it does under the list.
  const chip=(cls,text,name,desc)=>{ const el=document.createElement('button'); el.type='button'; el.className='chip '+cls; el.textContent=text;
    el.addEventListener('click',()=>{ ps.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel')); el.classList.add('sel'); pd.textContent=name+(desc?' – '+desc:''); });
    ps.appendChild(el); return el; };
  const hero=heroById(lastCfg&&lastCfg.hero);
  squad.forEach(m=>{ const lead=m.def.id==='leader'; chip('sq'+(OPT.front&&m===S.frontM?' front':''),chipText(m),lead?'Du ('+hero.name+')':m.def.name,lead?hero.desc:m.def.desc).style.borderColor=hexCss(m.def.shirt); });
  S.perks.forEach(p=>chip('tp',p.short,p.name,p.desc));
  { const u=UPGRADES.find(x=>x.id==='unicorn'); unicorns.forEach(()=>chip('uni',u.short,u.name,u.desc)); }
  COMBOS.forEach(c=>{ if(S.combos.has(c.id)) chip('combo',c.name,'Kombo: '+c.name,c.desc); });
  renderEffects();
  $('pause-main').hidden=false; $('pause-opts').hidden=true;
  pauseEl.hidden=false; $('p-resume').focus({preventScroll:true});
}
// Combined effects: what all gubbar, team upgrades, combos and talents add up to right now. Only non-default values are listed.
function renderEffects(){
  const A=S.A,T=S.T,L=[],pct=k=>(k>=1?'+':'')+Math.round((k-1)*100)+' %';
  if(A){
    if(Math.abs(A.dmg-1)>0.005) L.push(['Skada',pct(A.dmg)]);
    if(Math.abs(A.rate-1)>0.005) L.push(['Eldhastighet',pct(A.rate)]);
    if(A.extra) L.push(['Extra kulor','+'+A.extra]);
    if(A.pierce) L.push(['Genomslag','+'+A.pierce]);
    if(A.crit>0) L.push(['Kritisk chans',Math.round(A.crit*100)+' %']);
    if(Math.abs(A.bullet-1)>0.005) L.push(['Kulstorlek',pct(A.bullet)]);
    if(Math.abs(A.speed-1)>0.005) L.push(['Fart',pct(A.speed)]);
    if(A.regen>0) L.push(['Läkning',A.regen+' HP/s']);
    if(A.magnet) L.push(['Magnet','på']);
    if(A.bounce) L.push(['Studsande kulor','på']);
  }
  if(T.hpBonus) L.push(['Max-HP','+'+T.hpBonus]);
  if(T.heartMult!==1) L.push(['Hjärtan',pct(T.heartMult)]);
  if(Math.abs(T.coinMult-1)>0.005) L.push(['Mynt',pct(T.coinMult)]);
  if(Math.abs(T.kb-1)>0.005) L.push(['Knuff',pct(T.kb)]);
  if(T.shockLv) L.push(['Chockring',Math.round(10*T.shockLv)+' % chans']);
  if(T.ricochet) L.push(['Rikoschett','på']);
  if(T.gutter) L.push(['Kantstudsar','på']);
  if(T.eagle) L.push(['Längre sikt','på']);
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

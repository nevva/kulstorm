'use strict';
// ---------- menu, shop, lab, options
const PANELS=['main','shop','lab','opts','heroprog'];
function showMenu(which){
  if(mode==='menu') menuSky=true;
  PANELS.forEach(p=>{ $('menu-'+p).hidden=p!==which; });
  menuEl.hidden=false; menuEl.scrollTop=0;
  if(which==='main') renderMain(); if(which==='shop') renderShop(); if(which==='lab') renderLab(); if(which==='opts') renderOpts(); if(which==='heroprog') renderHeroProg();
}
function leaderDef(h){ return {id:'leader',kind:'gubbe',name:'Du',short:'Du',weapon:h.weapon||'pistol',hp:h.hp||100,shirt:h.shirt}; }
function renderMain(){
  $('menubest').textContent=best>0?'Rekord: '+fmt(best)+' m':'Inget rekord ännu';
  $('menucoins').textContent=OPT.coins?fmt(bank)+' mynt i banken':''; $('menucoins').hidden=!OPT.coins;
  const free=heroFree();
  $('menuhero').textContent='Startgubbe: '+heroById(heroId).name+(OPT.heroprog?' · Hjältenivå '+HERO.lvl+(free>0?' · '+free+' poäng att fördela':''):'');
  $('open-heroprog').hidden=!OPT.heroprog; $('open-heroprog').textContent=free>0?'Hjälte ('+free+')':'Hjälte';
  $('open-shop').hidden=!OPT.coins;
  if(mode==='menu'){ clearSquad(); S=freshState(); addMember(leaderDef(heroById(heroId))); }
}
function renderShop(){
  $('shopcoins').textContent=fmt(bank)+' mynt i banken';
  const box=$('heroes'); box.innerHTML='';
  HEROES.forEach(h=>{
    const own=owned.indexOf(h.id)>=0,sel=heroId===h.id;
    const card=document.createElement('div'); card.className='hero'+(sel?' sel':'');
    const sw=document.createElement('div'); sw.className='sw'; sw.style.background=hexCss(h.shirt); card.appendChild(sw);
    const t=document.createElement('h4'); t.textContent=h.name; card.appendChild(t);
    const p=document.createElement('p'); p.textContent=h.desc; card.appendChild(p);
    const b=document.createElement('button'); b.type='button';
    if(sel){ b.textContent='Vald'; b.disabled=true; }
    else if(own){ b.textContent='Välj'; b.className='own'; b.addEventListener('click',()=>{ heroId=h.id; saveBank(); sfx.init(); sfx.pickup(); renderShop(); }); }
    else if(bank>=h.price){ b.textContent='Köp · '+fmt(h.price); b.addEventListener('click',()=>{ bank-=h.price; owned.push(h.id); heroId=h.id; saveBank(); sfx.init(); sfx.upgrade(); renderShop(); }); }
    else { b.textContent='Kostar '+fmt(h.price)+' · saknas '+fmt(h.price-bank); b.disabled=true; }
    card.appendChild(b); box.appendChild(card);
  });
}
const lab={hero:'rookie',dist:0,counts:{},perks:{},off:{}};
function labTotal(){ let n=0; for(const k in lab.counts) n+=lab.counts[k]; return n; }
function labHas(id){ return (lab.counts[id]||0)>0||!!lab.perks[id]; }
function renderLab(){
  const hs=$('lab-hero'); if(!hs.options.length){ HEROES.forEach(h=>{ const o=document.createElement('option'); o.value=h.id; o.textContent=h.name; hs.appendChild(o); }); hs.addEventListener('change',()=>{ lab.hero=hs.value; }); }
  hs.value=lab.hero;
  const ds=$('lab-dist'); ds.value=String(lab.dist); ds.onchange=()=>{ lab.dist=+ds.value; };
  const wsel=$('lab-weather'); wsel.value=lab.weather||''; wsel.onchange=()=>{ lab.weather=wsel.value; };
  const tsel=$('lab-tod'); tsel.value=lab.tod||''; tsel.onchange=()=>{ lab.tod=tsel.value; };
  const msel=$('lab-moon'); msel.value=lab.moon||''; msel.onchange=()=>{ lab.moon=msel.value; };
  const gl=$('lab-gubbar'); gl.innerHTML='';
  UPGRADES.filter(u=>u.kind==='gubbe').forEach(u=>{
    const row=document.createElement('div'); row.className='row'+(labHas(u.id)?' on':'');
    const nm=document.createElement('div'); nm.className='nm'; nm.textContent=u.name; const sm=document.createElement('small'); sm.textContent=u.desc; nm.appendChild(sm); row.appendChild(nm);
    const cnt=document.createElement('div'); cnt.className='cnt';
    const minus=document.createElement('button'); minus.type='button'; minus.textContent='−'; minus.setAttribute('aria-label','Färre '+u.name);
    const num=document.createElement('b'); num.textContent=String(lab.counts[u.id]||0);
    const plus=document.createElement('button'); plus.type='button'; plus.textContent='+'; plus.setAttribute('aria-label','Fler '+u.name);
    minus.addEventListener('click',()=>{ if((lab.counts[u.id]||0)>0){ lab.counts[u.id]--; renderLab(); } });
    plus.addEventListener('click',()=>{ if(labTotal()<8&&!(u.unique&&labHas(u.id))){ lab.counts[u.id]=(lab.counts[u.id]||0)+1; renderLab(); } });
    cnt.append(minus,num,plus); row.appendChild(cnt); gl.appendChild(row);
  });
  const pl=$('lab-perks'); pl.innerHTML='';
  UPGRADES.filter(u=>u.kind==='team'||u.kind==='pet').forEach(u=>{
    const l=document.createElement('label'); l.className='tog';
    const i=document.createElement('input'); i.type='checkbox'; i.id='labp-'+u.id; i.checked=!!lab.perks[u.id];
    i.addEventListener('change',()=>{ lab.perks[u.id]=i.checked; renderLab(); });
    const s=document.createElement('span'); s.textContent=u.name; const sm=document.createElement('small'); sm.textContent=u.desc; s.appendChild(sm);
    l.append(i,s); pl.appendChild(l);
  });
  const el=$('lab-enemies'); el.innerHTML='';
  Object.keys(ENEMY_NAMES).forEach(k=>{
    const d=ENEMY[k],l=document.createElement('label'); l.className='tog';
    const i=document.createElement('input'); i.type='checkbox'; i.id='labe-'+k; i.checked=!lab.off[k];
    i.addEventListener('change',()=>{ lab.off[k]=!i.checked; });
    const s2=document.createElement('span'); s2.textContent=ENEMY_NAMES[k]; const sm=document.createElement('small'); sm.textContent=(d.night?'Bara på natten · ':'')+'från '+d.unlock+' m'; s2.appendChild(sm);
    l.append(i,s2); el.appendChild(l);
  });
  $('lab-power').textContent=labEstimate();
  const cl=$('lab-combos'); cl.innerHTML='';
  COMBOS.forEach(c=>{
    const row=document.createElement('div'); row.className='row'+(labHas(c.a)&&labHas(c.b)?' on':'');
    const nm=document.createElement('div'); nm.className='nm'; nm.textContent=c.name;
    const sm=document.createElement('small'); sm.textContent=defById(c.a).name+' + '+defById(c.b).name+' – '+c.desc; nm.appendChild(sm);
    row.appendChild(nm); cl.appendChild(row);
  });
}
// Estimate the lab squad's power without spawning anything: swap in a throwaway state, measure, restore.
function labEstimate(){
  const saveS=S,saveSquad=squad,saveMode=mode;
  try{
    mode='lab-est'; S=freshState(); squad=[];
    const hero=heroById(lab.hero);
    S.T.speed=hero.speed||1; if(hero.T) for(const k in hero.T) S.T[k]*=hero.T[k];
    const defs=[leaderDef(hero)];
    (hero.extras||[]).forEach(id=>defs.push(defById(id)));
    for(const k in lab.counts) for(let i=0;i<lab.counts[k];i++) defs.push(defById(k));
    defs.slice(0,MAX_SQUAD).forEach(d=>squad.push({def:d,hp:d.hp||60,maxHp:d.hp||60,dealt:0,charges:0}));
    Object.keys(lab.perks).filter(k=>lab.perks[k]).forEach(id=>{ const d=defById(id); S.perks.push(d); if(id==='steel') S.T.dmg*=1.15; if(id==='fastload') S.T.rate*=1.15; if(id==='ricochet') S.T.ricochet=true; });
    recomputeAuras();
    const p=squadPower(),d=lab.dist/100,dh=1+d*0.32+Math.pow(d,1.35)*0.03;
    return 'Truppstyrka ×'+p.toFixed(1)+' · Fiende-HP vid start ×'+(dh*Math.pow(p,0.8)).toFixed(1);
  }finally{ S=saveS; squad=saveSquad; mode=saveMode; rebuildChips(); }
}
const VOL_UI=[['master','Huvudvolym'],['music','Musik'],['sfx','Effekter'],['drums','Trummor'],['melody','Melodi'],['chords','Ackord och bas'],['crackle','Vinylknaster']];
function renderOpts(boxId){
  const id0=boxId||'opts',box=$(id0); box.innerHTML='';
  const h1=document.createElement('h3'); h1.className='sh'; h1.textContent='Ljud'; box.appendChild(h1);
  VOL_UI.forEach(v=>{
    const l=document.createElement('label'); l.className='tog vrow'; l.htmlFor=id0+'-vol-'+v[0];
    const s=document.createElement('span'); s.textContent=v[1];
    const r=document.createElement('input'); r.type='range'; r.min='0'; r.max='1'; r.step='0.05'; r.value=String(VOL[v[0]]); r.id=id0+'-vol-'+v[0]; r.className='vol';
    const pc=document.createElement('b'); pc.className='pct'; pc.textContent=Math.round(VOL[v[0]]*100)+' %';
    r.addEventListener('input',()=>{ VOL[v[0]]=+r.value; pc.textContent=Math.round(VOL[v[0]]*100)+' %'; store('kulstorm_vol',VOL); sfx.init(); sfx.setVol(); music.ensure(); });
    l.append(s,r,pc); box.appendChild(l);
  });
  const rb=document.createElement('button'); rb.type='button'; rb.className='btn small ghost'; rb.textContent='Återställ ljud'; rb.style.alignSelf='flex-start';
  rb.addEventListener('click',()=>{ Object.assign(VOL,VOL_DEF); store('kulstorm_vol',VOL); sfx.setVol(); renderOpts(boxId); });
  box.appendChild(rb);
  { const l=document.createElement('label'); l.className='tog vrow'; l.htmlFor=id0+'-msens';
    const s=document.createElement('span'); s.textContent='Muskänslighet';
    const r=document.createElement('input'); r.type='range'; r.min='0.3'; r.max='2.5'; r.step='0.1'; r.value=String(mouseSens); r.id=id0+'-msens'; r.className='vol';
    const pc=document.createElement('b'); pc.className='pct'; pc.textContent=mouseSens.toFixed(1)+'×';
    r.addEventListener('input',()=>{ mouseSens=+r.value; pc.textContent=mouseSens.toFixed(1)+'×'; store('kulstorm_msens',mouseSens); });
    l.append(s,r,pc); box.appendChild(l); }
  const h2=document.createElement('h3'); h2.className='sh'; h2.textContent='Spel'; box.appendChild(h2);
  OPT_DEFS.forEach(o=>{
    const l=document.createElement('label'); l.className='tog';
    const i=document.createElement('input'); i.type='checkbox'; i.id=(boxId||'opts')+'-'+o[0]; i.checked=OPT[o[0]];
    i.addEventListener('change',()=>{ OPT[o[0]]=i.checked; saveOpts(); if(S&&S.A&&o[0]==='combos') recomputeAuras(); if(o[0]==='front'||o[0]==='snake') layoutSquad(); if(o[0]==='planet') applyCurve(); if(o[0]==='weather'){ if(!OPT.weather){ W.fixed=null; setWeather('clear',true); } updateWeatherChip(); } hudCoins=-1; hudFront=null; });
    const s=document.createElement('span'); s.textContent=o[1]; const sm=document.createElement('small'); sm.textContent=o[2]; s.appendChild(sm);
    l.append(i,s); box.appendChild(l);
  });
}
$('open-shop').addEventListener('click',()=>showMenu('shop'));
$('open-lab').addEventListener('click',()=>showMenu('lab'));
$('open-opts').addEventListener('click',()=>showMenu('opts'));
$('open-heroprog').addEventListener('click',()=>showMenu('heroprog'));
$('close-heroprog').addEventListener('click',()=>showMenu('main'));
$('hp-reset').addEventListener('click',()=>{ HERO.pts={}; saveHero(); renderHeroProg(); });
function renderHeroProg(){
  const free=heroFree();
  $('hp-level').textContent='Hjältenivå '+HERO.lvl;
  $('hp-xpbar').style.width=(100*HERO.xp/heroNeed(HERO.lvl)).toFixed(1)+'%';
  $('hp-info').textContent=fmt(HERO.xp)+' / '+fmt(heroNeed(HERO.lvl))+' XP till nästa nivå · '+free+' poäng att fördela. Du får hjälte-XP för varje fiende du dödar (inte i labbet).';
  renderTalents($('hp-talents'),renderHeroProg);
}
// Talent rows with −/+. With no free point left, + buys one with banked coins (TALENT_COST). Used by the Hjälte panel and the game-over screen.
function renderTalents(box,redraw){
  const free=heroFree(),price=TALENT_COST(HERO.bought||0);
  box.innerHTML='';
  TALENTS.forEach(t=>{
    const n=HERO.pts[t.id]||0,buy=free<=0&&OPT.coins&&n<t.max;
    const row=document.createElement('div'); row.className='row'+(n>0?' on':'');
    const nm=document.createElement('div'); nm.className='nm'; nm.textContent=t.name+' · '+n+'/'+t.max; const sm=document.createElement('small'); sm.textContent=t.desc; nm.appendChild(sm); row.appendChild(nm);
    const cnt=document.createElement('div'); cnt.className='cnt';
    const minus=document.createElement('button'); minus.type='button'; minus.textContent='−'; minus.setAttribute('aria-label','Ta bort poäng från '+t.name); minus.disabled=n<=0;
    const num=document.createElement('b'); num.textContent=String(n);
    const plus=document.createElement('button'); plus.type='button';
    if(buy){ plus.className='buy'; plus.textContent=fmt(price)+' mynt'; plus.setAttribute('aria-label','Köp en poäng i '+t.name+' för '+fmt(price)+' mynt'); plus.disabled=bank<price; }
    else { plus.textContent='+'; plus.setAttribute('aria-label','Lägg poäng på '+t.name); plus.disabled=free<=0||n>=t.max; }
    minus.addEventListener('click',()=>{ HERO.pts[t.id]=Math.max(0,n-1); saveHero(); redraw(); });
    plus.addEventListener('click',()=>{
      if(n>=t.max) return;
      if(heroFree()<=0){ if(!OPT.coins||bank<price) return; bank-=price; HERO.bought=(HERO.bought||0)+1; saveBank(); }
      HERO.pts[t.id]=n+1; saveHero(); sfx.init(); sfx.buy(); redraw();
    });
    cnt.append(minus,num,plus); row.appendChild(cnt); box.appendChild(row);
  });
}
$('close-shop').addEventListener('click',()=>showMenu('main'));
$('close-lab').addEventListener('click',()=>showMenu('main'));
$('close-opts').addEventListener('click',()=>showMenu('main'));
$('lab-boss').addEventListener('click',()=>{ const extras=[]; for(const k in lab.counts) for(let i=0;i<lab.counts[k];i++) extras.push(k); startGame({hero:lab.hero,extras,perks:Object.keys(lab.perks).filter(k=>lab.perks[k]),dist:lab.dist,lab:true,off:Object.keys(lab.off).filter(k=>lab.off[k]),weather:lab.weather||null,tod:lab.tod?+lab.tod:null,bossNow:true,bossType:$('lab-bosstype').value||null}); });
$('lab-clear').addEventListener('click',()=>{ lab.counts={}; lab.perks={}; renderLab(); });
$('lab-start').addEventListener('click',()=>{
  const extras=[]; for(const k in lab.counts) for(let i=0;i<lab.counts[k];i++) extras.push(k);
  const perks=Object.keys(lab.perks).filter(k=>lab.perks[k]);
  startGame({hero:lab.hero,extras,perks,dist:lab.dist,lab:true,odFull:$('lab-odfull').checked,off:Object.keys(lab.off).filter(k=>lab.off[k]),weather:lab.weather||null,tod:lab.tod?+lab.tod:null,moon:lab.moon!==undefined&&lab.moon!==''?+lab.moon:null});
});
$('reset-tut').addEventListener('click',()=>{
  const b=$('reset-tut'); tutReset(); OPT.tutorial=true; saveOpts(); renderOpts(); b.textContent='Guiden visas igen'; setTimeout(()=>{ b.textContent='Visa guiden igen'; },1500);
});
$('reset-save').addEventListener('click',()=>{
  const b=$('reset-save');
  if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent='Tryck igen för att nollställa'; setTimeout(()=>{ b.dataset.arm=''; b.textContent='Nollställ mynt och köp'; },3000); return; }
  bank=0; owned=['rookie']; heroId='rookie'; saveBank(); b.dataset.arm=''; b.textContent='Nollställt'; setTimeout(()=>{ b.textContent='Nollställ mynt och köp'; },1500);
});

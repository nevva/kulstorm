'use strict';
// ---------- menu, shop, lab, options
const PANELS=['main','shop','armory','lab','opts','heroprog'];
let armoryAfterRun=false,boughtThisVisit=[];
function showMenu(which,afterRun){
  armoryAfterRun=which==='armory'&&!!afterRun; boughtThisVisit=[];
  if(mode==='menu'){ menuSky=true; labRun=false; }
  PANELS.forEach(p=>{ $('menu-'+p).hidden=p!==which; });
  menuEl.hidden=false; menuEl.scrollTop=0;
  if(which==='main') renderMain(); if(which==='shop') renderShop(); if(which==='armory') renderArmory(); if(which==='lab') renderLab(); if(which==='opts') renderOpts(); if(which==='heroprog') renderHeroProg();
}
function leaderDef(h){ return {id:'leader',kind:'gubbe',name:tl('You'),short:tl('You'),weapon:h.weapon||'pistol',hp:h.hp||100,shirt:h.shirt}; }
function renderMain(){
  $('menubest').textContent=best>0?tl('Best: {0} m',fmt(best)):tl('No record yet');
  $('menucoins').textContent=OPT.coins?tl('{0} coins in the bank',fmt(bank)):''; $('menucoins').hidden=!OPT.coins;
  const free=heroFree();
  $('menuhero').textContent=tl('Starting hero: {0}',heroById(heroId).name)+(OPT.heroprog?' · '+tl('Hero level {0}',HERO.lvl)+(free>0?' · '+tl('{0} points to spend',free):''):'');
  $('open-heroprog').hidden=!OPT.heroprog; $('open-heroprog').textContent=free>0?tl('Hero')+' ('+free+')':tl('Hero');
  $('open-shop').hidden=!OPT.coins;
  const n=affordableUnlocks(); $('open-armory').hidden=!OPT.coins; $('open-armory').textContent=tl('Armory')+(n>0?' ('+n+')':'');
  if(mode==='menu'){ clearSquad(); S=freshState(); addMember(leaderDef(heroById(heroId))); startCompanions().forEach(h=>{ if(squad.length<MAX_SQUAD) addMember(companionDef(h)); }); }
}
function renderShop(){
  $('shopcoins').textContent=tl('{0} coins in the bank',fmt(bank));
  const box=$('heroes'); box.innerHTML='';
  HEROES.forEach(h=>{
    const own=owned.indexOf(h.id)>=0,sel=heroId===h.id;
    const card=document.createElement('div'); card.className='hero'+(sel?' sel':'');
    const sw=document.createElement('div'); sw.className='sw'; sw.style.background=hexCss(h.shirt); card.appendChild(sw);
    const t=document.createElement('h4'); t.textContent=h.name; card.appendChild(t);
    const p=document.createElement('p'); p.textContent=h.desc+' · '+tl('Base health: {0} HP',memberBaseHealth(leaderDef(h))); card.appendChild(p);
    const b=document.createElement('button'); b.type='button';
    const joins=own&&!sel&&h.price>0;
    if(sel){ b.textContent=tl('Selected'); b.disabled=true; }
    else if(joins){
      // The button is the start-group checkbox; making this gubbe the leader is the small link under it.
      const on=benched.indexOf(h.id)<0;
      b.textContent=on?'✓ '+tl('In the group'):tl('Add'); b.className='own toggle'+(on?' on':''); b.setAttribute('role','checkbox'); b.setAttribute('aria-checked',String(on));
      b.addEventListener('click',()=>{ benched=benched.filter(x=>x!==h.id); if(on) benched.push(h.id); saveBank(); sfx.init(); sfx.pickup(); renderShop(); });
    }
    else if(own){ b.textContent=tl('Choose'); b.className='own'; b.addEventListener('click',()=>{ heroId=h.id; saveBank(); sfx.init(); sfx.pickup(); renderShop(); }); }
    else if(bank>=h.price){ b.textContent=tl('Buy')+' · '+fmt(h.price); b.addEventListener('click',()=>{ bank-=h.price; owned.push(h.id); heroId=h.id; saveBank(); sfx.init(); sfx.upgrade(); renderShop(); }); }
    else { b.textContent=tl('Costs {0} · {1} short',fmt(h.price),fmt(h.price-bank)); b.disabled=true; }
    card.appendChild(b);
    if(joins){ const l=document.createElement('button'); l.type='button'; l.className='lead'; l.textContent=tl('Make starting hero'); l.addEventListener('click',()=>{ heroId=h.id; saveBank(); sfx.init(); sfx.pickup(); renderShop(); }); card.appendChild(l); }
    box.appendChild(card);
  });
}
// Armory: every item chests and walls can give. Unlocking one adds it to what can drop.
function armoryItems(){ return ABILITIES.filter(u=>abilityEnabled(u.id)).concat(POWERUPS,UPGRADES).filter(u=>(OPT.team||u.kind!=='team')&&(OPT.unicorns||u.kind!=='pet')&&powerOn(u)); }
const lockedItems=()=>armoryItems().filter(u=>unlocked.indexOf(u.id)<0).sort((a,b)=>itemPrice(a)-itemPrice(b));
const affordableUnlocks=()=>lockedItems().filter(u=>bank>=itemPrice(u)).length;
const KIND_NAME={ability:'Ability',power:'Power-up',gubbe:'Squad member',team:'Team perk',pet:'Helper'};
let shownBank=0,bankTween=0;
// Rolls the bank chip from the old amount to the new one, so a purchase visibly costs coins.
function showBank(animate){
  const el=$('armorycoins'),from=shownBank,to=bank; shownBank=bank; cancelAnimationFrame(bankTween);
  if(!animate){ el.textContent=fmt(to); return; }
  el.classList.remove('spend'); void el.offsetWidth; el.classList.add('spend');
  const t0=performance.now(),step=now=>{ const k=Math.min(1,(now-t0)/450); el.textContent=fmt(Math.round(from+(to-from)*(1-Math.pow(1-k,3)))); if(k<1) bankTween=requestAnimationFrame(step); };
  bankTween=requestAnimationFrame(step);
}
function armoryCard(u,bought){
  const own=unlocked.indexOf(u.id)>=0,price=itemPrice(u);
  const card=document.createElement('div'); card.className='hero'+(own?' own':'')+(u.id===bought?' bought':'');
  const sw=document.createElement('div'); sw.className='sw'; sw.style.background=WALL_CSS[u.rarity]; card.appendChild(sw);
  const t=document.createElement('h4'); t.textContent=u.name; card.appendChild(t);
  const r=document.createElement('span'); r.className='rar'; r.textContent=(u.id==='payback'&&!own?tl('First upgrade')+' · ':'')+RARITY[u.rarity]+' · '+tl(KIND_NAME[u.kind]); card.appendChild(r);
  const p=document.createElement('p'); p.textContent=u.desc+(u.kind==='gubbe'?' · '+tl('Base health: {0} HP',memberBaseHealth(u)):''); card.appendChild(p);
  const b=document.createElement('button'); b.type='button';
  if(own){ b.textContent='✓ '+tl(u.kind==='ability'?'Unlocked':'In the chests'); b.disabled=true; }
  else if(bank>=price){ b.textContent=tl('Unlock')+' · '+fmt(price); b.addEventListener('click',()=>{ if(bank<price) return; bank-=price; unlocked.push(u.id); boughtThisVisit.push(u.id); saveBank(); sfx.init(); sfx.resume(); sfx.unlock(); renderArmory(u.id); }); }
  else { b.textContent=tl('Costs {0} · {1} short',fmt(price),fmt(price-bank)); b.disabled=true; }
  card.appendChild(b); return card;
}
// Affordable unlocks, and what was just bought from them, sit at the top; the category lists below hold everything else.
function renderArmory(bought){
  showBank(!!bought);
  $('armoryrun').hidden=!armoryAfterRun; $('armoryruncoins').textContent=tl('+{0} coins this run',fmt(coinsRun));
  const all=armoryItems(),have=all.filter(u=>unlocked.indexOf(u.id)>=0).length;
  $('armorycount').textContent=tl('{0} of {1} items unlocked',have,all.length);
  $('armorystack').textContent=!hasAbility('moneymaker')?tl('Enemies drop single coins and chests are empty until you buy Money Maker.'):stackMax()<5?tl('Enemies drop coins in stacks of up to {0}. The stacks grow the more runs you play.',stackMax()):tl('Enemies drop coins in full stacks of up to 5.');
  const ready=all.filter(u=>boughtThisVisit.indexOf(u.id)>=0||(unlocked.indexOf(u.id)<0&&bank>=itemPrice(u))).sort((a,b)=>itemPrice(a)-itemPrice(b));
  $('ar-readybox').hidden=!ready.length; $('ar-ready').innerHTML=''; ready.forEach(u=>$('ar-ready').appendChild(armoryCard(u,bought)));
  [['ar-ability',['ability']],['ar-power',['power']],['ar-gubbe',['gubbe']],['ar-team',['team','pet']]].forEach(([id,kinds])=>{
    const box=$(id); box.innerHTML='';
    all.filter(u=>kinds.indexOf(u.kind)>=0&&ready.indexOf(u)<0).sort((a,b)=>itemPrice(a)-itemPrice(b)).forEach(u=>box.appendChild(armoryCard(u,bought)));
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
    const minus=document.createElement('button'); minus.type='button'; minus.textContent='−'; minus.setAttribute('aria-label',tl('Fewer {0}',u.name));
    const num=document.createElement('b'); num.textContent=String(lab.counts[u.id]||0);
    const plus=document.createElement('button'); plus.type='button'; plus.textContent='+'; plus.setAttribute('aria-label',tl('More {0}',u.name));
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
    const s2=document.createElement('span'); s2.textContent=ENEMY_NAMES[k]; const sm=document.createElement('small'); sm.textContent=(d.night?tl('Night only')+' · ':'')+tl('from {0} m',d.unlock); s2.appendChild(sm);
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
    return tl('Squad power ×{0} · Enemy HP at start ×{1}',p.toFixed(1),(dh*Math.pow(p,0.8)).toFixed(1));
  }finally{ S=saveS; squad=saveSquad; mode=saveMode; }
}
const VOL_UI=[['master','Master volume'],['music','Music'],['sfx','Effects'],['drums','Drums'],['melody','Melody'],['chords','Chords and bass'],['crackle','Vinyl crackle']];
function renderOpts(boxId){
  const id0=boxId||'opts',box=$(id0); box.innerHTML='';
  const h1=document.createElement('h3'); h1.className='sh'; h1.textContent=tl('Audio'); box.appendChild(h1);
  VOL_UI.forEach(v=>{
    const l=document.createElement('label'); l.className='tog vrow'; l.htmlFor=id0+'-vol-'+v[0];
    const s=document.createElement('span'); s.textContent=tl(v[1]);
    const r=document.createElement('input'); r.type='range'; r.min='0'; r.max='1'; r.step='0.05'; r.value=String(VOL[v[0]]); r.id=id0+'-vol-'+v[0]; r.className='vol';
    const pc=document.createElement('b'); pc.className='pct'; pc.textContent=Math.round(VOL[v[0]]*100)+PCT;
    r.addEventListener('input',()=>{ VOL[v[0]]=+r.value; pc.textContent=Math.round(VOL[v[0]]*100)+PCT; store('kulstorm_vol',VOL); sfx.init(); sfx.setVol(); music.ensure(); });
    l.append(s,r,pc); box.appendChild(l);
  });
  const rb=document.createElement('button'); rb.type='button'; rb.className='btn small ghost'; rb.textContent=tl('Reset audio'); rb.style.alignSelf='flex-start';
  rb.addEventListener('click',()=>{ Object.assign(VOL,VOL_DEF); store('kulstorm_vol',VOL); sfx.setVol(); renderOpts(boxId); });
  box.appendChild(rb);
  { const l=document.createElement('label'); l.className='tog vrow'; l.htmlFor=id0+'-msens';
    const s=document.createElement('span'); s.textContent=tl('Mouse sensitivity');
    const r=document.createElement('input'); r.type='range'; r.min='0.3'; r.max='2.5'; r.step='0.1'; r.value=String(mouseSens); r.id=id0+'-msens'; r.className='vol';
    const pc=document.createElement('b'); pc.className='pct'; pc.textContent=mouseSens.toFixed(1)+'×';
    r.addEventListener('input',()=>{ mouseSens=+r.value; pc.textContent=mouseSens.toFixed(1)+'×'; store('kulstorm_msens',mouseSens); });
    l.append(s,r,pc); box.appendChild(l); }
  const h2=document.createElement('h3'); h2.className='sh'; h2.textContent=tl('Game'); box.appendChild(h2);
  OPT_DEFS.forEach(o=>{
    const l=document.createElement('label'); l.className='tog';
    const i=document.createElement('input'); i.type='checkbox'; i.id=(boxId||'opts')+'-'+o[0]; i.checked=OPT[o[0]];
    i.addEventListener('change',()=>{ OPT[o[0]]=i.checked; saveOpts(); if(S&&S.A&&o[0]==='combos') recomputeAuras(); if(o[0]==='front'||o[0]==='snake') layoutSquad(); if(o[0]==='planet') applyCurve(); if(o[0]==='weather'){ if(!OPT.weather){ W.fixed=null; setWeather('clear',true); } } hudCoins=-1; });
    const s=document.createElement('span'); s.textContent=o[1]; const sm=document.createElement('small'); sm.textContent=o[2]; s.appendChild(sm);
    l.append(i,s); box.appendChild(l);
  });
}
// Language: the current one is the filled button; picking the other reloads the page in that language.
['en','sv'].forEach(l=>{ const b=$('lang-'+l); b.classList.toggle('ghost',l!==LANG); b.setAttribute('aria-pressed',String(l===LANG)); b.addEventListener('click',()=>{ if(l!==LANG) setLang(l); }); });
$('open-shop').addEventListener('click',()=>showMenu('shop'));
$('open-armory').addEventListener('click',()=>showMenu('armory'));
$('close-armory').addEventListener('click',()=>showMenu('main'));
$('open-lab').addEventListener('click',()=>showMenu('lab'));
$('open-opts').addEventListener('click',()=>showMenu('opts'));
$('open-heroprog').addEventListener('click',()=>showMenu('heroprog'));
$('close-heroprog').addEventListener('click',()=>showMenu('main'));
$('hp-reset').addEventListener('click',()=>{ HERO.pts={}; saveHero(); renderHeroProg(); });
function renderHeroProg(){
  const free=heroFree();
  $('hp-level').textContent=tl('Hero level {0}',HERO.lvl);
  $('hp-xpbar').style.width=(100*HERO.xp/heroNeed(HERO.lvl)).toFixed(1)+'%';
  $('hp-info').textContent=tl('{0} / {1} XP to next level · {2} points to spend. You earn hero XP for every enemy you kill (not in the lab).',fmt(HERO.xp),fmt(heroNeed(HERO.lvl)),free);
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
    const minus=document.createElement('button'); minus.type='button'; minus.textContent='−'; minus.setAttribute('aria-label',tl('Remove a point from {0}',t.name)); minus.disabled=n<=0;
    const num=document.createElement('b'); num.textContent=String(n);
    const plus=document.createElement('button'); plus.type='button';
    if(buy){ plus.className='buy'; plus.textContent=tl('{0} coins',fmt(price)); plus.setAttribute('aria-label',tl('Buy a point in {0} for {1} coins',t.name,fmt(price))); plus.disabled=bank<price; }
    else { plus.textContent='+'; plus.setAttribute('aria-label',tl('Add a point to {0}',t.name)); plus.disabled=free<=0||n>=t.max; }
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
  const b=$('reset-tut'); tutReset(); OPT.tutorial=true; saveOpts(); renderOpts(); b.textContent=tl('Tutorial will show again'); setTimeout(()=>{ b.textContent=tl('Show tutorial again'); },1500);
});
// Reset save: wipe all progress (coins, heroes, Armory unlocks, hero levels, record, seen tutorials) and reload as a new player. Settings, volume and language stay.
const SAVE_KEYS=['kulstorm_coins','kulstorm_owned','kulstorm_hero','kulstorm_bench','kulstorm_unlocked','kulstorm_runs','kulstorm_heroprog','kulstorm_best','kulstorm_tut'];
$('reset-all').addEventListener('click',()=>{
  const b=$('reset-all');
  if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent=tl('Tap again to erase everything'); setTimeout(()=>{ b.dataset.arm=''; b.textContent=tl('Reset save'); },3000); return; }
  try{ SAVE_KEYS.forEach(k=>localStorage.removeItem(k)); }catch(e){}
  location.reload();
});
$('reset-save').addEventListener('click',()=>{
  const b=$('reset-save');
  if(b.dataset.arm!=='1'){ b.dataset.arm='1'; b.textContent=tl('Tap again to reset'); setTimeout(()=>{ b.dataset.arm=''; b.textContent=tl('Reset coins and purchases'); },3000); return; }
  bank=0; owned=['rookie']; heroId='rookie'; benched=[]; unlocked=STARTER_ITEMS.slice(); runsDone=0; saveBank(); b.dataset.arm=''; b.textContent=tl('Reset done'); setTimeout(()=>{ b.textContent=tl('Reset coins and purchases'); },1500);
});

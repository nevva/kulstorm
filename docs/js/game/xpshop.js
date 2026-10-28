'use strict';
// ---------- XP crystals, run levels and the buy screen
const R={xp:0,lvl:1,need:14,pending:0,reroll:5,offers:[],sel:0};
const xpOn=()=>OPT.xpshop&&OPT.coins;
let xpGems=[]; const xpPool=[]; const xpMat=mat(0xb07cff,{e:0.6,r:0.2});
function spawnXp(x,z,v){
  const g=xpPool.pop()||M(G.ico0,xpMat,[1,1,1],[0,0,0],false);
  const s=0.17+0.035*Math.min(v,6); g.scale.set(s,s*1.4,s);
  g.position.set(clamp(x,-HALF+0.3,HALF-0.3),0.6,z); scene.add(g);
  xpGems.push({g,v,t:rand(0,6),vx:rand(-1.2,1.2),vz:rand(-1.2,1.2),dead:false});
}
function updateXp(dt){
  for(const c of xpGems){
    const p=c.g.position; c.t+=dt; p.z+=(scroll+c.vz)*dt; p.x+=c.vx*dt; c.vz*=0.9; c.vx*=0.9; c.g.rotation.y+=dt*3; p.y=0.6+0.14*Math.sin(c.t*5);
    if(mode==='playing'){ const dx=S.x-p.x,dz=0-p.z,d=Math.hypot(dx,dz),r=S.A&&S.A.magnet?9:3.2; if(d<r&&d>0.1){ p.x+=dx/d*13*dt; p.z+=dz/d*13*dt; } }
    if(mode==='playing') for(const m of squad){ if(Math.abs(m.g.position.x-p.x)<0.8&&Math.abs(m.g.position.z-p.z)<0.8){ c.dead=true; break; } }
    if(c.dead){ addXp(c.v); fxSpark(p.x,p.y,p.z,C(0xb07cff)); }
    else if(p.z>4) c.dead=true;
    if(c.dead){ scene.remove(c.g); xpPool.push(c.g); }
  }
  xpGems=xpGems.filter(c=>!c.dead);
  // A level-up sends a roadside shop building toward the squad; the buy screen opens as you pass it.
  if(mode==='playing'&&R.pending>0&&!kiosk.active){ kiosk.active=true; kiosk.opened=false; kiosk.side=Math.random()<0.5?-1:1; kiosk.g.position.set(kiosk.side*(HALF+2.6),0,VIEW.spawn); kiosk.g.rotation.y=kiosk.side*0.5; kiosk.g.visible=true; toast(tl('Shop ahead!')); sfx.zone(); spawnPause=Math.max(spawnPause,4); }
  if(kiosk.active){
    const kp=kiosk.g.position; kp.z+=scroll*dt;
    kiosk.coin.rotation.y+=dt*3; kiosk.coin.position.y=4.3+0.2*Math.sin(time*3);
    if(!kiosk.opened&&kp.z>-1.5&&mode==='playing'){ kiosk.opened=true; openShop(); }
    if(kp.z>16){ kiosk.active=false; kiosk.g.visible=false; }
  }
}
const kiosk=(function(){
  const g=new THREE.Group();
  g.add(M(G.box,mat(0xfff8e6,{r:0.35}),[3.2,2.4,2.6],[0,1.2,0]));
  g.add(M(G.box,mat(0x0d1030,{r:0.4}),[2.2,1.2,0.1],[0,1.3,1.31],false));
  g.add(M(G.box,mat(0x8d6e63,{r:0.5}),[3.4,0.3,0.9],[0,0.95,1.6]));
  for(let i=0;i<6;i++) g.add(M(G.box,mat(i%2?0xff5c7a:0xfff8e6,{r:0.3}),[3.4/6,0.12,1.3],[-1.7+3.4/12+i*3.4/6,2.45,1.7]));
  const roof=M(G.cone4,mat(0xb07cff,{r:0.3}),[2.6,1.2,2.2],[0,3.0,0]); roof.rotation.y=Math.PI/4; g.add(roof);
  const c=document.createElement('canvas'); c.width=256; c.height=96; const x=c.getContext('2d');
  x.fillStyle='#ffd21f'; x.fillRect(0,0,256,96); x.fillStyle='#0d1030'; x.font='56px Bungee, Impact, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(tl('SHOP'),128,52);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding;
  const sign=new THREE.Mesh(G.plane,new THREE.MeshBasicMaterial({map:t})); sign.scale.set(2.4,0.9,1); sign.position.set(0,2.95,1.38); g.add(sign);
  const coin=M(G.coin,coinMat,[0.55,0.14,0.55],[0,4.3,0]); coin.rotation.x=Math.PI/2; const cw=new THREE.Group(); cw.add(coin); cw.position.y=0; g.add(cw);
  g.visible=false; scene.add(g);
  return {g,coin:cw,active:false,opened:false,side:1,tex:t,ctx:x};
})();
function refreshKioskSign(){ const x=kiosk.ctx; x.fillStyle='#ffd21f'; x.fillRect(0,0,256,96); x.fillStyle='#0d1030'; x.font='56px Bungee, Impact, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(tl('SHOP'),128,52); kiosk.tex.needsUpdate=true; }
function addXp(v){
  R.xp+=v; hudXp=-1;
  while(R.xp>=R.need){ R.xp-=R.need; R.lvl++; R.need=Math.round(R.need*1.35+4); R.pending++; }
}
function clearXp(){ xpGems.forEach(c=>{ scene.remove(c.g); xpPool.push(c.g); }); xpGems=[]; kiosk.active=false; kiosk.g.visible=false; R.xp=0; R.lvl=1; R.need=14; R.pending=0; R.reroll=5; hudXp=-1; }
const shopEl=$('shop');
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=ri(0,i); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function buildOffers(){
  const pool=[];
  shuffle(squad.filter(m=>m.lvl<5)).slice(0,3).forEach(m=>pool.push({type:'lvl',m,cost:LVL_COST[m.lvl]}));
  if(squad.some(m=>m.hp<m.maxHp*0.95)) pool.push({type:'heal',cost:15});
  if(isUnlocked('banker')&&!hasPart('banker')&&squad.length<MAX_SQUAD&&Math.random()<0.45) pool.push({type:'banker',cost:30});
  if(!pool.length) pool.push({type:'heal',cost:15});
  R.offers=shuffle(pool).slice(0,3);
}
function offerInfo(o){
  if(o.type==='lvl') return {col:hexCss(o.m.def.shirt),title:o.m.def.name+' → '+tl('lv {0}',o.m.lvl+1),desc:tl('+20% damage and +20% max HP, fully healed. Now level {0}.',o.m.lvl)};
  if(o.type==='heal') return {col:'#ff5c7a',title:tl('Full Heal'),desc:tl('Heals the whole squad to full health.')};
  return {col:'#ffc83d',title:tl('The Banker'),desc:tl('New squad member: damage rises 1% per coin you carry, up to ×4.')};
}
function renderBuy(){
  $('shoptitle').textContent=tl('Level {0}!',R.lvl);
  $('shopwallet').textContent=tl('{0} coins this run',fmt(Math.floor(coinsRun)));
  const box=$('shopcards'); box.innerHTML='';
  R.offers.forEach((o,i)=>{
    const inf=offerInfo(o),b=document.createElement('button'); b.type='button'; b.className='offer'+(o.bought?' bought':''); b.id='offer'+i;
    const sw=document.createElement('div'); sw.className='sw'; sw.style.background=inf.col; b.appendChild(sw);
    const h=document.createElement('h4'); h.textContent=inf.title; b.appendChild(h);
    const p=document.createElement('p'); p.textContent=inf.desc; b.appendChild(p);
    const pr=document.createElement('span'); pr.className='price'; pr.textContent=o.bought?tl('Bought'):(i+1)+' · '+tl('{0} coins',o.cost); b.appendChild(pr);
    const stale=o.type==='lvl'&&(o.m.dead||squad.indexOf(o.m)<0||o.m.lvl>=5);
    b.disabled=!!o.bought||stale||coinsRun<o.cost||(o.type==='banker'&&(hasPart('banker')||squad.length>=MAX_SQUAD));
    if(i===R.sel) b.classList.add('sel');
    b.addEventListener('click',()=>{ R.sel=i; if(buyOffer(o)) closeShop(); });
    box.appendChild(b);
  });
  const rr=$('shop-reroll'); rr.textContent=tl('New offers')+' · '+R.reroll; rr.disabled=coinsRun<R.reroll;
}
function buyOffer(o){
  const btn=$('offer'+R.offers.indexOf(o));
  if(o.bought||!btn||btn.disabled){ if(!o.bought){ $('shopwallet').textContent=(coinsRun<o.cost?tl("Can't afford"):tl("Can't buy"))+' · '+tl('{0} coins this run',fmt(Math.floor(coinsRun))); sfx.hurt(); } return false; }
  coinsRun-=o.cost; o.bought=true; hudCoins=-1;
  if(o.type==='lvl'){ const m=o.m; m.lvl++; m.maxHp=Math.round(m.maxHp*1.2); m.hp=m.maxHp; fxSparkle(m.g.position.x,1.4,m.g.position.z,C(m.def.shirt)); }
  else if(o.type==='heal'){ squad.forEach(m=>{ m.hp=m.maxHp; }); }
  else { addMember(defById('banker')); }
  sfx.buy(); updatePower(0,true); renderBuy();
  return true;
}
let shopRelock=false;
function openShop(){
  shopRelock=locked(); unlockMouse();
  if(mode!=='playing'||!xpOn()) { R.pending=0; return; }
  R.pending--; mode='shop'; keys.l=keys.r=false; drag=null;
  buildOffers(); R.sel=Math.max(0,R.offers.findIndex(o=>coinsRun>=o.cost)); renderBuy(); shopEl.hidden=false; sfx.level();
  $('shop-done').focus({preventScroll:true});
}
function closeShop(){
  if(mode!=='shop') return;
  shopEl.hidden=true; mode='playing'; last=performance.now();
  if(shopRelock&&OPT.mouse) lockMouse(); shopRelock=false;
  for(const m of squad) m.invuln=0.6;
  updateHUD();
}
$('shop-done').addEventListener('click',closeShop);
function shopReroll(){ if(coinsRun<R.reroll){ $('shopwallet').textContent=tl("Can't afford new offers")+' · '+tl('{0} coins this run',fmt(Math.floor(coinsRun))); sfx.hurt(); return; } coinsRun-=R.reroll; R.reroll+=5; hudCoins=-1; buildOffers(); R.sel=clamp(R.sel,0,R.offers.length-1); renderBuy(); sfx.buy(); }
$('shop-reroll').addEventListener('click',shopReroll);

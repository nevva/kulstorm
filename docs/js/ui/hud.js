'use strict';
// ---------- feedback
function shake(a){ if(OPT.shake) shakeAmt=Math.min(1.5,shakeAmt+a); }
function flash(){ flashEl.classList.add('on'); setTimeout(()=>flashEl.classList.remove('on'),60); }
let toastT=null;
function toast(txt,isBoss){ toastEl.textContent=txt; toastEl.classList.toggle('boss',!!isBoss); toastEl.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('show'),1800); }
let hintT=null;
function showHint(txt){ hintEl.textContent=txt; hintEl.classList.add('show'); clearTimeout(hintT); hintT=setTimeout(()=>hintEl.classList.remove('show'),3800); }
let hudDist=-1,hudHp=-1,hudShield=-1,hudCoins=-1;
function updateHUD(){
  const d=Math.floor(dist); if(d!==hudDist){ hudDist=d; distEl.textContent=fmt(d); }
  const L=squad[0];
  if(L){ const hp=Math.ceil(L.hp); if(hp!==hudHp){ hudHp=hp; hpEl.style.width=(100*L.hp/L.maxHp)+'%'; hpEl.classList.toggle('low',L.hp/L.maxHp<0.3); hpTextEl.textContent=hp+' / '+L.maxHp; } }
  const cr=Math.round(coinsRun); if(cr!==hudCoins){ hudCoins=cr; coinEl.textContent=fmt(cr); coinEl.hidden=!OPT.coins; }
  const sh=totalShield(); if(sh!==hudShield){ hudShield=sh; shieldEl.hidden=sh<=0; shieldEl.textContent=tl('Shield {0}',sh); }
  if(boss) bossHpEl.style.width=(100*Math.max(0,boss.hp)/boss.maxHp)+'%';
  const ob=$('odbtn'),odOn=hasAbility('overdrive'); ob.hidden=!odOn; if(odOn){ const act=S.odT>0,rdy=!act&&S.od>=1; ob.classList.toggle('ready',rdy); ob.classList.toggle('active',act); $('odfill').style.width=(act?100*S.odT/OD_T:100*S.od).toFixed(0)+'%'; $('odtxt').textContent=act?tl('OVERDRIVE ACTIVE'):rdy?'OVERDRIVE · E':S.odLock>0?tl('Recharging…'):'OVERDRIVE '+Math.floor(S.od*100)+PCT; }
  const fc=$('flowchip'); if(S.flowT>0){ if(hudFlow!==S.flow){ hudFlow=S.flow; fc.hidden=false; $('flowtxt').textContent='FLOW ×'+S.flow+' · +'+(15*S.flow)+PCT; } $('flowbar').style.width=(100*S.flowT/4).toFixed(0)+'%'; } else if(!fc.hidden){ fc.hidden=true; hudFlow=-1; }
  const pc=$('pwchip'),pw=[S.pwRate>0?tl('FRENZY')+' '+Math.ceil(S.pwRate):'',S.pwDmg>0?tl('POWER')+' '+Math.ceil(S.pwDmg):'',S.pwLine>0?tl('LINE')+' '+Math.ceil(S.pwLine):'',S.pwNade>0?tl('GRENADES')+' '+Math.ceil(S.pwNade):'',S.pwSlow>0?tl('SLOW-MO')+' '+Math.ceil(S.pwSlow):'',S.divine>0?tl('DIVINE')+(S.divine>1?' ×'+S.divine:''):''].filter(Boolean).join(' · ');
  if(pc.textContent!==pw){ pc.textContent=pw; pc.hidden=!pw; }
  if(hudXp<0){ hudXp=1; $('xprow').hidden=!xpOn(); $('xplvl').textContent=tl('Lv {0}',R.lvl); $('xpbar').style.width=(100*R.xp/R.need).toFixed(1)+'%'; }
}
let hudXp=-1,hudFlow=-1;
function updateCamera(dt){
  shakeAmt=Math.max(0,shakeAmt-dt*2.4);
  const sx=(Math.random()-0.5)*shakeAmt*0.5,sy=(Math.random()-0.5)*shakeAmt*0.5;
  const px=mode==='menu'?Math.sin(time*0.5)*1.2:S.x;
  camX+=(px*0.35-camX)*(1-Math.exp(-dt*4));
  const want=(OPT.dyncam?clamp(0.78+0.065*(squad.length-1),0.78,1.32):1)*VIEW.scale*(S.odT>0?0.9:1);
  camK+=(want-camK)*(1-Math.exp(-dt*1.5));
  camera.position.set(camX+sx,CAM0.y*camK+sy,CAM0.z*camK);
  camera.lookAt(camX*0.6+sx,0.9+sy,CAM0.look*camK);
}

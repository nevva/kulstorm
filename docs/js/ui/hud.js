'use strict';
// ---------- feedback
function shake(a){ if(OPT.shake) shakeAmt=Math.min(1.5,shakeAmt+a); }
function flash(){ flashEl.classList.add('on'); setTimeout(()=>flashEl.classList.remove('on'),60); }
let toastT=null;
function toast(txt,isBoss){ toastEl.textContent=txt; toastEl.classList.toggle('boss',!!isBoss); toastEl.classList.remove('show'); void toastEl.offsetWidth; toastEl.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>toastEl.classList.remove('show'),isBoss?2000:1000); }
let hintT=null;
function showHint(txt){ hintEl.textContent=txt; hintEl.classList.add('show'); clearTimeout(hintT); hintT=setTimeout(()=>hintEl.classList.remove('show'),3800); }
let hudDist=-1,hudHp=-1,hudShield=-1,hudCoins=-1;
const speedBtn=$('speedbtn');
function updateSpeedButton(){
  const value=gameSpeed.toLocaleString(LANG==='sv'?'sv-SE':'en-US'),label=tl('Game speed: {0}×. Press to change.',value);
  speedBtn.textContent=value+'×'; speedBtn.setAttribute('aria-label',label); speedBtn.title=label;
}
speedBtn.addEventListener('click',e=>{
  gameSpeed=GAME_SPEEDS[(GAME_SPEEDS.indexOf(gameSpeed)+1)%GAME_SPEEDS.length];
  store('kulstorm_speed',gameSpeed); updateSpeedButton();
  if(e.detail>0) speedBtn.blur();
});
updateSpeedButton();
// Weather icon among the round HUD buttons; clear weather shows a sun by day and a moon at night.
const WEATHER_ICON={
  sun:'<circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor"/>',
  rain:'<path d="M7 15a4 4 0 0 1 .5-8A5.5 5.5 0 0 1 18 8.5 3.5 3.5 0 0 1 17.5 15z" fill="currentColor"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
  fog:'<path d="M4 8h16M2 12h20M4 16h16M7 20h10"/>',
  storm:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
  snow:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>',
  thunder:'<path d="M7 13a4 4 0 0 1 .5-8A5.5 5.5 0 0 1 18 6.5 3.5 3.5 0 0 1 17.5 13z" fill="currentColor"/><path d="M13 13l-3 5h4l-3 5" fill="none"/>',
  heat:'<path d="M12 3v11"/><circle cx="12" cy="17" r="3.5" fill="currentColor"/><path d="M17 5c1 1.2 1 2.3 0 3.5s-1 2.3 0 3.5M20 5c1 1.2 1 2.3 0 3.5s-1 2.3 0 3.5"/>'};
let hudWeather='';
function updateWeatherIcon(){
  const el=$('weathericon'),id=W.id==='clear'?(DN.nightF>0.5?'moon':'sun'):W.id;
  el.hidden=!OPT.weather; if(id===hudWeather) return;
  const changed=!!hudWeather; hudWeather=id;
  el.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(WEATHER_ICON[id]||WEATHER_ICON.sun)+'</svg>';
  const name=W.id==='clear'?WEATHER.clear.name:WEATHER[W.id].name; el.setAttribute('aria-label',tl('Weather')+': '+name); el.title=name;
  if(changed){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
}
function updateHUD(){
  updateWeatherIcon();
  const d=Math.floor(dist); if(d!==hudDist){ hudDist=d; distEl.textContent=fmt(d); }
  const L=squad[0];
  if(L){ const hp=Math.ceil(L.hp); if(hp!==hudHp){ hudHp=hp; hpEl.style.width=(100*L.hp/L.maxHp)+'%'; hpEl.classList.toggle('low',L.hp/L.maxHp<0.3); hpTextEl.textContent=hp+' / '+L.maxHp; } }
  const cr=Math.round(coinsRun); if(cr!==hudCoins){ hudCoins=cr; coinEl.textContent=fmt(cr); coinEl.hidden=!OPT.coins; }
  const sh=totalShield(); if(sh!==hudShield){ hudShield=sh; shieldEl.hidden=sh<=0; shieldEl.textContent=tl('Shield {0}',sh); }
  if(boss) bossHpEl.style.width=(100*Math.max(0,boss.hp)/boss.maxHp)+'%';
  const ob=$('odbtn'),odOn=hasAbility('overdrive'); ob.hidden=!odOn; if(odOn){ const act=S.odT>0,rdy=!act&&S.od>=1; ob.classList.toggle('ready',rdy); ob.classList.toggle('active',act); $('odfill').style.width=(act?100*S.odT/OD_T:100*S.od).toFixed(0)+'%'; $('odtxt').textContent=act?tl('OVERDRIVE ACTIVE'):rdy?'OVERDRIVE · E':S.odLock>0?tl('Recharging…'):'OVERDRIVE '+Math.floor(S.od*100)+PCT; }
  const fc=$('flowchip'); if(S.flowT>0){ if(hudFlow!==S.flow){ hudFlow=S.flow; fc.hidden=false; $('flowtxt').textContent='FLOW ×'+S.flow+' · +'+(15*S.flow)+PCT; } $('flowbar').style.width=(100*S.flowT/4).toFixed(0)+'%'; } else if(!fc.hidden){ fc.hidden=true; hudFlow=-1; }
  const pc=$('pwchip'),pw=[S.pwRate>0?tl('FRENZY')+' '+Math.ceil(S.pwRate):'',S.pwDmg>0?tl('POWER')+' '+Math.ceil(S.pwDmg):'',S.pwLine>0?tl('LINE')+' '+Math.ceil(S.pwLine):'',S.pwNade>0?tl('GRENADES')+' '+Math.ceil(S.pwNade):'',S.pwSlow>0?tl('SLOW-MO')+' '+Math.ceil(S.pwSlow):'',S.parryT>0?tl('PARRY')+' ×'+PARRY_K:'',S.divine>0?tl('DIVINE')+(S.divine>1?' ×'+S.divine:''):''].filter(Boolean).join(' · ');
  if(pc.textContent!==pw){ pc.textContent=pw; pc.hidden=!pw; }
  if(hudXp<0){ hudXp=1; $('xprow').hidden=!xpOn(); $('xplvl').textContent=tl('Lv {0}',R.lvl); $('xpbar').style.width=(100*R.xp/R.need).toFixed(1)+'%'; }
}
let hudXp=-1,hudFlow=-1;
// Tilt parallax: tilting the phone moves the camera a little around the same target, so near and far things shift
// against each other. The rest position slowly follows how the phone is held, so only tilting moves the view.
const tilt={x:0,y:0,bx:null,by:null,ox:0,oy:0};
window.addEventListener('deviceorientation',e=>{
  if(e.beta==null||e.gamma==null) return;
  const ang=(((screen.orientation&&screen.orientation.angle)||window.orientation||0)+360)%360;
  let x=e.gamma,y=e.beta;
  if(ang===90){ x=e.beta; y=-e.gamma; } else if(ang===270){ x=-e.beta; y=e.gamma; } else if(ang===180){ x=-e.gamma; y=-e.beta; }
  if(tilt.bx==null||Math.abs(x-tilt.bx)>60||Math.abs(y-tilt.by)>60){ tilt.bx=x; tilt.by=y; }
  tilt.x=x; tilt.y=y;
});
// iOS only reports orientation after the player allows it. We never ask out of the blue: after a few runs the menu
// explains what the motion data is for (and that the game is the same without it), and only "Turn on" asks.
const tiltNeedsAsk=()=>{ const D=window.DeviceOrientationEvent; return !!(D&&typeof D.requestPermission==='function'); };
function askTilt(){ if(tiltNeedsAsk()) DeviceOrientationEvent.requestPermission().catch(()=>{}); }
const TILT_ASK_RUNS=3;
function maybeOfferTilt(){
  if(!OPT.gyro||!tiltNeedsAsk()||runsDone<TILT_ASK_RUNS||load('kulstorm_tiltasked',false)) return;
  store('kulstorm_tiltasked',true); $('tiltask').hidden=false; $('tilt-yes').focus({preventScroll:true});
}
$('tilt-yes').addEventListener('click',()=>{ $('tiltask').hidden=true; askTilt(); });
$('tilt-no').addEventListener('click',()=>{ $('tiltask').hidden=true; OPT.gyro=false; saveOpts(); });
function updateTilt(dt){
  let tx=0,ty=0;
  if(OPT.gyro&&tilt.bx!=null){
    const k=1-Math.exp(-dt*0.15); tilt.bx+=(tilt.x-tilt.bx)*k; tilt.by+=(tilt.y-tilt.by)*k;
    tx=clamp((tilt.x-tilt.bx)/15,-1,1); ty=clamp((tilt.y-tilt.by)/15,-1,1);
  }
  const s=1-Math.exp(-dt*8); tilt.ox+=(tx-tilt.ox)*s; tilt.oy+=(ty-tilt.oy)*s;
}
function updateCamera(dt){
  updateTilt(dt);
  shakeAmt=Math.max(0,shakeAmt-dt*2.4);
  const sx=(Math.random()-0.5)*shakeAmt*0.5,sy=(Math.random()-0.5)*shakeAmt*0.5;
  const px=mode==='menu'?Math.sin(time*0.5)*1.2:S.x;
  camX+=(px*0.35-camX)*(1-Math.exp(-dt*4));
  const want=(OPT.dyncam?clamp(0.78+0.065*(squad.length-1),0.78,1.32):1)*VIEW.scale*(S.odT>0?0.9:1);
  camK+=(want-camK)*(1-Math.exp(-dt*1.5));
  camera.position.set(camX+sx+tilt.ox*2.6,CAM0.y*camK+sy-tilt.oy*1.6,CAM0.z*camK);
  camera.lookAt(camX*0.6+sx,0.9+sy,CAM0.look*camK);
}

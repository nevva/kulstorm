'use strict';
// ---------- run control
let lastCfg=null;
function clearSquad(){ squad.forEach(m=>{ scene.remove(m.g); m.beams.forEach(b=>scene.remove(b)); }); squad=[]; }
function clearRun(){
  enemies.forEach(e=>{ scene.remove(e.g); e.mats.forEach(m=>m.emissive.setRGB(0,0,0)); (pools[e.type]||(pools[e.type]=[])).push(e); }); enemies=[]; boss=null;
  bullets.clear(); ebullets.clear(); clearStars(); delayed.length=0; blobs.clear(); chunks.clear();
  hearts.forEach(h=>{ scene.remove(h.g); heartPool.push(h.g); }); hearts=[];
  coins.forEach(c=>{ scene.remove(c.g); coinPool.push(c.g); }); coins=[];
  walls.forEach(w=>{ if(!w.dead) removeWall(w); }); walls=[];
  zaps.forEach(z=>{ z.t=0; z.m.visible=false; });
  clearWeatherFx(); clearScenery(); clearObstacles(); clearChests(); clearXp(); clearUnicorns(); clearBossFx(); shopEl.hidden=true; document.body.classList.remove('od-on');
  puddles.forEach(q=>scene.remove(q.m)); puddles.length=0; pendSpawn.length=0;
  clearDmg(); clearSquad(); clearShards(); poundRing.visible=false; tutStart();
  shieldRing.visible=false; frontMarker.visible=false; bossBar.hidden=true;
  VIEW.scale=1; VIEW.fogNear=44; VIEW.fogFar=96; VIEW.spawn=-78; camK=0.78;
  setZone(0,true); rebuildTiles();
}
// Fever dream: a practice run (no coins or records) with everything unlocked, a full squad and every team perk maxed.
function feverDream(){
  const gubbes=shuffle(UPGRADES.filter(u=>u.kind==='gubbe')),extras=[];
  for(let i=0;extras.length<MAX_SQUAD-1&&i<gubbes.length*3;i++){ const u=gubbes[i%gubbes.length]; if(!(u.unique&&extras.indexOf(u.id)>=0)) extras.push(u.id); }
  const perks=[]; UPGRADES.forEach(u=>{ if(u.kind==='team') for(let i=0;i<(u.max||1);i++) perks.push(u.id); else if(u.kind==='pet') perks.push(u.id,u.id); });
  startGame({hero:heroId,extras,perks,dist:0,lab:true,odFull:true,fever:true});
  toast(tl('Fever dream!'));
}
function startGame(cfg){
  cfg=cfg||{hero:heroId,extras:[],perks:[],dist:0,lab:false};
  lastCfg=cfg; labRun=!!cfg.lab; menuSky=false; vetRun={};
  sfx.init(); sfx.resume(); music.ensure(); music.reset();
  pauseEl.hidden=true;
  clearRun();
  S=freshState(); runReset(); dist=cfg.dist||0; kills=0; coinsRun=0; spawnT=1.8; bossNo=Math.floor(dist/600); nextBossAt=(bossNo+1)*600; nextUpgradeAt=dist+100; upgradeStep=160; if(cfg.bossNow) nextBossAt=dist+3; bossForce=cfg.bossType||null; lastBoss=null; zoneDistNext=Math.floor(dist/400+1)*400; deadT=0; overShown=false; shakeAmt=0;
  hudDist=hudHp=hudShield=hudCoins=-1;
  VIEW.scale=1; VIEW.fogNear=44; VIEW.fogFar=96; VIEW.spawn=-78; resize();
  applyCurve();
  setZone(dist>0?ri(0,ZONES.length-1):0,true); rebuildTiles(); updateDifficulty();
  LABOFF=new Set(cfg.off||[]); necroSeen=false; waveClock=0; spawnPause=0; pendSpawn.length=0; DEATHS.length=0;
  CYC.start=dist; CYC.off=cfg.tod!=null?cfg.tod:0.12; CYC.moon0=cfg.moon!=null?cfg.moon:ri(0,7); updateSky(0); updateColors(100);
  W.fixed=cfg.weather&&OPT.weather?cfg.weather:null; W.next=Math.floor(dist/300+1)*300; W.id='clear'; W.wind=0; W.mix=1;
  if(W.fixed) setWeather(W.fixed,true); else if(dist>0) rollWeather();
  const hero=heroById(cfg.hero);
  S.T.rate=STARTING_FIRE_RATE_MULTIPLIER*(hasAbility('payback')?2:1);
  S.T.speed=hero.speed||1; S.T.coinMult=hero.coinMult||1; if(hero.T) for(const k in hero.T) S.T[k]*=hero.T[k];
  const L=addMember(leaderDef(hero)); L.charges+=hero.shield||0;
  runHeroXp=0; lastHeroGain={gain:0,ups:0};
  if(OPT.heroprog){
    const P=id=>HERO.pts[id]||0;
    L.maxHp+=8*P('tough'); L.hp=L.maxHp;
    S.T.dmg*=1+0.04*P('sharp'); S.T.rate*=1+0.03*P('fast'); S.T.coinMult*=1+0.05*P('rich');
    nextUpgradeAt=Math.max(dist+10,nextUpgradeAt-30*P('path'));
    const extra=P('reinf')>=6?2:P('reinf')>=3?1:0;
    for(let i=0;i<extra;i++){ const pool=UPGRADES.filter(u=>u.kind==='gubbe'&&!(u.unique&&hasPart(u.id))); if(squad.length<MAX_SQUAD) addMember(pick(pool)); }
  }
  if(!labRun){
    startCompanions().forEach(h=>{ if(squad.length<MAX_SQUAD){ const m=addMember(companionDef(h)); m.charges+=h.shield||0; } });
    squad.forEach(rollForm); toast(tl('Daily form')+': '+formText(L));
  }
  (hero.extras||[]).concat(cfg.extras||[]).forEach(id=>{ const d=defById(id); if(d&&squad.length<MAX_SQUAD) addMember(d); });
  (cfg.perks||[]).forEach(id=>{ const d=defById(id); if(!d) return; if(d.kind==='pet'){ if(OPT.unicorns) addUnicorn(); } else applyTeamPerk(d); });
  camK=OPT.dyncam?0.78+0.065*(squad.length-1):1;
  bossBar.hidden=true; $('newbest').hidden=true;
  mode='playing'; menuEl.hidden=true; overEl.hidden=true; hudEl.hidden=false;
  recomputeAuras(); updatePower(0,true); updateDifficulty(); updateHUD();
  nextObsAt=dist+150; nextChestAt=dist+(easeK()>0?40:80); obsHinted={low:false,high:false,tall:false}; refreshKioskSign(); if(cfg.odFull&&hasAbility('overdrive')) S.od=1;
  tutStart();
  if(!tutWants('steer')) showHint(OPT.obstacles?(hasAbility('pound')?tl('Drag sideways to steer · swipe up = jump, down = duck, down in the air = ground pound · run into a wall to headbutt it'):tl('Drag sideways to steer · swipe up = jump, down = duck · run into a wall to headbutt it')):tl('Drag sideways to steer · run into a wall to headbutt it'));
}
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  let dt=(now-last)/1000; last=now; if(dt>0.05) dt=0.05;
  if(mode==='playing'||mode==='divine') dt*=playSpeed();
  if(mode==='divine'){ updateDivine(dt); renderer.render(scene,camera); updateDmg(dt); return; }
  dt*=slowK();
  if(mode==='playing') tutCheck();
  const frozen=mode==='paused'||mode==='shop'||tutOn();
  if(!frozen) update(dt);
  renderer.render(scene,camera);
  if(!frozen) updateDmg(dt);
}
function update(dt){
  time+=dt;
  if(mode==='playing'){ dist+=scroll*dt; updatePower(dt); updateDifficulty(); checkEvents(); spawner(dt); }
  else if(mode==='menu'){ scroll=5; }
  else if(mode==='dead'){ deadT+=dt; scroll+=(0-scroll)*(1-Math.exp(-dt*1.5)); if(deadT>1.4&&!overShown) showOver(); }
  updateWorld(dt); updateScenery(dt); updateWalls(dt);
  if(mode==='playing'){ updatePlayer(dt); updateSquad(dt); updateFire(dt); updateDelayed(dt); }
  else if(mode==='menu'){ S.x=0; updateSquad(dt); }
  updateBullets(dt); updateEnemies(dt); updateEnemyBullets(dt); updateHearts(dt); updateCoins(dt); updateZaps(dt); updateWeather(dt); updateObstacles(dt); updateXp(dt); updateChests(dt); updateUnicorns(dt); updateBossFx(dt); if(mode==='playing') updateOD(dt); updatePound(dt);
  blobs.update(dt,scroll); chunks.update(dt,scroll); updateShards(dt); updateBlobShadows();
  updateCamera(dt); updateSky(dt); updateColors(dt);
  if(mode==='playing') updateHUD();
}

function boot(data){
  best=(data&&data.best)||load('kulstorm_best',0);
  try{ if(document.fonts&&document.fonts.load){ document.fonts.load('54px Bungee'); document.fonts.load('800 30px Nunito'); } }catch(e){}
  applyCurve(); updateSky(0);
  setZone(0,true); rebuildTiles();
  showMenu('main');
  try{ if(window.claude&&window.claude.hot&&window.claude.hot.snapshot) window.claude.hot.snapshot(()=>({best})); }catch(e){}
  requestAnimationFrame(frame);
}
const hot=window.claude&&window.claude.hot;
if(hot&&hot.ready) hot.ready(boot); else boot(hot&&hot.data?hot.data:{});

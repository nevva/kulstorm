'use strict';
// ---------- player control, squad animation, firing
const keys={l:false,r:false};
const varyDmg=(a,b)=>OPT.variance?rand(a,b):1;
function updatePlayer(dt){
  const A=S.A;
  if(keys.l) S.targetX-=12*dt; if(keys.r) S.targetX+=12*dt;
  S.targetX=clamp(S.targetX,-HALF+0.5,HALF-0.5);
  S.x+=(S.targetX-S.x)*(1-Math.exp(-dt*9*A.speed*flowK()*(isW('snow')?0.8:1)));
  if(S.flowT>0){ S.flowT-=dt; if(S.flowT<=0){ S.flow=0; hudFlow=-1; } else if(squad.length){ const m=pick(squad),pp=m.g.position; blobs.spawn(pp.x+rand(-0.25,0.25),0.15,pp.z+0.3,rand(-0.3,0.3),rand(0.3,0.8),rand(0.5,1.5),0.4,0.18,0.03,WHITE,FLOW_COL,C(0xff8a3d),0,1,false,0); } }
  // Automatic front: once a second, the toughest gubbe (HP + 25 per shield charge) takes the front if clearly tougher.
  S.frontT-=dt; S.frontHold-=dt;
  if(S.frontT<=0){
    S.frontT=1;
    if(!OPT.front){ if(S.frontM){ S.frontM=null; layoutSquad(); hudFront=null; } }
    else if(squad.length>1){
      const tough=m=>m.hp+25*m.charges;
      let best=squad[0]; for(const m of squad) if(tough(m)>tough(best)) best=m;
      const cur=headMember();
      if(best!==cur&&S.frontHold<=0&&tough(best)>tough(cur)*1.1){ S.frontM=best; S.frontHold=2; layoutSquad(); hudFront=null; toast(best.def.name+' tar fronten'); }
    }
  }
  const recharge=S.combos.has('recharge');
  for(const m of squad){
    if(m.jumpDelay>=0){ m.jumpDelay-=dt; if(m.jumpDelay<0) doJump(m); }
    if(m.duckDelay>=0){ m.duckDelay-=dt; if(m.duckDelay<0){ m.duckT=DUCK_T; if((m.jy||0)>0.05&&!m.pound){ m.pound=true; m.poundSpin=POUND_SPIN; m.flip=1; m.flipSpd=1/POUND_SPIN; m.vy=0; } } }
    if(m.poundSpin>0){ m.poundSpin-=dt; m.vy=m.poundSpin>0?0:POUND_V; } else m.vy=(m.vy||0)-GRAV*dt;
    m.jy=(m.jy||0)+m.vy*dt; if(m.jy<=0){ m.jy=0; m.vy=0; m.dbUsed=false; if(m.pound){ m.pound=false; groundPound(m); } }
    if(m.duckT>0) m.duckT=Math.max(0,m.duckT-dt);
    m.invuln=Math.max(0,m.invuln-dt); if(m.safeT>0) m.safeT-=dt;
    if(A.regen>0) m.hp=Math.min(m.maxHp,m.hp+A.regen*dt);
    if(recharge&&m.def.id==='shield'&&m.charges<3){ m.rt+=dt; if(m.rt>=12){ m.rt=0; m.charges++; hudShield=-1; sfx.shield(); fxSparkle(m.g.position.x,1.2,m.g.position.z,C(0xffd21f)); } }
  }
}
function updateSquad(dt){
  const k=1-Math.exp(-dt*10),kf=1-Math.exp(-dt*7);
  for(const m of squad) if(m.boff){ m.g.position.z-=m.boff; m.boff=0; }
  if(OPT.snake){
    let prev=null;
    for(const m of chainOrder()){
      const g=m.g;
      if(!prev){ g.position.x+=(S.x-g.position.x)*k; g.position.z+=(0-g.position.z)*k; }
      else { const pp=prev.g.position; g.position.x+=(pp.x-g.position.x)*kf; g.position.z+=((pp.z+0.78)-g.position.z)*k; }
      g.position.x=clamp(g.position.x,-HALF+0.4,HALF-0.4);
      prev=m;
    }
  }else{
    squad.forEach(m=>{ const g=m.g,s=m.slot,tx=clamp(S.x+s[0],-HALF+0.4,HALF-0.4); g.position.x+=(tx-g.position.x)*k; g.position.z+=(s[1]-g.position.z)*k; });
  }
  squad.forEach(m=>{
    const g=m.g,u=g.userData,t=time*13+m.phase;
    g.rotation.z=clamp((g.position.x-S.x)*0.12,-0.3,0.3);
    u.legL.rotation.x=Math.sin(t)*0.9; u.legR.rotation.x=-Math.sin(t)*0.9;
    const air=m.jy||0;
    g.position.y=air>0?air:Math.abs(Math.sin(t))*0.07;
    // ducking on the ground: curl up into a ball and roll forward one full turn, around the ball's centre
    const s0=m.def.id==='tank'?1.22:1,rolling=m.duckT>0&&air<=0&&!(m.butt>0)&&!(m.flip>0);
    if(rolling||m.rollA>0){ m.rollA=(m.rollA||0)+dt*Math.PI*2/DUCK_T; if(m.rollA>=Math.PI*2){ if(m.duckT>0.05) m.rollA-=Math.PI*2; else { m.rollA=0; g.rotation.x=0; } } }
    const ball=m.rollA>0,duck=ball?0.55:m.duckT>0?0.5:1;
    g.scale.set(s0*(duck<1?1.15:1),s0*duck,s0);
    if(air>0){ u.legL.rotation.x=0.6; u.legR.rotation.x=-0.3; }
    if(ball){ const a=m.rollA,c=0.55*s0,off=c*Math.sin(a); g.rotation.x=-a; g.position.y+=c*(1-Math.cos(a)); g.position.z+=off; m.boff=(m.boff||0)+off; u.legL.rotation.x=u.legR.rotation.x=-1.3; }
    m.recoil*=Math.exp(-dt*18);
    u.gun.position.z=-0.62+m.recoil;
    u.armL.rotation.x=u.armR.rotation.x=1.35-m.recoil*0.8;
    if(m.hurtT>0){ m.hurtT-=dt; g.rotation.z+=(Math.random()-0.5)*0.5*m.hurtT; }
    const f=clamp(m.hp/m.maxHp,0,1); u.barFg.scale.x=0.7*f; u.barFg.position.x=-0.35*(1-f); u.barFg.material=f<0.3?barRed:barGreen;
    // headbutt: lean back and crouch, snap forward head first, spring back
    if(m.butt>0){
      m.butt+=dt; const bt=m.butt; let off=0,rot=0,sy=1;
      if(bt<0.3){ const q=bt/0.3; rot=0.55*q; off=0.35*q; sy=1-0.18*q; }
      else if(bt<0.42){ const q=(bt-0.3)/0.12; rot=0.55-1.55*q; off=0.35-1.35*q; sy=0.82+0.28*q; }
      else if(bt<0.8){ const q=(bt-0.42)/0.38; rot=-1.0*(1-q); off=-1.0*(1-q); sy=1.1-0.1*q; }
      else m.butt=0;
      if(m.butt>0){ g.position.z+=off; m.boff=off; g.rotation.x=rot; g.scale.y*=sy; }
      else g.rotation.x=0;
    }
    if(u.band){ u.band.rotation.x=0.3+Math.sin(time*14+m.phase)*0.25; u.band.rotation.y=Math.sin(time*9+m.phase)*0.25; }
    if(m.flip>0&&!(m.butt>0)){ m.flip=Math.max(0,m.flip-dt*(m.flipSpd||2.4)); g.rotation.x=-(1-m.flip)*Math.PI*2; if(m.flip===0){ g.rotation.x=0; m.flipSpd=0; } }
    if(S.odT>0&&Math.random()<dt*14){ const pp=g.position; blobs.spawn(pp.x+rand(-0.3,0.3),pp.y+rand(0.3,1.7),pp.z+0.2,0,rand(0.2,0.8),rand(1,2.5),0.35,0.2,0.04,WHITE,C(0xffe066),C(0xffa000),0,1,false,0); }
    if(m.stars>0){ m.stars-=dt; m.starT=(m.starT||0)-dt; if(m.starT<=0){ m.starT=0.07; const a=time*9+m.phase,p=g.position,hy=2.1*(m.def.id==='tank'?1.22:1); blobs.spawn(p.x+Math.cos(a)*0.45,hy,p.z+Math.sin(a)*0.45,-Math.sin(a)*1.5,0.3,Math.cos(a)*1.5,0.35,0.16,0.05,WHITE,C(0xffd21f),C(0xffb300),0,0.5,false,0); } }
  });
  shieldRing.visible=mode==='playing'&&totalShield()>0;
  if(shieldRing.visible&&squad[0]){ shieldRing.position.set(squad[0].g.position.x,0.9+0.1*Math.sin(time*3),squad[0].g.position.z); shieldRing.rotation.z+=dt*2; }
  const fm=S.frontM;
  frontMarker.visible=false;
  if(frontMarker.visible){ const p=fm.g.position,scl=fm.def.id==='tank'?1.22:1; frontMarker.position.set(p.x,2.55*scl+0.15*Math.sin(time*5),p.z); frontMarker.rotation.y+=dt*3; }
}
const tipV=new THREE.Vector3();
function updateFire(dt){
  const A=S.A;
  for(const m of squad){
    const w=WEAPONS[m.def.weapon||'pistol'];
    if(w.laser){ laserMember(m,w,A,dt); continue; }
    const rate=w.rate*A.rate*flowK()*odRate();
    m.cd-=dt;
    if(m.cd<=0){ m.cd+=1/rate; fireFrom(m,w,A); }
  }
}
function laserMember(m,w,A,dt){
  const n=Math.min(3,1+A.extra);
  ensureBeams(m,n); m.g.userData.tip.getWorldPosition(tipV);
  m.beams.forEach((b,i)=>{ b.visible=i<n; const off=n===1?0:(i-(n-1)/2)*0.5; b.position.set(tipV.x+off,tipV.y,tipV.z-55); const p=1+0.3*Math.sin(time*40+i*2); b.scale.set(p,p,1); });
  m.laserTick-=dt;
  if(m.laserTick<=0){
    m.laserTick=0.1;
    const base=w.dps*A.dmg*A.rate*0.1*memberMult(m)*flowK()*flowK()*odK()*odRate(),burn=S.combos.has('burn');
    m.beams.forEach(b=>{
      if(!b.visible) return; const bx=b.position.x;
      for(const e of enemies){ if(e.dead||e.under) continue; const p=e.g.position; if(p.z<0.5&&Math.abs(p.x-bx)<e.r+0.15){ const crit=Math.random()<A.crit,dv=base*varyDmg(0.75,1.25)*(crit?2:1),tier=dmgTier(dv/base,crit); hitEnemy(e,dv,crit,tier,m,true); fxDamage(bx,p.y+e.r*0.8,p.z+e.r*0.5,tier); if(burn&&!e.dead){ e.burn=3; e.burnDps=base*4; e.burnOwner=m; e.burnSrc='c:burn'; } if(crit&&S.combos.has('chain')&&!e.dead) chainFrom(e,dv,m); } }
      for(const wl of walls){ const wp=wl.g.position; if(!wl.dead&&wp.z<0.5&&Math.abs(wp.x-bx)<1.8){ const crit=Math.random()<A.crit,dv=base*varyDmg(0.75,1.25)*(crit?2:1),tier=dmgTier(dv/base,crit); hitWall(wl,dv,bx,rand(0.5,1.9),wp.z+0.3,crit,tier); fxDamage(bx,rand(0.6,1.8),wp.z+0.3,tier); } }
    });
    sfx.laser();
  }
}
function spawnBullet(o){
  const k=bullets.take(); if(k<0) return;
  const d=bullets.d[k],A=o.A,w=o.w,crit=Math.random()<A.crit;
  d.x=o.x; d.y=o.y; d.z=o.z; d.vx=Math.sin(o.angle)*w.speed; d.vz=-Math.cos(o.angle)*w.speed;
  d.base=o.base; d.dmg=o.base*(o.mult||1)*varyDmg(0.75,1.25)*(crit?(o.owner&&o.owner.def.id==='glass'&&S.combos.has('crystal')?3:2):1); d.pierce=S.odT>0&&!w.rocket?99:(o.pierce!==undefined?o.pierce:(w.rocket?0:A.pierce)); d.size=w.size*A.bullet*(crit?1.4:1)*(o.gen?0.8:1)*(S.odT>0?1.4:1);
  d.col=crit?SPARK:(S.odT>0?OD_COL:(S.flowT>0&&!o.gen?FLOW_COL:w.colorL)); d.rocket=!!w.rocket; d.aoe=w.aoe||0; d.bounce=A.bounce; d.hits=[]; d.trail=0; d.crit=crit; d.gen=o.gen||0; d.owner=o.owner||null; d.wid=w.id||''; d.tgt=null; d.ht=0; d.homed=false; d.x0=d.x; d.z0=d.z; d.dxz=d.vx/d.vz; d.pin=1; d.cry=crit&&!!o.owner&&o.owner.def.id==='glass'&&S.combos.has('crystal'); d.cp=o.cp||null; d.p0=A.pierce;
}
function fireFrom(m,w,A){
  m.g.userData.tip.getWorldPosition(tipV);
  const n=w.bullets+A.extra;
  const spread=w.spread+(n>1?0.07*(n-1):0);
  const base=w.dmg*A.dmg*memberMult(m)*flowK()*odK();
  const cp=S.combos.has('spike')&&w.id==='shotgun'?'c:spike':w.id==='minigun'&&S.combos.has('leadrain')?'c:leadrain':null;
  const pierce=(S.combos.has('spike')&&w.id==='shotgun')?99:w.id==='shuriken'?A.pierce+2:(w.id==='minigun'&&S.combos.has('leadrain'))?A.pierce+1:undefined;
  // Light close-range aim assist: bend shots up to ~8° toward the nearest enemy within 6 m in this gubbe's lane.
  let aim=0; { const ln=laneOf(tipV.x); let best=null,bz=-1e9; for(const e of enemies){ if(e.dead||e.under||e.isBoss) continue; const ep=e.g.position; if(ep.z<tipV.z-0.2&&ep.z>tipV.z-6&&laneOf(ep.x)===ln&&ep.z>bz){ bz=ep.z; best=e; } }
    if(best){ const ep=best.g.position; aim=clamp(Math.atan2(ep.x-tipV.x,tipV.z-ep.z),-0.14,0.14)*(m===headMember()?1:0.6); } }
  for(let i=0;i<n;i++){
    let a=(n===1?0:-spread/2+spread*(i/(n-1)))+aim; a+=rand(-w.jitter,w.jitter);
    spawnBullet({x:tipV.x,y:tipV.y,z:tipV.z,angle:a,w,A,base,gen:0,mult:1,owner:m,pierce,cp});
  }
  m.recoil=w.rocket?0.25:0.12;
  fxMuzzle(tipV.x,tipV.y,tipV.z,w.colorL);
  sfx.shoot(w);
}
// Målsökare (homing combo): the nearest enemy ahead of a bullet, within 25 m.
function homingTarget(x,z){
  let best=null,bd=625;
  for(const e of enemies){ if(e.dead||e.under) continue; const p=e.g.position; if(p.z>z-0.5) continue; const d2=(p.x-x)**2+(p.z-z)**2; if(d2<bd){ bd=d2; best=e; } }
  return best;
}
const HOMING_TURN=3;  // rad/s
function updateBullets(dt){
  const al=bullets.alive; let n=0;
  const A=S.A,minZ=(VIEW.spawn-8)*(isW('rain')?0.8:1),gutter=S.T.gutter,wind=W.wind*1.3,homing=S.combos.has('homing'),pinball=S.combos.has('pinball');
  for(let k=0;k<al.length;k++){
    const i=al[k],d=bullets.d[i];
    if(homing&&!d.rocket){
      d.ht-=dt; if(d.ht<=0||(d.tgt&&d.tgt.dead)){ d.ht=0.12; d.tgt=homingTarget(d.x,d.z); }
      if(d.tgt){ const q=d.tgt.g.position,sp=Math.hypot(d.vx,d.vz),a=Math.atan2(d.vx,-d.vz),da=clamp(Math.atan2(q.x-d.x,d.z-q.z)-a,-HOMING_TURN*dt,HOMING_TURN*dt); d.vx=Math.sin(a+da)*sp; d.vz=-Math.cos(a+da)*sp; d.homed=true; }
    }
    if(wind) d.vx+=wind*dt;
    d.x+=d.vx*dt; d.z+=d.vz*dt;
    let dead=false;
    if(Math.abs(d.x)>HALF){
      if(d.bounce){ d.x=clamp(d.x,-HALF,HALF); d.vx=-d.vx; fxSpark(d.x,d.y,d.z,d.col); if(pinball){ d.dmg*=1.3; d.pin*=1.3; } }
      else if(gutter){ d.x=clamp(d.x,-HALF+0.05,HALF-0.05); if(d.vx!==0){ d.vz=-Math.hypot(d.vx,d.vz); d.vx=0; fxSpark(d.x,d.y,d.z,GOLD); } }
      else if(Math.abs(d.x)>HALF+1.5) dead=true;
    }
    if(d.z<minZ) dead=true;
    if(d.rocket){ d.trail-=dt; if(d.trail<=0){ d.trail=0.035; fxSmoke(d.x,d.y,d.z+0.3); } }
    if(uniStar.active&&Math.abs(uniStar.g.position.x-d.x)<0.8&&Math.abs(uniStar.g.position.z-d.z)<0.8){ collectStar(); dead=true; }
    if(!dead&&walls.length){
      for(const wl of walls){
        if(wl.dead) continue;
        const wp=wl.g.position;
        if(Math.abs(wp.z-d.z)<0.6&&Math.abs(wp.x-d.x)<1.8+d.size*0.2){
          const tier=dmgTier(d.dmg/d.base,d.crit);
          if(d.rocket) explodeAt(d.x,d.y,d.z,d.aoe,d.dmg,d.base,false,d.owner,0); else { hitWall(wl,d.dmg,d.x,d.y,d.z,d.crit,tier); fxDamage(d.x,d.y,d.z,tier); sfx.hit(); }
          dead=true; break;
        }
      }
    }
    if(!dead){
      for(const e of enemies){
        if(e.dead||e.under) continue;
        const p=e.g.position,dx=p.x-d.x,dz=p.z-d.z,rr=e.r+d.size*0.25+(p.z>-6&&(SMALL_E.has(e.type)||e.base<1)?0.4:0);
        if(dx*dx+dz*dz<rr*rr&&d.hits.indexOf(e)<0){
          if(e.type==='crawler'&&p.z<-8&&!d.rocket&&d.pierce<=0&&Math.random()<0.5){ d.hits.push(e); continue; }
          if(d.rocket){ explodeAt(d.x,d.y,d.z,d.aoe,d.dmg,d.base,false,d.owner,0); dead=true; break; }
          const tier=dmgTier(d.dmg/d.base,d.crit);
          // credit the hit: ricochet children, hits only reached by homing or by a combo's extra pierce go to that perk or combo
          dmgSrc=d.gen>0?'p:ricochet':d.cp&&d.hits.length>d.p0?d.cp:d.homed&&Math.abs(d.x0+d.dxz*(p.z-d.z0)-p.x)>rr?'c:homing':null;
          hitBoost=d.pin>1||d.cry?[{key:'c:pinball',k:d.pin},{key:'c:crystal',k:d.cry?1.5:1}]:null;
          d.hits.push(e); hitEnemy(e,d.dmg,d.crit,tier,d.owner,d.gen>0); dmgSrc=null; hitBoost=null; fxHit(d.x,d.y,d.z,e.colorL); fxDamage(d.x,d.y,d.z,tier); sfx.hit();
          if(!e.dead) onHitEffects(e,d);
          if(S.T.ricochet&&d.gen<1){
            const w={id:d.wid,speed:Math.hypot(d.vx,d.vz),size:d.size/(A.bullet||1)/(d.crit?1.4:1),colorL:d.col,rocket:false,aoe:0};
            const fwd=Math.atan2(d.vx,-d.vz);
            spawnBullet({x:d.x,y:d.y,z:d.z,angle:fwd+0.55,w,A,base:d.base,gen:1,mult:0.6,owner:d.owner});
            spawnBullet({x:d.x,y:d.y,z:d.z,angle:fwd-0.55,w,A,base:d.base,gen:1,mult:0.6,owner:d.owner});
          }
          if(d.pierce<=0){ dead=true; break; } d.pierce--;
        }
      }
    }
    if(dead){ bullets.kill(i); if(d.wid==='shuriken') starMesh.setMatrixAt(i,ZERO); continue; }
    al[n++]=i;
    if(d.wid==='shuriken'){ bullets.mesh.setMatrixAt(i,ZERO); tmpQ.setFromEuler(tmpE.set(0,time*22+i,0)); tmpM.compose(tmpV.set(d.x,d.y,d.z),tmpQ,tmpS.set(d.size,d.size,d.size)); starMesh.setMatrixAt(i,tmpM); }
    else bullets.write(i,d.size,d.size,d.size*(d.rocket?1.6:2.4),Math.atan2(d.vx,d.vz));
  }
  al.length=n; bullets.flush(); starMesh.instanceMatrix.needsUpdate=true;
}
function updateEnemyBullets(dt){
  const al=ebullets.alive; let n=0;
  for(let k=0;k<al.length;k++){
    const i=al[k],d=ebullets.d[i];
    const ws=isW('snow')?0.8:1;
    d.vx+=W.wind*0.9*dt;
    d.x+=d.vx*dt*ws; d.z+=(d.vz*ws+scroll*0.6)*dt;
    let dead=d.z>7||Math.abs(d.x)>HALF+2;
    if(!dead&&mode==='playing'){
      for(const m of squad){ const p=m.g.position; if(Math.abs(p.x-d.x)<0.5&&Math.abs(p.z-d.z)<0.6){ hurtMember(m,8*DIFF.dmg); fxHit(d.x,d.y,d.z,EB_COL); dead=true; break; } }
    }
    if(dead){ ebullets.kill(i); continue; }
    al[n++]=i; ebullets.write(i,1,1,1,0);
  }
  al.length=n; ebullets.flush();
}
function updateDelayed(dt){
  for(let i=delayed.length-1;i>=0;i--){ const q=delayed[i]; q.t-=dt; q.z+=scroll*dt; if(q.t<=0){ delayed.splice(i,1); dmgSrc='c:rain'; explodeAt(q.x,0.6,q.z,q.radius,q.dmg,q.base,false,q.owner,1); dmgSrc=null; } }
}
function die(){
  unlockMouse();
  document.body.classList.remove('od-on');
  mode='dead'; deadT=0; overShown=false; sfx.die(); shake(1.2);
  squad.forEach(m=>{ if(m.dead) return; const p=m.g.position; fxExplosion(p.x,1,p.z,1.1,C(m.def.shirt)); m.g.visible=false; m.beams.forEach(b=>b.visible=false); });
  shieldRing.visible=false; frontMarker.visible=false; bossBar.hidden=true;
  if(!labRun&&Math.floor(dist)>best){ best=Math.floor(dist); store('kulstorm_best',best); $('newbest').hidden=false; } else $('newbest').hidden=true;
  if(!labRun&&OPT.coins&&coinsRun>0){ bank+=coinsRun; saveBank(); }
  lastHeroGain=commitHeroXp();
}
let lastHeroGain={gain:0,ups:0};
function showOver(){
  unlockMouse();
  overShown=true; hudEl.hidden=true;
  $('odist').textContent=fmt(dist); $('okills').textContent=fmt(kills); $('obest').textContent=fmt(best);
  const hx=$('oherox'); hx.hidden=!(OPT.heroprog&&lastHeroGain.gain>0); hx.textContent='+'+fmt(lastHeroGain.gain)+' hjälte-XP'+(lastHeroGain.ups?' · Hjältenivå '+HERO.lvl+'! +'+lastHeroGain.ups+' talangpoäng':'');
  $('ocoins').textContent=labRun?'Labbrunda – inga mynt eller rekord':(OPT.coins?'+'+fmt(coinsRun)+' mynt · totalt '+fmt(bank):'');
  renderRunSummary(); renderOverUpgrades();
  overEl.hidden=false; overEl.scrollTop=0;
}
// Game over: damage per gubbe, team perk, combo and ability this run, biggest first, with a bar for each one's share.
function renderRunSummary(){
  const rows=runSummary(),total=rows.reduce((a,r)=>a+r.dmg,0),box=$('o-summary'); box.innerHTML='';
  $('o-total').textContent='Total skada '+fmt(total);
  rows.forEach(r=>{
    const row=document.createElement('div'); row.className='row sum';
    const nm=document.createElement('div'); nm.className='nm'; nm.textContent=r.name;
    const sm=document.createElement('small'); sm.textContent=r.kind+(r.dmg<1&&r.desc?' · '+r.desc:''); nm.appendChild(sm);
    const v=document.createElement('div'); v.className='dmgv';
    const b=document.createElement('b'); b.textContent=r.dmg>=1?fmt(r.dmg):'–';
    const pc=document.createElement('small'); pc.textContent=r.dmg>=1&&total>0?Math.round(100*r.dmg/total)+' %':'';
    v.append(b,pc);
    const bar=document.createElement('i'); bar.style.width=(total>0?100*r.dmg/total:0).toFixed(1)+'%';
    row.append(nm,v,bar); box.appendChild(row);
  });
}
// Game over: spend talent points (or banked coins) on the hero before the next round.
function renderOverUpgrades(){
  const on=OPT.heroprog; $('o-up').hidden=!on; if(!on) return;
  const free=heroFree();
  $('o-up-info').textContent=free>0?free+' talangpoäng att fördela. Det gäller från nästa runda.':OPT.coins?'Köp talangpoäng med mynt. Nästa kostar '+fmt(TALENT_COST(HERO.bought||0))+' · du har '+fmt(bank)+'.':'Du får talangpoäng när hjälten går upp i nivå.';
  renderTalents($('o-talents'),renderOverUpgrades);
}

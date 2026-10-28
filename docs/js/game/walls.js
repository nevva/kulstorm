'use strict';
// ---------- upgrade walls: appear in random lanes, shoot one apart to claim it
const WALL_COL={common:0x6fc3ff,rare:0xffd21f,epic:0xff5cf3},WALL_CSS={common:'#6fc3ff',rare:'#ffd21f',epic:'#ff5cf3'};
const wallPostMat=mat(0xfff8e6,{r:0.35}),wallBarBg=mat(0x0d1030,{r:0.5}),wallBarFg=mat(0xff5c7a,{e:0.6});
let walls=[];
function rollUpgrades(n,boss){
  const full=squad.length>=MAX_SQUAD;
  const pool=UPGRADES.filter(u=>!(u.unique&&hasPart(u.id))&&!(u.max&&S.perks.filter(q=>q.id===u.id).length>=u.max)&&!(full&&u.kind==='gubbe')&&!(!OPT.team&&u.kind==='team')&&!(u.kind==='pet'&&(!OPT.unicorns||unicorns.length>=2)));
  const picks=[];
  if(boss){ const ep=pool.filter(u=>u.rarity==='epic'); if(ep.length){ const u=pick(ep); picks.push(u); pool.splice(pool.indexOf(u),1); } }
  while(picks.length<n&&pool.length){
    const ws=pool.map(u=>(boss?(u.rarity==='common'?10:u.rarity==='rare'?35:55):(u.rarity==='common'?60:u.rarity==='rare'?30:11))*(u.kind==='team'?0.7:1));
    let r=Math.random()*ws.reduce((a,b)=>a+b,0),idx=0;
    for(;idx<ws.length-1;idx++){ r-=ws[idx]; if(r<=0) break; }
    picks.push(pool.splice(idx,1)[0]);
  }
  return boss?shuffle(picks):picks;
}
function wrapText(x,text,maxW){
  const words=text.split(' '),lines=[]; let line='';
  for(const w of words){ const t=line?line+' '+w:w; if(x.measureText(t).width>maxW&&line){ lines.push(line); line=w; } else line=t; }
  if(line) lines.push(line);
  return lines;
}
function signTexture(u,boss){
  const c=document.createElement('canvas'); c.width=512; c.height=384; const x=c.getContext('2d');
  x.fillStyle='#fff8e6'; x.fillRect(0,0,512,384);
  x.fillStyle=boss?'#ffc83d':WALL_CSS[u.rarity]; x.fillRect(0,0,512,72);
  if(boss){ x.strokeStyle='#ffc83d'; x.lineWidth=14; x.strokeRect(7,7,498,370); }
  x.textAlign='center'; x.textBaseline='middle';
  x.fillStyle='#0d1030'; x.font='800 30px Nunito, sans-serif';
  x.fillText((boss?tl('BOSS REWARD'):u.kind==='team'?tl('FOR EVERYONE'):u.kind==='pet'?tl('HELPER'):tl('NEW RECRUIT'))+' · '+RARITY[u.rarity].toUpperCase(),256,38);
  let fs=54; x.font=fs+'px Bungee, Impact, sans-serif';
  while(x.measureText(u.name).width>470&&fs>28){ fs-=4; x.font=fs+'px Bungee, Impact, sans-serif'; }
  x.fillStyle=u.kind==='gubbe'?hexCss(u.shirt):'#0d1030';
  if(u.kind==='gubbe'){ x.strokeStyle='#0d1030'; x.lineWidth=6; x.lineJoin='round'; x.strokeText(u.name,256,150); }
  x.fillText(u.name,256,150);
  x.fillStyle='#3b4075'; x.font='800 30px Nunito, sans-serif';
  wrapText(x,u.desc,450).slice(0,3).forEach((l,i)=>x.fillText(l,256,232+i*40));
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return t;
}
const wallGoldMat=mat(0xffc83d,{r:0.2,m:0.6,e:0.35});
function buildWall(u,boss){
  const g=new THREE.Group(),post=boss?wallGoldMat:wallPostMat;
  const m=new THREE.MeshStandardMaterial({color:C(WALL_COL[u.rarity]),roughness:0.28,flatShading:true,emissive:new THREE.Color(0),emissiveIntensity:1});
  g.add(M(G.box,m,[3.6,2.3,0.5],[0,1.15,0]));
  [-1,1].forEach(s=>g.add(M(G.box,post,[0.22,2.65,0.62],[s*1.8,1.32,0])));
  g.add(M(G.box,post,[3.82,0.22,0.62],[0,2.54,0]));
  if(boss) [-1,1].forEach(s=>g.add(M(G.ico0,wallGoldMat,[0.3,0.3,0.3],[s*1.8,2.85,0],false)));
  const tex=signTexture(u,boss),sm=new THREE.MeshBasicMaterial({map:tex});
  const sign=new THREE.Mesh(G.plane,sm); sign.scale.set(2.8,2.1,1); sign.position.set(0,1.15,0.26); g.add(sign);
  g.add(M(G.box,wallBarBg,[3.2,0.16,0.16],[0,2.92,0],false));
  const bar=M(G.box,wallBarFg,[3.2,0.12,0.2],[0,2.92,0],false); g.add(bar);
  g.userData={m,bar,tex,sm};
  return g;
}
let wallGroupId=0;
function spawnWalls(lanes,boss){
  const picks=rollUpgrades(lanes.length,boss); if(!picks.length) return;
  const hp=60*DIFF.hp*PF*(isW('heat')?1.3:1)*(boss?0.5:1),gid=boss?++wallGroupId:0;
  picks.forEach((u,i)=>{
    const lane=lanes[i];
    const g=buildWall(u,boss); g.position.set(LANE_X[lane],0,VIEW.spawn); scene.add(g);
    walls.push({u,g,lane,hp,maxHp:hp,dead:false,flash:0,sq:0,colL:g.userData.m.color,accDmg:0,accTier:0,accT:-1,boss:!!boss,gid});
  });
  if(boss){ toast(tl('Boss reward! Pick one')); sfx.combo(); }
  else { toast(picks.length>1?tl('Upgrades!'):tl('Upgrade!')); sfx.zone(); }
}
function spawnRandomWalls(){
  const a=ri(0,LANES-1);
  if(Math.random()<0.15){ let b; do{ b=ri(0,LANES-1); }while(b===a); spawnWalls([a,b]); }
  else spawnWalls([a]);
}
const wallPieceMat=w=>mat(WALL_COL[w.u.rarity],{r:0.28});
function removeWall(w){ if(!w.g.parent) return; scene.remove(w.g); w.g.userData.tex.dispose(); w.g.userData.sm.dispose(); w.g.userData.m.dispose(); }
function flushWallDmg(w){ const p=w.g.position; flushDmg(w,p.x,3.3,p.z); }
function hitWall(w,dmg,x,y,z,crit,tier){
  if(w.dead) return;
  w.hp-=dmg; w.flash=0.06; w.sq=1; fxHit(x,y,z,w.colL);
  w.accDmg+=dmg; w.accTier=Math.max(w.accTier,tier||0); if(w.accT<0) w.accT=0;
  if(crit){ sfx.crit(); flushWallDmg(w); }
  if(w.hp<=0) breakWall(w);
}
function breakWall(w){
  const p=w.g.position;
  addOD(0.08);
  flushWallDmg(w);
  w.dead=true;
  fxShatter(p.x,p.z,wallPieceMat(w),w.boss?wallGoldMat:wallPostMat,1.3); sfx.explode(1.6); shake(0.5);
  removeWall(w);
  if(w.gid) for(const o of walls){ if(o!==w&&!o.dead&&o.gid===w.gid){ o.dead=true; fxShatter(o.g.position.x,o.g.position.z,wallPieceMat(o),o.boss?wallGoldMat:wallPostMat,0.7); removeWall(o); } }
  if(OPT.coins) spawnCoin(p.x+rand(-0.5,0.5),p.z,3);
  if(w.u.kind==='pet'){ addUnicorn(); toast(tl('A unicorn joins!')); }
  else if(w.u.kind==='gubbe'){ const m=addMember(w.u); fxSparkle(m.g.position.x,1.2,m.g.position.z,C(w.u.shirt)); toast(tl('{0} joins!',w.u.name)); }
  else { applyTeamPerk(w.u); toast(w.u.name+'!'); }
  sfx.upgrade();
}
function updateWalls(dt){
  for(const w of walls){
    if(w.dead) continue;
    const p=w.g.position; p.z+=scroll*dt;
    if(w.sq>0){ w.sq*=Math.exp(-dt*10); const s=1+0.08*w.sq; w.g.scale.set(s,s,1); if(w.sq<0.01){ w.sq=0; w.g.scale.set(1,1,1); } }
    const m=w.g.userData.m;
    if(w.flash>0){ w.flash-=dt; m.emissive.setRGB(0.8,0.8,0.8); } else if(w.boss){ const k=0.25+0.15*Math.sin(time*5); m.emissive.setRGB(k,k*0.8,k*0.3); } else m.emissive.setRGB(0,0,0);
    if(w.boss&&Math.random()<dt*10) blobs.spawn(p.x+rand(-1.8,1.8),rand(0.2,2.8),p.z+0.3,0,rand(0.5,1.5),0,0.6,0.14,0.03,WHITE,GOLD,C(0xff8a3d),-1,1,false,0);
    const f=Math.max(0,w.hp/w.maxHp),bar=w.g.userData.bar; bar.scale.x=3.2*f; bar.position.x=-1.6*(1-f);
    if(w.accT>=0){ w.accT+=dt; if(w.accT>0.12) flushWallDmg(w); }
    const inLane=mode==='playing'&&laneOf(S.x)===w.lane;
    if(inLane&&!w.windup&&p.z>-0.9-scroll*0.3){ w.windup=true; const h=headMember(); if(h){ h.butt=0.001; sfx.hiyaa(); } }
    if(p.z>-0.9){
      if(inLane){
        // Headbutt: the front gubbe smashes the wall, claims the upgrade and takes damage from the wall's remaining HP.
        const h=headMember(),d=clamp(0.2*w.hp,10,0.4*h.maxHp),hp=h.g.position;
        if(!(h.butt>0)) h.butt=0.3;
        h.stars=1.2;
        breakWall(w);
        for(let i=0;i<14;i++){ const a=rand(-1.2,1.2),sp=rand(4,9); chunks.spawn(p.x+rand(-1.5,1.5),rand(0.4,2.2),p.z,Math.sin(a)*sp,rand(2,6),-Math.cos(a)*sp*0.6-2,rand(0.8,1.4),0.34,0.18,w.colL,w.colL,SMOKE2,16,0.4,true,rand(4,12)); }
        if(h.def.id!=='ninja') pushDmg(hp.x,3.2,hp.z,'HIYAA','#ffd21f',true,true,tl('HEADBUTT STAR'));
        shake(1.0); sfx.smack();
        if(h.def.id==='ninja'){ h.flip=1; for(let i=0;i<12;i++) blobs.spawn(hp.x+rand(-0.5,0.5),rand(0.3,1.8),hp.z+rand(-0.5,0.5),rand(-1.5,1.5),rand(0.5,1.5),rand(-1.5,1.5),rand(0.6,0.9),0.3,0.7,C(0x9e9e9e),C(0x616161),C(0x424242),-1,2,false,rand(1,3)); pushDmg(hp.x,2.6,hp.z,'NINJA!','#e53935',true,true); }
        else hurtMember(h,d,true);
      } else { w.dead=true; fxShatter(p.x,p.z,wallPieceMat(w),w.boss?wallGoldMat:wallPostMat,0.6); sfx.explode(1.2); removeWall(w); }
    }
  }
  walls=walls.filter(w=>!w.dead);
}

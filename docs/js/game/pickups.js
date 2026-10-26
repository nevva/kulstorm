'use strict';
// ---------- hearts & coins
let hearts=[]; const heartPool=[];
function buildHeart(){
  const g=new THREE.Group(),m=mat(0xff3d6e,{e:0.35,r:0.25});
  g.add(M(G.sph,m,[0.26,0.26,0.26],[-0.17,0.12,0],false)); g.add(M(G.sph,m,[0.26,0.26,0.26],[0.17,0.12,0],false));
  const c=M(G.cone,m,[0.42,0.5,0.42],[0,-0.15,0],false); c.rotation.x=Math.PI; g.add(c);
  return g;
}
function spawnHeart(x,z,amt){
  const g=heartPool.pop()||buildHeart();
  g.position.set(x,0.7,z); g.scale.setScalar(0.75+amt/30*0.7); g.visible=true; scene.add(g);
  hearts.push({g,t:rand(0,6),amt});
}
function updateHearts(dt){
  for(const h of hearts){
    const p=h.g.position; h.t+=dt; p.z+=scroll*dt; h.g.rotation.y+=dt*3; p.y=0.7+0.15*Math.sin(h.t*4);
    if(S.A&&S.A.magnet&&mode==='playing'){ const dx=S.x-p.x,dz=0-p.z,d=Math.hypot(dx,dz); if(d<9&&d>0.1){ p.x+=dx/d*12*dt; p.z+=dz/d*12*dt; } }
    let got=false;
    if(mode==='playing') for(const m of squad){ if(Math.abs(m.g.position.x-p.x)<0.9&&Math.abs(m.g.position.z-p.z)<0.9){ got=true; break; } }
    if(got){
      let t=squad[0]; for(const m of squad) if(m.hp/m.maxHp<t.hp/t.maxHp) t=m;
      const amt=h.amt*S.T.heartMult;
      t.hp=Math.min(t.maxHp,t.hp+amt); sfx.pickup(); fxSparkle(p.x,p.y,p.z,PINK);
      pushDmg(t.g.position.x,2.5,t.g.position.z,'+'+amt,'#36e2b4',true); h.dead=true;
    }
    else if(p.z>4) h.dead=true;
    if(h.dead){ scene.remove(h.g); heartPool.push(h.g); }
  }
  hearts=hearts.filter(h=>!h.dead);
}
let coins=[]; const coinPool=[]; const coinMat=mat(0xffc83d,{e:0.35,r:0.2,m:0.6});
function spawnCoin(x,z){
  const g=coinPool.pop()||(function(){ const c=M(G.coin,coinMat,[0.26,0.07,0.26],[0,0,0],false); c.rotation.x=Math.PI/2; return c; })();
  g.position.set(clamp(x,-HALF+0.3,HALF-0.3),0.55,z); g.visible=true; scene.add(g);
  coins.push({g,t:rand(0,6),vz:rand(-1,1),vx:rand(-1,1),dead:false});
}
function updateCoins(dt){
  for(const c of coins){
    const p=c.g.position; c.t+=dt; p.z+=(scroll+c.vz)*dt; p.x+=c.vx*dt; c.vz*=0.9; c.vx*=0.9; c.g.rotation.z+=dt*4; p.y=0.55+0.12*Math.sin(c.t*5);
    if(S.A&&S.A.magnet&&mode==='playing'){ const dx=S.x-p.x,dz=0-p.z,d=Math.hypot(dx,dz); if(d<9&&d>0.1){ p.x+=dx/d*14*dt; p.z+=dz/d*14*dt; } }
    if(mode==='playing') for(const m of squad){ if(Math.abs(m.g.position.x-p.x)<0.8&&Math.abs(m.g.position.z-p.z)<0.8){ c.dead=true; break; } }
    if(c.dead){ coinsRun+=S.T.coinMult; sfx.coin(); fxSpark(p.x,p.y,p.z,GOLD); hudCoins=-1; }
    else if(p.z>4) c.dead=true;
    if(c.dead){ scene.remove(c.g); coinPool.push(c.g); }
  }
  coins=coins.filter(c=>!c.dead);
}

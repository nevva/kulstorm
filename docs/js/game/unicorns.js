'use strict';
// ---------- unicorns: helpers that fire rainbow roads; gubbar standing on a road take half damage (and for 1.5 s after)
const RAINBOW=[0xff5252,0xffa726,0xffee58,0x66bb6a,0x42a5f5,0xab47bc].map(h=>C(h));
const rbMats=[0xff5252,0xffa726,0xffee58,0x66bb6a,0x42a5f5,0xab47bc].map(h=>mat(h,{e:0.65,r:0.2}));
let unicorns=[],roads=[];
function buildUnicorn(){
  const g=new THREE.Group(),white=mat(0xfffaf4,{r:0.25}),hoof=mat(0xffc1e3,{r:0.3}),gold=mat(0xffd21f,{r:0.2,m:0.6,e:0.25});
  const body=new THREE.Group(); g.add(body);
  body.add(M(G.box,white,[0.55,0.55,1.1],[0,0.95,0]));
  const neck=M(G.box,white,[0.32,0.62,0.32],[0,1.35,-0.48]); neck.rotation.x=-0.45; body.add(neck);
  const head=new THREE.Group(); head.position.set(0,1.68,-0.72); body.add(head);
  head.add(M(G.box,white,[0.34,0.32,0.55],[0,0,-0.12])); head.add(M(G.box,hoof,[0.3,0.2,0.12],[0,-0.06,-0.42]));
  const horn=M(G.cone,gold,[0.07,0.42,0.07],[0,0.32,-0.12]); horn.rotation.x=-0.35; head.add(horn);
  [-1,1].forEach(sd=>{ head.add(M(G.cone4,white,[0.06,0.14,0.06],[sd*0.12,0.22,0.06])); head.add(M(G.sph,mat(0x1a1a2e,{r:0.2}),[0.045,0.05,0.045],[sd*0.17,0.04,-0.2],false)); });
  for(let i=0;i<6;i++){ const m=M(G.box,rbMats[i],[0.1,0.12,0.16],[0,1.65-i*0.1,-0.42+i*0.07],false); body.add(m); }
  const tail=new THREE.Group(); tail.position.set(0,1.1,0.55); body.add(tail);
  for(let i=0;i<6;i++) tail.add(M(G.box,rbMats[i],[0.09,0.09,0.1],[0,-i*0.1,i*0.06],false));
  const legs=[]; [[-0.18,-0.38],[0.18,-0.38],[-0.18,0.38],[0.18,0.38]].forEach(q=>{ const l=new THREE.Group(); l.position.set(q[0],0.7,q[1]); l.add(M(G.box,white,[0.13,0.55,0.13],[0,-0.27,0])); l.add(M(G.box,hoof,[0.15,0.1,0.15],[0,-0.56,0])); g.add(l); legs.push(l); });
  g.scale.setScalar(0.85);
  g.userData={body,head,legs,tail,horn};
  return g;
}
function addUnicorn(){
  if(unicorns.length>=2) return;
  const g=buildUnicorn(),side=unicorns.length?-unicorns[0].side:(Math.random()<0.5?-1:1);
  g.position.set(side*(HALF+1.1),0,-2); scene.add(g);
  unicorns.push({g,side,cd:unicorns.length?6:3,rear:0,phase:rand(0,6)});
  fxSparkle(g.position.x,1.5,g.position.z,pick(RAINBOW)); sfx.whinny();
}
function fireRainbow(u){
  let best=laneOf(S.x),bs=-1;
  for(let l=0;l<LANES;l++){ let n=0; for(const e of enemies) if(!e.dead&&e.lane===l&&e.g.position.z>-25&&e.g.position.z<0) n++; const sc=n+(l===laneOf(S.x)?1.5:0); if(sc>bs){ bs=sc; best=l; } }
  const g=new THREE.Group(),w=(LANE_W-0.5)/6;
  for(let i=0;i<6;i++){ const st=M(G.strip,rbMats[i],[w,0.06,1],[LANE_X[best]-(LANE_W-0.5)/2+w*(i+0.5),0.05,0],false); st.receiveShadow=true; g.add(st); }
  g.position.z=4; scene.add(g);
  roads.push({g,lane:best,t:6,len:0});
  u.rear=0.6; sfx.whinny();
  const hp=u.g.position; for(let i=0;i<10;i++) blobs.spawn(hp.x,2,hp.z-0.6,rand(-2,2),rand(1,3),rand(-3,-1),0.6,0.2,0.05,WHITE,pick(RAINBOW),pick(RAINBOW),-1,1,false,0);
}
function updateUnicorns(dt){
  const playing=mode==='playing';
  unicorns.forEach((u,i)=>{
    const g=u.g,ud=g.userData,t=time*10+u.phase;
    g.position.x+=((u.side*(HALF+0.6))-g.position.x)*(1-Math.exp(-dt*4)); g.position.z+=((0.6+i*1.4)-g.position.z)*(1-Math.exp(-dt*3));
    const gal=Math.sin(t); ud.legs[0].rotation.x=gal*0.8; ud.legs[3].rotation.x=gal*0.8; ud.legs[1].rotation.x=-gal*0.8; ud.legs[2].rotation.x=-gal*0.8;
    g.position.y=Math.abs(Math.sin(t))*0.18; ud.tail.rotation.x=0.4+Math.sin(t*0.7)*0.3;
    if(u.rear>0){ u.rear-=dt; ud.body.rotation.x=0.6*Math.sin(Math.PI*clamp(u.rear/0.6,0,1)); ud.horn.material=ud.horn.material; } else ud.body.rotation.x=0;
    if(Math.random()<dt*4) blobs.spawn(g.position.x+rand(-0.3,0.3),0.3,g.position.z+0.6,0,rand(0.3,0.8),rand(0.5,1.5),0.4,0.1,0.02,WHITE,pick(RAINBOW),pick(RAINBOW),0,1,false,0);
    if(playing){ u.cd-=dt; if(u.cd<=0){ u.cd=12; fireRainbow(u); } }
  });
  for(let i=roads.length-1;i>=0;i--){
    const r=roads[i]; r.t-=dt; r.len=Math.min(29,r.len+dt*90);
    r.g.scale.z=r.len; r.g.position.z=4-r.len/2;
    r.g.visible=r.t>1||Math.floor(r.t*12)%2===0;
    if(Math.random()<dt*12){ const z=4-rand(0,r.len); blobs.spawn(LANE_X[r.lane]+rand(-1.6,1.6),0.15,z,0,rand(0.5,1.5),0,0.5,0.14,0.03,WHITE,pick(RAINBOW),pick(RAINBOW),-1,1,false,0); }
    if(playing){
      for(const e of enemies) if(!e.dead&&e.lane===r.lane&&e.g.position.z>4-r.len) e.slow=Math.max(e.slow,0.3);
      for(const m of squad){ const p=m.g.position; if(laneOf(p.x)===r.lane&&p.z<4&&p.z>4-r.len){ if(!(m.safeT>0)) sfx.chime(); m.safeT=1.5; } }
    }
    if(r.t<=0){ scene.remove(r.g); roads.splice(i,1); }
  }
  if(playing) for(const m of squad) if(m.safeT>0&&Math.random()<dt*10){ const p=m.g.position; blobs.spawn(p.x+rand(-0.35,0.35),rand(0.4,1.8),p.z,rand(-0.5,0.5),rand(0.5,1.5),rand(-0.5,0.5),0.4,0.14,0.03,WHITE,pick(RAINBOW),pick(RAINBOW),-1,1,false,0); }
  updateWildUnicorn(dt);
}
// Wild unicorn: gallops across the road and leaves a glittering star; shoot or touch it to win a unicorn.
const wildUni={active:false,g:null,dir:1};
const uniStar=(function(){ const g=new THREE.Group(),sm=mat(0xffe066,{e:1.2,r:0.2}); for(let i=0;i<5;i++){ const c=M(G.cone4,sm,[0.16,0.55,0.12],[0,0,0],false); c.rotation.z=i/5*Math.PI*2; c.position.set(Math.sin(i/5*Math.PI*2)*0.25,Math.cos(i/5*Math.PI*2)*0.25,0); g.add(c); } g.add(M(G.sph,sm,[0.22,0.22,0.12],[0,0,0],false)); g.visible=false; scene.add(g); return {g,active:false}; })();
function startWildUnicorn(){
  if(!wildUni.g) wildUni.g=buildUnicorn();
  wildUni.active=true; wildUni.dir=Math.random()<0.5?1:-1; wildUni.dropped=false;
  wildUni.g.position.set(-wildUni.dir*(HALF+4),0,-22); wildUni.g.rotation.y=wildUni.dir*Math.PI/2; scene.add(wildUni.g);
  toast('En vild enhörning!'); sfx.whinny();
}
function updateWildUnicorn(dt){
  if(wildUni.active){
    const g=wildUni.g,ud=g.userData,t=time*12; g.position.x+=wildUni.dir*9*dt; g.position.y=Math.abs(Math.sin(t))*0.25;
    const gal=Math.sin(t); ud.legs[0].rotation.x=gal; ud.legs[3].rotation.x=gal; ud.legs[1].rotation.x=-gal; ud.legs[2].rotation.x=-gal;
    if(Math.random()<dt*12) blobs.spawn(g.position.x,0.4,g.position.z,0,rand(0.5,1.5),0,0.6,0.16,0.03,WHITE,pick(RAINBOW),pick(RAINBOW),-1,1,false,0);
    if(!wildUni.dropped&&Math.abs(g.position.x)<1){ wildUni.dropped=true; uniStar.active=true; uniStar.g.visible=true; uniStar.g.position.set(g.position.x,1.1,g.position.z); }
    if(Math.abs(g.position.x)>HALF+5){ wildUni.active=false; scene.remove(g); }
  }
  if(uniStar.active){
    const sg=uniStar.g; sg.position.z+=scroll*dt; sg.rotation.y+=dt*3; sg.position.y=1.1+0.2*Math.sin(time*4);
    if(Math.random()<dt*10) blobs.spawn(sg.position.x,sg.position.y,sg.position.z,rand(-1,1),rand(0.5,1.5),rand(-1,1),0.5,0.12,0.03,WHITE,pick(RAINBOW),pick(RAINBOW),-1,1,false,0);
    if(mode==='playing') for(const m of squad){ const p=m.g.position; if(Math.abs(p.x-sg.position.x)<0.9&&Math.abs(p.z-sg.position.z)<0.9){ collectStar(); break; } }
    if(sg.position.z>5){ uniStar.active=false; sg.visible=false; }
  }
}
function collectStar(){ if(!uniStar.active) return; uniStar.active=false; uniStar.g.visible=false; fxSparkle(uniStar.g.position.x,1.2,uniStar.g.position.z,RAINBOW[2]); if(unicorns.length<2) addUnicorn(); toast('Enhörningen ansluter!'); }
function clearUnicorns(){ unicorns.forEach(u=>scene.remove(u.g)); unicorns=[]; roads.forEach(r=>scene.remove(r.g)); roads=[]; if(wildUni.g) scene.remove(wildUni.g); wildUni.active=false; uniStar.active=false; uniStar.g.visible=false; }

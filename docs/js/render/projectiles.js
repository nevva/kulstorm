'use strict';
// ---------- instanced projectiles
class InstPool{
  constructor(geo,max,unlit){
    const m=new THREE.MeshBasicMaterial({color:0xffffff});
    this.mesh=new THREE.InstancedMesh(geo,m,max); this.mesh.frustumCulled=false; this.mesh.castShadow=!unlit;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for(let i=0;i<max;i++){ this.mesh.setMatrixAt(i,ZERO); this.mesh.setColorAt(i,WHITE); }
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this.free=[]; this.alive=[]; this.d=[];
    for(let i=max-1;i>=0;i--) this.free.push(i);
    for(let i=0;i<max;i++) this.d.push({x:0,y:0,z:0,vx:0,vz:0,dmg:0,base:1,pierce:0,size:1,col:WHITE,rocket:false,aoe:0,bounce:false,hits:null,trail:0,crit:false,gen:0,owner:null,wid:''});
    scene.add(this.mesh);
  }
  take(){ const i=this.free.pop(); if(i===undefined) return -1; this.alive.push(i); return i; }
  kill(i){ this.free.push(i); this.mesh.setMatrixAt(i,ZERO); }
  write(i,sx,sy,sz,ry,col){
    const d=this.d[i];
    tmpQ.setFromEuler(tmpE.set(0,ry||0,0));
    tmpM.compose(tmpV.set(d.x,d.y,d.z),tmpQ,tmpS.set(sx,sy,sz));
    this.mesh.setMatrixAt(i,tmpM); this.mesh.setColorAt(i,col||d.col);
  }
  flush(){ this.mesh.instanceMatrix.needsUpdate=true; this.mesh.instanceColor.needsUpdate=true; }
  clear(){ for(const i of this.alive) this.kill(i); this.alive.length=0; this.flush(); }
}
const bullets=new InstPool(G.bullet,420,false);
// Fog tracers: bullets turn into long glowing streaks that ignore the fog, and a few lights ride along with them to light up
// enemies and props. The lights are always in the scene (dark outside fog) so the light count never changes.
const TRACER=C(0xffb24a),tracerLights=[];
for(let i=0;i<3;i++){ const l=new THREE.PointLight(0xffb24a,0,9,2); scene.add(l); tracerLights.push(l); }
let tracerK=0;
function updateTracers(dt){
  const want=isW('fog')&&mode==='playing'?W.mix:0;
  tracerK+=(want-tracerK)*(1-Math.exp(-dt*2));
  const fogOn=tracerK<0.5; if(bullets.mesh.material.fog!==fogOn){ bullets.mesh.material.fog=fogOn; bullets.mesh.material.needsUpdate=true; }
  const al=bullets.alive,n=al.length;
  tracerLights.forEach((l,k)=>{
    if(tracerK<0.02||!n){ l.intensity=0; return; }
    const d=bullets.d[al[Math.floor((k+0.5)*n/tracerLights.length)]];
    if(!d){ l.intensity=0; return; }
    l.position.set(d.x,d.y+0.3-curveDrop(d.x,d.z),d.z); l.intensity=2.2*tracerK*(n<tracerLights.length&&k>=n?0:1);
  });
}
const starGeo=(function(){ const sh=new THREE.Shape(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2,r=i%2?0.11:0.32; const x=Math.cos(a)*r,y=Math.sin(a)*r; if(i===0) sh.moveTo(x,y); else sh.lineTo(x,y); } sh.closePath(); const g=new THREE.ExtrudeGeometry(sh,{depth:0.05,bevelEnabled:false}); g.translate(0,0,-0.025); g.rotateX(Math.PI/2); return g; })();
const starMesh=new THREE.InstancedMesh(starGeo,new THREE.MeshStandardMaterial({color:C(0xcfd8dc),metalness:0.8,roughness:0.25,flatShading:true}),420);
starMesh.frustumCulled=false; starMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); for(let i=0;i<420;i++) starMesh.setMatrixAt(i,ZERO); scene.add(starMesh);
function clearStars(){ for(let i=0;i<420;i++) starMesh.setMatrixAt(i,ZERO); starMesh.instanceMatrix.needsUpdate=true; }
const ebullets=new InstPool(G.ebullet,160,true);
const EB_COL=C(0xff1744);

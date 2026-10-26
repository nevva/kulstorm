'use strict';
// ---------- sky: gradient dome, sun, moon with phases, stars, Milky Way, shooting stars, aurora (custom shaders so the planet curve leaves them alone)
const skyGroup=new THREE.Group(); scene.add(skyGroup);
const skyU={top:{value:C(0x4a90d9)},hor:{value:C(0xbfe3ff)},bot:{value:C(0x3a4a60)},sunDir:{value:new THREE.Vector3(0,0.1,-1)},sunCol:{value:C(0xfff0c0)},sunGlow:{value:1},moonDir:{value:new THREE.Vector3(0,0.1,-1)},moonGlow:{value:0},milky:{value:0},milkyN:{value:new THREE.Vector3(0.62,0.32,0.72).normalize()},time:{value:0}};
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(150,40,24),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,
  vertexShader:'varying vec3 vDir; void main(){ vDir=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:[
    'uniform vec3 top,hor,bot,sunDir,sunCol,moonDir,milkyN; uniform float sunGlow,moonGlow,milky,time; varying vec3 vDir;',
    'float hash(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }',
    'void main(){',
    '  vec3 d=normalize(vDir); float h=d.y;',
    '  vec3 c=mix(hor,top,smoothstep(-0.05,0.06,h));',
    '  c=mix(c,bot,smoothstep(-0.05,-0.35,h));',
    '  float s=max(dot(d,sunDir),0.0);',
    '  c+=sunCol*(pow(s,18.0)*0.13+pow(s,110.0)*0.6)*sunGlow;',
    '  float hz=exp(-pow((h+0.04)/0.07,2.0));',
    '  c+=sunCol*hz*pow(max(dot(normalize(vec3(d.x,0.0,d.z)),normalize(vec3(sunDir.x,0.0,sunDir.z))),0.0),3.0)*0.35*sunGlow;',
    '  float m=max(dot(d,moonDir),0.0);',
    '  c+=vec3(0.55,0.65,1.0)*(pow(m,70.0)*0.1+pow(m,16.0)*0.008)*moonGlow;',
    '  float band=exp(-pow(dot(d,milkyN)/0.13,2.0));',
    '  float dust=hash(floor(d*260.0))*0.6+hash(floor(d*60.0))*0.4;',
    '  float core=exp(-pow(dot(d,milkyN)/0.04,2.0));',
    '  c+=(vec3(0.32,0.30,0.55)*band*(0.35+0.55*dust)+vec3(0.55,0.42,0.6)*core*0.35*dust)*milky*smoothstep(-0.08,0.06,h);',
    '  gl_FragColor=linearToOutputTexel(vec4(c,1.0));',
    '}'].join('\n')}));
skyDome.renderOrder=-10; skyDome.frustumCulled=false; skyGroup.add(skyDome);
scene.background=null;

function skyShader(frag,uniforms,extra){
  return new THREE.ShaderMaterial(Object.assign({uniforms,
    vertexShader:'varying vec3 vN; varying vec3 vP; varying vec2 vUv; void main(){ vN=normal; vP=position; vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:frag},extra||{}));
}
const sunU={col:{value:C(0xfff2c4)}};
const sunMesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),skyShader('uniform vec3 col; varying vec3 vN; void main(){ float r=dot(normalize(vN),vec3(0.0,0.0,1.0)); gl_FragColor=linearToOutputTexel(vec4(col*(1.15+0.25*r),1.0)); }',sunU,{depthWrite:false}));
sunMesh.renderOrder=-9; sunMesh.scale.setScalar(5); skyGroup.add(sunMesh);
const moonU={phase:{value:0.5}};
const moonMesh=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),skyShader([
  'uniform float phase; varying vec3 vN; varying vec3 vP;',
  'float hash(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453); }',
  'void main(){',
  '  vec3 n=normalize(vN);',
  '  vec3 L=vec3(sin(6.2831853*phase),0.08,-cos(6.2831853*phase));',
  '  float lit=smoothstep(-0.03,0.14,dot(n,normalize(L)));',
  '  float mare=smoothstep(0.55,0.75,hash(floor(vP*2.2+3.0)))*0.5+smoothstep(0.7,0.9,hash(floor(vP*5.0)))*0.35;',
  '  vec3 base=mix(vec3(1.0,0.97,0.88),vec3(0.62,0.62,0.66),mare);',
  '  vec3 darkSide=vec3(0.02,0.025,0.05)+base*0.035;',
  '  gl_FragColor=linearToOutputTexel(vec4(mix(darkSide,base*1.25,lit),1.0));',
  '}'].join('\n'),moonU,{depthWrite:false}));
moonMesh.renderOrder=-9; moonMesh.scale.setScalar(4.2); skyGroup.add(moonMesh);

// Stars: denser near the horizon (the part of the sky the camera sees) and along the Milky Way band.
const starU={night:{value:0},time:{value:0},px:{value:Math.min(window.devicePixelRatio||1,1.75)}};
(function makeStars(){
  const N=2600,pos=[],col=[],siz=[],ph=[],v=new THREE.Vector3(),n=skyU.milkyN.value,tmp=new THREE.Vector3();
  for(let i=0;i<N;i++){
    if(i<1700){ const y=-0.1+Math.pow(Math.random(),1.8)*0.6,a=rand(0,Math.PI*2),r=Math.sqrt(1-y*y); v.set(Math.cos(a)*r,y,Math.sin(a)*r); }
    else { v.set(rand(-1,1),rand(-1,1),rand(-1,1)); tmp.copy(n).multiplyScalar(v.dot(n)); v.sub(tmp).normalize(); v.addScaledVector(n,rand(-0.09,0.09)).normalize(); if(v.y<-0.1) { i--; continue; } }
    pos.push(v.x*140,v.y*140,v.z*140);
    const t=Math.random(); const c=t<0.15?[0.7,0.8,1.0]:t<0.3?[1.0,0.85,0.7]:[1,1,1]; const b=rand(0.55,1);
    col.push(c[0]*b,c[1]*b,c[2]*b);
    siz.push(Math.random()<0.04?rand(3.2,4.6):rand(1.1,2.4)); ph.push(rand(0,6.3));
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('scol',new THREE.Float32BufferAttribute(col,3));
  g.setAttribute('ssize',new THREE.Float32BufferAttribute(siz,1));
  g.setAttribute('sph',new THREE.Float32BufferAttribute(ph,1));
  const m=new THREE.ShaderMaterial({uniforms:starU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'attribute vec3 scol; attribute float ssize; attribute float sph; uniform float time,px; varying vec3 vC; varying float vT; void main(){ vC=scol; vT=0.65+0.35*sin(time*(1.5+sph*0.6)+sph*7.0); gl_PointSize=ssize*px*(0.8+0.3*vT); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform float night; varying vec3 vC; varying float vT; void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5) discard; float a=smoothstep(0.5,0.0,d); a=a*a; gl_FragColor=vec4(vC*a*vT*night,1.0); }'});
  const pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.renderOrder=-8; skyGroup.add(pts);
})();
// Shooting stars: a few solid streaks that cross the night sky now and then.
const shootU={a:{value:0}};
const shootMat=skyShader('uniform float a; varying vec2 vUv; void main(){ gl_FragColor=vec4(vec3(1.0,0.97,0.9)*a,1.0); }',shootU,{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const shootMesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),shootMat); shootMesh.visible=false; shootMesh.renderOrder=-7; skyGroup.add(shootMesh);
const shoot={t:0,from:new THREE.Vector3(),to:new THREE.Vector3(),cd:5};
// Aurora: waving additive ribbons low over the horizon, strongest in the ice zone.
const auroraU={time:{value:0},a:{value:0}};
const auroraMat=new THREE.ShaderMaterial({uniforms:auroraU,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
  vertexShader:'uniform float time; varying vec2 vUv; void main(){ vUv=uv; vec3 p=position; p.z+=sin(p.x*0.06+time*0.5)*7.0+sin(p.x*0.17-time*0.8)*2.5; p.y+=sin(p.x*0.09+time*0.3)*2.0; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }',
  fragmentShader:'uniform float time,a; varying vec2 vUv; void main(){ float rays=0.55+0.45*sin(vUv.x*70.0+time*1.6+sin(vUv.x*13.0+time)*2.0); float f=smoothstep(0.0,0.12,vUv.y)*pow(1.0-vUv.y,1.6)*rays; vec3 c=mix(vec3(0.15,1.0,0.55),vec3(0.65,0.3,1.0),smoothstep(0.35,0.95,vUv.y)); gl_FragColor=vec4(c*f*a,1.0); }'});
const auroras=[];
for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.PlaneGeometry(150,20,80,1),auroraMat); r.position.set(rand(-20,20),10+i*3.5,-118+i*6); r.renderOrder=-7; r.frustumCulled=false; skyGroup.add(r); auroras.push(r); }
const sunDirV=new THREE.Vector3(),moonDirV=new THREE.Vector3();
function arcDir(v,s){ const a=s*Math.PI; v.set(-Math.cos(a)*0.8,Math.sin(a)*0.22-0.085,-1).normalize(); }

// Glossy toy look: a tiny lit "room" baked into an environment map so plastic surfaces get real reflections.
(function makeEnv(){
  const pm=new THREE.PMREMGenerator(renderer);
  const s=new THREE.Scene();
  const room=new THREE.Mesh(G.box,new THREE.MeshBasicMaterial({color:C(0x7fa2d8),side:THREE.BackSide})); room.scale.set(24,24,24); s.add(room);
  const lm=new THREE.MeshBasicMaterial({color:0xffffff});
  const top=new THREE.Mesh(G.box,lm); top.scale.set(8,0.2,8); top.position.set(0,11,0); s.add(top);
  const l2=new THREE.Mesh(G.box,lm); l2.scale.set(0.2,5,9); l2.position.set(-11,3,0); s.add(l2);
  const l3=new THREE.Mesh(G.box,new THREE.MeshBasicMaterial({color:C(0xffe9b0)})); l3.scale.set(0.2,5,9); l3.position.set(11,3,0); s.add(l3);
  const fl=new THREE.Mesh(G.box,new THREE.MeshBasicMaterial({color:C(0x3a4a70)})); fl.scale.set(24,0.2,24); fl.position.set(0,-11,0); s.add(fl);
  scene.environment=pm.fromScene(s,0.04).texture;
  pm.dispose();
})();

function resize(){
  const w=window.innerWidth,h=window.innerHeight;
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  const portrait=h>w*1.05;
  camera.fov=portrait?72:55;
  CAM0.y=portrait?13.5:10.5; CAM0.z=portrait?15.5:13.5; CAM0.look=portrait?-16:-14;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize); resize();

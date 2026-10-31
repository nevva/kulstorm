'use strict';
// ---------- materials and shared geometry
const matCache=new Map();
function mat(hex,o){
  o=o||{};
  // o.s: smooth shading, for the rounded characters
  const r=o.r!==undefined?o.r:0.35,m=o.m||0,e=o.e||0;
  const key=hex+'/'+r+'/'+m+'/'+e+(o.s?'/s':'');
  let mm=matCache.get(key);
  if(!mm){
    mm=new THREE.MeshStandardMaterial({color:C(hex),roughness:r,metalness:m,flatShading:!o.s,emissive:e?C(hex):new THREE.Color(0),emissiveIntensity:e||1});
    matCache.set(key,mm);
  }
  return mm;
}
function matV(hex,o){ o=o||{}; return new THREE.MeshStandardMaterial({color:CV(hex,0.04,0.08),roughness:o.r!==undefined?o.r:0.32,metalness:o.m||0,flatShading:true,emissive:new THREE.Color(0),emissiveIntensity:1}); }
const PAL={};
function pal(hex,o){
  o=o||{};
  const k=hex+'|'+(o.r===undefined?'':o.r)+'|'+(o.e||0);
  if(!PAL[k]){
    PAL[k]=[];
    for(let i=0;i<5;i++) PAL[k].push(new THREE.MeshStandardMaterial({color:CV(hex,0.03,0.08),roughness:o.r!==undefined?o.r:0.4,metalness:0,flatShading:true,emissive:o.e?CV(hex,0.02,0.05):new THREE.Color(0),emissiveIntensity:o.e||1}));
  }
  return pick(PAL[k]);
}
function M(geo,material,s,p,shadow){
  const mesh=new THREE.Mesh(geo,material);
  if(s) mesh.scale.set(s[0],s[1],s[2]);
  if(p) mesh.position.set(p[0],p[1],p[2]);
  mesh.castShadow=shadow!==false;
  mesh.receiveShadow=false;
  return mesh;
}
// A unit box with rounded edges and corners (radius r), with normals pointing out of the rounding so it shades smoothly.
function roundedBox(r,seg){
  const g=new THREE.BoxGeometry(1,1,1,seg,seg,seg),p=g.attributes.position,n=g.attributes.normal,v=new THREE.Vector3(),c=new THREE.Vector3(),k=0.5-r;
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); c.set(Math.max(-k,Math.min(k,v.x)),Math.max(-k,Math.min(k,v.y)),Math.max(-k,Math.min(k,v.z))); v.sub(c).normalize(); n.setXYZ(i,v.x,v.y,v.z); v.multiplyScalar(r).add(c); p.setXYZ(i,v.x,v.y,v.z); }
  return g;
}
const G={
  box:new THREE.BoxGeometry(1,1,1),
  sph:new THREE.SphereGeometry(1,10,8),
  // smoother pieces for the characters
  rsph:new THREE.SphereGeometry(1,16,12),
  rcyl:new THREE.CylinderGeometry(1,1,1,16),
  rbox:roundedBox(0.22,3),
  ico:new THREE.IcosahedronGeometry(1,1),
  ico0:new THREE.IcosahedronGeometry(1,0),
  dod:new THREE.DodecahedronGeometry(1,0),
  tet:new THREE.TetrahedronGeometry(1,0),
  cone:new THREE.ConeGeometry(1,1,8),
  cone4:new THREE.ConeGeometry(1,1,4),
  cyl:new THREE.CylinderGeometry(1,1,1,10),
  coin:new THREE.CylinderGeometry(1,1,1,12),
  ring:new THREE.TorusGeometry(1,0.16,8,18),
  bullet:new THREE.SphereGeometry(0.17,8,6),
  ebullet:new THREE.SphereGeometry(0.22,8,6),
  part:new THREE.IcosahedronGeometry(0.5,1),
  chunk:new THREE.BoxGeometry(1,1,1),
  plane:new THREE.PlaneGeometry(1,1),
  // Subdivided versions for long pieces so the planet curve bends them smoothly.
  slab:new THREE.BoxGeometry(1,1,1,24,1,60),
  tile:new THREE.BoxGeometry(1,1,1,4,1,5),
  beam:new THREE.BoxGeometry(1,1,1,1,1,44),
  strip:new THREE.BoxGeometry(1,1,1,1,1,12),
};

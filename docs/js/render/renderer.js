'use strict';
// ---------- renderer, scene, lights
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
const cur={sky:RAW(0x8ecbff),fog:RAW(0xbfe3ff)};
scene.background=cur.sky;
scene.fog=new THREE.Fog(cur.fog,44,96);

// View: Eagle Eye pushes the fog, the camera and the spawn line out so enemies can be engaged far earlier.
const VIEW={scale:1,fogNear:44,fogFar:96,spawn:-78};
const camera=new THREE.PerspectiveCamera(55,1,0.1,180);
const CAM0={y:10.5,z:13.5,look:-14};
let camK=0.78;
const hemi=new THREE.HemisphereLight(C(0xbfe3ff),C(0x6b7a8a),0.8); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,1.05);
sun.position.set(7,15,7); sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
const sc=sun.shadow.camera; sc.left=-20; sc.right=20; sc.top=16; sc.bottom=-56; sc.near=1; sc.far=90;
sc.updateProjectionMatrix();
sun.shadow.bias=-0.0012;
scene.add(sun); sun.target.position.set(0,0,-12); scene.add(sun.target);
const fill=new THREE.DirectionalLight(0xffffff,0.35); fill.position.set(-9,6,14); scene.add(fill);
// Night headlamp: always in the scene (so light count never changes and nothing recompiles), dark unless it is night.
const spot=new THREE.SpotLight(0xfff0c8,0,48,0.55,0.6,1); spot.position.set(0,4,2); scene.add(spot); spot.target.position.set(0,0,-22); scene.add(spot.target);

// Little planet: every vertex is pushed down by its squared distance from the squad, so the road curves away over a horizon.
// Shadow depth passes (DEPTH_PACKING) stay flat, and receivers look up shadows from their flat world position, so shadows stay consistent.
const CURVE_K=0.0016,CURVE_LAT=1.3;
const PROJ_ORIG=THREE.ShaderChunk.project_vertex;
const PROJ_CURVED=[
  'vec4 mvPosition = vec4( transformed, 1.0 );',
  '#ifdef USE_INSTANCING',
  '  mvPosition = instanceMatrix * mvPosition;',
  '#endif',
  '#ifndef DEPTH_PACKING',
  '  { vec4 cw = modelMatrix * mvPosition; cw.y -= '+CURVE_K.toFixed(4)+' * ( cw.z * cw.z + '+CURVE_LAT.toFixed(2)+' * cw.x * cw.x ); mvPosition = viewMatrix * cw; }',
  '#else',
  '  mvPosition = modelViewMatrix * mvPosition;',
  '#endif',
  'gl_Position = projectionMatrix * mvPosition;'
].join('\n');
let curveOn=null;
THREE.Material.prototype.customProgramCacheKey=function(){ return this.onBeforeCompile.toString()+(curveOn?'|curve':'|flat'); };
function markAllMaterials(){
  const seen=new Set();
  const visit=o=>{ if(o.material) [].concat(o.material).forEach(m=>{ if(!seen.has(m)){ seen.add(m); m.needsUpdate=true; } }); };
  scene.traverse(visit);
  for(const k in pools) pools[k].forEach(e=>e.g.traverse(visit));
  heartPool.forEach(g=>g.traverse(visit)); coinPool.forEach(g=>g.traverse(visit));
}
function applyCurve(){
  const on=!!OPT.planet; if(on===curveOn) return;
  const first=curveOn===null; curveOn=on;
  THREE.ShaderChunk.project_vertex=on?PROJ_CURVED:PROJ_ORIG;
  if(!first) markAllMaterials();
}
const curveDrop=(x,z)=>curveOn?CURVE_K*(z*z+CURVE_LAT*x*x):0;
// Night dims the glossy reflection map too: a near-zero AmbientLight carries the level (0–1 → 0–0.01) into every lit shader.
const envAmb=new THREE.AmbientLight(0xffffff,0.01); scene.add(envAmb);
THREE.ShaderChunk.lights_fragment_maps=THREE.ShaderChunk.lights_fragment_maps+'\n{ float envK=clamp(ambientLightColor.r*100.0,0.0,1.0); iblIrradiance*=envK;\n#if defined( RE_IndirectSpecular )\n radiance*=envK; clearcoatRadiance*=envK;\n#endif\n}';

// Weather definitions: tint mixes into sky/fog, light scales the lights, fogNear/fogFar cap the view.
const W={id:'clear',next:300,wind:0,fixed:null,hailT:3,boltT:5,fxT:0,mix:1};
const weatherDef=()=>WEATHER[W.id]||WEATHER.clear;
const isW=id=>W.id===id;

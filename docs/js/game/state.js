'use strict';
// ---------- game state
window.kulstormBusy=()=>mode!=='menu';
let mode='menu',time=0,dist=0,scroll=5,kills=0,best=0,coinsRun=0,labRun=false,spawnT=1.5,boss=null,bossNo=0,nextBossAt=600,nextUpgradeAt=50,upgradeStep=90,zoneDistNext=400,deadT=0,overShown=false,shakeAmt=0,camX=0;
const DIFF={hp:1,speed:1,spawn:1.2,dmg:1,crowd:1};
let S=null;
function freshState(){ return {x:0,targetX:0,A:null,T:{dmg:1,rate:1,speed:1,hpBonus:0,heartMult:1,coinMult:1,eagle:false,ricochet:false,gutter:false,kb:1,shockLv:0},perks:[],combos:new Set(),frontM:null,frontT:1,frontHold:0,flow:0,flowT:0,od:0,odT:0,odLock:0,odUsed:false}; }
S=freshState();
function updateDifficulty(){
  const d=dist/100;
  DIFF.hp=1+d*0.32+Math.pow(d,1.35)*0.03;
  DIFF.speed=1+Math.min(1.2,d*0.035);
  DIFF.spawn=Math.max(0.45,1.8*Math.pow(0.95,d));
  const extra=Math.max(0,squad.length-1);
  DIFF.dmg=(1+d*0.04)*(1+0.04*extra);
  DIFF.crowd=1+0.03*extra;
  scroll=8+Math.min(5,d*0.22);
}
const delayed=[];

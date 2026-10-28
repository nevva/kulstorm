'use strict';
// ---------- tutorial: each ability gets a card the first time it is useful, timed so that doing it right then works.
// The game freezes (the music keeps going) until the player does what the card asks; the action then lands at that moment.
// Seen cards are saved; "Show tutorial again" in the settings clears them. The texts live in js/data/tutorial.js.
const tutEl=$('tut');
let tutSeen=load('kulstorm_tut',{}),tutCur=null,tutNext=null,tutNextT=0,tutD0=0;
const tutOn=()=>!!tutCur;
const tutWants=id=>OPT.tutorial&&!tutSeen[id];
function tutShow(id){
  const c=TUTORIAL[id]; tutCur=id; tutSeen[id]=true; store('kulstorm_tut',tutSeen); tutNext=null;
  $('tut-title').textContent=c.title; $('tut-how').textContent=c.how; $('tut-text').textContent=c.text;
  $('tut-foot').textContent=c.do==='ok'?tl('Tap to continue'):tl('The game waits until you do it');
  keys.l=keys.r=false; if(c.do==='steer') S.targetX=S.x; tutEl.hidden=false; sfx.zone();
}
function tutHide(){
  if(!tutCur) return;
  const c=TUTORIAL[tutCur]; tutCur=null; tutEl.hidden=true;
  if(c.then){ tutNext=c.then; tutNextT=time; }
}
// Called when the player jumps, ducks or triggers OVERDRIVE.
function tutAct(kind){ if(tutCur&&(TUTORIAL[tutCur].do===kind||TUTORIAL[tutCur].do==='ok')) tutHide(); }
function tutStart(){ tutCur=null; tutNext=null; tutD0=dist; tutEl.hidden=true; }
const tutReset=()=>{ tutSeen={}; store('kulstorm_tut',tutSeen); };
// Every frame while playing, frozen or not: close a steer card once the player steers, otherwise look for the next card.
function tutCheck(){
  if(tutCur){ if(TUTORIAL[tutCur].do==='steer'&&(keys.l||keys.r||Math.abs(S.targetX-S.x)>0.6)) tutHide(); return; }
  if(!OPT.tutorial||!squad.length) return;
  const h=headMember(),hp=h.g.position,air=h.jy||0;
  // follow-up cards come at the top of the jump the previous card asked for
  if(tutNext){ if(air>1.1&&h.vy<1.5) return tutShow(tutNext); if(time-tutNextT>1.2) tutNext=null; return; }
  if(tutWants('steer')&&dist>tutD0+3) return tutShow('steer');
  if(OPT.obstacles&&air<=0){
    for(const o of obstacles){
      const dz=hp.z-o.z,sp=scroll+(o.roll?2.5:0);
      if(dz<0||hp.x<o.x0-0.25||hp.x>o.x1+0.25) continue;
      // close enough that a jump or duck right now clears it
      if(o.type==='low'&&tutWants('jump')&&dz<sp*0.3+0.3) return tutShow('jump');
      if(o.type==='high'&&tutWants('duck')&&dz<sp*0.3+0.3) return tutShow('duck');
      if(o.type==='tall'&&tutWants('tall')&&dz<sp*0.75) return tutShow('tall');
    }
    if(tutSeen.jump&&hasAbility('pound')&&tutWants('pound')&&dist>tutD0+40&&!obstacles.some(o=>o.z>hp.z-14&&o.z<hp.z+1)){
      for(const e of enemies){ if(e.dead||e.under||e.isBoss) continue; const q=e.g.position; if(q.z<hp.z&&Math.hypot(q.x-hp.x,q.z-hp.z)<POUND_R+1) return tutShow('pound'); }
    }
  }
  if(tutWants('chest')&&chests.some(c=>c.openT<0&&c.g.position.z>-22)) return tutShow('chest');
  if(tutWants('wall')&&walls.some(w=>!w.dead&&w.g.position.z>-22)) return tutShow('wall');
  if(hasAbility('overdrive')&&tutWants('od')&&S.od>=1&&!(S.odT>0)) return tutShow('od');
}
// Tapping the card does what it asks, so it can never get stuck.
tutEl.addEventListener('click',()=>{ if(!tutCur) return; const d=TUTORIAL[tutCur].do; if(d==='jump') squadJump(); else if(d==='duck') squadDuck(); else if(d==='od') triggerOD(); else tutHide(); });
$('tut-off').addEventListener('click',e=>{ e.stopPropagation(); OPT.tutorial=false; saveOpts(); tutCur=null; tutNext=null; tutEl.hidden=true; });
canvas.addEventListener('pointerdown',()=>{ if(tutCur&&TUTORIAL[tutCur].do==='ok') tutHide(); });
window.addEventListener('keydown',e=>{ if(tutCur&&mode==='playing'&&TUTORIAL[tutCur].do==='ok'&&e.key!=='Escape'&&e.key!=='p'&&e.key!=='P') tutHide(); });

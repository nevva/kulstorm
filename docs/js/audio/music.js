'use strict';
// ---------- generative lofi: a steady melancholic bed (chords, bass, soft drums, vinyl crackle).
// Every enemy you blow up drops a note into a short memory (a few seconds); the melody plays from that memory a beat or two later,
// so the tune keeps changing with what you are fighting. Bosses shift the key. Night, weather and zone colour the sound.
// The phase (menu, run, boss, danger, shop, paused, dead), the run's intensity tier and the zone pick progression, tempo and
// layers at each bar line; the numbers live in js/data/music.js.
const music=(function(){
  let busDrums=null,busMel=null,busChord=null,crackleG=null,bus=null;
  let ctx=null,out=null,lp=null,dly=null,send=null,white=null,started=false,timer=null,step=0,nextT=0,bar=0,key=0;
  let STEP=60/MUSIC.bpm.menu/2;
  let prog=MUSIC.zones.city.prog,scale=[],oct=0,phase='menu',tier=0;
  let mem=[],hits=[];
  const mtof=n=>440*Math.pow(2,(n-69)/12);
  function ensure(){
    ctx=sfx.ctx; if(!ctx||started) return; started=true;
    out=ctx.createGain(); out.gain.value=0.0001; out.connect(ctx.destination);
    lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2200; lp.Q.value=0.4; lp.connect(out);
    busDrums=ctx.createGain(); busMel=ctx.createGain(); busChord=ctx.createGain(); [busDrums,busMel,busChord].forEach(b=>b.connect(lp));
    dly=ctx.createDelay(2); dly.delayTime.value=STEP*3; const fb=ctx.createGain(); fb.gain.value=0.38; const dl=ctx.createBiquadFilter(); dl.type='lowpass'; dl.frequency.value=1600;
    send=ctx.createGain(); send.gain.value=0.3; send.connect(dly); dly.connect(dl); dl.connect(fb); fb.connect(dly); dl.connect(busMel);
    const n=ctx.sampleRate*2; white=ctx.createBuffer(1,n,ctx.sampleRate); const w=white.getChannelData(0); for(let i=0;i<n;i++) w[i]=Math.random()*2-1;
    const cb=ctx.createBuffer(1,n,ctx.sampleRate),cd=cb.getChannelData(0); for(let i=0;i<n;i++) cd[i]=(Math.random()<0.0015?(Math.random()*2-1)*0.8:0)+(Math.random()*2-1)*0.01;
    const cr=ctx.createBufferSource(); cr.buffer=cb; cr.loop=true; const cf=ctx.createBiquadFilter(); cf.type='bandpass'; cf.frequency.value=2800; cf.Q.value=0.7; const cg=ctx.createGain(); cg.gain.value=0.3; crackleG=cg;
    cr.connect(cf); cf.connect(cg); cg.connect(out); cr.start();
    nextT=ctx.currentTime+0.15; timer=setInterval(tick,40);
  }
  function env(g,t,a,peak,rel){ g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak),t+a); g.gain.exponentialRampToValueAtTime(0.0001,t+a+rel); }
  function osc(type,f,t,a,peak,rel,dest,det){ const o=ctx.createOscillator(),g=ctx.createGain(); o.type=type; o.frequency.value=f; if(det) o.detune.value=det; env(g,t,a,peak,rel); o.connect(g); g.connect(dest||bus||lp); o.start(t); o.stop(t+a+rel+0.05); }
  function noiseHit(t,type,freq,q,peak,rel){ const s=ctx.createBufferSource(); s.buffer=white; s.playbackRate.value=rand(0.9,1.1); const f=ctx.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=q; const g=ctx.createGain(); env(g,t,0.003,peak,rel); s.connect(f); f.connect(g); g.connect(busDrums); s.start(t,rand(0,1.5)); s.stop(t+rel+0.05); }
  function inst(){ const p=ZONES[zoneIdx].props; return p==='jungle'?'marimba':p==='neon'?'synth':p==='ice'?'glock':p==='desert'?'pluck':'ep'; }
  const octave=()=>oct;
  function scaleFrom(root,iv){ const s=[]; for(let n=52;n<=88;n++) if(iv.indexOf(((n-root)%12+12)%12)>=0) s.push(n); return s; }
  scale=scaleFrom(MUSIC.zones.city.root,MUSIC.zones.city.scale);
  function pickPhase(){
    const lead=squad.find(m=>m.def.id==='leader');
    phase=mode==='playing'?(boss?'boss':lead&&lead.hp<lead.maxHp*MUSIC.danger?'danger':'run'):mode;
    tier=clamp(Math.floor(dist/MUSIC.tierDist)+Math.floor((R.lvl-1)/MUSIC.tierLevels),0,MUSIC.bpm.run.length-1);
    const z=phase==='boss'?MUSIC.boss:(MUSIC.zones[ZONES[zoneIdx].props]||MUSIC.zones.city);
    prog=z.prog; scale=scaleFrom(z.root,z.scale); oct=z.oct||0;
    const bpm=phase==='boss'?MUSIC.boss.bpm:phase==='run'||phase==='danger'?MUSIC.bpm.run[tier]:(MUSIC.bpm[phase]||MUSIC.bpm.menu);
    STEP=60/bpm/2; dly.delayTime.setTargetAtTime(STEP*3,ctx.currentTime,0.5);
  }
  function keys(n,t,vel,rel,wet){
    bus=busMel; const f=mtof(n+key+octave()),i=inst();
    if(i==='marimba'){ osc('sine',f,t,0.004,0.2*vel,0.45); osc('sine',f*4,t,0.002,0.035*vel,0.1); }
    else if(i==='synth'){ osc('square',f,t,0.02,0.035*vel,rel*0.7); osc('sawtooth',f*0.5,t,0.03,0.025*vel,rel*0.6,null,8); }
    else if(i==='glock'){ osc('sine',f*2,t,0.002,0.1*vel,0.9); osc('sine',f*5.4,t,0.002,0.018*vel,0.25); }
    else if(i==='pluck'){ osc('triangle',f,t,0.003,0.15*vel,0.55); osc('sine',f*2,t,0.002,0.03*vel,0.2); }
    else { osc('sine',f,t,0.012,0.12*vel,rel); osc('triangle',f,t,0.01,0.04*vel,rel*0.6,null,-7); osc('sine',f*2,t,0.01,0.02*vel,rel*0.35); }
    if(wet) osc('sine',f,t,0.02,0.07*vel*wet,rel,send);
  }
  function chord(ch,t,vel){ bus=busChord; const len=STEP*8*0.98; ch.forEach((n,i)=>{ const f=mtof(n+key+octave()); osc('sine',f,t+i*0.012,0.06,0.045*vel,len); osc('triangle',f,t+i*0.012,0.08,0.012*vel,len*0.7,null,5); }); }
  function bass(n,t,len,vel){ bus=busChord; const f=mtof(n+key+octave()); osc('sine',f,t,0.02,0.2*vel,len); osc('triangle',f,t,0.02,0.03*vel,len*0.5); }
  function kick(t,v){ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(42,t+0.16); env(g,t,0.004,0.45*v,0.26); o.connect(g); g.connect(busDrums); o.start(t); o.stop(t+0.32); }
  function snare(t,v){ bus=busDrums; noiseHit(t,'bandpass',1700,0.8,0.16*v,0.16); osc('sine',190,t,0.002,0.06*v,0.08); }
  function hat(t,v){ noiseHit(t,'highpass',7500,0.7,0.04*v,0.035); }
  function bell(n,t,v){ bus=busMel; const f=mtof(n+key+octave()); osc('sine',f,t,0.002,0.09*v,1.1); osc('sine',f*2.76,t,0.002,0.03*v,0.4); osc('sine',f,t,0.01,0.05*v,1.3,send); }
  const pickChordTone=(ch,lo,hi)=>{ const c=[]; ch.forEach(n=>{ for(let o=-12;o<=24;o+=12){ const m=n+o; if(m>=lo&&m<=hi) c.push(m); } }); return c.length?pick(c):lo; };
  const scaleNear=(n,d)=>{ let i=scale.findIndex(x=>x>=n); if(i<0) i=scale.length-1; return scale[clamp(i+d,0,scale.length-1)]; };
  function playEvent(ev,t,ch){
    switch(ev.type){
      case 'runner': case 'wolf': { const n=pickChordTone(ch,62,74); keys(n,t,0.6,0.45); keys(scaleNear(n,1),t+STEP*0.5,0.45,0.4); break; }
      case 'swarm': case 'bats': { [0,1,2].forEach(i=>keys(pickChordTone(ch,69,84),t+i*STEP/3,0.35,0.35)); break; }
      case 'shooter': bell(pickChordTone(ch,72,84),t,0.8); break;
      case 'bomber': snare(t,0.6); snare(t+STEP/3,0.45); kick(t+STEP*2/3,0.7); break;
      case 'tank': bass(ch[0]-24,t,STEP*7,1.3); keys(pickChordTone(ch,55,64),t,0.5,1.4); break;
      case 'ghost': keys(pickChordTone(ch,69,81),t,0.55,2.6,1.4); break;
      case 'boss': key=clamp(key+pick([-3,2,5,-5,3]),-5,7); chord(prog[bar%prog.length],t,1.5); break;
      default: keys(pickChordTone(ch,55,67),t,0.75,1.1,0.4);
    }
  }
  function schedule(s,t0){
    if(s===0) pickPhase();
    const t=t0+(s%2?STEP*0.18:0),ch=prog[bar%prog.length],calm=!(phase==='run'||phase==='danger'||phase==='boss'),now=ctx.currentTime;
    hits=hits.filter(x=>now-x<5);
    const dens=Math.min(1,hits.length/10);
    if(s===0) chord(ch,t,0.9);
    if(s===5&&dens>0.5) chord(ch,t,0.35);
    if(s===0) bass(ch[0]-12,t,STEP*3,1);
    if(s===5&&dens>0.25) bass(ch[0]-12,t,STEP*2,0.7);
    if(phase==='boss'){
      // driving: a kick on every beat, 8th-note bass, hats throughout
      if(s%2===0) kick(t,1);
      if(s===2||s===6) snare(t,0.9);
      if(s===7) snare(t+STEP*0.5,0.4);
      hat(t,s%2?0.55:0.9);
      bass(ch[0]-12,t,STEP*0.8,0.55);
      if(S&&S.odT>0) hat(t+STEP*0.5,0.6);
    } else if(!calm){
      if(s===0||s===5) kick(t,1);
      if(s===2||s===6) snare(t,0.8);
      if(s%2===0||dens>0.2) hat(t,s%2?0.5:0.85);
      if(dens>0.7&&s===7) hat(t+STEP*0.5,0.4);
      if(S&&S.odT>0){ hat(t+STEP*0.5,0.6); if(s===2||s===6) kick(t,0.8); if(s===3||s===7) snare(t,0.5); }
      // intensity tiers add layers: an arpeggio, then offbeat hats and a ghost snare, then a syncopated kick
      if(tier>=1&&s%2===1) keys(pickChordTone(ch,64,79),t,0.25,0.3);
      if(tier>=2){ hat(t+STEP*0.5,0.3); if(s===7) snare(t,0.35); }
      if(tier>=3&&s===3) kick(t,0.7);
      // low health: a heartbeat, a second thump right after the beat
      if(phase==='danger'&&(s===0||s===4)) kick(t+STEP*0.35,0.6);
    } else {
      if(s%4===2) hat(t,0.35);
      if(phase==='shop'&&s%2===0) keys(pickChordTone(ch,67,84),t,0.3,0.6,0.6);  // soft music-box arpeggio while shopping
    }
    const ev=mem.find(e=>!e.used);
    if(ev&&!calm){ ev.used=true; playEvent(ev,t,ch); }
  }
  function tick(){
    if(!ctx) return;
    const now=ctx.currentTime;
    mem=mem.filter(e=>!e.used&&now-e.t<3.5);
    if(nextT<now-0.5) nextT=now+0.05;
    while(nextT<now+0.3){ schedule(step,nextT); step=(step+1)%8; if(step===0) bar++; nextT+=STEP; }
    const wet=(W.id==='rain'||W.id==='fog'||W.id==='snow'||W.id==='storm')?0.7:1;
    const dim=phase==='danger'?0.6:phase==='dead'?0.5:1;
    lp.frequency.setTargetAtTime(S&&S.odT>0?6500:Math.max(500,(1300+1500*DN.dayF+700*DN.twi)*wet*dim),now,S&&S.odT>0?0.15:1.2);
    send.gain.setTargetAtTime(0.22+0.3*DN.nightF,now,1.5);
    const on=OPT.music&&sfx.enabled;
    const v=on?0.55*VOL.music*(mode==='paused'||mode==='shop'?0.45:1)*(mode==='dead'?0.6:1):0.0001;
    out.gain.setTargetAtTime(Math.max(0.0001,v*VOL.master),now,0.15);
    busDrums.gain.setTargetAtTime(VOL.drums,now,0.05); busMel.gain.setTargetAtTime(VOL.melody,now,0.05); busChord.gain.setTargetAtTime(VOL.chords,now,0.05); crackleG.gain.setTargetAtTime(0.3*VOL.crackle,now,0.05);
  }
  const NOTE_MAP={shambler:'blob',crawler:'blob',bloater:'tank',knight:'shooter',splitter:'swarm',mole:'runner',necro:'ghost',charger:'tank'};
  function note(type){
    if(!ctx) return; type=NOTE_MAP[type]||type; const now=ctx.currentTime;
    hits.push(now);
    if(type==='boss'){ mem.unshift({type,t:now,used:false}); return; }
    if(mem.some(e=>!e.used&&e.type===type&&now-e.t<0.25)) return;
    mem.push({type,t:now,used:false}); if(mem.length>6) mem.shift();
  }
  function reset(){ key=0; mem=[]; hits=[]; }
  const state=()=>({phase,tier,bpm:Math.round(30/STEP)});  // for debugging
  return {ensure,note,reset,state};
})();
window.addEventListener('pointerdown',()=>{ sfx.init(); sfx.resume(); music.ensure(); });
window.addEventListener('keydown',()=>{ sfx.init(); sfx.resume(); music.ensure(); });

'use strict';
// ---------- audio (synth, no files)
const sfx=(function(){
  // Thumpy, physical sound kit: every sound is a pitch-dropping sine "thump", a short noise "click" and band-passed noise "body",
  // glued by a compressor and a short dark room reverb. Small random pitch/volume variation keeps repeats from sounding identical.
  let ctx=null,master=null,bus=null,rvb=null,enabled=true,noiseBuf=null;
  const last={};
  const gate=(k,ms)=>{ const now=performance.now(); if(now-(last[k]||0)<ms) return false; last[k]=now; return true; };
  const v=(x,a)=>x*rand(1-a,1+a);
  function init(){
    if(ctx) return;
    try{
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain(); master.gain.value=0.55*VOL.sfx*VOL.master;
      const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-16; comp.knee.value=8; comp.ratio.value=4; comp.attack.value=0.003; comp.release.value=0.18;
      bus=ctx.createGain(); bus.connect(comp); comp.connect(master); master.connect(ctx.destination);
      const n=ctx.sampleRate; noiseBuf=ctx.createBuffer(1,n,n); const d=noiseBuf.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
      const len=Math.floor(n*1.1),ir=ctx.createBuffer(2,len,n);
      for(let c=0;c<2;c++){ const ch=ir.getChannelData(c); let lp=0; for(let i=0;i<len;i++){ const x=Math.random()*2-1; lp+=(x-lp)*0.22; ch[i]=lp*Math.pow(1-i/len,2.6); } }
      const conv=ctx.createConvolver(); conv.buffer=ir; rvb=ctx.createGain(); rvb.gain.value=0.22; rvb.connect(conv); conv.connect(comp);
    }catch(e){ ctx=null; }
  }
  // iOS leaves the context 'interrupted' (not 'suspended') after an app switch, so resume from any non-running state.
  function resume(){ if(ctx&&ctx.state!=='running'&&ctx.state!=='closed'){ const p=ctx.resume(); if(p&&p.catch) p.catch(()=>{}); } }
  function suspend(){ if(ctx&&ctx.state==='running'){ const p=ctx.suspend(); if(p&&p.catch) p.catch(()=>{}); } }
  const ok=()=>ctx&&enabled;
  function out(g,wet){ g.connect(bus); if(wet) { const s=ctx.createGain(); s.gain.value=wet; g.connect(s); s.connect(rvb); } }
  // pitch-dropping sine: the felt low end
  function thump(t,f0,f1,dur,vol,wet){
    const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine';
    o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur*0.6);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.003); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); out(g,wet); o.start(t); o.stop(t+dur+0.03);
  }
  // filtered noise burst: click (highpass), body (bandpass) or crumble (lowpass sweep)
  function nz(t,dur,vol,type,f0,f1,q,wet,atk){
    const s=ctx.createBufferSource(); s.buffer=noiseBuf; s.playbackRate.value=rand(0.85,1.15);
    const f=ctx.createBiquadFilter(); f.type=type; f.frequency.setValueAtTime(f0,t); if(f1&&f1!==f0) f.frequency.exponentialRampToValueAtTime(f1,t+dur); f.Q.value=q||0.8;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(atk||0.002)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f); f.connect(g); out(g,wet); s.start(t,rand(0,0.5)); s.stop(t+dur+0.03);
  }
  // soft wooden mallet (marimba-ish): fundamental + a quick 4th partial
  function mallet(t,f,dur,vol,wet){
    const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.004); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='sine'; o2.frequency.value=f*3.9;
    g2.gain.setValueAtTime(0.0001,t); g2.gain.exponentialRampToValueAtTime(vol*0.35,t+0.002); g2.gain.exponentialRampToValueAtTime(0.0001,t+dur*0.25);
    o.connect(g); o2.connect(g2); out(g,wet); out(g2,wet); o.start(t); o2.start(t); o.stop(t+dur+0.03); o2.stop(t+dur+0.03);
  }
  function ring(t,f,dur,vol,wet){ const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.003); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); out(g,wet); o.start(t); o.stop(t+dur+0.03); }
  const T=()=>ctx.currentTime;
  return {
    init,resume,suspend,
    get ctx(){return ctx;},
    setVol(){ if(master) master.gain.value=0.55*VOL.sfx*VOL.master; },
    get enabled(){return enabled;}, set enabled(x){enabled=x;},
    shoot(w){
      if(!ok()) return; const t=T(),id=w.id;
      if(id==='shuriken'){ if(!gate('shot',60)) return; nz(t,0.12,0.16,'bandpass',2200,6500,2,0.08,0.01); thump(t,220,140,0.04,0.08); return; }
      if(id==='minigun'){ if(!gate('shot',45)) return; thump(t,v(150,0.08),70,0.05,v(0.2,0.1)); nz(t,0.008,0.1,'highpass',5000,5000,0.7); return; }
      if(id==='smg'){ if(!gate('shot',40)) return; thump(t,v(165,0.08),72,0.06,v(0.26,0.1)); nz(t,0.01,0.13,'highpass',4500,4500,0.7); nz(t,0.035,0.08,'bandpass',v(1300,0.1),900,1.2); return; }
      if(!gate('shot',35)) return;
      if(w.rocket){ nz(t,0.38,0.22,'bandpass',450,1900,1.4,0.15,0.04); thump(t,v(95,0.05),40,0.16,0.4); return; }
      if(id==='shotgun'){ thump(t,v(115,0.05),36,0.24,0.75,0.2); nz(t,0.02,0.3,'highpass',2600,2600,0.6); nz(t,0.2,0.4,'bandpass',v(750,0.08),300,0.8,0.25); nz(t,0.4,0.16,'lowpass',900,120,0.7,0.3); return; }
      thump(t,v(135,0.06),52,0.1,v(0.45,0.1),0.08); nz(t,0.012,0.18,'highpass',3600,3600,0.7); nz(t,0.05,0.14,'bandpass',v(950,0.1),600,1.1);
    },
    laser(){ if(!ok()||!gate('laser',140)) return; const t=T(); ring(t,v(92,0.02),0.16,0.07); ring(t,184,0.12,0.03); nz(t,0.1,0.02,'bandpass',2200,1800,4); },
    hit(){ if(!ok()||!gate('hit',38)) return; const t=T(); thump(t,v(300,0.12),150,0.04,v(0.14,0.15)); nz(t,0.028,0.07,'bandpass',v(1000,0.15),700,2.5); },
    crit(){ if(!ok()||!gate('crit',80)) return; const t=T(); thump(t,190,55,0.14,0.36,0.1); nz(t,0.012,0.14,'highpass',3200,3200,0.7); ring(t,v(1250,0.03),0.28,0.045,0.25); ring(t,v(1830,0.03),0.2,0.03,0.25); },
    coin(){ if(!ok()||!gate('coin',60)) return; const t=T(); mallet(t,v(1568,0.02),0.14,0.13,0.15); mallet(t+0.055,v(2093,0.02),0.16,0.1,0.15); },
    zap(){ if(!ok()) return; const t=T(); nz(t,0.06,0.3,'highpass',4500,4500,0.6); nz(t,0.12,0.18,'bandpass',3000,900,2,0.2); thump(t,200,60,0.12,0.3); },
    jump(){ if(!ok()) return; const t=T(); nz(t,0.2,0.13,'bandpass',380,1500,1.6,0,0.04); thump(t,95,62,0.09,0.18); },
    duck(){ if(!ok()) return; const t=T(); nz(t,0.17,0.11,'bandpass',1500,380,1.6,0,0.03); },
    level(){ if(!ok()) return; const t=T(); thump(t,110,50,0.25,0.4,0.2); [523,659,784,1046].forEach((f,i)=>mallet(t+i*0.07,f,0.45,0.16,0.3)); },
    buy(){ if(!ok()) return; const t=T(); thump(t,140,60,0.12,0.3); mallet(t,784,0.2,0.14,0.2); mallet(t+0.06,1175,0.25,0.12,0.2); },
    explode(size){
      if(!ok()||!gate('boom',30)) return; const t=T(),sz=clamp(size||1,0.5,2.2);
      thump(t,v(115,0.06),30,0.32*sz+0.12,Math.min(0.95,0.5+0.2*sz),0.25);
      nz(t,0.45*sz+0.1,0.42,'lowpass',v(2200,0.1),140,0.7,0.35);
      nz(t,0.02,0.2,'highpass',2500,2500,0.6);
      ring(t,v(46,0.05),0.6*sz,0.22);
    },
    hurt(){ if(!ok()) return; const t=T(); thump(t,125,48,0.2,0.65,0.1); nz(t,0.22,0.3,'lowpass',650,140,1.2); },
    pickup(){ if(!ok()) return; const t=T(); [659,880,1319].forEach((f,i)=>mallet(t+i*0.075,f,0.3,0.14,0.25)); },
    upgrade(){ if(!ok()) return; const t=T(); thump(t,120,45,0.3,0.5,0.25); [523,659,784,1046].forEach((f,i)=>mallet(t+i*0.085,f,0.5,0.17,0.3)); },
    combo(){ if(!ok()) return; const t=T(); thump(t,100,38,0.4,0.6,0.3); thump(t+0.18,100,38,0.3,0.45,0.3); [392,523,659,784,1046,1318].forEach((f,i)=>mallet(t+i*0.06,f,0.5,0.14,0.35)); },
    zone(){ if(!ok()) return; const t=T(); thump(t,92,44,0.45,0.42,0.3); nz(t,0.7,0.09,'lowpass',200,1300,0.8,0.3,0.45); },
    boss(){ if(!ok()) return; const t=T(); [0,0.28,0.5].forEach((d,i)=>thump(t+d,i===2?65:80,28,i===2?1.1:0.45,i===2?0.95:0.6,0.35)); nz(t+0.5,1.4,0.25,'lowpass',500,60,0.8,0.4,0.2); },
    shield(){ if(!ok()) return; const t=T(); thump(t,150,70,0.12,0.4); ring(t,220,0.9,0.18,0.35); ring(t,607,0.6,0.08,0.35); ring(t,1188,0.35,0.04,0.35); },
    whinny(){ if(!ok()) return; const t=T();
      const o=ctx.createOscillator(),g=ctx.createGain(),b=ctx.createBiquadFilter(),vib=ctx.createOscillator(),vg=ctx.createGain();
      o.type='sawtooth'; o.frequency.setValueAtTime(950,t); o.frequency.exponentialRampToValueAtTime(520,t+0.55); vib.frequency.value=22; vg.gain.value=60; vib.connect(vg); vg.connect(o.frequency);
      b.type='bandpass'; b.frequency.value=1300; b.Q.value=3; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.16,t+0.04); g.gain.exponentialRampToValueAtTime(0.0001,t+0.6);
      o.connect(b); b.connect(g); out(g,0.2); o.start(t); vib.start(t); o.stop(t+0.65); vib.stop(t+0.65);
      [523,659,784,988,1175,1397,1568,2093].forEach((f,i)=>mallet(t+0.15+i*0.04,f,0.5,0.08,0.35)); },
    chime(){ if(!ok()||!gate('chime',150)) return; const t=T(); mallet(t,2093,0.35,0.07,0.3); mallet(t+0.05,2637,0.35,0.05,0.3); },
    jump2(){ if(!ok()) return; const t=T(); nz(t,0.22,0.16,'bandpass',700,2600,1.8,0,0.03); thump(t,120,80,0.08,0.16); mallet(t+0.02,1568,0.18,0.05); },
    odStart(){ if(!ok()) return; const t=T(); nz(t,0.45,0.3,'bandpass',200,4000,1.2,0.3,0.3); thump(t+0.4,140,30,0.7,0.95,0.4); ring(t+0.4,55,1.0,0.3); [523,659,784,1046,1318].forEach((f,i)=>mallet(t+0.4+i*0.04,f,0.5,0.12,0.35)); },
    odEnd(){ if(!ok()) return; const t=T(); const o=ctx.createOscillator(),g=ctx.createGain(); o.type='triangle'; o.frequency.setValueAtTime(700,t); o.frequency.exponentialRampToValueAtTime(70,t+0.7); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.18,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+0.75); o.connect(g); out(g,0.25); o.start(t); o.stop(t+0.8); thump(t+0.1,90,35,0.4,0.4); },
    flow(){ if(!ok()) return; const t=T(); nz(t,0.32,0.18,'bandpass',300,2600,1.4,0.25,0.05); thump(t+0.12,120,50,0.2,0.45,0.2); mallet(t+0.12,1175,0.3,0.1,0.3); },
    clear(){ if(!ok()) return; const t=T(); mallet(t,1047,0.3,0.15,0.3); mallet(t+0.08,1568,0.4,0.13,0.3); },
    heartbeat(){ if(!ok()) return; const t=T(); thump(t,70,40,0.18,0.7); thump(t+0.22,64,38,0.2,0.55); thump(t+0.9,70,40,0.18,0.5); thump(t+1.12,64,38,0.2,0.4); },
    die(){ if(!ok()) return; const t=T(); thump(t,85,24,1.5,0.95,0.45); nz(t,1.7,0.4,'lowpass',900,50,0.7,0.45); ring(t+0.05,38,1.4,0.25); },
    smack(){ if(!ok()) return; const t=T();
      ring(t,v(880,0.03),0.09,0.35,0.1); ring(t,1320,0.05,0.12); thump(t,150,40,0.26,0.9,0.2);
      { const o=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain(),b0=t+0.07;
        o.type='sine'; o.frequency.setValueAtTime(260,b0); o.frequency.exponentialRampToValueAtTime(330,b0+0.5);
        lfo.frequency.setValueAtTime(14,b0); lfo.frequency.linearRampToValueAtTime(9,b0+0.6); lg.gain.setValueAtTime(90,b0); lg.gain.exponentialRampToValueAtTime(4,b0+0.6);
        lfo.connect(lg); lg.connect(o.frequency);
        g.gain.setValueAtTime(0.0001,b0); g.gain.exponentialRampToValueAtTime(0.16,b0+0.02); g.gain.exponentialRampToValueAtTime(0.0001,b0+0.65);
        o.connect(g); out(g,0.2); o.start(b0); lfo.start(b0); o.stop(b0+0.7); lfo.stop(b0+0.7); }
      for(let i=0;i<6;i++) nz(t+0.04+rand(0,0.18),0.03,rand(0.08,0.16),'bandpass',rand(1500,4000),null,2.5);
    },
    hiyaa(){
      if(!ok()) return; const t=T();
      nz(t,0.28,0.24,'bandpass',300,2400,1.6,0.15,0.12);
      const g0=t+0.24,o=ctx.createOscillator(),f1=ctx.createBiquadFilter(),f2=ctx.createBiquadFilter(),g=ctx.createGain(),g1=ctx.createGain(),g2=ctx.createGain();
      o.type='sawtooth'; o.frequency.setValueAtTime(175,g0); o.frequency.exponentialRampToValueAtTime(120,g0+0.12);
      f1.type='bandpass'; f1.frequency.value=650; f1.Q.value=4; f2.type='bandpass'; f2.frequency.value=1100; f2.Q.value=5; g1.gain.value=2.4; g2.gain.value=1.4;
      g.gain.setValueAtTime(0.0001,g0); g.gain.exponentialRampToValueAtTime(0.5,g0+0.012); g.gain.exponentialRampToValueAtTime(0.0001,g0+0.13);
      o.connect(f1); o.connect(f2); f1.connect(g1); f2.connect(g2); g1.connect(g); g2.connect(g); out(g,0.08); o.start(g0); o.stop(g0+0.16);
      nz(g0,0.06,0.12,'bandpass',1800,900,1.5);
    },

  };
})();

const VOL_DEF={master:1,music:1.0,sfx:0.3,drums:1,melody:1,chords:1,crackle:0.1};
const VOL=Object.assign({},VOL_DEF,load('kulstorm_vol',{}));

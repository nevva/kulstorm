'use strict';
// Generated music: chord progressions per zone and for bosses (MIDI notes, 57 = A3), scales as intervals from root,
// and tempo per game phase. The music changes progression and tempo at the next bar line.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const MUSIC={
  zones:{
    city:  {root:57,scale:[0,3,5,7,10],prog:[[57,60,64,67,71],[53,57,60,64,69],[48,55,59,64,67],[52,55,59,62,67]]},       // A minor, lofi
    jungle:{root:55,scale:[0,2,4,7,9],prog:[[55,59,62,66,69],[52,55,59,62,66],[48,55,59,64,67],[50,57,62,64,69]]},        // G major, warm
    desert:{root:52,scale:[0,1,4,5,7,8,10],prog:[[52,59,64,67,71],[53,60,64,69,72],[50,57,62,65,69],[52,56,59,62,64]]},   // E phrygian dominant
    neon:  {root:57,scale:[0,2,3,5,7,8,10],prog:[[57,60,64,69],[53,57,60,65],[48,52,55,60,64],[55,59,62,67]]},             // A minor, synthwave
    ice:   {root:53,scale:[0,2,4,6,7,9,11],prog:[[53,57,60,64,71],[53,55,59,62,67],[52,55,59,62,67],[57,60,64,67]]},       // F lydian, dreamy
    lava:  {root:62,oct:-12,scale:[0,2,3,5,7,8,11],prog:[[62,65,69,72],[58,62,65,69],[55,58,62,67],[57,61,64,67]]},      // D harmonic minor, an octave down
  },
  boss:{root:57,scale:[0,2,3,5,7,8,11],bpm:100,prog:[[57,60,64,69],[53,57,60,65],[50,53,57,62],[52,56,59,64]]},          // A harmonic minor, driving
  bpm:{menu:72,paused:72,shop:72,dead:66,run:[78,84,90,96]},  // run: one tempo per intensity tier
  tierDist:500,   // metres per extra intensity tier
  tierLevels:4,   // run levels (Nv) per extra intensity tier
  danger:0.3,     // leader HP fraction below which the heartbeat starts
};

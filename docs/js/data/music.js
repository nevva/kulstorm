'use strict';
// Generated music: chord progressions per zone and for bosses (MIDI notes, 57 = A3), scales as intervals from root,
// and a lofi genre per zone. The music changes progression, genre and tempo at the next bar line.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
//
// A genre is a tempo range, swing, a melody instrument and one bar of patterns for each layer in MUSIC.layers.
// Patterns are sixteen sixteenths, one character each:
//   '.' rest   'x' hit   'o' soft hit   '+' soft hit only while the screen is busy (many recent kills)   'r' a quick triplet roll
//   In bass parts 'x' plays the chord root, 'o' the octave above and '5' the fifth.
// A layer is a list of parts {v:voice,p:pattern}. Voices:
//   drums   kick, k808 (long boomy kick), snare, brush, rim, clap, hat, ohat (open hat), ride, shaker, conga
//   chords  pad (held until the next hit), comp (short electric-piano chord), stab (short synth chord), strum (rolled guitar-like pluck), swell (slow fade-in)
//   bass    bass (round), walk (walking upright bass: quarter notes through the chord, leading into the next one), acid (short and buzzy), sub808 (long sliding 808)
//   keys    a chord tone between lo and hi (MIDI) in the genre's instrument
// swing delays the off-beat eighths and swing16 the off-beat sixteenths, as a fraction of their length.
// inst (melody instrument): ep, marimba, pluck, synth, glock, bell.
const GENRES={
  jazz:{name:'jazz',bpm:[78,94],swing:0.33,swing16:0,inst:'ep',
    pad:[{v:'comp',p:'x.....x.......+.'}],
    bass:[{v:'walk',p:'x...x...x...x...'}],
    hats:[{v:'ride',p:'x...x.x.x...x.x.'}],
    kick:[{v:'kick',p:'o.......o.....+.'}],
    snare:[{v:'brush',p:'....x.......x...'},{v:'hat',p:'....o.......o...'}],
    arp:[{v:'keys',p:'......x.......x.',lo:67,hi:79}],
    groove:[{v:'brush',p:'..o...+...o...+.'}],
    push:[{v:'comp',p:'..........o.....'},{v:'kick',p:'......o.........'}]},
  bossa:{name:'bossa nova',bpm:[82,98],swing:0,swing16:0,inst:'marimba',
    pad:[{v:'strum',p:'x..x..x...x..x..'}],
    bass:[{v:'bass',p:'x.....5.x.....5.'}],
    hats:[{v:'shaker',p:'xoooxoooxoooxooo'}],
    kick:[{v:'kick',p:'x..o....x..o....'}],
    snare:[{v:'rim',p:'x..x...x..x...x.'}],
    arp:[{v:'keys',p:'..x...x.....x...',lo:67,hi:81}],
    groove:[{v:'conga',p:'o.x...o.x.o.+...'}],
    push:[{v:'conga',p:'..........x...x.'},{v:'bass',p:'..............o.'}]},
  hiphop:{name:'hiphop',bpm:[80,92],swing:0,swing16:0.35,inst:'pluck',
    pad:[{v:'pad',p:'x.........+.....'}],
    bass:[{v:'bass',p:'x......x.x......'}],
    hats:[{v:'hat',p:'x.x.x.x.x.x.xox.'}],
    kick:[{v:'kick',p:'x......x.xx.....'}],
    snare:[{v:'snare',p:'....x.......x...'}],
    arp:[{v:'keys',p:'.......x.......x',lo:62,hi:76}],
    groove:[{v:'snare',p:'.......o.....o..'},{v:'hat',p:'...+.......+....'}],
    push:[{v:'ohat',p:'......o.......o.'},{v:'kick',p:'...............o'}]},
  techno:{name:'techno',bpm:[112,124],swing:0,swing16:0,inst:'synth',
    pad:[{v:'stab',p:'..x..x....x..x..'}],
    bass:[{v:'acid',p:'..x...x...x...xo'}],
    hats:[{v:'ohat',p:'..x...x...x...x.'}],
    kick:[{v:'kick',p:'x...x...x...x...'}],
    snare:[{v:'clap',p:'....x.......x...'}],
    arp:[{v:'keys',p:'x..x..x..x..x.x.',lo:64,hi:84}],
    groove:[{v:'hat',p:'oxoxoxoxoxoxoxox'}],
    push:[{v:'kick',p:'..............o.'},{v:'acid',p:'.o.......o......'}]},
  ambient:{name:'ambient',bpm:[66,80],swing:0.1,swing16:0,inst:'glock',
    pad:[{v:'swell',p:'x...............'}],
    bass:[{v:'bass',p:'x.......o.......'}],
    hats:[{v:'shaker',p:'..o...o...o...o.'}],
    kick:[{v:'kick',p:'o.........o.....'}],
    snare:[{v:'rim',p:'....o.......x...'}],
    arp:[{v:'keys',p:'x..o..x..o..x...',lo:72,hi:88}],
    groove:[{v:'ohat',p:'......o.......+.'}],
    push:[{v:'keys',p:'.......o.......o',lo:79,hi:91}]},
  trap:{name:'trap',bpm:[68,76],swing:0,swing16:0,inst:'bell',
    pad:[{v:'pad',p:'x...............'}],
    bass:[{v:'sub808',p:'x.........x..x..'}],
    hats:[{v:'hat',p:'xoxoxoxoxoxoxoxo'}],
    kick:[{v:'k808',p:'x.........x.....'}],
    snare:[{v:'clap',p:'........x.......'}],
    arp:[{v:'keys',p:'x.....x.....x...',lo:67,hi:79}],
    groove:[{v:'hat',p:'......r.......rr'}],
    push:[{v:'k808',p:'...o..........o.'},{v:'snare',p:'.............o..'}]},
  // the boss: driving, a kick on every beat, eighth-note bass, hats throughout
  boss:{name:'boss',bpm:[100,100],swing:0.18,swing16:0,inst:'ep',
    pad:[{v:'pad',p:'x...............'}],
    bass:[{v:'bass',p:'x.x.x.x.x.x.x.x.'}],
    hats:[{v:'hat',p:'x.o.x.o.x.o.x.o.'}],
    kick:[{v:'kick',p:'x...x...x...x...'}],
    snare:[{v:'snare',p:'....x.......x..o'}],
    arp:[{v:'keys',p:'..x...x...x...x.',lo:64,hi:79}],
    groove:[{v:'hat',p:'.o.o.o.o.o.o.o.o'},{v:'snare',p:'..............o.'}],
    push:[{v:'kick',p:'......o.........'}]},
};
const MUSIC={
  zones:{
    city:  {genre:'jazz',root:57,scale:[0,2,3,5,7,8,10],prog:[[59,62,65,69],[52,56,62,65],[57,60,64,67,71],[53,57,60,64,67]]},  // A minor, ii–V–i–VI with sevenths and ninths
    jungle:{genre:'bossa',root:55,scale:[0,2,4,7,9],prog:[[55,59,62,66],[57,61,64,67],[57,60,64,67],[50,57,60,66]]},          // G major, Imaj7–II7–ii7–V7
    desert:{genre:'hiphop',root:52,scale:[0,1,4,5,7,8,10],prog:[[52,59,64,67,71],[53,60,64,69,72],[50,57,62,65,69],[52,56,59,62,64]]},  // E phrygian dominant, dusty
    neon:  {genre:'techno',root:57,scale:[0,2,3,5,7,8,10],prog:[[57,60,64,67],[57,60,64,67],[53,57,60,64],[55,59,62,67]]},     // A minor, one chord held, then a turn
    ice:   {genre:'ambient',root:53,scale:[0,2,4,6,7,9,11],prog:[[53,57,60,64,71],[53,55,59,62,67],[52,55,59,62,67],[57,60,64,67]]},  // F lydian, dreamy
    lava:  {genre:'trap',root:62,oct:-12,scale:[0,2,3,5,7,8,11],prog:[[62,65,69,72],[58,62,65,69],[55,58,62,67],[57,61,64,67]]},  // D harmonic minor, an octave down
  },
  boss:{genre:'boss',root:57,scale:[0,2,3,5,7,8,11],prog:[[57,60,64,69],[53,57,60,65],[50,53,57,62],[52,56,59,64]]},           // A harmonic minor
  bpm:{menu:72,paused:72,shop:72,dead:66},  // calm phases; a run's tempo comes from its genre and rises from bpm[0] to bpm[1] as layers build up
  // During a run the music builds from one layer towards the next boss, adding one layer at a time (at most one per bar),
  // all of them in place shortly before the boss arrives. The boss plays everything; after it the build starts over.
  layers:['pad','melody','bass','hats','kick','snare','arp','groove','push'],  // melody = the notes dropped by the enemies you blow up
  danger:0.3,     // leader HP fraction below which the heartbeat starts
};

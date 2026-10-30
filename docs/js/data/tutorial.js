'use strict';
// Tutorial cards, one per ability, each shown once right before the first moment it is useful (see js/ui/tutorial.js).
// do: what closes the card: 'jump', 'duck' or 'od' (doing it), 'steer' (moving sideways) or 'ok' (a tap or a key).
// then: a follow-up card shown at the top of the jump that this card asked for.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const TUTORIAL={
  steer:{title:'Steer',how:'Drag sideways · A/D · ←/→',text:'Enemies come in three lanes. Switch lanes to aim: the squad always fires straight ahead.',do:'steer'},
  jump:{title:'Jump!',how:'Swipe up · W · Space · ↑',text:'Jump over low obstacles. Every obstacle you clear heals the squad and gives FLOW: +15% damage, fire rate and speed per step, up to three steps, for 4 seconds.',do:'jump'},
  duck:{title:'Duck!',how:'Swipe down · S · Shift · ↓',text:'Roll under bars and lasers. Just like jumps, cleared obstacles heal the squad and give FLOW.',do:'duck'},
  tall:{title:'Double jump',how:'Jump first …',text:'The spike barricade is too tall for a normal jump.',do:'jump',then:'tall2'},
  tall2:{title:'… and again!',how:'Jump once more in the air',text:'The second jump takes you high over the spikes.',do:'jump'},
  pound:{title:'Ground pound',how:'Jump first …',text:'Enemies are close to the front. From the air you can slam into the ground.',do:'jump',then:'pound2'},
  pound2:{title:'… and down!',how:'Swipe down · S · Shift · ↓ in the air',text:'The ground pound hurts every enemy near the front, knocks them back and pulls in the ones a little further away.',do:'duck'},
  wall:{title:'Walls',how:'Shoot it, or run into it',text:'Shoot the wall to pieces to get what\'s on it: a new squad member or a perk for the whole squad. Run straight into it and your front-runner headbutts it apart, but takes damage from the wall\'s remaining health. Duck just before it to slide-tackle instead and take much less.',do:'ok'},
  chest:{title:'Chests',how:'Run into it',text:'A chest holds a random item you have unlocked in the Armory. Before you buy Money Maker it is empty, but you can pay coins from the run for a mystery item.',do:'ok'},
  od:{title:'OVERDRIVE ready!',how:'E · middle click · the button',text:'6 seconds of triple damage, double fire rate, shots that pierce everything and no damage to you. The meter charges from enemies, obstacles and walls.',do:'od'},
};
// The gesture each card acts out in its little demo: drag sideways, swipe up or down, or tap.
const TUT_GESTURE={steer:'drag',jump:'up',duck:'down',tall:'up',tall2:'up',pound:'up',pound2:'down',wall:'drag',chest:'drag',od:'tap'};

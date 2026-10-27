'use strict';
// Tutorial cards, one per ability, each shown once right before the first moment it is useful (see js/ui/tutorial.js).
// do: what closes the card: 'jump', 'duck' or 'od' (doing it), 'steer' (moving sideways) or 'ok' (a tap or a key).
// then: a follow-up card shown at the top of the jump that this card asked for.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const TUTORIAL={
  steer:{title:'Styr',how:'Dra åt sidan · A/D · ←/→',text:'Fienderna kommer i tre filer. Byt fil för att sikta: truppen skjuter rakt fram hela tiden.',do:'steer'},
  jump:{title:'Hoppa!',how:'Svep upp · W · Space · ↑',text:'Hoppa över låga hinder. Varje hinder ni klarar läker truppen och ger FLOW: +15 % skada, eldtakt och fart per steg, upp till tre steg, i 4 sekunder.',do:'jump'},
  duck:{title:'Ducka!',how:'Svep ner · S · Shift · ↓',text:'Rulla under bommar och laser. Precis som hopp läker klarade hinder truppen och ger FLOW.',do:'duck'},
  tall:{title:'Dubbelhopp',how:'Hoppa först …',text:'Spikbarrikaden är för hög för ett vanligt hopp.',do:'jump',then:'tall2'},
  tall2:{title:'… och igen!',how:'Hoppa en gång till i luften',text:'Det andra hoppet tar er högt över spikarna.',do:'jump'},
  pound:{title:'Markstöt',how:'Hoppa först …',text:'Fienderna är nära fronten. Från luften kan du slå ner i marken.',do:'jump',then:'pound2'},
  pound2:{title:'… och ner!',how:'Svep ner · S · Shift · ↓ i luften',text:'Markstöten skadar alla fiender nära fronten, slår dem bakåt och drar in de som står lite längre bort.',do:'duck'},
  wall:{title:'Väggar',how:'Skjut den, eller spring in i den',text:'Skjut sönder väggen för att få det som står på den: en ny gubbe eller en vinst för hela truppen. Springer du rakt in i den skallar fronten sönder den, men tar skada av väggens kvarvarande hälsa.',do:'ok'},
  od:{title:'OVERDRIVE redo!',how:'E · mittenklick · knappen',text:'6 sekunder med tredubbel skada, dubbel eldtakt, skott som går igenom allt och ingen skada på er. Mätaren laddas av fiender, hinder och väggar.',do:'od'},
};

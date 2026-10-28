'use strict';
// ---------- options (everything opt-out)
const OPT={};
(function(){ const saved=load('kulstorm_opts',{}); OPT_DEFS.forEach(o=>{ OPT[o[0]]=saved[o[0]]!==false; }); })();
function saveOpts(){ store('kulstorm_opts',OPT); }
const GAME_SPEEDS=[0.5,1,1.5];
let gameSpeed=load('kulstorm_speed',1);
if(!GAME_SPEEDS.includes(gameSpeed)) gameSpeed=1;

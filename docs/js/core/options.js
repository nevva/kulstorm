'use strict';
// ---------- options (everything opt-out)
const OPT={};
(function(){ const saved=load('kulstorm_opts',{}); OPT_DEFS.forEach(o=>{ OPT[o[0]]=saved[o[0]]!==false; }); })();
function saveOpts(){ store('kulstorm_opts',OPT); }

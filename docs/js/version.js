'use strict';
// Version: version.json holds the deployed version (bump both with ./bump-version.sh). When it differs from
// VERSION the page reloads with ?v=<new> so the browser and CDN caches are bypassed. A run is never interrupted:
// the reload waits until window.kulstormBusy() says the game is back in the menu.
const VERSION='2026.10.30-0749';
(function(){
  const el=document.getElementById('menu-ver'); if(el) el.textContent='Version '+VERSION;
  let pending=null;
  const busy=()=>{ try{ return !!(window.kulstormBusy&&window.kulstormBusy()); }catch(e){ return false; } };
  function reload(v){
    // Guard against a reload loop if a stale cache still serves the old page for the new URL.
    try{ if(sessionStorage.getItem('kulstorm_reloaded')===v) return; sessionStorage.setItem('kulstorm_reloaded',v); }catch(e){}
    const u=new URL(location.href); u.searchParams.set('v',v); location.replace(u.href);
  }
  function check(){
    fetch(new URL('version.json?t='+Date.now(),location.href),{cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(j=>{ if(j&&j.version&&j.version!==VERSION){ pending=j.version; if(!busy()) reload(pending); } })
      .catch(()=>{});
  }
  check();
  setInterval(check,5*60*1000);
  setInterval(()=>{ if(pending&&!busy()) reload(pending); },3000);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') check(); });
})();

'use strict';
// ---------- language. The game is written in English; Swedish comes from SV (js/data/sv.js), keyed by the English text.
// The language is picked on the start menu and switching reloads the page, so every text is built once in that language:
// the data tables and the markup are translated here at load, and code builds its strings with tl().
const LANG=(()=>{ try{ return JSON.parse(localStorage.getItem('kulstorm_lang'))==='sv'?'sv':'en'; }catch(e){ return 'en'; } })();
const PCT=LANG==='sv'?' %':'%';
// tl('Shield {0}',3) → 'Shield 3', or 'Sköld 3' in Swedish.
function tl(s,...a){ const r=LANG==='sv'&&SV[s]!==undefined?SV[s]:s; return a.length?r.replace(/\{(\d)\}/g,(_,i)=>a[i]):r; }
function setLang(l){ try{ localStorage.setItem('kulstorm_lang',JSON.stringify(l)); }catch(e){} location.reload(); }
document.documentElement.lang=LANG;
if(LANG==='sv'){
  const each=(list,...keys)=>list.forEach(o=>keys.forEach(k=>{ if(typeof o[k]==='string') o[k]=tl(o[k]); }));
  const all=o=>{ for(const k in o) o[k]=tl(o[k]); };
  each(Object.values(WEAPONS),'name'); each(UPGRADES,'name','short','desc'); each(COMBOS,'name','desc'); each(HEROES,'name','desc'); each(TALENTS,'name','desc');
  each(OPT_DEFS,1,2); each(Object.values(TUTORIAL),'title','how','text'); each(ZONES,'name'); each(Object.values(WEATHER),'name');
  all(RARITY); all(ENEMY_NAMES); all(BOSS_NAMES);
  const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  for(let n;(n=walk.nextNode());){ const s=n.nodeValue.trim(); if(s&&SV[s]!==undefined) n.nodeValue=n.nodeValue.replace(s,()=>SV[s]); }
  document.querySelectorAll('[aria-label]').forEach(el=>{ const s=el.getAttribute('aria-label'); if(SV[s]!==undefined) el.setAttribute('aria-label',SV[s]); });
}

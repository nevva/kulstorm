'use strict';
// DOM elements used across the game
const $=id=>document.getElementById(id);
const menuEl=$('menu'),hudEl=$('hud'),overEl=$('over'),flashEl=$('flash'),toastEl=$('toast'),hintEl=$('hint');
const distEl=$('dist'),hpEl=$('hp'),hpTextEl=$('hptext'),coinEl=$('coinchip'),shieldEl=$('shieldchip'),bossBar=$('bossbar'),bossHpEl=$('bosshp'),bossNameEl=$('bossname'),chipsEl=$('squadchips');


// ---------- helpers
const rand=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const C=h=>new THREE.Color(h).convertSRGBToLinear();          // linear (materials, lights)
const RAW=h=>new THREE.Color(h);                               // sRGB as-is (background, fog)
const CV=(h,dh,dl)=>new THREE.Color(h).offsetHSL(rand(-dh,dh),0,rand(-dl,dl)).convertSRGBToLinear();
const hexCss=h=>'#'+h.toString(16).padStart(6,'0');
const fmt=n=>Math.round(n).toLocaleString('sv-SE');
const ZERO=new THREE.Matrix4().makeScale(0,0,0);
const WHITE=C(0xffffff);
function store(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function load(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:JSON.parse(v); }catch(e){ return d; } }

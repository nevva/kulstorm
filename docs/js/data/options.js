'use strict';
// Settings shown in the options menu: [id, name, description]. All default to on.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const OPT_DEFS=[
  ['snake','Ormformation','Truppen följer den främsta i en mjuk kedja'],
  ['dyncam','Dynamisk kamera','Kameran zoomar ut ju fler som ansluter'],
  ['front','Automatisk frontgubbe','Den tåligaste gubben (HP + sköld) går först, kollas varje sekund'],
  ['numbers','Skadesiffror','Flytande siffror vid varje träff'],
  ['hitcolors','Färgkodade träffar','Partikelfärg och storlek följer skadan'],
  ['combos','Kombos','Par av uppgraderingar ger extra effekter'],
  ['coins','Mynt och gubbshop','Fiender släpper mynt som köper startgubbar'],
  ['team','Lagvinster','Väggar kan ge vinster för hela truppen'],
  ['variance','Varierad skada','Varje skott gör ±25 % olika skada'],
  ['shake','Skärmskakning','Kameran skakar vid smällar'],
  ['hearts','Hjärtdrops','Fiender släpper hjärtan som läker'],
  ['planet','Liten planet','Världen kröker sig mot horisonten'],
  ['weather','Väder','Regn, dimma, storm, snö, åska och hetta som påverkar spelet'],
  ['obstacles','Hinder','Hoppa över och ducka under hinder (svep upp/ner, W/S, Space). Ner i luften = markstöt'],
  ['dbljump','Dubbelhopp','Hoppa igen i luften; höga spikbarrikader kräver det'],
  ['overdrive','Overdrive','Ladda en mätare och släpp loss 6 s superläge (E, mittenklick eller knappen). Räddar dig en gång vid 10 % hälsa'],
  ['mouse','Muskontroll','Klick tar över muspekaren: rörelse styr, vänsterklick hoppar, högerklick duckar'],
  ['daynight','Dag och natt','Solen går över himlen, natt med måne, stjärnor, lampor och nattfiender'],
  ['tutorial','Guide','Stannar spelet och förklarar varje förmåga första gången den behövs'],
  ['music','Musik','Lofi i en egen genre per zon (jazz, bossa nova, hiphop, techno, ambient, trap) som formas av fienderna du spränger'],
  ['heroprog','Hjälteprogression','Ledaren samlar XP mellan rundorna och får talangpoäng'],
  ['unicorns','Enhörningar','Hjälpredor som skjuter regnbågsvägar som halverar skadan truppen tar'],
  ['xpshop','XP och köpskärm','Fiender släpper XP; varje nivå öppnar en butik där du köper med rundans mynt'],
];

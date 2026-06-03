import { useState, useEffect, useRef } from "react";

/* ─── GLOBAL CSS ─────────────────────────────────── */
const GS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#060a09;font-family:'Plus Jakarta Sans',sans-serif;color:#ddf2e4}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:#1c3a28;border-radius:4px}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes spin360{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.2)}50%{box-shadow:0 0 18px 5px rgba(34,197,94,.1)}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.anim-up{animation:fadeUp .4s ease both}
.anim-in{animation:scaleIn .25s ease both}
.hoverlift{transition:transform .18s,box-shadow .18s;cursor:pointer}
.hoverlift:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(0,0,0,.5)}
.btn-press{transition:filter .15s,transform .1s;cursor:pointer}
.btn-press:hover{filter:brightness(1.12)}
.btn-press:active{transform:scale(.96)}
.opt-hover{transition:transform .12s;cursor:pointer}
.opt-hover:hover{transform:translateX(5px)}
.msg-in{animation:fadeUp .2s ease both}
.glow-pulse{animation:glow 2.5s ease infinite}
.ticker-track{display:inline-block;animation:ticker 35s linear infinite;white-space:nowrap}
.dot-blink{width:7px;height:7px;border-radius:50%;background:#7c3aed;animation:blink .7s ease infinite}
`;

/* ─── COLOURS ─────────────────────────────────────── */
const C = {
  bg:"#060a09", s1:"#0c1410", s2:"#111c16",
  line:"#1a2e20", green:"#22c55e", g2:"#16a34a",
  gold:"#f59e0b", blue:"#38bdf8", red:"#ef4444",
  purple:"#a78bfa", violet:"#7c3aed",
  txt:"#ddf2e4", sub:"#5a8c62", dim:"#2a4830",
};

/* ─── HELPERS ─────────────────────────────────────── */
const card = (ex) => ({ background:C.s1, border:"1px solid "+C.line, borderRadius:16, ...(ex||{}) });
const pill = (col) => ({ background:col+"18", color:col, border:"1px solid "+col+"33", borderRadius:100, padding:"3px 12px", fontSize:11, fontWeight:700, display:"inline-block" });
const gbtn = (ex) => ({ background:"linear-gradient(135deg,"+C.g2+","+C.green+")", color:"#000", border:"none", borderRadius:11, padding:"11px 22px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", ...(ex||{}) });
const obtn = (col, ex) => ({ background:"transparent", color:col||C.green, border:"1px solid "+(col||C.green)+"44", borderRadius:11, padding:"9px 18px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", ...(ex||{}) });

const fmtTime = (s) => String(Math.floor(s/60)).padStart(2,"0") + ":" + String(s%60).padStart(2,"0");
const scCol = (c,t) => { const p=c/t; return p>=.8?C.green:p>=.6?C.gold:C.red; };
const wc = (t) => t.trim().split(/\s+/).filter(x=>x).length;
const shuffle = (a) => [...a].sort(()=>Math.random()-.5);
const tagSub = (tag) => {
  const t = tag.toLowerCase();
  if(t.includes("english")) return "eng";
  if(t.includes("islamiat")) return "islam";
  if(t.includes("arith")||t.includes("math")||t.includes("quant")) return "math";
  if(t.includes("current")) return "ca";
  if(t.includes("science")) return "sci";
  if(t.includes("computer")) return "comp";
  if(t.includes("pakistan")) return "pak";
  return "gk";
};

/* ─── DATA ────────────────────────────────────────── */
const PATTERNS = [
  { id:"ppsc_ast",  label:"PPSC Assistant (BPS-16)",  exam:"PPSC",  totalQ:100, mins:100, neg:false, dist:[{s:"gk",n:20},{s:"pak",n:20},{s:"islam",n:15},{s:"eng",n:20},{s:"math",n:20},{s:"comp",n:5}] },
  { id:"ppsc_si",   label:"PPSC Sub-Inspector Police",exam:"PPSC",  totalQ:100, mins:90,  neg:false, dist:[{s:"gk",n:25},{s:"pak",n:20},{s:"islam",n:10},{s:"eng",n:20},{s:"ca",n:15},{s:"math",n:10}] },
  { id:"ppsc_insp", label:"PPSC Inspector (All Depts)",exam:"PPSC", totalQ:100, mins:100, neg:false, dist:[{s:"gk",n:20},{s:"pak",n:20},{s:"eng",n:25},{s:"ca",n:20},{s:"math",n:15}] },
  { id:"css_mpt",   label:"CSS MPT (Mandatory)",      exam:"CSS",   totalQ:200, mins:180, neg:true,  dist:[{s:"eng",n:40},{s:"pak",n:40},{s:"islam",n:20},{s:"gk",n:40},{s:"ca",n:40},{s:"sci",n:20}] },
  { id:"fpsc_ast",  label:"FPSC Assistant Director",  exam:"FPSC",  totalQ:100, mins:100, neg:false, dist:[{s:"gk",n:25},{s:"pak",n:20},{s:"islam",n:15},{s:"eng",n:25},{s:"math",n:15}] },
  { id:"nts_gat",   label:"NTS GAT General",          exam:"NTS",   totalQ:100, mins:120, neg:false, dist:[{s:"eng",n:35},{s:"math",n:30},{s:"gk",n:20},{s:"sci",n:15}] },
  { id:"kppsc_ast", label:"KPPSC Assistant",          exam:"KPPSC", totalQ:100, mins:100, neg:false, dist:[{s:"gk",n:25},{s:"pak",n:20},{s:"islam",n:15},{s:"eng",n:20},{s:"math",n:20}] },
];

const SUBS = [
  { id:"gk",   name:"General Knowledge", icon:"[GK]",  color:C.green  },
  { id:"pak",  name:"Pakistan Affairs",  icon:"[PA]",  color:"#4ade80" },
  { id:"islam",name:"Islamiat",          icon:"[ISL]", color:C.gold   },
  { id:"eng",  name:"English",           icon:"[ENG]", color:C.blue   },
  { id:"math", name:"Arithmetic",        icon:"[MTH]", color:C.purple },
  { id:"ca",   name:"Current Affairs",   icon:"[CA]",  color:"#fb923c" },
  { id:"sci",  name:"General Science",   icon:"[SCI]", color:"#2dd4bf" },
  { id:"comp", name:"Computer Skills",   icon:"[IT]",  color:"#f472b6" },
];

const QB = {
  gk:[
    {q:"Capital of Pakistan?",o:["Lahore","Karachi","Islamabad","Peshawar"],a:2,e:"Islamabad became Pakistan's capital in 1966, replacing Rawalpindi as the interim capital."},
    {q:"Who founded Pakistan?",o:["Allama Iqbal","Liaquat Ali Khan","Muhammad Ali Jinnah","Sir Syed Ahmad Khan"],a:2,e:"Quaid-e-Azam Muhammad Ali Jinnah founded Pakistan on 14 August 1947."},
    {q:"Pakistan gained independence in:",o:["1945","1946","1947","1948"],a:2,e:"Pakistan gained independence from British India on 14 August 1947."},
    {q:"How many provinces does Pakistan have?",o:["3","4","5","6"],a:1,e:"Pakistan has 4 provinces: Punjab, Sindh, KPK, and Balochistan."},
    {q:"Largest province of Pakistan by area:",o:["Punjab","Sindh","Balochistan","KPK"],a:2,e:"Balochistan covers about 347,190 km2, which is 44% of Pakistan's total area."},
    {q:"National language of Pakistan:",o:["Punjabi","Sindhi","English","Urdu"],a:3,e:"Urdu is the national language of Pakistan."},
    {q:"Tarbela Dam is built on river:",o:["Chenab","Jhelum","Indus","Ravi"],a:2,e:"Tarbela Dam is on the Indus River in Haripur, KPK — one of the world's largest earth-filled dams."},
    {q:"Pakistan's largest city by population:",o:["Islamabad","Lahore","Karachi","Faisalabad"],a:2,e:"Karachi is Pakistan's largest city with over 14 million people."},
    {q:"K-2, the world's 2nd highest peak, is in:",o:["Nepal","India","Pakistan","China"],a:2,e:"K-2 at 8,611m is in Gilgit-Baltistan, Pakistan."},
    {q:"National animal of Pakistan:",o:["Lion","Snow Leopard","Markhor","Tiger"],a:2,e:"The Markhor is Pakistan's national animal."},
    {q:"National flower of Pakistan:",o:["Rose","Jasmine","Lotus","Tulip"],a:3,e:"The Tulip is Pakistan's national flower, found in abundance in northern Pakistan."},
    {q:"Mangla Dam is on which river?",o:["Indus","Chenab","Jhelum","Ravi"],a:2,e:"Mangla Dam is on the Jhelum River in Mirpur District, AJK."},
  ],
  pak:[
    {q:"The Lahore Resolution was passed on:",o:["23 March 1940","14 Aug 1947","29 Feb 1940","23 March 1941"],a:0,e:"The Lahore Resolution was passed on 23 March 1940, demanding a separate Muslim homeland."},
    {q:"Pakistan became an Islamic Republic in:",o:["1947","1956","1962","1973"],a:1,e:"Pakistan became an Islamic Republic on 23 March 1956, adopting its first constitution."},
    {q:"Pakistan's current constitution was adopted in:",o:["1956","1962","1969","1973"],a:3,e:"Pakistan's current constitution was adopted on 10 April 1973."},
    {q:"First Prime Minister of Pakistan:",o:["Liaquat Ali Khan","Khawaja Nazimuddin","M A Jinnah","Feroz Khan Noon"],a:0,e:"Liaquat Ali Khan served as PM from 1947 until his assassination in 1951."},
    {q:"Gwadar Port is in:",o:["Sindh","Punjab","Balochistan","KPK"],a:2,e:"Gwadar is in Balochistan — central to CPEC trade."},
    {q:"Pakistan's first capital was:",o:["Islamabad","Lahore","Karachi","Rawalpindi"],a:2,e:"Karachi served as Pakistan's first capital from 1947 to 1959."},
    {q:"CPEC links Gwadar to:",o:["Beijing","Shanghai","Kashgar","Urumqi"],a:2,e:"CPEC links Gwadar Port to Kashgar in Xinjiang, China."},
    {q:"Pakistan's first female PM:",o:["Hina Rabbani Khar","Benazir Bhutto","Fehmida Mirza","Sherry Rehman"],a:1,e:"Benazir Bhutto served twice as PM (1988-90 and 1993-96)."},
    {q:"National Assembly total seats:",o:["272","336","342","350"],a:2,e:"The National Assembly of Pakistan has 342 seats."},
    {q:"Pakistan's Parliament is called:",o:["Majlis-e-Shoora","Senate","National Assembly","Lok Sabha"],a:0,e:"Pakistan's Parliament is called Majlis-e-Shoora."},
    {q:"The Simla Agreement was signed in:",o:["1970","1971","1972","1973"],a:2,e:"The Simla Agreement was signed on 2 July 1972 between Pakistan and India."},
    {q:"Operation Gibraltar was launched in:",o:["1947","1965","1971","1999"],a:1,e:"Operation Gibraltar was launched in August 1965."},
  ],
  islam:[
    {q:"How many Surahs are in the Holy Quran?",o:["112","113","114","115"],a:2,e:"The Quran contains 114 Surahs (chapters)."},
    {q:"The Holy Quran was revealed over:",o:["10 years","20 years","23 years","25 years"],a:2,e:"The Quran was revealed to Prophet Muhammad (PBUH) over 23 years."},
    {q:"The first Wahi was revealed in:",o:["Cave Hira","Masjid Nabawi","Makkah city","Mount Arafat"],a:0,e:"Surah Al-Alaq was first revealed in Cave Hira near Makkah in 610 CE."},
    {q:"Zakat is the ___ pillar of Islam:",o:["2nd","3rd","4th","5th"],a:1,e:"The 5 pillars are: Shahada, Salah, Zakat, Sawm, and Hajj."},
    {q:"First mosque in Islam:",o:["Masjid Al-Haram","Masjid-e-Quba","Masjid-e-Nabawi","Masjid Al-Aqsa"],a:1,e:"Masjid-e-Quba was built by the Prophet (PBUH) upon arrival in Madinah in 622 CE."},
    {q:"Which Surah is called 'Heart of the Quran'?",o:["Al-Fatiha","Surah Yasin","Al-Baqarah","Al-Ikhlas"],a:1,e:"Surah Yasin is called the heart of the Quran."},
    {q:"Hajj is performed in Islamic month of:",o:["Ramadan","Sha'ban","Dhul Hijjah","Muharram"],a:2,e:"Hajj is performed in Dhul Hijjah, the 12th Islamic month."},
    {q:"Longest Surah of the Holy Quran:",o:["Surah Yasin","Al-Fatiha","Al-Baqarah","Al-Imran"],a:2,e:"Surah Al-Baqarah is the longest Surah with 286 Ayaat."},
    {q:"Number of Kalimas in Islam:",o:["4","5","6","7"],a:2,e:"There are 6 Kalimas in Islam."},
    {q:"The last Prophet in Islam:",o:["Hazrat Isa AS","Hazrat Ibrahim AS","Hazrat Muhammad PBUH","Hazrat Musa AS"],a:2,e:"Hazrat Muhammad (PBUH) is the last and final prophet — Khatam-un-Nabiyeen."},
  ],
  eng:[
    {q:"Antonym of 'Laconic':",o:["Brief","Verbose","Silent","Quick"],a:1,e:"Laconic means using very few words. Its antonym is Verbose — using too many words."},
    {q:"Synonym of 'Ephemeral':",o:["Permanent","Eternal","Transitory","Substantial"],a:2,e:"Ephemeral means lasting a very short time. Synonym: Transitory."},
    {q:"Passive of 'She writes a letter':",o:["A letter was written by her","A letter is written by her","A letter has been written","A letter will be written"],a:1,e:"Simple present passive: Object + is/are + past participle."},
    {q:"Correctly spelled word:",o:["Accomodation","Accommodation","Acommodation","Accomodattion"],a:1,e:"Accommodation: double 'c' (ac-com-) and double 'm' (-mmo-) are both required."},
    {q:"'Once in a blue moon' means:",o:["Frequently","Never","Very rarely","At night only"],a:2,e:"This idiom means something happens very rarely or infrequently."},
    {q:"Plural of 'Analysis':",o:["Analysises","Analysis","Analyses","Analysees"],a:2,e:"Greek-origin words ending in -is form plurals with -es: Analysis becomes Analyses."},
    {q:"Meaning of 'Ubiquitous':",o:["Rare","Unique","Found everywhere","Old-fashioned"],a:2,e:"Ubiquitous means present, appearing, or found everywhere."},
    {q:"'Bite the bullet' means:",o:["Eat fast","Endure pain stoically","Shoot someone","Be afraid"],a:1,e:"'Bite the bullet' means to endure a painful or unpleasant situation with courage."},
    {q:"Word closest in meaning to 'Gregarious':",o:["Lonely","Sociable","Aggressive","Cautious"],a:1,e:"Gregarious means fond of company; sociable."},
    {q:"Antonym of 'Magnanimous':",o:["Generous","Petty","Noble","Brave"],a:1,e:"Magnanimous means generous in forgiving. Its antonym is Petty — small-minded."},
  ],
  math:[
    {q:"If 15% of a number is 45, the number is:",o:["200","250","300","350"],a:2,e:"15% = 45, so 1% = 3, therefore 100% = 300."},
    {q:"A train covers 360 km in 4 hours. Its speed:",o:["80 km/h","90 km/h","100 km/h","110 km/h"],a:1,e:"Speed = Distance / Time = 360 / 4 = 90 km/h."},
    {q:"Square root of 1764:",o:["40","42","44","46"],a:1,e:"42 x 42 = 1764, so the square root of 1764 is 42."},
    {q:"Boys to girls ratio 3:2, if 30 boys, girls =",o:["15","20","25","18"],a:1,e:"3 parts = 30, so 1 part = 10. Girls = 2 parts = 20."},
    {q:"Cost Rs.800, sold Rs.1000. Profit %:",o:["20%","25%","30%","15%"],a:1,e:"Profit% = (Profit / Cost) x 100 = (200 / 800) x 100 = 25%."},
    {q:"Simple interest on Rs.5000 at 8% for 3 years:",o:["Rs.1000","Rs.1200","Rs.1400","Rs.1600"],a:1,e:"SI = (P x R x T) / 100 = (5000 x 8 x 3) / 100 = Rs.1200."},
    {q:"Average of 10, 20, 30, 40, 50:",o:["25","30","35","40"],a:1,e:"Sum = 150. Average = 150 / 5 = 30."},
    {q:"LCM of 12 and 18:",o:["24","36","48","72"],a:1,e:"LCM(12, 18) = 36."},
    {q:"If x + 5 = 12, then x =",o:["5","6","7","8"],a:2,e:"x = 12 - 5 = 7."},
    {q:"40% of 250 =",o:["80","90","100","110"],a:2,e:"(40/100) x 250 = 100."},
  ],
  ca:[
    {q:"SAARC headquarters is in:",o:["New Delhi","Islamabad","Kathmandu","Colombo"],a:2,e:"The SAARC Secretariat is in Kathmandu, Nepal, established in 1985."},
    {q:"OIC stands for:",o:["Organization of Islamic Cooperation","Order of Islamic Countries","Organization of International Commerce","None"],a:0,e:"OIC = Organization of Islamic Cooperation. HQ in Jeddah; 57 member states."},
    {q:"UN Headquarters is in:",o:["Washington DC","London","New York","Geneva"],a:2,e:"UN Headquarters is in New York City, USA."},
    {q:"SCO: Pakistan became full member in:",o:["2001","2015","2017","2019"],a:2,e:"Pakistan became a full SCO (Shanghai Cooperation Organisation) member in 2017."},
    {q:"Pakistan's largest trading partner:",o:["USA","Saudi Arabia","China","UAE"],a:2,e:"China is Pakistan's largest trading partner, especially after CPEC."},
    {q:"ECO was founded by:",o:["Pakistan, Iran, Turkey","Pakistan, India, China","USA, UK, France","GCC nations"],a:0,e:"ECO = Economic Cooperation Organization, founded by Pakistan, Iran, and Turkey."},
    {q:"Pakistan joined the UN in:",o:["1945","1947","1948","1950"],a:1,e:"Pakistan became the 57th UN member on 30 September 1947."},
    {q:"FATF stands for:",o:["Financial Action Task Force","Foreign Affairs Trade Forum","Federal Anti-Terrorism Force","None"],a:0,e:"FATF = Financial Action Task Force, the international anti-money-laundering watchdog."},
  ],
  sci:[
    {q:"Chemical formula of water:",o:["H2O2","H2O","HO2","H3O"],a:1,e:"Water = H2O: two hydrogen atoms bonded to one oxygen atom."},
    {q:"Vitamin C deficiency causes:",o:["Rickets","Scurvy","Anemia","Night blindness"],a:1,e:"Vitamin C deficiency causes Scurvy, which leads to bleeding gums and weakness."},
    {q:"Speed of light approximately:",o:["3x10^6 m/s","3x10^8 m/s","3x10^10 m/s","3x10^4 m/s"],a:1,e:"Speed of light is approximately 3x10^8 m/s (300,000 km/s) in vacuum."},
    {q:"Powerhouse of the cell:",o:["Nucleus","Ribosome","Mitochondria","Golgi Body"],a:2,e:"Mitochondria produce ATP energy and are called the powerhouse of the cell."},
    {q:"Ozone layer is in the:",o:["Troposphere","Stratosphere","Mesosphere","Thermosphere"],a:1,e:"The ozone layer is in the stratosphere, 15-35 km above Earth, absorbing harmful UV."},
    {q:"The lightest element:",o:["Helium","Oxygen","Hydrogen","Carbon"],a:2,e:"Hydrogen is the lightest and most abundant element in the universe."},
    {q:"Normal human body temperature:",o:["35C","36.6C","37C","38C"],a:2,e:"Normal human body temperature is approximately 37 degrees Celsius (98.6F)."},
    {q:"Closest planet to the Sun:",o:["Venus","Earth","Mars","Mercury"],a:3,e:"Mercury is the closest planet to the Sun, at an average distance of 57.9 million km."},
  ],
  comp:[
    {q:"CPU stands for:",o:["Central Processing Unit","Central Program Utility","Computer Processing Unit","Core Processing Unit"],a:0,e:"CPU = Central Processing Unit — the primary component that executes instructions."},
    {q:"RAM stands for:",o:["Read Access Memory","Random Access Memory","Run Access Memory","Rapid App Memory"],a:1,e:"RAM = Random Access Memory — volatile memory that stores data temporarily."},
    {q:"Which is NOT an operating system?",o:["Windows","Linux","Oracle","macOS"],a:2,e:"Oracle is a Database Management System (DBMS), not an operating system."},
    {q:"HTTP stands for:",o:["HyperText Transfer Protocol","High Transfer Text Protocol","Home Text Transfer Protocol","HyperText Transmission Protocol"],a:0,e:"HTTP = HyperText Transfer Protocol — the foundation of web data communication."},
    {q:"Shortcut key to Select All:",o:["Ctrl+C","Ctrl+V","Ctrl+A","Ctrl+X"],a:2,e:"Ctrl+A = Select All. C=Copy, V=Paste, X=Cut, Z=Undo."},
    {q:"1 Byte equals:",o:["4 bits","6 bits","8 bits","16 bits"],a:2,e:"1 Byte = 8 bits. 1 Kilobyte = 1024 Bytes."},
    {q:"Which is a web browser?",o:["MS Word","Google Chrome","Photoshop","MS Excel"],a:1,e:"Google Chrome is a web browser; the others are productivity or design applications."},
    {q:"Full form of PDF:",o:["Printed Document Format","Portable Document Format","Public Document File","Private Document Format"],a:1,e:"PDF = Portable Document Format, developed by Adobe Systems."},
  ],
};

const PAPERS = [
  {id:1,exam:"PPSC",post:"Assistant BPS-16",dept:"All Departments",year:2023,month:"November",qs:100,dur:"100 min",tags:["GK","English","Islamiat","Arithmetic"]},
  {id:2,exam:"PPSC",post:"Sub Inspector Police",dept:"Police Department",year:2022,month:"September",qs:100,dur:"90 min",tags:["Law","GK","Current Affairs"]},
  {id:3,exam:"PPSC",post:"Naib Tehsildar",dept:"Revenue Department",year:2023,month:"July",qs:100,dur:"100 min",tags:["Pakistan Affairs","GK","Arithmetic"]},
  {id:4,exam:"CSS",post:"CSS Officer (BS-17)",dept:"All Groups",year:2023,month:"February",qs:200,dur:"3 hours",tags:["English","Current Affairs","Pakistan Affairs","Islamiat"]},
  {id:5,exam:"CSS",post:"CSS Officer (BS-17)",dept:"All Groups",year:2022,month:"February",qs:200,dur:"3 hours",tags:["English","Current Affairs","Islamiat","Pakistan Affairs"]},
  {id:6,exam:"FPSC",post:"Assistant Director",dept:"Federal Ministries",year:2023,month:"October",qs:100,dur:"100 min",tags:["GK","English","Arithmetic","Islamiat"]},
  {id:7,exam:"FPSC",post:"Inspector Customs",dept:"FBR",year:2022,month:"December",qs:100,dur:"100 min",tags:["GK","English","Current Affairs"]},
  {id:8,exam:"NTS",post:"GAT General",dept:"HEC Pakistan",year:2023,month:"Multiple",qs:100,dur:"120 min",tags:["English","Arithmetic","GK"]},
];

const INT_POSTS = [
  {id:"css",   label:"CSS Officer (BS-17)",      dept:"All Groups",         color:C.blue,   tip:"Know your optional subjects deeply. Be ready to discuss current affairs and Pakistan's foreign policy."},
  {id:"ppsc_i",label:"PPSC Inspector",           dept:"Police/Excise/Revenue",color:C.green, tip:"Know Pakistan Penal Code basics. Emphasise integrity, discipline, and community service."},
  {id:"fpsc",  label:"FPSC Assistant Director",  dept:"Federal Ministries",  color:C.purple, tip:"Research your chosen ministry. Show analytical thinking and knowledge of government structure."},
  {id:"ppsc_a",label:"PPSC Assistant",           dept:"Various Departments", color:C.gold,   tip:"Focus on computer skills, English communication, and office procedures."},
  {id:"rev",   label:"Naib Tehsildar / Patwari", dept:"Revenue Department",  color:"#fb923c", tip:"Know Revenue Act basics and land record systems. Show honesty and local knowledge."},
  {id:"forces",label:"Army / PAF Commission",    dept:"Armed Forces",        color:C.red,    tip:"Physical fitness is primary. Show leadership, discipline, and knowledge of current defence affairs."},
];

const ESSAY_TYPES = [
  {id:"css_essay",  label:"CSS Essay",               color:C.blue,   wordTarget:1200, desc:"Structured argument on social, political, or economic topics — CSS style"},
  {id:"precis",     label:"Precis Writing",           color:C.green,  wordTarget:200,  desc:"Compress a passage to one-third its length while preserving all key ideas"},
  {id:"ca_essay",   label:"Current Affairs Analysis", color:"#fb923c",wordTarget:600,  desc:"Analytical piece on a recent national or international development"},
  {id:"eng_comp",   label:"English Composition",     color:C.purple, wordTarget:400,  desc:"Short structured essay for PPSC or FPSC English paper"},
];

const LEADERBOARD = [
  {rank:1,name:"Waqas Ahmed",   city:"Lahore",    pts:12480,streak:62,acc:91,badge:"Gold"},
  {rank:2,name:"Ayesha Malik",  city:"Karachi",   pts:11920,streak:48,acc:89,badge:"Silver"},
  {rank:3,name:"Hamid Raza",    city:"Islamabad", pts:11450,streak:55,acc:87,badge:"Bronze"},
  {rank:4,name:"Saima Khan",    city:"Faisalabad",pts:10840,streak:39,acc:85,badge:""},
  {rank:5,name:"Ali Hassan",    city:"Multan",    pts:10230,streak:41,acc:84,badge:""},
  {rank:6,name:"Fatima Noor",   city:"Peshawar",  pts:9870, streak:30,acc:82,badge:""},
  {rank:7,name:"Usman Tariq",   city:"Quetta",    pts:9340, streak:28,acc:81,badge:""},
  {rank:8,name:"Maria Baig",    city:"Hyderabad", pts:7890, streak:15,acc:75,badge:""},
];

/* ─── AI HELPERS ─────────────────────────────────── */
async function aiCall(prompt, maxTok) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens: maxTok||1200,
      messages:[{role:"user",content:prompt}]
    })
  });
  const d = await res.json();
  return (d.content||[]).map(x=>x.text||"").join("");
}

async function genMCQs(topic, exam, count) {
  const prompt = `Generate exactly ${count} MCQs about "${topic}" for ${exam} exam in Pakistan.
Return ONLY a valid JSON array, no markdown, no explanation outside the array.
Format: [{"q":"question text","o":["A","B","C","D"],"a":0,"e":"explanation"}]
Rules: "a" is index 0-3 of correct answer. Match ${exam} difficulty. Include clear explanations.`;
  const raw = await aiCall(prompt, 2800);
  try {
    const clean = raw.replace(/```json/g,"").replace(/```/g,"").trim();
    const arr = JSON.parse(clean);
    if(Array.isArray(arr) && arr[0] && arr[0].q) return arr;
    return null;
  } catch(e) { return null; }
}

async function interviewTurn(postLabel, history, answer, qNum) {
  let prompt;
  if(history.length === 0) {
    prompt = `You are a formal interview panel conducting a ${postLabel} selection interview in Pakistan. Greet the candidate professionally in one sentence, then ask your FIRST interview question. Ask ONE question only.`;
  } else if(qNum > 6) {
    prompt = `You are the ${postLabel} interview panel. The candidate's last answer was: "${answer}"\n\nNow give the FINAL ASSESSMENT:\n1. One-sentence feedback on this last answer\n2. Overall Score: X/100\n3. Strong Points: 2-3 bullet points\n4. Areas to Improve: 2-3 bullet points\n5. Final Verdict: Selected / Recommended / Not Recommended\n\nBe constructive and honest.`;
  } else {
    prompt = `You are conducting a ${postLabel} interview. The candidate answered question ${qNum-1}: "${answer}"\n\n1. Give ONE sentence feedback on that answer.\n2. Ask question ${qNum} of 6 (a new, different question).\n\nBe professional. ONE new question only.`;
  }
  return aiCall(prompt, 800);
}

async function gradeEssay(typeLabel, topic, text, target) {
  const words = wc(text);
  const prompt = `You are a CSS examiner grading a ${typeLabel} on: "${topic}"

Essay (${words} words):
"""
${text}
"""

Return ONLY valid JSON with no markdown wrapping:
{"scores":{"content":{"score":0,"max":25,"feedback":""},"structure":{"score":0,"max":20,"feedback":""},"vocabulary":{"score":0,"max":20,"feedback":""},"arguments":{"score":0,"max":20,"feedback":""},"relevance":{"score":0,"max":15,"feedback":""}},"total":0,"grade":"","summary":"","strengths":["",""],"improvements":["",""],"wordCount":${words},"wordTarget":${target}}

Grade using Pakistani CSS standards. Be honest but constructive.`;
  const raw = await aiCall(prompt, 1500);
  try {
    const clean = raw.replace(/```json/g,"").replace(/```/g,"").trim();
    return JSON.parse(clean);
  } catch(e) { return null; }
}

/* ─── BUILD MOCK TEST ─────────────────────────────── */
function buildMock(pat) {
  const qs = [];
  pat.dist.forEach(({s, n}) => {
    const pool = shuffle([...(QB[s]||[])]);
    for(let i=0; i<n; i++) qs.push({...pool[i % pool.length], subject:s});
  });
  return shuffle(qs);
}

/* ─── STORAGE WRAPPER ─────────────────────────────── */
function storageGet(key, fallback) {
  try {
    return window.storage.get(key).then(r => r ? JSON.parse(r.value) : fallback).catch(() => {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
    });
  } catch(e) {
    return Promise.resolve(fallback);
  }
}
function storageSet(key, val) {
  try { window.storage.set(key, JSON.stringify(val)); } catch(e) {}
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

/* ═══════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════ */
export default function App() {
  /* navigation */
  const [page, setPage] = useState("home");

  /* quiz (static) */
  const [quiz, setQuiz] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const timerRef = useRef(null);

  /* mock test */
  const [mock, setMock] = useState(null);
  const mockTimerRef = useRef(null);

  /* AI quiz */
  const [aiTopic, setAiTopic]   = useState("");
  const [aiExam,  setAiExam]    = useState("PPSC");
  const [aiCount, setAiCount]   = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,  setAiError]  = useState("");
  const [aiQuiz,   setAiQuiz]   = useState(null);

  /* interview */
  const [intPost,    setIntPost]    = useState(null);
  const [intMsgs,    setIntMsgs]    = useState([]);
  const [intInput,   setIntInput]   = useState("");
  const [intLoading, setIntLoading] = useState(false);
  const [intQ,       setIntQ]       = useState(0);
  const [intDone,    setIntDone]    = useState(false);
  const intEndRef = useRef(null);

  /* essay */
  const [essType,    setEssType]    = useState(null);
  const [essTopic,   setEssTopic]   = useState("");
  const [essText,    setEssText]    = useState("");
  const [essResult,  setEssResult]  = useState(null);
  const [essLoading, setEssLoading] = useState(false);

  /* ZARB AI chat */
  const [chatOpen,    setChatOpen]    = useState(false);
  const [chatMsgs,    setChatMsgs]    = useState([{r:"ai", t:"Salaam! I'm ZARB AI — Pakistan's smartest exam tutor. I can generate fresh MCQs on any topic, help with interview prep, grade your essays, and answer any exam question in English or Urdu. Try asking me something!"}]);
  const [chatInput,   setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  /* global stats */
  const [stats, setStats] = useState({total:0,correct:0,streak:0,best:0,history:[]});
  const [bookmarks, setBookmarks] = useState([]);

  /* filters */
  const [pExam, setPExam] = useState("All");
  const [pYear, setPYear] = useState("All");
  const [paperModal, setPaperModal] = useState(null);

  /* load bookmarks */
  useEffect(() => {
    storageGet("pkp_bm",[]).then(v => setBookmarks(v));
  }, []);

  /* cleanup timers */
  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(mockTimerRef.current); }, []);

  /* scroll interview to bottom */
  useEffect(() => { intEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [intMsgs]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [chatMsgs]);

  /* ── bookmark helpers ── */
  const isBM = (q) => q && bookmarks.some(b => b.q === q.q);
  const toggleBM = (q) => {
    const exists = bookmarks.find(b => b.q === q.q);
    const updated = exists ? bookmarks.filter(b => b.q !== q.q) : [...bookmarks, {...q, savedAt: new Date().toLocaleDateString("en-PK")}];
    setBookmarks(updated);
    storageSet("pkp_bm", updated);
  };

  /* ── static quiz ── */
  const startQuiz = (subId) => {
    clearInterval(timerRef.current);
    const qs = shuffle(QB[subId]||[]).slice(0,10);
    setQuiz({sub:subId, qs, idx:0, ans:[], timer:0, done:false});
    setReviewing(false);
    setPage("quiz");
    timerRef.current = setInterval(() => setQuiz(p => p&&!p.done ? {...p, timer:p.timer+1} : p), 1000);
  };

  const answerQ = (ci) => {
    if(!quiz||quiz.done) return;
    const correct = ci === quiz.qs[quiz.idx].a;
    const newAns = [...quiz.ans, {ci, correct, q: quiz.qs[quiz.idx]}];
    const isLast = quiz.idx === quiz.qs.length-1;
    if(isLast) {
      clearInterval(timerRef.current);
      const nc = newAns.filter(x=>x.correct).length;
      setStats(p => ({ total:p.total+quiz.qs.length, correct:p.correct+nc, streak:correct?p.streak+1:0, best:Math.max(p.best,correct?p.streak+1:0), history:[...p.history,{sub:quiz.sub,sc:nc,tot:quiz.qs.length,time:quiz.timer+1,date:new Date().toLocaleDateString("en-PK")}] }));
      setQuiz({...quiz, idx:quiz.idx+1, ans:newAns, done:true});
    } else {
      setQuiz({...quiz, idx:quiz.idx+1, ans:newAns});
    }
  };

  /* ── mock test ── */
  const startMock = (pat) => {
    clearInterval(mockTimerRef.current);
    const qs = buildMock(pat);
    setMock({pat, qs, ans: new Array(qs.length).fill(null), idx:0, timer:pat.mins*60, done:false});
    setPage("mock_test");
    mockTimerRef.current = setInterval(() => setMock(p => {
      if(!p||p.done) return p;
      if(p.timer<=1) { clearInterval(mockTimerRef.current); return {...p,timer:0,done:true}; }
      return {...p, timer:p.timer-1};
    }), 1000);
  };

  const pickMockAns = (qi, ci) => setMock(p => { if(!p||p.done) return p; const a=[...p.ans]; a[qi]=ci; return {...p,ans:a}; });

  const submitMock = () => {
    clearInterval(mockTimerRef.current);
    if(!mock) return;
    const nc = mock.ans.filter((a,i)=>a===mock.qs[i].a).length;
    setStats(p => ({...p, total:p.total+mock.qs.length, correct:p.correct+nc, history:[...p.history,{sub:"mock:"+mock.pat.id,sc:nc,tot:mock.qs.length,time:mock.pat.mins*60-mock.timer,date:new Date().toLocaleDateString("en-PK")}]}));
    setMock(p => ({...p, done:true}));
  };

  /* ── AI quiz ── */
  const runAIQuiz = async () => {
    if(!aiTopic.trim()) return;
    setAiLoading(true); setAiError(""); setAiQuiz(null);
    const qs = await genMCQs(aiTopic.trim(), aiExam, aiCount).catch(()=>null);
    setAiLoading(false);
    if(!qs) { setAiError("Could not generate questions. Please try a more specific topic and try again."); return; }
    setAiQuiz({qs, idx:0, ans:[], done:false});
    setPage("ai_quiz_run");
  };

  const answerAI = (ci) => {
    if(!aiQuiz||aiQuiz.done) return;
    const q = aiQuiz.qs[aiQuiz.idx];
    const newAns = [...aiQuiz.ans, {ci, correct:ci===q.a, q}];
    const done = aiQuiz.idx===aiQuiz.qs.length-1;
    if(done) {
      const nc = newAns.filter(x=>x.correct).length;
      setStats(p => ({...p, total:p.total+aiQuiz.qs.length, correct:p.correct+nc, history:[...p.history,{sub:"ai:"+aiTopic,sc:nc,tot:aiQuiz.qs.length,time:0,date:new Date().toLocaleDateString("en-PK")}]}));
    }
    setAiQuiz({...aiQuiz, idx:aiQuiz.idx+1, ans:newAns, done});
  };

  /* ── interview ── */
  const startInterview = async (post) => {
    setIntPost(post); setIntMsgs([]); setIntInput(""); setIntQ(0); setIntDone(false);
    setIntLoading(true); setPage("interview_live");
    const reply = await aiCall(`You are a formal interview panel conducting a ${post.label} selection interview in Pakistan. Greet the candidate professionally in one sentence, then ask your FIRST interview question. Ask ONE question only.`, 600).catch(()=>"Welcome to your interview. Please introduce yourself.");
    setIntMsgs([{r:"ai",t:reply}]);
    setIntLoading(false);
    setIntQ(1);
  };

  const sendIntAns = async () => {
    if(!intInput.trim()||intLoading) return;
    const ans = intInput.trim(); setIntInput("");
    const updated = [...intMsgs, {r:"user",t:ans}];
    setIntMsgs(updated);
    const newQ = intQ+1;
    setIntLoading(true);
    const reply = await interviewTurn(intPost.label, updated, ans, newQ).catch(()=>"Thank you for your answer. Let us continue.");
    setIntMsgs(m => [...m, {r:"ai",t:reply}]);
    setIntLoading(false);
    if(newQ>6) setIntDone(true);
    else setIntQ(newQ);
  };

  /* ── essay ── */
  const submitEssay = async () => {
    if(!essText.trim()||wc(essText)<50) return;
    setEssLoading(true); setEssResult(null);
    const res = await gradeEssay(essType.label, essTopic||"General Topic", essText, essType.wordTarget).catch(()=>null);
    setEssLoading(false);
    setEssResult(res);
  };

  /* ── ZARB AI chat ── */
  const sendChat = async () => {
    if(!chatInput.trim()||chatLoading) return;
    const msg = chatInput.trim(); setChatInput("");
    setChatMsgs(m => [...m, {r:"user",t:msg}]);
    setChatLoading(true);
    const reply = await aiCall(`You are ZARB AI — Pakistan's best exam tutor for PPSC, CSS, FPSC, NTS. Answer clearly and concisely. Be encouraging. Use Urdu phrases naturally where helpful. Student question: ${msg}`, 1000).catch(()=>"Connection issue. Please try again.");
    setChatMsgs(m => [...m, {r:"ai",t:reply}]);
    setChatLoading(false);
  };

  /* ══════════════════════════════════════════════
     RENDER HELPERS
  ══════════════════════════════════════════════ */

  /* shared progress bar */
  const ProgBar = ({val, max, color}) => (
    <div style={{height:4,background:C.s2,borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",width:((val/max)*100)+"%",background:"linear-gradient(90deg,"+C.g2+","+(color||C.green)+")",borderRadius:2,transition:"width .3s"}}/>
    </div>
  );

  /* answer option button for quizzes */
  const OptBtn = ({label, text, onClick, selected, correct, wrong}) => {
    let bg=C.s1, col=C.txt, brd=C.line;
    if(selected) { bg=C.green+"22"; col=C.green; brd=C.green; }
    if(correct)  { bg=C.green+"22"; col=C.green; brd=C.green; }
    if(wrong)    { bg=C.red+"18";   col=C.red;   brd=C.red;   }
    return (
      <button onClick={onClick} className="opt-hover btn-press" style={{background:bg,border:"1px solid "+brd,borderRadius:12,padding:"13px 17px",textAlign:"left",fontSize:14,color:col,display:"flex",alignItems:"center",gap:12,width:"100%",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
        <span style={{width:27,height:27,borderRadius:7,background:selected||correct?"linear-gradient(135deg,"+C.g2+","+C.green+")":(wrong?C.red+"33":C.s2),color:selected||correct?"#000":(wrong?C.red:C.dim),border:"1px solid "+(selected||correct?C.green:(wrong?C.red:C.line)),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>
          {label}
        </span>
        {text}
        {correct && <span style={{marginLeft:"auto",fontSize:10,color:C.green,fontWeight:700}}>Correct</span>}
        {wrong   && <span style={{marginLeft:"auto",fontSize:10,color:C.red,  fontWeight:700}}>Your answer</span>}
      </button>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: HOME
  ═══════════════════════════════════════════════ */
  const renderHome = () => {
    const TICKER_TEXT = " · AI generates unlimited MCQs on ANY topic · AI Mock Interview for CSS, PPSC, FPSC · Essay Grader marks out of 100 · 5x cheaper than Quizzera · Free tier: 250 MCQs/day · Pakistan's most complete exam platform";
    const tickerFull = TICKER_TEXT + TICKER_TEXT;
    const features = [
      {icon:"AI",title:"AI Quiz Generator",desc:"Type any topic — Mughal Empire, Criminal Law, Newton's Laws — AI instantly creates fresh, accurate MCQs. Unlimited. Never repeats.",color:C.green,pg:"ai_quiz",cta:"Generate Now"},
      {icon:"IV",title:"AI Mock Interview",desc:"Practice CSS Viva, PPSC Inspector, FPSC interviews. AI acts as your panel, asks real questions, and evaluates every answer.",color:C.purple,pg:"interview",cta:"Start Interview"},
      {icon:"ES",title:"Essay Grader",desc:"Write CSS essays, precis, or current affairs analysis. AI grades on Content, Structure, Vocabulary, Arguments, and Relevance.",color:C.blue,pg:"essay",cta:"Write and Grade"},
      {icon:"MT",title:"Unlimited Mock Tests",desc:"10 real exam patterns — PPSC, CSS MPT, FPSC, NTS. Exact timing, real subject distribution, negative marking simulation for CSS.",color:C.gold,pg:"mock",cta:"Start Mock Test"},
    ];
    return (
      <div className="anim-up">
        {/* Hero */}
        <div style={{background:"linear-gradient(170deg,#091810,#060a09)",borderBottom:"1px solid "+C.line,padding:"52px 20px 44px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 55% at 50% 0%,rgba(34,197,94,.1) 0%,transparent 70%)"}}/>
          <div style={{maxWidth:660,margin:"0 auto",position:"relative"}}>
            <div style={pill(C.green)}>Pakistan's Smartest Exam Platform — Powered by AI</div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:"clamp(26px,5vw,52px)",fontWeight:900,color:"#f0faf4",lineHeight:1.1,margin:"18px 0 14px",letterSpacing:"-1.5px"}}>
              AI Generates Questions<br/><span style={{color:C.green}}>On Any Topic. Unlimited.</span>
            </h1>
            <p style={{fontSize:14,color:C.sub,lineHeight:1.85,marginBottom:28}}>
              No pre-written MCQ limits — type any topic, AI creates fresh questions instantly.<br/>
              Mock Tests · Interview Prep · Essay Grader · PPSC · CSS · FPSC · NTS
            </p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn-press" onClick={()=>setPage("ai_quiz")} style={gbtn({padding:"13px 28px",fontSize:14,boxShadow:"0 4px 28px rgba(34,197,94,.35)"})}>Generate AI Quiz</button>
              <button className="btn-press" onClick={()=>setPage("interview")} style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",border:"none",borderRadius:11,padding:"13px 24px",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Mock Interview</button>
              <button className="btn-press" onClick={()=>setPage("essay")} style={obtn(C.blue,{padding:"13px 20px",fontSize:14})}>Essay Practice</button>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div style={{background:C.s2,borderBottom:"1px solid "+C.line,padding:"7px 0",overflow:"hidden"}}>
          <div className="ticker-track" style={{fontSize:11,color:C.sub}}>
            {tickerFull}
          </div>
        </div>

        {/* Stats row */}
        <div style={{background:C.s1,borderBottom:"1px solid "+C.line,display:"flex",justifyContent:"center",flexWrap:"wrap"}}>
          {["Unlimited MCQs via AI","10 Mock Test Patterns","8 Subjects Covered","100% Free to Start"].map((v,i) => (
            <div key={v} style={{textAlign:"center",padding:"14px 28px",borderRight:i<3?"1px solid "+C.line:"none"}}>
              <div style={{fontSize:11,color:C.sub,fontWeight:500}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{maxWidth:1140,margin:"0 auto",padding:"36px 18px"}}>
          {/* Feature cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:14,marginBottom:36}}>
            {features.map(f => (
              <div key={f.title} className="hoverlift" onClick={()=>setPage(f.pg)} style={card({padding:24,border:"1px solid "+f.color+"22"})}>
                <div style={{width:44,height:44,background:f.color+"20",border:"1px solid "+f.color+"33",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,fontSize:11,fontWeight:800,color:f.color}}>{f.icon}</div>
                <div style={{fontSize:15,fontWeight:800,color:C.txt,marginBottom:8}}>{f.title}</div>
                <div style={{fontSize:12,color:C.sub,lineHeight:1.75,marginBottom:18}}>{f.desc}</div>
                <div style={{background:f.color,color:"#000",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:900,display:"inline-block"}}>{f.cta} →</div>
              </div>
            ))}
          </div>

          {/* Quick practice */}
          <div style={{fontSize:18,fontWeight:800,color:C.txt,fontFamily:"'Sora',sans-serif",marginBottom:14}}>Quick Practice — Static MCQs</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:10}}>
            {SUBS.map(sub => (
              <div key={sub.id} className="hoverlift" onClick={()=>startQuiz(sub.id)} style={card({padding:14,display:"flex",alignItems:"center",gap:11})}>
                <div style={{width:38,height:38,background:sub.color+"1e",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:sub.color,flexShrink:0}}>{sub.icon}</div>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:C.txt}}>{sub.name}</div>
                  <div style={{fontSize:11,color:sub.color,marginTop:2}}>{(QB[sub.id]||[]).length} Qs →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: AI QUIZ CONFIG
  ═══════════════════════════════════════════════ */
  const renderAIQuizConfig = () => {
    const suggestions = ["Mughal Empire","Criminal Procedure Code","Pakistan Constitutional History","Newton's Laws of Motion","Indus Water Treaty","CPEC Projects","Islamic Banking","Current Affairs 2024","Pakistan Economy","World Geography"];
    return (
      <div style={{maxWidth:780,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.txt,marginBottom:6}}>AI Quiz Generator</h1>
        <p style={{fontSize:13,color:C.sub,marginBottom:20}}>Type any topic — AI instantly creates fresh, accurate MCQs tailored to your exam. Unlimited topics, unlimited attempts.</p>

        <div style={{background:C.green+"10",border:"1px solid "+C.green+"33",borderRadius:12,padding:14,marginBottom:22,fontSize:12,color:C.sub,lineHeight:1.7}}>
          <strong style={{color:C.green}}>How this works:</strong> You type a topic (e.g. "Mughal Empire"), choose your exam board and number of questions, and ZARB AI generates a completely fresh quiz in about 10 seconds. Unlike Quizzera's limited static bank, this is truly unlimited.
        </div>

        <div style={card({padding:26})}>
          <label style={{fontSize:12,color:C.sub,display:"block",marginBottom:7,fontWeight:700}}>Topic (be specific for better questions)</label>
          <input value={aiTopic} onChange={e=>setAiTopic(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") runAIQuiz();}}
            placeholder="e.g. Mughal Empire, Criminal Procedure Code, Newton's Laws, Pakistan Water Crisis..."
            style={{width:"100%",background:C.s2,border:"1px solid "+C.line,borderRadius:10,padding:"12px 14px",fontSize:13,color:C.txt,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:18}}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
            <div>
              <label style={{fontSize:12,color:C.sub,display:"block",marginBottom:7,fontWeight:700}}>Exam Board</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["PPSC","CSS","FPSC","NTS","KPPSC","Any"].map(e => (
                  <button key={e} className="btn-press" onClick={()=>setAiExam(e)} style={{background:aiExam===e?C.green+"22":C.s2,color:aiExam===e?C.green:C.sub,border:"1px solid "+(aiExam===e?C.green+"44":C.line),borderRadius:8,padding:"5px 12px",fontSize:11.5,fontWeight:aiExam===e?700:400,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:12,color:C.sub,display:"block",marginBottom:7,fontWeight:700}}>Number of Questions</label>
              <div style={{display:"flex",gap:6}}>
                {[5,10,15,20].map(n => (
                  <button key={n} className="btn-press" onClick={()=>setAiCount(n)} style={{background:aiCount===n?C.green+"22":C.s2,color:aiCount===n?C.green:C.sub,border:"1px solid "+(aiCount===n?C.green+"44":C.line),borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:aiCount===n?700:400,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{marginBottom:18,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
            <span style={{fontSize:11,color:C.dim}}>Try:</span>
            {suggestions.map(s => (
              <button key={s} className="btn-press" onClick={()=>setAiTopic(s)} style={{background:C.green+"12",color:C.green,border:"1px solid "+C.green+"33",borderRadius:100,padding:"3px 10px",fontSize:11,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                {s}
              </button>
            ))}
          </div>

          {aiError && <div style={{background:C.red+"18",border:"1px solid "+C.red+"33",borderRadius:9,padding:"10px 14px",fontSize:12,color:C.red,marginBottom:14}}>{aiError}</div>}

          <button className="btn-press" onClick={runAIQuiz} disabled={!aiTopic.trim()||aiLoading}
            style={gbtn({width:"100%",padding:"13px",fontSize:14,opacity:(!aiTopic.trim()||aiLoading)?.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:9})}>
            {aiLoading ? (
              <>
                <div style={{width:16,height:16,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",animation:"spin360 .7s linear infinite"}}/>
                <span>Generating {aiCount} questions on "{aiTopic}"...</span>
              </>
            ) : (
              <span>Generate {aiCount} Questions on "{aiTopic||"your topic"}"</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: AI QUIZ RUN
  ═══════════════════════════════════════════════ */
  const renderAIQuizRun = () => {
    if(!aiQuiz) return null;
    if(!aiQuiz.done) {
      const q = aiQuiz.qs[aiQuiz.idx];
      return (
        <div style={{maxWidth:760,margin:"0 auto",padding:"32px 18px"}} className="anim-up">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:13,color:C.sub}}>Topic: <strong style={{color:C.txt}}>{aiTopic}</strong></span>
            <span style={{fontSize:12,color:C.sub}}>Q<strong style={{color:C.txt}}>{aiQuiz.idx+1}</strong>/{aiQuiz.qs.length}</span>
          </div>
          <ProgBar val={aiQuiz.idx} max={aiQuiz.qs.length}/>
          <div style={card({padding:"24px 26px",margin:"18px 0"})}>
            <div style={{fontSize:11,color:C.dim,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>Q{aiQuiz.idx+1}</div>
            <div style={{fontSize:18,fontWeight:600,color:C.txt,lineHeight:1.65}}>{q.q}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {q.o.map((opt,i) => <OptBtn key={i} label={String.fromCharCode(65+i)} text={opt} onClick={()=>answerAI(i)}/>)}
          </div>
        </div>
      );
    }
    /* AI quiz results */
    const sc = aiQuiz.ans.filter(x=>x.correct).length;
    const tot = aiQuiz.qs.length;
    const col = scCol(sc,tot);
    return (
      <div style={{maxWidth:760,margin:"0 auto",padding:"32px 18px"}} className="anim-up">
        <div style={card({padding:36,textAlign:"center",marginBottom:20,border:"1px solid "+col+"44"})}>
          <div style={{fontSize:54,fontWeight:900,color:col,fontFamily:"'Sora',sans-serif"}}>{Math.round(sc/tot*100)}%</div>
          <div style={{fontSize:18,color:C.txt,fontWeight:700,marginTop:8}}>{sc}/{tot} Correct — AI Quiz: "{aiTopic}"</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          {aiQuiz.ans.map((a,i) => (
            <div key={i} style={card({padding:16,border:"1px solid "+(a.correct?C.green+"33":C.red+"33")})}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:15}}>{a.correct?"✓":"✗"}</span>
                <button className="btn-press" onClick={()=>toggleBM(a.q)} style={obtn(isBM(a.q)?C.gold:C.dim,{padding:"3px 9px",fontSize:10})}>
                  {isBM(a.q)?"Saved":"Save"}
                </button>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:C.txt,marginBottom:9}}>{a.q.q}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                <span style={pill(C.green)}>Correct: {a.q.o[a.q.a]}</span>
                {!a.correct && <span style={pill(C.red)}>You answered: {a.q.o[a.ci]}</span>}
              </div>
              <div style={{background:C.gold+"12",border:"1px solid "+C.gold+"30",borderRadius:8,padding:"8px 12px",fontSize:11,color:C.gold,lineHeight:1.6}}>
                Explanation: {a.q.e}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-press" onClick={runAIQuiz} style={gbtn({padding:"12px 24px",fontSize:13})}>Generate New Questions</button>
          <button className="btn-press" onClick={()=>setPage("ai_quiz")} style={obtn(C.green,{padding:"12px 20px",fontSize:13})}>Try Different Topic</button>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: INTERVIEW SELECTION
  ═══════════════════════════════════════════════ */
  const renderInterview = () => (
    <div style={{maxWidth:900,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.txt,marginBottom:6}}>AI Mock Interview</h1>
      <p style={{fontSize:13,color:C.sub,marginBottom:10}}>Practice with a real AI interview panel. 6 questions, real-time feedback, final score with detailed assessment.</p>
      <div style={{background:"#7c3aed18",border:"1px solid #7c3aed33",borderRadius:12,padding:14,marginBottom:26,fontSize:12,color:"#c4b5fd",lineHeight:1.7}}>
        Select your post below. The AI will conduct a 6-question interview, give feedback on each answer, and provide a final score with strengths and areas to improve — just like a real selection board.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
        {INT_POSTS.map(p => (
          <div key={p.id} className="hoverlift" style={card({padding:22,border:"1px solid "+p.color+"22"})}>
            <div style={{fontSize:14,fontWeight:800,color:C.txt,marginBottom:4}}>{p.label}</div>
            <div style={{fontSize:11,color:C.sub,marginBottom:12}}>{p.dept}</div>
            <div style={{background:C.s2,borderRadius:8,padding:"9px 12px",fontSize:11,color:C.sub,lineHeight:1.6,marginBottom:16,borderLeft:"3px solid "+p.color}}>
              Tip: {p.tip}
            </div>
            <button className="btn-press" onClick={()=>startInterview(p)} style={{width:"100%",background:p.color,color:"#000",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Start Interview
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     PAGE: INTERVIEW LIVE
  ═══════════════════════════════════════════════ */
  const renderInterviewLive = () => (
    <div style={{maxWidth:700,margin:"0 auto",padding:"28px 18px"}} className="anim-up">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase"}}>Interview Simulation</div>
          <div style={{fontSize:15,fontWeight:800,color:C.txt}}>{intPost ? intPost.label : ""}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={card({padding:"5px 13px",fontSize:12,color:C.sub})}>Q {intQ}/6</div>
          {intDone && <div style={{...pill(C.green),fontSize:12,fontWeight:700}}>Complete</div>}
        </div>
      </div>

      <div style={{height:4,background:C.s2,borderRadius:2,marginBottom:18,overflow:"hidden"}}>
        <div style={{height:"100%",width:Math.min(100,(intQ/6)*100)+"%",background:"linear-gradient(90deg,#7c3aed,#a78bfa)",borderRadius:2,transition:"width .4s"}}/>
      </div>

      {/* Chat window */}
      <div style={card({overflow:"hidden",marginBottom:14})}>
        <div style={{background:"linear-gradient(135deg,#7c3aed22,#4f46e522)",borderBottom:"1px solid "+C.line,padding:"11px 16px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>IV</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.txt}}>Interview Panel</div>
            <div style={{fontSize:10,color:C.sub}}>AI-powered · 6 questions · Real-time feedback</div>
          </div>
        </div>
        <div style={{height:360,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
          {intMsgs.map((m,i) => (
            <div key={i} className="msg-in" style={{display:"flex",justifyContent:m.r==="user"?"flex-end":"flex-start",gap:8}}>
              {m.r==="ai" && <div style={{width:26,height:26,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0,alignSelf:"flex-end"}}>IV</div>}
              <div style={{maxWidth:"85%",background:m.r==="user"?C.green+"22":C.s2,border:"1px solid "+(m.r==="user"?C.green+"33":C.line),borderRadius:m.r==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"11px 14px",fontSize:13,color:C.txt,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                {m.t}
              </div>
            </div>
          ))}
          {intLoading && (
            <div style={{display:"flex",gap:8}}>
              <div style={{width:26,height:26,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff"}}>IV</div>
              <div style={{background:C.s2,border:"1px solid "+C.line,borderRadius:"14px 14px 14px 4px",padding:"11px 14px",display:"flex",gap:5}}>
                <div className="dot-blink" style={{animationDelay:"0s"}}/>
                <div className="dot-blink" style={{animationDelay:".2s"}}/>
                <div className="dot-blink" style={{animationDelay:".4s"}}/>
              </div>
            </div>
          )}
          <div ref={intEndRef}/>
        </div>
      </div>

      {intDone ? (
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-press" onClick={()=>startInterview(intPost)} style={gbtn({padding:"12px 24px",fontSize:13})}>Retake Interview</button>
          <button className="btn-press" onClick={()=>setPage("interview")} style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",border:"none",borderRadius:11,padding:"12px 22px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Try Different Post</button>
        </div>
      ) : (
        <div style={{display:"flex",gap:8}}>
          <textarea value={intInput} onChange={e=>setIntInput(e.target.value)}
            onKeyDown={e=>{
              if(e.key==="Enter" && !e.shiftKey) {
                e.preventDefault();
                sendIntAns();
              }
            }}
            placeholder="Type your answer here... (Enter to send, Shift+Enter for new line)"
            rows={3}
            style={{flex:1,background:C.s1,border:"1px solid "+C.line,borderRadius:11,padding:"11px 14px",fontSize:13,color:C.txt,outline:"none",resize:"none",fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1.6}}/>
          <button className="btn-press" onClick={sendIntAns} disabled={!intInput.trim()||intLoading}
            style={{background:(!intInput.trim()||intLoading)?"#4f46e530":"linear-gradient(135deg,#7c3aed,#4f46e5)",color:(!intInput.trim()||intLoading)?"#6d5aad":"#fff",border:"none",borderRadius:11,width:46,cursor:(!intInput.trim()||intLoading)?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {intLoading ? <div style={{width:16,height:16,border:"2px solid #a78bfa",borderTopColor:"transparent",borderRadius:"50%",animation:"spin360 .7s linear infinite"}}/> : "Send"}
          </button>
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════
     PAGE: ESSAY
  ═══════════════════════════════════════════════ */
  const renderEssay = () => {
    if(!essType) {
      return (
        <div style={{maxWidth:900,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
          <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.txt,marginBottom:6}}>Essay and Writing Practice</h1>
          <p style={{fontSize:13,color:C.sub,marginBottom:10}}>Write essays, precis, and analysis — ZARB AI grades them like a real CSS examiner.</p>
          <div style={{background:C.blue+"12",border:"1px solid "+C.blue+"33",borderRadius:12,padding:13,marginBottom:26,fontSize:12,color:"#93c5fd",lineHeight:1.7}}>
            AI grades on 5 criteria: Content (25) + Structure (20) + Vocabulary (20) + Arguments (20) + Relevance (15) = 100 marks total. Get detailed feedback on every criterion.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
            {ESSAY_TYPES.map(et => (
              <div key={et.id} className="hoverlift" onClick={()=>{setEssType(et);setEssText("");setEssTopic("");setEssResult(null);}} style={card({padding:24,border:"1px solid "+et.color+"22"})}>
                <div style={{fontSize:14,fontWeight:800,color:C.txt,marginBottom:6}}>{et.label}</div>
                <div style={{fontSize:12,color:C.sub,marginBottom:14,lineHeight:1.65}}>{et.desc}</div>
                <div style={pill(et.color)}>Target: ~{et.wordTarget} words</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if(essResult) {
      const total = essResult.total || 0;
      const col = scCol(total,100);
      return (
        <div style={{maxWidth:900,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:C.txt}}>Essay Grading Report</h2>
            <button className="btn-press" onClick={()=>setEssResult(null)} style={obtn(C.sub,{padding:"6px 14px",fontSize:11})}>Edit Essay</button>
          </div>

          <div style={card({padding:28,textAlign:"center",marginBottom:18,border:"1px solid "+col+"44"})}>
            <div style={{fontSize:54,fontWeight:900,color:col,fontFamily:"'Sora',sans-serif"}}>{total}/100</div>
            <div style={{fontSize:19,color:C.txt,fontWeight:700,marginTop:8}}>{essResult.grade||""}</div>
            <div style={{fontSize:13,color:C.sub,marginTop:6,maxWidth:480,margin:"8px auto 0",lineHeight:1.6}}>{essResult.summary||""}</div>
            <div style={{fontSize:11,color:C.dim,marginTop:10}}>{essResult.wordCount||0} words written — Target: {essResult.wordTarget||0}</div>
          </div>

          <div style={card({padding:22,marginBottom:16})}>
            <div style={{fontSize:14,fontWeight:700,color:C.txt,marginBottom:14}}>Marks Breakdown</div>
            {Object.entries(essResult.scores||{}).map(([key,val]) => {
              const sc = val.score||0;
              const mx = val.max||1;
              const pc = (sc/mx)*100;
              const cc = scCol(sc,mx);
              return (
                <div key={key} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,color:C.txt,fontWeight:600,textTransform:"capitalize"}}>{key}</span>
                    <span style={{fontSize:13,fontWeight:900,color:cc,fontFamily:"'Sora',sans-serif"}}>{sc}/{mx}</span>
                  </div>
                  <div style={{height:6,background:C.s2,borderRadius:3,overflow:"hidden",marginBottom:5}}>
                    <div style={{width:pc+"%",height:"100%",background:cc,borderRadius:3,transition:"width 1s ease"}}/>
                  </div>
                  <div style={{fontSize:11,color:C.sub,lineHeight:1.5}}>{val.feedback||""}</div>
                </div>
              );
            })}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
            <div style={card({padding:18,border:"1px solid "+C.green+"33"})}>
              <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:10}}>Strengths</div>
              {(essResult.strengths||[]).map((s,i) => <div key={i} style={{fontSize:12,color:C.sub,marginBottom:6,display:"flex",gap:7}}><span style={{color:C.green,flexShrink:0}}>+</span>{s}</div>)}
            </div>
            <div style={card({padding:18,border:"1px solid "+C.gold+"33"})}>
              <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:10}}>Improvements Needed</div>
              {(essResult.improvements||[]).map((s,i) => <div key={i} style={{fontSize:12,color:C.sub,marginBottom:6,display:"flex",gap:7}}><span style={{color:C.gold,flexShrink:0}}>→</span>{s}</div>)}
            </div>
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-press" onClick={()=>setEssResult(null)} style={gbtn({padding:"12px 24px",fontSize:13})}>Revise and Resubmit</button>
            <button className="btn-press" onClick={()=>{setEssType(null);setEssResult(null);}} style={obtn(C.blue,{padding:"12px 20px",fontSize:13})}>Try Different Type</button>
          </div>
        </div>
      );
    }

    const words = wc(essText);
    const wordOk = words >= essType.wordTarget * 0.9;
    const wordOver = words > essType.wordTarget * 1.1;
    const wordColor = wordOver ? C.red : wordOk ? C.green : C.sub;

    return (
      <div style={{maxWidth:900,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}>
          <div>
            <button className="btn-press" onClick={()=>setEssType(null)} style={obtn(C.sub,{padding:"5px 12px",fontSize:11,marginBottom:8})}>Back</button>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:900,color:C.txt}}>{essType.label}</h2>
            <div style={{fontSize:12,color:C.sub,marginTop:3}}>Target: ~{essType.wordTarget} words — AI graded out of 100</div>
          </div>
          <div style={{background:C.s2,border:"1px solid "+C.line,borderRadius:9,padding:"7px 14px",fontSize:13,color:wordColor,fontWeight:700}}>
            {words} / {essType.wordTarget} words
          </div>
        </div>

        <div style={card({padding:20,marginBottom:14})}>
          <input value={essTopic} onChange={e=>setEssTopic(e.target.value)}
            placeholder="Essay topic — e.g. Climate Change and Pakistan, Role of Youth in National Development..."
            style={{width:"100%",background:C.s2,border:"1px solid "+C.line,borderRadius:9,padding:"10px 13px",fontSize:13,color:C.txt,outline:"none",marginBottom:14,fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          <textarea value={essText} onChange={e=>setEssText(e.target.value)} rows={14}
            placeholder={"Write your "+essType.label+" here...\n\nFor CSS Essay: Include introduction, clear thesis, body paragraphs with arguments, and conclusion.\nFor Precis: Compress the passage to about one-third length.\nFor Current Affairs: Background, analysis, and your perspective."}
            style={{width:"100%",background:C.s2,border:"1px solid "+C.line,borderRadius:9,padding:"12px 14px",fontSize:13,color:C.txt,outline:"none",resize:"vertical",fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1.85}}/>
        </div>

        <button className="btn-press" onClick={submitEssay} disabled={words<50||essLoading}
          style={gbtn({width:"100%",padding:"14px",fontSize:14,opacity:(words<50||essLoading)?.6:1,display:"flex",alignItems:"center",justifyContent:"center",gap:9})}>
          {essLoading ? (
            <>
              <div style={{width:16,height:16,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",animation:"spin360 .7s linear infinite"}}/>
              <span>ZARB AI is grading your essay...</span>
            </>
          ) : "Submit for AI Grading"}
        </button>
        {words < 50 && <div style={{fontSize:11,color:C.dim,textAlign:"center",marginTop:8}}>Write at least 50 words to submit.</div>}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: MOCK CONFIG
  ═══════════════════════════════════════════════ */
  const renderMockConfig = () => (
    <div style={{maxWidth:900,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.txt,marginBottom:6}}>Unlimited Mock Tests</h1>
      <p style={{fontSize:13,color:C.sub,marginBottom:28}}>Real exam patterns · Real timing · Negative marking for CSS · Attempt as many times as you want</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {PATTERNS.map(pat => (
          <div key={pat.id} className="hoverlift" onClick={()=>startMock(pat)} style={card({padding:22})}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"flex-start"}}>
              <div>
                <span style={pill(C.sub)}>{pat.exam}</span>
                <div style={{fontSize:15,fontWeight:800,color:C.txt,marginTop:8,lineHeight:1.3}}>{pat.label}</div>
              </div>
              {pat.neg && <span style={{background:C.red+"18",color:C.red,border:"1px solid "+C.red+"33",borderRadius:7,padding:"3px 9px",fontSize:11,fontWeight:700,flexShrink:0,marginLeft:8}}>Neg. Marking</span>}
            </div>
            <div style={{display:"flex",gap:20,marginBottom:14}}>
              <div>
                <div style={{fontSize:22,fontWeight:900,color:C.green,fontFamily:"'Sora',sans-serif"}}>{pat.totalQ}</div>
                <div style={{fontSize:10,color:C.dim,textTransform:"uppercase"}}>Questions</div>
              </div>
              <div>
                <div style={{fontSize:22,fontWeight:900,color:C.gold,fontFamily:"'Sora',sans-serif"}}>{pat.mins}</div>
                <div style={{fontSize:10,color:C.dim,textTransform:"uppercase"}}>Minutes</div>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              {pat.dist.map(d => {
                const sub = SUBS.find(s=>s.id===d.s);
                const pct = (d.n/pat.totalQ)*100;
                return (
                  <div key={d.s} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                    <span style={{fontSize:10,color:C.sub,width:70,flexShrink:0}}>{sub?sub.name.split(" ")[0]:d.s}</span>
                    <div style={{flex:1,height:4,background:C.s2,borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:pct+"%",height:"100%",background:(sub&&sub.color)||C.green,borderRadius:2}}/>
                    </div>
                    <span style={{fontSize:10,color:(sub&&sub.color)||C.green,fontWeight:700,width:18,textAlign:"right"}}>{d.n}</span>
                  </div>
                );
              })}
            </div>
            <button className="btn-press" style={gbtn({width:"100%",textAlign:"center",padding:"10px",fontSize:13})}>Start Test</button>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     PAGE: MOCK TEST ENGINE
  ═══════════════════════════════════════════════ */
  const renderMockTest = () => {
    if(!mock||mock.done) return null;
    const answered = mock.ans.filter(a=>a!==null).length;
    const q = mock.qs[mock.idx];
    const timerRed = mock.timer < 300;
    return (
      <div style={{maxWidth:860,margin:"0 auto",padding:"24px 18px"}} className="anim-up">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:11,color:C.sub,fontWeight:700,textTransform:"uppercase"}}>{mock.pat.exam}</div>
            <div style={{fontSize:15,fontWeight:800,color:C.txt}}>{mock.pat.label}</div>
          </div>
          <div style={{display:"flex",gap:9,alignItems:"center"}}>
            <div style={{background:timerRed?C.red+"20":C.s2,border:"1px solid "+(timerRed?C.red+"44":C.line),borderRadius:9,padding:"7px 16px",fontSize:17,fontWeight:900,color:timerRed?C.red:C.green,fontFamily:"'Sora',sans-serif"}}>
              {fmtTime(mock.timer)}
            </div>
            <button className="btn-press" onClick={submitMock} style={obtn(C.red,{padding:"7px 14px",fontSize:12})}>Submit</button>
          </div>
        </div>

        <ProgBar val={answered} max={mock.qs.length}/>
        <div style={{fontSize:11,color:C.sub,margin:"10px 0 16px"}}>
          <span style={{color:C.green,fontWeight:700}}>{answered}</span> of {mock.qs.length} answered — Q{mock.idx+1}
        </div>

        <div style={card({padding:24,marginBottom:16})}>
          <div style={{fontSize:11,color:C.dim,marginBottom:7}}>Q{mock.idx+1} of {mock.qs.length}</div>
          <div style={{fontSize:17,fontWeight:600,color:C.txt,lineHeight:1.65}}>{q.q}</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
          {q.o.map((opt,i) => (
            <OptBtn key={i} label={String.fromCharCode(65+i)} text={opt}
              onClick={()=>pickMockAns(mock.idx,i)} selected={mock.ans[mock.idx]===i}/>
          ))}
        </div>

        <div style={{display:"flex",gap:8,justifyContent:"space-between",flexWrap:"wrap"}}>
          <button className="btn-press" onClick={()=>setMock(p=>({...p,idx:Math.max(0,p.idx-1)}))} style={obtn(C.sub,{opacity:mock.idx===0?.4:1})}>Prev</button>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center",flex:1,maxWidth:400,margin:"0 auto"}}>
            {mock.qs.map((_,i) => {
              const isAns = mock.ans[i]!==null;
              const isCur = mock.idx===i;
              return (
                <button key={i} className="btn-press" onClick={()=>setMock(p=>({...p,idx:i}))}
                  style={{width:24,height:24,borderRadius:5,background:isAns?C.green+"33":(isCur?"#1a2e20":C.s2),border:"1px solid "+(isCur?C.green:(isAns?C.green+"44":C.line)),color:isCur?C.green:(isAns?C.green:C.dim),fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  {i+1}
                </button>
              );
            })}
          </div>
          <button className="btn-press" onClick={()=>setMock(p=>({...p,idx:Math.min(p.qs.length-1,p.idx+1)}))} style={gbtn({padding:"9px 18px",fontSize:12})}>Next</button>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: MOCK RESULTS
  ═══════════════════════════════════════════════ */
  const renderMockResults = () => {
    if(!mock||!mock.done) return null;
    const correct = mock.ans.filter((a,i)=>a===mock.qs[i].a).length;
    const tot = mock.qs.length;
    const pct = Math.round(correct/tot*100);
    const col = scCol(correct,tot);
    return (
      <div style={{maxWidth:800,margin:"0 auto",padding:"32px 18px"}} className="anim-up">
        <div style={card({padding:36,textAlign:"center",marginBottom:20,border:"1px solid "+col+"44"})}>
          <div style={{fontSize:54,fontWeight:900,color:col,fontFamily:"'Sora',sans-serif"}}>{pct}%</div>
          <div style={{fontSize:20,color:C.txt,fontWeight:700,marginTop:8}}>{correct}/{tot} — {mock.pat.label}</div>
        </div>

        <div style={card({padding:20,marginBottom:16})}>
          <div style={{fontSize:14,fontWeight:700,color:C.txt,marginBottom:14}}>Subject Breakdown</div>
          {mock.pat.dist.map(d => {
            const sqs = mock.qs.map((q,i)=>({...q,qi:i})).filter(q=>q.subject===d.s);
            const sc = sqs.filter(q=>mock.ans[q.qi]===q.a).length;
            const sub = SUBS.find(s=>s.id===d.s);
            const cc = scCol(sc,sqs.length||1);
            return (
              <div key={d.s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                <span style={{fontSize:10,color:C.sub,width:90,flexShrink:0}}>{sub?sub.name.split(" ")[0]:d.s}</span>
                <div style={{flex:1,height:6,background:C.s2,borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:sqs.length>0?((sc/sqs.length)*100)+"%":"0%",height:"100%",background:cc,borderRadius:3}}/>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:cc,width:46,textAlign:"right"}}>{sc}/{sqs.length}</span>
              </div>
            );
          })}
        </div>

        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-press" onClick={()=>startMock(mock.pat)} style={gbtn({padding:"12px 24px",fontSize:13})}>Retry Test</button>
          <button className="btn-press" onClick={()=>setPage("mock")} style={obtn(C.green,{padding:"12px 20px",fontSize:13})}>Different Test</button>
          <button className="btn-press" onClick={()=>setChatOpen(true)} style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",border:"none",borderRadius:11,padding:"12px 20px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Ask ZARB AI</button>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: PRACTICE (static)
  ═══════════════════════════════════════════════ */
  const renderPractice = () => (
    <div style={{maxWidth:1000,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.txt,marginBottom:6}}>Practice Hub</h1>
      <p style={{fontSize:12,color:C.sub,marginBottom:22}}>Static MCQs with explanations and bookmarks. For unlimited fresh topics, use the AI Quiz Generator.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:13}}>
        {SUBS.map(sub => (
          <div key={sub.id} className="hoverlift" onClick={()=>startQuiz(sub.id)} style={card({padding:22,position:"relative",overflow:"hidden"})}>
            <div style={{fontSize:11,fontWeight:800,color:sub.color,marginBottom:10}}>{sub.icon}</div>
            <div style={{fontSize:15,fontWeight:800,color:C.txt,marginBottom:4}}>{sub.name}</div>
            <div style={{fontSize:11,color:C.sub,marginBottom:16}}>{(QB[sub.id]||[]).length} questions</div>
            <div style={{background:sub.color,color:"#000",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:900,display:"inline-block"}}>Start Quiz</div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     PAGE: STATIC QUIZ
  ═══════════════════════════════════════════════ */
  const renderQuiz = () => {
    if(!quiz) return null;
    const sub = SUBS.find(s=>s.id===quiz.sub);

    if(!quiz.done) {
      const q = quiz.qs[quiz.idx];
      return (
        <div style={{maxWidth:760,margin:"0 auto",padding:"32px 18px"}} className="anim-up">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {sub && <span style={pill(sub.color)}>{sub.name}</span>}
              <span style={{fontSize:12,color:C.sub}}>Q<strong style={{color:C.txt}}>{quiz.idx+1}</strong>/{quiz.qs.length}</span>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button className="btn-press" onClick={()=>toggleBM(q)} style={obtn(isBM(q)?C.gold:C.dim,{padding:"4px 10px",fontSize:10})}>
                {isBM(q)?"Saved":"Save"}
              </button>
              <div style={card({padding:"4px 12px",fontSize:13,color:C.green,fontWeight:900})}>{fmtTime(quiz.timer)}</div>
            </div>
          </div>
          <ProgBar val={quiz.idx} max={quiz.qs.length}/>
          <div style={card({padding:"24px 26px",marginTop:16,marginBottom:18})}>
            <div style={{fontSize:18,fontWeight:600,color:C.txt,lineHeight:1.65}}>{q.q}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {q.o.map((opt,i) => <OptBtn key={i} label={String.fromCharCode(65+i)} text={opt} onClick={()=>answerQ(i)}/>)}
          </div>
        </div>
      );
    }

    if(!reviewing) {
      const sc = quiz.ans.filter(x=>x.correct).length;
      const tot = quiz.qs.length;
      const col = scCol(sc,tot);
      return (
        <div style={{maxWidth:760,margin:"0 auto",padding:"32px 18px"}} className="anim-up">
          <div style={card({padding:36,textAlign:"center",marginBottom:18,border:"1px solid "+col+"44"})}>
            <div style={{fontSize:52,fontWeight:900,color:col,fontFamily:"'Sora',sans-serif"}}>{Math.round(sc/tot*100)}%</div>
            <div style={{fontSize:17,color:C.txt,fontWeight:700,marginTop:8}}>{sc}/{tot} Correct — {fmtTime(quiz.timer)}</div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-press" onClick={()=>setReviewing(true)} style={obtn(C.green,{padding:"11px 22px",fontSize:12})}>Review Answers</button>
            <button className="btn-press" onClick={()=>startQuiz(quiz.sub)} style={gbtn({padding:"11px 22px",fontSize:12})}>Retry</button>
            <button className="btn-press" onClick={()=>setChatOpen(true)} style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",border:"none",borderRadius:11,padding:"11px 20px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Ask ZARB AI</button>
          </div>
        </div>
      );
    }

    return (
      <div style={{maxWidth:760,margin:"0 auto",padding:"32px 18px"}} className="anim-up">
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,color:C.txt}}>Answer Review</h2>
          <button className="btn-press" onClick={()=>setReviewing(false)} style={obtn(C.sub,{padding:"5px 12px",fontSize:11})}>Back</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {quiz.ans.map((a,i) => (
            <div key={i} style={card({padding:16,border:"1px solid "+(a.correct?C.green+"33":C.red+"33")})}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:15,color:a.correct?C.green:C.red,fontWeight:700}}>{a.correct?"Correct":"Wrong"}</span>
                <button className="btn-press" onClick={()=>toggleBM(a.q)} style={obtn(isBM(a.q)?C.gold:C.dim,{padding:"3px 9px",fontSize:10})}>{isBM(a.q)?"Saved":"Save"}</button>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:C.txt,marginBottom:10}}>{a.q.q}</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
                {a.q.o.map((opt,oi) => {
                  const isC = oi===a.q.a;
                  const isW = oi===a.ci && !a.correct;
                  return (
                    <div key={oi} style={{padding:"7px 11px",borderRadius:7,fontSize:12,background:isC?C.green+"1a":(isW?C.red+"18":C.s2),color:isC?C.green:(isW?C.red:C.sub),border:"1px solid "+(isC?C.green+"44":(isW?C.red+"44":"transparent")),display:"flex",alignItems:"center",gap:7}}>
                      <span style={{fontWeight:700,fontSize:10}}>{String.fromCharCode(65+oi)}.</span>
                      {opt}
                      {isC && <span style={{marginLeft:"auto",fontSize:10,fontWeight:700}}>Correct</span>}
                      {isW && <span style={{marginLeft:"auto",fontSize:10,fontWeight:700}}>Your answer</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{background:C.gold+"12",border:"1px solid "+C.gold+"30",borderRadius:7,padding:"8px 12px",fontSize:11,color:C.gold,lineHeight:1.6}}>
                {a.q.e}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: PAST PAPERS
  ═══════════════════════════════════════════════ */
  const renderPapers = () => {
    const filtered = PAPERS.filter(p => (pExam==="All"||p.exam===pExam) && (pYear==="All"||p.year.toString()===pYear));
    return (
      <div style={{maxWidth:1100,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.txt,marginBottom:20}}>Past Papers</h1>

        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6,alignItems:"center"}}>
          <span style={{fontSize:11,color:C.dim}}>Exam:</span>
          {["All","PPSC","CSS","FPSC","NTS"].map(e => (
            <button key={e} className="btn-press" onClick={()=>setPExam(e)} style={{background:pExam===e?C.green+"1a":C.s1,color:pExam===e?C.green:C.sub,border:"1px solid "+(pExam===e?C.green+"44":C.line),borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:pExam===e?700:400,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {e}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:24,alignItems:"center"}}>
          <span style={{fontSize:11,color:C.dim}}>Year:</span>
          {["All","2023","2022","2021"].map(y => (
            <button key={y} className="btn-press" onClick={()=>setPYear(y)} style={{background:pYear===y?C.green+"1a":C.s1,color:pYear===y?C.green:C.sub,border:"1px solid "+(pYear===y?C.green+"44":C.line),borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:pYear===y?700:400,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {y}
            </button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:13}}>
          {filtered.map(paper => (
            <div key={paper.id} className="hoverlift" style={card({padding:20})}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                <div>
                  <div style={{fontSize:10,fontWeight:800,color:C.green,textTransform:"uppercase",letterSpacing:"0.5px"}}>{paper.exam}</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.txt,marginTop:3}}>{paper.post}</div>
                </div>
                <span style={{background:C.s2,color:C.gold,border:"1px solid "+C.line,borderRadius:7,padding:"3px 9px",fontSize:12,fontWeight:800,height:"fit-content"}}>{paper.year}</span>
              </div>
              <div style={{fontSize:11,color:C.sub,marginBottom:9}}>{paper.dept} — {paper.month}</div>
              <div style={{display:"flex",gap:14,borderTop:"1px solid "+C.line,borderBottom:"1px solid "+C.line,padding:"8px 0",marginBottom:9}}>
                <span style={{fontSize:11,color:C.sub}}>Qs: <strong style={{color:C.txt}}>{paper.qs}</strong></span>
                <span style={{fontSize:11,color:C.sub}}>Time: <strong style={{color:C.txt}}>{paper.dur}</strong></span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
                {paper.tags.map(t => <span key={t} style={{background:C.s2,color:C.dim,borderRadius:5,padding:"2px 7px",fontSize:10}}>{t}</span>)}
              </div>
              <button className="btn-press" onClick={()=>setPaperModal(paper)} style={{width:"100%",background:C.green+"18",color:C.green,border:"1px solid "+C.green+"33",borderRadius:9,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                View and Practice
              </button>
            </div>
          ))}
        </div>

        {paperModal && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setPaperModal(null)}>
            <div className="anim-in" style={card({padding:26,maxWidth:480,width:"100%",maxHeight:"88vh",overflowY:"auto"})} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                <div>
                  <div style={{fontSize:17,fontWeight:900,color:C.txt,fontFamily:"'Sora',sans-serif"}}>{paperModal.post}</div>
                  <div style={{fontSize:11,color:C.sub}}>{paperModal.exam} — {paperModal.dept}</div>
                </div>
                <button className="btn-press" onClick={()=>setPaperModal(null)} style={{background:C.s2,border:"1px solid "+C.line,color:C.sub,width:28,height:28,borderRadius:7,fontSize:15,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>x</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
                {[["Date",paperModal.month+" "+paperModal.year],["Questions",paperModal.qs+" Qs"],["Duration",paperModal.dur],["Dept.",paperModal.dept]].map(([l,v]) => (
                  <div key={l} style={{background:C.s2,borderRadius:8,padding:"10px 12px"}}>
                    <div style={{fontSize:10,color:C.dim,marginBottom:2}}>{l}</div>
                    <div style={{fontSize:12,color:C.txt,fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:C.gold+"12",border:"1px solid "+C.gold+"30",borderRadius:9,padding:12,marginBottom:14}}>
                <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:4}}>Strategy Tip</div>
                <div style={{fontSize:11,color:C.gold+"aa",lineHeight:1.65}}>Focus on {paperModal.tags[0]} — highest weightage. Analyze 5-year patterns to find repeating topics before attempting.</div>
              </div>
              <button className="btn-press" onClick={()=>{startQuiz(tagSub(paperModal.tags[0]));setPaperModal(null);}} style={gbtn({width:"100%",textAlign:"center",padding:"11px",fontSize:13})}>
                Practice Related MCQs
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     PAGE: LEADERBOARD
  ═══════════════════════════════════════════════ */
  const renderLeaderboard = () => (
    <div style={{maxWidth:760,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.txt,marginBottom:24}}>Leaderboard</h1>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {LEADERBOARD.map(p => {
          const medalColor = p.badge==="Gold"?C.gold:(p.badge==="Silver"?"#94a3b8":(p.badge==="Bronze"?"#cd7f32":C.line));
          return (
            <div key={p.rank} style={card({padding:"14px 18px",display:"flex",alignItems:"center",gap:14,border:"1px solid "+(p.badge?medalColor+"55":C.line)})}>
              <div style={{fontSize:18,fontWeight:900,color:p.badge==="Gold"?C.gold:(p.badge==="Silver"?"#94a3b8":(p.badge==="Bronze"?"#cd7f32":C.dim)),width:28,textAlign:"center",fontFamily:"'Sora',sans-serif"}}>#{p.rank}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.txt}}>{p.name}</div>
                <div style={{fontSize:11,color:C.sub,marginTop:2}}>{p.city} — streak: {p.streak} days</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:900,color:p.rank===1?C.gold:C.green,fontFamily:"'Sora',sans-serif"}}>{p.pts.toLocaleString()}</div>
                <div style={{fontSize:11,color:C.sub}}>{p.acc}% accuracy</div>
              </div>
            </div>
          );
        })}
        <div style={card({padding:"14px 18px",display:"flex",alignItems:"center",gap:14,border:"1px solid "+C.green+"44",background:C.green+"08"})}>
          <div style={{fontSize:18,fontWeight:900,color:C.green,width:28,textAlign:"center",fontFamily:"'Sora',sans-serif"}}>You</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:C.green}}>Your Session</div>
            <div style={{fontSize:11,color:C.sub}}>{stats.history.length} quizzes completed</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:900,color:C.green,fontFamily:"'Sora',sans-serif"}}>{stats.correct*100}</div>
            <div style={{fontSize:11,color:C.sub}}>{stats.total>0?Math.round(stats.correct/stats.total*100):0}% accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     PAGE: DASHBOARD
  ═══════════════════════════════════════════════ */
  const renderDashboard = () => (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"36px 18px"}} className="anim-up">
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:900,color:C.txt,marginBottom:22}}>Dashboard</h1>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:11,marginBottom:22}}>
        {[
          ["MCQs Done", stats.total,            C.green],
          ["Correct",   stats.correct,           C.green],
          ["Accuracy",  stats.total>0?Math.round(stats.correct/stats.total*100)+"%":"—", stats.total>0?scCol(stats.correct,stats.total):C.dim],
          ["Quizzes",   stats.history.length,    C.blue],
          ["Bookmarks", bookmarks.length,        C.purple],
        ].map(([lbl,val,col]) => (
          <div key={lbl} style={card({padding:16,textAlign:"center"})}>
            <div style={{fontSize:22,fontWeight:900,color:col,fontFamily:"'Sora',sans-serif"}}>{val}</div>
            <div style={{fontSize:10,color:C.dim,marginTop:3,textTransform:"uppercase",letterSpacing:"0.5px"}}>{lbl}</div>
          </div>
        ))}
      </div>

      {bookmarks.length>0 && (
        <div style={card({padding:20,marginBottom:18})}>
          <div style={{fontSize:14,fontWeight:700,color:C.txt,marginBottom:12}}>Saved Questions ({bookmarks.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {bookmarks.map((bm,i) => (
              <div key={i} style={{background:C.s2,borderRadius:9,padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:C.txt,fontWeight:500,marginBottom:3}}>{bm.q}</div>
                  <div style={{fontSize:11,color:C.green}}>Answer: {bm.o[bm.a]} <span style={{color:C.dim}}>— saved {bm.savedAt}</span></div>
                </div>
                <button className="btn-press" onClick={()=>toggleBM(bm)} style={obtn(C.red,{padding:"3px 8px",fontSize:10,flexShrink:0})}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={card({padding:20})}>
        <div style={{fontSize:14,fontWeight:700,color:C.txt,marginBottom:12}}>Recent Activity</div>
        {stats.history.length===0 ? (
          <div style={{textAlign:"center",padding:"28px 0"}}>
            <div style={{fontSize:13,color:C.sub,marginBottom:14}}>No activity yet. Start with the AI Quiz Generator!</div>
            <button className="btn-press" onClick={()=>setPage("ai_quiz")} style={gbtn({padding:"10px 20px",fontSize:12})}>Generate AI Quiz</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {[...stats.history].reverse().slice(0,15).map((h,i) => {
              let label = h.sub;
              if(h.sub.startsWith("mock:")) label = "Mock: "+h.sub.replace("mock:","").replace("ppsc_","PPSC ").replace("css_","CSS ").replace("nts_","NTS ").replace("fpsc_","FPSC ");
              else if(h.sub.startsWith("ai:")) label = "AI Quiz: "+h.sub.replace("ai:","");
              else { const s = SUBS.find(x=>x.id===h.sub); if(s) label=s.name; }
              const col = scCol(h.sc,h.tot);
              return (
                <div key={i} style={{background:C.s2,borderRadius:8,padding:"10px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:C.txt}}>{label}</div>
                    <div style={{fontSize:10,color:C.sub}}>{h.date} {h.time>0?"— "+fmtTime(h.time):""}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:14,fontWeight:900,color:col,fontFamily:"'Sora',sans-serif"}}>{h.sc}/{h.tot}</div>
                    <div style={{fontSize:10,color:col}}>{Math.round(h.sc/h.tot*100)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     ZARB AI CHAT PANEL
  ═══════════════════════════════════════════════ */
  const renderChat = () => {
    if(!chatOpen) return null;
    return (
      <div style={{position:"fixed",bottom:20,right:20,width:365,height:530,background:"#0c1410",border:"1px solid #4f46e544",borderRadius:20,zIndex:999,display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.8)"}} className="anim-in">
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",borderRadius:"20px 20px 0 0",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:30,height:30,background:"rgba(255,255,255,.2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff"}}>AI</div>
            <div>
              <div style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"'Sora',sans-serif"}}>ZARB AI</div>
              <div style={{fontSize:10,color:"#c4b5fd"}}>Pakistan's Smartest Exam Tutor</div>
            </div>
          </div>
          <button className="btn-press" onClick={()=>setChatOpen(false)} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",width:26,height:26,borderRadius:6,fontSize:14,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>x</button>
        </div>

        {/* Quick prompts */}
        <div style={{padding:"8px 12px",borderBottom:"1px solid "+C.line,display:"flex",gap:5,flexWrap:"wrap",flexShrink:0}}>
          {["Explain CSS exam","PPSC Inspector tips","Essay writing tips","MCQs on Islamiat"].map(p => (
            <button key={p} className="btn-press" onClick={()=>setChatInput(p)} style={{background:"#4f46e520",color:C.purple,border:"1px solid #4f46e530",borderRadius:100,padding:"3px 9px",fontSize:10,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {p}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:9}}>
          {chatMsgs.map((m,i) => (
            <div key={i} className="msg-in" style={{display:"flex",justifyContent:m.r==="user"?"flex-end":"flex-start",gap:7}}>
              {m.r==="ai" && <div style={{width:22,height:22,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",flexShrink:0,alignSelf:"flex-end"}}>AI</div>}
              <div style={{maxWidth:"84%",background:m.r==="user"?C.green+"22":C.s2,border:"1px solid "+(m.r==="user"?C.green+"33":C.line),borderRadius:m.r==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"9px 12px",fontSize:12,color:C.txt,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                {m.t}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{display:"flex",gap:7}}>
              <div style={{width:22,height:22,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff"}}>AI</div>
              <div style={{background:C.s2,border:"1px solid "+C.line,borderRadius:"12px 12px 12px 3px",padding:"9px 12px",display:"flex",gap:5}}>
                <div className="dot-blink" style={{animationDelay:"0s"}}/>
                <div className="dot-blink" style={{animationDelay:".2s"}}/>
                <div className="dot-blink" style={{animationDelay:".4s"}}/>
              </div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>

        {/* Input */}
        <div style={{padding:"8px 12px",borderTop:"1px solid "+C.line,display:"flex",gap:6,flexShrink:0}}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") sendChat();}}
            placeholder="Ask anything about exams..."
            style={{flex:1,background:C.s2,border:"1px solid "+C.line,borderRadius:9,padding:"8px 12px",fontSize:12,color:C.txt,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          <button className="btn-press" onClick={sendChat} disabled={chatLoading||!chatInput.trim()}
            style={{background:(chatLoading||!chatInput.trim())?"#4f46e530":"linear-gradient(135deg,#7c3aed,#4f46e5)",color:(chatLoading||!chatInput.trim())?"#6d5aad":"#fff",border:"none",borderRadius:9,width:34,height:34,fontSize:14,cursor:(chatLoading||!chatInput.trim())?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {chatLoading ? <div style={{width:12,height:12,border:"2px solid #a78bfa",borderTopColor:"transparent",borderRadius:"50%",animation:"spin360 .7s linear infinite"}}/> : "Go"}
          </button>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     NAV
  ═══════════════════════════════════════════════ */
  const renderNav = () => {
    const navItems = [
      ["home","Home"],["mock","Mock Tests"],["ai_quiz","AI Quiz"],
      ["interview","Interview"],["essay","Essay"],
      ["practice","Practice"],["papers","Papers"],
      ["leaderboard","Ranks"],["dashboard","Dashboard"]
    ];
    return (
      <nav style={{background:C.s1+"ee",backdropFilter:"blur(12px)",borderBottom:"1px solid "+C.line,position:"sticky",top:0,zIndex:200,display:"flex",alignItems:"center",gap:4,padding:"0 12px",height:52,overflowX:"auto"}}>
        <div onClick={()=>setPage("home")} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",flexShrink:0,marginRight:8}}>
          <div style={{width:26,height:26,background:"linear-gradient(135deg,"+C.g2+","+C.green+")",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#000",flexShrink:0}}>PP</div>
          <span style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:900,color:C.txt,whiteSpace:"nowrap"}}>PakPrep</span>
        </div>
        {navItems.map(([id,lbl]) => {
          const active = page===id || page.startsWith(id+"_");
          return (
            <button key={id} className="btn-press" onClick={()=>setPage(id)}
              style={{background:active?C.green+"1a":"transparent",color:active?C.green:C.sub,border:"1px solid "+(active?C.green+"33":"transparent"),borderRadius:7,padding:"4px 9px",fontSize:10.5,fontWeight:active?700:400,whiteSpace:"nowrap",flexShrink:0,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {lbl}
            </button>
          );
        })}
        <button className="btn-press glow-pulse" onClick={()=>setChatOpen(true)}
          style={{marginLeft:"auto",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:10.5,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          ZARB AI
        </button>
      </nav>
    );
  };

  /* ═══════════════════════════════════════════════
     ROOT RENDER
  ═══════════════════════════════════════════════ */
  return (
    <>
      <style>{GS}</style>
      <div style={{minHeight:"100vh",background:C.bg}}>
        {renderNav()}
        {page==="home"            && renderHome()}
        {page==="ai_quiz"         && renderAIQuizConfig()}
        {page==="ai_quiz_run"     && renderAIQuizRun()}
        {page==="interview"       && renderInterview()}
        {page==="interview_live"  && renderInterviewLive()}
        {page==="essay"           && renderEssay()}
        {page==="mock"            && renderMockConfig()}
        {page==="mock_test"       && mock && !mock.done && renderMockTest()}
        {page==="mock_test"       && mock &&  mock.done && renderMockResults()}
        {page==="practice"        && renderPractice()}
        {page==="quiz"            && renderQuiz()}
        {page==="papers"          && renderPapers()}
        {page==="leaderboard"     && renderLeaderboard()}
        {page==="dashboard"       && renderDashboard()}
        {renderChat()}
        {!chatOpen && (
          <button className="btn-press glow-pulse" onClick={()=>setChatOpen(true)}
            style={{position:"fixed",bottom:20,right:20,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",border:"none",borderRadius:13,padding:"11px 18px",fontSize:12,fontWeight:800,zIndex:998,display:"flex",alignItems:"center",gap:6,boxShadow:"0 8px 28px rgba(124,58,237,.45)",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            ZARB AI
          </button>
        )}
      </div>
    </>
  );
}

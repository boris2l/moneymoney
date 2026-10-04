(() => {
'use strict';
window.MM_VERSION='1.4';
const CONF = window.MM_CONFIG || {};
const SB_URL = (CONF.SUPABASE_URL || '').replace(/\/+$/, '');
const SB_KEY = CONF.SUPABASE_KEY || '';

const SPACES = {personal:'Личное', business:'Бизнес'};
const MONTHS = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const MONTHS_G = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONTHS_S = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const WD = ['вс','пн','вт','ср','чт','пт','сб'];
const CAT_COLORS = ['#2F5BD8','#1F8A57','#C2412F','#A8640F','#7A4BC9','#0E8A9A','#C23B7A','#5F7A1E','#B55A12','#3E6C8F','#8A5A44','#6B7280'];
/* ---------- иконки категорий (свой минималистичный набор, линия 1.8px) ---------- */
const ICONS = {
  cart:     {t:'Покупки',     d:'<path d="M3 4h2l2.3 10.1a1 1 0 0 0 1 .9h8.6a1 1 0 0 0 1-.8L20 8H6.3"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'},
  cup:      {t:'Кафе',        d:'<path d="M4 9h12v4.5A5.5 5.5 0 0 1 10.5 19h-1A5.5 5.5 0 0 1 4 13.5V9z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5v2.5M12 3.5v2.5"/>'},
  bus:      {t:'Транспорт',   d:'<rect x="4.5" y="3.5" width="15" height="13.5" rx="3"/><path d="M4.5 10.5h15M8 13.8h.01M16 13.8h.01M7.5 17v3M16.5 17v3"/>'},
  car:      {t:'Авто',        d:'<path d="M5 12.5 7 7h10l2 5.5"/><rect x="3.5" y="12.5" width="17" height="5" rx="1.5"/><path d="M6.5 17.5v2.5M17.5 17.5v2.5M7 15h.01M17 15h.01"/>'},
  fuel:     {t:'Топливо',     d:'<path d="M5 21V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 14 5v16M3.5 21h12M7.5 8h4"/><path d="M14 10h1.5A1.5 1.5 0 0 1 17 11.5v4a1.5 1.5 0 0 0 3 0V8.5L17.5 6"/>'},
  home:     {t:'Дом',         d:'<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>'},
  key:      {t:'Аренда',      d:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16.5 6.5l2.5 2.5M14.5 8.5l2 2"/>'},
  phone:    {t:'Связь',       d:'<rect x="7" y="3" width="10" height="18" rx="2.2"/><path d="M11 17.5h2"/>'},
  heart:    {t:'Здоровье',    d:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>'},
  shirt:    {t:'Одежда',      d:'<path d="M8.5 4 3.5 6.8l1.8 4 2.7-1.1V20h8V9.7l2.7 1.1 1.8-4L15.5 4a3.5 3.5 0 0 1-7 0z"/>'},
  ticket:   {t:'Развлечения', d:'<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4V7.5z"/><path d="M14.5 6v2M14.5 11v2M14.5 16v2"/>'},
  repeat:   {t:'Подписки',    d:'<path d="M17 3l3 3-3 3"/><path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20"/><path d="M7 21l-3-3 3-3"/><path d="M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4"/>'},
  gift:     {t:'Подарки',     d:'<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5.5 12v8h13v-8M12 8v12"/><path d="M12 8C11 5.5 9.8 4 8.3 4a2 2 0 0 0 0 4M12 8c1-2.5 2.2-4 3.7-4a2 2 0 0 1 0 4"/>'},
  book:     {t:'Обучение',    d:'<path d="M4.5 5.5A2 2 0 0 1 6.5 3.5h12v14h-12a2 2 0 0 0-2 2v-14z"/><path d="M4.5 19.5a2 2 0 0 0 2 2h12v-4"/><path d="M9 8h5"/>'},
  wallet:   {t:'Зарплата',    d:'<path d="M17.5 7V5.5a1.5 1.5 0 0 0-1.5-1.5H6A2.5 2.5 0 0 0 3.5 6.5"/><path d="M3.5 6.5v11A2.5 2.5 0 0 0 6 20h13a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 19 7H6A2.5 2.5 0 0 1 3.5 6.5z"/><path d="M16.5 13.5h.01"/>'},
  briefcase:{t:'Бизнес',      d:'<rect x="3.5" y="7" width="17" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17"/>'},
  percent:  {t:'Кэшбэк',      d:'<path d="M18.5 5.5l-13 13"/><circle cx="7.5" cy="7.5" r="2.3"/><circle cx="16.5" cy="16.5" r="2.3"/>'},
  box:      {t:'Закупка',     d:'<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4v-9z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>'},
  users:    {t:'Сотрудники',  d:'<circle cx="9" cy="8.5" r="3.3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M15.5 5.2a3.3 3.3 0 0 1 0 6.6M17 14.3a6 6 0 0 1 4 5.7"/>'},
  receipt:  {t:'Налоги',      d:'<path d="M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2-1.3V3z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>'},
  megaphone:{t:'Реклама',     d:'<path d="M3.5 10.2v3.6a1 1 0 0 0 1 1H7l8.5 4.2V5L7 9.2H4.5a1 1 0 0 0-1 1z"/><path d="M18.5 9a3.5 3.5 0 0 1 0 6M7 14.8 8.2 20h2.3"/>'},
  cloud:    {t:'Сервисы',     d:'<path d="M7 18.5a4 4 0 0 1-.7-7.9A6 6 0 0 1 17.8 9.3 4.6 4.6 0 0 1 17.3 18.5H7z"/>'},
  truck:    {t:'Доставка',    d:'<path d="M3 6h10.5v10H3z"/><path d="M13.5 9.5h4l3 3.5v3h-7"/><circle cx="7" cy="17.8" r="1.8"/><circle cx="17" cy="17.8" r="1.8"/>'},
  bank:     {t:'Банк',        d:'<path d="M3.5 9 12 4.5 20.5 9"/><path d="M5.5 10.5v6.5M10 10.5v6.5M14 10.5v6.5M18.5 10.5v6.5M3.5 20h17"/>'},
  trend:    {t:'Продажи',     d:'<path d="M3.5 17 9 11.5l4 4 7.5-7.5"/><path d="M15 8h5.5v5.5"/>'},
  wrench:   {t:'Услуги',      d:'<path d="M14.6 4.2a4.5 4.5 0 0 0-5.3 6L4 15.5a2.1 2.1 0 0 0 3 3l5.3-5.3a4.5 4.5 0 0 0 6-5.3l-2.8 2.8-2.7-.5-.5-2.7 2.3-3.3z"/>'},
  plane:    {t:'Путешествия', d:'<path d="M10.5 13.5 4 16v-2l6.5-4.5V5.2a1.5 1.5 0 0 1 3 0v4.3L20 14v2l-6.5-2.5v4l2 1.5v1.5l-3.5-1-3.5 1V19l2-1.5v-4z"/>'},
  dumbbell: {t:'Спорт',       d:'<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>'},
  sparkle:  {t:'Красота',     d:'<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.9L12 18.5l-1.8-5.8L4.5 10.8 10.2 9 12 3.5z"/><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"/>'},
  paw:      {t:'Питомцы',     d:'<circle cx="5.8" cy="10.3" r="1.5"/><circle cx="9.6" cy="5.8" r="1.5"/><circle cx="14.4" cy="5.8" r="1.5"/><circle cx="18.2" cy="10.3" r="1.5"/><path d="M12 11.5c-2.6 0-5 3.5-5 5.6 0 1.6 1.3 2.4 2.6 2.4 1 0 1.5-.5 2.4-.5s1.4.5 2.4.5c1.3 0 2.6-.8 2.6-2.4 0-2.1-2.4-5.6-5-5.6z"/>'},
  child:    {t:'Дети',        d:'<circle cx="12" cy="5.5" r="2.3"/><path d="M7 10.5h10M12 10.5V15M9.5 20.5 12 15l2.5 5.5"/>'},
  coin:     {t:'Деньги',      d:'<circle cx="12" cy="12" r="8.5"/><path d="M10 8.5h3a2.2 2.2 0 0 1 0 4.4H10M10 8.5V16M8.5 14.5H13"/>'},
  dots:     {t:'Прочее',      d:'<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>'},
};
const ICON_RULES = [
  [/продукт|супермаркет|магазин/, 'cart'], [/кафе|ресторан|кофе|еда|обед|доставк[аи] еды/, 'cup'],
  [/такси|транспорт|метро|автобус|проезд/, 'bus'], [/бензин|топлив|заправ/, 'fuel'], [/авто|машин|парков/, 'car'],
  [/аренд/, 'key'], [/жиль|жкх|квартир|коммунал|ипотек/, 'home'],
  [/связь|телефон|интернет|мобил/, 'phone'], [/здоров|аптек|врач|медиц|лекар/, 'heart'], [/одежд|обув/, 'shirt'],
  [/развлеч|кино|отдых|хобби|игр/, 'ticket'], [/подписк/, 'repeat'], [/подар/, 'gift'], [/образов|курс|книг|учеб/, 'book'],
  [/кэшб|кешб|процент|вклад/, 'percent'], [/из бизнес|бизнес/, 'briefcase'], [/закуп|товар|сырь|материал/, 'box'],
  [/налог|взнос|пошлин/, 'receipt'], [/реклам|маркет|продвиж/, 'megaphone'], [/сервис|софт|програм|хостинг/, 'cloud'],
  [/логист|достав|курьер/, 'truck'], [/банк|комисс|эквайр/, 'bank'], [/продаж|выручк/, 'trend'], [/услуг|ремонт/, 'wrench'],
  [/путеш|отпуск|билет|перел/, 'plane'], [/спорт|фитнес|зал/, 'dumbbell'], [/красот|салон|космет/, 'sparkle'],
  [/питом|животн|корм/, 'paw'], [/дет|ребен|ребён|школ|сад/, 'child'], [/прочее|другое|разное/, 'dots'],
];
function iconKeyFor(cat){
  if(!cat) return 'dots';
  if(cat.icon && ICONS[cat.icon]) return cat.icon;
  const n=String(cat.name||'').toLowerCase();
  if(/зарплат|оклад|аванс/.test(n)) return cat.type==='exp' ? 'users' : 'wallet';
  for(const [re,k] of ICON_RULES) if(re.test(n)) return k;
  return 'coin';
}
function iconSvg(key, size){ const ic=ICONS[key]||ICONS.coin; return `<svg class="ic" width="${size||20}" height="${size||20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic.d}</svg>`; }
function catIcon(cat, size){ return iconSvg(iconKeyFor(cat), size); }

function defaults(){
  let i=0; const id=()=> 'd'+(i++).toString(36);
  const cat=(space,type,names)=>names.map(n=>({id:space[0]+type[0]+id(),space,type,name:n}));
  return {
    accounts:[
      {id:'a_card',space:'personal',name:'Карта',start:0},
      {id:'a_cash',space:'personal',name:'Наличные',start:0},
      {id:'a_rs',space:'business',name:'Расчётный счёт',start:0},
      {id:'a_bcash',space:'business',name:'Наличные',start:0},
    ],
    cats:[
      ...cat('personal','exp',['Продукты','Кафе и рестораны','Транспорт','Жильё и ЖКХ','Связь и интернет','Здоровье','Одежда','Развлечения','Подписки','Подарки','Образование','Прочее']),
      ...cat('personal','inc',['Зарплата','Из бизнеса','Подарки','Кэшбэк','Прочее']),
      ...cat('business','exp',['Закупка','Аренда','Зарплаты','Налоги и взносы','Реклама','Сервисы и софт','Логистика','Банк и комиссии','Связь','Прочее']),
      ...cat('business','inc',['Продажи','Услуги','Прочее']),
    ]
  };
}

/* ---------- small storage helpers ---------- */
const ls = {get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}, del(k){try{localStorage.removeItem(k)}catch(e){}}};
const idb = (() => {
  let dbp = null;
  function open(){
    if(dbp) return dbp;
    dbp = new Promise((res,rej)=>{
      try{ const r=indexedDB.open('moneymoney',1);
        r.onupgradeneeded=()=>r.result.createObjectStore('kv');
        r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);
      }catch(e){ rej(e); }
    });
    return dbp;
  }
  return {
    async get(k){ try{ const db=await open(); return await new Promise((res,rej)=>{ const q=db.transaction('kv').objectStore('kv').get(k); q.onsuccess=()=>res(q.result); q.onerror=()=>rej(q.error); }); }catch(e){ return ls.get('mm_'+k,undefined); } },
    async set(k,v){ try{ const db=await open(); await new Promise((res,rej)=>{ const t=db.transaction('kv','readwrite'); t.objectStore('kv').put(v,k); t.oncomplete=res; t.onerror=()=>rej(t.error); }); }catch(e){ ls.set('mm_'+k,v); } },
    async del(k){ try{ const db=await open(); await new Promise((res)=>{ const t=db.transaction('kv','readwrite'); t.objectStore('kv').delete(k); t.oncomplete=res; t.onerror=res; }); }catch(e){} ls.del('mm_'+k); },
  };
})();

/* ---------- state ---------- */
const pad = n => String(n).padStart(2,'0');
const todayStr = () => { const d=new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
const ymOf = d => String(d).slice(0,7);
const emptyLocal = () => ({tx:{}, config:null, lastPull:null, outbox:{}, configDirty:false, userId:null});
let L = emptyLocal();
let AUTH = ls.get('mm_auth', null);
const S = { space: ls.get('space','personal'), ym: todayStr().slice(0,7), tab: ls.get('tab','ops'), repKind:'exp', repSel:null, rv1: ls.get('rv1','bar'), rv2: ls.get('rv2','bar'),
  sync:'off', syncMsg:'', loaded:false };

let persistT=null;
function persist(){ clearTimeout(persistT); persistT=setTimeout(()=>idb.set('state', L), 150); }

const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf = new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2,minimumFractionDigits:0});
const money = n => nf.format(Math.round(n*100)/100).replace(/ /g,' ') + ' ₽';
const compact = n => { const a=Math.abs(n); if(a>=1e6) return nf.format(Math.round(n/1e5)/10)+' млн'; if(a>=1e3) return nf.format(Math.round(n/100)/10)+' тыс'; return nf.format(Math.round(n)); };
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const $ = s => document.querySelector(s);

function cfg(){ return L.config || defaults(); }
function accById(id){ return cfg().accounts.find(a=>a.id===id); }
function catById(id){ return cfg().cats.find(c=>c.id===id); }
function catColor(id){ const c=cfg().cats; const i=c.findIndex(x=>x.id===id); const same=c.filter(x=>i>=0&&x.space===c[i].space&&x.type===c[i].type); const j=same.findIndex(x=>x.id===id); return j<0?'#6B7280':CAT_COLORS[j%CAT_COLORS.length]; }
function monthTitle(ym){ const [y,m]=ym.split('-').map(Number); return MONTHS[m-1]+' '+y; }
function shiftYm(ym,d){ let [y,m]=ym.split('-').map(Number); m+=d; while(m<1){m+=12;y--} while(m>12){m-=12;y++} return y+'-'+pad(m); }
function shiftDay(d,n){ const x=new Date(d+'T12:00:00'); x.setDate(x.getDate()+n); return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate()); }

/* ---------- data ---------- */
function allTx(){ return Object.values(L.tx).filter(t=>t && !t.deleted); }
function txForSpaceMonth(space, ym){
  return allTx().filter(t=> ymOf(t.d)===ym && (t.space===space || (t.t==='tr' && accById(t.to)?.space===space)));
}
function totals(space, ym){
  let inc=0, exp=0;
  for(const t of allTx()){ if(t.space!==space||ymOf(t.d)!==ym) continue; if(t.t==='inc') inc+=t.a; else if(t.t==='exp') exp+=t.a; }
  return {inc,exp};
}
function balances(){
  const b={}; for(const a of cfg().accounts) b[a.id]=Number(a.start)||0;
  for(const t of allTx()){
    if(t.t==='inc') b[t.acc]=(b[t.acc]||0)+t.a;
    else if(t.t==='exp') b[t.acc]=(b[t.acc]||0)-t.a;
    else if(t.t==='tr'){ b[t.acc]=(b[t.acc]||0)-t.a; b[t.to]=(b[t.to]||0)+t.a; }
  }
  return b;
}
function putTx(tx){ const t={...tx, deleted:false}; L.tx[t.id]=t; L.outbox[t.id]=t; persist(); render(); scheduleSync(); }
function removeTx(id){ const old=L.tx[id]; if(!old) return; const t={...old, deleted:true, ts:old.ts}; L.tx[id]=t; L.outbox[id]=t; persist(); render(); scheduleSync(); }
let cfgT=null;
function setConfig(next, quiet){ L.config=next; L.configDirty=true; persist(); if(!quiet) render(); clearTimeout(cfgT); cfgT=setTimeout(scheduleSync, quiet?700:0); }

/* ---------- Supabase (REST, без библиотек) ---------- */
class ApiError extends Error { constructor(status, msg){ super(msg); this.status=status; } }
async function http(path, {method='GET', body, token, headers={}}={}){
  const h={apikey:SB_KEY, ...headers};
  if(token) h.Authorization='Bearer '+token;
  if(body!==undefined) h['Content-Type']='application/json';
  const r=await fetch(SB_URL+path,{method, headers:h, body: body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text(); let data=null; try{ data=text?JSON.parse(text):null; }catch(e){ data=text; }
  if(!r.ok) throw new ApiError(r.status, (data && (data.msg||data.message||data.error_description||data.error)) || ('HTTP '+r.status));
  return data;
}
function saveAuth(d){
  AUTH={access_token:d.access_token, refresh_token:d.refresh_token, expires_at: d.expires_at || (Math.floor(Date.now()/1000)+(d.expires_in||3600)), user:{id:d.user?.id, email:d.user?.email}};
  ls.set('mm_auth', AUTH);
}
let refreshing=null;
async function token(){
  if(!AUTH) throw new ApiError(401,'no session');
  if(AUTH.expires_at - 60 > Date.now()/1000) return AUTH.access_token;
  if(!refreshing) refreshing = http('/auth/v1/token?grant_type=refresh_token',{method:'POST', body:{refresh_token:AUTH.refresh_token}})
    .then(d=>{ saveAuth(d); return AUTH.access_token; })
    .finally(()=>{ refreshing=null; });
  return refreshing;
}
async function rest(path, opts={}){ const t=await token(); return http('/rest/v1/'+path, {...opts, token:t}); }

const toRow = t => ({id:t.id, user_id:AUTH.user.id, space:t.space, t:t.t, a:t.a, c:t.c??null, acc:t.acc??null, to_acc:t.to??null, d:t.d, n:t.n??'', ts:t.ts??null, deleted:!!t.deleted});
const fromRow = r => { const t={id:r.id, space:r.space, t:r.t, a:Number(r.a), acc:r.acc, d:String(r.d).slice(0,10), n:r.n||'', ts:Number(r.ts)||0, deleted:!!r.deleted}; if(r.t==='tr') t.to=r.to_acc; else t.c=r.c; return t; };

let syncing=false, again=false, syncT=null;
function scheduleSync(){ clearTimeout(syncT); syncT=setTimeout(sync, 400); }
function pendingCount(){ return Object.keys(L.outbox).length + (L.configDirty?1:0); }
function setSync(state, msg){ S.sync=state; S.syncMsg=msg||''; paintSync(); }
function paintSync(){
  const el=$('#sync'); if(!el) return;
  const n=pendingCount();
  el.className='sync'+(S.sync==='ok'?'':' '+S.sync);
  const label = S.sync==='ok' ? 'Синхронизировано' : S.sync==='wait' ? 'Сохраняю…' : S.sync==='off' ? (n?`Офлайн · ${n} ждут`:'Офлайн') : 'Нет связи с базой';
  $('#sync-t').textContent=label; el.title=S.syncMsg||label;
  if(S.tab==='set'){ const s=$('#set-sync'); if(s) s.textContent=label+(S.syncMsg?' — '+S.syncMsg:''); }
}
async function sync(){
  if(!AUTH || !SB_URL) return;
  if(syncing){ again=true; return; }
  if(navigator.onLine===false){ setSync('off'); return; }
  syncing=true; setSync('wait');
  try{
    // 1. отправить локальные изменения
    const snap={...L.outbox}; const rows=Object.values(snap).map(toRow);
    for(let i=0;i<rows.length;i+=500){
      await rest('mm_tx?on_conflict=id',{method:'POST', body:rows.slice(i,i+500), headers:{Prefer:'resolution=merge-duplicates,return=minimal'}});
    }
    for(const id of Object.keys(snap)) if(L.outbox[id]===snap[id]) delete L.outbox[id];
    if(L.configDirty){
      const c=L.config;
      await rest('mm_config?on_conflict=user_id',{method:'POST', body:[{user_id:AUTH.user.id, data:c}], headers:{Prefer:'resolution=merge-duplicates,return=minimal'}});
      if(L.config===c) L.configDirty=false;
    }
    // 2. забрать изменения с других устройств
    const since = L.lastPull ? new Date(Date.parse(L.lastPull)-120000).toISOString() : null;
    let offset=0, maxU=L.lastPull;
    for(;;){
      const q='mm_tx?select=*&order=updated_at.asc,id.asc&limit=1000&offset='+offset+(since?'&updated_at=gte.'+encodeURIComponent(since):'');
      const page=await rest(q);
      for(const r of page){ if(!L.outbox[r.id]) L.tx[r.id]=fromRow(r); if(!maxU || r.updated_at>maxU) maxU=r.updated_at; }
      if(page.length<1000) break; offset+=1000;
    }
    L.lastPull=maxU;
    if(!L.configDirty){
      const c=await rest('mm_config?select=data');
      if(c && c[0] && c[0].data) L.config=c[0].data;
      else if(!L.config){ L.config=defaults(); L.configDirty=true; again=true; }
    }
    persist(); setSync(pendingCount()&&!again?'wait':'ok');
    if(!isEditingSettings()) render();
  }catch(e){
    if(e instanceof ApiError && (e.status===401 || e.status===400) && /refresh|token|JWT|session/i.test(e.message)){
      setSync('err','Сессия истекла, войдите снова'); showLogin('Сессия истекла. Войдите ещё раз — записи на этом устройстве сохранены.');
    } else if(e instanceof TypeError){ setSync('off'); }
    else setSync('err', e.message);
  }finally{
    syncing=false;
    if(again){ again=false; scheduleSync(); }
  }
}
function isEditingSettings(){ const a=document.activeElement; return !!(a && a.closest && a.closest('.set-list')); }

/* ---------- render ---------- */
function render(){
  document.body.dataset.space=S.space;
  for(const b of document.querySelectorAll('.seg.space button')) b.setAttribute('aria-pressed', b.dataset.space===S.space);
  for(const b of document.querySelectorAll('.nav button')){ if(b.dataset.tab===S.tab) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); }
  $('#m-title').textContent=monthTitle(S.ym);
  $('.month').hidden = S.tab==='set';
  $('#fab').hidden = S.tab==='set';
  const v=$('#view');
  if(S.tab==='ops') v.innerHTML=renderOps();
  else if(S.tab==='rep') v.innerHTML=renderRep();
  else v.innerHTML=renderSet();
  paintSync();
}
function wrapCol(h){ return `<div style="display:flex;flex-direction:column;gap:16px">${h}</div>`; }

function accStrip(){
  const b=balances();
  const accs=cfg().accounts.filter(a=>a.space===S.space && !a.archived);
  const total=accs.reduce((s,a)=>s+(b[a.id]||0),0);
  return `<div class="accs" aria-label="Счета">
    <div class="acc total"><div class="n">Всего · ${SPACES[S.space]}</div><div class="b num">${money(total)}</div></div>
    ${accs.map(a=>`<div class="acc"><div class="n">${esc(a.name)}</div><div class="b num">${money(b[a.id]||0)}</div></div>`).join('')}
  </div>`;
}

function renderOps(){
  const {inc,exp}=totals(S.space,S.ym);
  const list=txForSpaceMonth(S.space,S.ym).sort((a,b)=> b.d.localeCompare(a.d) || (b.ts||0)-(a.ts||0));
  const groups={}; for(const t of list)(groups[t.d]=groups[t.d]||[]).push(t);
  const net=inc-exp;
  let html=`<div class="summary">
    <div><div class="lbl">Доходы</div><div class="val num c-inc">${money(inc)}</div></div>
    <div><div class="lbl">Расходы</div><div class="val num c-exp">${money(exp)}</div></div>
    <div><div class="lbl">Итог</div><div class="val num">${net>0?'+':''}${money(net)}</div></div>
  </div>${accStrip()}`;
  if(!list.length){
    const never = !allTx().length;
    html+=`<div class="empty"><b>${never?'Записей пока нет':'В этом месяце пока пусто'}</b><span>Нажмите «+» внизу: сумма, категория — и готово. Можно складывать прямо в поле: 350+120.</span>${never?'<button class="add" data-import>Перенести записи из версии в Claude</button>':''}</div>`;
    return wrapCol(html);
  }
  for(const d of Object.keys(groups).sort().reverse()){
    const dt=new Date(d+'T12:00:00');
    const dayExp=groups[d].filter(t=>t.t==='exp'&&t.space===S.space).reduce((s,t)=>s+t.a,0);
    const label = d===todayStr()?'Сегодня':(d===shiftDay(todayStr(),-1)?'Вчера':`${dt.getDate()} ${MONTHS_G[dt.getMonth()]}, ${WD[dt.getDay()]}`);
    html+=`<section class="day"><h3><span>${label}</span><span class="num">${dayExp?'−'+money(dayExp):''}</span></h3><div class="rows">${groups[d].map(rowHtml).join('')}</div></section>`;
  }
  return wrapCol(html);
}

function rowHtml(t){
  let title, sub, amt, cls, color, letter;
  const acc=accById(t.acc), to=accById(t.to);
  if(t.t==='tr'){
    const incoming = t.space!==S.space;
    const cross = acc&&to&&acc.space!==to.space;
    title='Перевод'; sub=`${esc(acc?.name||'?')} → ${esc(to?.name||'?')}${cross?' · '+(incoming?'из «'+SPACES[acc.space]+'»':'в «'+SPACES[to.space]+'»'):''}`;
    amt = cross ? (incoming?'+':'−')+money(t.a) : money(t.a);
    cls = cross ? (incoming?'c-inc':'c-exp') : ''; color='var(--muted)'; letter=iconSvg('repeat',19);
  } else {
    const c=catById(t.c); title=esc(c?.name||'Без категории'); sub=esc(acc?.name||'');
    amt=(t.t==='inc'?'+':'−')+money(t.a); cls=t.t==='inc'?'c-inc':''; color=catColor(t.c); letter=catIcon(c,19);
  }
  if(t.n) sub+= (sub?' · ':'')+esc(t.n);
  return `<button class="row" data-edit="${esc(t.id)}"><span class="dot" style="background:${color}">${letter}</span><span style="min-width:0"><div class="t">${title}</div><div class="s">${sub}</div></span><span class="a num ${cls}">${amt}</span></button>`;
}

function niceStep(x){ if(x<=0) return 1; const p=Math.pow(10,Math.floor(Math.log10(x))); const f=x/p; return (f<=1?1:f<=2?2:f<=5?5:10)*p; }
function viewSeg(attr, cur){
  const opts=[['bar','Столбцы'],['line','График'],['pie','Круговая']];
  return `<div class="seg vseg" role="group" aria-label="Вид">${opts.map(([k,l])=>`<button ${attr}="${k}" aria-pressed="${cur===k}">${l}</button>`).join('')}</div>`;
}
const SLOTS=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)'];
function axisFrame(W,H,Lp,R,T,B,top,step,yms,sel,gw){
  const ph=H-T-B, y=v=>T+ph-(v/top)*ph; let g='';
  for(let v=0; v<=top+1e-9; v+=step){ g+=`<line class="gr" x1="${Lp}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${Lp-8}" y="${y(v)+4}" text-anchor="end">${compact(v)}</text>`; }
  yms.forEach((ym,i)=>{ const cx=Lp+gw*i+gw/2; const m=Number(ym.slice(5))-1;
    g+=`<text class="ax" x="${cx}" y="${H-8}" text-anchor="middle" ${ym===sel?'style="fill:var(--ink);font-weight:600"':''}>${MONTHS_S[m]}</text>`; });
  return {g,y};
}
function selBand(Lp,T,ph,gw,i){ return `<rect class="sel" x="${Lp+gw*i+4}" y="${T}" width="${gw-8}" height="${ph}" rx="8"/>`; }
function hitBands(Lp,H,gw,yms,titleFn){ return yms.map((ym,i)=>`<rect class="hit" data-ym="${ym}" x="${Lp+gw*i}" y="0" width="${gw}" height="${H}"><title>${titleFn(ym)}</title></rect>`).join(''); }
function linePath(pts){ return pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '); }
function marker(x,y,shape,color){ /* r 4 */
  return shape==='sq' ? `<rect x="${x-4.5}" y="${y-4.5}" width="9" height="9" rx="1.5" fill="${color}" stroke="var(--surface)" stroke-width="2"/>`
                      : `<circle cx="${x}" cy="${y}" r="5" fill="${color}" stroke="var(--surface)" stroke-width="2"/>`;
}
function donut(slices, center){
  // slices: [{v, color, title}]
  const tot=slices.reduce((s,x)=>s+x.v,0); const S=220, cx=S/2, cy=S/2, r=80, sw=30;
  let g=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${sw}"/>`;
  const live=slices.filter(x=>x.v>0);
  if(live.length===1){ g+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${live[0].color}" stroke-width="${sw}"><title>${live[0].title}</title></circle>`; }
  else { let a=-Math.PI/2; const gap=0.035;
    for(const s of live){ const da=s.v/tot*Math.PI*2; const a0=a+gap/2, a1=a+da-gap/2; a+=da; if(a1<=a0) continue;
      const p=(t)=>[cx+r*Math.cos(t), cy+r*Math.sin(t)];
      const [x0,y0]=p(a0), [x1,y1]=p(a1); const large=(a1-a0)>Math.PI?1:0;
      g+=`<path d="M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}" fill="none" stroke="${s.color}" stroke-width="${sw}"><title>${s.title}</title></path>`; } }
  g+=`<text x="${cx}" y="${cy-6}" text-anchor="middle" class="d-l">${center[0]}</text><text x="${cx}" y="${cy+18}" text-anchor="middle" class="d-v">${center[1]}</text>`;
  return `<svg class="donut" viewBox="0 0 ${S} ${S}" role="img" aria-label="${center[0]}">${g}</svg>`;
}
function legendRows(items){ // items: [{color, icon, name, v, pct}]
  return `<div class="brk lg">${items.map(it=>`<div class="lg-it"><span class="lg-sw" style="background:${it.color}">${it.icon||''}</span><span class="nm">${it.name}</span><span class="vl num">${money(it.v)}${it.pct!=null?`<small>${it.pct}%</small>`:''}</span></div>`).join('')}</div>`;
}

function renderRep(){
  const N=6; const yms=[]; for(let i=N-1;i>=0;i--) yms.push(shiftYm(S.ym,-i));
  const data=yms.map(ym=>({ym,...totals(S.space,ym)}));
  const sel=S.repSel && yms.includes(S.repSel)?S.repSel:S.ym;
  const sd=data.find(d=>d.ym===sel);
  const W=380,H=210,Lp=56,R=8,T=12,B=26, pw=W-Lp-R, ph=H-T-B, gw=pw/N;
  const mLabel=MONTHS_S[Number(sel.slice(5))-1];

  /* --- карточка 1: доходы и расходы --- */
  const v1=S.rv1; let body1='';
  const tipLine=`<div class="tip"><span style="text-transform:capitalize">${monthTitle(sel)}</span><span>Доходы <b class="num">${money(sd.inc)}</b></span><span>Расходы <b class="num">${money(sd.exp)}</b></span><span>Итог <b class="num">${money(sd.inc-sd.exp)}</b></span></div>`;
  const ttl=ym=>{ const d=data.find(x=>x.ym===ym); return `${monthTitle(ym)}: доходы ${money(d.inc)}, расходы ${money(d.exp)}`; };
  if(v1==='pie'){
    body1 = (sd.inc+sd.exp)>0
      ? `<div class="pie-wrap">${donut([{v:sd.inc,color:'var(--inc)',title:'Доходы: '+money(sd.inc)},{v:sd.exp,color:'var(--exp)',title:'Расходы: '+money(sd.exp)}], ['Итог · '+mLabel, (sd.inc-sd.exp>0?'+':'')+money(sd.inc-sd.exp)])}
         ${legendRows([{color:'var(--inc)',name:'Доходы',v:sd.inc,pct:Math.round(sd.inc/(sd.inc+sd.exp)*100)},{color:'var(--exp)',name:'Расходы',v:sd.exp,pct:Math.round(sd.exp/(sd.inc+sd.exp)*100)}])}</div>
         <div class="note">Месяц выбирается стрелками вверху экрана.</div>`
      : `<div class="note">В ${monthTitle(sel)} пока нет ни доходов, ни расходов.</div>`;
  } else {
    const max=Math.max(1,...data.map(d=>Math.max(d.inc,d.exp)));
    const step=niceStep(max/3); const top=Math.ceil(max/step)*step;
    const {g:frame,y}=axisFrame(W,H,Lp,R,T,B,top,step,yms,sel,gw);
    let g=selBand(Lp,T,ph,gw,yms.indexOf(sel))+frame;
    if(v1==='line'){
      const pi=data.map((d,i)=>[Lp+gw*i+gw/2, y(d.inc)]), pe=data.map((d,i)=>[Lp+gw*i+gw/2, y(d.exp)]);
      g+=`<path d="${linePath(pi)}" fill="none" stroke="var(--inc)" stroke-width="2.2" stroke-linejoin="round"/>`;
      g+=`<path d="${linePath(pe)}" fill="none" stroke="var(--exp)" stroke-width="2.2" stroke-dasharray="7 5" stroke-linejoin="round"/>`;
      pi.forEach(p=>g+=marker(p[0],p[1],'o','var(--inc)')); pe.forEach(p=>g+=marker(p[0],p[1],'sq','var(--exp)'));
    } else {
      const bw=Math.min(18,gw*0.3);
      data.forEach((d,i)=>{ const cx=Lp+gw*i+gw/2;
        const bar=(x,v,c)=>{ if(v<=0) return ''; const h=Math.max(2,(v/top)*ph); const r=Math.min(4,h/2); const yy=T+ph-h; return `<path d="M${x},${T+ph} V${yy+r} Q${x},${yy} ${x+r},${yy} H${x+bw-r} Q${x+bw},${yy} ${x+bw},${yy+r} V${T+ph} Z" fill="${c}"/>`; };
        g+=bar(cx-bw-1,d.inc,'var(--inc)')+bar(cx+1,d.exp,'var(--exp)'); });
    }
    g+=hitBands(Lp,H,gw,yms,ttl);
    body1=`<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Доходы и расходы за ${N} месяцев">${g}</svg></div>${tipLine}`;
  }
  const leg1 = v1==='line'
    ? `<div class="legend"><span><svg width="22" height="10"><line x1="1" y1="5" x2="21" y2="5" stroke="var(--inc)" stroke-width="2.2"/><circle cx="11" cy="5" r="3.5" fill="var(--inc)"/></svg>Доходы</span><span><svg width="22" height="10"><line x1="1" y1="5" x2="21" y2="5" stroke="var(--exp)" stroke-width="2.2" stroke-dasharray="5 3"/><rect x="7.5" y="1.5" width="7" height="7" rx="1" fill="var(--exp)"/></svg>Расходы</span></div>`
    : v1==='bar' ? `<div class="legend"><span><i style="background:var(--inc)"></i>Доходы</span><span><i style="background:var(--exp)"></i>Расходы</span></div>` : '';

  /* --- карточка 2: по категориям --- */
  const kind=S.repKind, v2=S.rv2;
  const catName=c=>esc(catById(c)?.name||'Без категории');
  const sumsFor=ym=>{ const s={}; for(const t of allTx()){ if(t.space!==S.space||ymOf(t.d)!==ym||t.t!==kind) continue; s[t.c]=(s[t.c]||0)+t.a; } return s; };
  const selSums=sumsFor(sel); const tot=Object.values(selSums).reduce((a,b)=>a+b,0);
  const rows=Object.entries(selSums).sort((a,b)=>b[1]-a[1]);
  const empty2=`<div class="note">За ${monthTitle(sel)} ${kind==='exp'?'расходов':'доходов'} нет.</div>`;
  let body2='';
  if(v2==='pie'){
    if(!rows.length) body2=empty2; else {
      const topR=rows.slice(0,5), rest=rows.slice(5).reduce((s,r)=>s+r[1],0);
      const items=topR.map(([c,v],i)=>({color:SLOTS[i], icon:catIcon(catById(c),14), name:catName(c), v, pct:Math.round(v/tot*100)}));
      if(rest>0) items.push({color:'var(--c-other)', icon:iconSvg('dots',14), name:`Остальное (${rows.length-5})`, v:rest, pct:Math.round(rest/tot*100)});
      body2=`<div class="pie-wrap">${donut(items.map(it=>({v:it.v,color:it.color,title:it.name.replace(/<[^>]+>/g,'')+': '+money(it.v)})), [(kind==='exp'?'Расходы':'Доходы')+' · '+mLabel, money(tot)])}${legendRows(items)}</div>`;
    }
  } else if(v2==='line'){
    const per=yms.map(sumsFor); const totals6={}; per.forEach(s=>{ for(const k in s) totals6[k]=(totals6[k]||0)+s[k]; });
    const ranked=Object.entries(totals6).sort((a,b)=>b[1]-a[1]).slice(0,5).map(r=>r[0]);
    if(!ranked.length) body2=`<div class="note">За последние ${N} месяцев ${kind==='exp'?'расходов':'доходов'} нет.</div>`; else {
      const max=Math.max(1,...per.flatMap(s=>ranked.map(c=>s[c]||0)));
      const step=niceStep(max/3); const top=Math.ceil(max/step)*step;
      const {g:frame,y}=axisFrame(W,H,Lp,R,T,B,top,step,yms,sel,gw);
      let g=selBand(Lp,T,ph,gw,yms.indexOf(sel))+frame;
      ranked.forEach((c,ci)=>{ const pts=per.map((s,i)=>[Lp+gw*i+gw/2, y(s[c]||0)]);
        g+=`<path d="${linePath(pts)}" fill="none" stroke="${SLOTS[ci]}" stroke-width="2.2" stroke-linejoin="round"/>`;
        pts.forEach(p=>g+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${SLOTS[ci]}" stroke="var(--surface)" stroke-width="2"/>`); });
      g+=hitBands(Lp,H,gw,yms,ym=>{ const s=per[yms.indexOf(ym)]; return monthTitle(ym)+': '+ranked.map(c=>(catById(c)?.name||'Без категории')+' '+money(s[c]||0)).join(', '); });
      const selS=per[yms.indexOf(sel)];
      body2=`<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Категории по месяцам">${g}</svg></div>
        <div class="note" style="text-transform:none">Топ-${ranked.length} категорий за ${N} месяцев. Значения — за <span style="text-transform:capitalize">${monthTitle(sel)}</span>:</div>
        ${legendRows(ranked.map((c,i)=>({color:SLOTS[i], icon:catIcon(catById(c),14), name:catName(c), v:selS[c]||0})))}`;
    }
  } else {
    const mx=rows.length?rows[0][1]:1;
    body2 = rows.length ? `<div class="brk">${rows.map(([c,v])=>`<div class="it ic-it"><span class="cat-ic" style="background:${catColor(c)}">${catIcon(catById(c),16)}</span><span class="nm">${catName(c)}</span><span class="vl num">${money(v)}<small>${Math.round(v/tot*100)}%</small></span><div class="bar"><i style="width:${(v/mx*100).toFixed(1)}%"></i></div></div>`).join('')}</div>` : empty2;
  }

  const b=balances(); const accs=cfg().accounts.filter(a=>a.space===S.space&&!a.archived);
  return wrapCol(`
  <div class="card"><div class="card-h"><h3>По категориям · ${mLabel}</h3>
    <div class="seg"><button data-kind="exp" aria-pressed="${kind==='exp'}">Расходы</button><button data-kind="inc" aria-pressed="${kind==='inc'}">Доходы</button></div></div>
    ${viewSeg('data-v2', v2)}
    ${body2}
  </div>
  <div class="card"><div class="card-h"><h3>Доходы и расходы</h3>${leg1}</div>
    ${viewSeg('data-v1', v1)}
    ${body1}
  </div>
  <div class="card"><h3>Остатки на счетах</h3><div class="brk">${accs.map(a=>`<div class="it"><span class="nm">${esc(a.name)}</span><span class="vl num">${money(b[a.id]||0)}</span></div>`).join('')||'<div class="note">Счетов нет — добавьте в настройках.</div>'}</div></div>`);
}

function renderSet(){
  const c=cfg();
  const accs=c.accounts.map((a,i)=>({a,i})).filter(x=>x.a.space===S.space&&!x.a.archived);
  const cats=t=>c.cats.map((x,i)=>({x,i})).filter(o=>o.x.space===S.space&&o.x.type===t);
  return wrapCol(`
  <div class="card"><h3>Счета · ${SPACES[S.space]}</h3>
    <div class="note">Название и начальный остаток. Текущий баланс = начальный + все операции.</div>
    <div class="set-list">${accs.map(({a,i})=>`<div class="set-row"><input class="inp" id="acc-n-${a.id}" data-acc="${i}" data-f="name" value="${esc(a.name)}" aria-label="Название счёта"><input class="inp num" id="acc-s-${a.id}" data-acc="${i}" data-f="start" inputmode="decimal" value="${esc(a.start||0)}" aria-label="Начальный остаток"><button class="del" data-delacc="${i}" aria-label="Убрать счёт" title="Убрать счёт">✕</button></div>`).join('')}</div>
    <button class="add" data-addacc>+ Добавить счёт</button>
  </div>
  ${['exp','inc'].map(t=>`<div class="card"><h3>Категории ${t==='exp'?'расходов':'доходов'} · ${SPACES[S.space]}</h3>
    <div class="set-list">${cats(t).map(({x,i})=>`<div class="set-row cat"><button class="cat-ic big" data-pickicon="${i}" style="background:${catColor(x.id)}" aria-label="Сменить иконку" title="Сменить иконку">${catIcon(x,20)}</button><input class="inp" id="cat-${x.id}" data-cat="${i}" value="${esc(x.name)}" aria-label="Название категории"><button class="del" data-delcat="${i}" aria-label="Удалить категорию" title="Удалить">✕</button></div>`).join('')}</div>
    <button class="add" data-addcat="${t}">+ Добавить категорию</button></div>`).join('')}
  <div class="card"><h3>Аккаунт и данные</h3>
    <div class="note">Вы вошли как <b>${esc(AUTH?.user?.email||'')}</b>. Записи синхронизируются между всеми устройствами, где вы вошли, и работают без интернета.</div>
    <div class="note" id="set-sync"></div>
    <div class="set-actions">
      <button class="btn ghost" data-syncnow>Синхронизировать сейчас</button>
      <button class="btn ghost" data-import>Импорт из файла</button>
      <button class="btn ghost" data-export>Скачать резервную копию</button>
      <button class="btn danger" data-logout>Выйти</button>
    </div>
  </div>
  <div class="card"><h3>Приложение</h3>
    <div class="note" id="upd-status">${updStatusText()}</div>
    <div class="set-actions"><button class="btn ghost" data-forceupdate>Обновить принудительно</button></div>
    <div class="note">Если новая версия не появилась сама: кнопка заново скачает приложение и перезапустит его. Записи не пропадут.</div>
  </div>
  <div class="note" style="text-align:center">MoneyMoney · версия ${esc(window.MM_VERSION||'1')}</div>`);
}

/* ---------- выбор иконки категории ---------- */
let P=null;
function openIconPicker(idx){
  const cat=cfg().cats[idx]; if(!cat) return; P=idx; F=null;
  const cur=iconKeyFor(cat), col=catColor(cat.id);
  $('#sheet-in').innerHTML=`<div class="grab"></div>
    <div class="sheet-head"><b style="font-size:17px">Иконка: ${esc(cat.name)}</b><button class="iconbtn" data-close aria-label="Закрыть">✕</button></div>
    <div class="icon-grid">${Object.entries(ICONS).map(([k,v])=>`<button class="icon-opt" data-icon="${k}" aria-pressed="${k===cur}" title="${v.t}"><span class="cat-ic big" style="background:${k===cur?col:'var(--surface-2)'};color:${k===cur?'#fff':'var(--ink)'}">${iconSvg(k,20)}</span><span>${v.t}</span></button>`).join('')}</div>`;
  $('#scrim').hidden=false; $('#sheet').hidden=false;
  requestAnimationFrame(()=>{ $('#scrim').classList.add('on'); $('#sheet').classList.add('on'); });
}

/* ---------- sheet (quick entry) ---------- */
let F=null;
function openSheet(edit){
  const lastAcc=ls.get('lastAcc',{});
  if(edit){
    F={...edit, amountStr:String(edit.a).replace('.',','), editing:true, origId:edit.id, armed:false};
  } else {
    const accs=cfg().accounts.filter(a=>a.space===S.space&&!a.archived);
    const acc=accs.find(a=>a.id===lastAcc[S.space])?.id || accs[0]?.id || '';
    const d = ymOf(todayStr())===S.ym ? todayStr() : S.ym+'-01';
    F={t:'exp', amountStr:'', c:'', acc, to:'', d, n:'', editing:false, space:S.space, armed:false};
  }
  $('#scrim').hidden=false; $('#sheet').hidden=false;
  requestAnimationFrame(()=>{ $('#scrim').classList.add('on'); $('#sheet').classList.add('on'); });
  renderSheet(true);
}
function closeSheet(){
  P=null;
  $('#scrim').classList.remove('on'); $('#sheet').classList.remove('on');
  F=null;
  setTimeout(()=>{ if(!F){ $('#scrim').hidden=true; $('#sheet').hidden=true; } },220);
}
function parseAmount(s){
  s=String(s||'').replace(/\s| | /g,'').replace(/,/g,'.');
  if(!s || !/^[0-9.]+([+\-*][0-9.]+)*$/.test(s)) return NaN;
  const toks=s.match(/[0-9.]+|[+\-*]/g);
  const terms=[], ops=[]; let cur=Number(toks[0]); if(isNaN(cur)) return NaN;
  for(let i=1;i<toks.length;i+=2){ const op=toks[i], v=Number(toks[i+1]); if(isNaN(v)) return NaN;
    if(op==='*') cur*=v; else { terms.push(cur); ops.push(op); cur=v; } }
  terms.push(cur);
  let r=terms[0]; for(let i=0;i<ops.length;i++) r = ops[i]==='+'? r+terms[i+1] : r-terms[i+1];
  return Math.round(r*100)/100;
}
function sheetOk(){ const amt=parseAmount(F.amountStr); return amt>0 && !!F.acc && (F.t==='tr' ? (!!F.to && F.to!==F.acc) : !!F.c) && /^\d{4}-\d{2}-\d{2}$/.test(F.d); }
function renderSheet(focus){
  const c=cfg(); const sp=F.space;
  const accsSp=c.accounts.filter(a=>a.space===sp&&!a.archived);
  const allAccs=c.accounts.filter(a=>!a.archived);
  const cats=c.cats.filter(x=>x.space===sp&&x.type===F.t);
  const amt=parseAmount(F.amountStr);
  const expr=/[+\-*]/.test(F.amountStr) && !isNaN(amt);
  const y=shiftDay(todayStr(),-1);
  $('#sheet-in').innerHTML=`
    <div class="grab"></div>
    <div class="sheet-head">
      <div class="seg" role="group" aria-label="Тип">
        <button data-t="exp" aria-pressed="${F.t==='exp'}">Расход</button>
        <button data-t="inc" aria-pressed="${F.t==='inc'}">Доход</button>
        <button data-t="tr" aria-pressed="${F.t==='tr'}">Перевод</button>
      </div>
      <button class="iconbtn" data-close aria-label="Закрыть">✕</button>
    </div>
    <div>
      <div class="amount"><input id="f-amount" inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(F.amountStr)}" aria-label="Сумма"><span>₽</span></div>
      <div class="hint num" id="f-hint">${expr?'= '+money(amt):(F.editing?'':SPACES[sp])}</div>
    </div>
    ${F.t!=='tr'?`<div><div class="field-l">Категория</div><div class="chips">${cats.map(x=>`<button class="chip" data-c="${x.id}" aria-pressed="${F.c===x.id}"><span class="chip-ic" style="color:${catColor(x.id)}">${catIcon(x,16)}</span>${esc(x.name)}</button>`).join('')||'<span class="note">Нет категорий — добавьте в настройках.</span>'}</div></div>`:''}
    <div><div class="field-l">${F.t==='tr'?'Откуда':'Счёт'}</div><div class="chips">${accsSp.map(a=>`<button class="chip" data-acc="${a.id}" aria-pressed="${F.acc===a.id}">${esc(a.name)}</button>`).join('')||'<span class="note">Нет счетов — добавьте в настройках.</span>'}</div></div>
    ${F.t==='tr'?`<div><div class="field-l">Куда</div><div class="chips">${allAccs.filter(a=>a.id!==F.acc).map(a=>`<button class="chip" data-to="${a.id}" aria-pressed="${F.to===a.id}">${esc(a.name)}${a.space!==sp?` <small>${SPACES[a.space]}</small>`:''}</button>`).join('')}</div></div>`:''}
    <div><div class="field-l">Дата</div><div class="drow">
      <button class="chip" data-d="${todayStr()}" aria-pressed="${F.d===todayStr()}">Сегодня</button>
      <button class="chip" data-d="${y}" aria-pressed="${F.d===y}">Вчера</button>
      <input type="date" class="inp" id="f-date" value="${esc(F.d)}" aria-label="Дата"></div></div>
    <input class="inp" id="f-note" placeholder="Комментарий (необязательно)" value="${esc(F.n)}" autocomplete="off">
    <div class="btns">
      ${F.editing?`<button class="btn danger" data-delete>${F.armed?'Точно удалить?':'Удалить'}</button>`:''}
      <button class="btn" data-save ${sheetOk()?'':'disabled'}>${F.editing?'Сохранить':'Добавить'}</button>
    </div>`;
  if(focus && !F.editing) setTimeout(()=>{ const i=$('#f-amount'); i&&i.focus(); },60);
}
function refreshSheetState(){
  const amt=parseAmount(F.amountStr);
  const expr=/[+\-*]/.test(F.amountStr) && !isNaN(amt);
  const h=$('#f-hint'); if(h) h.textContent = expr?'= '+money(amt):(F.editing?'':SPACES[F.space]);
  const ok=sheetOk(); const b=document.querySelector('[data-save]'); if(b) b.disabled=!ok; return ok;
}
function saveSheet(){
  if(!refreshSheetState()) return;
  const amt=parseAmount(F.amountStr);
  const id=F.editing?F.origId:uid();
  const sp=accById(F.acc)?.space||F.space;
  const tx={id, space:sp, t:F.t, a:amt, acc:F.acc, d:F.d, n:(F.n||'').trim(), ts:F.ts||Date.now()};
  if(F.t==='tr') tx.to=F.to; else tx.c=F.c;
  const wasEditing=F.editing;
  const la=ls.get('lastAcc',{}); la[sp]=F.acc; ls.set('lastAcc',la);
  closeSheet();
  putTx(tx);
  toast(wasEditing?'Сохранено':`Добавлено: ${money(amt)}`);
}

/* ---------- import / export ---------- */
let importArmed=null;
function exportData(){
  const data={format:'moneymoney-export', version:1, exportedAt:new Date().toISOString(), config:cfg(), tx:allTx().map(({deleted,...t})=>t)};
  const blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`moneymoney-${todayStr()}.json`;
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000);
}
async function importFile(file){
  let data; try{ data=JSON.parse(await file.text()); }catch(e){ toast('Не получилось прочитать файл. Нужен файл .json из MoneyMoney.'); return; }
  if(!data || data.format!=='moneymoney-export' || !Array.isArray(data.tx)){ toast('Это не файл MoneyMoney.'); return; }
  let n=0;
  for(const t of data.tx){
    if(!t || !t.id || !t.d || !(Number(t.a)>0) || !t.space) continue;
    const tx={id:String(t.id), space:t.space, t:t.t, a:Number(t.a), acc:t.acc, d:String(t.d).slice(0,10), n:t.n||'', ts:Number(t.ts)||Date.now(), deleted:false};
    if(t.t==='tr') tx.to=t.to; else tx.c=t.c;
    L.tx[tx.id]=tx; L.outbox[tx.id]=tx; n++;
  }
  if(data.config && Array.isArray(data.config.accounts) && Array.isArray(data.config.cats)){ L.config=data.config; L.configDirty=true; }
  persist(); render(); scheduleSync();
  toast(`Перенесено записей: ${n}. Счета и категории обновлены.`);
}

/* ---------- login ---------- */
let mode='login'; // login | signup | reset1 | reset2
function showLogin(msg){
  $('#main').hidden=true; $('#login').hidden=false;
  setMode('login');
  if(msg) $('#l-err').textContent=msg;
  if(AUTH?.user?.email) $('#l-email').value=AUTH.user.email;
}
async function showMain(){
  $('#login').hidden=true; $('#main').hidden=false;
  const st=await idb.get('state');
  if(st && st.userId===AUTH.user.id) L={...emptyLocal(), ...st};
  else { L=emptyLocal(); L.userId=AUTH.user.id; }
  render(); sync();
}
function setMode(m){
  mode=m;
  const sub={login:'Войдите, чтобы записи были одинаковыми на iPhone и Mac.', signup:'Придумайте пароль — им вы будете входить на всех устройствах.',
    reset1:'Введите почту — пришлём код для сброса пароля.', reset2:'Мы отправили код на вашу почту. Введите его и придумайте новый пароль.'}[m];
  $('#login-sub').textContent=sub;
  $('#l-email').readOnly = m==='reset2';
  $('#l-pass').hidden = m==='reset1'; $('#l-pass').required = m!=='reset1';
  $('#l-pass').placeholder = m==='reset2'?'Новый пароль (не короче 6 символов)':'Пароль (не короче 6 символов)';
  $('#l-pass').autocomplete = m==='login'?'current-password':'new-password';
  $('#l-code').hidden = m!=='reset2'; $('#l-code').required = m==='reset2';
  $('#l-go').textContent = {login:'Войти', signup:'Создать аккаунт', reset1:'Получить код', reset2:'Сохранить пароль и войти'}[m];
  $('#l-mode').textContent = m==='login'?'Первый раз? Создать аккаунт':(m==='signup'?'Уже есть аккаунт? Войти':'Вспомнили пароль? Войти');
  $('#l-forgot').hidden = m!=='login';
  $('#l-resend').hidden = m!=='reset2';
  $('#l-err').textContent=''; $('#l-info').textContent='';
}
$('#l-mode').addEventListener('click',()=> setMode(mode==='login'?'signup':'login'));
$('#l-forgot').addEventListener('click',()=> setMode('reset1'));
$('#l-resend').addEventListener('click', async ()=>{ try{ await http('/auth/v1/recover',{method:'POST', body:{email:$('#l-email').value.trim()}}); $('#l-info').textContent='Отправили новый код.'; }catch(err){ $('#l-err').textContent=authErr(err); } });
function authErr(err){
  const m=String(err.message||'');
  return err instanceof TypeError ? 'Нет интернета. Для входа нужна связь.' :
    /invalid login|invalid_credentials/i.test(m) ? 'Неверная почта или пароль.' :
    /already registered|already exists/i.test(m) ? 'Такой аккаунт уже есть — нажмите «Войти».' :
    /signups? not allowed|disabled/i.test(m) ? 'Регистрация новых аккаунтов выключена.' :
    /expired|invalid|otp|token/i.test(m) && mode==='reset2' ? 'Код неверный или устарел. Нажмите «Отправить код ещё раз».' :
    /rate limit|security purposes|seconds/i.test(m) ? 'Слишком часто. Подождите минуту и попробуйте снова.' :
    /should be different|same password/i.test(m) ? 'Новый пароль должен отличаться от старого.' :
    /password/i.test(m) ? 'Пароль слишком простой: нужно не меньше 6 символов.' : ('Не получилось: '+m);
}
$('#login-form').addEventListener('submit', async e=>{
  e.preventDefault();
  if(!SB_URL||!SB_KEY){ $('#l-err').textContent='Приложение ещё не подключено к базе данных.'; return; }
  const email=$('#l-email').value.trim(), password=$('#l-pass').value;
  const btn=$('#l-go'); btn.disabled=true; $('#l-err').textContent=''; $('#l-info').textContent='';
  try{
    let d;
    if(mode==='reset1'){
      await http('/auth/v1/recover',{method:'POST', body:{email}});
      setMode('reset2'); setTimeout(()=>$('#l-code').focus(),50); return;
    }
    if(mode==='reset2'){
      const token=$('#l-code').value.replace(/\D/g,'');
      d=await http('/auth/v1/verify',{method:'POST', body:{type:'recovery', email, token}});
      saveAuth(d);
      await http('/auth/v1/user',{method:'PUT', token:AUTH.access_token, body:{password}});
      $('#l-code').value=''; $('#l-pass').value=''; toast('Пароль изменён');
      await showMain(); return;
    }
    if(mode==='signup'){
      d=await http('/auth/v1/signup',{method:'POST', body:{email,password}});
      if(!d.access_token){ $('#l-err').textContent='Аккаунт создан, но нужно подтвердить почту. Откройте письмо и затем войдите.'; return; }
    } else d=await http('/auth/v1/token?grant_type=password',{method:'POST', body:{email,password}});
    saveAuth(d); $('#l-pass').value='';
    await showMain();
  }catch(err){
    $('#l-err').textContent=authErr(err);
  }finally{ btn.disabled=false; }
});

/* ---------- events ---------- */
document.addEventListener('click', e=>{
  const t=e.target.closest('button, rect.hit'); if(!t || t.closest('#login')) return;
  const ds=t.dataset;
  if(t.closest('.seg.space') && ds.space){ S.space=ds.space; ls.set('space',S.space); S.repSel=null; render(); return; }
  if(t.closest('.nav') && ds.tab){ S.tab=ds.tab; ls.set('tab',S.tab); render(); window.scrollTo(0,0); return; }
  if(t.id==='m-prev'){ S.ym=shiftYm(S.ym,-1); S.repSel=null; render(); return; }
  if(t.id==='m-next'){ S.ym=shiftYm(S.ym,1); S.repSel=null; render(); return; }
  if(t.id==='fab'){ openSheet(); return; }
  if(ds.edit){ const tx=L.tx[ds.edit]; if(tx && !tx.deleted) openSheet(tx); return; }
  if(ds.ym){ S.repSel=ds.ym; render(); return; }
  if(ds.kind){ S.repKind=ds.kind; render(); return; }
  if(ds.v1){ S.rv1=ds.v1; ls.set('rv1',S.rv1); render(); return; }
  if(ds.v2){ S.rv2=ds.v2; ls.set('rv2',S.rv2); render(); return; }
  if(ds.pickicon!==undefined){ openIconPicker(+ds.pickicon); return; }
  if(ds.icon && P!==null){ const c=structuredClone(cfg()); c.cats[P].icon=ds.icon; P=null; closeSheet(); setConfig(c); return; }
  if(P!==null && 'close' in ds){ P=null; closeSheet(); return; }
  if(F && t.closest('#sheet')){
    if('close' in ds){ closeSheet(); return; }
    if(ds.t){ F.t=ds.t; F.c=''; if(ds.t!=='tr') F.to=''; renderSheet(); return; }
    if(ds.c){ F.c=ds.c; renderSheet(); return; }
    if(ds.acc){ F.acc=ds.acc; if(F.to===F.acc) F.to=''; renderSheet(); return; }
    if(ds.to){ F.to=ds.to; renderSheet(); return; }
    if(ds.d){ F.d=ds.d; renderSheet(); return; }
    if('save' in ds){ saveSheet(); return; }
    if('delete' in ds){
      if(!F.armed){ F.armed=true; renderSheet(); return; }
      const id=F.origId; closeSheet(); removeTx(id); toast('Удалено'); return;
    }
    return;
  }
  if('syncnow' in ds){ sync(); return; }
  if('forceupdate' in ds){ forceUpdate(); return; }
  if('import' in ds){ $('#import-file').click(); return; }
  if('export' in ds){ exportData(); return; }
  if('logout' in ds){
    if(pendingCount()){ toast('Есть несохранённые в облаке записи. Подключитесь к интернету и дождитесь синхронизации.'); return; }
    if(!t.classList.contains('armed')){ t.classList.add('armed'); t.textContent='Точно выйти?'; return; }
    AUTH=null; ls.del('mm_auth'); idb.del('state'); L=emptyLocal(); showLogin(''); return;
  }
  if('addacc' in ds){ const c=structuredClone(cfg()); c.accounts.push({id:'a_'+uid(),space:S.space,name:'Новый счёт',start:0}); setConfig(c); return; }
  if(ds.delacc!==undefined){
    if(!t.classList.contains('armed')){ document.querySelectorAll('.del.armed').forEach(x=>x.classList.remove('armed')); t.classList.add('armed'); t.title='Нажмите ещё раз, чтобы убрать'; return; }
    const c=structuredClone(cfg()); const a=c.accounts[+ds.delacc];
    const used=allTx().some(x=>x.acc===a.id||x.to===a.id);
    if(used) a.archived=true; else c.accounts.splice(+ds.delacc,1);
    setConfig(c); toast(used?'Счёт скрыт, операции по нему сохранены':'Счёт удалён'); return;
  }
  if(ds.addcat){ const c=structuredClone(cfg()); c.cats.push({id:'c_'+uid(),space:S.space,type:ds.addcat,name:'Новая категория'}); setConfig(c);
    setTimeout(()=>{ const ins=[...document.querySelectorAll('[data-cat]')].filter(i=>c.cats[+i.dataset.cat]?.type===ds.addcat); const last=ins.pop(); last&&(last.focus(),last.select()); },50); return; }
  if(ds.delcat!==undefined){
    if(!t.classList.contains('armed')){ document.querySelectorAll('.del.armed').forEach(x=>x.classList.remove('armed')); t.classList.add('armed'); t.title='Нажмите ещё раз, чтобы удалить'; return; }
    const c=structuredClone(cfg()); c.cats.splice(+ds.delcat,1); setConfig(c); toast('Категория удалена'); return;
  }
});
document.addEventListener('input', e=>{
  const t=e.target;
  if(F && t.id==='f-amount'){ F.amountStr=t.value; refreshSheetState(); return; }
  if(F && t.id==='f-note'){ F.n=t.value; return; }
  if(F && t.id==='f-date'){ F.d=t.value; for(const b of document.querySelectorAll('#sheet [data-d]')) b.setAttribute('aria-pressed', b.dataset.d===F.d); refreshSheetState(); return; }
  if(t.dataset.acc!==undefined && t.dataset.f){
    const c=structuredClone(cfg()); const a=c.accounts[+t.dataset.acc];
    if(t.dataset.f==='name') a.name=t.value; else { const v=parseAmount(t.value.replace(/^-/,'0-')); a.start=isNaN(v)?0:v; }
    setConfig(c, true); return;
  }
  if(t.dataset.cat!==undefined){ const c=structuredClone(cfg()); c.cats[+t.dataset.cat].name=t.value; setConfig(c, true); return; }
});
document.addEventListener('focusout', e=>{ if(e.target.closest && e.target.closest('.set-list')) setTimeout(()=>{ if(!isEditingSettings()) render(); },0); });
document.addEventListener('keydown', e=>{
  if(!F) return;
  if(e.key==='Escape') closeSheet();
  if(e.key==='Enter' && (e.target.id==='f-amount'||e.target.id==='f-note')){ e.preventDefault(); saveSheet(); }
});
$('#scrim').addEventListener('click', closeSheet);
$('#import-file').addEventListener('change', e=>{ const f=e.target.files[0]; e.target.value=''; if(f) importFile(f); });
window.addEventListener('online', ()=>sync());
window.addEventListener('offline', ()=>setSync('off'));
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible'){ sync(); checkLatest(); } });
setInterval(()=>{ if(document.visibilityState==='visible') sync(); }, 60000);

/* ---------- обновления приложения ---------- */
S.latest=null;
function updStatusText(){
  if(!S.latest) return `Установлена версия ${window.MM_VERSION}.`;
  return S.latest===window.MM_VERSION ? `Установлена последняя версия ${window.MM_VERSION}.` : `Установлена версия ${window.MM_VERSION}, доступна ${S.latest}.`;
}
async function checkLatest(){
  try{
    const r=await fetch('app.js?check='+Date.now(),{cache:'no-store'}); const t=await r.text();
    const m=t.match(/MM_VERSION='([^']+)'/); if(!m) return;
    S.latest=m[1]; paintUpd();
  }catch(e){}
}
function paintUpd(){
  const b=$('#upd'); if(b){ const show=S.latest && S.latest!==window.MM_VERSION; b.hidden=!show; if(show) $('#upd-v').textContent=S.latest; }
  const st=$('#upd-status'); if(st) st.textContent=updStatusText();
}
async function forceUpdate(){
  toast('Обновляю…');
  try{ if(pendingCount() && navigator.onLine!==false) await sync(); }catch(e){}
  try{ await idb.set('state', L); }catch(e){}
  try{ if(navigator.serviceWorker){ const regs=await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r=>r.unregister())); } }catch(e){}
  try{ if(window.caches){ const ks=await caches.keys(); await Promise.all(ks.map(k=>caches.delete(k))); } }catch(e){}
  location.replace(location.pathname+'?u='+Date.now());
}

let toastT=null;
function toast(msg){ const el=$('#toast'); el.textContent=msg; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>el.hidden=true,2600); }

/* ---------- boot ---------- */
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
if(AUTH && AUTH.user && AUTH.user.id) showMain(); else showLogin('');
setTimeout(checkLatest, 1500);
if(location.search.includes('u=')) history.replaceState(null,'',location.pathname);
})();

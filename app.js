(() => {
'use strict';
window.MM_VERSION='1.2';
const CONF = window.MM_CONFIG || {};
const SB_URL = (CONF.SUPABASE_URL || '').replace(/\/+$/, '');
const SB_KEY = CONF.SUPABASE_KEY || '';

const SPACES = {personal:'Личное', business:'Бизнес'};
const MONTHS = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const MONTHS_G = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONTHS_S = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const WD = ['вс','пн','вт','ср','чт','пт','сб'];
const CAT_COLORS = ['#2F5BD8','#1F8A57','#C2412F','#A8640F','#7A4BC9','#0E8A9A','#C23B7A','#5F7A1E','#B55A12','#3E6C8F','#8A5A44','#6B7280'];

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
const S = { space: ls.get('space','personal'), ym: todayStr().slice(0,7), tab: ls.get('tab','ops'), repKind:'exp', repSel:null,
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
    cls = cross ? (incoming?'c-inc':'c-exp') : ''; color='var(--muted)'; letter='⇄';
  } else {
    const c=catById(t.c); title=esc(c?.name||'Без категории'); sub=esc(acc?.name||'');
    amt=(t.t==='inc'?'+':'−')+money(t.a); cls=t.t==='inc'?'c-inc':''; color=catColor(t.c); letter=esc((c?.name||'?')[0]);
  }
  if(t.n) sub+= (sub?' · ':'')+esc(t.n);
  return `<button class="row" data-edit="${esc(t.id)}"><span class="dot" style="background:${color}">${letter}</span><span style="min-width:0"><div class="t">${title}</div><div class="s">${sub}</div></span><span class="a num ${cls}">${amt}</span></button>`;
}

function niceStep(x){ if(x<=0) return 1; const p=Math.pow(10,Math.floor(Math.log10(x))); const f=x/p; return (f<=1?1:f<=2?2:f<=5?5:10)*p; }
function renderRep(){
  const N=6; const yms=[]; for(let i=N-1;i>=0;i--) yms.push(shiftYm(S.ym,-i));
  const data=yms.map(ym=>({ym,...totals(S.space,ym)}));
  const sel=S.repSel && yms.includes(S.repSel)?S.repSel:S.ym;
  const max=Math.max(1,...data.map(d=>Math.max(d.inc,d.exp)));
  const step=niceStep(max/3); const top=Math.ceil(max/step)*step;
  const W=600,H=230,Lp=52,R=8,T=12,B=28, pw=W-Lp-R, ph=H-T-B, gw=pw/N, bw=Math.min(26,gw*0.28);
  const y=v=>T+ph-(v/top)*ph;
  let g='';
  for(let v=0; v<=top+1e-9; v+=step){ g+=`<line class="gr" x1="${Lp}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${Lp-8}" y="${y(v)+4}" text-anchor="end">${compact(v)}</text>`; }
  data.forEach((d,i)=>{
    const cx=Lp+gw*i+gw/2;
    if(d.ym===sel) g+=`<rect class="sel" x="${Lp+gw*i+4}" y="${T}" width="${gw-8}" height="${ph}" rx="8"/>`;
    const bar=(x,v,c)=>{ if(v<=0) return ''; const h=Math.max(2,(v/top)*ph); const r=Math.min(4,h/2); const yy=T+ph-h; return `<path d="M${x},${T+ph} V${yy+r} Q${x},${yy} ${x+r},${yy} H${x+bw-r} Q${x+bw},${yy} ${x+bw},${yy+r} V${T+ph} Z" fill="${c}"/>`; };
    g+=bar(cx-bw-1,d.inc,'var(--inc)')+bar(cx+1,d.exp,'var(--exp)');
    const m=Number(d.ym.slice(5))-1;
    g+=`<text class="ax" x="${cx}" y="${H-8}" text-anchor="middle" ${d.ym===sel?'style="fill:var(--ink);font-weight:600"':''}>${MONTHS_S[m]}</text>`;
    g+=`<rect class="hit" data-ym="${d.ym}" x="${Lp+gw*i}" y="0" width="${gw}" height="${H}"><title>${monthTitle(d.ym)}: доходы ${money(d.inc)}, расходы ${money(d.exp)}</title></rect>`;
  });
  const sd=data.find(d=>d.ym===sel);
  const kind=S.repKind;
  const sums={}; let tot=0;
  for(const t of allTx()){ if(t.space!==S.space||ymOf(t.d)!==sel||t.t!==kind) continue; sums[t.c]=(sums[t.c]||0)+t.a; tot+=t.a; }
  const rows=Object.entries(sums).sort((a,b)=>b[1]-a[1]);
  const mx=rows.length?rows[0][1]:1;
  const b=balances(); const accs=cfg().accounts.filter(a=>a.space===S.space&&!a.archived);
  return wrapCol(`
  <div class="card"><div class="card-h"><h3>Доходы и расходы</h3><div class="legend"><span><i style="background:var(--inc)"></i>Доходы</span><span><i style="background:var(--exp)"></i>Расходы</span></div></div>
    <div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Доходы и расходы за ${N} месяцев">${g}</svg></div>
    <div class="tip"><span style="text-transform:capitalize">${monthTitle(sel)}</span><span>Доходы <b class="num">${money(sd.inc)}</b></span><span>Расходы <b class="num">${money(sd.exp)}</b></span><span>Итог <b class="num">${money(sd.inc-sd.exp)}</b></span></div>
  </div>
  <div class="card"><div class="card-h"><h3>По категориям · ${MONTHS_S[Number(sel.slice(5))-1]}</h3>
    <div class="seg"><button data-kind="exp" aria-pressed="${kind==='exp'}">Расходы</button><button data-kind="inc" aria-pressed="${kind==='inc'}">Доходы</button></div></div>
    ${rows.length?`<div class="brk">${rows.map(([c,v])=>`<div class="it"><span class="nm">${esc(catById(c)?.name||'Без категории')}</span><span class="vl num">${money(v)}<small>${Math.round(v/tot*100)}%</small></span><div class="bar"><i style="width:${(v/mx*100).toFixed(1)}%"></i></div></div>`).join('')}</div>`:`<div class="note">За этот месяц ${kind==='exp'?'расходов':'доходов'} нет.</div>`}
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
    <div class="set-list">${cats(t).map(({x,i})=>`<div class="set-row cat"><input class="inp" id="cat-${x.id}" data-cat="${i}" value="${esc(x.name)}" aria-label="Название категории"><button class="del" data-delcat="${i}" aria-label="Удалить категорию" title="Удалить">✕</button></div>`).join('')}</div>
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
  <div class="note" style="text-align:center">MoneyMoney · версия ${esc(window.MM_VERSION||'1')}</div>`);
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
    ${F.t!=='tr'?`<div><div class="field-l">Категория</div><div class="chips">${cats.map(x=>`<button class="chip" data-c="${x.id}" aria-pressed="${F.c===x.id}"><span class="sw" style="background:${catColor(x.id)}"></span>${esc(x.name)}</button>`).join('')||'<span class="note">Нет категорий — добавьте в настройках.</span>'}</div></div>`:''}
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
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') sync(); });
setInterval(()=>{ if(document.visibilityState==='visible') sync(); }, 60000);

let toastT=null;
function toast(msg){ const el=$('#toast'); el.textContent=msg; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>el.hidden=true,2600); }

/* ---------- boot ---------- */
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
if(AUTH && AUTH.user && AUTH.user.id) showMain(); else showLogin('');
})();

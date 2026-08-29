/* ============ لوحة تحكم متجر الوزني ============
   تعمل بالكامل داخل المتصفح. تحفظ مسودّة محلياً، وتنشر إلى GitHub
   (فيُعاد نشر الموقع تلقائياً عبر Vercel) أو تصدّر الملفات يدوياً.        */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const money = n => new Intl.NumberFormat('en-US').format(Math.round(n || 0));
const norm = s => String(s || '').toLowerCase().replace(/[ً-ْـ]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();

const DKEY = 'wz_draft_v1', TKEY = 'wz_gh_token';
const IMG_DIR = 'assets/img/products/';
const DATA_PATH = 'assets/js/data.js';

/* الحالة */
let D = null;          // المسودّة الحالية
let PUB = null;        // البيانات المنشورة (كما هي في data.js)
let dirty = false;

function markDirty(v = true){ dirty = v; document.body.classList.toggle('dirty', v); }

function loadState(){
  PUB = { SITE:clone(SITE), CATEGORIES:clone(CATEGORIES), BRANDS:clone(BRANDS), PRODUCTS:clone(PRODUCTS) };
  let d = null;
  try{ d = JSON.parse(localStorage.getItem(DKEY) || 'null'); }catch(e){}
  D = d && d.PRODUCTS ? d : clone(PUB);
  markDirty(!!d);
}
function saveDraft(){
  try{ localStorage.setItem(DKEY, JSON.stringify(D)); markDirty(true); }
  catch(e){ toast('تعذّر الحفظ محلياً — قد تكون مساحة المتصفح ممتلئة بسبب الصور.', 'err'); }
}
function discardDraft(){
  localStorage.removeItem(DKEY); D = clone(PUB); markDirty(false); renderAll();
  toast('رجعت البيانات إلى آخر نسخة منشورة', 'ok');
}

/* ============ تنبيهات ============ */
function toast(msg, type){
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.innerHTML = icon(type === 'err' ? 'close' : type === 'ok' ? 'check' : 'bolt') + `<span>${esc(msg)}</span>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3200);
}
function confirmBox(title, text, okLabel = 'تأكيد', danger = true){
  return new Promise(res => {
    let done = false;
    const finish = v => { if(done) return; done = true; res(v); };
    openSheet(title, `<p style="font-size:14.5px;line-height:1.8">${esc(text)}</p>`,
      `<button class="btn btn-ghost" data-x>إلغاء</button>
       <button class="btn ${danger ? 'btn-danger' : ''}" id="cfmOk">${esc(okLabel)}</button>`);
    // نُنهي الوعد قبل الإغلاق، لأن الإغلاق نفسه يُطلق حدث sheetclose
    $('#cfmOk').onclick = () => { finish(true); closeSheet(); };
    $('#sheet').addEventListener('sheetclose', () => finish(false), { once:true });
  });
}

/* ============ النافذة الجانبية ============ */
function openSheet(title, body, foot){
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = body;
  $('#sheetFoot').innerHTML = foot || '<button class="btn btn-ghost" data-x>إغلاق</button>';
  $('#sheet').classList.add('open');
  document.body.style.overflow = 'hidden';
  $$('.field select', $('#sheetBody')).forEach(s => s.classList.add('filled'));
}
function closeSheet(){
  const s = $('#sheet');
  if(!s.classList.contains('open')) return;
  s.classList.remove('open'); document.body.style.overflow = '';
  s.dispatchEvent(new Event('sheetclose'));
}

/* ============ قفل الدخول ============ */
async function sha256(str){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function tryUnlock(pass){
  const want = (D || { SITE }).SITE?.admin?.hash || SITE.admin.hash;
  return (await sha256(pass)) === want;
}
function initLock(){
  if(sessionStorage.getItem('wz_admin_ok') === '1'){ unlock(); return; }
  $('#lock').style.display = 'grid';
  $('#lockForm').addEventListener('submit', async e => {
    e.preventDefault();
    const v = $('#lockPass').value;
    if(await tryUnlock(v)){ sessionStorage.setItem('wz_admin_ok', '1'); unlock(); }
    else {
      $('#lockCard').classList.remove('shake'); void $('#lockCard').offsetWidth;
      $('#lockCard').classList.add('shake');
      $('#lockPass').value = ''; $('#lockPass').focus();
    }
  });
  $('#lockPass').focus();
}
function unlock(){ $('#lock').style.display = 'none'; $('#adm').style.display = 'block'; renderAll(); }

/* ============ مولّد ملف data.js ============ */
const ID_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function q(s){ return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'"; }
function val(v){
  if(v === null || v === undefined) return 'null';
  if(typeof v === 'number' || typeof v === 'boolean') return String(v);
  return q(v);
}
function inlineArr(a){ return '[' + a.map(val).join(', ') + ']'; }
function objLines(o, keys, ind){
  const pad = ' '.repeat(ind);
  return keys.filter(k => o[k] !== undefined && o[k] !== '' && o[k] !== null)
    .map(k => `${pad}${ID_RE.test(k) ? k : q(k)}: ${Array.isArray(o[k]) ? inlineArr(o[k]) : val(o[k])}`)
    .join(',\n');
}
function serializeData(d){
  const S = d.SITE;
  const L = [];
  L.push('/* =============================================================');
  L.push('   الوزني لتجارة الكهربائيات والإنارة الحديثة');
  L.push('   ملف البيانات — وُلّد من لوحة التحكم بتاريخ ' + new Date().toLocaleString('ar-IQ'));
  L.push('   يمكن تعديله يدوياً أيضاً، أو من admin.html');
  L.push('   ============================================================= */');
  L.push('');
  L.push('/* ---------- 1) إعدادات المتجر ---------- */');
  L.push('let SITE = {');
  L.push(objLines(S, ['name','shortName','nameEn','tagline','about','currency'], 2) + ',');
  L.push('  phones: [');
  L.push(S.phones.map(p => `    { label: ${q(p.label)}, number: ${q(p.number)}, intl: ${q(p.intl || '')} }`).join(',\n'));
  L.push('  ],');
  L.push(objLines(S, ['whatsapp','email','address','city'], 2) + ',');
  L.push('  hours: [');
  L.push(S.hours.map(h => `    { d: ${q(h.d)}, t: ${q(h.t)} }`).join(',\n'));
  L.push('  ],');
  L.push(`  geo: { lat: ${S.geo.lat}, lng: ${S.geo.lng}, zoom: ${S.geo.zoom || 15} },`);
  L.push('  social: [');
  L.push(S.social.map(s => `    { id: ${q(s.id)}, name: ${q(s.name)}, url: ${q(s.url || '')} }`).join(',\n'));
  L.push('  ],');
  const AD = S.admin || {};
  L.push('  // إعدادات لوحة التحكم (admin.html) — غيّر كلمة السر من داخل اللوحة نفسها');
  L.push('  admin: {');
  L.push(`    hash: ${q(AD.hash || '')},`);
  L.push(`    repo: ${q(AD.repo || '')},`);
  L.push(`    branch: ${q(AD.branch || 'main')}`);
  L.push('  },');
  L.push('  orders: {');
  L.push(objLines(S.orders, ['prefix'], 4) + ',');
  L.push(`    minOrder: ${+S.orders.minOrder || 0},`);
  L.push(`    deliveryFeeInCity: ${+S.orders.deliveryFeeInCity || 0},`);
  L.push(`    deliveryFeeOutCity: ${+S.orders.deliveryFeeOutCity || 0},`);
  L.push(`    freeDeliveryOver: ${+S.orders.freeDeliveryOver || 0},`);
  L.push(`    webhook: ${q(S.orders.webhook || '')}`);
  L.push('  },');
  L.push('  governorates: [');
  L.push('    ' + S.governorates.map(q).join(', '));
  L.push('  ]');
  L.push('};');
  L.push('');
  L.push('/* ---------- 2) شجرة الأقسام ---------- */');
  L.push('let CATEGORIES = [');
  L.push(d.CATEGORIES.map(c => {
    const subs = c.subs.map(s => `    { id: ${q(s.id)}, name: ${q(s.name)}, icon: ${q(s.icon)} }`).join(',\n');
    return `  {\n    id: ${q(c.id)}, name: ${q(c.name)}, icon: ${q(c.icon)},\n    blurb: ${q(c.blurb || '')},\n    subs: [\n${subs}\n    ]\n  }`;
  }).join(',\n'));
  L.push('];');
  L.push('');
  L.push('/* ---------- 3) العلامات التجارية ---------- */');
  L.push('let BRANDS = [');
  L.push(d.BRANDS.map(b => `  { name: ${q(b.name)}, ar: ${q(b.ar || '')} }`).join(',\n'));
  L.push('];');
  L.push('');
  L.push('/* ---------- 4) المنتجات ---------- */');
  L.push('let PRODUCTS = [');
  L.push(d.PRODUCTS.map(p => {
    const head = ['id','name','brand'].map(k => `${k}: ${q(p[k])}`).join(', ');
    const nums = [`price: ${+p.price}`];
    if(p.old) nums.push(`old: ${+p.old}`);
    const tail = [`icon: ${q(p.icon)}`];
    if(p.badge) tail.push(`badge: ${q(p.badge)}`);
    if(p.unit && p.unit !== 'حبة') tail.push(`unit: ${q(p.unit)}`);
    if(p.image) tail.push(`image: ${q(p.image)}`);
    let s = `  { ${head}, ${nums.join(', ')}, ${tail.join(', ')},\n`;
    s += `    cats: ${inlineArr(p.cats)}, desc: ${q(p.desc || '')},\n`;
    s += `    specs: ${inlineArr(p.specs || [])} }`;
    return s;
  }).join(',\n'));
  L.push('];');
  L.push('');
  return L.join('\n');
}
function exportData(){
  const d = clone(D);
  d.PRODUCTS.forEach(p => { delete p.imgData; delete p.imgNew; });
  return serializeData(d);
}

/* ============ تبويب المنتجات ============ */
let pf = { q:'', cat:'', brand:'', sort:'new' };
let sel = new Set();

function subName(key){
  const [c, s] = String(key).split('/');
  const cc = D.CATEGORIES.find(x => x.id === c); if(!cc) return key;
  const ss = cc.subs.find(x => x.id === s);
  return ss ? ss.name : cc.name;
}
function filteredProducts(){
  let out = D.PRODUCTS.slice();
  if(pf.q){ const t = norm(pf.q);
    out = out.filter(p => norm([p.name, p.brand, p.id, p.desc, (p.specs||[]).join(' ')].join(' ')).includes(t)); }
  if(pf.cat)   out = out.filter(p => p.cats.some(c => c === pf.cat || c.split('/')[0] === pf.cat));
  if(pf.brand) out = out.filter(p => p.brand === pf.brand);
  if(pf.sort === 'name')    out.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  if(pf.sort === 'price-a') out.sort((a, b) => a.price - b.price);
  if(pf.sort === 'price-d') out.sort((a, b) => b.price - a.price);
  if(pf.sort === 'brand')   out.sort((a, b) => a.brand.localeCompare(b.brand));
  return out;
}
function renderProducts(){
  const brands = [...new Set(D.PRODUCTS.map(p => p.brand))].sort();
  $('#pTools').innerHTML = `
    <input type="text" id="pq" placeholder="ابحث بالاسم أو الرقم أو العلامة…" value="${esc(pf.q)}">
    <select id="pcat"><option value="">كل الأقسام</option>
      ${D.CATEGORIES.map(c => `<optgroup label="${esc(c.name)}">
        <option value="${c.id}"${pf.cat === c.id ? ' selected' : ''}>كل ${esc(c.name)}</option>
        ${c.subs.map(s => `<option value="${c.id}/${s.id}"${pf.cat === c.id + '/' + s.id ? ' selected' : ''}>— ${esc(s.name)}</option>`).join('')}
      </optgroup>`).join('')}
    </select>
    <select id="pbrand"><option value="">كل العلامات</option>
      ${brands.map(b => `<option${pf.brand === b ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select>
    <select id="psort">
      <option value="new"${pf.sort === 'new' ? ' selected' : ''}>الترتيب الأصلي</option>
      <option value="name"${pf.sort === 'name' ? ' selected' : ''}>الاسم أ — ي</option>
      <option value="brand"${pf.sort === 'brand' ? ' selected' : ''}>العلامة التجارية</option>
      <option value="price-a"${pf.sort === 'price-a' ? ' selected' : ''}>السعر: الأقل</option>
      <option value="price-d"${pf.sort === 'price-d' ? ' selected' : ''}>السعر: الأعلى</option>
    </select>`;
  $('#pq').oninput    = e => { pf.q = e.target.value; renderTable(); };
  $('#pcat').onchange = e => { pf.cat = e.target.value; renderTable(); };
  $('#pbrand').onchange = e => { pf.brand = e.target.value; renderTable(); };
  $('#psort').onchange = e => { pf.sort = e.target.value; renderTable(); };
  renderTable();
}
function renderTable(){
  const rows = filteredProducts();
  $('#pCount').textContent = rows.length;
  renderBulk(rows);
  const allSel = rows.length > 0 && rows.every(p => sel.has(p.id));
  $('#pTable').innerHTML = `
    <div class="trow head"><span><input type="checkbox" id="selAll"${allSel ? ' checked' : ''} aria-label="تحديد الكل"></span><span>المادة</span><span>العلامة</span><span>السعر</span><span>الحالة</span><span></span></div>
    ${rows.length ? rows.map(p => `<div class="trow" data-row="${esc(p.id)}" role="button" tabindex="0">
      <span class="tsel"><input type="checkbox" data-sel="${esc(p.id)}"${sel.has(p.id) ? ' checked' : ''} aria-label="تحديد"></span>
      <span class="tthumb">${p.imgData || p.image ? `<img src="${esc(p.imgData || p.image)}" alt="">` : art(p.icon)}</span>
      <span class="tname"><b>${esc(p.name)}</b><small>${esc(p.id)}</small>
        <span class="tcats">${p.cats.map(c => `<span>${esc(subName(c))}</span>`).join('')}</span></span>
      <span class="thide">${esc(p.brand)}</span>
      <span class="tprice">${money(p.price)}${p.old ? `<s>${money(p.old)}</s>` : ''}</span>
      <span class="thide">${p.badge ? `<span class="bdg bdg-${p.badge}">${badgeName(p.badge)}</span>` : '—'}</span>
      <span class="tacts">
        <button class="ibtn" data-edit="${esc(p.id)}" title="تعديل">${icon('edit')}</button>
        <button class="ibtn del" data-del="${esc(p.id)}" title="حذف">${icon('trash')}</button>
      </span></div>`).join('')
    : `<div style="padding:44px;text-align:center;color:var(--grey)">لا توجد مواد مطابقة للبحث</div>`}`;
}
function renderBulk(rows){
  const bar = $('#bulkBar');
  const shown = rows.filter(p => sel.has(p.id)).length;
  if(!sel.size){ bar.classList.remove('on'); bar.innerHTML = ''; return; }
  bar.classList.add('on');
  bar.innerHTML = `<b>حُدِّدت ${sel.size} مادة${shown !== sel.size ? ` (${shown} منها ظاهرة الآن)` : ''}</b>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-inline-start:auto">
      <button class="btn btn-sm btn-ghost" id="bulkNone">إلغاء التحديد</button>
      <button class="btn btn-sm btn-danger" id="bulkDel">${icon('trash')}<span>حذف المحدد (${sel.size})</span></button>
    </div>`;
  $('#bulkNone').onclick = () => { sel.clear(); renderTable(); };
  $('#bulkDel').onclick = async () => {
    if(await confirmBox('حذف المواد المحددة',
      `سيُحذف ${sel.size} مادة نهائياً من المتجر. يمكنك التراجع بزر «تجاهل التغييرات» ما دمت لم تنشر بعد.`, `حذف ${sel.size} مادة`)){
      D.PRODUCTS = D.PRODUCTS.filter(p => !sel.has(p.id));
      const n = sel.size; sel.clear();
      saveDraft(); renderTable(); renderStats(); renderProducts();
      toast(`حُذفت ${n} مادة`, 'ok');
    }
  };
}
function badgeName(b){ return b === 'hot' ? 'الأكثر طلباً' : b === 'new' ? 'جديد' : b === 'sale' ? 'تخفيض' : ''; }

function nextId(cats){
  const pre = { lighting:'LT', cables:'CB', tools:'TL', boards:'BD', electrical:'EL' }[String(cats[0] || '').split('/')[0]] || 'PR';
  let n = 100;
  D.PRODUCTS.forEach(p => { const m = String(p.id).match(new RegExp('^' + pre + '-(\\d+)$')); if(m) n = Math.max(n, +m[1]); });
  return `${pre}-${n + 1}`;
}

function productSheet(id){
  const isNew = !id;
  const p = isNew
    ? { id:'', name:'', brand:'', price:0, old:0, icon:'bulb', badge:'', unit:'حبة', cats:[], desc:'', specs:[] }
    : clone(D.PRODUCTS.find(x => x.id === id));
  if(!p) return;
  let specs = (p.specs || []).slice();
  let cats = (p.cats || []).slice();
  let iconSel = p.icon || 'bulb';
  let imgData = p.imgData || '', imgPath = p.image || '', imgNew = false;

  openSheet(isNew ? 'إضافة مادة جديدة' : 'تعديل المادة', `
    <div class="form">
      <div class="field"><input id="fn" placeholder=" " value="${esc(p.name)}"><label>اسم المادة *</label><span class="msg">الاسم مطلوب</span></div>
      <div class="f2">
        <div class="field"><input id="fb" placeholder=" " value="${esc(p.brand)}" list="brandList"><label>العلامة التجارية *</label><span class="msg">مطلوب</span>
          <datalist id="brandList">${D.BRANDS.map(b => `<option value="${esc(b.name)}">`).join('')}</datalist></div>
        <div class="field"><input id="fu" placeholder=" " value="${esc(p.unit || 'حبة')}"><label>وحدة البيع (حبة / لفة / متر …)</label></div>
      </div>
      <div class="f2">
        <div class="field"><input id="fp" placeholder=" " inputmode="numeric" value="${p.price || ''}"><label>السعر بالدينار *</label><span class="msg">أدخل سعراً صحيحاً</span></div>
        <div class="field"><input id="fo" placeholder=" " inputmode="numeric" value="${p.old || ''}"><label>السعر قبل التخفيض (اختياري)</label></div>
      </div>
      <div class="f2">
        <div class="field"><select id="fg">
          <option value="">بدون شارة</option>
          <option value="hot"${p.badge === 'hot' ? ' selected' : ''}>الأكثر طلباً</option>
          <option value="new"${p.badge === 'new' ? ' selected' : ''}>جديد</option>
          <option value="sale"${p.badge === 'sale' ? ' selected' : ''}>تخفيض</option>
        </select><label>الشارة</label>${icon('chevronDown', 'cv')}</div>
        <div class="field"><input id="fi" placeholder=" " value="${esc(p.id)}" dir="ltr"${isNew ? '' : ' readonly'}><label>رقم المادة${isNew ? ' (يُولَّد تلقائياً)' : ' (لا يمكن تغييره)'}</label></div>
      </div>
      <div class="field"><textarea id="fd" placeholder=" ">${esc(p.desc || '')}</textarea><label>وصف المادة</label></div>

      <div><h4 style="font-size:14px;margin-bottom:8px">الأقسام <small style="color:var(--grey);font-weight:600">— يمكن اختيار أكثر من قسم</small></h4>
        <div class="catpick" id="catpick">${D.CATEGORIES.map(c => `<div class="cg"><b>${esc(c.name)}</b><div class="opts">
          ${c.subs.map(s => { const k = c.id + '/' + s.id;
            return `<label class="cbx"><input type="checkbox" value="${k}"${cats.includes(k) ? ' checked' : ''}><span>${esc(s.name)}</span></label>`; }).join('')}
        </div></div>`).join('')}</div>
        <span class="msg" id="catMsg" style="display:none;color:var(--danger);font-size:11.5px;font-weight:700">اختر قسماً واحداً على الأقل</span>
      </div>

      <div><h4 style="font-size:14px;margin-bottom:8px">المواصفات</h4>
        <div style="display:flex;gap:8px"><input type="text" id="specIn" placeholder="مثال: 12 واط" style="flex:1;padding:10px 14px;border-radius:var(--r-pill);border:1.5px solid var(--line);background:var(--surface-2)">
          <button class="btn btn-sm btn-tonal" type="button" id="specAdd">${icon('plus')}<span>إضافة</span></button></div>
        <div class="chiplist" id="specList"></div>
      </div>

      <div><h4 style="font-size:14px;margin-bottom:8px">صورة المادة</h4>
        <div class="imgbox">
          <div class="prev" id="imgPrev">${imgData || imgPath ? `<img src="${esc(imgData || imgPath)}" alt="">` : art(iconSel)}</div>
          <div class="meta" id="imgMeta">${imgPath ? `الصورة الحالية: <code>${esc(imgPath)}</code>` : 'لا توجد صورة — تُستخدم الرسمة التوضيحية أدناه.'}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <label class="btn btn-sm btn-tonal">${icon('box')}<span>اختيار صورة</span>
              <input type="file" id="imgIn" accept="image/*" hidden></label>
            <button class="btn btn-sm btn-ghost" type="button" id="imgDel"${imgData || imgPath ? '' : ' style="display:none"'}>${icon('trash')}<span>إزالة</span></button>
          </div>
        </div>
      </div>

      <div><h4 style="font-size:14px;margin-bottom:8px">الرسمة التوضيحية <small style="color:var(--grey);font-weight:600">— تظهر إن لم توجد صورة</small></h4>
        <div class="iconpick" id="iconpick">${Object.keys(ART).map(k =>
          `<button type="button" data-ic="${k}" class="${k === iconSel ? 'on' : ''}">${art(k)}<i>${k}</i></button>`).join('')}</div>
      </div>
    </div>`,
    `<button class="btn btn-ghost" data-x>إلغاء</button>
     <button class="btn" id="pSave">${icon('check')}<span>${isNew ? 'إضافة المادة' : 'حفظ التعديلات'}</span></button>`);

  const drawSpecs = () => {
    $('#specList').innerHTML = specs.map((s, i) =>
      `<span class="cl">${esc(s)}<button type="button" data-sx="${i}">${icon('close')}</button></span>`).join('')
      || '<small style="color:var(--grey-2);font-size:12px">لم تُضف مواصفات بعد</small>';
  };
  drawSpecs();
  $('#specList').onclick = e => { const b = e.target.closest('[data-sx]'); if(b){ specs.splice(+b.dataset.sx, 1); drawSpecs(); } };
  const addSpec = () => { const v = $('#specIn').value.trim(); if(v){ specs.push(v); $('#specIn').value = ''; drawSpecs(); } };
  $('#specAdd').onclick = addSpec;
  $('#specIn').onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); addSpec(); } };

  $('#iconpick').onclick = e => {
    const b = e.target.closest('[data-ic]'); if(!b) return;
    iconSel = b.dataset.ic;
    $$('#iconpick button').forEach(x => x.classList.toggle('on', x === b));
    if(!imgData && !imgPath) $('#imgPrev').innerHTML = art(iconSel);
  };
  $('#imgIn').onchange = async e => {
    const f = e.target.files[0]; if(!f) return;
    try{
      imgData = await resizeImage(f, 900, .82);
      imgNew = true;
      $('#imgPrev').innerHTML = `<img src="${imgData}" alt="">`;
      $('#imgMeta').innerHTML = `صورة جديدة جاهزة — <b>${Math.round(imgData.length * 0.75 / 1024)} كيلوبايت</b>. تُرفع عند النشر.`;
      $('#imgDel').style.display = '';
    }catch(err){ toast('تعذّرت قراءة الصورة', 'err'); }
  };
  $('#imgDel').onclick = () => {
    imgData = ''; imgPath = ''; imgNew = false;
    $('#imgPrev').innerHTML = art(iconSel);
    $('#imgMeta').textContent = 'لا توجد صورة — تُستخدم الرسمة التوضيحية.';
    $('#imgDel').style.display = 'none';
  };

  $('#pSave').onclick = () => {
    const name = $('#fn').value.trim(), brand = $('#fb').value.trim();
    const price = parseInt(String($('#fp').value).replace(/\D/g, ''), 10) || 0;
    const old = parseInt(String($('#fo').value).replace(/\D/g, ''), 10) || 0;
    cats = $$('#catpick input:checked').map(x => x.value);
    let ok = true;
    const mark = (sel, bad) => { $(sel).closest('.field').classList.toggle('err', bad); if(bad) ok = false; };
    mark('#fn', name.length < 2); mark('#fb', brand.length < 1); mark('#fp', price <= 0);
    $('#catMsg').style.display = cats.length ? 'none' : 'block'; if(!cats.length) ok = false;
    if(!ok){ toast('أكمل الحقول المطلوبة', 'err'); return; }

    const pid = isNew ? (($('#fi').value.trim()) || nextId(cats)) : p.id;
    if(isNew && D.PRODUCTS.some(x => x.id === pid)){ toast('رقم المادة مستخدم مسبقاً', 'err'); return; }

    const rec = { id:pid, name, brand, price, icon:iconSel, cats, desc:$('#fd').value.trim(), specs };
    if(old > price) rec.old = old;
    const badge = $('#fg').value; if(badge) rec.badge = badge;
    const unit = $('#fu').value.trim(); if(unit && unit !== 'حبة') rec.unit = unit;
    if(imgNew){ rec.imgData = imgData; rec.image = IMG_DIR + pid + '.jpg'; rec.imgNew = true; }
    else if(imgPath){ rec.image = imgPath; if(imgData) rec.imgData = imgData; if(p.imgNew) rec.imgNew = true; }

    if(isNew) D.PRODUCTS.push(rec);
    else D.PRODUCTS[D.PRODUCTS.findIndex(x => x.id === p.id)] = rec;
    saveDraft(); closeSheet(); renderTable(); renderStats();
    toast(isNew ? `أُضيفت «${name}»` : `حُفظت تعديلات «${name}»`, 'ok');
  };
}

/* تصغير الصورة داخل المتصفح */
function resizeImage(file, max, quality){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = rej;
    fr.onload = () => {
      const im = new Image();
      im.onerror = rej;
      im.onload = () => {
        let { width:w, height:h } = im;
        const sc = Math.min(1, max / Math.max(w, h));
        w = Math.round(w * sc); h = Math.round(h * sc);
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
        cx.drawImage(im, 0, 0, w, h);
        res(cv.toDataURL('image/jpeg', quality));
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* ============ تبويب الأقسام ============ */
function renderCats(){
  $('#cList').innerHTML = D.CATEGORIES.map((c, i) => `
    <div class="panel" style="margin-bottom:16px">
      <div class="panel-h">
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
          ${art(c.icon)}
          <div style="min-width:0"><b style="font-size:15.5px;display:block">${esc(c.name)}</b>
            <small style="color:var(--grey);font-size:12px">${c.subs.length} قسم فرعي · ${countIn(c.id)} منتج · <code style="direction:ltr">${esc(c.id)}</code></small></div>
        </div>
        <div class="tacts">
          <button class="ibtn" data-cup="${i}" title="تحريك للأعلى"${i === 0 ? ' disabled' : ''}>${icon('chevronDown')}</button>
          <button class="ibtn" data-cedit="${c.id}" title="تعديل">${icon('edit')}</button>
          <button class="ibtn del" data-cdel="${c.id}" title="حذف">${icon('trash')}</button>
        </div>
      </div>
      <div class="panel-b">
        ${c.subs.map(s => `<div class="subedit">
          ${art(s.icon)}
          <b style="flex:1;font-size:13.5px">${esc(s.name)}</b>
          <span class="id">${esc(s.id)}</span>
          <span style="font-size:12px;color:var(--grey);font-weight:700">${countIn(c.id + '/' + s.id)} منتج</span>
          <button class="ibtn" data-sedit="${c.id}|${s.id}" title="تعديل" style="width:32px;height:32px">${icon('edit')}</button>
          <button class="ibtn del" data-sdel="${c.id}|${s.id}" title="حذف" style="width:32px;height:32px">${icon('trash')}</button>
        </div>`).join('')}
        <button class="btn btn-sm btn-tonal" data-sadd="${c.id}" style="margin-top:8px">${icon('plus')}<span>إضافة قسم فرعي</span></button>
      </div>
    </div>`).join('');
}
function countIn(key){
  return D.PRODUCTS.filter(p => key.includes('/') ? p.cats.includes(key) : p.cats.some(c => c.split('/')[0] === key)).length;
}
const AR2LAT = { 'ا':'a','أ':'a','إ':'a','آ':'a','ٱ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh',
  'د':'d','ذ':'th','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh',
  'ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','ة':'a','و':'w','ؤ':'w','ي':'y','ى':'a','ئ':'y','ء':'' };
/* يحوّل الاسم العربي إلى معرّف لاتيني مقروء يظهر في رابط القسم */
function slugFrom(name, taken){
  let base = String(name).trim().toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .split('').map(ch => AR2LAT[ch] !== undefined ? AR2LAT[ch] : ch).join('')
    .replace(/\bal-?/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .split('-').filter(Boolean).slice(0, 3).join('-');
  if(!base) base = 'cat';
  let s = base, n = 1;
  while(taken.includes(s)) s = base + '-' + (++n);
  return s;
}
function iconPickHTML(sel){
  return `<div class="iconpick" id="iconpick2">${Object.keys(ART).map(k =>
    `<button type="button" data-ic="${k}" class="${k === sel ? 'on' : ''}">${art(k)}<i>${k}</i></button>`).join('')}</div>`;
}
function bindIconPick(cur, cb){
  $('#iconpick2').onclick = e => {
    const b = e.target.closest('[data-ic]'); if(!b) return;
    cb(b.dataset.ic);
    $$('#iconpick2 button').forEach(x => x.classList.toggle('on', x === b));
  };
}
function catSheet(id){
  const isNew = !id;
  const c = isNew ? { id:'', name:'', icon:'bulb', blurb:'', subs:[] } : D.CATEGORIES.find(x => x.id === id);
  let ic = c.icon;
  openSheet(isNew ? 'إضافة قسم رئيسي' : 'تعديل القسم', `
    <div class="form">
      <div class="field"><input id="cn" placeholder=" " value="${esc(c.name)}"><label>اسم القسم *</label><span class="msg">الاسم مطلوب</span></div>
      <div class="field"><input id="cb" placeholder=" " value="${esc(c.blurb || '')}"><label>وصف قصير يظهر تحت الاسم</label></div>
      ${isNew ? '' : `<div class="note note-info">${icon('bolt')}<span>معرّف القسم <code>${esc(c.id)}</code> ثابت لأن المنتجات مرتبطة به.</span></div>`}
      <div><h4 style="font-size:14px;margin-bottom:8px">أيقونة القسم</h4>${iconPickHTML(ic)}</div>
    </div>`,
    `<button class="btn btn-ghost" data-x>إلغاء</button><button class="btn" id="cSave">${icon('check')}<span>حفظ</span></button>`);
  bindIconPick(ic, v => ic = v);
  $('#cSave').onclick = () => {
    const name = $('#cn').value.trim();
    if(name.length < 2){ $('#cn').closest('.field').classList.add('err'); return; }
    if(isNew){
      D.CATEGORIES.push({ id:slugFrom(name, D.CATEGORIES.map(x => x.id)), name, icon:ic, blurb:$('#cb').value.trim(), subs:[] });
    } else { c.name = name; c.icon = ic; c.blurb = $('#cb').value.trim(); }
    saveDraft(); closeSheet(); renderCats(); renderStats();
    toast(isNew ? 'أُضيف القسم' : 'حُفظ القسم', 'ok');
  };
}
function subSheet(cid, sid){
  const c = D.CATEGORIES.find(x => x.id === cid); if(!c) return;
  const isNew = !sid;
  const s = isNew ? { id:'', name:'', icon:'bulb' } : c.subs.find(x => x.id === sid);
  let ic = s.icon;
  openSheet(isNew ? `إضافة قسم فرعي إلى «${c.name}»` : 'تعديل القسم الفرعي', `
    <div class="form">
      <div class="field"><input id="sn" placeholder=" " value="${esc(s.name)}"><label>اسم القسم الفرعي *</label><span class="msg">الاسم مطلوب</span></div>
      ${isNew ? '' : `<div class="note note-info">${icon('bolt')}<span>المعرّف <code>${esc(cid)}/${esc(s.id)}</code> ثابت.</span></div>`}
      <div><h4 style="font-size:14px;margin-bottom:8px">الأيقونة</h4>${iconPickHTML(ic)}</div>
    </div>`,
    `<button class="btn btn-ghost" data-x>إلغاء</button><button class="btn" id="sSave">${icon('check')}<span>حفظ</span></button>`);
  bindIconPick(ic, v => ic = v);
  $('#sSave').onclick = () => {
    const name = $('#sn').value.trim();
    if(name.length < 2){ $('#sn').closest('.field').classList.add('err'); return; }
    if(isNew) c.subs.push({ id:slugFrom(name, c.subs.map(x => x.id)), name, icon:ic });
    else { s.name = name; s.icon = ic; }
    saveDraft(); closeSheet(); renderCats(); renderStats();
    toast(isNew ? 'أُضيف القسم الفرعي' : 'حُفظ القسم الفرعي', 'ok');
  };
}

/* ============ تبويب العلامات التجارية ============ */
function renderBrands(){
  $('#bList').innerHTML = D.BRANDS.map((b, i) => `<div class="subedit">
    <b style="flex:1;font-size:14px">${esc(b.name)}</b>
    <span style="color:var(--grey);font-size:13px;flex:1">${esc(b.ar || '')}</span>
    <span style="font-size:12px;color:var(--grey-2);font-weight:700">${D.PRODUCTS.filter(p => p.brand === b.name).length} منتج</span>
    <button class="ibtn" data-bedit="${i}" style="width:32px;height:32px">${icon('edit')}</button>
    <button class="ibtn del" data-bdel="${i}" style="width:32px;height:32px">${icon('trash')}</button>
  </div>`).join('') || '<p style="color:var(--grey);padding:14px">لا توجد علامات — أضف أول علامة.</p>';
}
function brandSheet(i){
  const isNew = i === null;
  const b = isNew ? { name:'', ar:'' } : D.BRANDS[i];
  openSheet(isNew ? 'إضافة علامة تجارية' : 'تعديل العلامة', `
    <div class="form">
      <div class="f2">
        <div class="field"><input id="bn" placeholder=" " value="${esc(b.name)}" dir="ltr"><label>الاسم بالإنكليزية *</label><span class="msg">مطلوب</span></div>
        <div class="field"><input id="ba" placeholder=" " value="${esc(b.ar || '')}"><label>الاسم بالعربية</label></div>
      </div>
    </div>`,
    `<button class="btn btn-ghost" data-x>إلغاء</button><button class="btn" id="bSave">${icon('check')}<span>حفظ</span></button>`);
  $('#bSave').onclick = () => {
    const name = $('#bn').value.trim();
    if(!name){ $('#bn').closest('.field').classList.add('err'); return; }
    if(isNew) D.BRANDS.push({ name, ar:$('#ba').value.trim() });
    else { const old = b.name; b.name = name; b.ar = $('#ba').value.trim();
      D.PRODUCTS.forEach(p => { if(p.brand === old) p.brand = name; }); }
    saveDraft(); closeSheet(); renderBrands(); renderStats(); renderProducts();
    toast('حُفظت العلامة', 'ok');
  };
}

/* ============ تبويب الإعدادات ============ */
function renderSettings(){
  const S = D.SITE;
  $('#setForm').innerHTML = `
    <div class="form">
      <h3 style="font-size:16px">معلومات المحل</h3>
      <div class="field"><input id="sName" placeholder=" " value="${esc(S.name)}"><label>اسم المحل</label></div>
      <div class="f2">
        <div class="field"><input id="sShort" placeholder=" " value="${esc(S.shortName)}"><label>الاسم المختصر</label></div>
        <div class="field"><input id="sTag" placeholder=" " value="${esc(S.tagline)}"><label>التاك لاين</label></div>
      </div>
      <div class="field"><textarea id="sAbout" placeholder=" ">${esc(S.about)}</textarea><label>نبذة عن المحل</label></div>
      <div class="field"><input id="sAddr" placeholder=" " value="${esc(S.address)}"><label>العنوان</label></div>

      <h3 style="font-size:16px;margin-top:10px">أرقام التواصل</h3>
      <div id="phoneList"></div>
      <button class="btn btn-sm btn-tonal" type="button" id="phAdd">${icon('plus')}<span>إضافة رقم</span></button>
      <div class="field"><input id="sWa" placeholder=" " value="${esc(S.whatsapp)}" dir="ltr"><label>رقم واتساب لاستقبال الطلبات (بصيغة 9647XXXXXXXXX)</label></div>

      <h3 style="font-size:16px;margin-top:10px">الموقع على الخريطة</h3>
      <div class="note note-info">${icon('location')}<span>الصق رابط خرائط كوكل هنا وسنستخرج الإحداثيات تلقائياً — افتح الخريطة، اضغط مطوّلاً على موقع المحل، ثم «مشاركة» و«نسخ الرابط».</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <input type="text" id="mapUrl" placeholder="https://maps.app.goo.gl/…" style="flex:1;min-width:200px;padding:12px 14px;border-radius:var(--r-sm);border:1.5px solid var(--line);background:#fff" dir="ltr">
        <button class="btn btn-tonal" type="button" id="mapGo">${icon('check')}<span>استخراج</span></button>
      </div>
      <div class="f2">
        <div class="field"><input id="sLat" placeholder=" " value="${S.geo.lat}" dir="ltr"><label>خط العرض (lat)</label></div>
        <div class="field"><input id="sLng" placeholder=" " value="${S.geo.lng}" dir="ltr"><label>خط الطول (lng)</label></div>
      </div>

      <h3 style="font-size:16px;margin-top:10px">التواصل الاجتماعي <small style="color:var(--grey);font-weight:600">— اتركه فارغاً ليختفي</small></h3>
      ${S.social.map((x, i) => `<div class="field"><input id="soc${i}" placeholder=" " value="${esc(x.url || '')}" dir="ltr"><label>${esc(x.name)}</label></div>`).join('')}

      <h3 style="font-size:16px;margin-top:10px">أوقات الدوام</h3>
      ${S.hours.map((h, i) => `<div class="f2">
        <div class="field"><input id="hd${i}" placeholder=" " value="${esc(h.d)}"><label>الأيام</label></div>
        <div class="field"><input id="ht${i}" placeholder=" " value="${esc(h.t)}"><label>الأوقات</label></div></div>`).join('')}

      <h3 style="font-size:16px;margin-top:10px">التوصيل والطلبات</h3>
      <div class="f2">
        <div class="field"><input id="oIn" placeholder=" " inputmode="numeric" value="${S.orders.deliveryFeeInCity}"><label>أجرة التوصيل داخل ${esc(S.city)}</label></div>
        <div class="field"><input id="oOut" placeholder=" " inputmode="numeric" value="${S.orders.deliveryFeeOutCity}"><label>أجرة التوصيل خارج المحافظة</label></div>
      </div>
      <div class="f2">
        <div class="field"><input id="oFree" placeholder=" " inputmode="numeric" value="${S.orders.freeDeliveryOver}"><label>توصيل مجاني عند تجاوز (0 = معطّل)</label></div>
        <div class="field"><input id="oHook" placeholder=" " value="${esc(S.orders.webhook || '')}" dir="ltr"><label>رابط حفظ الطلبات الخارجي (اختياري)</label></div>
      </div>

      <h3 style="font-size:16px;margin-top:10px">كلمة سر لوحة التحكم</h3>
      <div class="f2">
        <div class="field"><input id="pw1" type="password" placeholder=" " autocomplete="new-password"><label>كلمة سر جديدة</label></div>
        <div class="field"><input id="pw2" type="password" placeholder=" " autocomplete="new-password"><label>تأكيد كلمة السر</label></div>
      </div>
      <button class="btn btn-tonal" type="button" id="pwSave">${icon('shield')}<span>تغيير كلمة السر</span></button>

      <button class="btn btn-lg btn-block" type="button" id="setSave" style="margin-top:14px">${icon('check')}<span>حفظ الإعدادات</span></button>
    </div>`;

  const drawPhones = () => {
    $('#phoneList').innerHTML = S.phones.map((p, i) => `<div class="subedit">
      <input value="${esc(p.label)}" data-phl="${i}" placeholder="الوصف">
      <input value="${esc(p.number)}" data-phn="${i}" placeholder="07XXXXXXXXX" dir="ltr">
      <button class="ibtn del" data-phd="${i}" style="width:32px;height:32px">${icon('trash')}</button></div>`).join('');
  };
  drawPhones();
  $('#phAdd').onclick = () => { S.phones.push({ label:'رقم إضافي', number:'', intl:'' }); drawPhones(); };
  $('#phoneList').onclick = e => { const b = e.target.closest('[data-phd]');
    if(b && S.phones.length > 1){ S.phones.splice(+b.dataset.phd, 1); drawPhones(); } };

  $('#mapGo').onclick = async () => {
    const u = $('#mapUrl').value.trim(); if(!u) return;
    const c = await coordsFromMapUrl(u);
    if(c){ $('#sLat').value = c.lat; $('#sLng').value = c.lng; toast('استُخرجت الإحداثيات بنجاح', 'ok'); }
    else toast('لم نتمكن من قراءة الرابط — انسخ الإحداثيات يدوياً من كوكل', 'err');
  };
  $('#pwSave').onclick = async () => {
    const a = $('#pw1').value, b = $('#pw2').value;
    if(a.length < 6){ toast('كلمة السر يجب أن تكون 6 أحرف فأكثر', 'err'); return; }
    if(a !== b){ toast('كلمتا السر غير متطابقتين', 'err'); return; }
    S.admin.hash = await sha256(a);
    $('#pw1').value = $('#pw2').value = '';
    saveDraft();
    toast('غُيّرت كلمة السر — تصبح فعّالة بعد النشر', 'ok');
  };
  $('#setSave').onclick = () => {
    S.name = $('#sName').value.trim(); S.shortName = $('#sShort').value.trim();
    S.tagline = $('#sTag').value.trim(); S.about = $('#sAbout').value.trim();
    S.address = $('#sAddr').value.trim(); S.whatsapp = $('#sWa').value.replace(/\D/g, '');
    S.phones.forEach((p, i) => {
      const l = $(`[data-phl="${i}"]`), n = $(`[data-phn="${i}"]`);
      if(l) p.label = l.value.trim();
      if(n){ p.number = n.value.replace(/\D/g, ''); p.intl = p.number.replace(/^0/, '964'); }
    });
    S.phones = S.phones.filter(p => p.number);
    S.geo.lat = parseFloat($('#sLat').value) || S.geo.lat;
    S.geo.lng = parseFloat($('#sLng').value) || S.geo.lng;
    S.social.forEach((x, i) => { const el = $('#soc' + i); if(el) x.url = el.value.trim(); });
    S.hours.forEach((h, i) => { h.d = $('#hd' + i).value.trim(); h.t = $('#ht' + i).value.trim(); });
    S.orders.deliveryFeeInCity  = +String($('#oIn').value).replace(/\D/g, '') || 0;
    S.orders.deliveryFeeOutCity = +String($('#oOut').value).replace(/\D/g, '') || 0;
    S.orders.freeDeliveryOver   = +String($('#oFree').value).replace(/\D/g, '') || 0;
    S.orders.webhook = $('#oHook').value.trim();
    saveDraft(); renderSettings(); renderStats();
    toast('حُفظت الإعدادات في المسودّة', 'ok');
  };
}

/* استخراج الإحداثيات من رابط خرائط كوكل */
async function coordsFromMapUrl(url){
  const pick = u => {
    let m = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)                       // /maps/@lat,lng,z
      || u.match(/[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)                  // ?q=lat,lng
      || u.match(/[?&]query=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)              // ?query=lat,lng
      || u.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/)                    // ?ll=lat,lng
      || u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)                      // data=!3dlat!4dlng
      || u.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);            // lat,lng مباشرة
    return m ? { lat:+m[1], lng:+m[2] } : null;
  };
  let c = pick(url);
  if(c) return c;
  // الروابط المختصرة (maps.app.goo.gl) تحتاج فتحاً — نحاول قراءة العنوان النهائي
  try{
    const r = await fetch(url, { redirect:'follow' });
    c = pick(r.url) || pick(await r.text());
    if(c) return c;
  }catch(e){}
  return null;
}

/* ============ تبويب النشر ============ */
function renderPublish(){
  const pend = D.PRODUCTS.filter(p => p.imgNew && p.imgData);
  const tok = localStorage.getItem(TKEY) || '';
  const diff = countChanges();
  $('#pubBody').innerHTML = `
    <div class="stat-row">
      <div class="stat"><b>${diff.added}</b><span>مادة مضافة</span></div>
      <div class="stat"><b>${diff.edited}</b><span>مادة معدّلة</span></div>
      <div class="stat"><b>${diff.removed}</b><span>مادة محذوفة</span></div>
      <div class="stat"><b>${pend.length}</b><span>صورة جديدة</span></div>
    </div>

    <div class="panel" style="margin-bottom:18px">
      <div class="panel-h"><h3>${tok ? 'النشر' : 'التوصيل — خطوة واحدة لمرة واحدة'}</h3>
        ${tok ? '<span class="okpill">متصل</span>' : ''}</div>
      <div class="panel-b">
        ${tok ? `
          <p style="color:var(--grey);font-size:13.5px;margin-bottom:14px">
            لوحتك موصولة. اضغط الزر وستظهر تعديلاتك على الموقع خلال ثوانٍ — من الهاتف أو الحاسبة.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-lg" id="pubGo">${icon('bolt')}<span>نشر التغييرات الآن</span></button>
            <button class="btn btn-ghost" id="ghTest">${icon('check')}<span>اختبار الاتصال</span></button>
            <button class="btn btn-ghost" id="tokClear">${icon('trash')}<span>فصل هذا الجهاز</span></button>
          </div>
          <details style="margin-top:16px">
            <summary style="cursor:pointer;font-weight:800;font-size:13.5px;color:var(--grey)">إعدادات متقدمة</summary>
            <div class="f2" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px">
              <div class="field"><input id="ghRepo" placeholder=" " value="${esc(D.SITE.admin.repo)}" dir="ltr"><label>المستودع</label></div>
              <div class="field"><input id="ghBranch" placeholder=" " value="${esc(D.SITE.admin.branch)}" dir="ltr"><label>الفرع</label></div>
            </div>
            <div class="field"><input id="ghTok" type="password" placeholder=" " value="${esc(tok)}" dir="ltr" autocomplete="off"><label>المفتاح</label></div>
          </details>
        ` : `
          <p style="font-size:14px;line-height:1.85;margin-bottom:18px">
            لتنشر تعديلاتك بضغطة زر، تحتاج <b>توصيل اللوحة بحسابك مرة واحدة فقط</b>.
            بعدها لن تعيد هذه الخطوة أبداً على هذا الجهاز.</p>
          <ol class="steps" style="margin-bottom:18px">
            <li><b>اضغط الزر الأخضر أدناه.</b> ستُفتح صفحة GitHub وكل الخيارات مضبوطة مسبقاً — انزل للأسفل واضغط <b>Generate token</b>.</li>
            <li><b>انسخ السطر</b> الذي يظهر لك (يبدأ بـ <code>ghp_</code>). يظهر مرة واحدة فقط.</li>
            <li><b>الصقه في الحقل أدناه</b> واضغط «توصيل».</li>
          </ol>
          <a class="btn btn-lg" style="--bg-c:#1FAF54" target="_blank" rel="noopener"
             href="https://github.com/settings/tokens/new?scopes=repo&description=%D9%84%D9%88%D8%AD%D8%A9%20%D8%AA%D8%AD%D9%83%D9%85%20%D9%85%D8%AA%D8%AC%D8%B1%20%D8%A7%D9%84%D9%88%D8%B2%D9%86%D9%8A">
            ${icon('shield')}<span>الخطوة 1 — فتح صفحة إنشاء المفتاح</span></a>
          <div class="field" style="margin:18px 0 12px"><input id="ghTok" type="password" placeholder=" " dir="ltr" autocomplete="off"><label>الخطوة 2 — الصق المفتاح هنا</label></div>
          <input type="hidden" id="ghRepo" value="${esc(D.SITE.admin.repo)}">
          <input type="hidden" id="ghBranch" value="${esc(D.SITE.admin.branch)}">
          <button class="btn btn-lg btn-block" id="ghTest">${icon('check')}<span>الخطوة 3 — توصيل</span></button>
          <div class="note note-warn" style="margin-top:16px">${icon('shield')}<span>
            المفتاح يُحفظ في هذا المتصفح فقط ولا يُرسل إلا إلى <code>api.github.com</code>.
            لا تستخدم اللوحة على جهاز مشترك، وإن اضطررت فاضغط «فصل هذا الجهاز» بعد الانتهاء.</span></div>
        `}
        <div id="pubLog" style="margin-top:14px"></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-h"><h3>الطريقة الثانية — التصدير اليدوي</h3></div>
      <div class="panel-b">
        <p style="color:var(--grey);font-size:13.5px;margin-bottom:14px">إن لم ترغب باستخدام مفتاح، نزّل الملفات وارفعها بنفسك على GitHub.</p>
        <ol class="steps" style="margin-bottom:16px">
          <li>نزّل ملف <code>data.js</code>${pend.length ? ' وصور المواد الجديدة' : ''}.</li>
          <li>افتح المستودع على GitHub ← <code>${esc(DATA_PATH)}</code> ← أيقونة القلم ← الصق المحتوى ← Commit.</li>
          ${pend.length ? `<li>ارفع الصور إلى مجلد <code>${IMG_DIR}</code> عبر Add file ← Upload files.</li>` : ''}
          <li>ينشر Vercel التحديث تلقائياً خلال ثوانٍ.</li>
        </ol>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-tonal" id="dlData">${icon('box')}<span>تنزيل data.js</span></button>
          ${pend.length ? `<button class="btn btn-tonal" id="dlImgs">${icon('box')}<span>تنزيل الصور (${pend.length})</span></button>` : ''}
          <button class="btn btn-ghost" id="dlBackup">${icon('copy')}<span>نسخة احتياطية (JSON)</span></button>
          <label class="btn btn-ghost">${icon('box')}<span>استيراد نسخة احتياطية</span>
            <input type="file" id="upBackup" accept="application/json,.json" hidden></label>
        </div>
      </div>
    </div>`;

  const goBtn = $('#pubGo'); if(goBtn) goBtn.onclick = publishToGitHub;
  const tcBtn = $('#tokClear'); if(tcBtn) tcBtn.onclick = () => {
    localStorage.removeItem(TKEY); toast('فُصل هذا الجهاز', 'ok'); renderPublish(); };
  const testBtn = $('#ghTest'); if(testBtn) testBtn.onclick = testConnection;
  $('#dlData').onclick  = () => download('data.js', new Blob([exportData()], { type:'text/javascript;charset=utf-8' }));
  $('#dlBackup').onclick = () => download('wazani-backup-' + new Date().toISOString().slice(0, 10) + '.json',
    new Blob([JSON.stringify(D, null, 2)], { type:'application/json' }));
  const di = $('#dlImgs'); if(di) di.onclick = () => pend.forEach((p, i) =>
    setTimeout(() => download(p.id + '.jpg', dataUrlToBlob(p.imgData)), i * 350));
  $('#upBackup').onchange = e => {
    const f = e.target.files[0]; if(!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      try{
        const j = JSON.parse(fr.result);
        if(!j.PRODUCTS || !j.CATEGORIES) throw 0;
        D = j; saveDraft(); renderAll(); toast('استُوردت النسخة الاحتياطية', 'ok');
      }catch(err){ toast('الملف غير صالح', 'err'); }
    };
    fr.readAsText(f);
  };
}
function countChanges(){
  const a = new Map(PUB.PRODUCTS.map(p => [p.id, JSON.stringify(p)]));
  const b = new Map(D.PRODUCTS.map(p => { const c = clone(p); delete c.imgData; delete c.imgNew; return [p.id, JSON.stringify(c)]; }));
  let added = 0, edited = 0, removed = 0;
  b.forEach((v, k) => { if(!a.has(k)) added++; else if(a.get(k) !== v) edited++; });
  a.forEach((v, k) => { if(!b.has(k)) removed++; });
  return { added, edited, removed };
}
function download(name, blob){
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(u); }, 800);
}
function dataUrlToBlob(u){
  const [h, b] = u.split(',');
  const mime = h.match(/:(.*?);/)[1];
  const bin = atob(b), arr = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type:mime });
}
function b64utf8(str){
  const bytes = new TextEncoder().encode(str);
  let s = ''; const CH = 0x8000;
  for(let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  return btoa(s);
}

/* --- النشر إلى GitHub --- */
let publishing = false;
async function publishToGitHub(){
  if(publishing) return;
  const repo = $('#ghRepo').value.trim(), branch = $('#ghBranch').value.trim() || 'main';
  const token = $('#ghTok').value.trim();
  const log = $('#pubLog');
  const say = (m, cls) => { log.insertAdjacentHTML('beforeend',
    `<div class="note ${cls || 'note-info'}" style="margin:0 0 8px">${icon(cls === 'note-warn' ? 'close' : 'check')}<span>${m}</span></div>`); };
  log.innerHTML = '';
  if(!/^[\w.-]+\/[\w.-]+$/.test(repo)){ say('صيغة المستودع غير صحيحة — المطلوب <code>owner/repo</code>', 'note-warn'); return; }
  if(!token){ say('أدخل مفتاح GitHub أولاً.', 'note-warn'); return; }

  publishing = true;
  const btn = $('#pubGo'); btn.disabled = true; btn.querySelector('span').textContent = 'جارٍ النشر…';
  localStorage.setItem(TKEY, token);
  D.SITE.admin.repo = repo; D.SITE.admin.branch = branch;

  const api = (path, opts = {}) => fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...opts,
    headers: { Authorization:'Bearer ' + token, Accept:'application/vnd.github+json',
               'X-GitHub-Api-Version':'2022-11-28', ...(opts.headers || {}) }
  });
  const getSha = async path => {
    const r = await api(`/contents/${path}?ref=${encodeURIComponent(branch)}`);
    if(r.status === 404) return null;
    if(!r.ok) throw new Error(`تعذّر قراءة ${path} (${r.status})`);
    return (await r.json()).sha;
  };
  const put = async (path, contentB64, message) => {
    const sha = await getSha(path);
    const r = await api(`/contents/${path}`, {
      method:'PUT',
      body: JSON.stringify({ message, content:contentB64, branch, ...(sha ? { sha } : {}) })
    });
    if(!r.ok){
      const t = await r.text();
      throw new Error(`${path}: ${r.status} — ${t.slice(0, 160)}`);
    }
    return r.json();
  };

  try{
    const imgs = D.PRODUCTS.filter(p => p.imgNew && p.imgData);
    for(const p of imgs){
      const path = p.image || (IMG_DIR + p.id + '.jpg');
      await put(path, p.imgData.split(',')[1], `رفع صورة المادة ${p.id}`);
      say(`رُفعت صورة <b>${esc(p.name)}</b>`);
      p.image = path; delete p.imgNew;
    }
    const res = await put(DATA_PATH, b64utf8(exportData()), 'تحديث بيانات المتجر من لوحة التحكم');
    say(`نُشر ملف البيانات بنجاح — <a href="${res.commit.html_url}" target="_blank" rel="noopener"><b>عرض التغيير على GitHub</b></a>`);
    say('سيُحدَّث الموقع تلقائياً خلال ثوانٍ عبر Vercel. حدّث صفحة المتجر للتأكد.');

    D.PRODUCTS.forEach(p => delete p.imgData);
    PUB = clone(D);
    localStorage.removeItem(DKEY);
    markDirty(false);
    saveDraft(); localStorage.removeItem(DKEY); markDirty(false);
    renderAll();
    toast('نُشرت التغييرات بنجاح', 'ok');
  }catch(err){
    const msg = /Failed to fetch|NetworkError|Load failed/i.test(err.message)
      ? 'تعذّر الوصول إلى GitHub — تأكد من اتصالك بالإنترنت ثم أعد المحاولة.'
      : esc(err.message);
    say('فشل النشر — ' + msg, 'note-warn');
    say('تحقّق من صلاحية المفتاح (Contents: Read and write) وأن اسم المستودع والفرع صحيحان.', 'note-warn');
    toast('فشل النشر', 'err');
  }finally{
    publishing = false;
    const b = $('#pubGo'); if(b){ b.disabled = false; b.querySelector('span').textContent = 'نشر التغييرات الآن'; }
  }
}

/* ============ الإحصاءات والتبويبات ============ */
function renderStats(){
  $('#tabPCount').textContent = D.PRODUCTS.length;
  $('#tabCCount').textContent = D.CATEGORIES.reduce((a, c) => a + c.subs.length, 0);
  $('#tabBCount').textContent = D.BRANDS.length;
}
function renderAll(){ renderStats(); renderProducts(); renderCats(); renderBrands(); renderSettings(); renderPublish(); }

function showTab(id){
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === id));
  $$('.pane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + id));
  if(id === 'publish') renderPublish();
  window.scrollTo({ top:0 });
}

/* ============ الأحداث والإقلاع ============ */
function bind(){
  document.addEventListener('click', async e => {
    const t = e.target;
    const tab = t.closest('.tab'); if(tab) return showTab(tab.dataset.tab);
    if(t.closest('[data-x]') || t.closest('.sheet-bg')) return closeSheet();

    if(t.closest('#addProduct')) return productSheet(null);
    if(t.id === 'selAll'){
      const rows = filteredProducts();
      if(t.checked) rows.forEach(p => sel.add(p.id)); else rows.forEach(p => sel.delete(p.id));
      renderTable(); return;
    }
    const sb = t.closest('[data-sel]');
    if(sb){
      const id = sb.dataset.sel;
      sb.checked ? sel.add(id) : sel.delete(id);
      renderBulk(filteredProducts()); return;
    }
    const ed = t.closest('[data-edit]'); if(ed) return productSheet(ed.dataset.edit);
    const row = t.closest('[data-row]');
    if(row && !t.closest('[data-del]') && !t.closest('.tsel')) return productSheet(row.dataset.row);
    const dl = t.closest('[data-del]');
    if(dl){
      const p = D.PRODUCTS.find(x => x.id === dl.dataset.del); if(!p) return;
      if(await confirmBox('حذف المادة', `هل تريد حذف «${p.name}» نهائياً من المتجر؟`, 'حذف')){
        D.PRODUCTS = D.PRODUCTS.filter(x => x.id !== p.id);
        saveDraft(); renderTable(); renderStats(); toast('حُذفت المادة', 'ok');
      }
      return;
    }

    if(t.closest('#addCat')) return catSheet(null);
    const ce = t.closest('[data-cedit]'); if(ce) return catSheet(ce.dataset.cedit);
    const cu = t.closest('[data-cup]');
    if(cu){ const i = +cu.dataset.cup; if(i > 0){ const a = D.CATEGORIES;
      [a[i - 1], a[i]] = [a[i], a[i - 1]]; saveDraft(); renderCats(); } return; }
    const cd = t.closest('[data-cdel]');
    if(cd){
      const c = D.CATEGORIES.find(x => x.id === cd.dataset.cdel); if(!c) return;
      const n = countIn(c.id);
      if(await confirmBox('حذف القسم', n
        ? `القسم «${c.name}» يحتوي ${n} مادة. حذفه سيزيل ارتباط هذه المواد به، والمواد التي لا تنتمي لقسم آخر ستُخفى من المتجر. هل تريد المتابعة؟`
        : `هل تريد حذف قسم «${c.name}»؟`, 'حذف')){
        D.CATEGORIES = D.CATEGORIES.filter(x => x.id !== c.id);
        D.PRODUCTS.forEach(p => p.cats = p.cats.filter(k => k.split('/')[0] !== c.id));
        saveDraft(); renderCats(); renderStats(); renderProducts(); toast('حُذف القسم', 'ok');
      }
      return;
    }
    const sa = t.closest('[data-sadd]'); if(sa) return subSheet(sa.dataset.sadd, null);
    const se = t.closest('[data-sedit]'); if(se) return subSheet(...se.dataset.sedit.split('|'));
    const sd = t.closest('[data-sdel]');
    if(sd){
      const [cid, sid] = sd.dataset.sdel.split('|');
      const c = D.CATEGORIES.find(x => x.id === cid); const s = c?.subs.find(x => x.id === sid); if(!s) return;
      const n = countIn(cid + '/' + sid);
      if(await confirmBox('حذف القسم الفرعي', n
        ? `«${s.name}» يحتوي ${n} مادة. سيُزال ارتباط هذه المواد به فقط.`
        : `هل تريد حذف «${s.name}»؟`, 'حذف')){
        c.subs = c.subs.filter(x => x.id !== sid);
        D.PRODUCTS.forEach(p => p.cats = p.cats.filter(k => k !== cid + '/' + sid));
        saveDraft(); renderCats(); renderStats(); renderProducts(); toast('حُذف القسم الفرعي', 'ok');
      }
      return;
    }

    if(t.closest('#addBrand')) return brandSheet(null);
    const be = t.closest('[data-bedit]'); if(be) return brandSheet(+be.dataset.bedit);
    const bd = t.closest('[data-bdel]');
    if(bd){
      const b = D.BRANDS[+bd.dataset.bdel];
      if(await confirmBox('حذف العلامة', `حذف «${b.name}» من قائمة العلامات؟ لن تتأثر المواد المرتبطة بها.`, 'حذف')){
        D.BRANDS.splice(+bd.dataset.bdel, 1); saveDraft(); renderBrands(); renderStats(); toast('حُذفت العلامة', 'ok');
      }
      return;
    }

    if(t.closest('#btnPreview')){
      saveDraft(); sessionStorage.setItem('wz_preview', '1');
      window.open('index.html', '_blank'); return;
    }
    if(t.closest('#btnDiscard')){
      if(await confirmBox('تجاهل التغييرات', 'ستُحذف كل التعديلات غير المنشورة وترجع البيانات إلى آخر نسخة منشورة.', 'تجاهل التغييرات'))
        discardDraft();
      return;
    }
    if(t.closest('#btnLock')){ sessionStorage.removeItem('wz_admin_ok'); location.reload(); }
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') closeSheet();
    if(e.key === 'Enter'){ const r = e.target.closest?.('[data-row]'); if(r) productSheet(r.dataset.row); }
  });
  addEventListener('beforeunload', e => { if(dirty){ e.preventDefault(); e.returnValue = ''; } });
}

function boot(){
  loadState();
  bind();
  initLock();
}
document.readyState === 'loading' ? addEventListener('DOMContentLoaded', boot) : boot();

/* ============ اختبار الاتصال بـ GitHub ============ */
async function testConnection(){
  const repo = $('#ghRepo').value.trim();
  const branch = ($('#ghBranch').value || 'main').trim();
  const token = $('#ghTok').value.trim();
  const log = $('#pubLog');
  const say = (m, cls) => { log.innerHTML =
    `<div class="note ${cls || 'note-info'}" style="margin:0">${icon(cls === 'note-warn' ? 'close' : 'check')}<span>${m}</span></div>`; };
  if(!token){ say('الصق المفتاح أولاً.', 'note-warn'); return; }
  const btn = $('#ghTest'); btn.disabled = true;
  const lbl = btn.querySelector('span'); const old = lbl.textContent; lbl.textContent = 'جارٍ الفحص…';
  try{
    const r = await fetch(`https://api.github.com/repos/${repo}`, {
      headers:{ Authorization:'Bearer ' + token, Accept:'application/vnd.github+json' } });
    if(r.status === 401) throw new Error('المفتاح غير صحيح أو منتهي — أنشئ مفتاحاً جديداً.');
    if(r.status === 404) throw new Error(`لم يُعثر على المستودع <code>${esc(repo)}</code>، أو المفتاح لا يملك صلاحية عليه.`);
    if(!r.ok) throw new Error('استجابة غير متوقعة من GitHub (' + r.status + ')');
    const j = await r.json();
    if(!j.permissions || !j.permissions.push)
      throw new Error('المفتاح يقرأ فقط ولا يستطيع الكتابة — تأكد من تفعيل صلاحية <code>repo</code>.');
    const br = await fetch(`https://api.github.com/repos/${repo}/branches/${encodeURIComponent(branch)}`, {
      headers:{ Authorization:'Bearer ' + token, Accept:'application/vnd.github+json' } });
    if(br.status === 404) throw new Error(`المستودع سليم لكن لا يوجد فرع باسم <code>${esc(branch)}</code>.`);
    localStorage.setItem(TKEY, token);
    D.SITE.admin.repo = repo; D.SITE.admin.branch = branch;
    saveDraft();
    toast('تم التوصيل بنجاح', 'ok');
    renderPublish();
    $('#pubLog').innerHTML =
      `<div class="note note-info" style="margin:0">${icon('check')}<span>
        <b>تم التوصيل بنجاح.</b> من الآن يكفي زر «نشر التغييرات الآن» — لن تعيد هذه الخطوة على هذا الجهاز.</span></div>`;
  }catch(err){
    const msg = /Failed to fetch|NetworkError|Load failed/i.test(err.message)
      ? 'تعذّر الوصول إلى GitHub — تأكد من اتصالك بالإنترنت ثم أعد المحاولة.'
      : err.message;
    say(msg, 'note-warn');
  }finally{
    const b = $('#ghTest'); if(b){ b.disabled = false; const l = b.querySelector('span'); if(l) l.textContent = old; }
  }
}

/* إدارة الحالة: السلة، المفضلة، الطلبات، والتخزين المحلي */

const KEY = { cart:'wz_cart_v1', fav:'wz_fav_v1', orders:'wz_orders_v1', seq:'wz_seq_v1', draft:'wz_draft_v1' };

/* وضع المعاينة: يعرض مسودّة لوحة التحكم بدل البيانات المنشورة (لا يؤثر على الزوار) */
let PREVIEW = false;
(function applyDraft(){
  try{
    if(sessionStorage.getItem('wz_preview') !== '1') return;
    const d = JSON.parse(localStorage.getItem(KEY.draft) || 'null');
    if(!d) return;
    if(d.SITE)       SITE       = d.SITE;
    if(d.CATEGORIES) CATEGORIES = d.CATEGORIES;
    if(d.BRANDS)     BRANDS     = d.BRANDS;
    if(d.PRODUCTS)   PRODUCTS   = d.PRODUCTS;
    PREVIEW = true;
  }catch(e){}
})();

/* ================= خيارات المنتج =================
   الخيارات حرّة يعرّفها صاحب المحل: لون، قياس، واطية، قدرة، أو أي اسم آخر.
   type ليس نوعاً بل طريقة عرض فقط: color مربّعات لونية، وما عداه أزرار نصية. */

/* أول قيمة من كل خيار — تُختار تلقائياً فلا يُمنع الزبون من الشراء */
function defaultOpts(p){
  const o = {};
  (p.options || []).forEach(x => { if((x.values || [])[0]) o[x.id] = x.values[0].label; });
  return o;
}
function optValue(p, oid, label){
  const o = (p.options || []).find(x => x.id === oid);
  return o ? (o.values || []).find(v => v.label === label) || null : null;
}
/* السعر الفعّال: آخر قيمة مختارة تحمل price هي التي تحدّده */
function variantPrice(p, opts){
  let price = p.price;
  (p.options || []).forEach(o => {
    const v = optValue(p, o.id, (opts || {})[o.id]);
    if(v && typeof v.price === 'number' && v.price > 0) price = v.price;
  });
  return price;
}
/* صورة الخيار المختار إن وُجدت — آخر واحدة تفوز */
function variantImage(p, opts){
  let img = '';
  (p.options || []).forEach(o => {
    const v = optValue(p, o.id, (opts || {})[o.id]);
    if(v && v.image) img = v.image;
  });
  return img;
}
/* نصّ مقروء يُعرض للزبون ويُرفق بالطلب */
function optsText(p, opts){
  return (p.options || []).map(o => {
    const val = (opts || {})[o.id];
    return val ? `${o.name}: ${val}` : '';
  }).filter(Boolean).join(' · ');
}
/* مفتاح سطر السلة — نفس المادة بخيارين مختلفين تعني سطرين */
function lineKey(id, opts){
  const keys = Object.keys(opts || {}).sort();
  return id + '::' + keys.map(k => k + '=' + opts[k]).join('&');
}

const store = {
  cart: [],   // [{id, q, opts}]
  fav:  [],   // [id]
  orders: [],

  load(){
    /* توافق رجعي: السلال القديمة بصيغة {id,q} بلا opts تبقى صالحة */
    const raw = read(KEY.cart, []).filter(l => l && byId(l.id));
    const merged = [];
    raw.forEach(l => {
      const p = byId(l.id);
      const opts = l.opts && Object.keys(l.opts).length ? l.opts : defaultOpts(p);
      const k = lineKey(l.id, opts);
      const hit = merged.find(x => lineKey(x.id, x.opts) === k);
      if(hit) hit.q = Math.min(999, hit.q + (l.q | 0 || 1));
      else merged.push({ id:l.id, q:Math.max(1, l.q | 0 || 1), opts });
    });
    this.cart   = merged;
    this.fav    = read(KEY.fav, []).filter(id => byId(id));
    this.orders = read(KEY.orders, []);
  },
  save(){
    write(KEY.cart, this.cart); write(KEY.fav, this.fav); write(KEY.orders, this.orders);
    emit();
  },

  /* --- السلة --- */
  add(id, q = 1, opts){
    const p = byId(id); if(!p) return;
    const o = (opts && Object.keys(opts).length) ? opts : defaultOpts(p);
    const k = lineKey(id, o);
    const line = this.lineOf(k);
    if(line) line.q = Math.min(999, line.q + q); else this.cart.push({ id, q, opts:o });
    this.save();
    const txt = optsText(p, o);
    toast(`تمت إضافة «${p.name}${txt ? ' — ' + txt : ''}» إلى السلة`, 'ok');
  },
  lineOf(key){ return this.cart.find(l => lineKey(l.id, l.opts) === key); },
  setQty(key, q){
    const line = this.lineOf(key); if(!line) return;
    line.q = Math.max(1, Math.min(999, q)); this.save();
  },
  remove(key){
    this.cart = this.cart.filter(l => lineKey(l.id, l.opts) !== key); this.save();
  },
  clearCart(){ this.cart = []; this.save(); },
  qtyOf(key){ const l = this.lineOf(key); return l ? l.q : 0; },
  get count(){ return this.cart.reduce((n, l) => n + l.q, 0); },
  get lines(){
    return this.cart.map(l => {
      const p = byId(l.id); if(!p) return null;
      const opts  = l.opts || {};
      const price = variantPrice(p, opts);
      const vimg  = variantImage(p, opts);
      const line  = { ...p, q:l.q, opts, key:lineKey(l.id, opts),
                      price, optsText: optsText(p, opts), total: price * l.q };
      /* صورة الخيار تحلّ محل الرئيسية في السلة، مع بياناتها إن كانت غير منشورة */
      if(vimg){ line.image = vimg; line.imgData = (p.imgsData || {})[vimg] || ''; }
      /* السعر القديم لا معنى له إن غيّر الخيار السعر */
      if(price !== p.price) line.old = 0;
      return line;
    }).filter(Boolean);
  },
  get subtotal(){ return this.lines.reduce((s, l) => s + l.total, 0); },
  get savings(){
    return this.lines.reduce((s, l) => s + (l.old ? (l.old - l.price) * l.q : 0), 0);
  },
  deliveryFee(method, gov){
    const o = SITE.orders;
    if(method === 'pickup') return 0;
    if(o.freeDeliveryOver && this.subtotal >= o.freeDeliveryOver) return 0;
    return gov === SITE.city ? o.deliveryFeeInCity : o.deliveryFeeOutCity;
  },

  /* --- المفضلة --- */
  toggleFav(id){
    const i = this.fav.indexOf(id);
    if(i > -1){ this.fav.splice(i, 1); toast('أُزيل من المفضلة'); }
    else { this.fav.push(id); toast('أُضيف إلى المفضلة', 'ok'); }
    this.save();
    return this.fav.includes(id);
  },
  isFav(id){ return this.fav.includes(id); },

  /* --- الطلبات --- */
  nextOrderId(){
    const n = (read(KEY.seq, 0) | 0) + 1;
    write(KEY.seq, n);
    const d = new Date();
    const s = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
    return `${SITE.orders.prefix}-${s}-${String(n).padStart(3, '0')}`;
  },
  buildOrder(customer, method, payment){
    const lines = this.lines;
    if(!lines.length) return null;
    const sub = this.subtotal;
    const fee = this.deliveryFee(method, customer.gov);
    return {
      no: this.nextOrderId(),          // رقم معروض للزبون
      at: Date.now(),
      status: 'pending',
      customer, method, payment,
      items: lines.map(l => ({ id:l.id, name:l.name, brand:l.brand, price:l.price, q:l.q,
                               unit:l.unit || 'حبة', total:l.total, opts:l.optsText || '' })),
      subtotal: sub, fee, total: sub + fee,
      adminNote: ''
    };
  },
  /* يُحفظ الطلب في قاعدة البيانات إن كانت مضبوطة، وإلا محلياً فقط */
  async placeOrder(customer, method, payment){
    const order = this.buildOrder(customer, method, payment);
    if(!order) return null;
    let saved = { ...order, id: order.no, online: false };
    if(FB.ready()){
      const res = await FB.createOrder(order);   // يرمي عند الفشل ليعرف الزبون
      saved = { ...order, id: res.id, online: true };
    }
    this.orders.unshift(saved);
    if(this.orders.length > 60) this.orders.length = 60;
    this.cart = [];
    this.save();
    sendWebhook(saved);
    return saved;
  },
  orderById(id){ return this.orders.find(o => o.id === id || o.no === id); },
  /* يحدّث نسخة الزبون المحلية بحالة الطلب القادمة من قاعدة البيانات */
  syncOrder(id, live){
    const i = this.orders.findIndex(o => o.id === id);
    if(i < 0) return;
    this.orders[i] = { ...this.orders[i], status:live.status, adminNote:live.adminNote || '', updatedAt:live.updatedAt };
    this.save();
  }
};

/* --- أدوات مساعدة --- */
function read(k, fb){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }catch(e){ return fb; } }
function write(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function pad(n){ return String(n).padStart(2, '0'); }

const PMAP = new Map(PRODUCTS.map(p => [p.id, p]));
function byId(id){ return PMAP.get(id); }

function money(n){ return new Intl.NumberFormat('en-US').format(Math.round(n)); }
function priceHTML(n){ return `${money(n)} <small>${SITE.currency}</small>`; }

/* شجرة الأقسام: خرائط سريعة */
const CMAP = new Map(), SMAP = new Map();
CATEGORIES.forEach(c => {
  CMAP.set(c.id, c);
  c.subs.forEach(s => SMAP.set(c.id + '/' + s.id, { ...s, parent:c }));
});
function subInfo(key){ return SMAP.get(key); }
function productsIn(key){
  if(CMAP.has(key)) return PRODUCTS.filter(p => p.cats.some(c => c.split('/')[0] === key));
  return PRODUCTS.filter(p => p.cats.includes(key));
}
function countIn(key){ return productsIn(key).length; }

/* البحث */
function searchProducts(q){
  const t = norm(q); if(!t) return [];
  const words = t.split(/\s+/).filter(Boolean);
  return PRODUCTS.map(p => {
    const hay = norm([p.name, p.brand, p.id, (p.specs||[]).join(' '), p.desc,
      ...p.cats.map(c => { const s = subInfo(c); return s ? s.name + ' ' + s.parent.name : ''; })].join(' '));
    let score = 0;
    for(const w of words){
      if(!hay.includes(w)) return null;
      score += norm(p.name).includes(w) ? 3 : 1;
      if(norm(p.name).startsWith(w)) score += 2;
    }
    return { p, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).map(r => r.p);
}
/* تطبيع النص العربي: توحيد الألف والهاء والتاء المربوطة وإزالة التشكيل */
function norm(s){
  return String(s || '').toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/* إرسال الطلب إلى نقطة نهاية خارجية (اختياري) */
function sendWebhook(order){
  const url = SITE.orders.webhook;
  if(!url) return;
  try{
    const body = JSON.stringify(order);
    if(navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type:'application/json' }));
    else fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body, keepalive:true }).catch(()=>{});
  }catch(e){}
}

/* نص رسالة واتساب للطلب */
function orderText(o){
  const L = [];
  L.push(`*طلب جديد — ${SITE.shortName}*`);
  L.push(`رقم الطلب: ${o.no || o.id}`);
  L.push(`التاريخ: ${new Date(o.at).toLocaleString('ar-IQ')}`);
  L.push('');
  L.push('*الزبون*');
  L.push(`الاسم: ${o.customer.name}`);
  L.push(`الهاتف: ${o.customer.phone}`);
  L.push(`المحافظة: ${o.customer.gov}`);
  if(o.customer.address) L.push(`العنوان: ${o.customer.address}`);
  if(o.customer.note) L.push(`ملاحظات: ${o.customer.note}`);
  L.push(`الاستلام: ${o.method === 'pickup' ? 'استلام من المحل' : 'توصيل إلى العنوان'}`);
  L.push('');
  L.push('*المواد*');
  o.items.forEach((it, i) => {
    L.push(`${i + 1}. ${it.name} — ${it.q} ${it.unit} × ${money(it.price)} = ${money(it.total)} ${SITE.currency}`);
    if(it.opts) L.push(`    (${it.opts})`);
  });
  L.push('');
  L.push(`المجموع: ${money(o.subtotal)} ${SITE.currency}`);
  L.push(`التوصيل: ${o.fee ? money(o.fee) + ' ' + SITE.currency : 'مجاناً'}`);
  L.push(`*الإجمالي: ${money(o.total)} ${SITE.currency}*`);
  return L.join('\n');
}
function waLink(text){ return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`; }

/* بث تغيّر الحالة */
const listeners = [];
function onChange(fn){ listeners.push(fn); }
function emit(){ listeners.forEach(f => f()); }

/* التنبيهات */
function toast(msg, type){
  const box = document.getElementById('toasts'); if(!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.innerHTML = icon(type === 'err' ? 'close' : type === 'ok' ? 'check' : 'bolt') + `<span>${msg}</span>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2600);
}

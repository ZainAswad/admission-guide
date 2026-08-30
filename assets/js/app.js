/* ================= التطبيق: التوجيه + الواجهات ================= */

const app  = () => document.getElementById('app');
const $    = (s, r = document) => r.querySelector(s);
const $$   = (s, r = document) => [...r.querySelectorAll(s)];
const esc  = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* ---------- صورة المنتج ----------
   ASSET_REV: يتغيّر عند الحاجة لتجاوز نسخ محفوظة قديمة في متصفحات الزوار.  */
const ASSET_REV = '3';
function assetUrl(u){
  if(!u || /^(https?:|data:|blob:)/.test(u) || u.includes('?')) return u;
  return u + '?v=' + ASSET_REV;
}
/* مصدر احتياطي للصور من شبكة jsDelivr مباشرة من المستودع (شبكة أمان فقط) */
function cdnUrl(path){
  const a = (typeof SITE !== 'undefined' && SITE.admin) || {};
  if(!a.repo || !/^[\w.-]+\/[\w.-]+$/.test(a.repo)) return '';
  return `https://cdn.jsdelivr.net/gh/${a.repo}@${a.branch || 'main'}/`
       + String(path).replace(/^\/+/, '').split('?')[0];
}
/* إن تعذّر تحميل صورة المنتج: نجرّب المصدر الاحتياطي، ثم الرسمة التوضيحية
   بدل أيقونة الصورة المكسورة. */
function imgFallback(el){
  try{
    if(!el.dataset.tried && el.dataset.orig){
      const alt = cdnUrl(el.dataset.orig);
      if(alt){ el.dataset.tried = '1'; el.src = alt; return; }
    }
    const fb = el.dataset.fb;                 // فارغ = احذف الصورة فقط بلا بديل
    if(fb) el.insertAdjacentHTML('afterend', art(fb));
    el.remove();
  }catch(e){}
}
function media(p, cls){
  const src = p.imgData || assetUrl(p.image);   // imgData تُستخدم فقط أثناء المعاينة من لوحة التحكم
  return src
    ? `<img${cls ? ` class="${cls}"` : ''} src="${src}" alt="${esc(p.name)}" loading="lazy" decoding="async"
        data-fb="${esc(p.icon || 'junction')}"${p.image ? ` data-orig="${esc(p.image)}"` : ''} onerror="imgFallback(this)">`
    : art(p.icon);
}
function subLabel(p){
  const s = subInfo(p.cats[0]);
  return s ? s.name : '';
}
function discount(p){ return p.old ? Math.round((1 - p.price / p.old) * 100) : 0; }

/* ---------- بطاقة المنتج ---------- */
function card(p){
  const off = discount(p);
  const badge = p.badge === 'hot' ? '<span class="bdg bdg-hot">الأكثر طلباً</span>'
    : p.badge === 'new' ? '<span class="bdg bdg-new">جديد</span>'
    : p.badge === 'sale' ? '<span class="bdg bdg-sale">تخفيض</span>' : '';
  return `<article class="card rv" data-id="${p.id}">
    <div class="card-media" data-open="${p.id}" role="button" tabindex="0" aria-label="عرض ${esc(p.name)}">
      <div class="badges">${badge}${off ? `<span class="bdg bdg-sale">-${off}%</span>` : ''}</div>
      <button class="fav ${store.isFav(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="أضف إلى المفضلة">${icon('heart')}</button>
      ${media(p)}
      <div class="quick"><button class="btn btn-sm btn-block" data-add="${p.id}">${icon('cart')}<span>أضف إلى السلة</span></button></div>
    </div>
    <div class="card-body">
      <span class="card-brand">${esc(p.brand)}</span>
      <a class="card-name" href="#/p/${p.id}">${esc(p.name)}</a>
      <span class="card-cat">${esc(subLabel(p))}</span>
      <div class="price-row">
        <span class="price">${priceHTML(p.price)}</span>
        ${p.old ? `<span class="old">${money(p.old)}</span>` : ''}
      </div>
      <button class="btn btn-sm btn-tonal card-add" data-add="${p.id}">${icon('cart')}<span>أضف إلى السلة</span></button>
    </div>
  </article>`;
}

/* ---------- شبكة مع فلاتر وترتيب ---------- */
let flt = { sort:'pop', brand:'' };
function listBlock(items, key){
  const brands = [...new Set(items.map(p => p.brand))].sort();
  let out = items.slice();
  if(flt.brand) out = out.filter(p => p.brand === flt.brand);
  const rank = p => (p.badge === 'hot' ? 0 : p.badge === 'new' ? 1 : p.badge === 'sale' ? 2 : 3);
  if(flt.sort === 'pop')      out.sort((a, b) => rank(a) - rank(b));
  if(flt.sort === 'price-a')  out.sort((a, b) => a.price - b.price);
  if(flt.sort === 'price-d')  out.sort((a, b) => b.price - a.price);
  if(flt.sort === 'name')     out.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  if(flt.sort === 'discount') out.sort((a, b) => discount(b) - discount(a));

  return `<div class="toolbar">
      <span class="res"><b>${out.length}</b> منتج${items.length !== out.length ? ` من ${items.length}` : ''}</span>
      <div class="chips" style="flex:1">
        <button class="chip ${!flt.brand ? 'on' : ''}" data-brand="">كل العلامات</button>
        ${brands.map(b => `<button class="chip ${flt.brand === b ? 'on' : ''}" data-brand="${esc(b)}">${esc(b)}</button>`).join('')}
      </div>
      <div class="sel">
        <select id="sortSel" aria-label="ترتيب">
          <option value="pop"${flt.sort === 'pop' ? ' selected' : ''}>الأكثر رواجاً</option>
          <option value="price-a"${flt.sort === 'price-a' ? ' selected' : ''}>السعر: من الأقل</option>
          <option value="price-d"${flt.sort === 'price-d' ? ' selected' : ''}>السعر: من الأعلى</option>
          <option value="discount"${flt.sort === 'discount' ? ' selected' : ''}>أعلى تخفيض</option>
          <option value="name"${flt.sort === 'name' ? ' selected' : ''}>الاسم أ — ي</option>
        </select>${icon('chevronDown')}
      </div>
    </div>
    ${out.length ? `<div class="grid-p">${out.map(card).join('')}</div>`
      : emptyState('لا توجد نتائج', 'جرّب تغيير الفلتر أو تصفّح قسماً آخر.', 'junction', '#/categories', 'تصفّح الأقسام')}`;
}
function emptyState(h, p, ic, href, label){
  return `<div class="empty">${art(ic)}<h3>${h}</h3><p>${p}</p>
    ${href ? `<a class="btn" href="${href}">${label}</a>` : ''}</div>`;
}
function crumbs(parts){
  return `<nav class="crumbs">${parts.map((x, i) => i === parts.length - 1
    ? `<b>${esc(x.t)}</b>` : `<a href="${x.h}">${esc(x.t)}</a>${icon('chevron')}`).join('')}</nav>`;
}

/* ================= الواجهات ================= */

/* --- الرئيسية --- */
const PERKS = [
  { ic:'shield',  t:'منتجات أصلية',    s:'علامات موثوقة وضمان حقيقي' },
  { ic:'truck',   t:'توصيل سريع',      s:'داخل كربلاء وجميع المحافظات' },
  { ic:'headset', t:'استشارة فنية',    s:'نساعدك باختيار المادة الصحيحة' },
  { ic:'tag',     t:'أسعار الجملة',    s:'عروض خاصة للمقاولين والفنيين' }
];

function viewHome(){
  const hot  = PRODUCTS.filter(p => p.badge === 'hot').slice(0, 10);
  const sale = PRODUCTS.filter(p => p.old).slice(0, 10);
  const fresh= PRODUCTS.filter(p => p.badge === 'new').slice(0, 10);
  return `<section class="hero"><div class="wrap"><div class="hero-in">
      <div>
        <img class="hero-logo" src="${assetUrl('assets/img/logo.png')}" alt="${esc(SITE.name)}" width="96" height="90">
        <div class="tag-pill">${icon('bolt')}<span>${esc(SITE.tagline)}</span></div>
        <h1>${esc(SITE.shortName)} <span class="hl">للكهربائيات والإنارة الحديثة</span></h1>
        <p class="lead">${esc(SITE.about)}</p>
        <div class="hero-cta">
          <a class="btn btn-lg" href="#/categories">${icon('grid')}<span>تصفّح الأقسام</span></a>
          <a class="btn btn-lg btn-outline" href="#/contact">${icon('location')}<span>موقع المحل</span></a>
        </div>
        <div class="hero-stats">
          <div><b>${PRODUCTS.length}+</b><span>منتج متوفر</span></div>
          <div><b>${CATEGORIES.reduce((a, c) => a + c.subs.length, 0)}</b><span>قسم فرعي</span></div>
          <div><b>${BRANDS.length}+</b><span>علامة تجارية</span></div>
        </div>
      </div>
      <div class="bento" id="bento"></div>
    </div></div></section>

    <section class="sec-sm"><div class="wrap"><div class="perks">
      ${PERKS.map(p => `<div class="perk rv"><span class="pic">${icon(p.ic)}</span><div><b>${p.t}</b><small>${p.s}</small></div></div>`).join('')}
    </div></div></section>

    <section class="sec"><div class="wrap">
      <div class="sec-head"><div>
        <span class="eyebrow">${icon('grid')}أقسامنا</span>
        <h2>كل ما تحتاجه الكهربائيات تحت سقف واحد</h2>
        <p>خمسة أقسام رئيسية تتفرّع إلى ${CATEGORIES.reduce((a, c) => a + c.subs.length, 0)} قسماً فرعياً — اختر ما يناسب مشروعك.</p>
      </div><a class="btn btn-tonal" href="#/categories">عرض الكل</a></div>
      <div class="grid-c">${CATEGORIES.map(catCard).join('')}</div>
    </div></section>

    ${hot.length ? shelf('الأكثر طلباً', 'المنتجات التي يثق بها زبائننا أكثر من غيرها', 'bolt', hot) : ''}
    ${sale.length ? shelf('عروض وتخفيضات', 'وفّر أكثر على المواد الأساسية', 'tag', sale) : ''}

    <section class="sec-sm"><div class="wrap">
      <div class="sec-head"><div>
        <span class="eyebrow">${icon('shield')}العلامات التجارية</span>
        <h2>نتعامل مع أفضل الماركات العالمية والمحلية</h2>
      </div></div>
      <div class="marquee"><div class="marquee-t">
        ${[...BRANDS, ...BRANDS].map(b => `<div class="bchip">
          ${(b.logoData || b.logo) ? `<img class="blogo" src="${b.logoData || assetUrl(b.logo)}" alt="${esc(b.name)}" loading="lazy"
             ${b.logo ? `data-orig="${esc(b.logo)}"` : ''} data-fb="" onerror="imgFallback(this)">` : ''}
          <b>${esc(b.name)}</b><small>${esc(b.ar)}</small></div>`).join('')}
      </div></div>
    </div></section>

    ${fresh.length ? shelf('وصل حديثاً', 'أحدث ما أضفناه إلى رفوف المحل', 'box', fresh) : ''}

    <section class="sec-sm"><div class="wrap">
      <div class="panel" style="padding:34px;text-align:center;background:linear-gradient(140deg,var(--brand-50),#fff)">
        <span class="eyebrow">${icon('headset')}نحن بخدمتك</span>
        <h2 style="font-size:clamp(20px,3vw,28px);margin-bottom:10px">تحتاج مساعدة في اختيار المادة المناسبة؟</h2>
        <p style="color:var(--grey);max-width:56ch;margin:0 auto 22px">فريقنا يساعدك في حساب المقاسات والأحمال واختيار الأنسب لمشروعك — تواصل معنا مباشرة.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a class="btn btn-lg wa" href="${waLink('السلام عليكم، أحتاج استشارة بخصوص مواد كهربائية.')}" target="_blank" rel="noopener">${icon('whatsapp')}<span>محادثة واتساب</span></a>
          <a class="btn btn-lg btn-outline" href="tel:${SITE.phones[0].number}">${icon('phone')}<span dir="ltr">${fmtPhone(SITE.phones[0].number)}</span></a>
        </div>
      </div>
    </div></section>`;
}
function shelf(title, sub, ic, items){
  return `<section class="sec"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">${icon(ic)}${title}</span><h2>${title}</h2><p>${sub}</p></div></div>
    <div class="grid-p">${items.map(card).join('')}</div>
  </div></section>`;
}
function catCard(c){
  return `<a class="ccard rv" href="#/c/${c.id}">
    ${art(c.icon)}
    <h3>${esc(c.name)}</h3>
    <p>${esc(c.blurb)}</p>
    <div class="subs">${c.subs.slice(0, 4).map(s => `<span>${esc(s.name)}</span>`).join('')}
      ${c.subs.length > 4 ? `<span>+${c.subs.length - 4}</span>` : ''}</div>
    <span class="go">${countIn(c.id)} منتج ${icon('chevron')}</span>
  </a>`;
}

/* --- كل الأقسام --- */
function viewCategories(){
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'الأقسام' }])}
    <div class="sec-head"><div>
      <span class="eyebrow">${icon('grid')}الأقسام</span>
      <h2>أقسام المتجر</h2>
      <p>الأقسام متداخلة عن قصد — المادة الواحدة قد تظهر في أكثر من قسم لأنها تخدم أكثر من استخدام.</p>
    </div></div>
    ${CATEGORIES.map(c => `<div style="margin-bottom:38px">
      <div class="sec-head" style="margin-bottom:16px"><div style="display:flex;align-items:center;gap:14px">
        <span style="width:56px;height:56px;display:grid;place-items:center;background:#fff;border-radius:var(--r);box-shadow:var(--e1)">${art(c.icon)}</span>
        <div><h3 style="font-size:20px"><a href="#/c/${c.id}">${esc(c.name)}</a></h3>
        <p style="color:var(--grey);font-size:13.5px">${esc(c.blurb)} · ${countIn(c.id)} منتج</p></div>
      </div><a class="btn btn-sm btn-tonal" href="#/c/${c.id}">عرض القسم</a></div>
      <div class="subgrid">${c.subs.map(s => `<a class="scard rv" href="#/c/${c.id}/${s.id}">
        ${art(s.icon)}<div><b>${esc(s.name)}</b><small>${countIn(c.id + '/' + s.id)} منتج</small></div></a>`).join('')}</div>
    </div>`).join('')}
  </div>`;
}

/* --- قسم رئيسي --- */
function viewCategory(id){
  const c = CMAP.get(id); if(!c) return notFound();
  const items = productsIn(id);
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'الأقسام', h:'#/categories' }, { t:c.name }])}
    <div class="sec-head"><div>
      <span class="eyebrow">${icon('grid')}قسم رئيسي</span>
      <h2>${esc(c.name)}</h2><p>${esc(c.blurb)}</p>
    </div></div>
    <div class="subgrid" style="margin-bottom:26px">
      ${c.subs.map(s => `<a class="scard" href="#/c/${c.id}/${s.id}">${art(s.icon)}
        <div><b>${esc(s.name)}</b><small>${countIn(c.id + '/' + s.id)} منتج</small></div></a>`).join('')}
    </div>
    ${listBlock(items, id)}
  </div>`;
}

/* --- قسم فرعي --- */
function viewSub(cid, sid){
  const key = cid + '/' + sid, s = subInfo(key); if(!s) return notFound();
  const items = productsIn(key);
  const also = [...new Set(items.flatMap(p => p.cats).filter(k => k !== key))]
    .map(k => subInfo(k)).filter(Boolean).slice(0, 8);
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'الأقسام', h:'#/categories' }, { t:s.parent.name, h:'#/c/' + cid }, { t:s.name }])}
    <div class="sec-head"><div>
      <span class="eyebrow">${art(s.icon)}${esc(s.parent.name)}</span>
      <h2>${esc(s.name)}</h2><p>${items.length} منتج ضمن هذا القسم.</p>
    </div></div>
    ${listBlock(items, key)}
    ${also.length ? `<div style="margin-top:34px">
      <h3 style="font-size:17px;margin-bottom:12px">أقسام مرتبطة</h3>
      <div class="chips">${also.map(a => `<a class="chip" href="#/c/${a.parent.id}/${a.id}">${esc(a.name)}</a>`).join('')}</div>
    </div>` : ''}
  </div>`;
}

/* --- صفحة منتج --- */
function viewProduct(id){
  const p = byId(id); if(!p) return notFound();
  const s = subInfo(p.cats[0]);
  const rel = PRODUCTS.filter(x => x.id !== p.id && x.cats.some(c => p.cats.includes(c))).slice(0, 5);
  const off = discount(p);
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, ...(s ? [{ t:s.parent.name, h:'#/c/' + s.parent.id }, { t:s.name, h:`#/c/${s.parent.id}/${s.id}` }] : []), { t:p.name }])}
    <div class="panel"><div class="qv">
      <div class="qv-media">${media(p)}</div>
      <div class="qv-body">
        <span class="card-brand">${esc(p.brand)} · ${esc(p.id)}</span>
        <h3>${esc(p.name)}</h3>
        <div class="price-row">
          <span class="price" style="font-size:26px">${priceHTML(p.price)}</span>
          ${p.old ? `<span class="old">${money(p.old)}</span><span class="off">وفّر ${off}%</span>` : ''}
          <span class="card-cat">/ ${esc(p.unit || 'حبة')}</span>
        </div>
        <p class="desc">${esc(p.desc)}</p>
        <ul class="specs">${(p.specs || []).map(x => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px">
          <div class="qty" data-qtybox><button data-step="-1" aria-label="إنقاص">${icon('minus')}</button>
            <span id="pq">1</span><button data-step="1" aria-label="زيادة">${icon('plus')}</button></div>
          <button class="btn btn-lg" data-add="${p.id}" data-useqty>${icon('cart')}<span>أضف إلى السلة</span></button>
          <button class="ibtn fav ${store.isFav(p.id) ? 'on' : ''}" data-fav="${p.id}" style="position:static;width:48px;height:48px;box-shadow:var(--e1)">${icon('heart')}</button>
        </div>
        <a class="btn btn-block wa" style="margin-top:12px" target="_blank" rel="noopener"
           href="${waLink(`السلام عليكم، أستفسر عن: ${p.name} (${p.id})`)}">${icon('whatsapp')}<span>استفسر عبر واتساب</span></a>
        <div class="qv-cats">${p.cats.map(k => { const x = subInfo(k); return x ? `<a href="#/c/${x.parent.id}/${x.id}">${esc(x.name)}</a>` : ''; }).join('')}</div>
      </div>
    </div></div>
    ${rel.length ? `<div style="margin-top:38px"><div class="sec-head"><div><h2 style="font-size:21px">منتجات مشابهة</h2></div></div>
      <div class="grid-p">${rel.map(card).join('')}</div></div>` : ''}
  </div>`;
}

/* --- السلة --- */
function viewCart(){
  const lines = store.lines;
  if(!lines.length) return `<div class="wrap sec">${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'سلة التسوق' }])}
    ${emptyState('سلتك فارغة', 'أضف ما تحتاجه من الأقسام وستجده هنا بانتظارك.', 'cableRoll', '#/categories', 'ابدأ التسوّق')}</div>`;
  const sub = store.subtotal, save = store.savings, o = SITE.orders;
  const left = Math.max(0, o.freeDeliveryOver - sub);
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'سلة التسوق' }])}
    <div class="sec-head"><div><span class="eyebrow">${icon('cart')}السلة</span>
      <h2>سلة التسوق</h2><p>${store.count} قطعة في ${lines.length} مادة.</p></div>
      <button class="btn btn-sm btn-danger" data-clear>${icon('trash')}<span>إفراغ السلة</span></button></div>
    <div class="cart-wrap">
      <div class="panel" id="cartList">
        ${lines.map(l => `<div class="crow" data-line="${l.id}">
          <div class="thumb">${media(l)}</div>
          <div class="info">
            <a href="#/p/${l.id}"><b>${esc(l.name)}</b></a>
            <small>${esc(l.brand)} · ${priceHTML(l.price)} / ${esc(l.unit || 'حبة')}</small>
          </div>
          <div class="qty"><button data-dec="${l.id}" aria-label="إنقاص">${icon('minus')}</button>
            <span>${l.q}</span><button data-inc="${l.id}" aria-label="زيادة">${icon('plus')}</button></div>
          <span class="line-total">${priceHTML(l.total)}</span>
          <button class="ibtn" data-del="${l.id}" aria-label="حذف">${icon('trash')}</button>
        </div>`).join('')}
      </div>
      <div class="panel">
        <div class="panel-h"><h3>ملخص الطلب</h3></div>
        <div class="panel-b">
          ${o.freeDeliveryOver ? `<div style="margin-bottom:14px">
            <div class="progress"><i style="width:${Math.min(100, sub / o.freeDeliveryOver * 100)}%"></i></div>
            <small style="font-size:12px;color:${left ? 'var(--grey)' : 'var(--ok)'};font-weight:800">
              ${left ? `أضف ${money(left)} ${SITE.currency} للحصول على توصيل مجاني` : 'مبروك! التوصيل مجاني على طلبك'}</small></div>` : ''}
          <div class="sum"><span>المجموع الفرعي</span><b>${priceHTML(sub)}</b></div>
          ${save ? `<div class="sum"><span>وفّرت</span><b class="free">${priceHTML(save)}</b></div>` : ''}
          <div class="sum"><span>التوصيل</span><b>${left ? 'يُحتسب عند الطلب' : '<span class="free">مجاني</span>'}</b></div>
          <div class="sum total"><span>الإجمالي</span><b>${priceHTML(sub)}</b></div>
          <a class="btn btn-lg btn-block" style="margin-top:16px" href="#/checkout">${icon('check')}<span>إتمام الطلب</span></a>
          <a class="btn btn-block btn-ghost" style="margin-top:8px" href="#/categories">متابعة التسوّق</a>
        </div>
      </div>
    </div>
  </div>`;
}

/* --- المفضلة --- */
function viewFav(){
  const items = store.fav.map(byId).filter(Boolean);
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'المفضلة' }])}
    <div class="sec-head"><div><span class="eyebrow">${icon('heart')}المفضلة</span>
      <h2>قائمة المفضلة</h2><p>${items.length} مادة محفوظة.</p></div></div>
    ${items.length ? `<div class="grid-p">${items.map(card).join('')}</div>`
      : emptyState('لا توجد مواد مفضلة', 'اضغط على القلب في أي منتج لحفظه هنا.', 'bulb', '#/categories', 'تصفّح الأقسام')}
  </div>`;
}

/* --- البحث --- */
function viewSearch(q){
  const items = searchProducts(q);
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'نتائج البحث' }])}
    <div class="sec-head"><div><span class="eyebrow">${icon('search')}بحث</span>
      <h2>نتائج البحث عن «${esc(q)}»</h2><p>${items.length} نتيجة.</p></div></div>
    ${items.length ? listBlock(items, 'q:' + q)
      : emptyState('لم نجد ما يطابق بحثك', 'جرّب كلمة أقصر أو تصفّح الأقسام مباشرة.', 'multimeter', '#/categories', 'تصفّح الأقسام')}
  </div>`;
}

/* --- إتمام الطلب --- */
function viewCheckout(){
  const lines = store.lines;
  if(!lines.length) return `<div class="wrap sec">${emptyState('لا يمكن إتمام طلب فارغ', 'أضف مواد إلى السلة أولاً.', 'cableRoll', '#/categories', 'تصفّح الأقسام')}</div>`;
  const sub = store.subtotal;
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'السلة', h:'#/cart' }, { t:'إتمام الطلب' }])}
    <div class="sec-head"><div><span class="eyebrow">${icon('check')}الخطوة الأخيرة</span>
      <h2>معلومات الطلب</h2><p>نحتاج بياناتك للتواصل وتثبيت الطلب — الدفع عند الاستلام.</p></div></div>
    <div class="cart-wrap">
      <div class="panel"><div class="panel-b">
        <form class="form" id="orderForm" novalidate>
          <div class="f2">
            <div class="field"><input id="fName" placeholder=" " autocomplete="name" required><label for="fName">الاسم الكامل *</label><span class="msg">الرجاء إدخال الاسم</span></div>
            <div class="field"><input id="fPhone" placeholder=" " inputmode="tel" autocomplete="tel" dir="ltr" required><label for="fPhone">رقم الهاتف *</label><span class="msg">أدخل رقماً عراقياً صحيحاً مثل 07XXXXXXXXX</span></div>
          </div>
          <div class="f2">
            <div class="field"><select id="fGov" required>${SITE.governorates.map(g => `<option${g === SITE.city ? ' selected' : ''}>${g}</option>`).join('')}</select><label for="fGov">المحافظة *</label>${icon('chevronDown', 'cv')}</div>
            <div class="field"><input id="fArea" placeholder=" " autocomplete="address-level2"><label for="fArea">المنطقة / أقرب نقطة دالة</label></div>
          </div>
          <div class="field"><input id="fAddr" placeholder=" " autocomplete="street-address"><label for="fAddr">العنوان التفصيلي</label><span class="msg">العنوان مطلوب عند اختيار التوصيل</span></div>

          <div>
            <h4 style="font-size:14.5px;margin-bottom:10px">طريقة الاستلام</h4>
            <div class="radio-row">
              <label class="radio"><input type="radio" name="method" value="delivery" checked><span class="dot"></span>
                <span><b>توصيل إلى العنوان</b><small>يُحتسب حسب المحافظة</small></span></label>
              <label class="radio"><input type="radio" name="method" value="pickup"><span class="dot"></span>
                <span><b>استلام من المحل</b><small>مجاناً — ${esc(SITE.city)}</small></span></label>
            </div>
          </div>
          <div>
            <h4 style="font-size:14.5px;margin-bottom:10px">طريقة الدفع</h4>
            <div class="radio-row">
              <label class="radio"><input type="radio" name="pay" value="cod" checked><span class="dot"></span>
                <span><b>الدفع عند الاستلام</b><small>نقداً عند تسلّم الطلب</small></span></label>
              <label class="radio"><input type="radio" name="pay" value="transfer"><span class="dot"></span>
                <span><b>تحويل / اتفاق مسبق</b><small>نتواصل معك لتحديد التفاصيل</small></span></label>
            </div>
          </div>
          <div class="field"><textarea id="fNote" placeholder=" "></textarea><label for="fNote">ملاحظات على الطلب (اختياري)</label></div>
          <button class="btn btn-lg btn-block" type="submit">${icon('check')}<span>تأكيد الطلب</span></button>
          <p style="font-size:12.5px;color:var(--grey);text-align:center">بتأكيد الطلب يُسجَّل لديك رقم طلب، ويمكنك إرساله لنا عبر واتساب بضغطة واحدة.</p>
        </form>
      </div></div>

      <div class="panel">
        <div class="panel-h"><h3>مراجعة الطلب</h3><span class="card-cat">${store.count} قطعة</span></div>
        <div class="panel-b">
          ${lines.map(l => `<div style="display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line-2)">
            <div class="thumb" style="width:46px;height:46px;border-radius:var(--r-xs);background:var(--brand-50);display:grid;place-items:center;overflow:hidden">${media(l)}</div>
            <div style="flex:1;min-width:0"><b style="font-size:13px;display:block">${esc(l.name)}</b>
              <small style="color:var(--grey);font-size:11.5px">${l.q} × ${money(l.price)}</small></div>
            <b style="font-size:13.5px;white-space:nowrap">${money(l.total)}</b></div>`).join('')}
          <div class="sum" style="margin-top:10px"><span>المجموع الفرعي</span><b>${priceHTML(sub)}</b></div>
          <div class="sum"><span>التوصيل</span><b id="feeLbl">—</b></div>
          <div class="sum total"><span>الإجمالي</span><b id="totLbl">${priceHTML(sub)}</b></div>
        </div>
      </div>
    </div>
  </div>`;
}

function statusPill(st, big){
  const i = statusInfo(st);
  return `<span class="stpill${big ? ' big' : ''}" style="color:${i.color};background:${i.bg}">${icon(i.icon)}<span>${i.ar}</span></span>`;
}
/* شريط مراحل الطلب */
function statusTrack(st){
  if(st === 'rejected') return '';
  const steps = ['pending', 'confirmed', 'preparing', 'delivering', 'done'];
  const at = Math.max(0, steps.indexOf(st));
  return `<ol class="track">${steps.map((k, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}">
      <span class="dot">${i <= at ? icon('check') : ''}</span><b>${statusInfo(k).ar}</b></li>`).join('')}</ol>`;
}

/* --- تأكيد الطلب --- */
function viewOrder(id){
  const o = store.orderById(id); if(!o) return notFound();
  const txt = orderText(o);
  const live = o.online !== false && FB.ready();
  return `<div class="wrap sec">
    <div class="panel" style="max-width:760px;margin-inline:auto">
      <div class="panel-b" style="text-align:center;padding:34px 26px;background:linear-gradient(150deg,var(--brand-50),#fff)">
        <span style="width:72px;height:72px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;margin:0 auto 16px;box-shadow:var(--e-brand)">${icon('check')}</span>
        <h2 style="font-size:24px;margin-bottom:8px">${live ? 'وصل طلبك إلينا' : 'تم تسجيل طلبك'}</h2>
        <p style="color:var(--grey);max-width:50ch;margin:0 auto 6px">${live
          ? 'طلبك الآن عند فريق المبيعات وسنراجعه ونتواصل معك. تابع حالته من هذه الصفحة في أي وقت.'
          : 'احتفظ برقم الطلب أدناه، وأرسله لنا عبر واتساب ليصل إلى فريق المبيعات.'}</p>
        <div style="display:inline-flex;align-items:center;gap:10px;background:#fff;border:2px dashed var(--brand);
          border-radius:var(--r);padding:12px 22px;margin:16px 0;font-weight:900;font-size:20px;letter-spacing:1px;direction:ltr">
          ${esc(o.no || o.id)}<button class="ibtn" data-copy="${esc(o.no || o.id)}" aria-label="نسخ رقم الطلب" style="width:34px;height:34px">${icon('copy')}</button></div>
        <div id="liveStatus">${statusPill(o.status, true)}</div>
        ${live ? `<div id="liveTrack">${statusTrack(o.status)}</div>` : ''}
        <div id="liveNote"></div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px">
          ${live
            ? `<button class="btn btn-lg btn-outline" data-refresh="${esc(o.id)}">${icon('bolt')}<span>تحديث الحالة</span></button>
               <a class="btn btn-lg wa" target="_blank" rel="noopener" href="${waLink('استفسار عن الطلب رقم ' + (o.no || o.id))}">${icon('whatsapp')}<span>استفسار عن الطلب</span></a>`
            : `<a class="btn btn-lg wa" target="_blank" rel="noopener" href="${waLink(txt)}">${icon('whatsapp')}<span>إرسال الطلب عبر واتساب</span></a>
               <button class="btn btn-lg btn-outline" data-copytext>${icon('copy')}<span>نسخ تفاصيل الطلب</span></button>`}
        </div>
      </div>
      <div class="panel-b">
        <h3 style="font-size:16px;margin-bottom:12px">تفاصيل الطلب</h3>
        ${o.items.map(it => `<div class="sum"><span>${esc(it.name)} <small style="color:var(--grey-2)">× ${it.q}</small></span><b>${money(it.total)}</b></div>`).join('')}
        <div class="sum"><span>المجموع الفرعي</span><b>${priceHTML(o.subtotal)}</b></div>
        <div class="sum"><span>التوصيل (${o.method === 'pickup' ? 'استلام من المحل' : esc(o.customer.gov)})</span>
          <b>${o.fee ? money(o.fee) : '<span class="free">مجاني</span>'}</b></div>
        <div class="sum total"><span>الإجمالي</span><b>${priceHTML(o.total)}</b></div>
        <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--line-2);font-size:13.5px;color:var(--grey);display:grid;gap:5px">
          <span><b style="color:var(--ink)">الاسم:</b> ${esc(o.customer.name)}</span>
          <span><b style="color:var(--ink)">الهاتف:</b> <span dir="ltr">${esc(o.customer.phone)}</span></span>
          <span><b style="color:var(--ink)">العنوان:</b> ${esc([o.customer.gov, o.customer.area, o.customer.address].filter(Boolean).join(' — '))}</span>
          ${o.customer.note ? `<span><b style="color:var(--ink)">ملاحظات:</b> ${esc(o.customer.note)}</span>` : ''}
        </div>
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
          <a class="btn btn-tonal" href="#/orders">${icon('box')}<span>طلباتي</span></a>
          <a class="btn btn-ghost" href="#/">العودة للرئيسية</a>
        </div>
      </div>
    </div>
    <textarea id="copySrc" class="sr" readonly>${esc(txt)}</textarea>
  </div>`;
}

/* --- طلباتي --- */
function viewOrders(){
  const os = store.orders;
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'طلباتي' }])}
    <div class="sec-head"><div><span class="eyebrow">${icon('box')}السجل</span>
      <h2>طلباتي</h2><p>سجل الطلبات محفوظ على هذا الجهاز.</p></div></div>
    ${os.length ? `<div class="panel">${os.map(o => `<div class="crow">
      <div class="thumb" style="background:var(--brand-100);color:var(--brand-800);font-weight:900">${icon('box')}</div>
      <div class="info"><b dir="ltr" style="letter-spacing:.5px">${esc(o.no || o.id)}</b>
        <small>${new Date(o.at).toLocaleString('ar-IQ')} · ${o.items.length} مادة · ${o.method === 'pickup' ? 'استلام من المحل' : 'توصيل'}</small>
        <div style="margin-top:5px">${statusPill(o.status)}</div></div>
      <span class="line-total">${priceHTML(o.total)}</span>
      <a class="btn btn-sm btn-tonal" href="#/order/${o.id}">التفاصيل</a>
    </div>`).join('')}</div>`
    : emptyState('لا توجد طلبات بعد', 'عند إتمام أول طلب سيظهر هنا مع رقمه وتفاصيله.', 'junction', '#/categories', 'ابدأ التسوّق')}
  </div>`;
}

/* --- التواصل --- */
function viewContact(){
  const g = SITE.geo;
  const bbox = [g.lng - .012, g.lat - .008, g.lng + .012, g.lat + .008].join(',');
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${g.lat},${g.lng}`;
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${g.lat},${g.lng}`;
  return `<div class="wrap sec">
    ${crumbs([{ t:'الرئيسية', h:'#/' }, { t:'تواصل معنا' }])}
    <div class="sec-head"><div><span class="eyebrow">${icon('phone')}تواصل معنا</span>
      <h2>موقعنا وأرقام التواصل</h2><p>زُرنا في المحل أو تواصل معنا مباشرة — نجيب على استفساراتك الفنية بكل سرور.</p></div></div>
    <div class="contact-grid">
      <div class="cinfo">
        <div class="cbox"><span class="pic">${icon('location')}</span>
          <div><h4>عنوان المحل</h4><p>${esc(SITE.address)}</p>
          <a href="${gmaps}" target="_blank" rel="noopener" style="color:var(--brand-700);font-weight:800;margin-top:6px">فتح في خرائط جوجل ←</a></div></div>
        ${SITE.phones.map(ph => `<div class="cbox"><span class="pic">${icon('phone')}</span>
          <div><h4>${esc(ph.label)}</h4><a class="num" href="tel:${ph.number}" dir="ltr">${esc(fmtPhone(ph.number))}</a></div></div>`).join('')}
        <div class="cbox"><span class="pic">${icon('whatsapp')}</span>
          <div><h4>واتساب</h4><p>أرسل استفسارك أو طلبك مباشرة</p>
          <a class="btn btn-sm wa" style="margin-top:8px" target="_blank" rel="noopener"
             href="${waLink('السلام عليكم، أود الاستفسار عن المواد المتوفرة لديكم.')}">${icon('whatsapp')}<span>بدء محادثة</span></a></div></div>
        <div class="cbox"><span class="pic">${icon('clock')}</span>
          <div><h4>أوقات الدوام</h4>${SITE.hours.map(h => `<p>${esc(h.d)}: <b style="color:var(--ink)">${esc(h.t)}</b></p>`).join('')}</div></div>
        ${SITE.social.some(s => s.url) ? `<div class="cbox"><span class="pic">${icon('star')}</span>
          <div style="flex:1"><h4>تابعنا</h4><div class="socials" style="margin-top:10px">
            ${SITE.social.filter(s => s.url).map(s => `<a class="soc" href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.name)}">${icon(s.id)}</a>`).join('')}
          </div></div></div>` : ''}
      </div>
      <div class="map-card">
        <div class="map-wrap">
          <div class="map-fb">${icon('location')}<b>${esc(SITE.name)}</b><span>${esc(SITE.address)}</span></div>
          <iframe src="${osm}" title="موقع المحل على الخريطة" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div class="map-foot">
          <div><b style="display:block">${esc(SITE.name)}</b><small style="color:var(--grey)">${esc(SITE.address)}</small></div>
          <a class="btn btn-sm btn-tonal" href="${gmaps}" target="_blank" rel="noopener">${icon('location')}<span>الاتجاهات</span></a>
        </div>
      </div>
    </div>
  </div>`;
}

function notFound(){
  return `<div class="wrap sec">${emptyState('الصفحة غير موجودة', 'الرابط الذي فتحته غير صحيح أو تم تغييره.', 'junction', '#/', 'العودة للرئيسية')}</div>`;
}

/* ================= التوجيه ================= */
function parseHash(){
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  return h.split('/').filter(Boolean);
}
let bentoTimer = null;

function render(){
  const s = parseHash();
  if(bentoTimer){ clearInterval(bentoTimer); bentoTimer = null; }
  let html, title = SITE.name;
  switch(s[0]){
    case undefined: html = viewHome(); title = `${SITE.name} — ${SITE.tagline}`; break;
    case 'categories': html = viewCategories(); title = 'الأقسام — ' + SITE.shortName; break;
    case 'c':
      if(s[2]){ html = viewSub(s[1], s[2]); const x = subInfo(s[1] + '/' + s[2]); title = (x ? x.name : 'قسم') + ' — ' + SITE.shortName; }
      else { html = viewCategory(s[1]); const c = CMAP.get(s[1]); title = (c ? c.name : 'قسم') + ' — ' + SITE.shortName; }
      break;
    case 'p':    { const p = byId(s[1]); html = viewProduct(s[1]); title = (p ? p.name : 'منتج') + ' — ' + SITE.shortName; break; }
    case 'cart':     html = viewCart();     title = 'سلة التسوق — ' + SITE.shortName; break;
    case 'checkout': html = viewCheckout(); title = 'إتمام الطلب — ' + SITE.shortName; break;
    case 'order':    html = viewOrder(s[1]);title = 'طلب ' + (s[1] || '');            break;
    case 'orders':   html = viewOrders();   title = 'طلباتي — ' + SITE.shortName;     break;
    case 'fav':      html = viewFav();      title = 'المفضلة — ' + SITE.shortName;    break;
    case 'contact':  html = viewContact();  title = 'تواصل معنا — ' + SITE.shortName; break;
    case 'search':   html = viewSearch(s.slice(1).join('/')); title = 'بحث — ' + SITE.shortName; break;
    default: html = notFound();
  }
  document.title = title;
  const el = app();
  el.innerHTML = html;
  el.classList.remove('view'); void el.offsetWidth; el.classList.add('view');
  afterRender(s);
}

function afterRender(s){
  window.scrollTo({ top:0, behavior:'instant' in document.documentElement.style ? 'instant' : 'auto' });
  reveal();
  markNav(s[0]);
  $$('.field select').forEach(x => x.classList.add('filled'));
  if(!s[0]) initBento();
  if(s[0] === 'checkout') initCheckout();
  if(s[0] === 'order') refreshOrderStatus(s[1]);
  if(s[0] === 'orders') refreshMyOrders();
  closeDrawer();
}

function markNav(k){
  const map = { undefined:'home', categories:'cats', c:'cats', cart:'cart', checkout:'cart', contact:'contact' };
  const active = map[k] || '';
  $$('.navlink').forEach(a => a.classList.toggle('active', a.dataset.nav === active));
}

/* ظهور تدريجي عند التمرير */
let io;
function reveal(){
  if(io) io.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin:'0px 0px -40px 0px', threshold:.06 });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = Math.min(i % 8 * 45, 320) + 'ms'; io.observe(el); });
}

/* ================= بنتو جريد متغيّر ================= */
const TINTS = [['#EAF9F9','#FFFFFF'],['#FFFFFF','#EFF4F5'],['#E4F6F6','#F7FCFC'],['#F2F7F8','#FFFFFF']];
function bentoPools(){
  const seen = new Set(), prods = [];
  [...PRODUCTS.filter(p => p.imgData || p.image), ...PRODUCTS.filter(p => p.badge === 'hot'),
   ...PRODUCTS.filter(p => p.badge === 'new'), ...PRODUCTS.filter(p => p.old)]
    .forEach(p => { if(!seen.has(p.id)){ seen.add(p.id); prods.push(p); } });
  const cats = [];
  CATEGORIES.forEach(c => { cats.push({ cat:c }); c.subs.slice(0, 3).forEach(sb => cats.push({ cat:c, sub:sb })); });
  return { prods, cats };
}
function tileHTML(item, i){
  const [a, b] = TINTS[i % TINTS.length];
  if(item.cat){
    const { cat, sub } = item;
    const href = sub ? `#/c/${cat.id}/${sub.id}` : `#/c/${cat.id}`;
    return `<a class="bt-in bt-fade" href="${href}">
      <span class="bt-bg" style="background:linear-gradient(160deg,${a},${b})"></span>
      ${art(sub ? sub.icon : cat.icon)}
      <span class="bt-lbl"><b>${esc(sub ? sub.name : cat.name)}</b><small>${sub ? esc(cat.name) : countIn(cat.id) + ' منتج'}</small></span></a>`;
  }
  const p = item;
  return `<a class="bt-in bt-fade" href="#/p/${p.id}">
    <span class="bt-bg" style="background:linear-gradient(160deg,${a},${b})"></span>
    ${(p.imgData || p.image) ? media(p, 'bt-img') : art(p.icon)}
    <span class="bt-lbl"><b>${esc(p.name)}</b><small>${money(p.price)} ${SITE.currency}</small></span></a>`;
}
function initBento(){
  const box = document.getElementById('bento'); if(!box) return;
  const { prods, cats } = bentoPools();
  /* البلاطات المخصّصة للمنتجات تتحوّل إلى أقسام إذا كانت المواد أقل من عددها،
     حتى لا تتكرر المادة نفسها في أكثر من بلاطة. */
  const slots = ['bt1','bt2','bt3','bt4','bt5','bt6','bt7','bt8'];
  const wantsProduct = [true, false, true, true, false, true, false, true];
  const maxProdTiles = Math.min(wantsProduct.filter(Boolean).length, prods.length);
  let pi = 0, ci = 0;
  const plan = slots.map((cls, n) => wantsProduct[n] && pi < maxProdTiles
    ? { cls, pool:prods, i:pi++ }
    : { cls, pool:cats, i:ci++ });
  box.innerHTML = plan.map((t, n) => `<div class="bt ${t.cls}">${tileHTML(t.pool[t.i % t.pool.length], n)}</div>`).join('');
  let k = 0;
  bentoTimer = setInterval(() => {
    if(document.hidden) return;
    const n = k++ % plan.length, t = plan[n];
    if(t.pool.length < 2) return;          // لا تدوير لمجموعة من عنصر واحد
    t.i += plan.length;
    const cell = box.children[n]; if(!cell) return;
    cell.innerHTML = tileHTML(t.pool[t.i % t.pool.length], n + k);
  }, 2400);
}

/* ================= نافذة العرض السريع ================= */
function openQuick(id){
  const p = byId(id); if(!p) return;
  const off = discount(p);
  $('#modalBody').innerHTML = `<button class="ibtn modal-close" data-mclose aria-label="إغلاق">${icon('close')}</button>
    <div class="qv"><div class="qv-media">${media(p)}</div>
    <div class="qv-body">
      <span class="card-brand">${esc(p.brand)} · ${esc(p.id)}</span>
      <h3>${esc(p.name)}</h3>
      <div class="price-row"><span class="price" style="font-size:24px">${priceHTML(p.price)}</span>
        ${p.old ? `<span class="old">${money(p.old)}</span><span class="off">-${off}%</span>` : ''}
        <span class="card-cat">/ ${esc(p.unit || 'حبة')}</span></div>
      <p class="desc">${esc(p.desc)}</p>
      <ul class="specs">${(p.specs || []).map(x => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
        <button class="btn btn-lg" data-add="${p.id}">${icon('cart')}<span>أضف إلى السلة</span></button>
        <a class="btn btn-lg btn-outline" href="#/p/${p.id}" data-mclose>التفاصيل الكاملة</a>
      </div>
      <div class="qv-cats">${p.cats.map(k => { const x = subInfo(k); return x ? `<a href="#/c/${x.parent.id}/${x.id}" data-mclose>${esc(x.name)}</a>` : ''; }).join('')}</div>
    </div></div>`;
  $('#modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeQuick(){ $('#modal').classList.remove('open'); document.body.style.overflow = ''; }

/* ================= إتمام الطلب ================= */
function normPhone(v){
  const d = String(v).replace(/\D/g, '').replace(/^00/, '');
  const m = d.replace(/^964/, '').replace(/^0/, '');
  return /^7\d{9}$/.test(m) ? '0' + m : null;
}
function initCheckout(){
  const f = $('#orderForm'); if(!f) return;
  const upd = () => {
    const method = f.querySelector('input[name=method]:checked').value;
    const gov = $('#fGov').value;
    const fee = store.deliveryFee(method, gov);
    $('#feeLbl').innerHTML = method === 'pickup' ? 'استلام من المحل'
      : fee ? priceHTML(fee) : '<span class="free">مجاني</span>';
    $('#totLbl').innerHTML = priceHTML(store.subtotal + fee);
  };
  f.addEventListener('change', upd); upd();

  f.addEventListener('submit', async e => {
    e.preventDefault();
    const method = f.querySelector('input[name=method]:checked').value;
    const pay = f.querySelector('input[name=pay]:checked').value;
    const name = $('#fName').value.trim(), phoneRaw = $('#fPhone').value.trim();
    const phone = normPhone(phoneRaw), addr = $('#fAddr').value.trim();
    let ok = true;
    const mark = (el, bad) => { el.closest('.field').classList.toggle('err', bad); if(bad) ok = false; };
    mark($('#fName'), name.length < 3);
    mark($('#fPhone'), !phone);
    mark($('#fAddr'), method === 'delivery' && addr.length < 5);
    if(!ok){ toast('الرجاء إكمال الحقول المطلوبة', 'err'); f.querySelector('.field.err input')?.focus(); return; }

    const btn = f.querySelector('button[type=submit]');
    const lbl = btn.querySelector('span'), old = lbl.textContent;
    btn.disabled = true; lbl.textContent = 'جارٍ إرسال الطلب…';
    $('#orderErr')?.remove();
    try{
      const order = await store.placeOrder({
        name, phone, gov:$('#fGov').value, area:$('#fArea').value.trim(), address:addr, note:$('#fNote').value.trim()
      }, method, pay);
      if(order) location.hash = '#/order/' + order.id;
    }catch(err){
      btn.disabled = false; lbl.textContent = old;
      const net = /Failed to fetch|NetworkError|Load failed/i.test(err.message);
      f.insertAdjacentHTML('afterbegin', `<div class="note note-err" id="orderErr">${icon('close')}<span>
        <b>لم نتمكن من إرسال طلبك.</b> ${esc(net ? 'تحقّق من اتصالك بالإنترنت وحاول مجدداً.' : err.message)}
        <br>يمكنك إرسال الطلب عبر واتساب مباشرة من الزر أدناه ونحن نسجّله لك.</span></div>`);
      $('#orderErr').scrollIntoView({ behavior:'smooth', block:'center' });
      const o = store.buildOrder({ name, phone, gov:$('#fGov').value, area:$('#fArea').value.trim(),
        address:addr, note:$('#fNote').value.trim() }, method, pay);
      $('#orderErr').insertAdjacentHTML('beforeend',
        `<a class="btn btn-sm wa" style="margin-inline-start:auto" target="_blank" rel="noopener"
            href="${waLink(orderText(o))}">${icon('whatsapp')}<span>إرسال عبر واتساب</span></a>`);
      toast('تعذّر إرسال الطلب', 'err');
    }
  });
}

/* ================= الشريط العلوي والقائمة ================= */
function openDrawer(){ $('#drawer').classList.add('open'); $('#overlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeDrawer(){ $('#drawer').classList.remove('open'); $('#overlay').classList.remove('open'); document.body.style.overflow = ''; }

function buildDrawer(){
  $('#drawerBody').innerHTML = CATEGORIES.map(c => `<div class="dgroup">
    <button class="dhead" data-dg>${art(c.icon)}<span>${esc(c.name)}</span>${icon('chevronDown', 'cv')}</button>
    <div class="dsubs"><div>
      <a class="dsub" href="#/c/${c.id}"><span>كل ${esc(c.name)}</span><span class="n">${countIn(c.id)}</span></a>
      ${c.subs.map(sb => `<a class="dsub" href="#/c/${c.id}/${sb.id}"><span>${esc(sb.name)}</span><span class="n">${countIn(c.id + '/' + sb.id)}</span></a>`).join('')}
    </div></div></div>`).join('');
}

function syncCounts(){
  const c = document.getElementById('cartCount'), f = document.getElementById('favCount');
  [[c, store.count], [f, store.fav.length]].forEach(([el, n]) => {
    if(!el) return;
    const prev = el.textContent;
    el.textContent = n; el.dataset.n = n;
    if(prev !== String(n) && n > 0){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  });
  $$('[data-fav]').forEach(b => b.classList.toggle('on', store.isFav(b.dataset.fav)));
}

/* اقتراحات البحث */
let sgIdx = -1;
function suggest(q){
  const box = $('#suggest');
  const items = searchProducts(q).slice(0, 6);
  if(!q.trim() || !items.length){ box.classList.remove('open'); box.innerHTML = ''; return; }
  sgIdx = -1;
  box.innerHTML = items.map(p => `<a class="sg" href="#/p/${p.id}" data-sg>
      <span class="thumb">${media(p)}</span>
      <span><b>${esc(p.name)}</b><small>${esc(p.brand)} · ${esc(subLabel(p))}</small></span>
      <span class="pr">${money(p.price)} ${SITE.currency}</span></a>`).join('')
    + `<a class="sg" href="#/search/${encodeURIComponent(q)}" data-sg style="justify-content:center;font-weight:800;color:var(--brand-700)">
        عرض كل النتائج (${searchProducts(q).length})</a>`;
  box.classList.add('open');
}

/* ================= متابعة حالة الطلب ================= */
async function refreshOrderStatus(id){
  const o = store.orderById(id);
  if(!o || o.online === false || !FB.ready() || !$('#liveStatus')) return;
  try{
    const live = await FB.getOrder(o.id);
    if(!live) return;
    store.syncOrder(o.id, live);
    $('#liveStatus').innerHTML = statusPill(live.status, true);
    const tr = $('#liveTrack'); if(tr) tr.innerHTML = statusTrack(live.status);
    const nb = $('#liveNote');
    if(nb) nb.innerHTML = live.adminNote
      ? `<div class="adminnote">${icon('headset')}<span><b>رسالة من المتجر:</b> ${esc(live.adminNote)}</span></div>` : '';
  }catch(e){ /* الشبكة أو الصلاحيات — نبقي آخر حالة معروفة */ }
}
async function refreshMyOrders(){
  if(!FB.ready()) return;
  const online = store.orders.filter(o => o.online !== false).slice(0, 12);
  let changed = false;
  for(const o of online){
    try{
      const live = await FB.getOrder(o.id);
      if(live && (live.status !== o.status || (live.adminNote || '') !== (o.adminNote || ''))){
        store.syncOrder(o.id, live); changed = true;
      }
    }catch(e){}
  }
  if(changed && parseHash()[0] === 'orders') render();
}

/* ================= الأحداث العامة ================= */
function ripple(e, el){
  const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height);
  const s = document.createElement('span');
  s.className = 'rp';
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  el.appendChild(s); setTimeout(() => s.remove(), 560);
}

function bindGlobal(){
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest('.btn,.ibtn,.chip');
    if(b && !b.classList.contains('no-rp')) ripple(e, b);
  });

  document.addEventListener('click', e => {
    const t = e.target;

    /* إضافة للسلة */
    const add = t.closest('[data-add]');
    if(add){
      const useQty = add.hasAttribute('data-useqty');
      const q = useQty ? (parseInt($('#pq')?.textContent, 10) || 1) : 1;
      store.add(add.dataset.add, q);
      return;
    }
    /* المفضلة */
    const fav = t.closest('[data-fav]');
    if(fav){
      const on = store.toggleFav(fav.dataset.fav);
      fav.classList.toggle('on', on);
      fav.classList.remove('bump'); void fav.offsetWidth; fav.classList.add('bump');
      return;
    }
    /* عرض سريع */
    const open = t.closest('[data-open]');
    if(open && !t.closest('[data-fav],[data-add]')){ openQuick(open.dataset.open); return; }

    /* كمية صفحة المنتج */
    const step = t.closest('[data-step]');
    if(step){
      const el = $('#pq'); const v = Math.max(1, Math.min(99, (parseInt(el.textContent, 10) || 1) + (+step.dataset.step)));
      el.textContent = v; return;
    }
    /* السلة */
    const inc = t.closest('[data-inc]'); if(inc){ store.setQty(inc.dataset.inc, store.qtyOf(inc.dataset.inc) + 1); render(); return; }
    const dec = t.closest('[data-dec]'); if(dec){ store.setQty(dec.dataset.dec, store.qtyOf(dec.dataset.dec) - 1); render(); return; }
    const del = t.closest('[data-del]');
    if(del){
      const row = del.closest('.crow'); row.classList.add('out');
      setTimeout(() => { store.remove(del.dataset.del); render(); }, 240); return;
    }
    if(t.closest('[data-clear]')){
      if(confirm('هل تريد إفراغ السلة بالكامل؟')){ store.clearCart(); render(); }
      return;
    }
    /* فلتر العلامة */
    const br = t.closest('[data-brand]');
    if(br){ flt.brand = br.dataset.brand; render(); return; }

    /* تحديث حالة الطلب يدوياً */
    const rf = t.closest('[data-refresh]');
    if(rf){
      const b = rf, l = b.querySelector('span'), o = l.textContent;
      b.disabled = true; l.textContent = 'جارٍ التحديث…';
      refreshOrderStatus(rf.dataset.refresh).finally(() => {
        b.disabled = false; l.textContent = o; toast('حُدّثت الحالة', 'ok');
      });
      return;
    }

    /* نسخ */
    const cp = t.closest('[data-copy]');
    if(cp){ copy(cp.dataset.copy); return; }
    if(t.closest('[data-copytext]')){ copy($('#copySrc')?.value || ''); return; }

    /* القائمة الجانبية */
    if(t.closest('#menuBtn')){ openDrawer(); return; }
    if(t.closest('#overlay') || t.closest('[data-dclose]')){ closeDrawer(); return; }
    const dg = t.closest('[data-dg]');
    if(dg){ dg.parentElement.classList.toggle('open'); return; }
    if(t.closest('.dsub')){ closeDrawer(); return; }

    /* النافذة المنبثقة */
    if(t.closest('[data-mclose]') || t.closest('.modal-bg')){ closeQuick(); return; }

    /* مسح البحث */
    if(t.closest('#sClear')){ const i = $('#q'); i.value = ''; i.dispatchEvent(new Event('input')); i.focus(); return; }
  });

  /* الترتيب */
  document.addEventListener('change', e => {
    if(e.target.id === 'sortSel'){ flt.sort = e.target.value; render(); }
  });

  /* البحث */
  const q = $('#q');
  let tmr;
  q.addEventListener('input', () => {
    $('.searchbar').classList.toggle('has', !!q.value);
    clearTimeout(tmr); tmr = setTimeout(() => suggest(q.value), 130);
  });
  q.addEventListener('keydown', e => {
    const items = $$('#suggest .sg');
    if(e.key === 'Enter'){
      e.preventDefault();
      if(sgIdx > -1 && items[sgIdx]) { location.hash = items[sgIdx].getAttribute('href'); }
      else if(q.value.trim()) location.hash = '#/search/' + encodeURIComponent(q.value.trim());
      $('#suggest').classList.remove('open'); q.blur();
    }
    if(e.key === 'Escape'){ $('#suggest').classList.remove('open'); q.blur(); }
    if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      if(!items.length) return;
      e.preventDefault();
      sgIdx = (sgIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('on', i === sgIdx));
      items[sgIdx].scrollIntoView({ block:'nearest' });
    }
  });
  document.addEventListener('click', e => {
    if(!e.target.closest('.searchbar')) $('#suggest').classList.remove('open');
    if(e.target.closest('[data-sg]')){ $('#suggest').classList.remove('open'); q.value = ''; $('.searchbar').classList.remove('has'); }
  });

  /* مفاتيح عامة */
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ closeQuick(); closeDrawer(); }
    if(e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)){ e.preventDefault(); q.focus(); }
    if(e.key === 'Enter' && e.target.classList?.contains('card-media')) openQuick(e.target.dataset.open);
  });

  /* التمرير */
  const bar = $('#topbar'), top = $('#toTop');
  let ticking = false;
  addEventListener('scroll', () => {
    if(ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      bar.classList.toggle('stuck', y > 8);
      top.classList.toggle('show', y > 600);
      ticking = false;
    });
  }, { passive:true });
  top.addEventListener('click', () => scrollTo({ top:0, behavior:'smooth' }));
}

async function copy(text){
  try{
    await navigator.clipboard.writeText(text);
    toast('تم النسخ', 'ok');
  }catch(e){
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); toast('تم النسخ', 'ok'); }catch(_){ toast('تعذّر النسخ', 'err'); }
    ta.remove();
  }
}

/* ================= الإقلاع ================= */
function boot(){
  store.load();
  if(typeof PREVIEW !== 'undefined' && PREVIEW) showPreviewBar();
  buildDrawer();
  buildFooter();
  bindGlobal();
  onChange(syncCounts);
  syncCounts();
  addEventListener('hashchange', () => { flt = { sort:'pop', brand:'' }; render(); });
  render();
  document.getElementById('boot')?.remove();
}

function showPreviewBar(){
  const el = document.createElement('div');
  el.id = 'previewBar';
  el.innerHTML = `${icon('bolt')}<span>وضع المعاينة — تشاهد مسودّة لوحة التحكم، وهذه التغييرات <b>غير منشورة</b> للزبائن.</span>
    <a class="btn btn-sm" href="admin.html">لوحة التحكم</a>
    <button class="btn btn-sm btn-ghost" id="exitPreview">خروج من المعاينة</button>`;
  document.body.prepend(el);
  document.getElementById('exitPreview').addEventListener('click', () => {
    sessionStorage.removeItem('wz_preview'); location.reload();
  });
}

function buildFooter(){
  $('#footCats').innerHTML = CATEGORIES.map(c => `<a href="#/c/${c.id}">${esc(c.name)}</a>`).join('');
  $('#footLinks').innerHTML = [
    ['#/', 'الرئيسية'], ['#/categories', 'كل الأقسام'], ['#/cart', 'سلة التسوق'],
    ['#/fav', 'المفضلة'], ['#/orders', 'طلباتي'], ['#/contact', 'تواصل معنا']
  ].map(([h, t]) => `<a href="${h}">${t}</a>`).join('');
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}

document.readyState === 'loading' ? addEventListener('DOMContentLoaded', boot) : boot();

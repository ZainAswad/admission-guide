/* ================= نظام الطلبات — عميل Firestore عبر REST =================
   بلا أي مكتبة خارجية: نداءات fetch مباشرة، فلا نسخة SDK تتعطّل مع الوقت.
   الحماية كلها في قواعد Firestore (راجع FIREBASE.md).                        */

const FB = {
  cfg(){ return (typeof SITE !== 'undefined' && SITE.firebase) || {}; },
  /* هل ضُبطت الإعدادات؟ إن لا، يرجع الموقع تلقائياً لآلية واتساب */
  ready(){ const c = this.cfg(); return !!(c.apiKey && c.projectId); },
  docsUrl(){ return `https://firestore.googleapis.com/v1/projects/${this.cfg().projectId}/databases/(default)/documents`; },

  /* --- تحويل القيم من/إلى صيغة Firestore --- */
  val(v){
    if(v === null || v === undefined) return { nullValue:null };
    if(typeof v === 'boolean') return { booleanValue:v };
    if(typeof v === 'number')
      return Number.isInteger(v) ? { integerValue:String(v) } : { doubleValue:v };
    if(Array.isArray(v)) return { arrayValue:{ values:v.map(x => FB.val(x)) } };
    if(typeof v === 'object') return { mapValue:{ fields:FB.fields(v) } };
    return { stringValue:String(v) };
  },
  fields(o){ const f = {}; Object.keys(o).forEach(k => { f[k] = FB.val(o[k]); }); return f; },
  parse(v){
    if(!v || typeof v !== 'object') return null;
    if('stringValue'  in v) return v.stringValue;
    if('integerValue' in v) return Number(v.integerValue);
    if('doubleValue'  in v) return Number(v.doubleValue);
    if('booleanValue' in v) return v.booleanValue;
    if('nullValue'    in v) return null;
    if('timestampValue' in v) return v.timestampValue;
    if('arrayValue'   in v) return (v.arrayValue.values || []).map(x => FB.parse(x));
    if('mapValue'     in v) return FB.doc(v.mapValue.fields || {});
    return null;
  },
  doc(fields){ const o = {}; Object.keys(fields || {}).forEach(k => { o[k] = FB.parse(fields[k]); }); return o; },
  idOf(name){ return String(name || '').split('/').pop(); },

  /* --- رسائل خطأ مفهومة --- */
  async fail(r, what){
    let msg = '';
    try{ const j = await r.json(); msg = (j.error && (j.error.message || j.error.status)) || ''; }catch(e){}
    const map = {
      'PERMISSION_DENIED': 'الصلاحيات لا تسمح بهذه العملية — راجع قواعد Firestore.',
      'NOT_FOUND': 'لم يُعثر على الطلب.',
      'UNAUTHENTICATED': 'انتهت الجلسة — سجّل الدخول من جديد.',
      'INVALID_ARGUMENT': 'بيانات غير مقبولة من الخادم.',
      'EMAIL_NOT_FOUND': 'البريد غير مسجّل.',
      'INVALID_PASSWORD': 'كلمة السر غير صحيحة.',
      'INVALID_LOGIN_CREDENTIALS': 'البريد أو كلمة السر غير صحيحة.',
      'TOO_MANY_ATTEMPTS_TRY_LATER': 'محاولات كثيرة — انتظر قليلاً.'
    };
    throw new Error(map[msg] || (what + ' (' + r.status + (msg ? ' — ' + msg : '') + ')'));
  },

  /* ================= الزبون: إنشاء الطلب وتتبّعه ================= */
  async createOrder(order){
    const r = await fetch(this.docsUrl() + '/orders', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ fields: FB.fields(order) })
    });
    if(!r.ok) await FB.fail(r, 'تعذّر إرسال الطلب');
    const j = await r.json();
    return { id: FB.idOf(j.name), ...FB.doc(j.fields) };
  },
  async getOrder(id){
    const r = await fetch(`${this.docsUrl()}/orders/${encodeURIComponent(id)}`);
    if(r.status === 404) return null;
    if(!r.ok) await FB.fail(r, 'تعذّر قراءة الطلب');
    const j = await r.json();
    return { id: FB.idOf(j.name), ...FB.doc(j.fields) };
  },

  /* ================= المدير: الدخول وإدارة الطلبات ================= */
  TK: 'wz_fb_tok',
  session: null,
  loadSession(){
    try{ this.session = JSON.parse(localStorage.getItem(this.TK) || 'null'); }catch(e){ this.session = null; }
    return this.session;
  },
  saveSession(s){ this.session = s; try{ localStorage.setItem(this.TK, JSON.stringify(s)); }catch(e){} },
  signOut(){ this.session = null; try{ localStorage.removeItem(this.TK); }catch(e){} },
  signedIn(){ return !!(this.session && this.session.refreshToken); },

  async signIn(email, password){
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.cfg().apiKey}`, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken:true })
    });
    if(!r.ok) await FB.fail(r, 'تعذّر تسجيل الدخول');
    const j = await r.json();
    this.saveSession({ email:j.email, idToken:j.idToken, refreshToken:j.refreshToken,
                       exp: Date.now() + (Number(j.expiresIn || 3600) - 60) * 1000 });
    return this.session;
  },
  async token(){
    if(!this.session) this.loadSession();
    if(!this.session) throw new Error('لم تسجّل الدخول بعد.');
    if(this.session.idToken && Date.now() < (this.session.exp || 0)) return this.session.idToken;
    const body = new URLSearchParams({ grant_type:'refresh_token', refresh_token:this.session.refreshToken });
    const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${this.cfg().apiKey}`, {
      method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body
    });
    if(!r.ok){ this.signOut(); await FB.fail(r, 'انتهت الجلسة'); }
    const j = await r.json();
    this.saveSession({ ...this.session, idToken:j.id_token, refreshToken:j.refresh_token,
                       exp: Date.now() + (Number(j.expires_in || 3600) - 60) * 1000 });
    return this.session.idToken;
  },
  async auth(){ return { Authorization: 'Bearer ' + (await this.token()) }; },

  /* جلب الطلبات مرتّبة من الأحدث */
  async listOrders(limit = 200){
    const r = await fetch(this.docsUrl() + ':runQuery', {
      method:'POST', headers:{ 'Content-Type':'application/json', ...(await this.auth()) },
      body: JSON.stringify({ structuredQuery:{
        from:[{ collectionId:'orders' }],
        orderBy:[{ field:{ fieldPath:'at' }, direction:'DESCENDING' }],
        limit
      }})
    });
    if(!r.ok) await FB.fail(r, 'تعذّر جلب الطلبات');
    const rows = await r.json();
    return (rows || []).filter(x => x.document)
      .map(x => ({ id: FB.idOf(x.document.name), ...FB.doc(x.document.fields) }));
  },

  /* تحديث حقول محدّدة فقط */
  async updateOrder(id, patch){
    const mask = Object.keys(patch).map(k => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&');
    const r = await fetch(`${this.docsUrl()}/orders/${encodeURIComponent(id)}?${mask}`, {
      method:'PATCH', headers:{ 'Content-Type':'application/json', ...(await this.auth()) },
      body: JSON.stringify({ fields: FB.fields(patch) })
    });
    if(!r.ok) await FB.fail(r, 'تعذّر تحديث الطلب');
    const j = await r.json();
    return { id: FB.idOf(j.name), ...FB.doc(j.fields) };
  },
  async deleteOrder(id){
    const r = await fetch(`${this.docsUrl()}/orders/${encodeURIComponent(id)}`, {
      method:'DELETE', headers: await this.auth()
    });
    if(!r.ok) await FB.fail(r, 'تعذّر حذف الطلب');
  }
};

/* تنسيق رقم الهاتف — مشترك بين المتجر ولوحة التحكم */
function fmtPhone(v){
  const d = String(v || '').replace(/\D/g, '');
  return d.length === 11 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : (v || '');
}

/* ================= حالات الطلب ================= */
const ORDER_STATUS = {
  pending:   { ar:'بانتظار المراجعة', color:'#B4520B', bg:'#FEF0DC', icon:'clock' },
  confirmed: { ar:'مقبول',            color:'#0B7A46', bg:'#E4F8EE', icon:'check' },
  preparing: { ar:'قيد التجهيز',      color:'#0A5FA8', bg:'#E4F0FB', icon:'box'   },
  delivering:{ ar:'قيد التوصيل',      color:'#6B3FBF', bg:'#F0E9FC', icon:'truck' },
  done:      { ar:'مكتمل',            color:'#0B7A46', bg:'#E4F8EE', icon:'check' },
  rejected:  { ar:'مرفوض',            color:'#B42318', bg:'#FDECEC', icon:'close' }
};
function statusInfo(s){ return ORDER_STATUS[s] || ORDER_STATUS.pending; }

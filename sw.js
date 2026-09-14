/* عامل الخدمة — وظيفته الوحيدة أن يفتح الموقع بلا إنترنت وأن يُثبَّت
   على الشاشة الرئيسية. لا يسرّع شيئاً على حساب الحداثة.

   القاعدة: الشبكة أولاً دائماً، والمخزَّن احتياط عند الانقطاع فقط.
   السبب أن صاحب المحل ينشر من اللوحة ويتوقّع أن يرى التغيير فوراً —
   ولو خزّنّا data.js أو الصفحات لظهر له متجر قديم بلا سبب مفهوم،
   وهذا أسوأ من بطء بسيط.

   ولا نلمس نداءات Firebase وGitHub إطلاقاً: طلبات من أصل آخر تمرّ
   كما هي، فلا نخزّن استجابة تسجيل دخول ولا نتدخّل في النشر.  */

const REV   = 'wz-2';                 /* ارفعه ليُمسح المخزون القديم عند الزوّار */
const CACHE = 'wz-' + REV;
const SHELL = ['/', '/admin.html'];   /* أقل ما يلزم ليفتح الموقع دون إنترنت */

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .catch(() => {})                /* تعذّر التخزين المسبق لا يُفشل التثبيت */
      .then(() => self.skipWaiting())  /* نسخة جديدة تحلّ فوراً بلا انتظار إغلاق التبويبات */
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;                              /* لا نلمس POST */
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;               /* Firebase وGitHub يمرّان */

  e.respondWith(
    fetch(req)
      .then(res => {
        /* نخزّن نسخة للطوارئ فقط — المعروض للمستخدم هو ردّ الشبكة */
        if(res && res.ok && res.type === 'basic'){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit =>
          hit || (req.mode === 'navigate' ? caches.match('/') : undefined) ||
          new Response('لا يوجد اتصال', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })))
  );
});

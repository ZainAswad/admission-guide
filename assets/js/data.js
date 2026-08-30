/* =============================================================
   الوزني للكهربائيات والإنارة الحديثة
   ملف البيانات — وُلّد من لوحة التحكم بتاريخ ٣٠‏/٨‏/٢٠٢٦، ٩:١٩:٣٩ ص
   يمكن تعديله يدوياً أيضاً، أو من admin.html
   ============================================================= */

/* ---------- 1) إعدادات المتجر ---------- */
let SITE = {
  name: 'الوزني للكهربائيات والإنارة الحديثة',
  shortName: 'الوزني',
  nameEn: 'Al-Wazani for Modern Electrical and Lighting Trading',
  tagline: 'ضوء يصنع الفرق',
  about: 'الوزني لتجارة الكهربائيات والإنارة الحديثة — وجهتك الأولى في كربلاء لكل ما يخص الكهربائيات. نوفّر تشكيلة واسعة من أنظمة الإنارة الحديثة، الكيبلات والأسلاك بأنواعها، البوردات وأجهزة السيطرة ATS، العدد اليدوية ومواد التأسيس، وأجهزة الحماية والتحويل — بأسعار منافسة ومنتجات أصلية وضمان حقيقي.',
  currency: 'د.ع',
  phones: [
    { label: 'المبيعات والاستفسار', number: '07734625041', intl: '9647734625041' }
  ],
  whatsapp: '9647734625041',
  address: 'كربلاء المقدسة — الحسينية — الطف — عمود 235',
  city: 'كربلاء المقدسة',
  hours: [
    { d: 'السبت — الخميس', t: '8:00 صباحاً — 11:00 مساءً' },
    { d: 'الجمعة', t: '10:00 صباحاً — 10:00 مساءً' }
  ],
  geo: { lat: 32.6508424159535, lng: 44.11010814662697, zoom: 15 },
  social: [
    { id: 'facebook', name: 'فيسبوك', url: 'https://web.facebook.com/people/الوزني-لتجارة-الكهربائيات-والانارة-الحديثة/61581991492040/?locale=eo_EO#' },
    { id: 'instagram', name: 'انستغرام', url: 'https://www.instagram.com/p/DbDLh0lM6TC/' },
    { id: 'tiktok', name: 'تيك توك', url: '' },
    { id: 'telegram', name: 'تيليكرام', url: '' }
  ],
  // نظام الطلبات (Firebase) — راجع FIREBASE.md
  firebase: {
    apiKey: 'AIzaSyDqFz1OuCwRUYOIoEzAqfiGX479BWuPZTs',
    projectId: 'alwazani-store',
    adminEmail: 'alwazny.electrics@gmail.com'
  },
  // إعدادات لوحة التحكم (admin.html) — غيّر كلمة السر من داخل اللوحة نفسها
  admin: {
    hash: '649aeff5dfcf940c4a0e190f008a91efb48833aa3617e03a94cbee74bbe9d616',
    repo: 'ZainAswad/admission-guide',
    branch: 'main'
  },
  orders: {
    prefix: 'WZ',
    minOrder: 0,
    deliveryFeeInCity: 5000,
    deliveryFeeOutCity: 15000,
    freeDeliveryOver: 250000,
    webhook: ''
  },
  governorates: [
    'كربلاء المقدسة', 'بغداد', 'بابل', 'النجف الأشرف', 'الديوانية', 'واسط', 'ذي قار', 'المثنى', 'البصرة', 'ميسان', 'الأنبار', 'صلاح الدين', 'ديالى', 'كركوك', 'نينوى', 'أربيل', 'السليمانية', 'دهوك'
  ]
};

/* ---------- 2) شجرة الأقسام ---------- */
let CATEGORIES = [
  {
    id: 'lighting', name: 'الإنارة الحديثة', icon: 'bulb',
    blurb: 'أنظمة إنارة عصرية توازن بين الجمال وكفاءة الطاقة',
    subs: [
    { id: 'profile', name: 'البروفايل', icon: 'profile' },
    { id: 'ceiling', name: 'الإنارة السقفية والتعليق', icon: 'chandelier' },
    { id: 'wall', name: 'الإنارة الجدارية', icon: 'wallLight' },
    { id: 'magnetic', name: 'الإنارة المغناطيسية', icon: 'magnetic' },
    { id: 'strip', name: 'النشرات وملحقاتها', icon: 'strip' },
    { id: 'spot', name: 'سبوت لايت', icon: 'spot' },
    { id: 'bracket', name: 'براكيت', icon: 'bracket' },
    { id: 'bulbs', name: 'المصابيح', icon: 'bulb' }
    ]
  },
  {
    id: 'cables', name: 'الكيبلات والأسلاك', icon: 'cableRoll',
    blurb: 'أسلاك نحاسية أصلية بمناشئ موثوقة وبكل المقاسات',
    subs: [
    { id: 'zafira', name: 'كيبلات الظفيرة', icon: 'cableRoll' },
    { id: 'tasees', name: 'أسلاك التأسيس', icon: 'wire' },
    { id: 'siemens', name: 'أسلاك سيمنز', icon: 'cableRoll' },
    { id: 'single', name: 'أسلاك السنكل', icon: 'wire' },
    { id: 'fanar', name: 'أسلاك الفنار', icon: 'cableRoll' },
    { id: 'gc', name: 'أسلاك GC', icon: 'wire' },
    { id: 'aqaba', name: 'أسلاك العقبة', icon: 'cableRoll' },
    { id: 'mustaqbal', name: 'أسلاك المستقبل السعودي', icon: 'wire' }
    ]
  },
  {
    id: 'tools', name: 'العدد اليدوية والتأسيسات الكهربائية', icon: 'screwdriver',
    blurb: 'كل ما يحتاجه الفني المحترف من عدد ومواد تأسيس',
    subs: [
    { id: 'qashtat', name: 'القاشطات', icon: 'plier' },
    { id: 'screwdrivers', name: 'الدرنفيس والمفكات', icon: 'screwdriver' },
    { id: 'measuring', name: 'أدوات القياس', icon: 'multimeter' },
    { id: 'taramil', name: 'الترامل', icon: 'drill' },
    { id: 'conduits', name: 'بواري التأسيس الكهربائي', icon: 'conduit' },
    { id: 'trayCable', name: 'التري كيبل', icon: 'tray' },
    { id: 'blades', name: 'الشفرات والمقصات', icon: 'blade' },
    { id: 'screws', name: 'البراغي', icon: 'screw' },
    { id: 'installMats', name: 'مواد التأسيس الكهربائي', icon: 'junction' },
    { id: 'safety', name: 'السلامة المهنية', icon: 'helmet' }
    ]
  },
  {
    id: 'boards', name: 'البوردات ومواد السيطرة ATS', icon: 'board',
    blurb: 'لوحات توزيع وقواطع وأنظمة تحويل تلقائي بمواصفات عالمية',
    subs: [
    { id: 'acb', name: 'القواطع الهوائية', icon: 'breaker' },
    { id: 'ats', name: 'أجهزة التحويل الحديثة', icon: 'ats' },
    { id: 'homeProtect', name: 'أجهزة حماية المنزل', icon: 'protector' },
    { id: 'panels', name: 'البوردات', icon: 'board' },
    { id: 'joints', name: 'الجوزات', icon: 'junction' },
    { id: 'relay', name: 'الريلي', icon: 'relay' },
    { id: 'indicator', name: 'مصابيح الإشارة', icon: 'indicator' }
    ]
  },
  {
    id: 'electrical', name: 'المواد الكهربائية', icon: 'socket',
    blurb: 'أجهزة ومستلزمات كهربائية للمنزل والمشاريع',
    subs: [
    { id: 'protection', name: 'أجهزة الحماية', icon: 'protector' },
    { id: 'changeover', name: 'أجهزة التحويل', icon: 'ats' },
    { id: 'carrier', name: 'السيار الكهربائي', icon: 'extension' },
    { id: 'satellite', name: 'الستلايت وملحقاته', icon: 'satellite' },
    { id: 'exhaust', name: 'المفرغات', icon: 'exhaust' },
    { id: 'fans', name: 'المراوح السقفية والجدارية والعمودية', icon: 'fan' },
    { id: 'pumps', name: 'ماطورات الماء والبوستر', icon: 'pump' },
    { id: 'doorbell', name: 'الجرس المنزلي', icon: 'doorbell' }
    ]
  }
];

/* ---------- 3) العلامات التجارية ---------- */
let BRANDS = [
  { name: 'Aswar', ar: 'أسوار', logo: 'assets/img/brands/aswar.png' },
  { name: 'OTG', ar: 'أو تي جي', logo: 'assets/img/brands/otg.png' },
  { name: 'Siemens', ar: 'سيمنز', logo: 'assets/img/brands/siemens.png' },
  { name: 'Schneider', ar: 'شنايدر', logo: 'assets/img/brands/schneider.png' },
  { name: 'Philips', ar: 'فيليبس', logo: 'assets/img/brands/philips.png' },
  { name: 'Hikvision', ar: 'هيك فيجن', logo: 'assets/img/brands/hikvision.png' },
  { name: 'ABB', ar: 'إيه بي بي', logo: 'assets/img/brands/abb.png' },
  { name: 'Panasonic', ar: 'باناسونيك', logo: 'assets/img/brands/panasonic.png' },
  { name: 'GC', ar: 'جي سي', logo: 'assets/img/brands/gc.png' },
  { name: 'Al-Fanar', ar: 'الفنار', logo: 'assets/img/brands/fanar.png' },
  { name: 'Aqaba', ar: 'العقبة', logo: 'assets/img/brands/aqaba.png' },
  { name: 'Almustaqbal', ar: 'المستقبل السعودي', logo: 'assets/img/brands/mustaqbal.png' },
  { name: 'Ingco', ar: 'إنجكو', logo: 'assets/img/brands/ingco.png' },
  { name: 'CHINT', ar: 'جاينت', logo: 'assets/img/brands/chint.png' }
];

/* ---------- 4) المنتجات ---------- */
let PRODUCTS = [
  { id: 'LT-101', name: 'مصباح ثريا 5W', brand: 'AkkoStar', price: 1500, icon: 'bulb', image: 'assets/img/products/LT-101.jpg',
    cats: ['lighting/bulbs'], desc: 'مصباح ثريا 5 واط متغير (ابيض - شمسي - اوف وايت)',
    specs: ['12 واط', 'نوع الانارة : شمسي - ابيض - اوف وايت'] }
];

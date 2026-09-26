// Shared translations for Shelter Now.
// Plain data + pure functions only — this file is imported from both
// server code (API routes) and client components.

export const DEFAULT_LANG = "sv";

export const LANGS = [
  { code: "sv", name: "Svenska", rtl: false },
  { code: "en", name: "English", rtl: false },
  { code: "es", name: "Español", rtl: false },
  { code: "ar", name: "العربية", rtl: true },
  { code: "fa", name: "فارسی", rtl: true },
  { code: "uk", name: "Українська", rtl: false },
  { code: "so", name: "Soomaali", rtl: false },
];

export const LANG_CODES = LANGS.map((l) => l.code);

export function isRtl(lang) {
  return LANGS.find((l) => l.code === lang)?.rtl ?? false;
}

export function normalizeLang(lang) {
  return LANG_CODES.includes(lang) ? lang : DEFAULT_LANG;
}

// UI chrome strings.
export const UI = {
  sv: {
    tagline: "Närmaste skyddsrum + vad du ska göra, på ditt språk. Ett tryck.",
    languageLabel: "Språk",
    emergencyButton: "NÖDLÄGE",
    emergencyWorking: "Söker skyddsrum…",
    usingLocation: "Använder din plats.",
    demoLocation: "Kunde inte hämta din plats. Visar Stockholm C.",
    nearest: "Närmaste skyddsrum",
    others: "Andra skyddsrum i närheten",
    route: "Vägbeskrivning",
    travelMode: "Färdsätt",
    modes: { walk: "Gå", bike: "Cykel", car: "Bil" },
    minBy: { walk: "min promenad", bike: "min med cykel", car: "min med bil" },
    farTitle: "Inget skyddsrum tillräckligt nära.",
    farBody: "Sök skydd där du är nu: i en källare eller i det innersta rummet, bort från fönster.",
    farNearest: "Endast om du kan ta dig dit säkert: närmaste skyddsrum",
    places: "platser",
    instructions: "Instruktioner",
    aiBadge: "Instruktioner från Claude",
    offlineBadge: "Instruktioner (offline)",
    packBring: "Ta med",
    packDontBring: "Ta inte med",
    safeTitle: "Meddela din familj",
    smsButton: "SMS: Jag är i säkerhet",
    whatsappButton: "WhatsApp",
    safeNote: "SMS fungerar ofta när mobilt internet inte gör det.",
    locationError: "Kunde inte hämta din plats. Aktivera plats­tjänster och försök igen.",
    footer:
      "Data: Myndigheten för civilt försvar. Vid en verklig kris, följ krisinformation.se, Sveriges Radio P4 och 112.",
  },
  en: {
    tagline: "Nearest shelter + what to do, in your language. One tap.",
    languageLabel: "Language",
    emergencyButton: "EMERGENCY",
    emergencyWorking: "Finding shelters…",
    usingLocation: "Using your location.",
    demoLocation: "Couldn't get your location. Showing Stockholm C.",
    nearest: "Nearest shelter",
    others: "Other shelters nearby",
    route: "Route",
    travelMode: "Travel mode",
    modes: { walk: "Walk", bike: "Bike", car: "Car" },
    minBy: { walk: "min walk", bike: "min by bike", car: "min by car" },
    farTitle: "No shelter close enough.",
    farBody: "Take cover where you are now: basement or the innermost room, away from windows.",
    farNearest: "Only if you can get there safely: nearest shelter",
    places: "places",
    instructions: "Instructions",
    aiBadge: "Instructions by Claude",
    offlineBadge: "Offline instructions",
    packBring: "Bring",
    packDontBring: "Don't bring",
    safeTitle: "Tell your family",
    smsButton: "SMS: I'm safe",
    whatsappButton: "WhatsApp",
    safeNote: "SMS often works when mobile internet does not.",
    locationError: "Couldn't get your location. Enable location services and try again.",
    footer:
      "Data: Myndigheten för civilt försvar (Swedish Civil Defence and Resilience Agency). In a real emergency, follow krisinformation.se, Sveriges Radio P4 and 112.",
  },
  es: {
    tagline: "Refugio más cercano + qué hacer, en tu idioma. Un toque.",
    languageLabel: "Idioma",
    emergencyButton: "EMERGENCIA",
    emergencyWorking: "Buscando refugios…",
    usingLocation: "Usando tu ubicación.",
    demoLocation: "No se pudo obtener tu ubicación. Mostrando Stockholm C.",
    nearest: "Refugio más cercano",
    others: "Otros refugios cercanos",
    route: "Ruta",
    travelMode: "Modo de transporte",
    modes: { walk: "A pie", bike: "Bici", car: "Coche" },
    minBy: { walk: "min a pie", bike: "min en bici", car: "min en coche" },
    farTitle: "No hay ningún refugio lo bastante cerca.",
    farBody: "Protégete donde estás ahora: en un sótano o en la habitación más interior, lejos de las ventanas.",
    farNearest: "Solo si puedes llegar con seguridad: refugio más cercano",
    places: "plazas",
    instructions: "Instrucciones",
    aiBadge: "Instrucciones de Claude",
    offlineBadge: "Instrucciones (sin conexión)",
    packBring: "Llevar",
    packDontBring: "No llevar",
    safeTitle: "Avisa a tu familia",
    smsButton: "SMS: Estoy a salvo",
    whatsappButton: "WhatsApp",
    safeNote: "El SMS suele funcionar cuando el internet móvil no.",
    locationError: "No se pudo obtener tu ubicación. Activa los servicios de ubicación e inténtalo de nuevo.",
    footer:
      "Datos: Myndigheten för civilt försvar (Agencia sueca de defensa civil). En una emergencia real, sigue krisinformation.se, Sveriges Radio P4 y el 112.",
  },
  ar: {
    tagline: "أقرب ملجأ + ما يجب فعله، بلغتك. بضغطة واحدة.",
    languageLabel: "اللغة",
    emergencyButton: "حالة طارئة",
    emergencyWorking: "جاري البحث عن ملاجئ…",
    usingLocation: "يتم استخدام موقعك.",
    demoLocation: "تعذّر تحديد موقعك. يتم عرض وسط ستوكهولم.",
    nearest: "أقرب ملجأ",
    others: "ملاجئ أخرى قريبة",
    route: "المسار",
    travelMode: "وسيلة التنقل",
    modes: { walk: "مشياً", bike: "دراجة", car: "سيارة" },
    minBy: { walk: "دقيقة مشياً", bike: "دقيقة بالدراجة", car: "دقيقة بالسيارة" },
    farTitle: "لا يوجد ملجأ قريب بما يكفي.",
    farBody: "احتمِ حيث أنت الآن: في القبو أو في الغرفة الأكثر عمقاً داخل المبنى، بعيداً عن النوافذ.",
    farNearest: "فقط إذا استطعت الوصول بأمان: أقرب ملجأ",
    places: "مكان",
    instructions: "تعليمات",
    aiBadge: "تعليمات من Claude",
    offlineBadge: "تعليمات (بدون إنترنت)",
    packBring: "خذ معك",
    packDontBring: "لا تأخذ",
    safeTitle: "أخبر عائلتك",
    smsButton: "رسالة: أنا بأمان",
    whatsappButton: "واتساب",
    safeNote: "الرسائل القصيرة تعمل غالباً عندما لا يعمل الإنترنت.",
    locationError: "تعذّر تحديد موقعك. فعّل خدمات الموقع وحاول مرة أخرى.",
    footer:
      "البيانات: الهيئة السويدية للدفاع المدني (Myndigheten för civilt försvar). في حالة وجود طارئ حقيقي، تابع krisinformation.se وراديو السويد P4 والرقم 112.",
  },
  fa: {
    tagline: "نزدیک‌ترین پناهگاه + کاری که باید انجام دهید، به زبان شما. با یک ضربه.",
    languageLabel: "زبان",
    emergencyButton: "اضطراری",
    emergencyWorking: "در حال یافتن پناهگاه…",
    usingLocation: "از موقعیت شما استفاده می‌شود.",
    demoLocation: "موقعیت شما دریافت نشد. مرکز استکهلم نمایش داده می‌شود.",
    nearest: "نزدیک‌ترین پناهگاه",
    others: "پناهگاه‌های دیگر در نزدیکی",
    route: "مسیر",
    travelMode: "نحوه رفتن",
    modes: { walk: "پیاده", bike: "دوچرخه", car: "ماشین" },
    minBy: { walk: "دقیقه پیاده", bike: "دقیقه با دوچرخه", car: "دقیقه با ماشین" },
    farTitle: "هیچ پناهگاهی به اندازه کافی نزدیک نیست.",
    farBody: "همین حالا همان‌جا که هستید پناه بگیرید: زیرزمین یا داخلی‌ترین اتاق، دور از پنجره‌ها.",
    farNearest: "فقط اگر می‌توانید با امنیت برسید: نزدیک‌ترین پناهگاه",
    places: "جا",
    instructions: "دستورالعمل",
    aiBadge: "دستورالعمل از Claude",
    offlineBadge: "دستورالعمل (آفلاین)",
    packBring: "همراه ببرید",
    packDontBring: "همراه نبرید",
    safeTitle: "به خانواده خبر دهید",
    smsButton: "پیامک: من در امانم",
    whatsappButton: "واتس‌اپ",
    safeNote: "پیامک اغلب وقتی اینترنت قطع است کار می‌کند.",
    locationError: "موقعیت شما دریافت نشد. سرویس موقعیت را فعال کنید و دوباره تلاش کنید.",
    footer:
      "داده‌ها: آژانس دفاع کشوری سوئد (Myndigheten för civilt försvar). در یک وضعیت اضطراری واقعی، رادیو سوئد P4، krisinformation.se و شماره ۱۱۲ را دنبال کنید.",
  },
  uk: {
    tagline: "Найближче укриття + що робити, вашою мовою. Один дотик.",
    languageLabel: "Мова",
    emergencyButton: "НАДЗВИЧАЙНА СИТУАЦІЯ",
    emergencyWorking: "Пошук укриттів…",
    usingLocation: "Використовується ваше місцезнаходження.",
    demoLocation: "Не вдалося визначити місцезнаходження. Показано центр Стокгольма.",
    nearest: "Найближче укриття",
    others: "Інші укриття поблизу",
    route: "Маршрут",
    travelMode: "Спосіб пересування",
    modes: { walk: "Пішки", bike: "Велосипед", car: "Авто" },
    minBy: { walk: "хв пішки", bike: "хв велосипедом", car: "хв автомобілем" },
    farTitle: "Немає укриття достатньо близько.",
    farBody: "Сховайтеся там, де ви зараз: у підвалі або в найглибшій кімнаті, подалі від вікон.",
    farNearest: "Лише якщо можете безпечно дістатися: найближче укриття",
    places: "місць",
    instructions: "Інструкції",
    aiBadge: "Інструкції від Claude",
    offlineBadge: "Інструкції (офлайн)",
    packBring: "Взяти",
    packDontBring: "Не брати",
    safeTitle: "Повідомте родину",
    smsButton: "SMS: Я в безпеці",
    whatsappButton: "WhatsApp",
    safeNote: "SMS часто працює, коли мобільний інтернет — ні.",
    locationError: "Не вдалося визначити місцезнаходження. Увімкніть служби визначення місця та спробуйте ще раз.",
    footer:
      "Дані: Агентство цивільного захисту Швеції (Myndigheten för civilt försvar). У разі справжньої надзвичайної ситуації стежте за krisinformation.se, Sveriges Radio P4 та телефонуйте 112.",
  },
  so: {
    tagline: "Hoyga ugu dhow + waxa la sameeyo, luqaddaada. Hal taabasho.",
    languageLabel: "Luqadda",
    emergencyButton: "XAALAD DEGDEG AH",
    emergencyWorking: "Raadinaya hoyga…",
    usingLocation: "Adeegsanaya goobtaada.",
    demoLocation: "Lama helin goobtaada. Waxaa la muujinayaa Stockholm C.",
    nearest: "Hoyga ugu dhow",
    others: "Hoyga kale ee u dhow",
    route: "Jidka",
    travelMode: "Qaabka safarka",
    modes: { walk: "Lug", bike: "Baaskiil", car: "Baabuur" },
    minBy: { walk: "daqiiqo lugeyn", bike: "daqiiqo baaskiil", car: "daqiiqo baabuur" },
    farTitle: "Ma jiro hoy kugu filan oo u dhow.",
    farBody: "Hadda meesha aad joogto gabbaad ka dhig: qolka dhulka hoostiisa ama qolka ugu gudaha dhismaha, kana fog daaqadaha.",
    farNearest: "Kaliya haddii aad si nabad ah u gaari karto: hoyga ugu dhow",
    places: "meelood",
    instructions: "Tilmaamo",
    aiBadge: "Tilmaamo ka yimid Claude",
    offlineBadge: "Tilmaamo (offline)",
    packBring: "Qaado",
    packDontBring: "Ha qaadan",
    safeTitle: "U sheeg qoyskaaga",
    smsButton: "SMS: Waan nabad qabaa",
    whatsappButton: "WhatsApp",
    safeNote: "SMS badanaa wuu shaqeeyaa marka internetku go'o.",
    locationError: "Lama helin goobtaada. Fur adeegyada goobta oo isku day mar kale.",
    footer:
      "Xogta: Hay'adda Ilaalinta Rayidka ee Sweden (Myndigheten för civilt försvar). Xaalad deg-deg oo dhab ah, la soco krisinformation.se, Sveriges Radio P4 iyo 112.",
  },
};

// What to bring / not bring checklist.
export const PACK = {
  sv: {
    bring: ["Telefon + laddare / powerbank", "Vatten och lite mat", "Mediciner du behöver", "Legitimation / pass", "Varma kläder och en filt"],
    dontBring: ["Stora resväskor", "Alkohol", "Vapen eller knivar", "Bränsle, gasol eller annat brandfarligt"],
  },
  en: {
    bring: ["Phone + charger / power bank", "Water and some food", "Medicine you need", "ID / passport", "Warm clothes and a blanket"],
    dontBring: ["Large suitcases", "Alcohol", "Weapons or knives", "Fuel, gas or anything flammable"],
  },
  es: {
    bring: ["Teléfono + cargador / batería externa", "Agua y algo de comida", "Tus medicinas", "Documento de identidad / pasaporte", "Ropa abrigada y una manta"],
    dontBring: ["Maletas grandes", "Alcohol", "Armas o cuchillos", "Combustible, gas o cosas inflamables"],
  },
  ar: {
    bring: ["الهاتف + الشاحن / بطارية خارجية", "ماء وبعض الطعام", "أدويتك", "بطاقة الهوية / جواز السفر", "ملابس دافئة وبطانية"],
    dontBring: ["حقائب كبيرة", "كحول", "أسلحة أو سكاكين", "وقود أو غاز أو مواد قابلة للاشتعال"],
  },
  fa: {
    bring: ["تلفن + شارژر / پاوربانک", "آب و کمی غذا", "داروهای خود", "کارت شناسایی / پاسپورت", "لباس گرم و پتو"],
    dontBring: ["چمدان بزرگ", "الکل", "سلاح یا چاقو", "سوخت، گاز یا مواد آتش‌زا"],
  },
  uk: {
    bring: ["Телефон + зарядка / павербанк", "Вода і трохи їжі", "Ваші ліки", "Посвідчення / паспорт", "Теплий одяг і ковдра"],
    dontBring: ["Великі валізи", "Алкоголь", "Зброя або ножі", "Пальне, газ чи легкозаймисті речі"],
  },
  so: {
    bring: ["Taleefan + dabka / power bank", "Biyo iyo xoogaa cunto ah", "Daawadaada", "Aqoonsi / baasaboor", "Dhar diiran iyo buste"],
    dontBring: ["Shandado waaweyn", "Khamri", "Hub ama mindiyo", "Shidaal, gaas ama wax gubta"],
  },
};

// "I'm safe" message template: (address, time, routeUrl) => string
export const FAMILY_MESSAGE = {
  sv: (address, time, routeUrl) => `Jag är i säkerhet. Jag går till skyddsrummet: ${address}. Tid: ${time}. ${routeUrl}`,
  en: (address, time, routeUrl) => `I'm safe. I'm going to the shelter: ${address}. Time: ${time}. ${routeUrl}`,
  es: (address, time, routeUrl) => `Estoy a salvo. Voy al refugio: ${address}. Hora: ${time}. ${routeUrl}`,
  ar: (address, time, routeUrl) => `أنا بأمان. أنا ذاهب إلى الملجأ: ${address}. الوقت: ${time}. ${routeUrl}`,
  fa: (address, time, routeUrl) => `من در امانم. به پناهگاه می‌روم: ${address}. ساعت: ${time}. ${routeUrl}`,
  uk: (address, time, routeUrl) => `Я в безпеці. Іду до укриття: ${address}. Час: ${time}. ${routeUrl}`,
  so: (address, time, routeUrl) => `Waan nabad qabaa. Waxaan u socdaa hoyga: ${address}. Waqtiga: ${time}. ${routeUrl}`,
};

// Offline fallback instructions, used whenever the Claude API call fails.
// ctx = { address, distanceText, minutes, far }
// `near` when the nearest shelter is reachable within FAR_THRESHOLD_MIN with
// the chosen mode; `far` puts taking cover in place first.
const OFFLINE_STEPS = {
  sv: {
    near: (ctx, t) => [
      `Håll dig lugn. Ta dig nu till närmaste skyddsrum: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Ta bara med: telefon, laddare, vatten, mediciner, legitimation och varma kläder.",
      "Om du inte kan ta dig dit: gå till en källare eller längst in i en byggnad, bort från fönster.",
      "Följ officiell information: Sveriges Radio P4 och krisinformation.se.",
      "Hjälp barn, äldre och grannar. Ring 112 om någon är skadad.",
    ],
    far: (ctx, t) => [
      "Håll dig lugn. Inget skyddsrum är tillräckligt nära — sök skydd där du är nu.",
      "Gå till en källare eller det innersta rummet i byggnaden, bort från fönster.",
      `Endast om det är säkert att förflytta dig: närmaste skyddsrum ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Följ officiell information: Sveriges Radio P4 och krisinformation.se.",
      "Hjälp barn, äldre och grannar. Ring 112 om någon är skadad.",
    ],
  },
  en: {
    near: (ctx, t) => [
      `Stay calm. Go now to the nearest shelter: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Take only: phone, charger, water, medicine, ID and warm clothes.",
      "If you cannot get there, go to a basement or the innermost part of a building, away from windows.",
      "Follow official information: Sveriges Radio P4 and krisinformation.se.",
      "Help children, elderly people and neighbours. Call 112 if someone is hurt.",
    ],
    far: (ctx, t) => [
      "Stay calm. No shelter is close enough — take cover where you are now.",
      "Go to a basement or the innermost room of the building, away from windows.",
      `Only if it is safe to travel: nearest shelter ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Follow official information: Sveriges Radio P4 and krisinformation.se.",
      "Help children, elderly people and neighbours. Call 112 if someone is hurt.",
    ],
  },
  es: {
    near: (ctx, t) => [
      `Mantén la calma. Ve ahora al refugio más cercano: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Lleva solo: teléfono, cargador, agua, medicinas, documento de identidad y ropa abrigada.",
      "Si no puedes llegar, ve a un sótano o a la parte más interior de un edificio, lejos de las ventanas.",
      "Sigue la información oficial: Sveriges Radio P4 y krisinformation.se.",
      "Ayuda a niños, personas mayores y vecinos. Llama al 112 si alguien está herido.",
    ],
    far: (ctx, t) => [
      "Mantén la calma. No hay ningún refugio lo bastante cerca: protégete donde estás ahora.",
      "Ve a un sótano o a la habitación más interior del edificio, lejos de las ventanas.",
      `Solo si es seguro desplazarte: refugio más cercano ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Sigue la información oficial: Sveriges Radio P4 y krisinformation.se.",
      "Ayuda a niños, personas mayores y vecinos. Llama al 112 si alguien está herido.",
    ],
  },
  ar: {
    near: (ctx, t) => [
      `ابقَ هادئاً. اذهب الآن إلى أقرب ملجأ: ${ctx.address}، ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "خذ فقط: الهاتف، الشاحن، الماء، الأدوية، بطاقة الهوية وملابس دافئة.",
      "إذا لم تستطع الوصول، اذهب إلى قبو أو إلى الجزء الداخلي من المبنى بعيداً عن النوافذ.",
      "تابع المعلومات الرسمية: راديو السويد P4 وموقع krisinformation.se.",
      "ساعد الأطفال وكبار السن والجيران. اتصل بـ 112 إذا أُصيب أحد.",
    ],
    far: (ctx, t) => [
      "ابقَ هادئاً. لا يوجد ملجأ قريب بما يكفي — احتمِ حيث أنت الآن.",
      "اذهب إلى القبو أو الغرفة الأكثر عمقاً في المبنى، بعيداً عن النوافذ.",
      `فقط إذا كان التنقل آمناً: أقرب ملجأ ${ctx.address}، ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "تابع المعلومات الرسمية: راديو السويد P4 وموقع krisinformation.se.",
      "ساعد الأطفال وكبار السن والجيران. اتصل بـ 112 إذا أُصيب أحد.",
    ],
  },
  fa: {
    near: (ctx, t) => [
      `آرام باشید. همین حالا به نزدیک‌ترین پناهگاه بروید: ${ctx.address}، ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "فقط این‌ها را بردارید: تلفن، شارژر، آب، دارو، کارت شناسایی و لباس گرم.",
      "اگر نمی‌توانید برسید، به زیرزمین یا داخلی‌ترین بخش ساختمان، دور از پنجره‌ها بروید.",
      "اطلاعات رسمی را دنبال کنید: رادیو سوئد P4 و krisinformation.se.",
      "به کودکان، سالمندان و همسایه‌ها کمک کنید. اگر کسی آسیب دیده با 112 تماس بگیرید.",
    ],
    far: (ctx, t) => [
      "آرام باشید. هیچ پناهگاهی به اندازه کافی نزدیک نیست — همین‌جا که هستید پناه بگیرید.",
      "به زیرزمین یا داخلی‌ترین اتاق ساختمان، دور از پنجره‌ها بروید.",
      `فقط اگر رفتن امن است: نزدیک‌ترین پناهگاه ${ctx.address}، ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "اطلاعات رسمی را دنبال کنید: رادیو سوئد P4 و krisinformation.se.",
      "به کودکان، سالمندان و همسایه‌ها کمک کنید. اگر کسی آسیب دیده با 112 تماس بگیرید.",
    ],
  },
  uk: {
    near: (ctx, t) => [
      `Зберігайте спокій. Вирушайте зараз до найближчого укриття: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Візьміть лише: телефон, зарядку, воду, ліки, документ і теплий одяг.",
      "Якщо не можете дістатися, спустіться в підвал або в найглибшу частину будівлі, подалі від вікон.",
      "Стежте за офіційною інформацією: Sveriges Radio P4 та krisinformation.se.",
      "Допоможіть дітям, літнім людям і сусідам. Телефонуйте 112, якщо хтось поранений.",
    ],
    far: (ctx, t) => [
      "Зберігайте спокій. Немає укриття достатньо близько — сховайтеся там, де ви зараз.",
      "Спустіться в підвал або перейдіть у найглибшу кімнату будівлі, подалі від вікон.",
      `Лише якщо пересуватися безпечно: найближче укриття ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Стежте за офіційною інформацією: Sveriges Radio P4 та krisinformation.se.",
      "Допоможіть дітям, літнім людям і сусідам. Телефонуйте 112, якщо хтось поранений.",
    ],
  },
  so: {
    near: (ctx, t) => [
      `Deggan ahow. U dhaqaaq hadda hoyga ugu dhow: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Qaado oo keliya: taleefanka, dabka taleefanka, biyo, daawo, aqoonsi iyo dhar diiran.",
      "Haddii aadan gaari karin, aad qolka dhulka hoostiisa ama qaybta ugu gudaha dhismaha, kana fog daaqadaha.",
      "La soco macluumaadka rasmiga ah: Sveriges Radio P4 iyo krisinformation.se.",
      "Caawi carruurta, dadka waayeelka ah iyo deriskaaga. Wac 112 haddii qof dhaawacmo.",
    ],
    far: (ctx, t) => [
      "Deggan ahow. Ma jiro hoy kugu dhow — hadda meesha aad joogto gabbaad ka dhig.",
      "Tag qolka dhulka hoostiisa ama qolka ugu gudaha dhismaha, kana fog daaqadaha.",
      `Kaliya haddii ay ammaan tahay in la safro: hoyga ugu dhow ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "La soco macluumaadka rasmiga ah: Sveriges Radio P4 iyo krisinformation.se.",
      "Caawi carruurta, dadka waayeelka ah iyo deriskaaga. Wac 112 haddii qof dhaawacmo.",
    ],
  },
};

// ctx = { address, distanceText, minutes, mode, far }
export function offlineSteps(lang, ctx) {
  const variant = ctx.far ? "far" : "near";
  return OFFLINE_STEPS[lang][variant](ctx, UI[lang].minBy[ctx.mode]);
}

export const LANG_NAME_EN = {
  sv: "Swedish",
  en: "English",
  es: "Spanish",
  ar: "Arabic",
  fa: "Persian",
  uk: "Ukrainian",
  so: "Somali",
};

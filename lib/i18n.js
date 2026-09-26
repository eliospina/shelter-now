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
    minWalk: "min promenad",
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
    minWalk: "min walk",
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
    minWalk: "min a pie",
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
    minWalk: "دقيقة مشياً",
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
    minWalk: "دقیقه پیاده",
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
    minWalk: "хв пішки",
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
    minWalk: "daqiiqo lugeyn",
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
// ctx = { address, distanceText, walkMinutes, secondAddress, secondDistanceText }
export const OFFLINE_STEPS = {
  sv: (ctx) => [
    `Håll dig lugn. Gå nu till närmaste skyddsrum: ${ctx.address}, ${ctx.distanceText} (${ctx.walkMinutes} min promenad).`,
    "Ta bara med: telefon, laddare, vatten, mediciner, legitimation och varma kläder.",
    "Om du inte kan ta dig dit: gå till en källare eller längst in i en byggnad, bort från fönster.",
    "Följ officiell information: Sveriges Radio P4 och krisinformation.se.",
    "Hjälp barn, äldre och grannar. Ring 112 om någon är skadad.",
  ],
  en: (ctx) => [
    `Stay calm. Go now to the nearest shelter: ${ctx.address}, ${ctx.distanceText} (${ctx.walkMinutes} min walk).`,
    "Take only: phone, charger, water, medicine, ID and warm clothes.",
    "If you cannot get there, go to a basement or the innermost part of a building, away from windows.",
    "Follow official information: Sveriges Radio P4 and krisinformation.se.",
    "Help children, elderly people and neighbours. Call 112 if someone is hurt.",
  ],
  es: (ctx) => [
    `Mantén la calma. Ve ahora al refugio más cercano: ${ctx.address}, ${ctx.distanceText} (${ctx.walkMinutes} min a pie).`,
    "Lleva solo: teléfono, cargador, agua, medicinas, documento de identidad y ropa abrigada.",
    "Si no puedes llegar, ve a un sótano o a la parte más interior de un edificio, lejos de las ventanas.",
    "Sigue la información oficial: Sveriges Radio P4 y krisinformation.se.",
    "Ayuda a niños, personas mayores y vecinos. Llama al 112 si alguien está herido.",
  ],
  ar: (ctx) => [
    `ابقَ هادئاً. اذهب الآن إلى أقرب ملجأ: ${ctx.address}، ${ctx.distanceText} (${ctx.walkMinutes} دقيقة مشياً).`,
    "خذ فقط: الهاتف، الشاحن، الماء، الأدوية، بطاقة الهوية وملابس دافئة.",
    "إذا لم تستطع الوصول، اذهب إلى قبو أو إلى الجزء الداخلي من المبنى بعيداً عن النوافذ.",
    "تابع المعلومات الرسمية: راديو السويد P4 وموقع krisinformation.se.",
    "ساعد الأطفال وكبار السن والجيران. اتصل بـ 112 إذا أُصيب أحد.",
  ],
  fa: (ctx) => [
    `آرام باشید. همین حالا به نزدیک‌ترین پناهگاه بروید: ${ctx.address}، ${ctx.distanceText} (${ctx.walkMinutes} دقیقه پیاده).`,
    "فقط این‌ها را بردارید: تلفن، شارژر، آب، دارو، کارت شناسایی و لباس گرم.",
    "اگر نمی‌توانید برسید، به زیرزمین یا داخلی‌ترین بخش ساختمان، دور از پنجره‌ها بروید.",
    "اطلاعات رسمی را دنبال کنید: رادیو سوئد P4 و krisinformation.se.",
    "به کودکان، سالمندان و همسایه‌ها کمک کنید. اگر کسی آسیب دیده با 112 تماس بگیرید.",
  ],
  uk: (ctx) => [
    `Зберігайте спокій. Ідіть зараз до найближчого укриття: ${ctx.address}, ${ctx.distanceText} (${ctx.walkMinutes} хв пішки).`,
    "Візьміть лише: телефон, зарядку, воду, ліки, документ і теплий одяг.",
    "Якщо не можете дістатися, спустіться в підвал або в найглибшу частину будівлі, подалі від вікон.",
    "Стежте за офіційною інформацією: Sveriges Radio P4 та krisinformation.se.",
    "Допоможіть дітям, літнім людям і сусідам. Телефонуйте 112, якщо хтось поранений.",
  ],
  so: (ctx) => [
    `Deggan ahow. Hadda aad hoyga ugu dhow: ${ctx.address}, ${ctx.distanceText} (${ctx.walkMinutes} daqiiqo lugeyn).`,
    "Qaado oo keliya: taleefanka, dabka taleefanka, biyo, daawo, aqoonsi iyo dhar diiran.",
    "Haddii aadan gaari karin, aad qolka dhulka hoostiisa ama qaybta ugu gudaha dhismaha, kana fog daaqadaha.",
    "La soco macluumaadka rasmiga ah: Sveriges Radio P4 iyo krisinformation.se.",
    "Caawi carruurta, dadka waayeelka ah iyo deriskaaga. Wac 112 haddii qof dhaawacmo.",
  ],
};

export const LANG_NAME_EN = {
  sv: "Swedish",
  en: "English",
  es: "Spanish",
  ar: "Arabic",
  fa: "Persian",
  uk: "Ukrainian",
  so: "Somali",
};

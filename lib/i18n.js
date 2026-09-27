// Shared translations for Shelter Now.
// Plain data + pure functions only — this file is imported from both
// server code (API routes) and client components.
import { FAR_THRESHOLD_MIN } from "./geo";

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
    farTitle: "Sök skydd där du är nu.",
    farBody: "Inget skyddsrum inom {min} minuter. Gå till en källare eller mitt i byggnaden, bort från fönster.",
    openNote: "Skyddsrummen öppnas inom 48 timmar när regeringen beslutar om höjd beredskap. Om larmet går innan dess: gå till en källare eller mitt i byggnaden.",
    alarmsTitle: "Känn igen larmen",
    alarms: [
      { name: "Beredskapslarm", pattern: "30 s signal, 15 s paus, i 5 minuter", action: "Gå inomhus och lyssna på Sveriges Radio P4." },
      { name: "Flyglarm", pattern: "Många korta signaler i 1 minut", action: "Sök skydd omedelbart." },
    ],
    propertyLabel: "Fastighet",
    propertyRef: "fastigheten {x}",
    propertyHint: "Det här är fastighetsbeteckningen i skyddsrumsregistret, inte en gatuadress. Använd Vägbeskrivning för att hitta dit.",
    sources: "Källor",
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
    farTitle: "Take cover where you are now.",
    farBody: "No shelter within {min} minutes. Go to a basement or the middle of the building, away from windows.",
    openNote: "Shelters are opened within 48 hours when the government declares heightened alert. If the alarm sounds before that, go to a basement or the middle of the building.",
    alarmsTitle: "Know the alarms",
    alarms: [
      { name: "Beredskapslarm (heightened alert)", pattern: "30 s signal, 15 s pause, for 5 minutes", action: "Go inside and listen to Sveriges Radio P4." },
      { name: "Flyglarm (air-raid alarm)", pattern: "Many short blasts for 1 minute", action: "Take cover immediately." },
    ],
    propertyLabel: "Property",
    propertyRef: "property {x}",
    propertyHint: "This is the property name from the shelter register, not a street address. Use Route to find it.",
    sources: "Sources",
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
    farTitle: "Protégete donde estás ahora.",
    farBody: "No hay ningún refugio a menos de {min} minutos. Ve a un sótano o al centro del edificio, lejos de las ventanas.",
    openNote: "Los refugios se abren en un plazo de 48 horas cuando el gobierno declara el estado de alerta elevada. Si suena la alarma antes, ve a un sótano o al centro del edificio.",
    alarmsTitle: "Conoce las alarmas",
    alarms: [
      { name: "Beredskapslarm (alerta elevada)", pattern: "30 s de señal, 15 s de pausa, durante 5 minutos", action: "Entra en un edificio y escucha Sveriges Radio P4." },
      { name: "Flyglarm (alarma antiaérea)", pattern: "Muchas señales cortas durante 1 minuto", action: "Protégete de inmediato." },
    ],
    propertyLabel: "Inmueble",
    propertyRef: "inmueble {x}",
    propertyHint: "Es el nombre del inmueble en el registro de refugios, no una dirección de calle. Usa Ruta para llegar.",
    sources: "Fuentes",
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
    farTitle: "احتمِ حيث أنت الآن.",
    farBody: "لا يوجد ملجأ على بعد أقل من {min} دقائق. اذهب إلى قبو أو إلى وسط المبنى، بعيداً عن النوافذ.",
    openNote: "تُفتح الملاجئ خلال 48 ساعة عندما تعلن الحكومة حالة التأهب القصوى. إذا انطلق الإنذار قبل ذلك، اذهب إلى قبو أو إلى وسط المبنى.",
    alarmsTitle: "تعرّف على الإنذارات",
    alarms: [
      { name: "Beredskapslarm (إنذار التأهب)", pattern: "إشارة 30 ثانية، ثم توقف 15 ثانية، لمدة 5 دقائق", action: "ادخل إلى مبنى واستمع إلى راديو السويد P4." },
      { name: "Flyglarm (إنذار غارة جوية)", pattern: "إشارات قصيرة كثيرة لمدة دقيقة واحدة", action: "احتمِ فوراً." },
    ],
    propertyLabel: "العقار",
    propertyRef: "العقار {x}",
    propertyHint: "هذا اسم العقار في سجل الملاجئ، وليس عنوان شارع. استخدم زر المسار للوصول إليه.",
    sources: "المصادر",
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
    farTitle: "همین حالا همان‌جا که هستید پناه بگیرید.",
    farBody: "هیچ پناهگاهی در فاصله {min} دقیقه نیست. به زیرزمین یا وسط ساختمان، دور از پنجره‌ها بروید.",
    openNote: "پناهگاه‌ها ظرف ۴۸ ساعت پس از اعلام آماده‌باش ویژه از سوی دولت باز می‌شوند. اگر پیش از آن آژیر به صدا درآمد، به زیرزمین یا وسط ساختمان بروید.",
    alarmsTitle: "آژیرها را بشناسید",
    alarms: [
      { name: "Beredskapslarm (آژیر آماده‌باش)", pattern: "۳۰ ثانیه صدا، ۱۵ ثانیه مکث، به مدت ۵ دقیقه", action: "به داخل ساختمان بروید و به رادیو سوئد P4 گوش دهید." },
      { name: "Flyglarm (آژیر حمله هوایی)", pattern: "صداهای کوتاه و پی‌درپی به مدت ۱ دقیقه", action: "فوراً پناه بگیرید." },
    ],
    propertyLabel: "ملک",
    propertyRef: "ملک {x}",
    propertyHint: "این نام ملک در فهرست پناهگاه‌هاست، نه نشانی خیابان. برای رسیدن از دکمهٔ مسیر استفاده کنید.",
    sources: "منابع",
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
    farTitle: "Сховайтеся там, де ви зараз.",
    farBody: "Немає укриття в межах {min} хвилин. Йдіть у підвал або в середину будівлі, подалі від вікон.",
    openNote: "Укриття відкривають протягом 48 годин після того, як уряд оголосить підвищену готовність. Якщо тривога пролунає раніше, йдіть у підвал або в середину будівлі.",
    alarmsTitle: "Знайте сигнали тривоги",
    alarms: [
      { name: "Beredskapslarm (підвищена готовність)", pattern: "30 с сигнал, 15 с пауза, протягом 5 хвилин", action: "Зайдіть у приміщення й слухайте Sveriges Radio P4." },
      { name: "Flyglarm (повітряна тривога)", pattern: "Багато коротких сигналів протягом 1 хвилини", action: "Негайно сховайтеся." },
    ],
    propertyLabel: "Ділянка",
    propertyRef: "ділянка {x}",
    propertyHint: "Це назва ділянки з реєстру укриттів, а не адреса вулиці. Натисніть «Маршрут», щоб знайти її.",
    sources: "Джерела",
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
    farTitle: "Hadda gabbaad ka dhig meesha aad joogto.",
    farBody: "Ma jiro hoy {min} daqiiqo gudahood ah. Tag qolka dhulka hoostiisa ama bartamaha dhismaha, kana fog daaqadaha.",
    openNote: "Hoyga waxaa la furaa 48 saacadood gudahood marka dowladdu ku dhawaaqdo heegan sare. Haddii dhawaaqa digniintu dhaco ka hor intaas, tag qolka dhulka hoostiisa ama bartamaha dhismaha.",
    alarmsTitle: "Garo dhawaaqyada digniinta",
    alarms: [
      { name: "Beredskapslarm (heegan sare)", pattern: "30 ilbiriqsi dhawaaq, 15 ilbiriqsi joogsi, muddo 5 daqiiqo ah", action: "Gal gudaha oo dhageyso Sveriges Radio P4." },
      { name: "Flyglarm (digniinta weerar cirka)", pattern: "Dhawaaqyo badan oo gaagaaban muddo 1 daqiiqo ah", action: "Isla markiiba gabbaad qaado." },
    ],
    propertyLabel: "Dhismaha",
    propertyRef: "dhismaha {x}",
    propertyHint: "Kani waa magaca dhismaha ee diiwaanka hoyga, ma aha ciwaan waddo. Isticmaal Jidka si aad u gaarto.",
    sources: "Ilaha",
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

// What to bring / not bring checklist (MCF guidance: food for 3 days,
// hygiene products; pets are not allowed in shelters).
export const PACK = {
  sv: {
    bring: ["Telefon + laddare / powerbank", "Vatten och mat för 3 dagar", "Mediciner du behöver", "Hygienartiklar", "Legitimation / pass", "Varma kläder och en filt"],
    dontBring: ["Husdjur (inte tillåtna i skyddsrum)", "Stora resväskor", "Alkohol", "Vapen eller knivar", "Bränsle, gasol eller annat brandfarligt"],
  },
  en: {
    bring: ["Phone + charger / power bank", "Water and food for 3 days", "Medicine you need", "Hygiene products", "ID / passport", "Warm clothes and a blanket"],
    dontBring: ["Pets (not allowed in shelters)", "Large suitcases", "Alcohol", "Weapons or knives", "Fuel, gas or anything flammable"],
  },
  es: {
    bring: ["Teléfono + cargador / batería externa", "Agua y comida para 3 días", "Tus medicinas", "Productos de higiene", "Documento de identidad / pasaporte", "Ropa abrigada y una manta"],
    dontBring: ["Mascotas (no se permiten en los refugios)", "Maletas grandes", "Alcohol", "Armas o cuchillos", "Combustible, gas o cosas inflamables"],
  },
  ar: {
    bring: ["الهاتف + الشاحن / بطارية خارجية", "ماء وطعام لمدة 3 أيام", "أدويتك", "مستلزمات النظافة الشخصية", "بطاقة الهوية / جواز السفر", "ملابس دافئة وبطانية"],
    dontBring: ["الحيوانات الأليفة (غير مسموح بها في الملاجئ)", "حقائب كبيرة", "كحول", "أسلحة أو سكاكين", "وقود أو غاز أو مواد قابلة للاشتعال"],
  },
  fa: {
    bring: ["تلفن + شارژر / پاوربانک", "آب و غذا برای ۳ روز", "داروهای خود", "وسایل بهداشتی", "کارت شناسایی / پاسپورت", "لباس گرم و پتو"],
    dontBring: ["حیوانات خانگی (ورود به پناهگاه ممنوع است)", "چمدان بزرگ", "الکل", "سلاح یا چاقو", "سوخت، گاز یا مواد آتش‌زا"],
  },
  uk: {
    bring: ["Телефон + зарядка / павербанк", "Вода і їжа на 3 дні", "Ваші ліки", "Засоби гігієни", "Посвідчення / паспорт", "Теплий одяг і ковдра"],
    dontBring: ["Домашні тварини (в укриття не допускаються)", "Великі валізи", "Алкоголь", "Зброя або ножі", "Пальне, газ чи легкозаймисті речі"],
  },
  so: {
    bring: ["Taleefan + dabka / power bank", "Biyo iyo cunto 3 maalmood ah", "Daawadaada", "Alaabta nadaafadda", "Aqoonsi / baasaboor", "Dhar diiran iyo buste"],
    dontBring: ["Xayawaanka guriga (looma oggola hoyga)", "Shandado waaweyn", "Khamri", "Hub ama mindiyo", "Shidaal, gaas ama wax gubta"],
  },
};

// "I'm safe" message template: (property designation, time, routeUrl) => string
export const FAMILY_MESSAGE = {
  sv: (address, time, routeUrl) => `Jag är i säkerhet. Jag går till skyddsrummet på fastigheten ${address} (karta: ${routeUrl}). Tid: ${time}.`,
  en: (address, time, routeUrl) => `I'm safe. I'm going to the shelter at property ${address} (map: ${routeUrl}). Time: ${time}.`,
  es: (address, time, routeUrl) => `Estoy a salvo. Voy al refugio del inmueble ${address} (mapa: ${routeUrl}). Hora: ${time}.`,
  ar: (address, time, routeUrl) => `أنا بأمان. أنا ذاهب إلى الملجأ في العقار ${address} (الخريطة: ${routeUrl}). الوقت: ${time}.`,
  fa: (address, time, routeUrl) => `من در امانم. به پناهگاه ملک ${address} می‌روم (نقشه: ${routeUrl}). ساعت: ${time}.`,
  uk: (address, time, routeUrl) => `Я в безпеці. Іду до укриття на ділянці ${address} (мапа: ${routeUrl}). Час: ${time}.`,
  so: (address, time, routeUrl) => `Waan nabad qabaa. Waxaan u socdaa hoyga dhismaha ${address} (khariidad: ${routeUrl}). Waqtiga: ${time}.`,
};

// Offline fallback instructions, used whenever the Claude API call fails.
// Follows MCF / krisinformation.se guidance. `near` when the nearest shelter
// is within FAR_THRESHOLD_MIN with the chosen mode; `far` puts taking cover
// in place first. Args: ctx = { address, distanceText, minutes }, t = time
// label for the mode, n = FAR_THRESHOLD_MIN.
const OFFLINE_STEPS = {
  sv: {
    near: (ctx, t) => [
      `Håll dig lugn. Ta dig nu till närmaste skyddsrum: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Ta med: telefon, laddare, vatten och mat för 3 dagar, mediciner, legitimation, hygienartiklar och varma kläder. Inga husdjur.",
      "Skyddsrummen öppnas inom 48 timmar vid höjd beredskap. Om det inte är öppet eller du inte kan ta dig dit: gå till en källare eller mitt i byggnaden, bort från fönster.",
      "Följ officiell information: Sveriges Radio P4 och krisinformation.se.",
      "Hjälp barn, äldre och grannar. Ring 112 om någon är skadad.",
    ],
    far: (ctx, t, n) => [
      `Håll dig lugn. Inget skyddsrum inom ${n} minuter — sök skydd där du är nu.`,
      "Gå till en källare eller mitt i byggnaden, bort från fönster.",
      `Endast om det är säkert att förflytta dig: närmaste skyddsrum ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}). Skyddsrummen öppnas inom 48 timmar vid höjd beredskap.`,
      "Följ officiell information: Sveriges Radio P4 och krisinformation.se.",
      "Hjälp barn, äldre och grannar. Ring 112 om någon är skadad.",
    ],
  },
  en: {
    near: (ctx, t) => [
      `Stay calm. Go now to the nearest shelter: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Bring: phone, charger, water and food for 3 days, medicine, ID, hygiene products and warm clothes. No pets.",
      "Shelters open within 48 hours of a heightened alert. If it is not open or you cannot get there, go to a basement or the middle of the building, away from windows.",
      "Follow official information: Sveriges Radio P4 and krisinformation.se.",
      "Help children, elderly people and neighbours. Call 112 if someone is hurt.",
    ],
    far: (ctx, t, n) => [
      `Stay calm. No shelter within ${n} minutes — take cover where you are now.`,
      "Go to a basement or the middle of the building, away from windows.",
      `Only if it is safe to travel: nearest shelter ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}). Shelters open within 48 hours of a heightened alert.`,
      "Follow official information: Sveriges Radio P4 and krisinformation.se.",
      "Help children, elderly people and neighbours. Call 112 if someone is hurt.",
    ],
  },
  es: {
    near: (ctx, t) => [
      `Mantén la calma. Ve ahora al refugio más cercano: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Lleva: teléfono, cargador, agua y comida para 3 días, medicinas, documento de identidad, productos de higiene y ropa abrigada. Sin mascotas.",
      "Los refugios se abren en 48 horas cuando se declara la alerta elevada. Si no está abierto o no puedes llegar, ve a un sótano o al centro del edificio, lejos de las ventanas.",
      "Sigue la información oficial: Sveriges Radio P4 y krisinformation.se.",
      "Ayuda a niños, personas mayores y vecinos. Llama al 112 si alguien está herido.",
    ],
    far: (ctx, t, n) => [
      `Mantén la calma. No hay ningún refugio a menos de ${n} minutos: protégete donde estás ahora.`,
      "Ve a un sótano o al centro del edificio, lejos de las ventanas.",
      `Solo si es seguro desplazarte: refugio más cercano ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}). Los refugios se abren en 48 horas cuando se declara la alerta elevada.`,
      "Sigue la información oficial: Sveriges Radio P4 y krisinformation.se.",
      "Ayuda a niños, personas mayores y vecinos. Llama al 112 si alguien está herido.",
    ],
  },
  ar: {
    near: (ctx, t) => [
      `ابقَ هادئاً. اذهب الآن إلى أقرب ملجأ: ${ctx.address}، ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "خذ معك: الهاتف، الشاحن، ماء وطعاماً لمدة 3 أيام، الأدوية، بطاقة الهوية، مستلزمات النظافة وملابس دافئة. لا حيوانات أليفة.",
      "تُفتح الملاجئ خلال 48 ساعة من إعلان حالة التأهب القصوى. إذا لم يكن مفتوحاً أو لم تستطع الوصول، اذهب إلى قبو أو إلى وسط المبنى بعيداً عن النوافذ.",
      "تابع المعلومات الرسمية: راديو السويد P4 وموقع krisinformation.se.",
      "ساعد الأطفال وكبار السن والجيران. اتصل بـ 112 إذا أُصيب أحد.",
    ],
    far: (ctx, t, n) => [
      `ابقَ هادئاً. لا يوجد ملجأ على بعد أقل من ${n} دقائق — احتمِ حيث أنت الآن.`,
      "اذهب إلى قبو أو إلى وسط المبنى، بعيداً عن النوافذ.",
      `فقط إذا كان التنقل آمناً: أقرب ملجأ ${ctx.address}، ${ctx.distanceText} (${ctx.minutes} ${t}). تُفتح الملاجئ خلال 48 ساعة من إعلان حالة التأهب القصوى.`,
      "تابع المعلومات الرسمية: راديو السويد P4 وموقع krisinformation.se.",
      "ساعد الأطفال وكبار السن والجيران. اتصل بـ 112 إذا أُصيب أحد.",
    ],
  },
  fa: {
    near: (ctx, t) => [
      `آرام باشید. همین حالا به نزدیک‌ترین پناهگاه بروید: ${ctx.address}، ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "همراه ببرید: تلفن، شارژر، آب و غذا برای ۳ روز، دارو، کارت شناسایی، وسایل بهداشتی و لباس گرم. بدون حیوان خانگی.",
      "پناهگاه‌ها ظرف ۴۸ ساعت پس از اعلام آماده‌باش ویژه باز می‌شوند. اگر باز نیست یا نمی‌توانید برسید، به زیرزمین یا وسط ساختمان، دور از پنجره‌ها بروید.",
      "اطلاعات رسمی را دنبال کنید: رادیو سوئد P4 و krisinformation.se.",
      "به کودکان، سالمندان و همسایه‌ها کمک کنید. اگر کسی آسیب دیده با 112 تماس بگیرید.",
    ],
    far: (ctx, t, n) => [
      `آرام باشید. هیچ پناهگاهی در فاصله ${n} دقیقه نیست — همین حالا همان‌جا که هستید پناه بگیرید.`,
      "به زیرزمین یا وسط ساختمان، دور از پنجره‌ها بروید.",
      `فقط اگر رفتن امن است: نزدیک‌ترین پناهگاه ${ctx.address}، ${ctx.distanceText} (${ctx.minutes} ${t}). پناهگاه‌ها ظرف ۴۸ ساعت پس از اعلام آماده‌باش ویژه باز می‌شوند.`,
      "اطلاعات رسمی را دنبال کنید: رادیو سوئد P4 و krisinformation.se.",
      "به کودکان، سالمندان و همسایه‌ها کمک کنید. اگر کسی آسیب دیده با 112 تماس بگیرید.",
    ],
  },
  uk: {
    near: (ctx, t) => [
      `Зберігайте спокій. Вирушайте зараз до найближчого укриття: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Візьміть: телефон, зарядку, воду та їжу на 3 дні, ліки, документ, засоби гігієни й теплий одяг. Без домашніх тварин.",
      "Укриття відкривають протягом 48 годин після оголошення підвищеної готовності. Якщо воно ще зачинене або ви не можете дістатися, йдіть у підвал або в середину будівлі, подалі від вікон.",
      "Стежте за офіційною інформацією: Sveriges Radio P4 та krisinformation.se.",
      "Допоможіть дітям, літнім людям і сусідам. Телефонуйте 112, якщо хтось поранений.",
    ],
    far: (ctx, t, n) => [
      `Зберігайте спокій. Немає укриття в межах ${n} хвилин — сховайтеся там, де ви зараз.`,
      "Йдіть у підвал або в середину будівлі, подалі від вікон.",
      `Лише якщо пересуватися безпечно: найближче укриття ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}). Укриття відкривають протягом 48 годин після оголошення підвищеної готовності.`,
      "Стежте за офіційною інформацією: Sveriges Radio P4 та krisinformation.se.",
      "Допоможіть дітям, літнім людям і сусідам. Телефонуйте 112, якщо хтось поранений.",
    ],
  },
  so: {
    near: (ctx, t) => [
      `Deggan ahow. U dhaqaaq hadda hoyga ugu dhow: ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}).`,
      "Qaado: taleefanka, dabka, biyo iyo cunto 3 maalmood ah, daawo, aqoonsi, alaabta nadaafadda iyo dhar diiran. Xayawaan guri ha keenin.",
      "Hoyga waxaa la furaa 48 saacadood gudahood marka la ku dhawaaqo heegan sare. Haddii uusan furnayn ama aadan gaari karin, tag qolka dhulka hoostiisa ama bartamaha dhismaha, kana fog daaqadaha.",
      "La soco macluumaadka rasmiga ah: Sveriges Radio P4 iyo krisinformation.se.",
      "Caawi carruurta, dadka waayeelka ah iyo deriskaaga. Wac 112 haddii qof dhaawacmo.",
    ],
    far: (ctx, t, n) => [
      `Deggan ahow. Ma jiro hoy ${n} daqiiqo gudahood ah — hadda gabbaad ka dhig meesha aad joogto.`,
      "Tag qolka dhulka hoostiisa ama bartamaha dhismaha, kana fog daaqadaha.",
      `Kaliya haddii ay ammaan tahay in la safro: hoyga ugu dhow ${ctx.address}, ${ctx.distanceText} (${ctx.minutes} ${t}). Hoyga waxaa la furaa 48 saacadood gudahood marka la ku dhawaaqo heegan sare.`,
      "La soco macluumaadka rasmiga ah: Sveriges Radio P4 iyo krisinformation.se.",
      "Caawi carruurta, dadka waayeelka ah iyo deriskaaga. Wac 112 haddii qof dhaawacmo.",
    ],
  },
};

// ctx = { address, distanceText, minutes, mode, far }
export function offlineSteps(lang, ctx) {
  const variant = ctx.far ? "far" : "near";
  // The register's "address" is a property designation (e.g. "Hinken 1"), so
  // name it as a property rather than presenting it as a street address.
  const named = { ...ctx, address: UI[lang].propertyRef.replace("{x}", ctx.address) };
  return OFFLINE_STEPS[lang][variant](named, UI[lang].minBy[ctx.mode], FAR_THRESHOLD_MIN);
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

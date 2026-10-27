"use client";

import { useEffect, useState } from "react";
import Compass from "./Compass";
import AlarmPlayer from "./AlarmPlayer";
import Icon, { BrandMark } from "./icons";
import { LANGS, LANG_CODES, DEFAULT_LANG, UI, PACK, FAMILY_MESSAGE, ASK, ALARM_SOUND, offlineSteps, isRtl, placeName } from "@/lib/i18n";
import { TRAVEL_MODES, DEFAULT_MODE, FAR_THRESHOLD_MIN, tripContext, travelMinutes, googleMapsRoute, nearestShelters, formatCoords } from "@/lib/geo";

// The Android app has no server of its own (see scripts/build-app.mjs): it
// searches shelters bundled with the app, so finding one works offline, and
// reaches Claude through the live site when there is internet.
const IS_APP = process.env.NEXT_PUBLIC_TARGET === "app";
const API_BASE = IS_APP ? "https://shelter-now-eta.vercel.app" : "";
const STREET_ATTRIBUTION =
  "Adresser: Belägenhetsadress Nedladdning, vektor, ©Lantmäteriet. Informationen har bearbetats. CC BY 4.0.";

const DEMO_POSITION = { lat: 59.3313, lon: 18.0598 }; // Stockholm C, only with ?demo in the URL
const LANG_STORAGE_KEY = "shelterNowLang";
// Beyond this distance to the nearest shelter the user is outside Sweden, and
// the app says so instead of pointing at a shelter hundreds of km away.
const OUTSIDE_SWEDEN_METERS = 50_000;
const MAX_QUESTIONS = 5; // per page load, to keep Claude costs predictable
const MAX_QUESTION_CHARS = 300;
// Without internet the phone has no assisted GPS, and a first fix can take
// up to half a minute. A fix from the last 10 minutes is good enough.
const GPS_TIMEOUT_MS = 30_000;
const GPS_MAX_AGE_MS = 10 * 60 * 1000;
const GPS_SLOW_HINT_MS = 6000;

// Resolves to null when there is no position. Never substitute another
// place: a shelter near Stockholm C is the wrong shelter for anyone else.
function getPosition() {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: GPS_TIMEOUT_MS, maximumAge: GPS_MAX_AGE_MS }
    );
  });
}

let bundledShelters = null;
function loadBundledShelters() {
  bundledShelters ??= fetch("/shelters.json")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error("shelters.json missing"))))
    .then((rows) => rows.map(([id, address, places, lat, lon, street]) => ({ id, address, places, lat, lon, street })))
    .catch((error) => {
      bundledShelters = null; // let the next tap try again
      throw error;
    });
  return bundledShelters;
}

async function findShelters(pos) {
  if (IS_APP) return nearestShelters(await loadBundledShelters(), pos.lat, pos.lon, 3);
  const res = await fetch(`/api/shelters/nearest?lat=${pos.lat}&lon=${pos.lon}`);
  if (!res.ok) throw new Error("shelters request failed");
  return (await res.json()).shelters;
}

// A link that opens the bunker in whatever map app the phone has. Offline map
// apps (Organic Maps, OsmAnd, Google Maps with a downloaded area) show streets
// and a route without internet. null where no such link exists (desktop).
function mapAppLink(platform, shelter, label) {
  const { lat, lon } = shelter;
  if (platform === "android") return `geo:${lat},${lon}?q=${lat},${lon}(${encodeURIComponent(label)})`;
  if (platform === "ios") return `maps://?q=${encodeURIComponent(label)}&ll=${lat},${lon}`;
  return null;
}

// "Mäster Samuelsgatan 70, Stockholm" -> ["Mäster Samuelsgatan 70", "Stockholm"].
function splitStreet(street) {
  const i = street.lastIndexOf(", ");
  return i === -1 ? [street, ""] : [street.slice(0, i), street.slice(i + 2)];
}

// "150 m" -> ["150", "m"]; "2.1 km" -> ["2.1", "km"].
function splitDistance(text) {
  const i = text.lastIndexOf(" ");
  return [text.slice(0, i), text.slice(i + 1)];
}

// "Flyglarm (air-raid alarm)" -> ["Flyglarm", "air-raid alarm"]; Swedish has no translation.
function splitAlarmName(name) {
  const m = name.match(/^(\S+)\s*\((.+)\)$/);
  return m ? [m[1], m[2]] : [name, ""];
}

// The alarm rhythm drawn as bars: long blocks with gaps, or many short blasts.
function AlarmPattern({ index }) {
  const count = index === 0 ? 7 : 28;
  return (
    <div className={`pattern-bars ${index === 0 ? "long" : "short"}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [status, setStatus] = useState("idle"); // idle | locating | done | error
  const [locationKey, setLocationKey] = useState(null); // "usingLocation" | "demoLocation", translated on render
  const [gpsSlow, setGpsSlow] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [origin, setOrigin] = useState(null); // { lat, lon, demo } the shelters were found from
  const [aiResult, setAiResult] = useState(null); // { key, steps }
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [qa, setQa] = useState([]); // [{ question, answer, grounded }]
  const [playingAlarm, setPlayingAlarm] = useState(null); // index into t.alarms, or null
  const [platform, setPlatform] = useState(null); // "android" | "ios" | null, read after mount

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(LANG_STORAGE_KEY);
    } catch {}
    if (saved && LANG_CODES.includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a persisted preference on mount
      setLang(saved);
      return;
    }
    const browserLang = (navigator.language || "").slice(0, 2).toLowerCase();
    if (LANG_CODES.includes(browserLang)) setLang(browserLang);
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time platform check after mount
    setPlatform(IS_APP || /Android/i.test(ua) ? "android" : /iPhone|iPad|iPod/i.test(ua) ? "ios" : null);
  }, []);

  // Parse the bundled shelters while the user reads, so the button is instant.
  useEffect(() => {
    if (IS_APP) loadBundledShelters().catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const t = UI[lang];
  const pack = PACK[lang];
  const ask = ASK[lang];
  const rtl = isRtl(lang);

  const nearest = shelters[0];
  const outside = Boolean(nearest) && nearest.distanceMeters > OUTSIDE_SWEDEN_METERS;
  const trip = nearest ? tripContext(nearest, mode) : null;
  const requestKey = nearest && !outside ? `${lang}|${mode}|${nearest.id}` : null;

  // Offline steps are shown immediately; Claude's version replaces them
  // only once it arrives for the current language, mode and shelter.
  const claudeSteps = aiResult && aiResult.key === requestKey ? aiResult.steps : null;
  const steps = claudeSteps ?? (trip ? offlineSteps(lang, trip) : []);

  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/instructions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lang, mode, shelterId: nearest.id, distanceMeters: nearest.distanceMeters }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("instructions request failed"))))
      .then((data) => {
        if (!cancelled && data.source === "claude") setAiResult({ key: requestKey, steps: data.steps });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [requestKey]); // eslint-disable-line react-hooks/exhaustive-deps -- requestKey encodes lang, mode and shelter

  async function handleEmergency() {
    setStatus("locating");
    setShelters([]);
    setLocationKey(null);

    const demo = new URLSearchParams(window.location.search).has("demo");
    const slowTimer = setTimeout(() => setGpsSlow(true), GPS_SLOW_HINT_MS);
    const pos = demo ? DEMO_POSITION : await getPosition();
    clearTimeout(slowTimer);
    setGpsSlow(false);
    if (!pos) {
      setStatus("error");
      return;
    }
    setLocationKey(demo ? "demoLocation" : "usingLocation");
    setOrigin({ ...pos, demo });

    try {
      const found = await findShelters(pos);
      if (!found?.length) throw new Error("no shelters returned");
      setShelters(found);
      setStatus("done");
      window.scrollTo(0, 0);
    } catch {
      setStatus("error");
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    const q = question.trim().slice(0, MAX_QUESTION_CHARS);
    if (!q || asking || !nearest || qa.length >= MAX_QUESTIONS) return;
    setAsking(true);
    let result;
    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang, mode, question: q, shelterId: nearest.id, distanceMeters: nearest.distanceMeters }),
      });
      if (!res.ok) throw new Error("ask request failed");
      const data = await res.json();
      result = { answer: data.answer, grounded: data.grounded };
    } catch {
      result = { answer: ask.offline, grounded: false };
    }
    setQa((prev) => [...prev, { question: q, ...result }]);
    setQuestion("");
    setAsking(false);
  }

  function safeMessage(shelter) {
    return FAMILY_MESSAGE[lang]({
      place: placeName(lang, shelter),
      // 24-hour "21:37", as in Sweden; "9:37 p. m." also broke the closing full stop.
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
      routeUrl: googleMapsRoute(shelter.lat, shelter.lon, mode),
      here: formatCoords(origin.lat, origin.lon),
      far: tripContext(shelter, mode).far,
    });
  }

  function shelterMeta(s) {
    return `${s.distanceText} · ${travelMinutes(s.distanceMeters, mode)} ${t.minBy[mode]} · ${s.places} ${t.places}`;
  }

  function backHome() {
    setStatus("idle");
    setShelters([]);
    setQa([]);
    window.scrollTo(0, 0);
  }

  const showResult = status === "done" && Boolean(nearest);

  const footer = (
    <p className="foot">
      {t.footer}
      <br />
      {t.sources}:{" "}
      <a href="https://www.mcf.se" target="_blank" rel="noopener noreferrer">
        mcf.se
      </a>
      ,{" "}
      <a href="https://www.krisinformation.se" target="_blank" rel="noopener noreferrer">
        krisinformation.se
      </a>
      <br />
      {/* Attribution required by the CC BY 4.0 licence of the street addresses. */}
      <span lang="sv">{STREET_ATTRIBUTION}</span>
      <br />
      {/* Absolute in the app, so it opens the published policy in the browser. */}
      <a href={`${API_BASE}/privacy`} target="_blank" rel="noopener noreferrer">
        {t.privacy}
      </a>
    </p>
  );

  if (showResult) {
    return (
      <div className="wrap" dir={rtl ? "rtl" : "ltr"}>
        <header className="topbar">
          <button type="button" className="back" onClick={backHome} aria-label={t.back}>
            <Icon name="arrow" size={22} className="back-arrow" />
          </button>
          <BrandMark size={32} />
          <span className="topbar-name">Bunker Now Sverige</span>
          {!outside && <span className="mode-pill">{t.modes[mode]}</span>}
        </header>

        {outside ? (
          <section className="outside">
            <div className="shield">
              <Icon name="shield" size={30} />
            </div>
            <h2>{t.outsideTitle}</h2>
            <p className="lead">{t.outsideLead}</p>
            <div className="alert" role="alert">
              <h3>{t.outsideTake}</h3>
              <ul>
                {t.outsideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
            <div className="fact">
              <span className="fact-num">112</span>
              <p>{t.eu112}</p>
            </div>
            <button type="button" className="btn-outline" onClick={backHome}>
              {t.back}
            </button>
          </section>
        ) : (
          renderResult()
        )}
        {footer}
      </div>
    );
  }

  function renderResult() {
    const [num, unit] = splitDistance(nearest.distanceText);
    const [street, city] = nearest.street ? splitStreet(nearest.street) : [null, ""];
    return (
      <>
        {trip.far && (
          <div className="alert" role="alert">
            <Icon name="alert" size={30} />
            <h3>{t.farTitle}</h3>
            <p>{t.farBody.replace("{min}", FAR_THRESHOLD_MIN)}</p>
          </div>
        )}

        <div className="card hero">
          <p className={trip.far ? "hero-label muted" : "hero-label"}>{trip.far ? t.farNearest : t.nearest}</p>
          <p className="hero-dist">
            <bdi dir="ltr">
              <span className="num">{num}</span>
              <span className="unit">{unit}</span>
            </bdi>
          </p>
          <div className="chips">
            <span className="chip">
              {travelMinutes(nearest.distanceMeters, mode)} {t.minBy[mode]}
            </span>
            <span className="chip">
              <Icon name="people" size={18} /> {nearest.places} {t.places}
            </span>
          </div>
          <div className="addr">
            {street ? (
              <>
                <p className="addr-label">{t.streetLabel}</p>
                <p className="addr-street" lang="sv">
                  {street}
                </p>
                {city && (
                  <p className="addr-city" lang="sv">
                    {city}
                  </p>
                )}
                <p className="addr-prop">
                  {t.propertyLabel}: <b lang="sv">{nearest.address}</b>
                </p>
              </>
            ) : (
              <>
                <p className="addr-label">{t.propertyLabel}</p>
                <p className="addr-street" lang="sv">
                  {nearest.address}
                </p>
                <p className="addr-prop">{t.propertyHint}</p>
              </>
            )}
          </div>
          <a className={`route ${trip.far ? "ink" : ""}`} href={googleMapsRoute(nearest.lat, nearest.lon, mode)} target="_blank" rel="noopener noreferrer">
            <Icon name="pin" size={20} /> {t.mapsRoute}
          </a>
          <p className="note center">{t.mapsNote}</p>
          {mapAppLink(platform, nearest, "Skyddsrum") && (
            <>
              <a className="btn-outline" href={mapAppLink(platform, nearest, "Skyddsrum")}>
                <Icon name="map" size={20} /> {t.otherApp}
              </a>
              <p className="note center">{t.otherAppNote}</p>
            </>
          )}
        </div>

        <Compass key={nearest.id} lang={lang} origin={origin} follow={!origin.demo} target={nearest} />

        {/* Described in words only: the civil defence emblem is protected, so the
            drawing waits until MCF confirms it may be shown. */}
        <div className="card sign-card">
          <h3 className="title-icon">
            <Icon name="eye" /> {t.signTitle}
          </h3>
          <p>{t.signBody}</p>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>{t.whatNow}</h3>
            <span className={`badge ${claudeSteps ? "" : "calm"}`}>{claudeSteps ? "Claude" : t.badgeOffline}</span>
          </div>
          <ol className="steps">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <form className="ask" onSubmit={handleAsk}>
            <label htmlFor="ask-input">{ask.title}</label>
            {qa.map((item, i) => (
              <div className="qa" key={i}>
                <p className="q" dir="auto">
                  {item.question}
                </p>
                <p className={`a ${item.grounded ? "" : "muted"}`} dir="auto">
                  {item.answer}
                </p>
              </div>
            ))}
            {qa.length < MAX_QUESTIONS ? (
              <div className="ask-row">
                <input
                  id="ask-input"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={ask.placeholder}
                  maxLength={MAX_QUESTION_CHARS}
                  disabled={asking}
                  dir="auto"
                />
                <button type="submit" disabled={asking || !question.trim()}>
                  {asking ? ask.thinking : ask.button}
                </button>
              </div>
            ) : (
              <p className="note">{ask.limit}</p>
            )}
          </form>
        </div>

        <div className="card">
          <h3 className="title-icon">
            <Icon name="people" /> {t.safeTitle}
          </h3>
          <a className="btn-solid" href={`sms:?&body=${encodeURIComponent(safeMessage(nearest))}`}>
            {t.smsButton}
          </a>
          <a className="btn-outline" href={`https://wa.me/?text=${encodeURIComponent(safeMessage(nearest))}`} target="_blank" rel="noopener noreferrer">
            {t.whatsappButton}
          </a>
          <p className="note">{t.safeNote}</p>
        </div>

        {shelters.length > 1 && (
          <div className="card">
            <h3>{t.others}</h3>
            {shelters.slice(1).map((s) => (
              <div className="other" key={s.id}>
                <div>
                  <b lang="sv">{s.street ? splitStreet(s.street)[0] : s.address}</b>
                  {s.street && (
                    <span>
                      {t.propertyLabel}: <span lang="sv">{s.address}</span>
                    </span>
                  )}
                  <span>{shelterMeta(s)}</span>
                </div>
                <a className="btn-small" href={googleMapsRoute(s.lat, s.lon, mode)} target="_blank" rel="noopener noreferrer">
                  {t.route}
                </a>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  const locating = status === "locating";
  const statusText = status === "error" ? t.locationError : gpsSlow ? t.gpsSlow : locationKey === "demoLocation" ? t.demoLocation : "";

  return (
    <div className="wrap" dir={rtl ? "rtl" : "ltr"}>
      <header className="brand">
        <BrandMark size={46} />
        <div>
          <h1>Bunker Now Sverige</h1>
          {IS_APP && (
            <p className="ready">
              <span className="dot" aria-hidden="true" /> {t.offlineReady}
            </p>
          )}
        </div>
      </header>

      <div className="langs" role="radiogroup" aria-label={t.languageLabel}>
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={lang === l.code}
            lang={l.code}
            dir={l.rtl ? "rtl" : "ltr"}
            className={`lang ${lang === l.code ? "active" : ""}`}
            onClick={() => setLang(l.code)}
          >
            {l.name}
          </button>
        ))}
      </div>

      <h2 className="headline">{t.tagline}</h2>

      <p id="mode-label" className="label">
        {t.travelMode}
      </p>
      <div className="modes" role="radiogroup" aria-labelledby="mode-label">
        {TRAVEL_MODES.map((m) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} className={`mode ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>
            <Icon name={m} size={20} /> {t.modes[m]}
          </button>
        ))}
      </div>

      <button className="bunker-btn" onClick={handleEmergency} disabled={locating} aria-busy={locating}>
        <span className="bunker-circle" aria-hidden="true">
          <Icon name="down" size={30} />
        </span>
        <span className="bunker-title">{locating ? t.emergencyWorking : t.emergencyButton}</span>
        {!locating && <span className="bunker-sub">{t.buttonSub}</span>}
      </button>
      <p className={`status ${status === "error" ? "error" : ""}`} role="status">
        {statusText}
      </p>

      <div className="fact">
        <span className="fact-num">
          <bdi dir="ltr">48 h</bdi>
        </span>
        <p>{t.openNote}</p>
      </div>

      <div className="card prep">
        <h3 className="title-icon">
          <Icon name="map" /> {t.prepTitle}
        </h3>
        <ol className="abc">
          {t.prepSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="prep-done">
          <Icon name="check" size={20} /> {t.prepDone}
        </p>
      </div>

      <h2 className="section">
        <Icon name="sound" /> {t.alarmsTitle}
      </h2>
      {t.alarms.map((a, i) => {
        const [name, sub] = splitAlarmName(a.name);
        return (
          <div className="card alarm" key={a.name}>
            <h3 lang="sv">{name}</h3>
            {sub && <p className="alarm-sub">{sub}</p>}
            <AlarmPattern index={i} />
            <p className="alarm-pattern">{a.pattern}</p>
            <p className={`alarm-action ${i === 1 ? "urgent" : ""}`}>
              <Icon name="arrow" size={20} className="flip" /> {a.action}
            </p>
            <AlarmPlayer index={i} s={ALARM_SOUND[lang]} playing={playingAlarm === i} onPlay={() => setPlayingAlarm(i)} onStop={() => setPlayingAlarm(null)} />
          </div>
        );
      })}
      <p className="note">{ALARM_SOUND[lang].note}</p>

      <div className="card pack">
        <h3 className="title-icon">
          <span className="chip-icon yes">
            <Icon name="check" size={18} />
          </span>
          {t.packBring}
        </h3>
        <ul>
          {pack.bring.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="card pack">
        <h3 className="title-icon">
          <span className="chip-icon no">
            <Icon name="cross" size={18} />
          </span>
          {t.packDontBring}
        </h3>
        <ul>
          {pack.dontBring.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {footer}
    </div>
  );
}

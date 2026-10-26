"use client";

import { useEffect, useState } from "react";
import Compass from "./Compass";
import Icon, { BrandMark } from "./icons";
import { LANGS, LANG_CODES, DEFAULT_LANG, UI, PACK, FAMILY_MESSAGE, ASK, offlineSteps, isRtl, placeName } from "@/lib/i18n";
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

// The street address when Lantmäteriet has one nearby, with the register's
// property designation below it; otherwise the property designation alone.
function ShelterName({ shelter, t }) {
  if (!shelter.street) {
    return (
      <>
        <span className="prop">{t.propertyLabel}</span>
        <b>{shelter.address}</b>
      </>
    );
  }
  return (
    <>
      <span className="prop">{t.streetLabel}</span>
      <b>{shelter.street}</b>
      <span className="prop-sub">
        {t.propertyLabel}: {shelter.address}
      </span>
    </>
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

  return (
    <div className="wrap" dir={rtl ? "rtl" : "ltr"}>
      <header className="brand">
        <BrandMark size={46} />
        <div>
          <h1>Bunker Now Sverige</h1>
          <p className="tag">{t.tagline}</p>
        </div>
      </header>

      <label htmlFor="lang">{t.languageLabel}</label>
      <select id="lang" value={lang} onChange={(e) => setLang(e.target.value)}>
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>

      <label id="mode-label" className="mode-label">
        {t.travelMode}
      </label>
      <div className="modes" role="radiogroup" aria-labelledby="mode-label">
        {TRAVEL_MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            className={`mode ${mode === m ? "active" : ""}`}
            onClick={() => setMode(m)}
          >
            <Icon name={m} size={20} /> {t.modes[m]}
          </button>
        ))}
      </div>

      <button className="sos" onClick={handleEmergency} disabled={status === "locating"}>
        {status === "locating" ? t.emergencyWorking : t.emergencyButton}
      </button>
      <p className={`small ${status === "error" ? "error" : ""}`}>{status === "error" ? t.locationError : gpsSlow ? t.gpsSlow : locationKey ? t[locationKey] : ""}</p>

      {status === "done" && outside && (
        <div className="card far" role="alert">
          <b>
            <Icon name="alert" /> {t.outsideTitle}
          </b>
          <p>{t.outsideBody}</p>
        </div>
      )}

      {status === "done" && nearest && !outside && (
        <>
          {trip.far && (
            <div className="card far" role="alert">
              <b>
                <Icon name="alert" /> {t.farTitle}
              </b>
              <p>{t.farBody.replace("{min}", FAR_THRESHOLD_MIN)}</p>
            </div>
          )}

          <div className={`card hero ${trip.far ? "secondary" : "first"}`}>
            <div className="badge">{trip.far ? t.farNearest : t.nearest}</div>
            <div className="hero-stat">
              <span className="dist">{nearest.distanceText}</span>
              <span className="mins">
                {travelMinutes(nearest.distanceMeters, mode)} {t.minBy[mode]} · {nearest.places} {t.places}
              </span>
            </div>
            <div className="shelter">
              <div>
                <ShelterName shelter={nearest} t={t} />
              </div>
            </div>
            <a className="go wide" href={googleMapsRoute(nearest.lat, nearest.lon, mode)} target="_blank" rel="noopener noreferrer">
              <Icon name="pin" size={20} /> {t.route}
            </a>
            <p className="note">{nearest.street ? t.streetHint : t.propertyHint}</p>
            <p className="note">{t.openNote}</p>
          </div>

          <Compass key={nearest.id} lang={lang} origin={origin} follow={!origin.demo} target={nearest} />

          <div className="card">
            <div className="badge">{claudeSteps ? t.aiBadge : t.offlineBadge}</div>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>

            <form className="ask" onSubmit={handleAsk}>
              <label htmlFor="ask-input">{ask.title}</label>
              {qa.map((item, i) => (
                <div className="qa" key={i}>
                  <p className="q" dir="auto">{item.question}</p>
                  <p className={`a ${item.grounded ? "" : "muted"}`} dir="auto">{item.answer}</p>
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
            <b>
              <Icon name="people" /> {t.safeTitle}
            </b>
            <div className="btns">
              <a className="btn2" href={`sms:?&body=${encodeURIComponent(safeMessage(nearest))}`}>
                {t.smsButton}
              </a>
              <a className="btn2 wa" href={`https://wa.me/?text=${encodeURIComponent(safeMessage(nearest))}`} target="_blank" rel="noopener noreferrer">
                {t.whatsappButton}
              </a>
            </div>
            <div className="note">{t.safeNote}</div>
          </div>

          {shelters.length > 1 && (
            <div className="card">
              <b>{t.others}</b>
              {shelters.slice(1).map((s) => (
                <div className="shelter" key={s.id}>
                  <div>
                    <ShelterName shelter={s} t={t} />
                    <span>{shelterMeta(s)}</span>
                  </div>
                  <a className="go" href={googleMapsRoute(s.lat, s.lon, mode)} target="_blank" rel="noopener noreferrer">
                    {t.route}
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!(status === "done" && nearest) && (
        <div className="card info">
          <Icon name="info" />
          <p>{t.openNote}</p>
        </div>
      )}

      <div className="card">
        <b>
          <Icon name="sound" /> {t.alarmsTitle}
        </b>
        <dl className="alarms">
          {t.alarms.map((a) => (
            <div key={a.name}>
              <dt>{a.name}</dt>
              <dd className="pattern">{a.pattern}</dd>
              <dd className="action">→ {a.action}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card">
        <div className="cols">
          <div className="yes">
            <b>
              <Icon name="check" size={18} /> {t.packBring}
            </b>
            <ul>
              {pack.bring.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="no">
            <b>
              <Icon name="cross" size={18} /> {t.packDontBring}
            </b>
            <ul>
              {pack.dontBring.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

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
    </div>
  );
}

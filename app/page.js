"use client";

import { useEffect, useState } from "react";
import { LANGS, LANG_CODES, DEFAULT_LANG, UI, PACK, FAMILY_MESSAGE, offlineSteps, isRtl } from "@/lib/i18n";
import { TRAVEL_MODES, DEFAULT_MODE, tripContext, travelMinutes, googleMapsRoute } from "@/lib/geo";

const FALLBACK_POSITION = { lat: 59.3313, lon: 18.0598 }; // Stockholm C
const LANG_STORAGE_KEY = "shelterNowLang";
const MODE_ICON = { walk: "🚶", bike: "🚲", car: "🚗" };

function getPosition() {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ...FALLBACK_POSITION, isFallback: true });
      return;
    }
    const timer = setTimeout(() => resolve({ ...FALLBACK_POSITION, isFallback: true }), 6000);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        clearTimeout(timer);
        resolve({ lat: p.coords.latitude, lon: p.coords.longitude, isFallback: false });
      },
      () => {
        clearTimeout(timer);
        resolve({ ...FALLBACK_POSITION, isFallback: true });
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

export default function Home() {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [status, setStatus] = useState("idle"); // idle | locating | done | error
  const [locationNote, setLocationNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [shelters, setShelters] = useState([]);
  const [aiResult, setAiResult] = useState(null); // { key, steps }

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
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const t = UI[lang];
  const pack = PACK[lang];
  const rtl = isRtl(lang);

  const nearest = shelters[0];
  const trip = nearest ? tripContext(nearest, mode) : null;
  const requestKey = nearest ? `${lang}|${mode}|${nearest.id}` : null;

  // Offline steps are shown immediately; Claude's version replaces them
  // only once it arrives for the current language, mode and shelter.
  const claudeSteps = aiResult && aiResult.key === requestKey ? aiResult.steps : null;
  const steps = claudeSteps ?? (trip ? offlineSteps(lang, trip) : []);

  useEffect(() => {
    if (!nearest) return;
    let cancelled = false;
    fetch("/api/instructions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        lang,
        mode,
        shelter: { address: nearest.address, distanceMeters: nearest.distanceMeters },
      }),
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
    setErrorMsg("");
    setShelters([]);

    const pos = await getPosition();
    setLocationNote(pos.isFallback ? t.demoLocation : t.usingLocation);

    try {
      const res = await fetch(`/api/shelters/nearest?lat=${pos.lat}&lon=${pos.lon}`);
      if (!res.ok) throw new Error("shelters request failed");
      const data = await res.json();
      if (!data.shelters?.length) throw new Error("no shelters returned");
      setShelters(data.shelters);
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg(t.locationError);
    }
  }

  function safeMessage(shelter) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return FAMILY_MESSAGE[lang](shelter.address, time, googleMapsRoute(shelter.lat, shelter.lon, mode));
  }

  function shelterMeta(s) {
    return `${s.distanceText} · ${travelMinutes(s.distanceMeters, mode)} ${t.minBy[mode]} · ${s.places} ${t.places}`;
  }

  return (
    <div className="wrap" dir={rtl ? "rtl" : "ltr"}>
      <h1>🛡️ Shelter Now</h1>
      <p className="tag">{t.tagline}</p>

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
            <span aria-hidden="true">{MODE_ICON[m]}</span> {t.modes[m]}
          </button>
        ))}
      </div>

      <button className="sos" onClick={handleEmergency} disabled={status === "locating"}>
        {status === "locating" ? t.emergencyWorking : t.emergencyButton}
      </button>
      <p className={`small ${status === "error" ? "error" : ""}`}>{status === "error" ? errorMsg : locationNote}</p>

      <div className="card">
        <div className="cols">
          <div className="yes">
            <b>✓ {t.packBring}</b>
            <ul>
              {pack.bring.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="no">
            <b>✗ {t.packDontBring}</b>
            <ul>
              {pack.dontBring.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {status === "done" && nearest && (
        <>
          {trip.far && (
            <div className="card far" role="alert">
              <b>⚠️ {t.farTitle}</b>
              <p>{t.farBody}</p>
            </div>
          )}

          <div className={`card ${trip.far ? "secondary" : "first"}`}>
            <div className="badge">{trip.far ? t.farNearest : t.nearest}</div>
            <div className="shelter">
              <div>
                <b>{nearest.address}</b>
                <span>{shelterMeta(nearest)}</span>
              </div>
              <a className="go" href={googleMapsRoute(nearest.lat, nearest.lon, mode)} target="_blank" rel="noopener noreferrer">
                {t.route} →
              </a>
            </div>
          </div>

          <div className="card">
            <div className="badge">{claudeSteps ? t.aiBadge : t.offlineBadge}</div>
            <ol>
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="card">
            <b>👨‍👩‍👧 {t.safeTitle}</b>
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
                    <b>{s.address}</b>
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

      <p className="foot">{t.footer}</p>
    </div>
  );
}

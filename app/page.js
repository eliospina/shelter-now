"use client";

import { useEffect, useState } from "react";
import { LANGS, LANG_CODES, DEFAULT_LANG, UI, PACK, FAMILY_MESSAGE, OFFLINE_STEPS, isRtl } from "@/lib/i18n";
import { googleMapsWalkingRoute } from "@/lib/geo";

const FALLBACK_POSITION = { lat: 59.3313, lon: 18.0598 }; // Stockholm C
const LANG_STORAGE_KEY = "shelterNowLang";

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
  const [status, setStatus] = useState("idle"); // idle | locating | done | error
  const [locationNote, setLocationNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [shelters, setShelters] = useState([]);
  const [instructions, setInstructions] = useState(null); // { steps, source }

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

  async function handleEmergency() {
    setStatus("locating");
    setErrorMsg("");
    setInstructions(null);
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

      const nearest = data.shelters[0];
      const second = data.shelters[1];
      const ctx = {
        address: nearest.address,
        distanceText: nearest.distanceText,
        walkMinutes: nearest.walkMinutes,
        secondAddress: second?.address ?? "",
        secondDistanceText: second?.distanceText ?? "",
      };

      // Show offline instructions immediately, then try to upgrade to
      // Claude-generated ones. If that request fails for any reason
      // (API down, no key, offline), the steps already on screen stay.
      setInstructions({ steps: OFFLINE_STEPS[lang](ctx), source: "offline" });

      fetch("/api/instructions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lang,
          shelter: { address: nearest.address, distanceText: nearest.distanceText, walkMinutes: nearest.walkMinutes },
          second: second ? { address: second.address, distanceText: second.distanceText } : undefined,
        }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("instructions request failed"))))
        .then((data) => setInstructions({ steps: data.steps, source: data.source }))
        .catch(() => {});
    } catch {
      setStatus("error");
      setErrorMsg(t.locationError);
    }
  }

  function safeMessage(shelter) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const routeUrl = googleMapsWalkingRoute(shelter.lat, shelter.lon);
    return FAMILY_MESSAGE[lang](shelter.address, time, routeUrl);
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

      {status === "done" && shelters.length > 0 && (
        <>
          <div className="card first">
            <div className="badge">{t.nearest}</div>
            <div className="shelter">
              <div>
                <b>{shelters[0].address}</b>
                <span>
                  {shelters[0].distanceText} · {shelters[0].walkMinutes} {t.minWalk} · {shelters[0].places} {t.places}
                </span>
              </div>
              <a className="go" href={googleMapsWalkingRoute(shelters[0].lat, shelters[0].lon)} target="_blank" rel="noopener noreferrer">
                {t.route} →
              </a>
            </div>
          </div>

          <div className="card">
            <div className="badge">{instructions?.source === "claude" ? t.aiBadge : t.offlineBadge}</div>
            <ol>
              {(instructions?.steps ?? []).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="card">
            <b>👨‍👩‍👧 {t.safeTitle}</b>
            <div className="btns">
              <a className="btn2" href={`sms:?&body=${encodeURIComponent(safeMessage(shelters[0]))}`}>
                {t.smsButton}
              </a>
              <a className="btn2 wa" href={`https://wa.me/?text=${encodeURIComponent(safeMessage(shelters[0]))}`} target="_blank" rel="noopener noreferrer">
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
                    <span>
                      {s.distanceText} · {s.walkMinutes} {t.minWalk} · {s.places} {t.places}
                    </span>
                  </div>
                  <a className="go" href={googleMapsWalkingRoute(s.lat, s.lon)} target="_blank" rel="noopener noreferrer">
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

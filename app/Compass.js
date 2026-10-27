"use client";

import { useEffect, useRef, useState } from "react";
import { COMPASS } from "@/lib/i18n";
import { bearingDegrees, compassPoint, formatDistance, haversineMeters } from "@/lib/geo";

// If no compass reading arrives within this time, assume there is no sensor.
const SENSOR_WAIT_MS = 1500;

// Heading of the top of the phone in degrees clockwise from north, or null
// when the event has no absolute (north-referenced) reading.
function headingFrom(event) {
  if (typeof event.webkitCompassHeading === "number") return event.webkitCompassHeading; // iOS
  if (event.absolute && typeof event.alpha === "number") {
    const screenAngle = window.screen?.orientation?.angle ?? 0;
    return (360 - event.alpha + screenAngle) % 360;
  }
  return null;
}

// "You're getting closer / moving away": the distance has to change by this
// much before the message flips, so GPS jitter doesn't make it flicker.
const TREND_STEP_M = 8;
// Within this distance the bunker is "very close": look for the sign.
const ARRIVED_M = 30;
// A new point on the path every few metres; GPS fixes worse than this
// accuracy are skipped (they jump around between tall buildings).
const TRAIL_STEP_M = 5;
const MAX_ACCURACY_M = 40;
const MAX_TRAIL_POINTS = 600;

// Projects lat/lon to a small SVG box (north up), fitting every point given.
function project(points, size, pad) {
  const lat0 = points[0].lat;
  const kx = Math.cos((lat0 * Math.PI) / 180) * 111320;
  const ky = 110540;
  const xy = points.map((p) => [p.lon * kx, -p.lat * ky]);
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const span = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY, 40);
  const scale = (size - 2 * pad) / span;
  const offX = (size - (Math.max(...xs) - minX) * scale) / 2;
  const offY = (size - (Math.max(...ys) - minY) * scale) / 2;
  return xy.map(([x, y]) => [offX + (x - minX) * scale, offY + (y - minY) * scale]);
}

// The path walked so far, the start, where you are now and the bunker.
// No streets: there is no map without internet.
function Trail({ trail, pos, target, c }) {
  const size = 260;
  const pts = project([...trail, pos, target], size, 40);
  const path = pts.slice(0, trail.length + 1);
  const [sx, sy] = pts[0];
  const [ux, uy] = pts[trail.length];
  const [bx, by] = pts[pts.length - 1];
  return (
    <div className="card trail">
      <h3>{c.trailTitle}</h3>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={c.trailTitle}>
        <rect width={size} height={size} rx="16" className="trail-bg" />
        <polyline points={path.map((p) => p.join(",")).join(" ")} className="trail-line" />
        <circle cx={sx} cy={sy} r="6" className="trail-start" />
        <text x={sx} y={sy + 20} textAnchor="middle" className="trail-label">
          {c.start}
        </text>
        <rect x={bx - 12} y={by - 12} width="24" height="24" rx="6" className="trail-bunker" />
        <path d={`M${bx - 6} ${by + 7}v-6a6 6 0 0 1 12 0v6`} className="trail-bunker-arch" />
        <text x={bx} y={by + 28} textAnchor="middle" className="trail-label strong">
          {c.bunker}
        </text>
        <circle cx={ux} cy={uy} r="9" className="trail-you" />
        <text x={ux} y={uy - 16} textAnchor="middle" className="trail-label strong">
          {c.you}
        </text>
      </svg>
      <p className="note">{c.trailNote}</p>
    </div>
  );
}

// A short beep for "you're very close". Fails silently if audio is blocked.
function beep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch {}
}

// Smallest signed turn from angle a to angle b, in -180..180.
function turn(a, b) {
  return ((((b - a) % 360) + 540) % 360) - 180;
}

// An arrow to the target that works without internet: GPS for the position,
// the magnetometer for which way the phone points. Without a compass sensor
// the arrow is drawn relative to north instead, and the card says so.
// `follow` keeps the position updated while walking; off in demo mode,
// where the origin is Stockholm C and not the phone's real position.
export default function Compass({ lang, origin, follow, target, signText }) {
  const c = COMPASS[lang];
  const [pos, setPos] = useState(origin);
  // Unwrapped (can exceed 360), so the arrow turns the short way past north.
  const [heading, setHeading] = useState(null);
  const [noSensor, setNoSensor] = useState(false);
  // Some browsers (iOS, some Android versions) only give compass data after
  // the user allows it from a tap. The button is shown only when no reading
  // arrives on its own, so phones that don't need it skip the extra tap.
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionTries, setPermissionTries] = useState(0);
  const [trail, setTrail] = useState([origin]);
  // trend: "closer" | "away" | null, measured against the distance at `anchor`.
  const [progress, setProgress] = useState({ anchor: haversineMeters(origin.lat, origin.lon, target.lat, target.lon), trend: null });
  const announcedArrival = useRef(false);

  useEffect(() => {
    if (!follow || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        if (p.coords.accuracy > MAX_ACCURACY_M) return;
        const next = { lat: p.coords.latitude, lon: p.coords.longitude };
        setPos(next);
        setTrail((prev) => {
          const last = prev[prev.length - 1];
          if (haversineMeters(last.lat, last.lon, next.lat, next.lon) < TRAIL_STEP_M) return prev;
          return [...prev.slice(-(MAX_TRAIL_POINTS - 1)), next];
        });
        const d = haversineMeters(next.lat, next.lon, target.lat, target.lon);
        setProgress((prev) => {
          if (Math.abs(d - prev.anchor) < TREND_STEP_M) return prev;
          const trend = d < prev.anchor ? "closer" : "away";
          if (trend === "away" && prev.trend !== "away") navigator.vibrate?.([120, 80, 120]);
          return { anchor: d, trend };
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [follow]); // eslint-disable-line react-hooks/exhaustive-deps -- target is fixed per Compass (keyed by shelter id)

  useEffect(() => {
    const eventName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    let gotReading = false;
    const onOrientation = (event) => {
      const h = headingFrom(event);
      if (h === null) return;
      gotReading = true;
      setNoSensor(false);
      setNeedsPermission(false);
      setHeading((prev) => {
        if (prev === null) return h;
        const delta = turn(prev, h);
        return Math.abs(delta) < 1 ? prev : prev + delta;
      });
    };
    window.addEventListener(eventName, onOrientation);
    const timer = setTimeout(() => {
      if (gotReading) return;
      const canAsk = typeof window.DeviceOrientationEvent?.requestPermission === "function";
      if (canAsk && permissionTries === 0) setNeedsPermission(true);
      else setNoSensor(true);
    }, SENSOR_WAIT_MS);
    return () => {
      window.removeEventListener(eventName, onOrientation);
      clearTimeout(timer);
    };
  }, [permissionTries]);

  async function enableCompass() {
    try {
      await window.DeviceOrientationEvent.requestPermission();
    } catch {}
    // Listen again either way; without a reading the card falls back to north.
    setNeedsPermission(false);
    setPermissionTries((n) => n + 1);
  }

  const bearing = bearingDegrees(pos.lat, pos.lon, target.lat, target.lon);
  const distance = haversineMeters(pos.lat, pos.lon, target.lat, target.lon);
  const rotation = heading === null ? bearing : bearing - heading;
  const arrived = distance <= ARRIVED_M;

  useEffect(() => {
    if (!arrived || announcedArrival.current) return;
    announcedArrival.current = true;
    navigator.vibrate?.([200, 100, 200]);
    beep();
  }, [arrived]);

  return (
    <>
    <div className="card compass">
      <h3>{c.offline}</h3>
      {arrived ? (
        <div className="arrived" role="status">
          <b>{c.arrived}</b>
          <span className="arrived-dist">
            <bdi dir="ltr">{formatDistance(distance)}</bdi>
          </span>
          <p>{signText}</p>
        </div>
      ) : (
        progress.trend && (
          <div className={`trend ${progress.trend}`} role="status">
            <b>
              {progress.trend === "closer" ? "▲" : "▼"} {progress.trend === "closer" ? c.closer : c.away}
            </b>
            <span className="trend-dist">
              <bdi dir="ltr">{formatDistance(distance)}</bdi>
            </span>
            {progress.trend === "away" && <span>{c.awayHint}</span>}
          </div>
        )
      )}
      <div className="compass-dial" aria-hidden="true">
        <span className="compass-n">N</span>
        <span className="tick e" />
        <span className="tick s" />
        <span className="tick w" />
        <svg className="compass-needle" viewBox="0 0 40 82" style={{ transform: `rotate(${rotation}deg)` }}>
          <path d="M20 0 L38 76 L20 62 L2 76 Z" />
        </svg>
        <span className="compass-hub" />
      </div>
      <p className="compass-reading">
        <bdi dir="ltr">{formatDistance(distance)}</bdi>
      </p>
      <p className="compass-dir">{c.dirs[compassPoint(bearing)]}</p>
      {needsPermission ? (
        <button type="button" className="btn-outline" onClick={enableCompass}>
          {c.enable}
        </button>
      ) : (
        <p className="note">{noSensor && heading === null ? c.noSensor : c.hint}</p>
      )}
    </div>
    {follow && <Trail trail={trail} pos={pos} target={target} c={c} />}
    </>
  );
}

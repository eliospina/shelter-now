"use client";

import { useEffect, useState } from "react";
import Icon from "./icons";
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

// Smallest signed turn from angle a to angle b, in -180..180.
function turn(a, b) {
  return ((((b - a) % 360) + 540) % 360) - 180;
}

// An arrow to the target that works without internet: GPS for the position,
// the magnetometer for which way the phone points. Without a compass sensor
// the arrow is drawn relative to north instead, and the card says so.
// `follow` keeps the position updated while walking; off in demo mode,
// where the origin is Stockholm C and not the phone's real position.
export default function Compass({ lang, origin, follow, target }) {
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

  useEffect(() => {
    if (!follow || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [follow]);

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

  return (
    <div className="card compass">
      <b>
        <Icon name="compass" /> {c.title}
      </b>
      <div className="compass-dial" aria-hidden="true">
        {heading === null && <span className="compass-n">N</span>}
        <svg className="compass-arrow" viewBox="0 0 100 100" style={{ transform: `rotate(${rotation}deg)` }}>
          <path d="M50 8 L76 84 L50 68 L24 84 Z" />
        </svg>
      </div>
      <p className="compass-reading">
        <span dir="ltr">{formatDistance(distance)}</span> · {c.dirs[compassPoint(bearing)]}
      </p>
      {needsPermission ? (
        <button type="button" className="compass-enable" onClick={enableCompass}>
          {c.enable}
        </button>
      ) : (
        <p className="note">{noSensor && heading === null ? c.noSensor : c.hint}</p>
      )}
    </div>
  );
}

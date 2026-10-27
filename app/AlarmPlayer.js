"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./icons";

// The rhythm of each outdoor alarm, in seconds, as MCF describes it. Same
// order as UI[lang].alarms. The tone itself is synthesized, so it works
// offline and needs no sound files; the card says it is a simplified example.
export const ALARM_PATTERNS = [
  { on: 30, off: 15, total: 300 }, // Beredskapslarm: 30 s signal, 15 s pause, for 5 minutes
  { on: 0.5, off: 0.5, total: 60 }, // Flyglarm: many short signals for 1 minute
];

const TONE_HZ = 480;
const VOLUME = 0.12; // kept low: people try this at home, maybe at night
const RAMP_S = 0.03; // soft edges, so the tone doesn't click

function formatTime(s) {
  const whole = Math.floor(s);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

// Plays one alarm pattern with the Web Audio API. Only one alarm plays at a
// time: starting another stops this one (see `playing` / `onPlay` in the page).
export default function AlarmPlayer({ index, s, playing, onPlay, onStop }) {
  const pattern = ALARM_PATTERNS[index];
  const ctxRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    // Two slightly detuned oscillators through a low-pass filter give a
    // rougher, siren-like tone than a pure beep.
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    filter.connect(gain);
    gain.connect(ctx.destination);
    const oscillators = [TONE_HZ, TONE_HZ * 1.006].map((hz) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = hz;
      osc.connect(filter);
      return osc;
    });

    const start = ctx.currentTime + 0.05;
    gain.gain.setValueAtTime(0, start);
    for (let t = 0; t < pattern.total; t += pattern.on + pattern.off) {
      const end = Math.min(t + pattern.on, pattern.total);
      gain.gain.setValueAtTime(0, start + t);
      gain.gain.linearRampToValueAtTime(VOLUME, start + t + RAMP_S);
      gain.gain.setValueAtTime(VOLUME, start + end - RAMP_S);
      gain.gain.linearRampToValueAtTime(0, start + end);
    }
    oscillators.forEach((osc) => {
      osc.start(start);
      osc.stop(start + pattern.total);
    });

    const timer = setInterval(() => {
      const t = ctx.currentTime - start;
      if (t >= pattern.total) onStop();
      else setElapsed(Math.max(0, t));
    }, 200);

    return () => {
      clearInterval(timer);
      ctx.close().catch(() => {});
      ctxRef.current = null;
      setElapsed(0);
    };
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps -- restart only when play state changes

  const inCycle = elapsed % (pattern.on + pattern.off);
  const sounding = inCycle < pattern.on;

  return (
    <div className="alarm-play">
      <button type="button" className={`alarm-btn ${playing ? "on" : ""}`} onClick={playing ? onStop : onPlay} aria-pressed={playing}>
        <Icon name={playing ? "stop" : "play"} size={18} /> {playing ? s.stop : s.listen}
      </button>
      {playing && (
        <span className="alarm-time" aria-live="off">
          <span className={`alarm-dot ${sounding ? "on" : ""}`} aria-hidden="true" /> {sounding ? s.on : s.off} ·{" "}
          <bdi dir="ltr">
            {formatTime(elapsed)} / {formatTime(pattern.total)}
          </bdi>
        </span>
      )}
    </div>
  );
}

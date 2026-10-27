// Small inline icons (stroke, currentColor), so the app has the same look
// on every phone and needs no icon font or emoji.
const PATHS = {
  // The brand mark: the bunker arch with the arrow pointing down into it.
  arch: (
    <>
      <path d="M5 21v-9a7 7 0 0 1 14 0v9" fill="none" />
      <path d="M12 8v8m-3-3 3 3 3-3" fill="none" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4" r="1.6" />
      <path d="M10.5 21l1.5-6-2.5-2 .8-4.5 2.7-.5 2.2 2.6 2.3.8M9.3 12.3 7 15.5m7-3.3 1.5 2.8 2 5" fill="none" />
    </>
  ),
  bike: (
    <>
      <circle cx="6" cy="16" r="3.5" fill="none" />
      <circle cx="18" cy="16" r="3.5" fill="none" />
      <path d="M6 16l4-7h5l3 7M10 9l2 7h6M14 9l-1.5-3H10" fill="none" />
    </>
  ),
  car: (
    <>
      <path d="M4 15l1.6-5A2 2 0 0 1 7.5 8.5h9a2 2 0 0 1 1.9 1.5L20 15v4h-2v-1.5H6V19H4z" fill="none" />
      <circle cx="7.5" cy="15" r="1.1" />
      <circle cx="16.5" cy="15" r="1.1" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 21 19.5H3z" fill="none" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="16.8" r=".9" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r=".9" />
    </>
  ),
  sound: (
    <>
      <path d="M4 10v4h3l4 3.5v-11L7 10z" fill="none" />
      <path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10" fill="none" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" />,
  cross: <path d="M6.5 6.5l11 11m0-11-11 11" fill="none" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3" fill="none" />
      <circle cx="16.5" cy="9.5" r="2.2" fill="none" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M14.5 18.5a4 4 0 0 1 6 0" fill="none" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" fill="none" />
      <path d="M15.5 8.5 13.6 13.6 8.5 15.5l1.9-5.1z" fill="none" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" fill="none" />
      <circle cx="12" cy="10" r="2.2" fill="none" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" fill="none" />,
  down: <path d="M12 5v14m-6-6 6 6 6-6" fill="none" />,
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />,
  shield: (
    <>
      <path d="M12 3.5 19 6v6c0 4.2-3 7.6-7 8.5-4-.9-7-4.3-7-8.5V6z" fill="none" />
      <path d="M9 12l2 2 4-4" fill="none" />
    </>
  ),
};

// The launcher icon itself (design/icon/h-blagul.svg), so the header matches
// what people see on their home screen.
export function BrandMark({ size = 46 }) {
  return (
    <svg className="brandmark" width={size} height={size} viewBox="0 0 512 512" aria-hidden="true" focusable="false">
      <rect width="512" height="512" rx="120" fill="#0b5c96" />
      <path d="M104 400 V266 A152 152 0 0 1 408 266 V400 Z" fill="#fecc02" />
      <path d="M176 400 V278 A80 80 0 0 1 336 278 V400 Z" fill="#0b5c96" />
      <path d="M256 222 V334 M216 296 L256 336 L296 296" fill="none" stroke="#fdf6ec" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Icon({ name, size = 22, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

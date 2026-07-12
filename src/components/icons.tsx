// Brand mark: a minimal soccer-ball glyph used in the Header/Footer logo badge
// in place of the plain "YP" text (no source logo file exists yet — this is a
// designed placeholder, swap for a real logo file if/when the client has one).
export function LogoMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 6.7l3.2 2.3-1.2 3.7h-4l-1.2-3.7L12 6.7z" fill="currentColor" />
      <path
        d="M12 6.7V3.6M15.2 9l2.8-1.4M14 12.7l1.8 3M10 12.7l-1.8 3M8.8 9L6 7.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.6 5.1A9.9 9.9 0 0112 5c6 0 9.5 7 9.5 7a17.7 17.7 0 01-3.2 4.1M6.7 6.7C4.2 8.4 2.5 12 2.5 12s3.5 7 9.5 7a9 9 0 004.3-1.1"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 10a3 3 0 004.1 4.1" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 011-1h0a1 1 0 011 1v4a1 1 0 001 1h4a1 1 0 001-1V10" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function PlusCircleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function ClipboardCheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="5" y="4" width="14" height="17" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1M9 12l2 2 4-4" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A2.5 2.5 0 016.5 3H20v15.5H6.5A2.5 2.5 0 004 16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5V16a2.5 2.5 0 002.5 2.5H20V21H6.5A2.5 2.5 0 014 18.5v-13z" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="8" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20a6 6 0 0112 0M15 8a3 3 0 110-6M21 20a6 6 0 00-6.5-6" />
    </svg>
  );
}

export function HeartPulseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-7.5-4.6-9.7-9.1C.7 8 2 4.7 5.2 4.1c2-.4 3.6.6 4.8 2.2C11.2 4.7 12.8 3.7 14.8 4.1c3.2.6 4.5 3.9 2.9 7.3-.5 1-1.2 2-2 2.9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 13h4l1.5-3L10 16l2-6 1.5 3H22" />
    </svg>
  );
}

export function CurrencyIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.5c0-1 1-1.8 3-1.8s3 .8 3 1.8-1 1.6-3 1.8c-2 .2-3 .8-3 1.8s1 1.9 3 1.9 3-.8 3-1.9M12 5.5v13" />
    </svg>
  );
}

export function TagIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.3 3H5a2 2 0 00-2 2v6.3c0 .5.2 1 .6 1.4l9 9c.8.8 2 .8 2.8 0l6.3-6.3c.8-.8.8-2 0-2.8l-9-9c-.4-.4-.9-.6-1.4-.6z" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChartBarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function NewspaperIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h13a2 2 0 012 2v12a1.5 1.5 0 01-1.5 1.5H6a2 2 0 01-2-2V5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a2 2 0 00-2 2v10a1.5 1.5 0 001.5 1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h9M7 11h9M7 14h5" />
    </svg>
  );
}

export function MegaphoneIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10v4a1 1 0 001 1h2l4 4v-6M3 10l4-1V6l-4 1v3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9l12-4v14L7 15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 10a2 2 0 010 4" />
    </svg>
  );
}

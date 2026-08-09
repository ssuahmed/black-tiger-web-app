/** Deterministic SVG icons for checkout (no emoji). */

function baseProps(className, title, rest) {
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  return { className: ["inline-block shrink-0", className].filter(Boolean).join(" "), ...a11y, ...rest };
}

export function BagIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path
        d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <rect x="5" y="11" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path
        d="M8.1 3.5 10 8.2 7.7 9.7c1.4 3 3.7 5.3 6.7 6.7l1.5-2.3 4.7 1.9-.5 3.3c-.2 1-1.1 1.7-2.1 1.7C9.7 21 3 14.3 3 6c0-1 .7-1.9 1.7-2.1l3.4-.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 3v5m-2.5-2.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CrosshairIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function BuildingIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 10h5a1 1 0 0 1 1 1v10M8 8h2M8 12h2M8 16h2M17 14h1M17 17h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function VerifiedIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12.2l2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CardMethodIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ApplePayMethodIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.2 10.1c0-.7.4-1.3.9-1.6-.1-.2-.5-.8-1.3-.8-.7 0-1.3.4-1.6.4-.5 0-1-.4-1.6-.4-1.2 0-2.3 1.1-2.3 2.8 0 1.7 1.1 3.7 2.2 3.7.5 0 .8-.3 1.4-.3s.9.3 1.4.3c1.1 0 1.8-1.7 1.8-1.7s-1.1-.4-1.1-1.7c0-1.1.8-1.4.9-1.5-.5-.7-1.2-.8-1.3-.8.5-.5 1.1-.4 1.3-.4.4 0 .7.1 1 0zM10.1 7.6c.3-.3.5-.8.4-1.3-.4 0-.9.3-1.2.6-.3.3-.5.8-.4 1.2.5.1.9-.2 1.2-.5z"
        fill="currentColor"
        transform="translate(6.5 2.5) scale(0.85)"
      />
    </svg>
  );
}

export function CodMethodIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <rect x="3" y="7" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 11h4M7 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function WireMethodIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 15l3 2-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoreIcon({ className = "", title, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title, rest)}>
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

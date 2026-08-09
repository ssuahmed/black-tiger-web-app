/** Account sidebar nav icons (inline SVG). */

function baseProps(className, title) {
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  return { className: ["acc-nav-icon", className].filter(Boolean).join(" "), ...a11y };
}

export function OrdersIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <path
        d="M4.5 8.5 12 4l7.5 4.5v9L12 22l-7.5-4.5v-9Z"
        stroke="#8B6914"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4.5 8.5 12 13l7.5-4.5M12 13v9" stroke="#8B6914" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ReturnsIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <path
        d="M7 8H4.5A7.5 7.5 0 1 1 4.8 16.5"
        stroke="#2F9E6B"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M7 8 4.5 5.5M7 8 4.5 10.5" stroke="#2F9E6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CreditsIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <rect x="3.5" y="6" width="17" height="13" rx="2.5" fill="#E11D48" />
      <path d="M3.5 10.5h17" stroke="#fff" strokeWidth="1.4" opacity="0.35" />
      <circle cx="17.5" cy="15.5" r="3.2" fill="#fff" />
      <path d="M17.5 14v3M16 15.5h3" stroke="#E11D48" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ListsIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <circle cx="12" cy="12" r="9" stroke="#C4C4C4" strokeWidth="1.4" />
      <path
        d="M12 7.8c-1.4-1.5-3.7-1.2-4.7.5-1 1.7-.2 3.8 1.4 5.3L12 16.8l3.3-3.2c1.6-1.5 2.4-3.6 1.4-5.3-1-1.7-3.3-2-4.7-.5Z"
        fill="#F5C518"
        stroke="#E0A800"
        strokeWidth="0.6"
      />
    </svg>
  );
}

export function ProfileIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="1.4" />
      <circle cx="12" cy="10" r="3" stroke="#9CA3AF" strokeWidth="1.4" />
      <path d="M7 18.2c1.2-2 2.9-3 5-3s3.8 1 5 3" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function AddressesIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <path
        d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.5" r="2.2" stroke="#6B7280" strokeWidth="1.5" />
    </svg>
  );
}

export function PaymentsIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <rect x="3" y="6.5" width="18" height="12" rx="2" stroke="#8B6914" strokeWidth="1.5" />
      <path d="M3 10.5h18" stroke="#8B6914" strokeWidth="1.5" />
      <path d="M7 15h4" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NotificationsIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <path
        d="M6.5 16.5h11l-1.2-1.5V11a4.3 4.3 0 1 0-8.6 0v4L6.5 16.5Z"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 18.5a2 2 0 0 0 4 0" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SecurityIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <path
        d="M12 3.5 19 6.5v5.2c0 4.4-2.9 7.6-7 8.8-4.1-1.2-7-4.4-7-8.8V6.5L12 3.5Z"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.2" r="2" fill="#F5C518" stroke="#E0A800" strokeWidth="0.5" />
      <path d="M9.8 15c.8-1.2 1.8-1.8 3.2-1.8s2.4.6 3.2 1.8" stroke="#F5C518" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SignOutIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <path
        d="M12 4.5v7.5M8.2 6.3a6.5 6.5 0 1 0 7.6 0"
        stroke="#6B7280"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WireTransferIcon({ className = "", title }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...baseProps(className, title)}>
      <rect x="3.5" y="6" width="17" height="12" rx="2" stroke="#BE123C" strokeWidth="1.5" />
      <path d="M3.5 10h17" stroke="#BE123C" strokeWidth="1.5" />
      <path d="M8 14h4.5M15.5 14h2" stroke="#BE123C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

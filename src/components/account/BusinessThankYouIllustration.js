/** Decorative laptop + verification cycle for the business thank-you hero. */
export default function BusinessThankYouIllustration({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Soft orbit */}
      <circle cx="210" cy="200" r="118" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 6" />

      {/* Incoming data stripes (right) */}
      <g strokeWidth="2.5" strokeLinecap="round">
        <line x1="360" y1="118" x2="500" y2="118" stroke="#e90106" />
        <line x1="380" y1="138" x2="500" y2="138" stroke="#ffffff" />
        <line x1="400" y1="158" x2="500" y2="158" stroke="#7ec8e8" />
        <line x1="420" y1="178" x2="500" y2="178" stroke="#e90106" />
        <line x1="390" y1="198" x2="500" y2="198" stroke="#ffffff" />
        <line x1="410" y1="218" x2="500" y2="218" stroke="#7ec8e8" />
        <line x1="430" y1="238" x2="500" y2="238" stroke="#e90106" />
      </g>

      {/* Laptop body */}
      <rect x="118" y="108" width="248" height="168" rx="10" stroke="#ffffff" strokeWidth="2.5" />
      <rect x="132" y="122" width="220" height="140" rx="4" fill="#0b1c2e" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <path d="M96 292h292c8 0 14 6 14 14v10H82v-10c0-8 6-14 14-14z" stroke="#ffffff" strokeWidth="2.5" fill="none" />
      <rect x="200" y="300" width="84" height="6" rx="2" fill="rgba(255,255,255,0.35)" />

      {/* Cycle arrows around ellipsis */}
      <path
        d="M188 168c18-28 62-36 92-18"
        stroke="#e90106"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M276 146l8 20 18-10" fill="#e90106" />
      <path
        d="M296 230c-18 28-62 36-92 18"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M208 252l-8-20-18 10" fill="#ffffff" />

      <circle cx="230" cy="198" r="5" fill="#e90106" />
      <circle cx="248" cy="198" r="5" fill="#e90106" />
      <circle cx="266" cy="198" r="5" fill="#e90106" />

      {/* Outgoing stripes (down) */}
      <g strokeWidth="2.5" strokeLinecap="round">
        <line x1="168" y1="330" x2="168" y2="410" stroke="#e90106" />
        <line x1="188" y1="340" x2="188" y2="410" stroke="#ffffff" />
        <line x1="208" y1="350" x2="208" y2="410" stroke="#7ec8e8" />
        <line x1="228" y1="335" x2="228" y2="410" stroke="#e90106" />
        <line x1="248" y1="345" x2="248" y2="410" stroke="#ffffff" />
        <line x1="268" y1="355" x2="268" y2="410" stroke="#7ec8e8" />
        <line x1="288" y1="340" x2="288" y2="410" stroke="#e90106" />
      </g>
    </svg>
  );
}

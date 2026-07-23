"use client";

import { OPEN_ASK_AI_EVENT } from "@/components/chat/askAiEvents";

function ArrowRightIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Homepage hero CTA that opens the full-screen Ask AI overlay.
 * @param {{ label?: string; className?: string; style?: import('react').CSSProperties }} props
 */
export default function HomeAskAiButton({
  label = "Ask AI",
  className = "btn btn-primary font-magistral inline-flex items-center gap-2 text-2xl no-underline",
  style,
}) {
  function openAskAi(e) {
    e.preventDefault();
    if (typeof window === "undefined") return;
    window.location.hash = "ask-ai";
    window.dispatchEvent(new Event(OPEN_ASK_AI_EVENT));
  }

  return (
    <button type="button" className={className} style={style} onClick={openAskAi}>
      {label}
      <ArrowRightIcon className="h-4 w-4" />
    </button>
  );
}

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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Header Ask AI — desktop only; mobile uses the bottom FAB. */
export default function HeaderAskAiButton() {
  function openAskAi() {
    if (typeof window === "undefined") return;
    window.location.hash = "ask-ai";
    window.dispatchEvent(new Event(OPEN_ASK_AI_EVENT));
  }

  return (
    <button
      type="button"
      className="site-header__ask-ai max-lg:!hidden"
      aria-label="Ask AI"
      onClick={openAskAi}
    >
      <span>Ask AI</span>
      <ArrowRightIcon className="site-header__ask-ai-icon" />
    </button>
  );
}

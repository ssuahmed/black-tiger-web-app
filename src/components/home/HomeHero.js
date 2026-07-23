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

/** Homepage section 1 — headline top-left, Ask AI top-right (Figma) */
export default function HomeHero() {
  function openAskAi(e) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.location.hash = "ask-ai";
      window.dispatchEvent(new Event(OPEN_ASK_AI_EVENT));
    }
  }

  return (
    <div className="home-hero__bar">
      <h1 className="home-hero__title">
        <span className="home-hero__title-line">The High-End</span>
        <span className="home-hero__title-line">Lubricants</span>
      </h1>

      <a href="#ask-ai" className="home-hero__ask-ai" onClick={openAskAi}>
        <span>Ask AI</span>
        <ArrowRightIcon className="home-hero__ask-ai-icon" />
      </a>
    </div>
  );
}

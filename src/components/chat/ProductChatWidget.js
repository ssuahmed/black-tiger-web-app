"use client";

import { useEffect, useId, useRef, useState } from "react";
import ProductCard from "@/components/catalog/ProductCard";
import { OPEN_ASK_AI_EVENT } from "@/components/chat/askAiEvents";
import { CommerceApiError } from "@/lib/api/client";
import * as chatApi from "@/lib/api/chat";

/**
 * @typedef {{ id: string; role: 'user' | 'assistant'; text: string; products?: Array<Record<string, unknown>> }} ChatBubble
 */

const EMPTY_PROMPT = "May I ask what type of lubricant you are looking for?";

function PlusIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function MicIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WaveSubmitIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 12h2l1.5-4 2 8L12 8l1.5 6 2-4H20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export { OPEN_ASK_AI_EVENT };

export default function ProductChatWidget() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [usageHint, setUsageHint] = useState("");
  /** @type {[ChatBubble[], Function]} */
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const hasConversation = messages.length > 0;

  useEffect(() => {
    function openAssistant() {
      setOpen(true);
    }
    function onHash() {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#ask-ai") openAssistant();
    }
    window.addEventListener(OPEN_ASK_AI_EVENT, openAssistant);
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => {
      window.removeEventListener(OPEN_ASK_AI_EVENT, openAssistant);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") closeOverlay();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open || sessionId) return;
    let alive = true;
    (async () => {
      try {
        const res = await chatApi.createChatSession({});
        if (!alive) return;
        if (res?.sessionId) setSessionId(String(res.sessionId));
      } catch {
        /* session optional */
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, sessionId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, busy]);

  function closeOverlay() {
    setOpen(false);
    if (typeof window !== "undefined" && window.location.hash === "#ask-ai") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  async function sendMessage(e) {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError("");
    const userId = `u-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userId, role: "user", text, products: [] }]);
    setBusy(true);
    try {
      const res = await chatApi.postChatMessage({
        message: text,
        sessionId: sessionId || undefined,
      });
      if (res?.sessionId && res.sessionId !== sessionId) {
        setSessionId(String(res.sessionId));
      }
      if (res?.usage && typeof res.usage.remaining === "number") {
        const who = res.usage.identity === "user" ? "account" : "guest";
        setUsageHint(`${res.usage.remaining} of ${res.usage.limit} ${who} messages left today`);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: String(res?.reply ?? "How else can I help?"),
          products: Array.isArray(res?.products) ? res.products : [],
        },
      ]);
    } catch (err) {
      const msg =
        err instanceof CommerceApiError ? err.message : "Chat is temporarily unavailable.";
      setError(msg);
      if (
        err instanceof CommerceApiError &&
        (err.status === 429 || err.code === "CHAT_DAILY_LIMIT" || err.code === "CHAT_BURST_LIMIT")
      ) {
        setUsageHint("Message limit reached");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!open) return <div id="ask-ai" className="sr-only" aria-hidden />;

  return (
    <div
      id={panelId}
      className="ask-ai-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Ask AI"
    >
      <div id="ask-ai" className="ask-ai-overlay__shell">
        <button type="button" className="ask-ai-overlay__close" aria-label="Close Ask AI" onClick={closeOverlay}>
          <CloseIcon className="h-5 w-5" />
        </button>

        <div ref={listRef} className="ask-ai-overlay__stage">
          {!hasConversation ? (
            <p className="ask-ai-overlay__prompt">{EMPTY_PROMPT}</p>
          ) : (
            <div className="ask-ai-overlay__thread">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user" ? "ask-ai-overlay__row ask-ai-overlay__row--user" : "ask-ai-overlay__row"
                  }
                >
                  <div
                    className={
                      m.role === "user"
                        ? "ask-ai-overlay__bubble ask-ai-overlay__bubble--user"
                        : "ask-ai-overlay__bubble"
                    }
                  >
                    {m.text}
                  </div>
                  {m.products?.length ? (
                    <div className="ask-ai-overlay__products">
                      {m.products.map((product) => (
                        <ProductCard key={String(product.slug)} product={product} variant="compact" />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {busy ? <p className="ask-ai-overlay__status">Thinking…</p> : null}
              {error ? <p className="ask-ai-overlay__error">{error}</p> : null}
            </div>
          )}
        </div>

        <form className="ask-ai-overlay__composer" onSubmit={sendMessage}>
          <div className="ask-ai-overlay__pill">
            <button type="button" className="ask-ai-overlay__icon-btn" aria-label="Add attachment" disabled>
              <PlusIcon className="h-5 w-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              className="ask-ai-overlay__input"
              placeholder="Ask Anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              aria-label="Ask Anything"
              autoComplete="off"
            />
            <button type="button" className="ask-ai-overlay__icon-btn" aria-label="Voice input" disabled>
              <MicIcon className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="ask-ai-overlay__send"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <WaveSubmitIcon className="h-4 w-4" />
            </button>
          </div>
          {usageHint ? <p className="ask-ai-overlay__hint">{usageHint}</p> : null}
        </form>
      </div>
    </div>
  );
}

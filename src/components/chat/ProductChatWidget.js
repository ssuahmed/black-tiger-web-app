"use client";

/**
 * Site-wide Ask AI overlay: opens via `bt:open-ask-ai` or `#ask-ai` hash,
 * creates an optional chat session, posts messages to `/v1/chat/messages`,
 * and renders assistant replies (with product cards) plus daily usage hints.
 */

import { useEffect, useId, useRef, useState } from "react";
import ProductCard from "@/components/catalog/ProductCard";
import { OPEN_ASK_AI_EVENT } from "@/components/chat/askAiEvents";
import BrandLogo from "@/components/ui/BrandLogo";
import { CommerceApiError } from "@/lib/api/client";
import * as chatApi from "@/lib/api/chat";

/**
 * @typedef {{ id: string; role: 'user' | 'assistant'; text: string; products?: Array<Record<string, unknown>> }} ChatBubble
 */

const EMPTY_PROMPT = "May I ask what type of lubricant you are looking for?";

function SendIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3.4 20.6 21 12 3.4 3.4l.1 6.6L15 12 3.5 14z" />
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

/**
 * Reveals assistant text with a typing effect.
 * @param {{
 *   text: string;
 *   animate?: boolean;
 *   onTick?: () => void;
 *   onDone?: () => void;
 * }} props
 */
function TypingBubble({ text, animate = true, onTick, onDone }) {
  const full = String(text || "");
  const [visibleCount, setVisibleCount] = useState(animate ? 0 : full.length);
  const onTickRef = useRef(onTick);
  const onDoneRef = useRef(onDone);
  onTickRef.current = onTick;
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!animate) {
      setVisibleCount(full.length);
      return undefined;
    }
    setVisibleCount(0);
    if (!full.length) {
      onDoneRef.current?.();
      return undefined;
    }

    let index = 0;
    /** @type {number} */
    let timer = 0;
    const step = () => {
      index += 1;
      setVisibleCount(index);
      onTickRef.current?.();
      if (index >= full.length) {
        onDoneRef.current?.();
        return;
      }
      const ch = full[index - 1];
      const delay = ch === "\n" ? 40 : ch === " " ? 18 : 14 + Math.floor(Math.random() * 10);
      timer = window.setTimeout(step, delay);
    };
    timer = window.setTimeout(step, 40);
    return () => window.clearTimeout(timer);
  }, [full, animate]);

  const typing = animate && visibleCount < full.length;

  return (
    <div className={typing ? "ask-ai-overlay__bubble ask-ai-overlay__bubble--typing" : "ask-ai-overlay__bubble"}>
      {full.slice(0, visibleCount)}
    </div>
  );
}

/**
 * @param {{
 *   message: ChatBubble;
 *   animateTyping?: boolean;
 *   onTypingTick?: () => void;
 *   onProductNavigate?: () => void;
 * }} props
 */
function ChatMessage({ message, animateTyping = false, onTypingTick, onProductNavigate }) {
  const [showProducts, setShowProducts] = useState(!(animateTyping && message.role === "assistant"));
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "ask-ai-overlay__row ask-ai-overlay__row--user" : "ask-ai-overlay__row"}>
      {isUser ? (
        <div className="ask-ai-overlay__bubble ask-ai-overlay__bubble--user">{message.text}</div>
      ) : (
        <TypingBubble
          text={message.text}
          animate={animateTyping}
          onTick={onTypingTick}
          onDone={() => setShowProducts(true)}
        />
      )}
      {showProducts && message.products?.length ? (
        <div
          className="ask-ai-overlay__products"
          key={`products-${message.id}`}
          onClick={(e) => {
            if (e.target instanceof Element && e.target.closest("a[href]")) {
              onProductNavigate?.();
            }
          }}
        >
          {message.products.map((product) => (
            <ProductCard key={String(product.slug)} product={product} variant="compact" />
          ))}
        </div>
      ) : null}
    </div>
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
  const [typingMessageId, setTypingMessageId] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRaf = useRef(0);

  const hasConversation = messages.length > 0;

  function scrollToBottom() {
    const el = listRef.current;
    if (!el) return;
    if (scrollRaf.current) window.cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = window.requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }

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
    const html = document.documentElement;
    const { body } = document;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyPaddingRight: body.style.paddingRight,
    };
    const scrollbarGap = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }
    html.classList.add("ask-ai-open");

    const onKey = (e) => {
      if (e.key === "Escape") closeOverlay();
    };
    const onWheel = (e) => {
      const stage = listRef.current;
      if (stage && stage.contains(/** @type {Node} */ (e.target))) return;
      e.preventDefault();
    };
    const onTouchMove = (e) => {
      const stage = listRef.current;
      if (stage && stage.contains(/** @type {Node} */ (e.target))) return;
      e.preventDefault();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      body.style.paddingRight = prev.bodyPaddingRight;
      html.classList.remove("ask-ai-open");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
      window.clearTimeout(t);
    };
  }, [open]);

  // Best-effort session create on first open; messaging still works if this fails.
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
    scrollToBottom();
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
      // Server may mint/replace the session id on the first message.
      if (res?.sessionId && res.sessionId !== sessionId) {
        setSessionId(String(res.sessionId));
      }
      if (res?.usage && typeof res.usage.remaining === "number") {
        const who = res.usage.identity === "user" ? "account" : "guest";
        setUsageHint(`${res.usage.remaining} of ${res.usage.limit} ${who} messages left today`);
      }
      const assistantId = `a-${Date.now()}`;
      setTypingMessageId(assistantId);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
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
        <div className="ask-ai-overlay__top">
          <div className="ask-ai-overlay__brand">
            <BrandLogo className="ask-ai-overlay__logo" />
          </div>
          <button type="button" className="ask-ai-overlay__close" aria-label="Close Ask AI" onClick={closeOverlay}>
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={listRef}
          className={hasConversation ? "ask-ai-overlay__stage" : "ask-ai-overlay__stage ask-ai-overlay__stage--empty"}
        >
          {!hasConversation ? (
            <p className="ask-ai-overlay__prompt">{EMPTY_PROMPT}</p>
          ) : (
            <div className="ask-ai-overlay__thread">
              {messages.map((m) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  animateTyping={m.role === "assistant" && m.id === typingMessageId}
                  onTypingTick={scrollToBottom}
                  onProductNavigate={closeOverlay}
                />
              ))}
              {busy ? (
                <div className="ask-ai-overlay__row" aria-live="polite" aria-label="Assistant is responding">
                  <div className="ask-ai-overlay__thinking" role="status">
                    <span className="ask-ai-overlay__thinking-dot" />
                    <span className="ask-ai-overlay__thinking-dot" />
                    <span className="ask-ai-overlay__thinking-dot" />
                  </div>
                </div>
              ) : null}
              {error ? <p className="ask-ai-overlay__error">{error}</p> : null}
            </div>
          )}
        </div>

        <form className="ask-ai-overlay__composer" onSubmit={sendMessage}>
          <div className="ask-ai-overlay__pill">
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
            <button
              type="submit"
              className="ask-ai-overlay__send"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <SendIcon className="ask-ai-overlay__send-icon" />
            </button>
          </div>
          {usageHint ? <p className="ask-ai-overlay__hint">{usageHint}</p> : null}
        </form>
      </div>
    </div>
  );
}

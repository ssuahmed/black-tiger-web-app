"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

export default function Modal({ open, onClose, title, children, footer, labelledBy }) {
  const autoId = useId();
  const titleId = labelledBy ?? `${autoId}-title`;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (alive) setMounted(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="modal-root" role="presentation">
      <button type="button" className="modal-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
        <div className="modal-dialog__header">
          {title ? (
            <h2 id={titleId} className="font-magistral modal-dialog__title ">
              {title}
            </h2>
          ) : null}
          <Button type="button" variant="ghost" className="modal-dialog__close" onClick={onClose} aria-label="Close">
            ×
          </Button>
        </div>
        <div className="modal-dialog__body">{children}</div>
        {footer ? <div className="modal-dialog__footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
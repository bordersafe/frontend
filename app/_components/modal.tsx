"use client";

/**
 * Accessible Modal component.
 * - Focus trap: keeps keyboard focus inside the dialog while open.
 * - Escape key: closes the modal.
 * - ARIA: role="dialog", aria-modal, aria-labelledby.
 * - Backdrop click: closes the modal (optional, enabled by default).
 *
 * Usage:
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="My Modal">
 *     <p>Content here</p>
 *   </Modal>
 */

import {
  type ReactNode,
  useEffect,
  useRef,
  useCallback,
  useId,
} from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Optional subtitle rendered below the title */
  subtitle?: string;
  children: ReactNode;
  /** Maximum width class for the dialog panel (default: max-w-2xl) */
  maxWidth?: string;
  /** Whether a click on the dark backdrop closes the modal (default: true) */
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleKeyDown);
    // Move focus into the dialog
    const first = dialogRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();

    // Prevent body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`panel relative z-10 w-full ${maxWidth} p-6 shadow-2xl reveal-up`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="heading-2 mt-1">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-(--ink-muted)">{subtitle}</p>
            )}
          </div>
          <button
            className="btn-ghost flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted) hover:text-foreground"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18 18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

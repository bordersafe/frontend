"use client";

/**
 * ConfirmDialog — replaces all uses of window.confirm() with a styled,
 * accessible, and design-system-consistent confirmation modal.
 *
 * Usage (imperative pattern via hook):
 *   const { confirm, ConfirmDialogComponent } = useConfirm();
 *
 *   const handleDelete = async () => {
 *     const ok = await confirm({
 *       title: "Delete bank account?",
 *       description: "This action cannot be undone.",
 *       confirmLabel: "Delete",
 *       variant: "danger",
 *     });
 *     if (!ok) return;
 *     await deleteAccount();
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleDelete}>Delete</button>
 *       <ConfirmDialogComponent />
 *     </>
 *   );
 */

import { type ReactNode, useCallback, useRef, useState } from "react";
import { Modal } from "./modal";

type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
};

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleClose = useCallback(
    (value: boolean) => {
      state?.resolve(value);
      setState(null);
    },
    [state],
  );

  const confirmLabel = state?.confirmLabel ?? "Confirm";
  const cancelLabel = state?.cancelLabel ?? "Cancel";
  const variant = state?.variant ?? "default";

  const confirmBtnClass =
    variant === "danger"
      ? "btn-danger px-5 py-2.5 text-sm"
      : variant === "warning"
        ? "btn-outline px-5 py-2.5 text-sm border-(--warning) text-(--warning)"
        : "btn-primary px-5 py-2.5 text-sm";

  const ConfirmDialogComponent = state ? (
    <Modal
      isOpen={true}
      onClose={() => handleClose(false)}
      title={state.title}
      maxWidth="max-w-md"
      closeOnBackdrop={false}
    >
      {state.description && (
        <p className="text-sm text-(--ink-muted)">{state.description}</p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          className="btn-outline px-5 py-2.5 text-sm"
          onClick={() => handleClose(false)}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className={confirmBtnClass}
          onClick={() => handleClose(true)}
          type="button"
          autoFocus
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  ) : null;

  return { confirm, ConfirmDialogComponent };
}

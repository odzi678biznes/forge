import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNativeBack } from '@/platform/back-navigation';

/** Native top layer supplies inert background, focus containment and Escape. */
export function ModalPanel({ label, className = '', onClose, children }: {
  label: string; className?: string; onClose: () => void; children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useNativeBack(() => close.current(), 20);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const element = dialog.current!;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);
  return createPortal(
    <dialog ref={dialog} className={`modal-panel ${className}`} aria-label={label} tabIndex={-1}
      onKeyDown={e => {
        if (e.key !== 'Tab') return;
        const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, textarea, select, summary, [tabindex]'))
          .filter(el => el.tabIndex >= 0 && !el.matches(':disabled') && el.checkVisibility());
        e.preventDefault();
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey ? (index <= 0 ? items.length - 1 : index - 1) : (index + 1) % items.length;
        (items[next] ?? e.currentTarget).focus();
      }}
      onCancel={e => { e.preventDefault(); close.current(); }}>
      {children}
    </dialog>, document.body,
  );
}

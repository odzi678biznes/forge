import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** A single stable action area; forms retain their own validation and submit handlers. */
export function AnswerAction({ disabled = false, onClick, children = 'Sprawdź odpowiedź' }: {
  disabled?: boolean; onClick?: () => void; children?: ReactNode;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => { setTarget(document.getElementById('feed-primary-action')); }, []);
  const button = <button type="button" className="btn btn--primary answer-action" disabled={disabled}
    onClick={() => onClick ? onClick() : anchor.current?.closest('form')?.requestSubmit()}>{children}</button>;
  return <><span ref={anchor} hidden />{target ? createPortal(button, target) : button}</>;
}

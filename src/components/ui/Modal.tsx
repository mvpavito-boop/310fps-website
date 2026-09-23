'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Native modal: focus containment, Escape and restoration belong to the browser. */
export function Modal({ children, label, onClose, testId, wide = false }: {
    children: ReactNode; label: string; onClose: () => void; testId?: string; wide?: boolean;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = ref.current;
        const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        dialog?.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            dialog?.close();
            document.body.style.overflow = previousOverflow;
            if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        };
    }, []);
    return (
        <dialog ref={ref} aria-label={label} data-testid={testId}
            onKeyDown={(event) => {
                if (event.key !== 'Tab') return;
                const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
                    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
                )).filter((element) => element.getClientRects().length > 0);
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (first && last && event.shiftKey && document.activeElement === first) {
                    event.preventDefault(); last.focus();
                } else if (first && last && !event.shiftKey && document.activeElement === last) {
                    event.preventDefault(); first.focus();
                }
            }}
            onCancel={(event) => { event.preventDefault(); onClose(); }}
            onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
            className={`fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-line bg-coal p-0 text-bone shadow-card backdrop:bg-ink/80 backdrop:backdrop-blur-md ${wide ? 'max-w-3xl' : 'max-w-md'}`}
        >
            <div>{children}</div>
        </dialog>
    );
}

import { useEffect, useRef } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelectOnce: () => void;
    onSelectRecurring: () => void;
}

export default function AddSlotPopover({ isOpen, onClose, onSelectOnce, onSelectRecurring }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleOutside(e: MouseEvent | TouchEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        }

        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);
        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div ref={ref} className="slot-popover" role="menu">
            <button
                type="button"
                className="slot-popover__option"
                role="menuitem"
                onClick={() => { onSelectOnce(); onClose(); }}
            >
                <span aria-hidden>📌</span>
                Just once
            </button>
            <button
                type="button"
                className="slot-popover__option"
                role="menuitem"
                onClick={() => { onSelectRecurring(); onClose(); }}
            >
                <span aria-hidden>🔁</span>
                Weekdays
            </button>
        </div>
    );
}

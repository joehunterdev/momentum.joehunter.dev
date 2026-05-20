import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void;
    onSelectOnce: () => void;
    onSelectRecurring: () => void;
}
//test
export default function AddMomentPopover({ isOpen, anchorRef, onClose, onSelectOnce, onSelectRecurring }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    useLayoutEffect(() => {
        if (!isOpen || !anchorRef.current) {
            return;
        }

        const rect = anchorRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX + rect.width / 2,
        });
    }, [isOpen, anchorRef]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleOutside(e: MouseEvent | TouchEvent) {
            if (
                ref.current && !ref.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)
            ) {
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
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen || !coords) {
        return null;
    }

    return createPortal(
        <div
            ref={ref}
            className="slot-popover"
            role="menu"
            style={{ top: coords.top, left: coords.left }}
        >
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
        </div>,
        document.body,
    );
}

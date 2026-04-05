import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PageProps } from '@/types';

export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setMessage({ type: 'success', text: flash.success });
            setVisible(true);
        } else if (flash?.error) {
            setMessage({ type: 'error', text: flash.error });
            setVisible(true);
        } else {
            setVisible(false);
            setMessage(null);
        }
    }, [flash]);

    useEffect(() => {
        if (!visible) {
            return;
        }
        const timer = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timer);
    }, [visible]);

    if (!visible || !message) {
        return null;
    }

    const colours =
        message.type === 'success'
            ? 'bg-green-50 border-green-400 text-green-800'
            : 'bg-red-50 border-red-400 text-red-800';

    return (
        <div
            className={`fixed right-4 top-4 z-50 max-w-sm rounded-md border px-4 py-3 shadow-md transition-opacity duration-300 ${colours}`}
            role="alert"
        >
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{message.text}</p>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="shrink-0 text-current opacity-60 hover:opacity-100"
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

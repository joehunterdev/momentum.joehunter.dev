import { Link } from '@inertiajs/react';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({ title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
            <div className="mb-4 text-5xl">✨</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
            <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                    {actionLabel}
                </button>
            )}
            {actionLabel && actionHref && !onAction && (
                <Link
                    href={actionHref}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

interface StreakBadgeProps {
    count: number;
}

export default function StreakBadge({ count }: StreakBadgeProps) {
    if (count === 0) {
        return <span className="text-xs text-gray-400">0</span>;
    }

    return (
        <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-orange-500">
            🔥 {count}
        </span>
    );
}

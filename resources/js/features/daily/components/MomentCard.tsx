import axios from 'axios';
import { useState } from 'react';
import { DailyMoment } from '../types';
import StreakBadge from './StreakBadge';

interface MomentCardProps {
    moment: DailyMoment;
    date: string;
    onToggled: (id: number, completedAt: string | null, instanceId: number | null) => void;
}

export default function MomentCard({ moment, date, onToggled }: MomentCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isCompleted = moment.completed_at !== null;

    const accentStyle = moment.color
        ? { backgroundColor: `${moment.color}18`, borderLeftColor: moment.color, borderLeftWidth: '4px' }
        : {};

    async function handleToggle() {
        if (isLoading) {
            return;
        }

        // Optimistic update — use current timestamp; server response will correct it
        onToggled(
            moment.id,
            isCompleted ? null : new Date().toISOString(),
            moment.instance_id,
        );

        setIsLoading(true);
        try {
            const response = await axios.post(route('moments.toggle', moment.id), { date });
            onToggled(moment.id, response.data.completed_at, response.data.instance_id);
        } catch {
            // Revert optimistic update on error
            onToggled(moment.id, moment.completed_at, moment.instance_id);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all"
            style={accentStyle}
        >
            <div className="flex min-w-0 flex-1 items-center gap-3">
                {moment.icon && (
                    <span className="shrink-0 text-2xl" aria-hidden="true">
                        {moment.icon}
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <p
                        className={`truncate font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                            }`}
                    >
                        {moment.name}
                    </p>
                </div>
            </div>

            <div className="ml-4 flex shrink-0 items-center gap-4">
                <StreakBadge count={moment.streak} />
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={isLoading}
                    aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${isCompleted
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-gray-300 bg-white hover:border-indigo-400'
                        } ${isLoading ? 'opacity-50' : ''}`}
                >
                    {isCompleted && (
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

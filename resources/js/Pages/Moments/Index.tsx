import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/shared/components/FlashMessage';
import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '@/types';
import type { Moment } from '@/features/moments';

interface Props extends PageProps {
    moments: Moment[];
}

function frequencySummary(moment: Moment): string {
    const schedule = moment.schedule;
    if (!schedule) { return 'No schedule'; }

    const { frequency, days_of_week, preferred_time } = schedule;

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayLabels = days_of_week
        ? days_of_week.map((d) => dayNames[d - 1]).join(', ')
        : null;

    const time = preferred_time ?? null;

    if (frequency === 'daily') { return time ? `Daily at ${time}` : 'Every day'; }
    if (frequency === 'weekly') { return dayLabels ? `Weekly — ${dayLabels}${time ? ` at ${time}` : ''}` : 'Weekly'; }
    if (frequency === 'once') { return 'One-time'; }
    if (frequency === 'custom') { return dayLabels ? `Custom — ${dayLabels}` : 'Custom'; }

    return frequency;
}

export default function Index({ moments }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div className="moments-index-header">
                    <h2 className="moments-index-header__title">Moments</h2>
                    <Link href={route('moments.create')} className="moments-index-header__create">
                        + New Moment
                    </Link>
                </div>
            }
        >
            <Head title="Moments" />
            <FlashMessage />

            <div className="py-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    {moments.length === 0 ? (
                        <div className="moments-index-empty">
                            <p className="moments-index-empty__text">You haven't created any moments yet.</p>
                            <Link href={route('moments.create')} className="moments-index-empty__link">
                                Create your first moment →
                            </Link>
                        </div>
                    ) : (
                        <ul className="moments-index-list">
                            {moments.map((moment) => (
                                <li key={moment.id} className="moments-index-list__item">
                                    <Link
                                        href={route('moments.edit', moment.id)}
                                        className="moments-index-list__link"
                                    >
                                        <span className="moments-index-list__icon">
                                            {moment.icon ?? '✦'}
                                        </span>
                                        <div className="moments-index-list__body">
                                            <span className="moments-index-list__name">
                                                {moment.name}
                                            </span>
                                            <span className="moments-index-list__schedule">
                                                {frequencySummary(moment)}
                                            </span>
                                        </div>
                                        <span className="moments-index-list__chevron">›</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

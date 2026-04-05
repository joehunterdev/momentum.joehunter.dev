import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EmptyState from '@/shared/components/EmptyState';
import FlashMessage from '@/shared/components/FlashMessage';
import { formatDate } from '@/shared/utils/dates';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { MomentCard } from '@/features/daily';
import type { DailyMoment } from '@/features/daily';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    date: string;
    moments: DailyMoment[];
}

export default function Index({ date, moments: initialMoments }: Props) {
    const [moments, setMoments] = useState<DailyMoment[]>(initialMoments);

    function handleToggled(id: number, completedAt: string | null, instanceId: number | null) {
        setMoments((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, completed_at: completedAt, instance_id: instanceId } : m,
            ),
        );
    }

    const completedCount = moments.filter((m) => m.completed_at !== null).length;
    const totalCount = moments.length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">{formatDate(date)}</h2>
                    {totalCount > 0 && (
                        <span className="text-sm text-gray-500">
                            {completedCount}/{totalCount} done
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Daily" />
            <FlashMessage />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    {moments.length === 0 ? (
                        <EmptyState
                            title="No moments for today"
                            description="Add your first habit moment to start building your streak."
                            actionLabel="+ Add Moment"
                            actionHref={route('moments.create')}
                        />
                    ) : (
                        <>
                            <div className="space-y-3">
                                {moments.map((moment) => (
                                    <MomentCard
                                        key={moment.id}
                                        moment={moment}
                                        date={date}
                                        onToggled={handleToggled}
                                    />
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Link
                                    href={route('moments.create')}
                                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-5 py-2.5 text-sm font-medium text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-50"
                                >
                                    <span>+</span> New Moment
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

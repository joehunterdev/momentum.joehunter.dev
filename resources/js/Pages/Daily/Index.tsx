import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DailyGrid, DailyProgressBar } from '@/features/daily';
import { Head, router } from '@inertiajs/react';
import { DateSelectorBar } from '@/shared/components/calendar';
import type { PageProps } from '@/types';

interface Props extends PageProps, App.Data.DailyPageData { }

export default function Index({ date, day, config, completedCount, totalCount }: Props) {
    async function handleToggleMoment(
        momentId: number,
        _instanceId: number | null,
        date: string,
    ) {
        const token =
            (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement | null
            )?.content ?? '';

        await fetch(route('moments.toggle', { moment: momentId }), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
                Accept: 'application/json',
            },
            body: JSON.stringify({ date }),
        });

        router.reload({ only: ['day', 'completedCount', 'totalCount'] });
    }

    // Key = "date:time:momentId" — first pending moment of the day
    const nextMomentKey = (() => {
        for (const slot of day.slots) {
            if (slot.moment && slot.moment.status !== 'completed') {
                return `${day.date}:${slot.time}:${slot.moment.id}`;
            }
        }
        return null;
    })();

    return (
        <AuthenticatedLayout
            header={
                <div className="daily-header">
                    <DateSelectorBar mode="day" date={date} />
                    {totalCount > 0 && (
                        <DailyProgressBar
                            completedCount={completedCount}
                            totalCount={totalCount}
                        />
                    )}
                </div>
            }
        >
            <Head title="Daily" />

            <div className="py-0 sm:py-6">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <DailyGrid
                        day={day}
                        config={config}
                        onToggleMoment={handleToggleMoment}
                        nextMomentKey={nextMomentKey}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

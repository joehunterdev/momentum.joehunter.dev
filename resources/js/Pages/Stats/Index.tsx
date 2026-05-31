import { lazy, Suspense } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps } from '@/types';
import {
    RangeSelector,
    StatsSummaryCards,
    HabitGrid,
    HabitBars,
} from '@/features/stats/components';

// Lazy so recharts isn't pulled into the main bundle.
const StatsTrendChart = lazy(() => import('@/features/stats/components/StatsTrendChart'));

interface Props extends PageProps, App.Data.StatsPageData {}

export default function Index({ rangeDays, days, summary, habits, trend }: Props) {
    function setRange(range: number) {
        router.get(route('stats'), { range }, { preserveScroll: true, preserveState: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="stats-header">
                    <h1 className="stats-header__title">Stats</h1>
                    <RangeSelector value={rangeDays} onChange={setRange} />
                </div>
            }
        >
            <Head title="Stats" />

            <div className="py-4 sm:py-6">
                <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8 stats-page">
                    <StatsSummaryCards summary={summary} />

                    <section className="stats-section">
                        <h2 className="stats-section__title">Completion trend</h2>
                        <Suspense fallback={<div className="stats-trend stats-trend--loading">Loading chart…</div>}>
                            <StatsTrendChart trend={trend} />
                        </Suspense>
                    </section>

                    <section className="stats-section">
                        <h2 className="stats-section__title">Habit grid</h2>
                        <HabitGrid habits={habits} days={days} />
                    </section>

                    <section className="stats-section">
                        <h2 className="stats-section__title">Per-habit completion</h2>
                        <HabitBars habits={habits} />
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

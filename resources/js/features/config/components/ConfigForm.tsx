import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { WEEK_DAYS } from '@/shared/constants/moments';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import type { UserConfig } from '../types';
import SleepHelper from './SleepHelper';

interface ConfigFormProps {
    config: UserConfig;
}

const timeInputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function ConfigForm({ config }: ConfigFormProps) {
    const form = useForm({
        wake_time: config.wake_time.slice(0, 5),
        sleep_time: config.sleep_time.slice(0, 5),
        week_starts_on: config.week_starts_on,
        office_start: config.office_start.slice(0, 5),
        office_end: config.office_end.slice(0, 5),
        identity_statement: config.identity_statement ?? '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.put(route('config.update'));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* ── Sleep Schedule ──────────────────────────────────────── */}
            <section>
                <h2 className="config-section-title">Sleep Schedule</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="wake_time" value="Wake time" />
                        <input
                            id="wake_time"
                            type="time"
                            value={form.data.wake_time}
                            onChange={(e) => form.setData('wake_time', e.target.value)}
                            className={timeInputClass}
                        />
                        <InputError message={form.errors.wake_time} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel htmlFor="sleep_time" value="Sleep time" />
                        <input
                            id="sleep_time"
                            type="time"
                            value={form.data.sleep_time}
                            onChange={(e) => form.setData('sleep_time', e.target.value)}
                            className={timeInputClass}
                        />
                        <InputError message={form.errors.sleep_time} className="mt-1" />
                    </div>
                </div>
                <SleepHelper
                    wakeTime={form.data.wake_time}
                    sleepTime={form.data.sleep_time}
                    field="sleep_time"
                    onApply={(field, value) => form.setData(field, value)}
                />
            </section>

            {/* ── Office Hours ────────────────────────────────────────── */}
            <section>
                <h2 className="config-section-title">Office Hours</h2>
                <p className="config-section-hint">
                    Used to shade your working window in the weekly view.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="office_start" value="Start" />
                        <input
                            id="office_start"
                            type="time"
                            value={form.data.office_start}
                            onChange={(e) => form.setData('office_start', e.target.value)}
                            className={timeInputClass}
                        />
                        <InputError message={form.errors.office_start} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel htmlFor="office_end" value="End" />
                        <input
                            id="office_end"
                            type="time"
                            value={form.data.office_end}
                            onChange={(e) => form.setData('office_end', e.target.value)}
                            className={timeInputClass}
                        />
                        <InputError message={form.errors.office_end} className="mt-1" />
                    </div>
                </div>
            </section>

            {/* ── Week Preferences ────────────────────────────────────── */}
            <section>
                <h2 className="config-section-title">Week Preferences</h2>
                <div className="mt-4">
                    <InputLabel htmlFor="week_starts_on" value="Week starts on" />
                    <select
                        id="week_starts_on"
                        value={form.data.week_starts_on}
                        onChange={(e) => form.setData('week_starts_on', Number(e.target.value))}
                        className={timeInputClass}
                    >
                        {WEEK_DAYS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.full}
                            </option>
                        ))}
                    </select>
                    <InputError message={form.errors.week_starts_on} className="mt-1" />
                </div>
            </section>

            {/* ── Identity Statement ──────────────────────────────────── */}
            <section>
                <h2 className="config-section-title">Identity Statement</h2>
                <p className="config-section-hint">
                    A short sentence that captures who you&apos;re becoming — shown as a daily
                    reminder. For example: &ldquo;I am someone who shows up consistently.&rdquo;
                </p>
                <div className="relative mt-4">
                    <textarea
                        id="identity_statement"
                        rows={3}
                        maxLength={500}
                        value={form.data.identity_statement}
                        onChange={(e) => form.setData('identity_statement', e.target.value)}
                        placeholder="I am someone who…"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="config-char-count">
                        {form.data.identity_statement.length} / 500
                    </span>
                </div>
                <InputError message={form.errors.identity_statement} className="mt-1" />
            </section>

            <div className="flex justify-end">
                <PrimaryButton disabled={form.processing}>Save Config</PrimaryButton>
            </div>
        </form>
    );
}

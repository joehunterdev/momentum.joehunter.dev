import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import type { UserConfig } from '../types';

//TODO: Move to a shared constants file if used elsewhere
const DAY_OPTIONS = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
];

interface ConfigFormProps {
    config: UserConfig;
}

export default function ConfigForm({ config }: ConfigFormProps) {
    const form = useForm({
        wake_time: config.wake_time.slice(0, 5),
        sleep_time: config.sleep_time.slice(0, 5),
        week_starts_on: config.week_starts_on,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        form.put(route('config.update'));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="wake_time" value="Wake time" />
                    <input
                        id="wake_time"
                        type="time"
                        value={form.data.wake_time}
                        onChange={(e) => form.setData('wake_time', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <InputError message={form.errors.sleep_time} className="mt-1" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="week_starts_on" value="Week starts on" />
                <select
                    id="week_starts_on"
                    value={form.data.week_starts_on}
                    onChange={(e) => form.setData('week_starts_on', Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    {DAY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <InputError message={form.errors.week_starts_on} className="mt-1" />
            </div>

            <div className="flex justify-end">
                <PrimaryButton disabled={form.processing}>Save Settings</PrimaryButton>
            </div>
        </form>
    );
}

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { FormEvent, useState } from 'react';
import { parseISO, isPast, format } from 'date-fns';
import Icon from '@/shared/components/Icon';
import type { Moment, MomentFormData } from '../types';
import { useMomentForm } from '../hooks/useMomentForm';
import ColorPicker from './ColorPicker';
import CueFields from './CueFields';
import MomentIconPicker from './MomentIconPicker';
import RewardFields from './RewardFields';
import ScheduleFields from './ScheduleFields';

import { MOMENT_FORM_SECTIONS } from '@/shared/constants/moments';

interface MomentFormProps {
    moment?: Moment;
    defaultValues?: Partial<MomentFormData>;
    onSubmit: (data: MomentFormData, form: ReturnType<typeof useMomentForm>) => void;
    submitLabel?: string;
    onCancel?: () => void;
}

export default function MomentForm({ moment, defaultValues, onSubmit, submitLabel = 'Save', onCancel }: MomentFormProps) {
    const form = useMomentForm(moment, defaultValues);
    const initialSection = !moment && defaultValues?.frequency ? 'schedule' : 'basics';
    const [openSection, setOpenSection] = useState<string>(initialSection);

    // Check if this is a Fixed habit past its end date
    const isFixedHabit = form.data.end_date !== null;
    const hasReachedEnd = isFixedHabit && form.data.end_date && isPast(parseISO(form.data.end_date));

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onSubmit(form.data, form);
    }

    function setField(field: keyof MomentFormData, value: MomentFormData[keyof MomentFormData]) {
        form.setData(field, value as never);
    }

    function graduateHabit() {
        setField('end_date', null);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {hasReachedEnd && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">🎉</span>
                        <div className="flex-1">
                            <p className="font-semibold text-green-900">
                                You completed your challenge!
                            </p>
                            <p className="text-sm text-green-800 mt-1">
                                This habit was scheduled to end on {format(parseISO(form.data.end_date!), 'MMM d, yyyy')}.
                                Ready to make it permanent?
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={graduateHabit}
                        className="inline-block px-3 py-2 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Make it Permanent ♾️
                    </button>
                </div>
            )}
            {MOMENT_FORM_SECTIONS.map((section) => {
                const isOpen = openSection === section.id;

                return (
                    <div key={section.id} className="overflow-hidden border border-gray-200 bg-white">
                        <button
                            type="button"
                            onClick={() => setOpenSection(isOpen ? '' : section.id)}
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        >
                            <span className="flex items-center gap-2">
                                <Icon name={section.emoji} size={18} className="text-gray-500" aria-hidden />
                                <span>{section.label}</span>
                            </span>
                            <span className="text-xs text-gray-400">{isOpen ? '▲' : '▼'}</span>
                        </button>

                        {isOpen && (
                            <div className="border-t border-gray-100 px-5 py-4">
                                {section.id === 'basics' && (
                                    <div className="space-y-4">
                                        <div>
                                            <InputLabel htmlFor="name" value="Name *" />
                                            <TextInput
                                                id="name"
                                                value={form.data.name}
                                                onChange={(e) => setField('name', e.target.value)}
                                                required
                                                autoFocus
                                                placeholder="e.g. Drink 8 glasses of water"
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={form.errors.name} className="mt-1" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="description" value="Description" />
                                            <TextInput
                                                id="description"
                                                value={form.data.description}
                                                onChange={(e) => setField('description', e.target.value)}
                                                placeholder="Optional notes"
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={form.errors.description} className="mt-1" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="icon" value="Icon" />
                                            <div className="mt-2">
                                                <MomentIconPicker
                                                    value={form.data.icon}
                                                    onChange={(emoji) => setField('icon', emoji)}
                                                />
                                            </div>
                                            <InputError message={form.errors.icon} className="mt-1" />
                                        </div>

                                        <div>
                                            <InputLabel value="Colour" />
                                            <div className="mt-2">
                                                <ColorPicker
                                                    value={form.data.color}
                                                    onChange={(c) => setField('color', c)}
                                                />
                                            </div>
                                            <InputError message={form.errors.color} className="mt-1" />
                                        </div>
                                    </div>
                                )}

                                {section.id === 'schedule' && (
                                    <ScheduleFields
                                        frequency={form.data.frequency}
                                        daysOfWeek={form.data.days_of_week}
                                        preferredTime={form.data.preferred_time}
                                        startDate={form.data.start_date}
                                        endDate={form.data.end_date}
                                        errors={form.errors}
                                        onChange={(field, value) => setField(field as keyof MomentFormData, value as never)}
                                    />
                                )}

                                {section.id === 'cue' && (
                                    <CueFields
                                        implementationIntention={form.data.implementation_intention}
                                        habitStackAfter={form.data.habit_stack_after}
                                        environmentPrompt={form.data.environment_prompt}
                                        errors={form.errors}
                                        onChange={(field, value) => setField(field as keyof MomentFormData, value)}
                                    />
                                )}

                                {section.id === 'reward' && (
                                    <RewardFields
                                        rewardDescription={form.data.reward_description}
                                        temptationBundle={form.data.temptation_bundle}
                                        errors={form.errors}
                                        onChange={(field, value) => setField(field as keyof MomentFormData, value)}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <SecondaryButton type="button" onClick={onCancel}>
                        Cancel
                    </SecondaryButton>
                )}
                <PrimaryButton disabled={form.processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}

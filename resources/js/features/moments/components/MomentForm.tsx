import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { FormEvent, useState } from 'react';
import type { Moment, MomentFormData } from '../types';
import { useMomentForm } from '../hooks/useMomentForm';
import ColorPicker from './ColorPicker';
import CueFields from './CueFields';
import RewardFields from './RewardFields';
import ScheduleFields from './ScheduleFields';

interface Section {
    id: string;
    label: string;
    emoji: string;
}
//TODO: Move to a shared constants file if used elsewhere
const SECTIONS: Section[] = [
    { id: 'basics', label: 'Basics', emoji: '✏️' },
    { id: 'schedule', label: 'Schedule', emoji: '📅' },
    { id: 'cue', label: 'Cue', emoji: '🔔' },
    { id: 'reward', label: 'Reward', emoji: '🏆' },
];

interface MomentFormProps {
    moment?: Moment;
    onSubmit: (data: MomentFormData, form: ReturnType<typeof useMomentForm>) => void;
    submitLabel?: string;
}

export default function MomentForm({ moment, onSubmit, submitLabel = 'Save' }: MomentFormProps) {
    const form = useMomentForm(moment);
    const [openSection, setOpenSection] = useState<string>('basics');

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onSubmit(form.data, form);
    }

    function setField(field: keyof MomentFormData, value: MomentFormData[keyof MomentFormData]) {
        form.setData(field, value as never);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {SECTIONS.map((section) => {
                const isOpen = openSection === section.id;

                return (
                    <div key={section.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <button
                            type="button"
                            onClick={() => setOpenSection(isOpen ? '' : section.id)}
                            className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50"
                        >
                            <span className="flex items-center gap-2">
                                <span>{section.emoji}</span>
                                <span>{section.label}</span>
                            </span>
                            <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
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
                                            <InputLabel htmlFor="identity_statement" value="Identity statement" />
                                            <TextInput
                                                id="identity_statement"
                                                value={form.data.identity_statement}
                                                onChange={(e) => setField('identity_statement', e.target.value)}
                                                placeholder="e.g. I am someone who stays hydrated"
                                                className="mt-1 block w-full"
                                            />
                                            <InputError message={form.errors.identity_statement} className="mt-1" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="icon" value="Icon (emoji)" />
                                            <TextInput
                                                id="icon"
                                                value={form.data.icon}
                                                onChange={(e) => setField('icon', e.target.value)}
                                                placeholder="💧"
                                                className="mt-1 block w-24"
                                            />
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

            <div className="flex justify-end pt-2">
                <PrimaryButton disabled={form.processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}

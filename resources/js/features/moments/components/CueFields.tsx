import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

interface CueFieldsProps {
    implementationIntention: string;
    habitStackAfter: string;
    environmentPrompt: string;
    errors: Partial<Record<string, string>>;
    onChange: (field: string, value: string) => void;
}

export default function CueFields({
    implementationIntention,
    habitStackAfter,
    environmentPrompt,
    errors,
    onChange,
}: CueFieldsProps) {
    return (
        <div className="space-y-4">
            <div>
                <InputLabel
                    htmlFor="implementation_intention"
                    value="Implementation intention"
                />
                <TextInput
                    id="implementation_intention"
                    value={implementationIntention}
                    onChange={(e) => onChange('implementation_intention', e.target.value)}
                    placeholder="I will [behaviour] at [time] in [location]"
                    className="mt-1 block w-full"
                />
                <InputError message={errors.implementation_intention} className="mt-1" />
            </div>

            <div>
                <InputLabel htmlFor="habit_stack_after" value="Habit stacking" />
                <TextInput
                    id="habit_stack_after"
                    value={habitStackAfter}
                    onChange={(e) => onChange('habit_stack_after', e.target.value)}
                    placeholder="After I [existing habit]…"
                    className="mt-1 block w-full"
                />
                <InputError message={errors.habit_stack_after} className="mt-1" />
            </div>

            <div>
                <InputLabel htmlFor="environment_prompt" value="Environment prompt" />
                <TextInput
                    id="environment_prompt"
                    value={environmentPrompt}
                    onChange={(e) => onChange('environment_prompt', e.target.value)}
                    placeholder="e.g. Book on the bedside table"
                    className="mt-1 block w-full"
                />
                <InputError message={errors.environment_prompt} className="mt-1" />
            </div>
        </div>
    );
}

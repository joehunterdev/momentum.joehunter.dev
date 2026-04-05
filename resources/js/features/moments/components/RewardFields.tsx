import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

interface RewardFieldsProps {
    rewardDescription: string;
    temptationBundle: string;
    errors: Partial<Record<string, string>>;
    onChange: (field: string, value: string) => void;
}

export default function RewardFields({
    rewardDescription,
    temptationBundle,
    errors,
    onChange,
}: RewardFieldsProps) {
    return (
        <div className="space-y-4">
            <div>
                <InputLabel htmlFor="reward_description" value="Reward" />
                <TextInput
                    id="reward_description"
                    value={rewardDescription}
                    onChange={(e) => onChange('reward_description', e.target.value)}
                    placeholder="What's my reward after completing this?"
                    className="mt-1 block w-full"
                />
                <InputError message={errors.reward_description} className="mt-1" />
            </div>

            <div>
                <InputLabel htmlFor="temptation_bundle" value="Temptation bundling" />
                <TextInput
                    id="temptation_bundle"
                    value={temptationBundle}
                    onChange={(e) => onChange('temptation_bundle', e.target.value)}
                    placeholder="Pair with something enjoyable, e.g. podcast while walking"
                    className="mt-1 block w-full"
                />
                <InputError message={errors.temptation_bundle} className="mt-1" />
            </div>
        </div>
    );
}

import { lazy, Suspense, useState } from 'react';
import data from '@emoji-mart/data';
import momentCatalog from '@/shared/config/moment-emoji-catalog.json';
import { EMOJI_SET } from '@/shared/config/icons.config';
import Icon from '@/shared/components/Icon';

const Picker = lazy(() => import('@emoji-mart/react'));

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function MomentIconPicker({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <div className="moment-icon-picker">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`moment-icon-picker__trigger${open ? ' is-open' : ''}`}
                aria-label="Pick an icon"
            >
                {value
                    ? <Icon name={value} size={24} />
                    : <img src="/logo.png" alt="Default" className="moment-icon-picker__default" />}
                <Icon name="expand_more" size={16} aria-hidden />
            </button>

            {open && (
                <Suspense fallback={<div className="moment-icon-picker__loading">Loading…</div>}>
                    <div className="moment-icon-picker__panel">
                        <Picker
                            data={data}
                            custom={momentCatalog}
                            categories={['health', 'fitness', 'mind', 'work', 'social', 'creative', 'general']}
                            set={EMOJI_SET}
                            onEmojiSelect={(e: { id: string; native: string }) => {
                                onChange(e.native);
                                setOpen(false);
                            }}
                            previewPosition="none"
                            skinTonePosition="none"
                            theme="light"
                        />
                    </div>
                </Suspense>
            )}
        </div>
    );
}

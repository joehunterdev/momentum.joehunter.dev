import { useState } from 'react';
import {
    ICON_CATEGORIES,
    MOMENT_ICONS,
    type IconCategory,
} from '@/shared/constants/icons';

interface IconPickerProps {
    value: string;
    onChange: (emoji: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
    const [category, setCategory] = useState<IconCategory>('all');
    const [search, setSearch] = useState('');

    const filtered = MOMENT_ICONS.filter((icon) => {
        const matchesCategory = category === 'all' || icon.category === category;
        const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="icon-picker">
            {/* Selected preview */}
            <div className="icon-picker__preview">
                <span className="icon-picker__preview-emoji">{value || '✏️'}</span>
                <span className="icon-picker__preview-label">
                    {value ? (MOMENT_ICONS.find((i) => i.emoji === value)?.name ?? 'Custom') : 'None selected'}
                </span>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search icons…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="icon-picker__search"
            />

            {/* Category tabs */}
            <div className="icon-picker__categories">
                {ICON_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`icon-picker__cat-btn${category === cat ? ' icon-picker__cat-btn--active' : ''}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Icon grid */}
            <div className="icon-picker__grid">
                {filtered.map((icon) => (
                    <button
                        key={icon.emoji + icon.name}
                        type="button"
                        title={icon.name}
                        onClick={() => onChange(icon.emoji)}
                        className={`icon-picker__item${value === icon.emoji ? ' icon-picker__item--selected' : ''}`}
                    >
                        {icon.emoji}
                    </button>
                ))}
                {filtered.length === 0 && (
                    <p className="icon-picker__empty">No icons match "{search}"</p>
                )}
            </div>
        </div>
    );
}

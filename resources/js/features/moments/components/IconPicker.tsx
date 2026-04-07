import { useRef, useState } from 'react';
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
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState<IconCategory>('all');
    const [search, setSearch] = useState('');
    const [customInput, setCustomInput] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    const isKnown = MOMENT_ICONS.some((i) => i.emoji === value);

    const filtered = MOMENT_ICONS.filter((icon) => {
        const matchesCategory = category === 'all' || icon.category === category;
        const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    function handleOpen() {
        setOpen(true);
        setTimeout(() => searchRef.current?.focus(), 0);
    }

    function handleSelect(emoji: string) {
        onChange(emoji);
        setOpen(false);
        setSearch('');
        setCustomInput('');
    }

    function handleCustomSubmit() {
        if (customInput.trim()) {
            handleSelect(customInput.trim());
        }
    }

    return (
        <div className="icon-picker">
            {/* Trigger — emoji only, no label */}
            <button
                type="button"
                onClick={() => (open ? setOpen(false) : handleOpen())}
                className={`icon-picker__trigger${open ? ' icon-picker__trigger--open' : ''}`}
            >
                {value ? (
                    <span className="icon-picker__trigger-emoji">
                        {value}
                        {!isKnown && <span className="icon-picker__custom-badge">custom</span>}
                    </span>
                ) : (
                    <span className="icon-picker__trigger-placeholder">Choose icon…</span>
                )}
                <svg className="icon-picker__trigger-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Expandable panel */}
            {open && (
                <div className="icon-picker__panel">
                    {/* Search */}
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="icon-picker__search"
                    />

                    {/* Category pills */}
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
                        {/* None / clear option */}
                        <button
                            type="button"
                            title="No icon"
                            onClick={() => handleSelect('')}
                            className={`icon-picker__item icon-picker__item--none${!value ? ' icon-picker__item--selected' : ''}`}
                        >
                            &mdash;
                        </button>

                        {filtered.map((icon) => (
                            <button
                                key={icon.emoji + icon.name}
                                type="button"
                                title={icon.name}
                                onClick={() => handleSelect(icon.emoji)}
                                className={`icon-picker__item${value === icon.emoji ? ' icon-picker__item--selected' : ''}`}
                            >
                                {icon.emoji}
                            </button>
                        ))}

                        {filtered.length === 0 && search && (
                            <p className="icon-picker__empty">No results for &ldquo;{search}&rdquo;</p>
                        )}
                    </div>

                    {/* Custom text/emoji input */}
                    <div className="icon-picker__custom">
                        <input
                            type="text"
                            placeholder="Or type any emoji…"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                            className="icon-picker__custom-input"
                            maxLength={4}
                        />
                        <button
                            type="button"
                            onClick={handleCustomSubmit}
                            disabled={!customInput.trim()}
                            className="icon-picker__custom-submit"
                        >
                            Use
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import catalog from '@/shared/config/moment-emoji-catalog.json';
import Icon from '@/shared/components/Icon';

interface CatalogEmoji {
    id: string;
    name: string;
}

interface CatalogCategory {
    id: string;
    name: string;
    emojis: CatalogEmoji[];
}

const CATEGORIES = catalog as CatalogCategory[];

// Flat list, tagged with its category id, so search + "all" can scan everything.
const ALL_EMOJIS = CATEGORIES.flatMap((c) =>
    c.emojis.map((e) => ({ ...e, category: c.id })),
);

// Tab list: a synthetic "all" in front of the catalog's own categories.
const TABS: { id: string; name: string }[] = [
    { id: 'all', name: 'All' },
    ...CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
];

interface Props {
    value: string;
    onChange: (value: string) => void;
    /**
     * Render only the selection panel (no trigger, always open). Use when the
     * picker lives inside a popover that's already toggled by its own trigger
     * — e.g. the draft scheduling row.
     */
    embedded?: boolean;
}

export default function MomentIconPicker({ value, onChange, embedded = false }: Props) {
    const [open, setOpen] = useState(embedded);
    const [category, setCategory] = useState<string>('all');
    const [search, setSearch] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    // Focus search whenever the panel becomes visible.
    useEffect(() => {
        if (open) {
            const t = setTimeout(() => searchRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
    }, [open]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return ALL_EMOJIS.filter((e) => {
            const matchesCategory = category === 'all' || e.category === category;
            const matchesSearch = !q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [category, search]);

    const noResults = filtered.length === 0 && search.trim().length > 0;

    function handleSelect(id: string) {
        onChange(id);
        setSearch('');
        if (!embedded) { setOpen(false); }
    }

    const searchInput = (
        <input
            ref={searchRef}
            type="text"
            placeholder="Search icons…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            className="icon-picker__search"
        />
    );

    const panel = (
        <div className="icon-picker__panel">
            {/* Embedded picker has no trigger row, so the search lives in the
                panel. Standalone renders it inline next to the trigger instead. */}
            {embedded && searchInput}

            <div className="icon-picker__categories">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => { setCategory(tab.id); setSearch(''); }}
                        className={`icon-picker__cat-btn${category === tab.id ? ' icon-picker__cat-btn--active' : ''}`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {noResults ? (
                <div className="icon-picker__no-results">
                    <p className="icon-picker__no-results-label">
                        No results for &ldquo;{search}&rdquo;
                    </p>
                </div>
            ) : (
                <div className="icon-picker__grid">
                    {/* Clear → default logo fallback */}
                    <button
                        type="button"
                        title="Default (logo)"
                        onClick={() => handleSelect('')}
                        className={`icon-picker__item icon-picker__item--none${!value ? ' icon-picker__item--selected' : ''}`}
                    >
                        <img src="/logo.png" alt="Default" className="icon-picker__item-logo" />
                    </button>

                    {filtered.map((emoji) => (
                        <button
                            key={emoji.category + emoji.id}
                            type="button"
                            title={emoji.name}
                            onClick={() => handleSelect(emoji.id)}
                            className={`icon-picker__item${value === emoji.id ? ' icon-picker__item--selected' : ''}`}
                        >
                            <Icon name={emoji.id} size={20} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // Embedded: the panel is the whole component — the parent owns the trigger.
    if (embedded) {
        return <div className="icon-picker icon-picker--embedded">{panel}</div>;
    }

    return (
        <div className="icon-picker">
            <div className="icon-picker__field">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className={`icon-picker__trigger${open ? ' icon-picker__trigger--open' : ''}`}
                    aria-label="Pick an icon"
                >
                    {value ? (
                        <span className="icon-picker__trigger-emoji">
                            <Icon name={value} size={22} />
                        </span>
                    ) : (
                        <img src="/logo.png" alt="Default icon" className="icon-picker__trigger-logo" />
                    )}
                    <svg className="icon-picker__trigger-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>

                {searchInput}
            </div>

            {open && panel}
        </div>
    );
}

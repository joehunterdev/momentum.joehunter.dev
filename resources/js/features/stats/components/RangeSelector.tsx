interface Props {
    value: number;
    onChange: (days: number) => void;
}

const RANGES: { days: number; label: string }[] = [
    { days: 30, label: '30 days' },
    { days: 90, label: '90 days' },
    { days: 180, label: '6 months' },
];

/** Segmented control for the rolling stats window. */
export default function RangeSelector({ value, onChange }: Props) {
    return (
        <div className="stats-range" role="tablist" aria-label="Date range">
            {RANGES.map((r) => (
                <button
                    key={r.days}
                    type="button"
                    role="tab"
                    aria-selected={value === r.days}
                    className={`stats-range__btn${value === r.days ? ' stats-range__btn--active' : ''}`}
                    onClick={() => onChange(r.days)}
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
}

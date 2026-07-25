import Icon from '@/shared/components/Icon';

interface Props {
    habits: App.Data.HabitStatData[];
    days: string[];
}

const FALLBACK = 'var(--mm-primary)';

/**
 * Ongoing habits × days grid. Each cell is done / missed / not-due. "Done" cells take
 * the habit's own colour; the column strip scrolls horizontally for long ranges.
 * Fixed habits are excluded (they have their own dedicated period).
 */
export default function HabitGrid({ habits, days }: Props) {
    const ongoing = habits.filter(h => h.habit_type === 'ongoing');

    if (ongoing.length === 0) {
        return <p className="stats-empty">No ongoing habits to chart yet.</p>;
    }

    return (
        <div className="stats-grid">
            {ongoing.map((h) => (
                <div key={h.id} className="stats-grid__row">
                    <div className="stats-grid__label" title={h.name}>
                        {h.icon
                            ? <Icon name={h.icon} size={16} aria-hidden />
                            : <img src="/logo.png" alt="" className="stats-grid__label-img" />}
                        <span className="stats-grid__name">{h.name}</span>
                    </div>
                    <div className="stats-grid__cells">
                        {h.cells.map((state, i) => (
                            <span
                                key={days[i] ?? i}
                                className={`stats-grid__cell stats-grid__cell--${state}`}
                                style={state === 'done' ? { backgroundColor: h.color ?? FALLBACK } : undefined}
                                title={`${days[i]} — ${state === 'done' ? 'done' : state === 'missed' ? 'missed' : 'not scheduled'}`}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

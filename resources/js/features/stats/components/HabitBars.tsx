import Icon from '@/shared/components/Icon';

interface Props {
    habits: App.Data.HabitStatData[];
}

const FALLBACK = 'var(--mm-primary)';

/** Per-habit completion-% bars, sorted strongest → weakest. */
export default function HabitBars({ habits }: Props) {
    if (habits.length === 0) {
        return <p className="stats-empty">No active habits to chart yet.</p>;
    }

    const sorted = [...habits].sort((a, b) => (b.completionRate ?? -1) - (a.completionRate ?? -1));

    return (
        <div className="stats-bars">
            {sorted.map((h) => {
                const rate = h.completionRate ?? 0;
                return (
                    <div key={h.id} className="stats-bar">
                        <div className="stats-bar__head">
                            {h.icon
                                ? <Icon name={h.icon} size={16} aria-hidden />
                                : <img src="/logo.png" alt="" className="stats-bar__img" />}
                            <span className="stats-bar__name" title={h.name}>{h.name}</span>
                            <span className="stats-bar__pct">{h.completionRate ?? 0}%</span>
                        </div>
                        <div className="stats-bar__track">
                            <div
                                className="stats-bar__fill"
                                style={{ width: `${rate}%`, backgroundColor: h.color ?? FALLBACK }}
                            />
                        </div>
                        {h.currentStreak > 0 && (
                            <span className="stats-bar__streak">
                                <Icon name="local_fire_department" size={13} aria-hidden /> {h.currentStreak}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

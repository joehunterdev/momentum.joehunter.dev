import Icon from '@/shared/components/Icon';

interface Props {
    habits: App.Data.HabitStatData[];
}

const FALLBACK = 'var(--mm-primary)';

/** Per-habit score bars: strength (Ongoing) or completion % (Fixed), sorted strongest → weakest. */
export default function HabitBars({ habits }: Props) {
    if (habits.length === 0) {
        return <p className="stats-empty">No active habits to chart yet.</p>;
    }

    // Separate and sort
    const ongoing = habits.filter(h => h.habit_type === 'ongoing').sort((a, b) => (b.strength ?? -1) - (a.strength ?? -1));
    const fixed = habits.filter(h => h.habit_type === 'fixed').sort((a, b) => (b.completionRate ?? -1) - (a.completionRate ?? -1));

    return (
        <div className="stats-bars">
            {ongoing.length > 0 && (
                <>
                    {ongoing.map((h) => {
                        const rate = h.strength ?? 0;
                        return (
                            <div key={h.id} className="stats-bar">
                                <div className="stats-bar__head">
                                    {h.icon
                                        ? <Icon name={h.icon} size={16} aria-hidden />
                                        : <img src="/logo.png" alt="" className="stats-bar__img" />}
                                    <span className="stats-bar__name" title={h.name}>{h.name}</span>
                                    <span className="stats-bar__pct">
                                        <span aria-label="strength">♾️ {h.strength ?? 0}%</span>
                                    </span>
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
                </>
            )}
            {fixed.length > 0 && (
                <>
                    {fixed.map((h) => {
                        const rate = h.completionRate ?? 0;
                        return (
                            <div key={h.id} className="stats-bar">
                                <div className="stats-bar__head">
                                    {h.icon
                                        ? <Icon name={h.icon} size={16} aria-hidden />
                                        : <img src="/logo.png" alt="" className="stats-bar__img" />}
                                    <span className="stats-bar__name" title={h.name}>{h.name}</span>
                                    <span className="stats-bar__pct">
                                        <span aria-label="challenge progress">{h.completed_total} / {h.scheduled_total}</span>
                                    </span>
                                </div>
                                <div className="stats-bar__track">
                                    <div
                                        className="stats-bar__fill"
                                        style={{ width: `${rate}%`, backgroundColor: h.color ?? FALLBACK }}
                                    />
                                </div>
                                {h.days_remaining != null && h.days_remaining > 0 && (
                                    <span className="stats-bar__streak">
                                        📍 {h.days_remaining}d left
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}

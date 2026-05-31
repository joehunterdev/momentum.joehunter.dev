import Icon from '@/shared/components/Icon';

interface Props {
    summary: App.Data.StatsSummaryData;
}

/** Four key-stat cards for the period. */
export default function StatsSummaryCards({ summary }: Props) {
    const cards = [
        { key: 'rate', icon: 'check_circle', label: 'Completion rate', value: `${summary.completionRate}%`, tone: 'primary' },
        { key: 'done', icon: 'task_alt', label: 'Completed', value: summary.totalCompleted, tone: 'neutral' },
        { key: 'streak', icon: 'local_fire_department', label: 'Longest streak', value: summary.longestStreak, tone: 'streak' },
        { key: 'missed', icon: 'cancel', label: 'Missed', value: summary.missedDays, tone: 'danger' },
    ] as const;

    return (
        <div className="stats-cards">
            {cards.map((c) => (
                <div key={c.key} className={`stats-card stats-card--${c.tone}`}>
                    <Icon name={c.icon} size={20} className="stats-card__icon" aria-hidden />
                    <div className="stats-card__value">{c.value}</div>
                    <div className="stats-card__label">{c.label}</div>
                </div>
            ))}
        </div>
    );
}

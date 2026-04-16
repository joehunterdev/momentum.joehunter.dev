import MonthlyDayCell from './MonthlyDayCell';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
    days: App.Data.MonthlyDayData[];
    onDayClick?: (date: string) => void;
}

export default function MonthlyGrid({ days, onDayClick }: Props) {
    return (
        <div className="monthly-grid">
            {/* Column headers */}
            <div className="monthly-grid__headers">
                {DAY_HEADERS.map((d) => (
                    <div key={d} className="monthly-grid__col-header">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="monthly-grid__cells">
                {days.map((day) => (
                    <MonthlyDayCell
                        key={day.date}
                        day={day}
                        onDayClick={onDayClick}
                    />
                ))}
            </div>
        </div>
    );
}

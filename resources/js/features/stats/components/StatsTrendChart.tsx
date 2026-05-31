import { format, parseISO } from 'date-fns';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Props {
    trend: App.Data.TrendPointData[];
}

/**
 * Daily completion-% trend across the window. Lazy-loaded by the page so
 * recharts stays out of the main bundle.
 */
export default function StatsTrendChart({ trend }: Props) {
    const data = trend.map((p) => ({ date: p.date, rate: p.rate }));
    // Thin the x-axis labels so long windows don't crowd.
    const tickEvery = Math.ceil(data.length / 6);

    return (
        <div className="stats-trend">
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--mm-border)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: 'var(--mm-text-faint)' }}
                        tickLine={false}
                        axisLine={false}
                        interval={tickEvery - 1}
                        tickFormatter={(d: string) => format(parseISO(d), 'd MMM')}
                    />
                    <YAxis
                        domain={[0, 100]}
                        ticks={[0, 50, 100]}
                        tick={{ fontSize: 10, fill: 'var(--mm-text-faint)' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                        formatter={(value) => [`${value}%`, 'Completion']}
                        labelFormatter={(label) => format(parseISO(String(label)), 'EEE d MMM')}
                        contentStyle={{ fontSize: 12, borderRadius: 0, border: '1px solid var(--mm-border)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="var(--mm-primary)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

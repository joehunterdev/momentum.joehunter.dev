export interface DailyMoment {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
    identity_statement: string | null;
    completed_at: string | null; // ISO 8601 string — Inertia serialises PHP Carbon/datetime as a JSON string
    instance_id: number | null;
    streak: number;
}

export interface DailyPageProps {
    date: string; // YYYY-MM-DD
    moments: DailyMoment[];
}

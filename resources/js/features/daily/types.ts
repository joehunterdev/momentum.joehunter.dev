export interface DailyMoment {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
    identity_statement: string | null;
    completed_at: string | null; // ISO 8601 or null //TODO: ensure this is consistent with backend (currently a string or null, but could be a Date or something else)
    instance_id: number | null;
    streak: number;
}

export interface DailyPageProps {
    date: string; // YYYY-MM-DD
    moments: DailyMoment[];
}

interface SleepHelperProps {
    wakeTime: string;
    sleepTime: string;
    field: 'wake_time' | 'sleep_time';
    onApply: (field: 'wake_time' | 'sleep_time', value: string) => void;
}

/** Parses "HH:mm" to total minutes since midnight. */
function toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

/** Formats total minutes (may be negative or >1440) back to "HH:mm". */
function fromMinutes(minutes: number): string {
    const normalized = ((minutes % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const TARGET_SLEEP_MINUTES = 8 * 60;

export default function SleepHelper({ wakeTime, sleepTime, field, onApply }: SleepHelperProps) {
    if (!wakeTime || !sleepTime) {
        return null;
    }

    const wakeMinutes = toMinutes(wakeTime);
    const sleepMinutes = toMinutes(sleepTime);

    // Sleep wraps across midnight, so sleep < wake means next-day
    const gap = sleepMinutes <= wakeMinutes
        ? wakeMinutes - sleepMinutes
        : 1440 - sleepMinutes + wakeMinutes;

    if (gap === TARGET_SLEEP_MINUTES) {
        return null;
    }

    const diffMins = Math.abs(TARGET_SLEEP_MINUTES - gap);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const diffLabel = hrs > 0
        ? `${hrs}h${mins > 0 ? ` ${mins}m` : ''}`
        : `${mins}m`;

    const isTooLittle = gap < TARGET_SLEEP_MINUTES;
    const verb = isTooLittle ? 'short of' : 'over';

    // Suggest adjusting the active field to hit 8 hrs
    let suggestion: string;
    if (field === 'sleep_time') {
        suggestion = fromMinutes(wakeMinutes - TARGET_SLEEP_MINUTES);
    } else {
        suggestion = fromMinutes(sleepMinutes + TARGET_SLEEP_MINUTES);
    }

    const fieldLabel = field === 'sleep_time' ? 'sleep time' : 'wake time';

    return (
        <p className="sleep-helper">
            {diffLabel} {verb} 8 hrs.{' '}
            <button
                type="button"
                className="sleep-helper__cta"
                onClick={() => onApply(field, suggestion)}
            >
                Set {fieldLabel} to {suggestion}
            </button>
        </p>
    );
}

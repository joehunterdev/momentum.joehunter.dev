import type { SlotMoment } from '../types';

interface Props {
    moment: SlotMoment;
}

export default function SlotMomentIcon({ moment }: Props) {
    const statusClass = moment.status
        ? `slot-icon--${moment.status}`
        : 'slot-icon--future';

    return (
        <div
            className={`slot-icon ${statusClass}`}
            title={`${moment.name}${moment.status ? ` (${moment.status})` : ''}`}
        >
            {moment.icon ?? moment.name.charAt(0).toUpperCase()}
        </div>
    );
}

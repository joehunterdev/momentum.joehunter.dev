//TODO: Move to a shared constants file if used elsewhere 
const PALETTE = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#10B981', // emerald
    '#EF4444', // red
    '#F59E0B', // amber
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#6366F1', // indigo
    '#F97316', // orange
];

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {PALETTE.map((color) => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    aria-label={`Select colour ${color}`}
                    className={`h-8 w-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${value === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                        }`}
                    style={{ backgroundColor: color, focusRingColor: color } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

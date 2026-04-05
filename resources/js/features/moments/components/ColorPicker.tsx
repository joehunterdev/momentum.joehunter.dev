import { MOMENT_COLOR_PALETTE } from '@/shared/constants/moments';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {MOMENT_COLOR_PALETTE.map((color) => (
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

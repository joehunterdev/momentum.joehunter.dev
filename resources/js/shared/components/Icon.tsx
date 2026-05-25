import {
    EMOJI_SET,
    MATERIAL_STYLE,
    MATERIAL_STYLE_CLASS,
    type EmojiSet,
    type MaterialIconStyle,
} from '@/shared/config/icons.config';
import { MATERIAL_NAMES } from '@/shared/config/material-names';

interface Props {
    /** Material ligature ('check'), emoji codepoint ('💧'), or emoji-mart id ('droplet'). */
    name: string;
    /** Override site-wide Material style. */
    materialStyle?: MaterialIconStyle;
    /** Override site-wide emoji set. */
    emojiSet?: EmojiSet;
    size?: number | string;
    className?: string;
    title?: string;
    'aria-hidden'?: boolean;
}

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const MATERIAL_LIGATURE_RE = /^[a-z][a-z0-9_]*$/;

export default function Icon({
    name, materialStyle, emojiSet, size, className, title, ...rest
}: Props) {
    const mStyle = materialStyle ?? MATERIAL_STYLE;
    const eSet = emojiSet ?? EMOJI_SET;
    const fontSize = typeof size === 'number' ? `${size}px` : size;

    // 1. Material ligature
    if (MATERIAL_LIGATURE_RE.test(name) && MATERIAL_NAMES.has(name)) {
        return (
            <span
                className={[MATERIAL_STYLE_CLASS[mStyle], className].filter(Boolean).join(' ')}
                style={fontSize ? { fontSize } : undefined}
                title={title}
                {...rest}
            >
                {name}
            </span>
        );
    }

    // 2. Emoji codepoint (e.g. '💧')
    if (EMOJI_RE.test(name)) {
        return (
            <em-emoji
                native={name}
                set={eSet}
                size={fontSize}
                className={className}
                title={title}
                {...rest}
            />
        );
    }

    // 3. emoji-mart shortcode id (e.g. 'droplet') — snake_case not in MATERIAL_NAMES
    if (MATERIAL_LIGATURE_RE.test(name)) {
        return (
            <em-emoji
                id={name}
                set={eSet}
                size={fontSize}
                className={className}
                title={title}
                {...rest}
            />
        );
    }

    // 4. Raw text fallback
    return (
        <span className={className} style={fontSize ? { fontSize } : undefined} title={title} {...rest}>
            {name}
        </span>
    );
}

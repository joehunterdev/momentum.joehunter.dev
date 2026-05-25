// ── Material Icons (system / UI chrome) ────────────────────────────────
export type MaterialIconStyle =
    | 'filled' | 'outlined' | 'rounded' | 'sharp' | 'two-tone';

export const MATERIAL_STYLE: MaterialIconStyle = 'sharp';

export const MATERIAL_STYLE_CLASS: Record<MaterialIconStyle, string> = {
    'filled': 'material-icons',
    'outlined': 'material-icons-outlined',
    'rounded': 'material-icons-round',
    'sharp': 'material-icons-sharp',
    'two-tone': 'material-icons-two-tone',
};

// ── emoji-mart (moment emoji rendering) ────────────────────────────────
export type EmojiSet = 'apple' | 'google' | 'twitter' | 'facebook' | 'native';

export const EMOJI_SET: EmojiSet = 'twitter';

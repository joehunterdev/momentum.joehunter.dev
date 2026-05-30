// ── Material Icons (system / UI chrome) ────────────────────────────────
export type MaterialIconStyle =
    | 'filled' | 'outlined' | 'rounded' | 'sharp' | 'two-tone';

export const MATERIAL_STYLE: MaterialIconStyle = 'sharp';

export const MATERIAL_STYLE_CLASS: Record<MaterialIconStyle, string> = {
    'filled': 'material-symbols-outlined',
    'outlined': 'material-symbols-outlined',
    'rounded': 'material-symbols-rounded',
    'sharp': 'material-symbols-sharp',
    'two-tone': 'material-symbols-outlined',
};

// ── emoji-mart (moment emoji rendering) ────────────────────────────────
export type EmojiSet = 'apple' | 'google' | 'twitter' | 'facebook' | 'native';

export const EMOJI_SET: EmojiSet = 'twitter';

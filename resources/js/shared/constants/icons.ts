export interface MomentIconOption {
    name: string;
    emoji: string;
    category: string;
}

export const MOMENT_ICONS: MomentIconOption[] = [
    // Health
    { name: 'Water', emoji: '💧', category: 'health' },
    { name: 'Apple', emoji: '🍎', category: 'health' },
    { name: 'Salad', emoji: '🥗', category: 'health' },
    { name: 'Vitamin', emoji: '💊', category: 'health' },
    { name: 'Sleep', emoji: '😴', category: 'health' },
    { name: 'Tooth', emoji: '🦷', category: 'health' },
    { name: 'Heart', emoji: '❤️', category: 'health' },
    { name: 'Medicine', emoji: '🩺', category: 'health' },
    // Fitness
    { name: 'Run', emoji: '🏃', category: 'fitness' },
    { name: 'Gym', emoji: '🏋️', category: 'fitness' },
    { name: 'Yoga', emoji: '🧘', category: 'fitness' },
    { name: 'Cycle', emoji: '🚴', category: 'fitness' },
    { name: 'Swim', emoji: '🏊', category: 'fitness' },
    { name: 'Walk', emoji: '🚶', category: 'fitness' },
    { name: 'Stretch', emoji: '🤸', category: 'fitness' },
    { name: 'Hike', emoji: '🥾', category: 'fitness' },
    // Mind
    { name: 'Meditate', emoji: '🧘', category: 'mind' },
    { name: 'Read', emoji: '📚', category: 'mind' },
    { name: 'Journal', emoji: '📝', category: 'mind' },
    { name: 'Brain', emoji: '🧠', category: 'mind' },
    { name: 'Pray', emoji: '🙏', category: 'mind' },
    { name: 'Breathe', emoji: '🌬️', category: 'mind' },
    { name: 'Gratitude', emoji: '🌸', category: 'mind' },
    { name: 'Learn', emoji: '🎓', category: 'mind' },
    // Work
    { name: 'Code', emoji: '💻', category: 'work' },
    { name: 'Email', emoji: '📧', category: 'work' },
    { name: 'Meeting', emoji: '🤝', category: 'work' },
    { name: 'Study', emoji: '📖', category: 'work' },
    { name: 'Write', emoji: '✍️', category: 'work' },
    { name: 'Plan', emoji: '📋', category: 'work' },
    { name: 'Focus', emoji: '🎯', category: 'work' },
    { name: 'Review', emoji: '🔍', category: 'work' },
    // Social
    { name: 'Call', emoji: '📞', category: 'social' },
    { name: 'Family', emoji: '👨‍👩‍👧', category: 'social' },
    { name: 'Friends', emoji: '👥', category: 'social' },
    { name: 'Message', emoji: '💬', category: 'social' },
    { name: 'Date', emoji: '💑', category: 'social' },
    { name: 'Volunteer', emoji: '🫶', category: 'social' },
    // Creative
    { name: 'Music', emoji: '🎵', category: 'creative' },
    { name: 'Art', emoji: '🎨', category: 'creative' },
    { name: 'Camera', emoji: '📷', category: 'creative' },
    { name: 'Guitar', emoji: '🎸', category: 'creative' },
    { name: 'Dance', emoji: '💃', category: 'creative' },
    { name: 'Craft', emoji: '🧵', category: 'creative' },
    // General
    { name: 'Star', emoji: '⭐', category: 'general' },
    { name: 'Fire', emoji: '🔥', category: 'general' },
    { name: 'Check', emoji: '✅', category: 'general' },
    { name: 'Clock', emoji: '⏰', category: 'general' },
    { name: 'Money', emoji: '💰', category: 'general' },
    { name: 'Clean', emoji: '🧹', category: 'general' },
    { name: 'Cook', emoji: '🍳', category: 'general' },
    { name: 'Plant', emoji: '🌱', category: 'general' },
    { name: 'Sun', emoji: '☀️', category: 'general' },
    { name: 'Moon', emoji: '🌙', category: 'general' },
];

export const ICON_CATEGORIES = [
    'all', 'health', 'fitness', 'mind', 'work', 'social', 'creative', 'general',
] as const;

export type IconCategory = typeof ICON_CATEGORIES[number];

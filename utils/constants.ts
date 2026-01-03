export interface CategoryDefinition {
    id: string
    label: string
    emoji: string
    color: string
    twColor: string // Tailwind color name for dynamic classes
}

export const CORE_CATEGORIES: CategoryDefinition[] = [

    { id: 'health', label: 'Health & Wellness', emoji: '🧘‍♀️', color: 'teal', twColor: 'teal' },
    { id: 'heroes', label: 'Community Heroes', emoji: '🦸', color: 'rose', twColor: 'rose' },
    { id: 'planet', label: 'Planet Wins', emoji: '🌍', color: 'emerald', twColor: 'emerald' },
    { id: 'innovation', label: 'Innovation', emoji: '🚀', color: 'violet', twColor: 'violet' },
    { id: 'solutions', label: 'Solutions', emoji: '💡', color: 'blue', twColor: 'blue' },
    { id: 'kindness', label: 'Acts of Kindness', emoji: '💛', color: 'yellow', twColor: 'yellow' },
    { id: 'sports', label: 'Sports', emoji: '🏆', color: 'orange', twColor: 'orange' },
    { id: 'video', label: 'Videos', emoji: '🎬', color: 'red', twColor: 'red' },
    { id: 'world', label: 'Global News', emoji: '🌐', color: 'cyan', twColor: 'cyan' },
]

export const CATEGORY_MAP = CORE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat
    return acc
}, {} as Record<string, CategoryDefinition>)

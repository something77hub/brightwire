export interface CategoryDefinition {
    id: string
    label: string
    emoji: string
    color: string
    twColor: string // Tailwind color name for dynamic classes
}

export const CORE_CATEGORIES: CategoryDefinition[] = [
    { id: 'good-news', label: "Today's Good News", emoji: '☀️', color: 'amber', twColor: 'amber' },
    { id: 'heroes', label: 'Community Heroes', emoji: '🦸', color: 'rose', twColor: 'rose' },
    { id: 'planet', label: 'Planet Wins', emoji: '🌍', color: 'emerald', twColor: 'emerald' },
    { id: 'innovation', label: 'Innovation', emoji: '🚀', color: 'violet', twColor: 'violet' },
    { id: 'solutions', label: 'Solutions', emoji: '💡', color: 'blue', twColor: 'blue' },
    { id: 'kindness', label: 'Acts of Kindness', emoji: '💛', color: 'yellow', twColor: 'yellow' },
    { id: 'sports', label: 'Sports', emoji: '🏆', color: 'orange', twColor: 'orange' },
    { id: 'world', label: 'Global News', emoji: '🌐', color: 'cyan', twColor: 'cyan' },
]

export const CATEGORY_MAP = CORE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat
    return acc
}, {} as Record<string, CategoryDefinition>)

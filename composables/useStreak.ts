export const useStreak = () => {
    const streak = ref(0)
    const lastVisit = ref<string | null>(null)
    const showStreakModal = ref(false)
    const hasCheckedToday = ref(false)

    // Initialize streak on mount
    onMounted(() => {
        try {
            const storedStreak = localStorage.getItem('bw_streak')
            const storedLastVisit = localStorage.getItem('bw_last_visit')

            streak.value = storedStreak ? parseInt(storedStreak, 10) : 0
            lastVisit.value = storedLastVisit

            checkStreak()
        } catch (e) {
            console.error('Error accessing localStorage:', e)
        }
    })

    const checkStreak = () => {
        if (hasCheckedToday.value) return

        const now = new Date()
        const today = now.toLocaleDateString() // e.g. "1/1/2026"

        // If first visit ever
        if (!lastVisit.value) {
            streak.value = 1
            updateStorage(today, 1)
            hasCheckedToday.value = true
            return
        }

        // If already visited today, do nothing
        if (lastVisit.value === today) {
            hasCheckedToday.value = true
            return
        }

        // Check if yesterday
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        const yesterdayDate = yesterday.toLocaleDateString()

        if (lastVisit.value === yesterdayDate) {
            // Consecutive day!
            streak.value++
            // Show modal on milestones (3, 7, 30...)
            if ([3, 7, 14, 30, 100].includes(streak.value)) {
                showStreakModal.value = true
            }
        } else {
            // Streak broken :(
            streak.value = 1
        }

        updateStorage(today, streak.value)
        hasCheckedToday.value = true
    }

    const updateStorage = (date: string, count: number) => {
        lastVisit.value = date
        streak.value = count
        localStorage.setItem('bw_last_visit', date)
        localStorage.setItem('bw_streak', count.toString())
    }

    return {
        streak,
        showStreakModal
    }
}

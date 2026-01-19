import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme } from '@/types'

interface ThemeStore {
  theme: Theme

  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',

      setTheme: (theme) => {
        set({ theme })
        // Update document class for dark mode
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          // Update document class for dark mode
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { theme: newTheme }
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
)

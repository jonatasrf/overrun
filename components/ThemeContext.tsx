'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'outdoor'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')

    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') as Theme
        if (savedTheme === 'outdoor') {
            setTheme('outdoor')
            document.documentElement.classList.add('outdoor-mode')
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err))
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'outdoor' : 'dark'
        setTheme(newTheme)
        localStorage.setItem('app-theme', newTheme)

        if (newTheme === 'outdoor') {
            document.documentElement.classList.add('outdoor-mode')
        } else {
            document.documentElement.classList.remove('outdoor-mode')
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

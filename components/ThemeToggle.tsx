'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeContext'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors hover:bg-gray-700 text-gray-400 hover:text-white"
            title={theme === 'dark' ? 'Modo Externo (Alto Contraste)' : 'Modo Escuro'}
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    )
}

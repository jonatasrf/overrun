'use client'

import { logout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        >
            <LogOut className="h-4 w-4" />
            Sign Out
        </button>
    )
}

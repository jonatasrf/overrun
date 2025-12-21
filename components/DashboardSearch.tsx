'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

export function DashboardSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [text, setText] = useState(searchParams.get('q') || '')
    const [query] = useDebounce(text, 500)

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (query) {
            params.set('q', query)
        } else {
            params.delete('q')
        }
        router.push(`/?${params.toString()}`)
    }, [query, router, searchParams])

    return (
        <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-10 py-2 border border-gray-800 rounded-xl bg-gray-900 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="Search by tractor, user or date..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            {text && (
                <button
                    onClick={() => setText('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-white text-gray-500 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}

'use client'

import { Tractor } from 'lucide-react'

type Props = {
    tractorName: string
    reports: any[]
}

export function TractorHistoryHeader({ tractorName, reports }: Props) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/20">
                    <Tractor className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {tractorName}
                    </h1>
                    <p className="text-gray-500">Overrun Tests</p>
                </div>
            </div>
        </div>
    )
}

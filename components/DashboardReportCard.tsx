'use client'

import Link from 'next/link'
import { Calendar, User as UserIcon, History } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
    report: {
        id: string
        createdAt: Date | string
        status: string
        tractorName: string
        gearRatioValue: number | string
        user: {
            username: string
        } | null
    }
}

export function DashboardReportCard({ report }: Props) {
    const router = useRouter()

    const handleCardClick = () => {
        router.push(`/reports/${report.id}`)
    }

    return (
        <div
            onClick={handleCardClick}
            className="group block p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer"
        >
            <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${report.status === 'CLOSED'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                    {report.status}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.createdAt).toLocaleDateString()}
                </span>
            </div>

            <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
                    {report.tractorName}
                </h4>
                <Link
                    href={`/tractors/${encodeURIComponent(report.tractorName)}`}
                    className="p-1.5 text-gray-500 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg transition-all z-20"
                    title="View History"
                    onClick={(e) => {
                        e.stopPropagation() // Prevent parent div click
                    }}
                >
                    <History className="h-4 w-4" />
                </Link>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-2">
                    Ratio: <span className="text-cyan-400 font-mono">{report.gearRatioValue}</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                    <UserIcon className="h-3 w-3" />
                    {report.user?.username || 'System'}
                </span>
            </div>
        </div>
    )
}

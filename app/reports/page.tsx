import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import { FileText, Calendar, Tractor, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

import { SearchInput } from '@/components/SearchInput'

import { getSession } from '@/lib/auth'

export default async function ReportsPage(props: {
    searchParams: Promise<{ q?: string }>
}) {
    const searchParams = await props.searchParams
    const query = searchParams.q || ''
    const session = await getSession()

    const where: any = {}

    // If regular user, only show CLOSED reports
    if (session?.role !== 'ADMIN') {
        where.status = 'CLOSED'
    }

    if (query) {
        where.OR = [
            { tractorName: { contains: query } },
            { tireBrandFront: { contains: query } },
            { tireBrandRear: { contains: query } },
            { status: { contains: query.toUpperCase() } }
        ]
    }

    const reports = await prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            createdAt: true,
            status: true,
            tractorName: true,
            gearRatioValue: true,
            tireBrandFront: true,
            tireBrandRear: true,
            user: true
        }
    })

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <Header session={session} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-teal-400">
                        Tests
                    </h1>

                    {session?.role === 'ADMIN' && (
                        <Link
                            href="/reports/new"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                        >
                            <Activity className="h-4 w-4" />
                            New Test
                        </Link>
                    )}
                </div>

                <SearchInput />

                <div className="grid gap-4">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-gray-800">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No tests found. Start a new test to see it here.</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <Link
                                key={report.id}
                                href={`/reports/${report.id}`}
                                className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:translate-x-1 group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {report.tractorName}
                                            </h2>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${report.status === 'OPEN'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : 'bg-gray-700/50 text-gray-400 border-gray-600'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(report.createdAt), 'PPP')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Tractor className="h-4 w-4" />
                                                <span>Ratio: {report.gearRatioValue}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            {report.tireBrandFront && (
                                                <span className="flex items-center gap-1">
                                                    <span className="font-semibold text-blue-900/70">F:</span> {report.tireBrandFront}
                                                </span>
                                            )}
                                            {report.tireBrandRear && (
                                                <span className="flex items-center gap-1">
                                                    <span className="font-semibold text-teal-900/70">R:</span> {report.tireBrandRear}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Additional metrics previews could go here */}
                                        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-300">
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}

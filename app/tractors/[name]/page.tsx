import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { Calendar, User as UserIcon, ArrowLeft, Tractor } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function TractorHistoryPage({
    params
}: {
    params: Promise<{ name: string }>
}) {
    const rawName = (await params).name
    const tractorName = decodeURIComponent(rawName)

    const reports = await prisma.report.findMany({
        where: { tractorName: { equals: tractorName, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    })

    if (reports.length === 0) {
        // Check if tractor exists at all
        const tractorExists = await prisma.tractorModel.findFirst({
            where: { name: { equals: tractorName, mode: 'insensitive' } }
        })
        if (!tractorExists) return notFound()
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/20">
                            <Tractor className="h-8 w-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {tractorName}
                            </h1>
                            <p className="text-gray-500">History of overrun tests</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report) => (
                        <Link
                            key={report.id}
                            href={`/reports/${report.id}`}
                            className="group block p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 transition-all duration-200"
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

                            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                                <span className="flex items-center gap-2">
                                    Ratio: <span className="text-cyan-400 font-mono">{report.gearRatioValue}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <UserIcon className="h-3 w-3" />
                                    {report.user?.username}
                                </span>
                            </div>
                        </Link>
                    ))}

                    {reports.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                            <p className="text-gray-500">No tests recorded yet for this model.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

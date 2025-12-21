
import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Calendar, User as UserIcon } from 'lucide-react'

export default async function Dashboard() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      status: true,
      tractorName: true,
      gearRatioValue: true,
      user: {
        select: { username: true }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-100 to-gray-400">
            Recent Tests
          </h1>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
            <FileText className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No tests found</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new overrun test.</p>
            <div className="mt-6">
              <Link
                href="/reports/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-gray-900"
              >
                Create Test
              </Link>
            </div>
          </div>
        ) : (
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

                <h4 className="text-lg font-medium text-gray-200 group-hover:text-blue-400 transition-colors mb-2">
                  {report.tractorName}
                </h4>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    Ratio: {report.gearRatioValue}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {report.user.username}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

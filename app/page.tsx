import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { DashboardSearch } from '@/components/DashboardSearch'
import { DashboardReportCard } from '@/components/DashboardReportCard'
import { Suspense } from 'react'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const query = (await searchParams).q

  const reports = await prisma.report.findMany({
    where: query ? {
      OR: [
        { tractorName: { contains: query, mode: 'insensitive' } },
        { user: { username: { contains: query, mode: 'insensitive' } } },
      ],
    } : {},
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
        <div className="flex flex-col items-center mb-10 space-y-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-100 via-gray-300 to-gray-500">
            Recent Tests
          </h1>
          <Suspense>
            <DashboardSearch />
          </Suspense>
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
              <DashboardReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

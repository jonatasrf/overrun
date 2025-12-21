
import { Header } from '@/components/Header'
import { ReportForm } from '@/components/ReportForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function NewReportPage() {
    const tractors = await prisma.tractorModel.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            gearRatio: true
        }
    })

    const tires = await prisma.tire.findMany({
        orderBy: { name: 'asc' }
    })

    // Debug log
    console.log('NewReportPage fetched tractors:', tractors.length)

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-teal-400 mb-2">
                    New Overrun Test
                </h1>
                <p className="text-gray-400 mb-8">
                    Enter measurement data to calculate overrun percentages.
                </p>

                <ReportForm tractors={tractors} tires={tires} />
            </main>
        </div>
    )
}

import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ReportDetailClient } from '@/components/ReportDetailClient'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Props = {
    params: Promise<{ id: string }>
}

export default async function ReportPage(props: Props) {
    const params = await props.params;
    const session = await getSession()

    const report = await prisma.report.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            measurements: true
        }
    })

    if (!report) return notFound()

    // Sync Logic: If report is OPEN, try to find the linked tractor and update displayed data
    let syncedGearRatio = report.gearRatioValue
    let syncedImage = report.tractorImage

    if (report.status === 'OPEN') {
        const linkedTractor = await prisma.tractorModel.findFirst({
            where: { name: report.tractorName }
        })

        if (linkedTractor) {
            syncedGearRatio = linkedTractor.gearRatio
            syncedImage = linkedTractor.image
        }
    }

    const tractors = await prisma.tractorModel.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            gearRatio: true
        }
    })

    const tires = await prisma.tire.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true
        }
    })

    const reportWithImage = {
        ...report,
        gearRatioValue: syncedGearRatio, // Use synced/overridden value
        tractorImage: syncedImage ? `data:image/jpeg;base64,${Buffer.from(syncedImage).toString('base64')}` : null,
    }

    // safe serialize to handle Dates
    const serializedReport = JSON.parse(JSON.stringify(reportWithImage))
    const serializedCurrentUser = JSON.parse(JSON.stringify(session))

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <div className="print:hidden">
                <Header />
            </div>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ReportDetailClient
                    report={serializedReport}
                    tractors={tractors}
                    tires={tires}
                    currentUser={serializedCurrentUser}
                />
            </main>
        </div>
    )
}

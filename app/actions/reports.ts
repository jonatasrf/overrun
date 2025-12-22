'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function createReport(data: {
    tractorName: string
    gearRatioValue: number
    measurements: any[]
    totalWeight?: string
    frontLoad?: string
    rearLoad?: string
    frontBallast?: string
    rearBallast?: string
    tireBrandFront?: string
    tireBrandRear?: string
}) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized: Only admins can create tests' }

    const {
        tractorName,
        gearRatioValue,
        measurements,
        totalWeight,
        frontLoad,
        rearLoad,
        frontBallast,
        rearBallast,
        tireBrandFront,
        tireBrandRear
    } = data

    if (!tractorName || !gearRatioValue || !measurements) {
        return { error: 'Invalid data' }
    }

    // Verify user exists (handle dev environment resets)
    const userId = session.userId as string
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
        return { error: 'Session expired. Please logout and login again.' }
    }

    const tractor = await prisma.tractorModel.findUnique({
        where: { name: tractorName }
    })

    try {
        const report = await prisma.report.create({
            data: {
                userId: userId,
                tractorName,
                gearRatioValue: Number(gearRatioValue),
                tractorImage: tractor?.image, // Save snapshot of image
                status: 'OPEN',
                totalWeight,
                frontLoad,
                rearLoad,
                frontBallast,
                rearBallast,
                tireBrandFront,
                tireBrandRear,
                measurements: {
                    create: measurements.map((m: any) => ({
                        type: m.type,
                        pressure: m.pressure,
                        val1: Number(m.val1) || 0,
                        val2: Number(m.val2) || 0,
                        val3: Number(m.val3) || 0,
                        average: (Number(m.val1 || 0) + Number(m.val2 || 0) + Number(m.val3 || 0)) / 3
                    }))
                }
            }
        })

        return { success: true, reportId: report.id }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to create report' }
    }
}

export async function updateReport(reportId: string, data: {
    tractorName: string
    gearRatioValue: number
    measurements: any[]
    totalWeight?: string
    frontLoad?: string
    rearLoad?: string
    frontBallast?: string
    rearBallast?: string
    tireBrandFront?: string
    tireBrandRear?: string
}) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const {
        tractorName,
        gearRatioValue,
        measurements,
        totalWeight,
        frontLoad,
        rearLoad,
        frontBallast,
        rearBallast,
        tireBrandFront,
        tireBrandRear
    } = data

    // Verify ownership or admin
    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) return { error: 'Report not found' }

    // Admin can edit open reports. Users cannot edit anything (per new rules).
    // Original creator check removed since strict rule says "common users cannot edit"
    if (session.role !== 'ADMIN') {
        return { error: 'Unauthorized: Only admins can edit reports' }
    }

    if (report.status === 'CLOSED') {
        return { error: 'Cannot edit closed report' }
    }

    try {
        // Transaction to update report and replace measurements
        await prisma.$transaction(async (tx) => {
            // Update Report Details
            await tx.report.update({
                where: { id: reportId },
                data: {
                    tractorName,
                    gearRatioValue: Number(gearRatioValue),
                    totalWeight,
                    frontLoad,
                    rearLoad,
                    frontBallast,
                    rearBallast,
                    tireBrandFront,
                    tireBrandRear
                }
            })

            // Delete existing measurements
            await tx.measurement.deleteMany({
                where: { reportId }
            })

            // Create new measurements
            for (const m of measurements) {
                await tx.measurement.create({
                    data: {
                        reportId,
                        type: m.type,
                        pressure: m.pressure,
                        val1: Number(m.val1) || 0,
                        val2: Number(m.val2) || 0,
                        val3: Number(m.val3) || 0,
                        average: (Number(m.val1 || 0) + Number(m.val2 || 0) + Number(m.val3 || 0)) / 3
                    }
                })
            }
        })

        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to update report' }
    }
}

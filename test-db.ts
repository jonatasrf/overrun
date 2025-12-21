
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
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
        console.log('Database query successful. Reports fetched:', reports.length)
        if (reports.length > 0) {
            console.log('Sample report user:', reports[0].user?.username)
        }
    } catch (error) {
        console.error('Database query failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()

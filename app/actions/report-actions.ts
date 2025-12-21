'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function closeReport(id: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') return { error: 'Unauthorized' }

    try {
        await prisma.report.update({
            where: { id },
            data: { status: 'CLOSED' }
        })
        revalidatePath(`/reports/${id}`)
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to close report' }
    }
}

export async function deleteReport(id: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') return { error: 'Unauthorized' }

    try {
        await prisma.report.delete({
            where: { id }
        })
        revalidatePath('/')
    } catch (error) {
        return { error: 'Failed to delete report' }
    }
    redirect('/')
}

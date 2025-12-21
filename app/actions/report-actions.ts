'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import * as bcrypt from 'bcryptjs'

export async function closeReport(id: string, password?: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') return { error: 'Unauthorized' }
    if (!password) return { error: 'Password is required' }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string }
    })

    if (!user) return { error: 'User not found' }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return { error: 'Invalid password' }

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

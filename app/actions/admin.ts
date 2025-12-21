'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function createTractor(formData: FormData) {
    const name = formData.get('name') as string
    const gearRatio = parseFloat(formData.get('gearRatio') as string)
    const imageFile = formData.get('image') as File | null

    if (!name || isNaN(gearRatio)) return { error: 'Invalid input' }

    let imageBytes: any = null
    if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer()
        imageBytes = Buffer.from(arrayBuffer)
    }

    // Check for duplicates
    const existing = await prisma.tractorModel.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existing) {
        return { error: 'Tractor with this name already exists' }
    }

    try {
        await prisma.tractorModel.create({
            data: {
                name,
                gearRatio,
                image: imageBytes
            }
        })
        revalidatePath('/admin')
        revalidatePath('/reports/new')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to create tractor' }
    }
}

export async function deleteTractor(id: string, formData: FormData) {
    try {
        await prisma.tractorModel.delete({ where: { id } })
        revalidatePath('/admin')
        revalidatePath('/reports/new')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete tractor' }
    }
}

export async function createUser(formData: FormData) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') return { error: 'Unauthorized' }

    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!username || !email || !password || !role) {
        return { error: 'All fields are required' }
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        }
    })

    if (existing) {
        return { error: 'Username or email already taken' }
    }

    const { hash } = await import('bcryptjs')
    const hashedPassword = await hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role
            }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to create user' }
    }
}

export async function createTire(formData: FormData) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const rim = formData.get('rim') as string
    const rollingCircumference = parseFloat(formData.get('rollingCircumference') as string)
    const staticLoadedRadius = parseFloat(formData.get('staticLoadedRadius') as string)
    const overallDiameter = parseFloat(formData.get('overallDiameter') as string)

    if (!name) {
        return { error: 'Name is required' }
    }

    // Check for duplicates
    const existing = await prisma.tire.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existing) {
        return { error: 'A tire with this name already exists' }
    }

    try {
        await prisma.tire.create({
            data: {
                name,
                rim: rim || null,
                rollingCircumference: isNaN(rollingCircumference) ? null : rollingCircumference,
                staticLoadedRadius: isNaN(staticLoadedRadius) ? null : staticLoadedRadius,
                overallDiameter: isNaN(overallDiameter) ? null : overallDiameter
            }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to create tire' }
    }
}

export async function deleteTire(id: string, formData: FormData) {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    try {
        await prisma.tire.delete({ where: { id } })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete tire' }
    }
}

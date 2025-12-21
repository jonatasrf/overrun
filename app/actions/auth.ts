'use server'

import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import * as bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    try {
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (!email || !password) {
            return { error: 'Missing fields' }
        }

        const user = await prisma.user.findFirst({
            where: { email },
        })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { error: 'Invalid credentials' }
        }

        const token = await signToken({ userId: user.id, role: user.role })

        const cookieStore = await cookies()
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })
    } catch (error) {
        console.error('Login error:', error)
        // If it's a redirect error, re-throw it so Next.js handles it
        if ((error as Error).message === 'NEXT_REDIRECT') {
            throw error
        }
        return { error: 'Something went wrong. Please try again.' }
    }

    redirect('/')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}

export async function register(formData: FormData) {
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!username || !email || !password) {
        return { error: 'Missing fields' }
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        })

        if (existingUser) {
            return { error: 'Username or email already taken' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: 'USER'
            }
        })

        const token = await signToken({ userId: user.id, role: user.role })

        const cookieStore = await cookies()
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })

    } catch (error) {
        return { error: 'Failed to create account' }
    }

    redirect('/')
}

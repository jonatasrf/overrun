
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    // Paths that don't require auth
    if (request.nextUrl.pathname.startsWith('/login')) {
        if (session && await verifyToken(session)) {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return NextResponse.next()
    }

    // Paths that require auth
    if (!session || !(await verifyToken(session))) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check for admin routes if needed in future
    // const payload = await verifyToken(session)
    // if (request.nextUrl.pathname.startsWith('/admin') && payload?.role !== 'ADMIN') {
    //   return NextResponse.redirect(new URL('/', request.url))
    // }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

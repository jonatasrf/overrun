
import Link from 'next/link'
import { LogoutButton } from './LogoutButton'
import { getSession } from '@/lib/auth'
import { PlusCircle, Settings, ClipboardList } from 'lucide-react'

export async function Header() {
    const session = await getSession()

    return (
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-teal-400">
                            OVERRUN
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/reports"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                        >
                            <ClipboardList className="h-4 w-4" />
                            Tests
                        </Link>

                        {session?.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                            >
                                <Settings className="h-4 w-4" />
                                Admin
                            </Link>
                        )}

                        <Link
                            href="/reports/new"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <PlusCircle className="h-4 w-4" />
                            New Test
                        </Link>

                        <div className="h-6 w-px bg-gray-700" />

                        <LogoutButton />
                    </div>
                </div>
            </div>
        </header>
    )
}

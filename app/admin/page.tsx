import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { deleteTractor, createTire, deleteTire } from '@/app/actions/admin'
import { Plus, Trash2, Tractor, Settings2, Disc, User, History } from 'lucide-react'
import Link from 'next/link'
import { TractorImageForm } from '@/components/TractorImageForm'
import { CreateUserForm } from '@/components/CreateUserForm'
import { CreateTireForm } from '@/components/CreateTireForm'

export default async function AdminPage() {
    const session = await getSession()
    const tractors = await prisma.tractorModel.findMany({
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            gearRatio: true,
            // Exclude image to avoid serialization issues and performance cost
        }
    })

    const tires = await prisma.tire.findMany({
        orderBy: { name: 'asc' }
    })

    const users = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        orderBy: { username: 'asc' }
    })

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <Header session={session} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400 mb-8">
                    Administration
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Add Tractor Section */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-400">
                            <Tractor className="h-5 w-5" />
                            Manage Tractors
                        </h2>

                        <TractorImageForm />

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {tractors.map((tractor) => (
                                <div key={tractor.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{tractor.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                            <Settings2 className="h-4 w-4" />
                                            <span>Ratio: <span className="text-cyan-400 font-mono">{tractor.gearRatio}</span></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/tractors/${encodeURIComponent(tractor.name)}`}
                                            className="text-purple-400 hover:text-purple-300 p-2 hover:bg-purple-400/10 rounded-lg transition-colors"
                                            title="View History"
                                        >
                                            <History className="h-5 w-5" />
                                        </Link>
                                        <form action={async (formData: FormData) => { 'use server'; await deleteTractor(tractor.id, formData) }}>
                                            <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Tire Section */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-400">
                            <Disc className="h-5 w-5" />
                            Manage Tires
                        </h2>

                        <CreateTireForm />

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {tires.map((tire) => (
                                <div key={tire.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-purple-200">{tire.name}</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-xs text-gray-400">
                                            <div><span className="text-gray-500">Rim:</span> {tire.rim || '-'}</div>
                                            <div><span className="text-gray-500">RC:</span> {tire.rollingCircumference ? `${tire.rollingCircumference}mm` : '-'}</div>
                                            <div><span className="text-gray-500">SLR:</span> {tire.staticLoadedRadius ? `${tire.staticLoadedRadius}mm` : '-'}</div>
                                            <div><span className="text-gray-500">OD:</span> {tire.overallDiameter ? `${tire.overallDiameter}mm` : '-'}</div>
                                        </div>
                                    </div>
                                    <form action={async (formData: FormData) => { 'use server'; await deleteTire(tire.id, formData) }}>
                                        <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Manage Users Section */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl col-span-1 lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-400">
                            <User className="h-5 w-5" />
                            Manage Users
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <CreateUserForm />

                            <div className="bg-gray-800/30 rounded-lg p-4">
                                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Administrators</h3>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {users.map(u => (
                                        <div key={u.id} className="flex justify-between items-center p-2 bg-gray-800 rounded border border-gray-700">
                                            <span className="font-medium text-white">{u.username}</span>
                                            <span className={`text-xs px-2 py-1 rounded font-bold ${u.role === 'ADMIN' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                                                {u.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

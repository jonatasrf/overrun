'use client'

import { createTire } from '@/app/actions/admin'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export function CreateTireForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setError(null)
        setLoading(true)

        try {
            const res = await createTire(formData)
            if (res?.success) {
                toast.success('Tire added successfully!')
                const form = document.getElementById('tire-form') as HTMLFormElement
                form?.reset()
            } else if (res?.error) {
                setError(res.error)
                toast.error(res.error)
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form id="tire-form" action={handleSubmit} className="space-y-4 mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Tire Name / Size</label>
                <input
                    type="text"
                    name="name"
                    placeholder="e.g. 520/85R42 (FIRESTONE)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                    required
                    onChange={() => setError(null)}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Rim (Aro)</label>
                    <input
                        type="text"
                        name="rim"
                        placeholder="e.g. W16L"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-purple-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">RC (mm)</label>
                    <input
                        type="number"
                        name="rollingCircumference"
                        placeholder="Circumference"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-purple-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">SLR (mm)</label>
                    <input
                        type="number"
                        name="staticLoadedRadius"
                        placeholder="Radius"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-purple-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">OD (mm)</label>
                    <input
                        type="number"
                        name="overallDiameter"
                        placeholder="Diameter"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-purple-500 outline-none"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" /> {loading ? 'Adding...' : 'Add Tire'}
                </button>
            </div>
        </form>
    )
}

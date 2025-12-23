'use client'

import { closeReport, deleteReport } from '@/app/actions/report-actions'
import { Lock, Trash2, Printer, FileDown, X, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

type Props = {
    reportId: string
    status: string
    isAdmin: boolean
}

export function ReportActions({ reportId, status, isAdmin }: Props) {
    const router = useRouter()
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGeneratePDF = () => {
        window.print()
    }

    const handleClose = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await closeReport(reportId, password)
            if (res.success) {
                toast.success('Test closed successfully')
                setShowPasswordModal(false)
                setPassword('')
                router.refresh()
            } else {
                const errorMsg = res.error || 'Failed to close'
                setError(errorMsg)
                toast.error(errorMsg)
            }
        } catch (err) {
            setError('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm('Are you sure you want to delete this test?')) return
        try {
            await deleteReport(reportId)
            toast.success('Test deleted successfully')
            router.push('/')
        } catch (err) {
            toast.error('Failed to delete test')
        }
    }

    return (
        <div className="flex flex-wrap gap-2 print:hidden w-full sm:w-auto">
            {status === 'OPEN' && isAdmin && (
                <div className="flex-1 sm:flex-none">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg shadow-md transition-colors font-medium whitespace-nowrap"
                    >
                        <Lock className="h-4 w-4" /> Close
                    </button>
                </div>
            )}

            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Lock className="h-5 w-5 text-yellow-500" />
                                Confirm Password
                            </h3>
                            <button
                                onClick={() => { setShowPasswordModal(false); setError(null); setPassword('') }}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-400 mb-6">
                            Enter your password to close this test. This action cannot be undone.
                        </p>

                        <form onSubmit={handleClose} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    placeholder="Your password"
                                    className={`w-full bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoFocus
                                    required
                                />
                                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowPasswordModal(false); setError(null); setPassword('') }}
                                    className="flex-1 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !password}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold shadow-lg shadow-yellow-900/20 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <button onClick={handleGeneratePDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md transition-colors font-medium whitespace-nowrap">
                <FileDown className="h-4 w-4" /> Generate PDF
            </button>

            {isAdmin && (
                <form onSubmit={handleDelete} className="flex-1 sm:flex-none">
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md transition-colors font-medium whitespace-nowrap">
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                </form>
            )}
        </div>
    )
}

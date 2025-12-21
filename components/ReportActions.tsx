'use client'

import { closeReport, deleteReport } from '@/app/actions/report-actions'
import { Lock, Trash2, Printer, FileDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
    reportId: string
    status: string
    isAdmin: boolean
}

export function ReportActions({ reportId, status, isAdmin }: Props) {
    const router = useRouter()

    const handlePrint = () => {
        window.print()
    }

    const handleClose = async () => {
        await closeReport(reportId)
        router.refresh()
    }

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm('Are you sure?')) return
        await deleteReport(reportId)
    }

    return (
        <div className="flex gap-2 print:hidden">
            {status === 'OPEN' && isAdmin && (
                <form action={handleClose}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg shadow-md transition-colors font-medium">
                        <Lock className="h-4 w-4" /> Close Report
                    </button>
                </form>
            )}

            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md transition-colors font-medium">
                <FileDown className="h-4 w-4" /> Print / PDF
            </button>

            {isAdmin && (
                <form onSubmit={handleDelete}>
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md transition-colors font-medium">
                        <Trash2 className="h-4 w-4" /> Delete
                    </button>
                </form>
            )}
        </div>
    )
}

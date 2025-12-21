'use client'

import { useState } from 'react'
import { OverrunMatrix } from '@/components/OverrunMatrix'
import { ReportActions } from '@/components/ReportActions'
import { updateReport } from '@/app/actions/reports'
import { useRouter } from 'next/navigation'
import { FileText, Calendar, User, Tractor, Settings, Scale, Edit2, Save, X, Disc } from 'lucide-react'

const PRESSURES = [24, 22, 20, 18, 16, 14]

type Props = {
    report: any
    tractors: any[]
    tires: any[]
    currentUser: any
}

export function ReportDetailClient({ report, tractors, tires, currentUser }: Props) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Editing State
    const [formData, setFormData] = useState({
        tractorName: report.tractorName,
        gearRatioValue: report.gearRatioValue,
        totalWeight: report.totalWeight || '',
        frontLoad: report.frontLoad || '',
        rearLoad: report.rearLoad || '',
        frontBallast: report.frontBallast || '',
        rearBallast: report.rearBallast || '',
        tireBrandFront: report.tireBrandFront || '',
        tireBrandRear: report.tireBrandRear || ''
    })

    // Reconstruct measurements object from array
    const [measurements, setMeasurements] = useState(() => {
        const initial: any = {}
        // Initialize empty
        PRESSURES.forEach(p => {
            initial[`FRONT_${p}`] = { val1: '', val2: '', val3: '' }
            initial[`REAR_${p}`] = { val1: '', val2: '', val3: '' }
        })
        // Fill with existing
        report.measurements.forEach((m: any) => {
            initial[`${m.type}_${m.pressure}`] = {
                val1: m.val1?.toString() || '',
                val2: m.val2?.toString() || '',
                val3: m.val3?.toString() || ''
            }
        })
        return initial
    })

    const handleMeasurementChange = (type: 'FRONT' | 'REAR', pressure: number, field: 'val1' | 'val2' | 'val3', value: string) => {
        setMeasurements((prev: any) => ({
            ...prev,
            [`${type}_${pressure}`]: {
                ...prev[`${type}_${pressure}`],
                [field]: value
            }
        }))
    }

    const handleSave = async () => {
        setLoading(true)

        // Transform measurements
        const measurementsList = []
        for (const pressure of PRESSURES) {
            measurementsList.push({
                type: 'FRONT',
                pressure,
                ...measurements[`FRONT_${pressure}`]
            })
            measurementsList.push({
                type: 'REAR',
                pressure,
                ...measurements[`REAR_${pressure}`]
            })
        }

        const res = await updateReport(report.id, {
            ...formData,
            measurements: measurementsList
        })

        if (res.success) {
            setIsEditing(false)
            router.refresh()
        } else {
            alert(res.error || 'Failed to update')
        }
        setLoading(false)
    }

    // Helper to calculate average for display during edit
    const getAvg = (type: string, pressure: number) => {
        const m = measurements[`${type}_${pressure}`]
        const v1 = Number(m.val1) || 0
        const v2 = Number(m.val2) || 0
        const v3 = Number(m.val3) || 0
        return ((v1 + v2 + v3) / 3) || 0
    }

    // Construct live measurements for Matrix preview during edit
    const liveMeasurements = []
    for (const pressure of PRESSURES) {
        liveMeasurements.push({ type: 'FRONT', pressure, average: getAvg('FRONT', pressure) })
        liveMeasurements.push({ type: 'REAR', pressure, average: getAvg('REAR', pressure) })
    }

    const displayedMeasurements = isEditing ? liveMeasurements : report.measurements
    const displayedGearRatio = isEditing ? Number(formData.gearRatioValue) : report.gearRatioValue

    const canEdit = report.status === 'OPEN' && currentUser?.role === 'ADMIN'

    return (
        <div className="space-y-8 print:space-y-4">
            {/* Header / Actions */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:p-0 print:border-none print:mb-2">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">
                            {isEditing ? 'Editing Test' : 'Test Report'}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${report.status === 'CLOSED' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}>
                            {report.status}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(report.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {report.user.username}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-4 items-center print:hidden w-full sm:w-auto mt-4 sm:mt-0">
                    {!isEditing && canEdit && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors w-full sm:w-auto"
                        >
                            <Edit2 className="h-4 w-4" /> Edit
                        </button>
                    )}

                    {isEditing && (
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                            >
                                <X className="h-4 w-4" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" /> Save
                            </button>
                        </div>
                    )}

                    {!isEditing && (
                        <ReportActions reportId={report.id} status={report.status} isAdmin={currentUser?.role === 'ADMIN'} />
                    )}
                </div>
            </div>

            {/* Tractor Data */}
            {/* Tractor Data */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 print:border-none print:shadow-none print:p-0 print:mb-2">
                <h3 className="text-lg font-bold text-gray-100 mb-6 flex items-center gap-2 print:text-black print:mb-2 print:border-b-2 print:border-black print:pb-1">
                    <Tractor className="h-5 w-5 text-purple-400 print:hidden" />
                    Tractor Configuration
                </h3>

                <div className="print:hidden">
                    {/* Normal Screen Layout (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Model & Ratio */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                                <Settings className="h-4 w-4" /> General
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Model</label>
                                    {isEditing ? (
                                        <select
                                            className="w-full bg-gray-800 border-gray-700 rounded text-white px-2 py-1 mt-1"
                                            value={formData.tractorName}
                                            onChange={e => {
                                                const selectedName = e.target.value
                                                const tractor = tractors.find(t => t.name === selectedName)
                                                if (tractor) {
                                                    setFormData({
                                                        ...formData,
                                                        tractorName: tractor.name,
                                                        gearRatioValue: tractor.gearRatio,
                                                        // Optional: Update image if available in the new tractor model
                                                        // tractorImage: tractor.image ? ... : formData.tractorImage
                                                    })
                                                }
                                            }}
                                        >
                                            <option value="">Select Tractor</option>
                                            {tractors.map((t: any) => (
                                                <option key={t.id} value={t.name}>{t.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="text-xl font-bold text-white">{report.tractorName}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Ratio</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.0001"
                                            readOnly
                                            className="w-full bg-gray-800 border-gray-700 rounded text-cyan-400 font-mono px-2 py-1 mt-1 opacity-70 cursor-not-allowed"
                                            value={formData.gearRatioValue}
                                        // Disabled onChange since it's read-only and controlled by tractor selection
                                        />
                                    ) : (
                                        <div className="text-xl font-bold text-cyan-400 font-mono">{report.gearRatioValue}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        {report.tractorImage && (
                            <div className="row-span-2 flex items-center justify-center p-2 bg-gray-800/50 rounded-lg border border-gray-700 print:hidden h-full">
                                <img
                                    src={report.tractorImage}
                                    alt="Tractor"
                                    className="w-full h-full object-contain rounded"
                                />
                            </div>
                        )}

                        {/* Weights */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                                <Scale className="h-4 w-4" /> Weights
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Total Weight</label>
                                    {isEditing ? (
                                        <div className="w-full bg-gray-800/50 border border-gray-700 rounded text-white px-2 py-1 text-sm font-bold text-center">
                                            {(Number(formData.frontLoad) + Number(formData.rearLoad)) || 0} kg
                                        </div>
                                    ) : <div className="text-white text-sm font-bold">{report.totalWeight ? `${report.totalWeight} kg` : '-'}</div>}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">F. Ballast</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            className="w-full bg-gray-800 border-gray-700 rounded text-white px-2 py-1 text-sm"
                                            value={formData.frontBallast}
                                            onChange={e => setFormData({ ...formData, frontBallast: e.target.value })}
                                        />
                                    ) : <div className="text-white text-sm">{report.frontBallast || '-'}</div>}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">
                                        F/A Load
                                        {formData.frontLoad && formData.rearLoad && (
                                            <span className="text-blue-400 ml-1">
                                                ({Math.round((Number(formData.frontLoad) / (Number(formData.frontLoad) + Number(formData.rearLoad))) * 100)}%)
                                            </span>
                                        )}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            className="w-full bg-gray-800 border-gray-700 rounded text-white px-2 py-1 text-sm"
                                            value={formData.frontLoad}
                                            onChange={e => {
                                                const front = e.target.value
                                                const total = Number(front) + Number(formData.rearLoad)
                                                setFormData({ ...formData, frontLoad: front, totalWeight: total.toString() })
                                            }}
                                        />
                                    ) : <div className="text-white text-sm">{report.frontLoad ? `${report.frontLoad} kg (${Math.round((Number(report.frontLoad) / Number(report.totalWeight)) * 100)}%)` : '-'}</div>}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">
                                        R/A Load
                                        {formData.frontLoad && formData.rearLoad && (
                                            <span className="text-teal-400 ml-1">
                                                ({Math.round((Number(formData.rearLoad) / (Number(formData.frontLoad) + Number(formData.rearLoad))) * 100)}%)
                                            </span>
                                        )}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            className="w-full bg-gray-800 border-gray-700 rounded text-white px-2 py-1 text-sm"
                                            value={formData.rearLoad}
                                            onChange={e => {
                                                const rear = e.target.value
                                                const total = Number(formData.frontLoad) + Number(rear)
                                                setFormData({ ...formData, rearLoad: rear, totalWeight: total.toString() })
                                            }}
                                        />
                                    ) : <div className="text-white text-sm">{report.rearLoad ? `${report.rearLoad} kg (${Math.round((Number(report.rearLoad) / Number(report.totalWeight)) * 100)}%)` : '-'}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Tires */}
                        <div className="space-y-4 col-span-1 lg:col-span-2">
                            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
                                <Disc className="h-4 w-4" /> Tires
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Front Tire</label>
                                    {isEditing ? (
                                        <select
                                            className="w-full bg-gray-800 border-gray-700 rounded text-white px-2 py-1 text-sm appearance-none"
                                            value={formData.tireBrandFront}
                                            onChange={e => setFormData({ ...formData, tireBrandFront: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            {tires.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                        </select>
                                    ) : <div className="text-blue-300 font-medium text-sm">{report.tireBrandFront || '-'}</div>}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Rear Tire</label>
                                    {isEditing ? (
                                        <select
                                            className="w-full bg-gray-800 border-gray-700 rounded text-white px-2 py-1 text-sm appearance-none"
                                            value={formData.tireBrandRear}
                                            onChange={e => setFormData({ ...formData, tireBrandRear: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            {tires.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                        </select>
                                    ) : <div className="text-teal-300 font-medium text-sm">{report.tireBrandRear || '-'}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden print:flex print:gap-4 print:items-stretch">
                    {/* Print Layout (Side by Side) */}
                    {report.tractorImage && (
                        <div className="w-1/3 border border-gray-300 p-2 bg-white flex items-center justify-center">
                            <img
                                src={report.tractorImage}
                                alt="Tractor"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <table className="w-full text-xs text-black border-collapse border border-gray-300 h-full">
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-bold bg-gray-100 w-1/4">Model</td>
                                    <td className="border border-gray-300 p-2 w-1/4">{report.tractorName}</td>
                                    <td className="border border-gray-300 p-2 font-bold bg-gray-100 w-1/4">Total Weight</td>
                                    <td className="border border-gray-300 p-2 w-1/4">{report.totalWeight ? `${report.totalWeight} kg` : '-'}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-bold bg-gray-100">Ratio</td>
                                    <td className="border border-gray-300 p-2 font-mono">{report.gearRatioValue}</td>
                                    <td className="border border-gray-300 p-2 font-bold bg-gray-100">Front Ballast</td>
                                    <td className="border border-gray-300 p-2">{report.frontBallast || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-bold bg-gray-100">Front Tire</td>
                                    <td className="border border-gray-300 p-2">{report.tireBrandFront || '-'}</td>
                                    <td className="border border-gray-300 p-2 font-bold bg-gray-100">F/A Load</td>
                                    <td className="border border-gray-300 p-2">
                                        {report.frontLoad ? `${report.frontLoad} kg (${Math.round((Number(report.frontLoad) / Number(report.totalWeight)) * 100)}%)` : '-'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-bold bg-gray-100">Rear Tire</td>
                                    <td className="border border-gray-300 p-2">{report.tireBrandRear || '-'}</td>
                                    <td className="border border-gray-300 p-2 font-bold bg-gray-100">R/A Load</td>
                                    <td className="border border-gray-300 p-2">
                                        {report.rearLoad ? `${report.rearLoad} kg (${Math.round((Number(report.rearLoad) / Number(report.totalWeight)) * 100)}%)` : '-'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Matrix Section */}
            <div className="print:w-full print:mb-8">
                <OverrunMatrix measurements={displayedMeasurements} gearRatio={displayedGearRatio} />
            </div>

            {/* Details & Edit Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-grid-2 print:mt-1 print:text-[10px]">
                {/* Front */}
                <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 ${isEditing ? 'ring-2 ring-blue-500/20' : ''} print:border-none print:p-0 print:bg-white`}>
                    <h3 className="text-lg font-bold text-blue-400 mb-2 print:text-sm print:mb-2 print:text-black print:border-b-2 print:border-black print:pb-1">Front Measurements</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400 print:text-[10px] print:border print:border-gray-300">
                            <thead className="text-xs uppercase bg-gray-800 text-gray-300 print:bg-gray-200 print:text-black font-bold">
                                <tr>
                                    <th className="px-4 py-2 print:px-1 print:py-0">PSI</th>
                                    <th className="px-4 py-2 print:px-1 print:py-0">Values {isEditing && <span className="text-[10px] text-gray-500 normal-case">(Test 1, 2, 3)</span>}</th>
                                    {!isEditing && <th className="px-4 py-2 print:px-1 print:py-0">Avg</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 print:divide-gray-300">
                                {PRESSURES.map(pressure => {
                                    const m = displayedMeasurements.find((x: any) => x.type === 'FRONT' && x.pressure === pressure)
                                    return (
                                        <tr key={pressure} className="print:border-b print:border-gray-200">
                                            <td className="px-4 py-2 font-mono text-blue-300 print:text-black print:px-2 print:py-1 print:font-bold print:bg-gray-50">{pressure}</td>
                                            <td className="px-4 py-2 print:px-2 print:py-1 print:border-l print:border-r print:border-gray-200">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        {['val1', 'val2', 'val3'].map(field => (
                                                            <input
                                                                key={field}
                                                                className="w-16 bg-gray-800 border border-gray-700 rounded px-1 text-white text-center"
                                                                value={measurements[`FRONT_${pressure}`][field as any]}
                                                                onChange={e => handleMeasurementChange('FRONT', pressure, field as any, e.target.value)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500 print:text-black">
                                                        {m?.val1}, {m?.val2}, {m?.val3}
                                                    </span>
                                                )}
                                            </td>
                                            {!isEditing && <td className="px-4 py-2 font-bold text-white print:text-black print:px-1 print:py-0">{m?.average?.toFixed(2)}</td>}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rear */}
                <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 ${isEditing ? 'ring-2 ring-teal-500/20' : ''} print:border-none print:p-0 print:bg-white`}>
                    <h3 className="text-lg font-bold text-teal-400 mb-2 print:text-sm print:mb-2 print:text-black print:border-b-2 print:border-black print:pb-1">Rear Measurements</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400 print:text-[10px] print:border print:border-gray-300">
                            <thead className="text-xs uppercase bg-gray-800 text-gray-300 print:bg-gray-200 print:text-black font-bold">
                                <tr>
                                    <th className="px-4 py-2 print:px-1 print:py-0">PSI</th>
                                    <th className="px-4 py-2 print:px-1 print:py-0">Values {isEditing && <span className="text-[10px] text-gray-500 normal-case">(Test 1, 2, 3)</span>}</th>
                                    {!isEditing && <th className="px-4 py-2 print:px-1 print:py-0">Avg</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 print:divide-gray-300">
                                {PRESSURES.map(pressure => {
                                    const m = displayedMeasurements.find((x: any) => x.type === 'REAR' && x.pressure === pressure)
                                    return (
                                        <tr key={pressure} className="print:border-b print:border-gray-200">
                                            <td className="px-4 py-2 font-mono text-teal-300 print:text-black print:px-2 print:py-1 print:font-bold print:bg-gray-50">{pressure}</td>
                                            <td className="px-4 py-2 print:px-2 print:py-1 print:border-l print:border-r print:border-gray-200">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        {['val1', 'val2', 'val3'].map(field => (
                                                            <input
                                                                key={field}
                                                                className="w-16 bg-gray-800 border border-gray-700 rounded px-1 text-white text-center"
                                                                value={measurements[`REAR_${pressure}`][field as any]}
                                                                onChange={e => handleMeasurementChange('REAR', pressure, field as any, e.target.value)}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500 print:text-black">
                                                        {m?.val1}, {m?.val2}, {m?.val3}
                                                    </span>
                                                )}
                                            </td>
                                            {!isEditing && <td className="px-4 py-2 font-bold text-white print:text-black print:px-1 print:py-0">{m?.average?.toFixed(2)}</td>}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    )
}

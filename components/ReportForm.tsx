'use client'

import { useState } from 'react'
import { createReport } from '@/app/actions/reports'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Info, Scale, Settings } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { MeasurementTable } from './MeasurementTable'

type Props = {
    tractors: any[]
    tires?: any[]
}

const PRESSURES = [24, 22, 20, 18, 16, 14]

export function ReportForm({ tractors, tires = [] }: Props) {
    console.log('ReportForm received tractors:', tractors?.length)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedTractorId, setSelectedTractorId] = useState('')

    // Extra Tractor Data State
    const [totalWeight, setTotalWeight] = useState('')
    const [frontLoad, setFrontLoad] = useState('')
    const [rearLoad, setRearLoad] = useState('')
    const [frontBallast, setFrontBallast] = useState('')
    const [rearBallast, setRearBallast] = useState('')
    const [tireBrandFront, setTireBrandFront] = useState('')
    const [tireBrandRear, setTireBrandRear] = useState('')

    // Initialize measurements state
    const [measurements, setMeasurements] = useState<{
        [key: string]: { val1: string; val2: string; val3: string }
    }>(() => {
        const initial: any = {}
        PRESSURES.forEach(p => {
            initial[`FRONT_${p}`] = { val1: '', val2: '', val3: '' }
            initial[`REAR_${p}`] = { val1: '', val2: '', val3: '' }
        })
        return initial
    })

    // Get current tractor object
    const selectedTractor = tractors.find(t => t.id === selectedTractorId)

    const handleMeasurementChange = (type: 'FRONT' | 'REAR', pressure: number, field: 'val1' | 'val2' | 'val3', value: string) => {
        setMeasurements(prev => ({
            ...prev,
            [`${type}_${pressure}`]: {
                ...prev[`${type}_${pressure}`],
                [field]: value
            }
        }))
    }

    const handleSubmit = async () => {
        if (!selectedTractor) return

        setLoading(true)

        // Transform state to array for API
        const measurementsList = []

        for (const pressure of PRESSURES) {
            // Front
            const front = measurements[`FRONT_${pressure}`]
            measurementsList.push({
                type: 'FRONT',
                pressure,
                val1: front.val1,
                val2: front.val2,
                val3: front.val3
            })

            // Rear
            const rear = measurements[`REAR_${pressure}`]
            measurementsList.push({
                type: 'REAR',
                pressure,
                val1: rear.val1,
                val2: rear.val2,
                val3: rear.val3
            })
        }

        const fLoadNum = parseFloat(frontLoad) || 0
        const rLoadNum = parseFloat(rearLoad) || 0
        const computedTotal = fLoadNum + rLoadNum

        const res = await createReport({
            tractorName: selectedTractor.name,
            gearRatioValue: selectedTractor.gearRatio,
            measurements: measurementsList,
            totalWeight: computedTotal.toString(),
            frontLoad,
            rearLoad,
            frontBallast,
            rearBallast,
            tireBrandFront,
            tireBrandRear
        })

        if (res.success) {
            toast.success('Test generated successfully!')
            router.push(`/reports/${res.reportId}`)
        } else {
            toast.error(res.error || 'Error creating test')
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Configuration */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-400" />
                    Essential Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Tractor Model</label>
                        <select
                            value={selectedTractorId}
                            onChange={(e) => setSelectedTractorId(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        >
                            <option value="">Select Tractor...</option>
                            {tractors.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Gear Ratio</label>
                        <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-300">
                            {selectedTractor ? (
                                <span className="text-cyan-400 font-mono font-bold">{selectedTractor.gearRatio}</span>
                            ) : (
                                <span className="text-gray-600 italic">Select a tractor...</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tractor Data & Tires */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Scale className="h-5 w-5 text-cyan-400" />
                        Tractor Weights & Loads
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        {/* Loads & Percentages */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="flex justify-between text-xs font-medium text-gray-400 mb-1">
                                    <span>F/A Load</span>
                                    {(parseFloat(frontLoad) > 0 || parseFloat(rearLoad) > 0) && (
                                        <span className="text-cyan-400 font-bold">
                                            {Math.round(((parseFloat(frontLoad) || 0) / ((parseFloat(frontLoad) || 0) + (parseFloat(rearLoad) || 0))) * 100) || 0}%
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    value={frontLoad}
                                    onChange={e => setFrontLoad(e.target.value)}
                                    placeholder="e.g. 710"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex justify-between text-xs font-medium text-gray-400 mb-1">
                                    <span>R/A Load</span>
                                    {(parseFloat(frontLoad) > 0 || parseFloat(rearLoad) > 0) && (
                                        <span className="text-cyan-400 font-bold">
                                            {Math.round(((parseFloat(rearLoad) || 0) / ((parseFloat(frontLoad) || 0) + (parseFloat(rearLoad) || 0))) * 100) || 0}%
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    value={rearLoad}
                                    onChange={e => setRearLoad(e.target.value)}
                                    placeholder="e.g. 770"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Computed Total Weight */}
                        <div className="bg-gray-800/30 border border-dashed border-gray-700 rounded-lg p-3">
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Estimated Total Weight</label>
                            <div className="text-xl font-mono font-black text-white flex items-baseline gap-1">
                                {(parseFloat(frontLoad) || 0) + (parseFloat(rearLoad) || 0)}
                                <span className="text-xs text-gray-500 font-normal">kg</span>
                            </div>
                        </div>

                        {/* Ballasts - Side by Side Last */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Front Ballast</label>
                                <input
                                    type="text"
                                    value={frontBallast}
                                    onChange={e => setFrontBallast(e.target.value)}
                                    placeholder="e.g. 107Kg"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Rear Ballast</label>
                                <input
                                    type="text"
                                    value={rearBallast}
                                    onChange={e => setRearBallast(e.target.value)}
                                    placeholder="e.g. 50Kg"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-purple-400" />
                        Tire Specifications
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Front Tire Size & Brand</label>
                            <select
                                value={tireBrandFront}
                                onChange={e => setTireBrandFront(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-purple-500 text-sm appearance-none"
                            >
                                <option value="">Select Front Tire...</option>
                                {tires?.map((t: any) => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Rear Tire Size & Brand</label>
                            <select
                                value={tireBrandRear}
                                onChange={e => setTireBrandRear(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-purple-500 text-sm appearance-none"
                            >
                                <option value="">Select Rear Tire...</option>
                                {tires?.map((t: any) => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Measurements Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MeasurementTable
                    type="FRONT"
                    measurements={measurements}
                    pressures={PRESSURES}
                    isEditing={true}
                    onChange={handleMeasurementChange}
                />
                <MeasurementTable
                    type="REAR"
                    measurements={measurements}
                    pressures={PRESSURES}
                    isEditing={true}
                    onChange={handleMeasurementChange}
                />
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedTractor}
                    className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Generate Test
                </button>
            </div>
        </div>
    )
}

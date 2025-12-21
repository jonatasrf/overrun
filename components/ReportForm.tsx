'use client'

import { useState } from 'react'
import { createReport } from '@/app/actions/reports'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Info, Scale, Settings } from 'lucide-react'

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

        const res = await createReport({
            tractorName: selectedTractor.name,
            gearRatioValue: selectedTractor.gearRatio,
            measurements: measurementsList,
            totalWeight,
            frontLoad,
            rearLoad,
            frontBallast,
            rearBallast,
            tireBrandFront,
            tireBrandRear
        })

        if (res.success) {
            router.push(`/reports/${res.reportId}`)
        } else {
            alert(res.error || 'Error creating test')
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
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Total Weight</label>
                                <input
                                    type="text"
                                    value={totalWeight}
                                    onChange={e => setTotalWeight(e.target.value)}
                                    placeholder="e.g. 1480Kg"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm"
                                />
                            </div>
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">F/A Load</label>
                                <input
                                    type="text"
                                    value={frontLoad}
                                    onChange={e => setFrontLoad(e.target.value)}
                                    placeholder="e.g. 710Kg (48%)"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">R/A Load</label>
                                <input
                                    type="text"
                                    value={rearLoad}
                                    onChange={e => setRearLoad(e.target.value)}
                                    placeholder="e.g. 770Kg (52%)"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm"
                                />
                            </div>
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
                {/* Front Tires */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="bg-linear-to-r from-blue-900/50 to-blue-800/50 px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-bold text-blue-100">Front Tires Measurements</h3>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th className="px-3 py-2">PSI</th>
                                    <th className="px-3 py-2">Test 1</th>
                                    <th className="px-3 py-2">Test 2</th>
                                    <th className="px-3 py-2">Test 3</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {PRESSURES.map(pressure => (
                                    <tr key={`front-${pressure}`}>
                                        <td className="px-3 py-2 font-mono text-blue-400 font-bold">{pressure}</td>
                                        {(['val1', 'val2', 'val3'] as const).map(field => (
                                            <td key={field} className="px-1 py-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-center text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                    value={measurements[`FRONT_${pressure}`][field]}
                                                    onChange={(e) => handleMeasurementChange('FRONT', pressure, field, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rear Tires */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="bg-linear-to-r from-teal-900/50 to-teal-800/50 px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-bold text-teal-100">Rear Tires Measurements</h3>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th className="px-3 py-2">PSI</th>
                                    <th className="px-3 py-2">Test 1</th>
                                    <th className="px-3 py-2">Test 2</th>
                                    <th className="px-3 py-2">Test 3</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {PRESSURES.map(pressure => (
                                    <tr key={`rear-${pressure}`}>
                                        <td className="px-3 py-2 font-mono text-teal-400 font-bold">{pressure}</td>
                                        {(['val1', 'val2', 'val3'] as const).map(field => (
                                            <td key={field} className="px-1 py-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-center text-white focus:ring-1 focus:ring-teal-500 outline-none"
                                                    value={measurements[`REAR_${pressure}`][field]}
                                                    onChange={(e) => handleMeasurementChange('REAR', pressure, field, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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

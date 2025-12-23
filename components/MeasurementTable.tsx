'use client'

import { clsx } from 'clsx'

type MeasurementData = {
    val1: string
    val2: string
    val3: string
}

type Props = {
    type: 'FRONT' | 'REAR'
    measurements: {
        [key: string]: MeasurementData
    }
    pressures: number[]
    isEditing?: boolean
    onChange?: (type: 'FRONT' | 'REAR', pressure: number, field: 'val1' | 'val2' | 'val3', value: string) => void
}

export function MeasurementTable({ type, measurements, pressures, isEditing = false, onChange }: Props) {
    const isFront = type === 'FRONT'
    const themeColor = isFront ? 'blue' : 'teal'

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden print:border-none print:shadow-none">
            <div className={clsx(
                "px-6 py-4 border-b border-gray-800 print:px-0 print:border-none print:pb-1",
                isFront ? "bg-linear-to-r from-blue-900/50 to-blue-800/50" : "bg-linear-to-r from-teal-900/50 to-teal-800/50",
                "print:bg-none"
            )}>
                <h3 className={clsx(
                    "text-lg font-bold print:text-black print:text-sm",
                    isFront ? "text-blue-100" : "text-teal-100"
                )}>
                    {isFront ? 'Front Tires Measurements' : 'Rear Tires Measurements'}
                </h3>
            </div>
            <div className="p-4 overflow-x-auto print:p-0">
                <table className="w-full">
                    <thead>
                        <tr className="hidden sm:table-row text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:table-row print:text-black">
                            <th className="px-3 py-2 print:py-1">PSI</th>
                            <th className="px-3 py-2 print:py-1">Test 1</th>
                            <th className="px-3 py-2 print:py-1">Test 2</th>
                            <th className="px-3 py-2 print:py-1">Test 3</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 print:divide-black/10">
                        {pressures.map(pressure => {
                            const data = measurements[`${type}_${pressure}`] || { val1: '', val2: '', val3: '' }
                            return (
                                <tr key={`${type}-${pressure}`} className="flex flex-col sm:table-row border-b border-gray-800 sm:border-0 py-2 sm:py-0 print:table-row print:border-black/5">
                                    <td className={clsx(
                                        "px-3 py-2 font-mono font-bold sm:table-cell print:py-1 print:text-[10px] print:text-black",
                                        isFront ? "text-blue-400" : "text-teal-400"
                                    )}>
                                        <span className="sm:hidden print:hidden text-[10px] text-gray-500 block uppercase mb-1">Pressure</span>
                                        {pressure}
                                    </td>
                                    {(['val1', 'val2', 'val3'] as const).map((field, idx) => (
                                        <td key={field} className="px-3 py-1 sm:px-1 sm:py-1 sm:table-cell print:py-1">
                                            <span className="sm:hidden print:hidden text-[10px] text-gray-500 block uppercase mb-1">Test {idx + 1}</span>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className={clsx(
                                                        "w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-center text-white focus:ring-1 outline-none transition-all",
                                                        isFront ? "focus:ring-blue-500" : "focus:ring-teal-500"
                                                    )}
                                                    value={data[field]}
                                                    onChange={(e) => onChange?.(type, pressure, field, e.target.value)}
                                                />
                                            ) : (
                                                <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded px-2 py-1 text-sm text-center text-gray-300 print:bg-transparent print:border-none print:text-black print:text-[10px]">
                                                    {data[field] || '-'}
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

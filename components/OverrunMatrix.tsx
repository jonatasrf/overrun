
import { clsx } from 'clsx'
import { useState } from 'react'

type Measurement = {
    type: string
    pressure: number
    average: number
}

type Props = {
    measurements: Measurement[]
    gearRatio: number
}

const PRESSURES = [24, 22, 20, 18, 16, 14]

function getStatusColor(percent: number) {
    if (percent >= 3 && percent <= 5) return 'bg-green-500/20 text-green-400 border-green-500/50'
    if ((percent >= 1 && percent < 3) || (percent > 5 && percent <= 7)) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    return 'bg-red-500/20 text-red-400 border-red-500/50'
}

function getStatusLabel(percent: number) {
    if (percent >= 3 && percent <= 5) return 'IDEAL'
    if ((percent >= 1 && percent < 3) || (percent > 5 && percent <= 7)) return 'AVAILABLE'
    return 'BAD'
}

export function OverrunMatrix({ measurements, gearRatio }: Props) {
    const [activeCell, setActiveCell] = useState<{ front: number; rear: number } | null>(null)

    // Helper to get average for a specific tyre/pressure
    const getAvg = (type: 'FRONT' | 'REAR', pressure: number) => {
        return measurements.find(m => m.type === type && m.pressure === pressure)?.average || 0
    }

    return (
        <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800 shadow-2xl p-6 print:shadow-none print:border-none print:p-0 print:bg-white">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400 mb-6 print:text-black print:bg-none">
                Overrun Matrix
            </h3>

            <div className="relative print:pl-8">
                {/* Y Axis Label - Left Side */}
                <div className="absolute -left-8 top-1/2 -rotate-90 transform -translate-y-1/2 text-sm font-bold text-gray-400 whitespace-nowrap print:block print:text-black print:text-[10px] print:left-0">
                    FRONT PSI
                </div>

                {/* X Axis Label */}
                <div className="text-center mb-2 text-sm font-bold text-gray-400 print:mb-1 print:text-black print:text-xs">
                    REAR PSI
                </div>

                <table className="w-full border-collapse print:w-full">
                    <thead>
                        <tr>
                            <th className="p-2 w-16 print:border-none print:w-8 print:p-0"></th>
                            {[...PRESSURES].reverse().map(p => (
                                <th
                                    key={p}
                                    className={clsx(
                                        "p-2 text-teal-400 font-mono text-lg print:text-[10px] print:p-0 print:h-10 print:align-middle text-center transition-colors duration-200",
                                        activeCell?.rear === p ? "text-white bg-teal-500/10 rounded-t-lg" : "opacity-60"
                                    )}
                                >
                                    {p}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PRESSURES.map((frontPsi, rowIndex) => (
                            <tr key={frontPsi}>
                                <th
                                    className={clsx(
                                        "p-2 text-blue-400 font-mono text-lg print:text-[10px] print:p-0 print:border-none print:w-8 print:h-10 print:align-middle text-center transition-colors duration-200",
                                        activeCell?.front === frontPsi ? "text-white bg-blue-500/10 rounded-l-lg" : "opacity-60"
                                    )}
                                >
                                    {frontPsi}
                                </th>
                                {[...PRESSURES].reverse().map((rearPsi, colIndex) => {
                                    const frontAvg = getAvg('FRONT', frontPsi)
                                    const rearAvg = getAvg('REAR', rearPsi)

                                    // Corrected Formula: ((FrontAvg * GearRatio) / RearAvg) - 1
                                    let percent = 0
                                    if (rearAvg > 0) {
                                        percent = ((frontAvg * gearRatio) / rearAvg) - 1
                                    }

                                    const percentVal = percent * 100
                                    const colorClass = getStatusColor(percentVal)

                                    const isSelected = activeCell?.front === frontPsi && activeCell?.rear === rearPsi
                                    const activeRowIndex = activeCell ? PRESSURES.indexOf(activeCell.front) : -1
                                    const activeColIndex = activeCell ? [...PRESSURES].reverse().indexOf(activeCell.rear) : -1

                                    const isRowHighlight = activeCell && rowIndex === activeRowIndex && colIndex <= activeColIndex
                                    const isColHighlight = activeCell && colIndex === activeColIndex && rowIndex <= activeRowIndex
                                    const isHighlighted = isRowHighlight || isColHighlight

                                    return (
                                        <td key={rearPsi} className="p-1 print:p-px">
                                            <div
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setActiveCell(null)
                                                    } else {
                                                        setActiveCell({ front: frontPsi, rear: rearPsi })
                                                    }
                                                }}
                                                className={clsx(
                                                    "h-16 flex flex-col items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden relative print:h-10 print:w-full print:border print:rounded-md",
                                                    colorClass,
                                                    isSelected
                                                        ? "scale-105 z-10 border-white ring-2 ring-white/50 shadow-lg shadow-white/10"
                                                        : isHighlighted
                                                            ? "opacity-100 border-white/30 brightness-110"
                                                            : activeCell ? "opacity-30 grayscale-[0.2]" : "hover:border-white/50"
                                                )}
                                            >
                                                {/* Highlight overlay for row/column */}
                                                {isHighlighted && (
                                                    <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                                                )}

                                                <span className="text-lg font-bold print:text-[11px] print:leading-none z-10">
                                                    {percentVal.toFixed(2)}%
                                                </span>
                                                <span className="text-[10px] opacity-70 font-semibold print:text-[7px] print:leading-none z-10">
                                                    {getStatusLabel(percentVal)}
                                                </span>
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

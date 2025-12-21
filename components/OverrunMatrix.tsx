
import { clsx } from 'clsx'

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
    // Helper to get average for a specific tyre/pressure
    const getAvg = (type: 'FRONT' | 'REAR', pressure: number) => {
        return measurements.find(m => m.type === type && m.pressure === pressure)?.average || 0
    }

    return (
        <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800 shadow-2xl p-6 print:shadow-none print:border-none print:p-0">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400 mb-6">
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
                                <th key={p} className="p-2 text-teal-400 font-mono text-lg print:text-[10px] print:p-0 print:h-10 print:align-middle text-center">{p}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PRESSURES.map(frontPsi => (
                            <tr key={frontPsi}>
                                <th className="p-2 text-blue-400 font-mono text-lg print:text-[10px] print:p-0 print:border-none print:w-8 print:h-10 print:align-middle text-center">{frontPsi}</th>
                                {[...PRESSURES].reverse().map(rearPsi => {
                                    const frontAvg = getAvg('FRONT', frontPsi)
                                    const rearAvg = getAvg('REAR', rearPsi)

                                    // Corrected Formula: ((FrontAvg * GearRatio) / RearAvg) - 1
                                    let percent = 0
                                    if (rearAvg > 0) {
                                        percent = ((frontAvg * gearRatio) / rearAvg) - 1
                                    }

                                    const percentVal = percent * 100
                                    const colorClass = getStatusColor(percentVal)

                                    return (
                                        <td key={rearPsi} className="p-1 print:p-[1px]">
                                            <div className={clsx(
                                                "h-16 flex flex-col items-center justify-center rounded-lg border transition-transform hover:scale-105 cursor-default print:h-10 print:w-full print:border-[1px] print:rounded-md",
                                                colorClass
                                            )}>
                                                <span className="text-lg font-bold print:text-[11px] print:leading-none">
                                                    {percentVal.toFixed(2)}%
                                                </span>
                                                <span className="text-[10px] opacity-70 font-semibold print:text-[7px] print:leading-none">
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

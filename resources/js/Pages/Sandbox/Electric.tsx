import { useState } from 'react';
import MomentActionBorder from '@/features/calendar/components/MomentActionBorder';

/**
 * Sandbox page for tuning ElectricBorder animation parameters.
 * Visualizes consistency→animation mapping in isolation.
 *
 * DELETE before merging to main.
 */
export default function ElectricSandbox() {
    const [dragProgress, setDragProgress] = useState(0.5);
    const [holdProgress, setHoldProgress] = useState(0);
    const [selectedConsistency, setSelectedConsistency] = useState<number | null>(0);

    const consistencyBands = [
        { label: 'No Data', value: null, color: 'var(--mm-neutral)' },
        { label: 'Low (0-29)', value: 15, color: 'var(--mm-error)' },
        { label: 'Mid (30-59)', value: 45, color: 'var(--mm-warning)' },
        { label: 'High (60-84)', value: 72, color: 'var(--mm-info)' },
        { label: 'Top (85-100)', value: 92, color: 'var(--mm-success)' },
    ];

    const currentBand = consistencyBands.find(b => b.value === selectedConsistency);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold mb-8">ElectricBorder Sandbox</h1>

            <div className="grid grid-cols-2 gap-8 mb-12">
                {/* Controls */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Consistency Band</h2>
                        <div className="space-y-2">
                            {consistencyBands.map((band) => (
                                <button
                                    key={band.label}
                                    onClick={() => setSelectedConsistency(band.value)}
                                    className={`w-full px-4 py-3 rounded-lg text-left transition ${selectedConsistency === band.value
                                        ? 'bg-blue-600 font-bold'
                                        : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                >
                                    {band.label}
                                    {band.value !== null && ` (${band.value}%)`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-semibold mb-2">
                            Drag Progress: {dragProgress.toFixed(2)}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={dragProgress}
                            onChange={(e) => setDragProgress(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold mb-2">
                            Hold Progress: {holdProgress.toFixed(2)}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={holdProgress}
                            onChange={(e) => setHoldProgress(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {currentBand && (
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Computed Parameters</h3>
                            <div className="text-sm space-y-1">
                                <p>
                                    <span className="text-gray-400">Speed:</span>
                                    {' '}
                                    {(0.5 + (selectedConsistency !== null ? selectedConsistency / 100 : 0.5) * 1.5).toFixed(2)}
                                </p>
                                <p>
                                    <span className="text-gray-400">Chaos:</span>
                                    {' '}
                                    {Math.max(
                                        0.05,
                                        0.2 -
                                        (selectedConsistency !== null ? selectedConsistency / 100 : 0.5) * 0.14 +
                                        Math.max(dragProgress, holdProgress) * 0.05
                                    ).toFixed(2)}
                                </p>
                                <p>
                                    <span className="text-gray-400">Thickness:</span>
                                    {' '}
                                    {(1.5 + Math.max(dragProgress, holdProgress) * 1.5).toFixed(2)}
                                    px
                                </p>
                                <p>
                                    <span className="text-gray-400">Active:</span>
                                    {' '}
                                    {Math.max(dragProgress, holdProgress) > 0 ? 'Yes' : 'No'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Grid */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
                    <div className="space-y-6">
                        {/* Preview Row */}
                        <MomentActionBorder
                            color={currentBand?.color || 'var(--mm-primary)'}
                            consistency={selectedConsistency}
                            dragProgress={dragProgress}
                            holdProgress={holdProgress}
                            hasFriction={selectedConsistency !== null && selectedConsistency < 60}
                            isCompleted={false}
                        >
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <div className="text-center">
                                    <p className="text-lg font-semibold">{currentBand?.label}</p>
                                    <p className="text-sm text-gray-400">
                                        Drag: {dragProgress.toFixed(2)} | Hold: {holdProgress.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </MomentActionBorder>

                        {/* Completed State */}
                        <MomentActionBorder
                            color={currentBand?.color || 'var(--mm-primary)'}
                            consistency={selectedConsistency}
                            dragProgress={0}
                            holdProgress={0}
                            hasFriction={false}
                            isCompleted={true}
                        >
                            <div className="bg-gray-800 p-6 rounded-lg opacity-60">
                                <div className="text-center">
                                    <p className="text-lg font-semibold">Completed (no animation)</p>
                                    <p className="text-sm text-gray-400">✓ Border should be static</p>
                                </div>
                            </div>
                        </MomentActionBorder>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Sandbox Notes</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                    <li>
                        Select a consistency band to see how animation parameters vary (speed ↑, chaos ↓)
                    </li>
                    <li>
                        Adjust drag/hold sliders to simulate user interaction intensity
                    </li>
                    <li>
                        Thickness responds to real-time interaction (max drag/hold progress)
                    </li>
                    <li>
                        Completed state should have no animation (border is static)
                    </li>
                    <li>
                        <strong>DELETE this page before merging.</strong>
                    </li>
                </ul>
            </div>
        </div>
    );
}

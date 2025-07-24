// src/components/DebugRoutineData.tsx
import React from 'react';
import { Eye } from 'lucide-react';

interface DebugRoutineDataProps {
    routine: any;
    title?: string;
}

const DebugRoutineData: React.FC<DebugRoutineDataProps> = ({
                                                               routine,
                                                               title = "Routine Data Debug"
                                                           }) => {
    const [showDebug, setShowDebug] = React.useState(false);

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setShowDebug(!showDebug)}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                title="Debug Routine Data"
            >
                <Eye className="w-4 h-4" />
            </button>

            {showDebug && (
                <div className="absolute bottom-12 right-0 w-96 max-h-80 bg-black text-green-400 rounded-lg shadow-xl overflow-auto p-4 font-mono text-xs">
                    <div className="sticky top-0 bg-black pb-2 mb-2 border-b border-green-600">
                        <h3 className="text-green-300 font-bold">{title}</h3>
                    </div>
                    <pre className="whitespace-pre-wrap">
            {JSON.stringify(routine, null, 2)}
          </pre>
                </div>
            )}
        </div>
    );
};

export default DebugRoutineData;
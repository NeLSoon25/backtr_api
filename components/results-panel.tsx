'use client'

import { Card } from '@/components/ui/card'

interface ColoringResult {
  success: boolean
  colors: Record<number, number>
  total_steps: number
  backtracks: number
}

interface ResultsPanelProps {
  result: ColoringResult
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
        Resultados
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 dark:text-slate-400">Status:</span>
          <span className={result.success ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {result.success ? 'Resuelto' : 'Inviable'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-600 dark:text-slate-400">Total de pasos:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{result.total_steps}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-600 dark:text-slate-400">Backtracks:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{result.backtracks}</span>
        </div>

        {result.success && Object.keys(result.colors).length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Colores asignados:
            </p>
            <div className="space-y-1 text-xs">
              {Object.entries(result.colors)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([node, color]) => (
                  <div key={node} className="flex justify-between">
                    <span>Nodo {node}:</span>
                    <span className="font-semibold">Color {color}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

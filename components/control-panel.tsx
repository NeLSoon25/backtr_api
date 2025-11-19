'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Graph {
  nodes: number[]
  edges: [number, number][]
  numColors: number
}

interface ColoringResult {
  success: boolean
}

interface ControlPanelProps {
  graph: Graph
  setGraph: (graph: Graph) => void
  isLoading: boolean
  onSolve: () => void
  result: ColoringResult | null
  onDownload: () => void
}

export default function ControlPanel({
  graph,
  setGraph,
  isLoading,
  onSolve,
  result,
  onDownload,
}: ControlPanelProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
        Configuración
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Numero de colores: {graph.numColors}
          </label>
          <input
            type="range"
            min="2"
            max="5"
            value={graph.numColors}
            onChange={e => setGraph({ ...graph, numColors: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Nodos: {graph.nodes.length} | Aristas: {graph.edges.length}
          </p>
        </div>

        <Button
          onClick={onSolve}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isLoading ? 'Solving...' : 'Resolver con Backtracking'}
        </Button>

        {result && result.success && (
          <Button
            onClick={onDownload}
            variant="outline"
            className="w-full"
          >
            Descargar imagen
          </Button>
        )}
      </div>
    </Card>
  )
}

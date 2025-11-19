'use client'

import { useRef, useState } from 'react'
import GraphCanvas from '@/components/graph-canvas'
import ControlPanel from '@/components/control-panel'
import AnimationPlayer from '@/components/animation-player'
import ResultsPanel from '@/components/results-panel'

interface Graph {
  nodes: number[]
  edges: [number, number][]
  numColors: number
}

interface ColoringResult {
  success: boolean
  colors: Record<number, number>
  steps: any[]
  total_steps: number
  backtracks: number
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [graph, setGraph] = useState<Graph>({
    nodes: [0, 1, 2, 3],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
    numColors: 3,
  })

  const [result, setResult] = useState<ColoringResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [selectedNode, setSelectedNode] = useState<number | null>(null)

  const handleSolve = async () => {
    setIsLoading(true)
    setAnimationStep(0)
    setIsPlaying(false)

    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: graph.nodes,
          edges: graph.edges,
          num_colors: graph.numColors,
        }),
      })

      if (!response.ok) throw new Error('Failed to solve')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error solving the problem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNode = () => {
    const newNode = Math.max(...graph.nodes, -1) + 1
    setGraph({ ...graph, nodes: [...graph.nodes, newNode] })
  }

  const handleNodeClick = (node: number) => {
    if (selectedNode === null) {
      setSelectedNode(node)
    } else if (selectedNode === node) {
      setSelectedNode(null)
    } else {
      // Check if edge already exists
      const edgeExists = graph.edges.some(
        ([u, v]) => (u === selectedNode && v === node) || (u === node && v === selectedNode)
      )
      if (!edgeExists) {
        setGraph({
          ...graph,
          edges: [...graph.edges, [selectedNode, node]],
        })
      }
      setSelectedNode(null)
    }
  }

  const handleRemoveNode = (node: number) => {
    setGraph({
      ...graph,
      nodes: graph.nodes.filter(n => n !== node),
      edges: graph.edges.filter(([u, v]) => u !== node && v !== node),
    })
    setSelectedNode(null)
  }

  const handleRemoveEdge = (u: number, v: number) => {
    setGraph({
      ...graph,
      edges: graph.edges.filter(
        e => !(e[0] === u && e[1] === v) && !(e[0] === v && e[1] === u)
      ),
    })
  }

  const handleDownload = () => {
    if (!canvasRef.current) return

    //convert canvas to blob and download as PNG
    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `grafo-coloreado-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const handleAddEdge = (u: number, v: number) => {
    //verificamos si el nodo existe
    const edgeExists = graph.edges.some(
      ([existingU, existingV]) => (existingU === u && existingV === v) || (existingU === v && existingV === u)
    )
    if (!edgeExists) {
      setGraph({
        ...graph,
        edges: [...graph.edges, [u, v]],
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Actividad 3.4 Backtracking
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <GraphCanvas
                ref={canvasRef}
                graph={graph}
                result={result}
                animationStep={animationStep}
                onAddNode={handleAddNode}
                onRemoveNode={handleRemoveNode}
                onAddEdge={handleAddEdge}
                onRemoveEdge={handleRemoveEdge}
                onNodeClick={handleNodeClick}
                selectedNode={selectedNode}
              />
              <div className="mt-4 p-4 bg-blue-50 dark:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300">
                <p><strong>Instrucciones:</strong></p>
                <p>Clickear dos nodos para unirlos</p>
                <p>Click derecho para eliminar nodos/aristas</p>
                <p>Nota: Si no funciona el click abrir la consola</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-6">
            <ControlPanel
              graph={graph}
              setGraph={setGraph}
              isLoading={isLoading}
              onSolve={handleSolve}
              result={result}
              onDownload={handleDownload}
            />

            {result && (
              <>
                <AnimationPlayer
                  result={result}
                  animationStep={animationStep}
                  isPlaying={isPlaying}
                  speed={speed}
                  onStepChange={setAnimationStep}
                  onPlayChange={setIsPlaying}
                  onSpeedChange={setSpeed}
                />
                <ResultsPanel result={result} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

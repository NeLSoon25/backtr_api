'use client'

import { useEffect, useRef, forwardRef } from 'react'
import { Button } from '@/components/ui/button'

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF',
]

interface Graph {
  nodes: number[]
  edges: [number, number][]
  numColors: number
}

interface ColoringResult {
  colors: Record<number, number>
  steps?: any[]
}

interface GraphCanvasProps {
  graph: Graph
  result: ColoringResult | null
  animationStep: number
  onAddNode: () => void
  onRemoveNode: (node: number) => void
  onAddEdge: (u: number, v: number) => void
  onRemoveEdge: (u: number, v: number) => void
  onNodeClick: (node: number) => void
  selectedNode: number | null
}

const GraphCanvas = forwardRef<HTMLCanvasElement, GraphCanvasProps>(
  (
    {
      graph,
      result,
      animationStep,
      onAddNode,
      onRemoveNode,
      onAddEdge,
      onRemoveEdge,
      onNodeClick,
      selectedNode,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const nodePositionsRef = useRef<Record<number, { x: number; y: number }>>({})

    // Calculate node positions in a circle layout
    const getNodePositions = () => {
      const positions: Record<number, { x: number; y: number }> = {}
      const centerX = 300
      const centerY = 250
      const radius = 150

      graph.nodes.forEach((node, index) => {
        const angle = (index / graph.nodes.length) * Math.PI * 2 - Math.PI / 2
        positions[node] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
      })

      return positions
    }

    const getNodeColorAtStep = (node: number): number | undefined => {
      if (!result?.steps || result.steps.length === 0) {
        return result?.colors[node]
      }

      let currentColor: number | undefined = undefined
      for (let i = 0; i <= animationStep && i < result.steps.length; i++) {
        const step = result.steps[i]
        if (step.action === 'assign' && step.node === node) {
          currentColor = step.color
        } else if (step.action === 'backtrack' && step.node === node) {
          currentColor = undefined
        }
      }

      return currentColor
    }

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if click is on any node
      for (const node of graph.nodes) {
        const pos = nodePositionsRef.current[node]
        if (!pos) continue

        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
        if (distance < 25) {
          onNodeClick(node)
          return
        }
      }
    }

    const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if right-click is on any node
      for (const node of graph.nodes) {
        const pos = nodePositionsRef.current[node]
        if (!pos) continue

        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
        if (distance < 25) {
          onRemoveNode(node)
          return
        }
      }

      // Check if right-click is on any edge
      for (const [u, v] of graph.edges) {
        const pos1 = nodePositionsRef.current[u]
        const pos2 = nodePositionsRef.current[v]
        if (!pos1 || !pos2) continue

        // Check distance from point to line segment
        const distance = pointToLineDistance(x, y, pos1.x, pos1.y, pos2.x, pos2.y)
        if (distance < 10) {
          onRemoveEdge(u, v)
          return
        }
      }
    }

    // Helper function to calculate distance from point to line segment
    const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
      const A = px - x1
      const B = py - y1
      const C = x2 - x1
      const D = y2 - y1

      const dot = A * C + B * D
      const lenSq = C * C + D * D

      let param = -1
      if (lenSq !== 0) param = dot / lenSq

      let xx, yy

      if (param < 0) {
        xx = x1
        yy = y1
      } else if (param > 1) {
        xx = x2
        yy = y2
      } else {
        xx = x1 + param * C
        yy = y1 + param * D
      }

      const dx = px - xx
      const dy = py - yy
      return Math.sqrt(dx * dx + dy * dy)
    }

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const positions = getNodePositions()
      nodePositionsRef.current = positions

      // Clear canvas
      ctx.fillStyle = '#f0f4f8'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw edges
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 2
      graph.edges.forEach(([u, v]) => {
        const pos1 = positions[u]
        const pos2 = positions[v]
        if (pos1 && pos2) {
          ctx.beginPath()
          ctx.moveTo(pos1.x, pos1.y)
          ctx.lineTo(pos2.x, pos2.y)
          ctx.stroke()
        }
      })

      // Draw nodes
      graph.nodes.forEach(node => {
        const pos = positions[node]
        if (!pos) return

        const colorIndex = getNodeColorAtStep(node)
        const nodeColor = colorIndex !== undefined ? COLORS[colorIndex % COLORS.length] : '#ffffff'
        const isSelected = selectedNode === node

        // Node circle
        ctx.fillStyle = nodeColor
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2)
        ctx.fill()

        // Selection highlight
        if (isSelected) {
          ctx.strokeStyle = '#FFD700'
          ctx.lineWidth = 4
        } else {
          ctx.strokeStyle = '#1e293b'
          ctx.lineWidth = 2
        }
        ctx.stroke()

        // Node label
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.toString(), pos.x, pos.y)
      })
    }, [graph, result, animationStep, selectedNode])

    return (
      <div className="space-y-4">
        <canvas
          ref={(node) => {
            canvasRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          width={600}
          height={500}
          onClick={handleCanvasClick}
          onContextMenu={handleContextMenu}
          className="border-2 border-slate-200 dark:border-slate-700 rounded-lg w-full bg-slate-50 dark:bg-slate-900 cursor-pointer"
        />
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onAddNode} variant="outline" size="sm">
            Add Node
          </Button>
        </div>
      </div>
    )
  }
)

GraphCanvas.displayName = 'GraphCanvas'

export default GraphCanvas

import { NextRequest, NextResponse } from 'next/server'

interface Graph {
  nodes: number[]
  edges: [number, number][]
  num_colors: number
}

interface Step {
  action: 'assign' | 'attempt' | 'backtrack'
  node: number
  color: number
  success?: boolean
  reason?: string
}

interface ColoringResult {
  success: boolean
  colors: Record<number, number>
  steps: Step[]
  total_steps: number
  backtracks: number
}

class BacktrackingSolver {
  private nodes: number[]
  private edges: [number, number][]
  private numColors: number
  private colors: Record<number, number> = {}
  private steps: Step[] = []
  private backtrackCount: number = 0
  private adj: Record<number, Set<number>> = {}

  constructor(graph: Graph) {
    this.nodes = graph.nodes
    this.edges = graph.edges
    this.numColors = graph.num_colors

    // Build adjacency list
    this.adj = {}
    for (const node of this.nodes) {
      this.adj[node] = new Set()
    }
    for (const [u, v] of this.edges) {
      this.adj[u]?.add(v)
      this.adj[v]?.add(u)
    }
  }

  private isSafe(node: number, color: number): boolean {
    const neighbors = this.adj[node] || new Set()
    for (const neighbor of neighbors) {
      if (this.colors[neighbor] === color) {
        return false
      }
    }
    return true
  }

  private backtrack(nodeIdx: number): boolean {
    if (nodeIdx === this.nodes.length) {
      return true
    }

    const node = this.nodes[nodeIdx]

    for (let color = 0; color < this.numColors; color++) {
      if (this.isSafe(node, color)) {
        this.colors[node] = color
        this.steps.push({
          action: 'assign',
          node,
          color,
          success: true,
        })

        if (this.backtrack(nodeIdx + 1)) {
          return true
        }

        // Backtrack
        delete this.colors[node]
        this.backtrackCount++
        this.steps.push({
          action: 'backtrack',
          node,
          color,
          reason: 'no_valid_color_found',
        })
      } else {
        this.steps.push({
          action: 'attempt',
          node,
          color,
          success: false,
          reason: 'conflict',
        })
      }
    }

    return false
  }

  solve(): ColoringResult {
    this.colors = {}
    this.steps = []
    this.backtrackCount = 0

    const success = this.backtrack(0)

    return {
      success,
      colors: success ? this.colors : {},
      steps: this.steps,
      total_steps: this.steps.length,
      backtracks: this.backtrackCount,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Graph = await request.json()

    // Validate input
    if (body.num_colors < 1) {
      return NextResponse.json(
        { error: 'Number of colors must be at least 1' },
        { status: 400 }
      )
    }

    if (!body.nodes || body.nodes.length === 0) {
      return NextResponse.json(
        { error: 'Graph must have at least one node' },
        { status: 400 }
      )
    }

    const solver = new BacktrackingSolver(body)
    const result = solver.solve()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Solve error:', error)
    return NextResponse.json(
      { error: 'Failed to solve the graph coloring problem' },
      { status: 500 }
    )
  }
}

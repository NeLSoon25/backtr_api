from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Tuple
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Graph(BaseModel):
    nodes: List[int]
    edges: List[Tuple[int, int]]
    num_colors: int

class ColoringResult(BaseModel):
    success: bool
    colors: Dict[int, int]
    steps: List[Dict]
    total_steps: int
    backtracks: int

class BacktrackingSolver:
    def __init__(self, graph: Graph):
        self.nodes = graph.nodes
        self.edges = graph.edges
        self.num_colors = graph.num_colors
        self.colors = {}
        self.steps = []
        self.backtrack_count = 0
        
        # Build adjacency list
        self.adj = {node: set() for node in self.nodes}
        for u, v in self.edges:
            self.adj[u].add(v)
            self.adj[v].add(u)
    
    def is_safe(self, node: int, color: int) -> bool:
        """Check if a color is safe to assign to a node"""
        for neighbor in self.adj[node]:
            if neighbor in self.colors and self.colors[neighbor] == color:
                return False
        return True
    
    def solve(self) -> ColoringResult:
        """Solve the graph coloring problem using backtracking"""
        self.colors = {}
        self.steps = []
        self.backtrack_count = 0
        
        if self._backtrack(0):
            return ColoringResult(
                success=True,
                colors=self.colors,
                steps=self.steps,
                total_steps=len(self.steps),
                backtracks=self.backtrack_count
            )
        else:
            return ColoringResult(
                success=False,
                colors={},
                steps=self.steps,
                total_steps=len(self.steps),
                backtracks=self.backtrack_count
            )
    
    def _backtrack(self, node_idx: int) -> bool:
        """Recursive backtracking function"""
        if node_idx == len(self.nodes):
            return True
        
        node = self.nodes[node_idx]
        
        for color in range(self.num_colors):
            if self.is_safe(node, color):
                self.colors[node] = color
                self.steps.append({
                    "action": "assign",
                    "node": node,
                    "color": color,
                    "success": True
                })
                
                if self._backtrack(node_idx + 1):
                    return True
                
                # Backtrack
                del self.colors[node]
                self.backtrack_count += 1
                self.steps.append({
                    "action": "backtrack",
                    "node": node,
                    "color": color,
                    "reason": "no_valid_color_found"
                })
            else:
                self.steps.append({
                    "action": "attempt",
                    "node": node,
                    "color": color,
                    "success": False,
                    "reason": "conflict"
                })
        
        return False

@app.post("/solve", response_model=ColoringResult)
async def solve_coloring(graph: Graph):
    """Endpoint to solve graph coloring problem"""
    try:
        if graph.num_colors < 1:
            raise HTTPException(status_code=400, detail="Number of colors must be at least 1")
        
        if not graph.nodes:
            raise HTTPException(status_code=400, detail="Graph must have at least one node")
        
        solver = BacktrackingSolver(graph)
        result = solver.solve()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

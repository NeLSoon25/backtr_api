'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ColoringResult {
  steps: any[]
}

interface AnimationPlayerProps {
  result: ColoringResult
  animationStep: number
  isPlaying: boolean
  speed: number
  onStepChange: (step: number) => void
  onPlayChange: (playing: boolean) => void
  onSpeedChange: (speed: number) => void
}

export default function AnimationPlayer({
  result,
  animationStep,
  isPlaying,
  speed,
  onStepChange,
  onPlayChange,
  onSpeedChange,
}: AnimationPlayerProps) {
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      onStepChange((prevStep: number) => {
        if (prevStep >= result.steps.length - 1) {
          onPlayChange(false)
          return prevStep
        }
        return prevStep + 1
      })
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed, result.steps.length, onStepChange, onPlayChange])

  const currentStep = result.steps[animationStep]

  const getStepDescription = () => {
    if (!currentStep) return 'Starting...'

    switch (currentStep.type) {
      case 'assign':
        return `Assigning Node ${currentStep.node} → Color ${currentStep.color}`
      case 'backtrack':
        return `Backtracking: Node ${currentStep.node} had conflict, removing color`
      case 'success':
        return 'Solution found!'
      case 'failure':
        return 'No solution exists'
      default:
        return JSON.stringify(currentStep)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
        Animación
      </h3>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => onPlayChange(!isPlaying)}
            variant={isPlaying ? 'default' : 'outline'}
            className="flex-1"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button
            onClick={() => onStepChange(0)}
            variant="outline"
            className="flex-1"
          >
            Reset
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Velocidad: {speed}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={e => onSpeedChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="bg-slate-100 dark:bg-slate-700 rounded p-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
            Step {animationStep + 1} of {result.steps.length}
          </p>          
          {currentStep && (
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-mono">{JSON.stringify(currentStep, null, 2)}</p>
            </div>
          )}
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${(animationStep / (result.steps.length - 1 || 1)) * 100}%` }}
          />
        </div>
      </div>
    </Card>
  )
}

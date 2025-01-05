import { useState, useEffect, useCallback } from 'react'
import { useElapsedTime } from 'use-elapsed-time'

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  startTime: string | null
  elapsedTime: number
  puzzleId: number | null
  pausedTime: number
}

const TIMER_KEY = 'puzzle-timer-state'

export function useTimer(puzzleId: number) {
  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem(TIMER_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as TimerState
      if (parsed.puzzleId !== puzzleId) return {
        isRunning: false,
        isPaused: false,
        startTime: null,
        elapsedTime: 0,
        puzzleId,
        pausedTime: 0
      }
      return parsed
    }
    return {
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      puzzleId,
      pausedTime: 0
    }
  })

  const { elapsedTime, reset } = useElapsedTime({
    isPlaying: state.isRunning,
    updateInterval: 1,
    onUpdate: (time) => {
      setState(prev => ({
        ...prev,
        elapsedTime: Math.floor(time)
      }))
    }
  })

  useEffect(() => {
    const stateToSave = {
      ...state,
      pausedTime: state.pausedTime
    }
    localStorage.setItem(TIMER_KEY, JSON.stringify(stateToSave))
  }, [state])

  const handleStart = useCallback(() => {
    const now = Date.now()
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: prev.startTime || new Date(now).toISOString()
    }))
  }, [])

  const handlePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true,
      pausedTime: prev.pausedTime + prev.elapsedTime,
      elapsedTime: 0
    }))
    reset()
  }, [elapsedTime, reset])

  const handleStop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      pausedTime: prev.pausedTime + prev.elapsedTime,
      elapsedTime: 0
    }))
    reset()
  }, [elapsedTime, reset])

  const handleReset = useCallback(() => {
    setState({
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      puzzleId,
      pausedTime: 0
    })
    reset()
    localStorage.removeItem(TIMER_KEY)
  }, [puzzleId, reset])

  return {
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    totalElapsed: state.elapsedTime + state.pausedTime,
    startTime: state.startTime ? new Date(state.startTime) : null,
    handleStart,
    handlePause,
    handleStop,
    handleReset
  }
}
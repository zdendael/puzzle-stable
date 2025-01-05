import { useState, useCallback } from 'react'

export function useActivityPanel() {
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('activity-panel-visible')
    return saved ? saved === 'true' : false
  })

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => {
      const newValue = !prev
      localStorage.setItem('activity-panel-visible', newValue.toString())
      return newValue
    })
  }, [])

  const hidePanel = useCallback(() => {
    setIsVisible(false)
    localStorage.setItem('activity-panel-visible', 'false')
  }, [])

  return { isVisible, toggleVisibility, hidePanel }
}
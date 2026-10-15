import { useState, useEffect } from 'react'

/**
 * Hook untuk sinkronisasi state dengan localStorage.
 * @param {string} key - Kunci localStorage
 * @param {*} initialValue - Nilai default
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      if (error?.name === 'QuotaExceededError') {
        window.alert('Penyimpanan penuh, kurangi foto')
        console.warn(`Penyimpanan localStorage penuh untuk key "${key}":`, error)
        return
      }
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

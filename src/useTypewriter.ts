import { useState, useEffect } from 'react'

interface UseTypewriterOptions {
  speed?: number
  startDelay?: number
}

interface UseTypewriterReturn {
  displayed: string
  done: boolean
}

export function useTypewriter(
  text: string,
  options?: UseTypewriterOptions
): UseTypewriterReturn {
  const speed = options?.speed ?? 38
  const startDelay = options?.startDelay ?? 600

  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)

    let timeoutId: ReturnType<typeof setTimeout>
    let intervalId: ReturnType<typeof setInterval>
    let currentIndex = 0

    timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex += 1
          setDisplayed(text.slice(0, currentIndex))
        } else {
          setDone(true)
          clearInterval(intervalId)
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [text, speed, startDelay])

  return { displayed, done }
}

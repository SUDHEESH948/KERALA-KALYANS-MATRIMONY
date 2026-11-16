import { useState, useEffect, useRef } from 'react'
import { useInView, animate } from 'framer-motion'

export default function AnimatedCounter({ target, suffix = '', duration = 2.2 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setCount(Math.floor(latest))
    })
    return () => controls.stop()
  }, [isInView, target, duration])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

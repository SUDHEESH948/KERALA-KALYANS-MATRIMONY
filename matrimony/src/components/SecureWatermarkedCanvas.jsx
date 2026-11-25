import { useEffect, useRef, useState } from 'react'

export default function SecureWatermarkedCanvas({
  imageSrc,
  watermarkData = {},
  className = '',
  onTamperDetected
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [isTampered, setIsTampered] = useState(false)

  // 1. Draw Image & Burn Forensic Dynamic Watermark Directly into Canvas Pixels
  useEffect(() => {
    if (!imageSrc || isTampered) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      canvas.width = img.naturalWidth || img.width || 600
      canvas.height = img.naturalHeight || img.height || 800

      // Draw the raw unblurred photo
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Format dynamic watermark text: Name, ID, Phone, Timestamp
      const name = watermarkData.name || 'AUTHENTICATED MEMBER'
      const id = watermarkData.id ? `ID:${watermarkData.id}` : ''
      const phone = watermarkData.phone || ''
      const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      const text = `${name} · ${id} · ${phone} · ${time}`

      // Dynamic sizing based on canvas resolution
      const fontSize = Math.max(14, Math.floor(canvas.width / 26))
      ctx.font = `600 ${fontSize}px sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.32)'
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'
      ctx.lineWidth = 2.5

      ctx.save()
      ctx.rotate((-28 * Math.PI) / 180)

      const stepX = fontSize * 18
      const stepY = fontSize * 4.5

      // Grid of diagonal forensic watermarks
      for (let x = -canvas.width * 1.5; x < canvas.width * 2.5; x += stepX) {
        for (let y = -canvas.height * 1.5; y < canvas.height * 2.5; y += stepY) {
          ctx.strokeText(text, x, y)
          ctx.fillText(text, x, y)
        }
      }
      ctx.restore()
    }

    img.src = imageSrc
  }, [imageSrc, watermarkData, isTampered])

  // 2. Anti-Tamper MutationObserver (Detects DevTools CSS/DOM modifications)
  useEffect(() => {
    const targetNode = containerRef.current
    const canvasNode = canvasRef.current
    if (!targetNode || !canvasNode) return

    const handleTamper = () => {
      setIsTampered(true)
      if (onTamperDetected) onTamperDetected()
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // If canvas node was removed or deleted
        if (mutation.type === 'childList') {
          const removed = Array.from(mutation.removedNodes)
          if (removed.includes(canvasNode)) {
            handleTamper()
            return
          }
        }

        // If styles were altered via Elements panel (opacity, display, visibility, filter)
        if (mutation.type === 'attributes') {
          const style = window.getComputedStyle(canvasNode)
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            parseFloat(style.opacity || '1') < 0.1 ||
            (style.filter && style.filter.includes('opacity(0)'))
          ) {
            handleTamper()
            return
          }
        }
      }
    })

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    })

    return () => observer.disconnect()
  }, [onTamperDetected])

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
    >
      {isTampered ? (
        <div className="flex h-full w-full items-center justify-center bg-black p-6 text-center text-xs text-red-400 font-bold">
          ⚠️ Security Violation: Element tampering detected via DevTools. Image locked.
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover pointer-events-none"
        />
      )}
    </div>
  )
}

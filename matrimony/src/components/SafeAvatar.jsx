import { useState } from 'react'

function getInitials(name) {
  const parts = String(name || 'M').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'M'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function SafeAvatar({ src, name = 'Member', className = 'h-8 w-8 rounded-full object-cover', fallbackClassName = '' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src

  if (showImage) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailedSrc(src)}
        className={className}
      />
    )
  }

  return (
    <span
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#701C35]/12 text-[#701C35] font-bold text-xs select-none ${className} ${fallbackClassName}`}
    >
      {getInitials(name)}
    </span>
  )
}

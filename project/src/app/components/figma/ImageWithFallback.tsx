import React, { useState } from 'react'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props
  const hasSrc = typeof src === 'string' && src.trim().length > 0
  const finalSrc = !hasSrc || didError ? FALLBACK_IMAGE : src

  return <img src={finalSrc} alt={alt} className={className} style={style} {...rest} onError={handleError} />
}

import React, { memo, useEffect, useMemo, useState } from 'react'

function makeFallbackDataUri(label?: string) {
  const text = (label || 'Research').trim().slice(0, 34) || 'Research'
  const escaped = text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7f7f7"/><stop offset="1" stop-color="#e7e7e7"/></linearGradient></defs><rect width="900" height="600" fill="url(#g)"/><rect x="56" y="56" width="112" height="112" fill="#111"/><rect x="86" y="86" width="52" height="52" fill="#f4f4f4"/><text x="56" y="512" font-family="Arial,Helvetica,sans-serif" font-size="29" font-weight="700" fill="#222">${escaped}</text><text x="56" y="550" font-family="Arial,Helvetica,sans-serif" font-size="16" letter-spacing="5" fill="#777">ELEMENTS INTERACTIVE</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

type SmartImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean
}

function ImageWithFallbackComponent(props: SmartImageProps) {
  const [didError, setDidError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const {
    src,
    alt,
    style,
    className,
    loading,
    priority = false,
    onLoad,
    onError,
    ...rest
  } = props

  useEffect(() => {
    setDidError(false)
    setLoaded(false)
  }, [src])

  const fallback = useMemo(() => makeFallbackDataUri(alt), [alt])
  const hasSrc = typeof src === 'string' && src.trim().length > 0
  const finalSrc = !hasSrc || didError ? fallback : src
  const effectiveLoading = loading ?? (priority ? 'eager' : 'lazy')

  return (
    <span className="relative block h-full w-full overflow-hidden bg-neutral-100">
      {!loaded && hasSrc && !didError && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200"
        />
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={`${className || ''} transition-opacity duration-200 ${loaded || didError || !hasSrc ? 'opacity-100' : 'opacity-0'}`}
        style={style}
        loading={effectiveLoading as React.ImgHTMLAttributes<HTMLImageElement>['loading']}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        {...rest}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          setDidError(true)
          setLoaded(true)
          onError?.(event)
        }}
      />
    </span>
  )
}

export const ImageWithFallback = memo(ImageWithFallbackComponent)

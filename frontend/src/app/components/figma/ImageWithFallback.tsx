import React, { useState, memo } from 'react'

const makeFallbackImage = (label = 'ELEMENTS INTERACTIVE') => {
  const safeLabel = String(label || 'ELEMENTS INTERACTIVE')
    .replace(/[&<>"']/g, '')
    .slice(0, 58);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <rect width="1200" height="800" fill="#f3f3f3"/>
    <rect x="72" y="72" width="92" height="92" fill="#111"/>
    <rect x="100" y="100" width="36" height="36" fill="#f3f3f3"/>
    <text x="72" y="650" font-family="Arial,Helvetica,sans-serif" font-size="32" font-weight="700" fill="#111">${safeLabel}</text>
    <text x="72" y="705" font-family="Arial,Helvetica,sans-serif" font-size="20" letter-spacing="8" fill="#777">ELEMENTS INTERACTIVE</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

function ImageWithFallbackComponent(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, loading = 'lazy', ...rest } = props
  const hasSrc = typeof src === 'string' && src.trim().length > 0
  const finalSrc = !hasSrc || didError ? makeFallbackImage(alt) : src

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={style}
      loading={loading as React.ImgHTMLAttributes<HTMLImageElement>['loading']}
      {...rest}
      onError={handleError}
    />
  )
}

export const ImageWithFallback = memo(ImageWithFallbackComponent)

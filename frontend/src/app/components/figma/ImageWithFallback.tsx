import React, { memo, useMemo, useState } from 'react'

function makeFallbackDataUri(label?: string) {
  const text = (label || 'Research').trim().slice(0, 34) || 'Research'
  const escaped = text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f5f5f5"/><stop offset="1" stop-color="#dedede"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><rect x="82" y="82" width="150" height="150" fill="#111"/><rect x="122" y="122" width="70" height="70" fill="#f4f4f4"/><text x="82" y="690" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="700" fill="#222">${escaped}</text><text x="82" y="742" font-family="Arial,Helvetica,sans-serif" font-size="22" letter-spacing="6" fill="#777">ELEMENTS INTERACTIVE</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function ImageWithFallbackComponent(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const { src, alt, style, className, loading = 'lazy', ...rest } = props
  const fallback = useMemo(() => makeFallbackDataUri(alt), [alt])
  const hasSrc = typeof src === 'string' && src.trim().length > 0
  const finalSrc = !hasSrc || didError ? fallback : src

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={style}
      loading={loading as React.ImgHTMLAttributes<HTMLImageElement>['loading']}
      decoding={props.decoding || 'async'}
      {...rest}
      onError={() => setDidError(true)}
    />
  )
}

export const ImageWithFallback = memo(ImageWithFallbackComponent)

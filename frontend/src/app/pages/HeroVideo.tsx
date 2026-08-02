import React, { useState } from 'react';

interface HeroVideoProps {
  src?: string;
}

/**
 * Hero background video with a polished loading experience.
 * The overlay remains visible until playback is ready, so slower connections
 * show an intentional animation instead of a blank black frame.
 */
export const HeroVideo = React.memo(({ src = '/hero-animation.mp4' }: HeroVideoProps) => {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const markReady = () => setIsReady(true);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {!isReady && !hasError && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-black"
          role="status"
          aria-live="polite"
          aria-label="Loading hero experience"
        >
          {/* Subtle animated ambience keeps loading feeling intentional. */}
          <div className="absolute -left-24 top-1/4 h-72 w-72 animate-pulse rounded-full bg-white/[0.035] blur-3xl" />
          <div className="absolute -right-24 bottom-1/4 h-72 w-72 animate-pulse rounded-full bg-white/[0.025] blur-3xl [animation-delay:500ms]" />

          <div className="relative flex min-w-44 flex-col items-center rounded-2xl border border-white/10 bg-white/[0.045] px-8 py-6 shadow-2xl shadow-black/50 backdrop-blur-md">
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full border border-white/20 [animation-duration:1.8s]" />
              <span className="absolute inset-1 animate-spin rounded-full border-2 border-white/15 border-t-white/90 [animation-duration:1.1s]" />
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.85)]" />
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
              Loading experience
            </p>

            <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/90 [animation-delay:-0.30s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
            </div>
          </div>
        </div>
      )}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={markReady}
        onCanPlay={markReady}
        onPlaying={markReady}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover pointer-events-none transition-opacity duration-700 ${
          isReady ? 'opacity-60' : 'opacity-0'
        }`}
        style={{ filter: 'grayscale(100%)' }}
      >
        <source src={src} type="video/mp4" />
        <img src="/image.gif" alt="Background" className="h-full w-full object-cover" />
      </video>

      {hasError && (
        <img
          src="/image.gif"
          alt="Hero background"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      )}
    </div>
  );
});

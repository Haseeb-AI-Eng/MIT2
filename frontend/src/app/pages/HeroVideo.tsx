import React from 'react';

/**
 * Renders the background video for hero sections.
 * This component is memoized to prevent unnecessary re-renders
 * that would cause the video to re-load.
 */
export const HeroVideo = React.memo(() => {
  return (
    <div className="absolute inset-0 bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover opacity-60 pointer-events-none"
        style={{ filter: 'grayscale(100%)' }}
      >
        <source src="/robotic.mp4" type="video/mp4" />
        {/* Fallback image if video fails to load */}
        <img src="/image.gif" alt="Background" className="w-full h-full object-cover" />
      </video>
    </div>
  );
});
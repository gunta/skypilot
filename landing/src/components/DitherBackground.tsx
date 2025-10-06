import React from 'react';

export default function DitherBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.6"
              numOctaves="4"
              seed="15"
            />
            <feColorMatrix
              values="0 0 0 0 0
                      0 0 0 0 0  
                      0 0 0 0 0
                      0 0 0 0.05 0"
            />
          </filter>
          
          <radialGradient id="grad" cx="50%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.1" />
            <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          
          <pattern
            id="dither"
            x="0"
            y="0"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="2" height="2" fill="#0a0a0a" />
            <rect x="2" y="2" width="2" height="2" fill="#0a0a0a" />
            <rect x="0" y="2" width="2" height="2" fill="#0f0f0f" />
            <rect x="2" y="0" width="2" height="2" fill="#0f0f0f" />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="#0a0a0a" />
        <rect width="100%" height="100%" fill="url(#dither)" opacity="0.4" />
        <rect width="100%" height="100%" fill="url(#grad)" />
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-primary/10 rounded-full blur-[96px] animate-float" />
        </div>
      </div>
      
      {/* Dither overlay for depth */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 212, 255, 0.03) 2px,
              rgba(0, 212, 255, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 92, 246, 0.03) 2px,
              rgba(139, 92, 246, 0.03) 4px
            )
          `,
        }}
      />
    </div>
  );
}

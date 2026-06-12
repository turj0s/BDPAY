import React from 'react'

const GradientMesh: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ height: '66vh', maxHeight: '800px' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ mixBlendMode: 'multiply' }}
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="80" />
          </filter>
          
          {/* Gradient definitions */}
          <linearGradient id="cream-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e9d4" />
            <stop offset="100%" stopColor="#fddcb5" />
          </linearGradient>
          
          <radialGradient id="lavender-gradient">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="1" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.3" />
          </radialGradient>
          
          <radialGradient id="indigo-gradient">
            <stop offset="0%" stopColor="#533afd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#533afd" stopOpacity="0.2" />
          </radialGradient>
          
          <radialGradient id="ruby-gradient">
            <stop offset="0%" stopColor="#ea2261" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ea2261" stopOpacity="0.1" />
          </radialGradient>
          
          <radialGradient id="magenta-gradient">
            <stop offset="0%" stopColor="#f96bee" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f96bee" stopOpacity="0.05" />
          </radialGradient>
        </defs>
        
        {/* Organic blob shapes with blur */}
        <g filter="url(#blur)">
          {/* Cream blob - top left */}
          <ellipse
            cx="15%"
            cy="20%"
            rx="25%"
            ry="35%"
            fill="url(#cream-gradient)"
            opacity="0.9"
          />
          
          {/* Lavender blob - top right */}
          <ellipse
            cx="75%"
            cy="15%"
            rx="30%"
            ry="40%"
            fill="url(#lavender-gradient)"
            opacity="0.8"
          />
          
          {/* Indigo blob - center */}
          <ellipse
            cx="50%"
            cy="40%"
            rx="35%"
            ry="30%"
            fill="url(#indigo-gradient)"
            opacity="0.7"
          />
          
          {/* Ruby blob - left middle */}
          <ellipse
            cx="25%"
            cy="50%"
            rx="28%"
            ry="25%"
            fill="url(#ruby-gradient)"
            opacity="0.6"
          />
          
          {/* Magenta blob - bottom right */}
          <ellipse
            cx="80%"
            cy="60%"
            rx="32%"
            ry="28%"
            fill="url(#magenta-gradient)"
            opacity="0.5"
          />
          
          {/* Additional smaller blobs for complexity */}
          <ellipse
            cx="40%"
            cy="70%"
            rx="20%"
            ry="18%"
            fill="url(#lavender-gradient)"
            opacity="0.4"
          />
          
          <ellipse
            cx="65%"
            cy="35%"
            rx="18%"
            ry="22%"
            fill="url(#ruby-gradient)"
            opacity="0.3"
          />
        </g>
        
        {/* Fade out gradient at bottom */}
        <defs>
          <linearGradient id="fade-out" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="70%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#fade-out)" />
      </svg>
    </div>
  )
}

export default GradientMesh

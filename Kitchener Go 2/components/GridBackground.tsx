'use client'


interface GridBackgroundProps {
  className?: string
  animated?: boolean
}

export default function GridBackground({ className = '', animated = true }: GridBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
      
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {animated && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.5 }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="diagonalGrid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 60"
                  style={{ stroke: 'var(--grid-stroke)' }}
                  strokeWidth="1"
                  fill="none"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalGrid)" />
          </svg>
        </div>
      )}

      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgb(var(--accent-gold) / 0.04) 0%, transparent 50%)'
        }}
      />

      <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M 0 50 L 0 0 L 50 0"
            style={{ stroke: 'var(--corner-stroke)' }}
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M 0 50 L 0 0 L 50 0"
            style={{ stroke: 'var(--corner-stroke)' }}
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
    </div>
  )
}

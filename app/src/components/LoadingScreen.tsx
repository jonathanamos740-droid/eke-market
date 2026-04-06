import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(186, 117, 23, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(186, 117, 23, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Radial gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-stitch-green/5 via-transparent to-purple-500/5" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated logo container */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className={`w-32 h-32 rounded-full border-2 border-stitch-green/20 ${mounted ? 'animate-spin-slow' : ''}`} 
               style={{ animationDuration: '3s' }}>
            <div className="absolute inset-2 rounded-full border border-stitch-green/10" />
          </div>

          {/* Inner pulsing ring */}
          <div className="absolute inset-4 rounded-full border-2 border-stitch-green/30 animate-pulse" />

          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-stitch-green/20 to-stitch-green/5 
                          border border-stitch-green/30 flex items-center justify-center
                          ${mounted ? 'animate-pulse-glow' : 'opacity-0'}`}>
              <img 
                src="/eke-icon.svg" 
                alt="Eke Market" 
                className="w-10 h-10"
              />
            </div>
          </div>

          {/* Orbiting dots */}
          <div className={`absolute inset-0 ${mounted ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-stitch-green shadow-[0_0_10px_#BA7517]" />
          </div>
          <div className={`absolute inset-0 ${mounted ? 'animate-spin' : ''}`} style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 rounded-full bg-stitch-green/70 shadow-[0_0_8px_#BA7517]" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className={`font-display text-2xl font-bold text-white tracking-tight
                        ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            EKE MARKET
          </h1>
          <p className={`text-sm text-muted-foreground tracking-[0.2em] uppercase
                        ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
            Crypto Terminal
          </p>
        </div>

        {/* Loading bar */}
        <div className={`w-48 h-0.5 bg-surface-container-high rounded-full overflow-hidden
                        ${mounted ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
          <div className="h-full bg-gradient-to-r from-stitch-green via-stitch-cyan to-stitch-green 
                         bg-[length:200%_100%] animate-shimmer" />
        </div>

        {/* Status text */}
        <p className={`text-xs text-muted-foreground tracking-wide
                      ${mounted ? 'animate-fade-in-up animation-delay-500' : 'opacity-0'}`}>
          Initializing market data...
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-stitch-green/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(186, 117, 23, 0.3);
            border-color: rgba(186, 117, 23, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(186, 117, 23, 0.6), 0 0 60px rgba(186, 117, 23, 0.2);
            border-color: rgba(186, 117, 23, 0.5);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
}
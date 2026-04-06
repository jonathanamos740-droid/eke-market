import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message }: NetworkErrorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated SVG - Network failure illustration */}
        <div className="mb-8 relative">
          <div className="w-48 h-48 mx-auto relative">
            {/* Pulsing circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-red-500/30 animate-ping" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-red-500/40 animate-pulse" />
            </div>
            
            {/* Wifi off icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <WifiOff className="w-16 h-16 text-red-400" />
                {/* Animated X marks */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center animate-bounce">
                  <span className="text-red-400 text-xs font-bold">✕</span>
                </div>
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute top-0 left-1/4 w-2 h-2 rounded-full bg-red-400/50 animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-1/4 right-0 w-3 h-3 rounded-full bg-red-400/30 animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-red-400/40 animate-float" style={{ animationDelay: '2s' }} />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-white mb-2">
          No vex senior man! 😩
        </h2>
        <p className="text-lg text-muted-foreground mb-1">
          Na network be that o!
        </p>
        {message && (
          <p className="text-sm text-red-400 mb-4">
            {message}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground mb-6">
          The data no dey come, but no worry - we go try again!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="gap-2 bg-stitch-green hover:bg-stitch-green/90 text-stitch-green-dark"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          <Link to="/">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              Back to Markets
            </Button>
          </Link>
        </div>

        {/* Additional info */}
        <div className="mt-8 p-4 rounded-lg bg-surface-container/50 border border-white/[0.06]">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Check your internet connection or try again in a few minutes.
            <br />
            The market data go come back soon!
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
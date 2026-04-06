import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RetryIndicatorProps {
  error: string;
  onRetry: () => void;
  loading?: boolean;
}

export function RetryIndicator({ error, onRetry, loading = false }: RetryIndicatorProps) {
  return (
    <div className="sticky top-16 z-50 mb-4 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="rounded-xl bg-surface-container/95 backdrop-blur-xl border border-stitch-green/30 shadow-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{error}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          disabled={loading}
          className="flex-shrink-0 gap-2 text-stitch-green hover:bg-stitch-green/10 hover:text-stitch-green"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Retry</span>
        </Button>
      </div>
    </div>
  );
}
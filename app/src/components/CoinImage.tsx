import { useState } from 'react';

interface CoinImageProps {
  src: string;
  alt: string;
  symbol?: string;
  className?: string;
  size?: number;
}

export function CoinImage({ src, alt, symbol, className = '', size }: CoinImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div 
        className={`rounded-full flex items-center justify-center font-bold bg-surface-dark text-eke-amber ${className}`}
        style={{
          width: size || 32,
          height: size || 32,
          fontSize: (size || 32) * 0.35,
          backgroundColor: '#0D0D0F',
          color: '#EF9F27',
        }}
      >
        {(symbol || alt).slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
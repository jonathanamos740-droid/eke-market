import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { brand } from './brand';

interface TextSnapProps {
  text: string;
  color?: string;
}

export const TextSnap: React.FC<TextSnapProps> = ({ text, color = brand.white }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 8], [0.92, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: brand.bg,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <span
        style={{
          fontSize: 96,
          fontWeight: 800,
          color,
          fontFamily: brand.font,
          textAlign: 'center',
          letterSpacing: '-2px',
        }}
      >
        {text}
      </span>
    </div>
  );
};
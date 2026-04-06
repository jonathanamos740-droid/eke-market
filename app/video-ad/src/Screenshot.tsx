import React from 'react';
import { useCurrentFrame, interpolate, staticFile } from 'remotion';
import { brand } from './brand';

interface ScreenshotProps {
  src: string;
}

export const Screenshot: React.FC<ScreenshotProps> = ({ src }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: brand.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <img
        src={staticFile(src)}
        style={{
          width: '85%',
          borderRadius: 16,
          boxShadow: '0 0 80px rgba(186,117,23,0.3)',
        }}
        alt="App screenshot"
      />
    </div>
  );
};
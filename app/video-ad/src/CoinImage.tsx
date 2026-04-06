import React from 'react';
import { Img, staticFile } from 'remotion';

interface CoinImageProps {
  symbol: string;
  size?: number;
}

export const CoinImage: React.FC<CoinImageProps> = ({ symbol, size = 40 }) => {
  return (
    <Img
      src={staticFile(`coins/${symbol}.png`)}
      width={size}
      height={size}
      style={{ borderRadius: '50%' }}
    />
  );
};
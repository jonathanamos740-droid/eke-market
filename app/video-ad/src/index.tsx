import { registerRoot, Composition } from 'remotion';
import { EkeAd } from './EkeAd';

// Register the root component
registerRoot(EkeAd);

// Define the composition
Composition({
  id: 'EkeAd',
  component: EkeAd,
  durationInFrames: 900,
  fps: 30,
  width: 1920,
  height: 1080,
});
import { Composition } from 'remotion';
import { EkeAd } from './EkeAd';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="EkeAd"
        component={EkeAd}
        durationInFrames={1330}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
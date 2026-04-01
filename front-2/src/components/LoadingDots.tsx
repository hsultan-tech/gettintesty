import React from 'react';
import Lottie from 'lottie-react';
import scotiaLoadingDots from '../assets/scotia-loading-dots.json';

export const LoadingDots: React.FC = () => {
  return (
    <Lottie
      animationData={scotiaLoadingDots}
      loop
      autoplay
      style={{ width: 32, height: 22 }}
      rendererSettings={{ viewBoxSize: '870 480 280 200' }}
    />
  );
};

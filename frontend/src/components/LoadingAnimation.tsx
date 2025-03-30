import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Spline to prevent SSR issues
const Spline = dynamic(() => import('@splinetool/react-spline/next'), {
  ssr: false,
  loading: () => <LoadingFallback />
});

// Simple loading fallback while Spline loads
const LoadingFallback = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

interface LoadingAnimationProps {
  className?: string;
  height?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  className = "w-full h-[400px]",
  height = "400px"
}) => {
  return (
    <div className={className} style={{ height }}>
      <Suspense fallback={<LoadingFallback />}>
        <Spline
          scene="https://prod.spline.design/y2E-L-4rU9CqU31D/scene.splinecode"
        />
      </Suspense>
    </div>
  );
};

export default LoadingAnimation; 
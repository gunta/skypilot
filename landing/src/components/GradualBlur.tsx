import { useEffect, useRef } from 'react';

interface GradualBlurProps {
  target?: 'parent' | 'self';
  position?: 'top' | 'bottom' | 'left' | 'right';
  height?: string;
  width?: string;
  strength?: number;
  divCount?: number;
  curve?: 'linear' | 'bezier' | 'easeIn' | 'easeOut';
  exponential?: boolean;
  opacity?: number;
}

export default function GradualBlur({
  target = 'parent',
  position = 'bottom',
  height = '6rem',
  width = '100%',
  strength = 2,
  divCount = 5,
  curve = 'bezier',
  exponential = true,
  opacity = 1,
}: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getCurveValue = (index: number, total: number): number => {
    const t = index / (total - 1);
    
    switch (curve) {
      case 'linear':
        return t;
      case 'bezier':
        // Cubic bezier easing
        return t * t * (3 - 2 * t);
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      default:
        return t;
    }
  };

  const getBlurValue = (index: number): number => {
    const curveValue = getCurveValue(index, divCount);
    const baseBlur = exponential
      ? Math.pow(curveValue, 2) * strength
      : curveValue * strength;
    return baseBlur;
  };

  const getPositionStyles = (): React.CSSProperties => {
    const isVertical = position === 'top' || position === 'bottom';
    
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 10,
    };

    if (isVertical) {
      return {
        ...baseStyles,
        left: 0,
        right: 0,
        height,
        [position]: 0,
      };
    } else {
      return {
        ...baseStyles,
        top: 0,
        bottom: 0,
        width,
        [position]: 0,
      };
    }
  };

  const layers = Array.from({ length: divCount }, (_, index) => {
    const blurValue = getBlurValue(index);
    const layerOpacity = exponential
      ? Math.pow(index / (divCount - 1), 1.5) * opacity
      : (index / (divCount - 1)) * opacity;

    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: `blur(${blurValue}px)`,
          WebkitBackdropFilter: `blur(${blurValue}px)`,
          opacity: layerOpacity,
          backgroundColor: position === 'bottom' || position === 'right'
            ? `rgba(10, 10, 10, ${layerOpacity * 0.3})`
            : `rgba(10, 10, 10, ${layerOpacity * 0.2})`,
        }}
      />
    );
  });

  return (
    <div
      ref={containerRef}
      style={getPositionStyles()}
      className="gradual-blur-container"
    >
      {layers}
    </div>
  );
}
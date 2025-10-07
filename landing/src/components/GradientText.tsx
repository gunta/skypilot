import { useEffect, useRef, useState } from 'react';

interface GradientTextProps {
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function GradientText({
  colors = ['#00d4ff', '#8b5cf6', '#00d4ff', '#8b5cf6', '#00d4ff'],
  animationSpeed = 3,
  showBorder = false,
  className = '',
  children,
}: GradientTextProps) {
  const [offset, setOffset] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    let lastTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setOffset((prev) => (prev + deltaTime * animationSpeed) % 100);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationSpeed]);

  const gradientStops = colors.map((color, index) => {
    const position = (index / (colors.length - 1)) * 100;
    return `${color} ${position}%`;
  }).join(', ');

  const gradientStyle = {
    background: `linear-gradient(90deg, ${gradientStops})`,
    backgroundSize: '200% 100%',
    backgroundPosition: `${offset}% 0`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
  } as React.CSSProperties;

  const borderStyle = showBorder ? {
    textShadow: `
      -1px -1px 0 ${colors[0]},
      1px -1px 0 ${colors[0]},
      -1px 1px 0 ${colors[0]},
      1px 1px 0 ${colors[0]}
    `,
  } : {};

  return (
    <span
      className={`inline-block font-bold ${className}`}
      style={{ ...gradientStyle, ...borderStyle }}
    >
      {children}
    </span>
  );
}
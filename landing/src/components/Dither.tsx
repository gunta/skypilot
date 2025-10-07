import { useEffect, useRef } from 'react';

interface DitherProps {
  waveColor?: [number, number, number];
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  colorNum?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
}

export default function Dither({
  waveColor = [0.5, 0.5, 0.5],
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 0.3,
  colorNum = 4,
  waveAmplitude = 0.3,
  waveFrequency = 3,
  waveSpeed = 0.05,
}: DitherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (enableMouseInteraction) {
        mousePos.current = {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Dither pattern generation
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      const ditherSize = 4;
      const pixelSize = 2;

      if (!disableAnimation) {
        timeRef.current += waveSpeed;
      }

      for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
          const nx = x / width;
          const ny = y / height;

          // Wave effect
          let wave = 0;
          if (!disableAnimation) {
            wave = Math.sin(nx * waveFrequency + timeRef.current) * 
                   Math.cos(ny * waveFrequency + timeRef.current) * 
                   waveAmplitude;
          }

          // Mouse interaction
          let mouseDist = 0;
          if (enableMouseInteraction) {
            const dx = nx - mousePos.current.x;
            const dy = ny - mousePos.current.y;
            mouseDist = Math.sqrt(dx * dx + dy * dy);
            mouseDist = Math.max(0, 1 - mouseDist / mouseRadius);
          }

          // Base color with wave and mouse
          const baseValue = waveColor[0] + wave + mouseDist * 0.3;
          
          // Dither threshold
          const mx = Math.floor(x / pixelSize) % ditherSize;
          const my = Math.floor(y / pixelSize) % ditherSize;
          const threshold = bayerMatrix[my][mx] / 16;

          // Quantize color
          const colorValue = Math.floor(baseValue * colorNum) / colorNum;
          const dithered = colorValue > threshold ? 1 : 0;

          // Color variations
          let r, g, b;
          if (dithered > 0.5) {
            // Cyan to purple gradient based on position
            const gradientPos = (nx + ny) / 2;
            r = Math.floor(0x00 + (0x8b - 0x00) * gradientPos);
            g = Math.floor(0xd4 + (0x5c - 0xd4) * gradientPos);
            b = Math.floor(0xff + (0xf6 - 0xff) * gradientPos);
            
            // Mix with wave and mouse
            const intensity = 0.15 + (wave + mouseDist) * 0.15;
            r = Math.floor(r * intensity);
            g = Math.floor(g * intensity);
            b = Math.floor(b * intensity);
          } else {
            // Dark background
            const baseDark = 10;
            r = baseDark;
            g = baseDark;
            b = baseDark;
          }

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }

      if (!disableAnimation || enableMouseInteraction) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [waveColor, disableAnimation, enableMouseInteraction, mouseRadius, colorNum, waveAmplitude, waveFrequency, waveSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ 
        width: '100%', 
        height: '100%',
        imageRendering: 'pixelated'
      }}
    />
  );
}
import type { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(220 13% 91%)',
        input: 'hsl(214 32% 91%)',
        ring: 'hsl(221 83% 53%)',
        background: 'hsl(210 20% 98%)',
        foreground: 'hsl(222 47% 11%)',
        primary: {
          DEFAULT: 'hsl(221 83% 53%)',
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: 'hsl(210 24% 93%)',
          foreground: 'hsl(222 47% 11%)'
        },
        destructive: {
          DEFAULT: 'hsl(0 84% 60%)',
          foreground: '#ffffff'
        },
        muted: {
          DEFAULT: 'hsl(210 16% 95%)',
          foreground: 'hsl(215 20% 65%)'
        },
        accent: {
          DEFAULT: 'hsl(210 24% 96%)',
          foreground: 'hsl(222 47% 11%)'
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: 'hsl(222 47% 11%)'
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: 'hsl(222 47% 11%)'
        }
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem'
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(15, 23, 42, 0.25)'
      }
    }
  },
  plugins: [animatePlugin]
};

export default config;

import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        /* ── ReviewSphere semantic tokens ──────────────────────── */
        'rs-bg-base':     'var(--rs-bg-base)',
        'rs-bg-surface':  'var(--rs-bg-surface)',
        'rs-bg-elevated': 'var(--rs-bg-elevated)',
        'rs-border':      'var(--rs-border)',
        'rs-text-primary':'var(--rs-text-primary)',
        'rs-text-muted':  'var(--rs-text-muted)',
        'rs-accent':      'var(--rs-accent)',
        'rs-accent-hover':'var(--rs-accent-hover)',
        'rs-success':     'var(--rs-success)',
        'rs-warning':     'var(--rs-warning)',
        'rs-danger':      'var(--rs-danger)',

        /* ── shadcn/ui tokens ─────────────────────────────────── */
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
      },
      spacing: {
        'xs':   '4px',
        'sm':   '8px',
        'base': '8px',
        'md':   '16px',
        'lg':   '24px',
        'xl':   '32px',
        '2xl':  '48px',
        'gutter': '24px',
        'container-max': '1280px',
      },
      fontFamily: {
        sans:      ['Geist', 'IBM Plex Sans Arabic', 'sans-serif'],
        display:   ['Geist', 'IBM Plex Sans Arabic', 'sans-serif'],
        mono:      ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display':         ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg':     ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-md':     ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body-lg':         ['16px', { lineHeight: '24px', letterSpacing: '0em', fontWeight: '400' }],
        'body-md':         ['14px', { lineHeight: '20px', letterSpacing: '0em', fontWeight: '400' }],
        'label-md':        ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;

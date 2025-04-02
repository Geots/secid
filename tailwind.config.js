/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Futuristic high contrast dark theme palette
        editor: {
          bg: '#0F1117',         // Darker background
          lightBg: '#1A1E2E',     // Secondary background
          border: '#273046',      // Border color
          text: '#E0E4FC',        // Main text - brighter
          muted: '#8A92B2',       // Muted text - more bluish
          accent: '#00CCFF',      // Primary accent (cyan)
          string: '#FF7B6B',      // String color (vibrant coral)
          keyword: '#D16BFF',     // Keyword color (bright purple)
          function: '#FFD76B',    // Function color (bright yellow)
          comment: '#7AE582',     // Comment color (bright green)
          error: '#FF4F4F',       // Error color (bright red)
          warning: '#FFB347',     // Warning color (orange)
          selection: '#3A466B',   // Text selection
          highlight: '#2E3559',   // Used for input field backgrounds
          glow: 'rgba(0, 204, 255, 0.15)', // Glow effect color
        },
        // Keep original gray palette for backward compatibility
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 5px theme("colors.editor.accent")',
        'glow': '0 0 10px theme("colors.editor.accent")',
        'glow-lg': '0 0 15px theme("colors.editor.accent")',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--tw-prose-body)',
            a: {
              color: 'var(--tw-prose-links)',
              '&:hover': {
                color: 'var(--tw-prose-links-hover)',
              },
            },
            h1: {
              color: 'var(--tw-prose-headings)',
            },
            h2: {
              color: 'var(--tw-prose-headings)',
            },
            h3: {
              color: 'var(--tw-prose-headings)',
            },
            h4: {
              color: 'var(--tw-prose-headings)',
            },
            code: {
              color: 'var(--tw-prose-code)',
            },
          },
        },
        // Add dark typography theme
        dark: {
          css: {
            color: '#E0E4FC',
            a: {
              color: '#00CCFF',
              '&:hover': {
                color: '#66E0FF',
              },
            },
            h1: {
              color: '#FFD76B',
            },
            h2: {
              color: '#FFD76B',
            },
            h3: {
              color: '#FFD76B',
            },
            h4: {
              color: '#FFD76B',
            },
            code: {
              color: '#FF7B6B',
            },
            strong: {
              color: '#D16BFF',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 
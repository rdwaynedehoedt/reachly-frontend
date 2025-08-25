import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom responsive breakpoints for all display sizes
      screens: {
        'xs': '320px',    // Extra small mobile phones
        'sm': '640px',    // Small devices (landscape phones)
        'md': '768px',    // Medium devices (tablets)
        'lg': '1024px',   // Large devices (desktops)
        'xl': '1280px',   // Extra large devices
        '2xl': '1536px',  // 2X Extra large devices
        '3xl': '1920px',  // 4K displays
        '4xl': '2560px',  // Ultra-wide displays
      },
      
      // Enhanced spacing for better responsive design
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Responsive font sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Enhanced max widths for better content containment
      maxWidth: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        '8xl': '88rem',
        '9xl': '96rem',
        'screen-xs': '320px',
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
        'screen-2xl': '1536px',
        'screen-3xl': '1920px',
        'screen-4xl': '2560px',
      },
      
      // Enhanced colors using CSS variables for consistency
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        gray: {
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)',
        },
      },
      
      // Enhanced animations for responsive interactions
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-scale': 'fadeInScale 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-blue': 'pulse-blue 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'paper-plane': 'paper-plane 4s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-gentle': 'bounce 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      // Enhanced grid templates for responsive layouts
      gridTemplateColumns: {
        'auto-fit-xs': 'repeat(auto-fit, minmax(200px, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(350px, 1fr))',
        'responsive-cards': 'repeat(auto-fit, minmax(280px, 1fr))',
        'responsive-dashboard': 'repeat(auto-fit, minmax(240px, 1fr))',
      },
      
      // Enhanced shadows for depth perception
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'responsive': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      
      // Enhanced border radius for modern design
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },
    },
  },
  
  // Responsive utility plugins
  plugins: [
    // Custom responsive utilities
    function({ addUtilities, theme }: any) {
      const newUtilities = {
        // Responsive text alignment
        '.text-responsive-center': {
          '@screen xs': {
            'text-align': 'center',
          },
          '@screen md': {
            'text-align': 'left',
          },
        },
        
        // Responsive flex direction
        '.flex-responsive': {
          '@screen xs': {
            'flex-direction': 'column',
          },
          '@screen md': {
            'flex-direction': 'row',
          },
        },
        
        // Responsive padding
        '.p-responsive': {
          '@screen xs': {
            'padding': '1rem',
          },
          '@screen md': {
            'padding': '1.5rem',
          },
          '@screen lg': {
            'padding': '2rem',
          },
          '@screen xl': {
            'padding': '3rem',
          },
        },
        
        // Responsive grid gaps
        '.gap-responsive': {
          '@screen xs': {
            'gap': '0.5rem',
          },
          '@screen md': {
            'gap': '1rem',
          },
          '@screen lg': {
            'gap': '1.5rem',
          },
        },
        
        // Container responsive
        '.container-responsive': {
          'max-width': '100%',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'max-width': '640px',
          },
          '@screen md': {
            'max-width': '768px',
          },
          '@screen lg': {
            'max-width': '1024px',
          },
          '@screen xl': {
            'max-width': '1280px',
          },
          '@screen 2xl': {
            'max-width': '1536px',
          },
          '@screen 3xl': {
            'max-width': '1800px',
            'padding-left': '2rem',
            'padding-right': '2rem',
          },
          '@screen 4xl': {
            'max-width': '2200px',
            'padding-left': '4rem',
            'padding-right': '4rem',
          },
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;

export default config;

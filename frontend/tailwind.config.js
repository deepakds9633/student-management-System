/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--primary)',
                    dim: 'var(--primary-dim)',
                    glow: 'var(--primary-glow)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    dim: 'var(--accent-dim)',
                    glow: 'var(--accent-glow)',
                },
                success: {
                    DEFAULT: 'var(--success)',
                    dim: 'var(--success-dim)',
                },
                warning: {
                    DEFAULT: 'var(--warning)',
                    dim: 'var(--warning-dim)',
                },
                danger: {
                    DEFAULT: 'var(--danger)',
                    dim: 'var(--danger-dim)',
                },
                glass: {
                    DEFAULT: 'var(--glass-bg)',
                    border: 'var(--glass-border)',
                },
                mc: {
                    bg: 'var(--mc-bg)',
                    card: 'var(--mc-card)',
                    border: 'var(--mc-border)',
                    'border-accent': 'var(--mc-border-accent)',
                    text: 'var(--mc-text)',
                    'text-muted': 'var(--mc-text-muted)',
                    'text-dim': 'var(--mc-text-dim)',
                    teal: 'var(--mc-teal)',
                    purple: 'var(--mc-purple)',
                }
            },
            borderRadius: {
                '2xm': '1.25rem',
                '3xm': '1.5rem',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            backgroundImage: {
                'mesh-gradient': 'var(--mesh-gradient)',
            }
        },
    },
    plugins: [],
}

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            style={{
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isDark ? '#fbbf24' : '#64748b',
                transition: 'all 0.3s ease',
                boxShadow: isDark ? '0 0 10px rgba(251, 191, 36, 0.2)' : '0 2px 5px rgba(0, 0, 0, 0.05)',
                marginRight: '0.5rem',
                flexShrink: 0
            }}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                if (isDark) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                } else {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.color = '#3b82f6';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                if (isDark) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                } else {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.color = '#64748b';
                }
            }}
        >
            {isDark ? (
                // Sun Icon (Dark Mode Active)
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ animation: 'spin 10s linear infinite' }}>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            ) : (
                // Moon Icon (Light Mode Active)
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </button>
    );
};

export default ThemeToggle;

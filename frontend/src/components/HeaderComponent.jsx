import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

const HeaderComponent = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const u = AuthService.getCurrentUser();
        setUser(u);
    }, [location]);

    // Don't show header on pages that have their own nav
    const hideOn = ['/staff-dashboard', '/student-dashboard', '/admin-dashboard', '/notices', '/assignments', '/export', '/analytics'];
    if (hideOn.some(p => location.pathname.startsWith(p))) return null;

    // Don't show on login
    if (location.pathname === '/login' || location.pathname === '/') return null;

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const isStaff = user?.roles?.includes('ROLE_STAFF');

    const getDashboardLink = () => {
        if (isAdmin) return '/admin-dashboard';
        if (isStaff) return '/staff-dashboard';
        return '/student-dashboard';
    };

    const getRoleName = () => {
        if (isAdmin) return 'Admin';
        if (isStaff) return 'Staff';
        return 'Student';
    };

    const getRoleColor = () => {
        if (isAdmin) return { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.2)' };
        if (isStaff) return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' };
        return { bg: 'rgba(0, 229, 200, 0.15)', text: '#00e5c8', border: 'rgba(0, 229, 200, 0.2)' };
    };

    const roleColor = getRoleColor();

    return (
        <nav style={{
            background: 'var(--mc-surface)',
            borderBottom: '1px solid var(--mc-border)',
            position: 'sticky', top: 0, zIndex: 50
        }}>
            <div style={{
                maxWidth: '80rem', margin: '0 auto',
                padding: '0 1.5rem', height: '3.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(59,130,246,0.3)'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                        </svg>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--mc-text)', letterSpacing: '-0.01em' }}>
                            StudentPortal
                        </span>
                        <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', marginLeft: '0.5rem', letterSpacing: '0.08em' }}>
                            MANAGEMENT SYSTEM
                        </span>
                    </div>
                </div>

                {/* Right Actions */}
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ThemeToggle />

                        {/* Dashboard Link */}
                        <button onClick={() => navigate(getDashboardLink())}
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--mc-border-accent)',
                                borderRadius: '0.5rem', padding: '0.375rem 0.75rem',
                                color: 'var(--mc-text-muted)', fontSize: '0.75rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.375rem'
                            }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Dashboard
                        </button>

                        <NotificationBell />

                        {/* Settings */}
                        <button style={{
                            background: 'none', border: 'none', color: 'var(--mc-text-dim)', cursor: 'pointer',
                            padding: '0.375rem', display: 'flex', alignItems: 'center'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div style={{ width: 1, height: 24, background: 'var(--mc-border)' }} />

                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 700, color: '#fff'
                            }}>
                                {user.username?.[0]?.toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mc-text)' }}>
                                    {user.username}
                                </span>
                                <span className="role-badge" style={{
                                    background: roleColor.bg, color: roleColor.text,
                                    border: `1px solid ${roleColor.border}`,
                                    fontSize: '0.5625rem', padding: '0.1rem 0.5rem', marginTop: '0.125rem'
                                }}>
                                    {getRoleName()}
                                </span>
                            </div>
                        </div>

                        {/* Logout */}
                        <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}
                            style={{
                                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.15)',
                                borderRadius: '0.5rem', padding: '0.375rem 0.875rem',
                                color: '#fb7185', fontSize: '0.75rem', fontWeight: 500,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem'
                            }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default HeaderComponent;

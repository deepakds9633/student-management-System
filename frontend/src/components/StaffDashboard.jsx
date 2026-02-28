import { useEffect, useState } from 'react';
import AuthService from '../services/AuthService';
import AnalyticsService from '../services/AnalyticsService';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const StaffDashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) { navigate("/login"); }
        setUser(currentUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const modules = [
        {
            title: 'Students',
            desc: 'Manage student records',
            actionText: 'Manage students →',
            link: '/students',
            icon: '👥',
            bgColor: '#3b82f6'
        },
        {
            title: 'Attendance',
            desc: 'Mark & view attendance',
            actionText: 'Take attendance →',
            link: '/attendance',
            icon: '📅',
            bgColor: '#22c55e'
        },
        {
            title: 'Marks',
            desc: 'Enter & manage marks',
            actionText: 'Enter marks →',
            link: '/marks',
            icon: '📝',
            bgColor: '#d946ef'
        },
        {
            title: 'Analytics',
            desc: 'Performance insights',
            actionText: 'View analytics →',
            link: '/analytics',
            icon: '📊',
            bgColor: '#06b6d4'
        },
        {
            title: 'Leave Requests',
            desc: 'Approve/reject leaves',
            actionText: 'Manage leaves →',
            link: '/leaves',
            icon: '📋',
            bgColor: '#f97316'
        },
        {
            title: 'Notice Board',
            desc: 'Post announcements',
            actionText: 'Post notices →',
            link: '/notices',
            icon: '📌',
            bgColor: '#ec4899'
        },
        {
            title: 'Assignments',
            desc: 'Review & grade work',
            actionText: 'Review assignments →',
            link: '/assignments',
            icon: '📚',
            bgColor: '#8b5cf6'
        },
        {
            title: 'Export Reports',
            desc: 'PDF & Excel downloads',
            actionText: 'Export data →',
            link: '/export',
            icon: '📥',
            bgColor: '#14b8a6'
        },
        {
            title: 'Reports',
            desc: 'View detailed reports',
            actionText: 'View reports →',
            link: '/reports',
            icon: '📈',
            bgColor: '#f59e0b'
        },
        {
            title: 'Academic Calendar',
            desc: 'View schedules & events',
            actionText: 'View calendar →',
            link: '/calendar',
            icon: '🗓️',
            bgColor: '#10b981'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--mc-bg)', fontFamily: "'Inter', sans-serif" }}>
            {/* Top Navbar */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 2rem', backgroundColor: 'var(--mc-surface)', borderBottom: '1px solid var(--mc-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🏫</span>
                    <h1 style={{ color: 'var(--mc-text)', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Staff Dashboard</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <ThemeToggle />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mc-text-muted)', fontSize: '0.875rem' }}>
                        <span style={{ color: '#fbbf24' }}>👋</span> {user?.username || 'staff'}
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--mc-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span style={{
                            position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#ef4444', color: 'white',
                            fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px'
                        }}>9+</span>
                    </div>
                    <button onClick={handleLogout} style={{
                        backgroundColor: '#312e81', color: '#c7d2fe', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'background-color 0.2s', marginLeft: '0.5rem'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3730a3'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#312e81'}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--mc-text)', marginBottom: '0.5rem' }}>
                        Welcome back, {user?.username || 'staff'}! 👋
                    </h2>
                    <p style={{ color: 'var(--mc-text-muted)', fontSize: '1.125rem' }}>
                        Manage your institution from here
                    </p>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem'
                }}>
                    {modules.map((mod, index) => (
                        <div key={index} onClick={() => navigate(mod.link)} style={{
                            backgroundColor: 'var(--mc-card)', borderRadius: '1rem', padding: '2rem',
                            cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                            display: 'flex', flexDirection: 'column', height: '180px', position: 'relative',
                            border: '1px solid var(--mc-border)',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
                                e.currentTarget.style.backgroundColor = 'var(--mc-card-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.backgroundColor = 'var(--mc-card)';
                            }}
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '0.75rem',
                                background: mod.bgColor, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1.5rem', position: 'absolute',
                                top: '1.5rem', left: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}>
                                {mod.icon}
                            </div>

                            <div style={{
                                flex: 1, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                marginTop: '1.5rem'
                            }}>
                                <h3 style={{ color: 'var(--mc-text)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>
                                    {mod.title}
                                </h3>
                                <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    {mod.desc}
                                </p>
                                <span style={{ color: '#60a5fa', fontSize: '0.875rem', fontWeight: '500' }}>
                                    {mod.actionText}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default StaffDashboard;

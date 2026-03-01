import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import NotificationBell from '../NotificationBell';
import AuthService from '../../services/AuthService';

const getBreadcrumb = (pathname) => {
    const map = {
        '/admin-dashboard': 'Admin Dashboard',
        '/staff-dashboard': 'Staff Dashboard',
        '/student-dashboard': 'Student Dashboard',
        '/students': 'Students',
        '/add-student': 'Add Student',
        '/attendance': 'Attendance',
        '/marks': 'Marks & Grades',
        '/reports': 'Reports',
        '/analytics': 'Analytics',
        '/leaves': 'Leave Management',
        '/notices': 'Notice Board',
        '/assignments': 'Assignments',
        '/export': 'Export Data',
        '/calendar': 'Academic Calendar',
        '/settings': 'Settings',
    };
    if (pathname.startsWith('/students/')) return 'Student Profile';
    if (pathname.startsWith('/edit-student/')) return 'Edit Student';
    if (pathname.startsWith('/notices/')) return 'Notice Detail';
    return map[pathname] || 'Dashboard';
};

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const location = useLocation();
    const user = AuthService.getCurrentUser();

    const noLayoutPages = ['/login', '/'];
    if (noLayoutPages.includes(location.pathname)) {
        return <>{children}</>;
    }

    const section = getBreadcrumb(location.pathname);
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const isStaff = user?.roles?.includes('ROLE_STAFF');
    const rootLabel = isAdmin ? 'Admin' : isStaff ? 'Staff' : 'Student';

    return (
        <div
            className="min-h-screen flex font-sans"
            style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
                {/* ── Glassmorphic Top App Bar ── */}
                <header
                    className="h-16 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0"
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderBottom: '1px solid var(--glass-border)',
                        boxShadow: '0 1px 0 var(--glass-border), 0 4px 16px rgba(0,0,0,0.04)'
                    }}
                >
                    {/* Left: Hamburger + Breadcrumb */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dim)'; e.currentTarget.style.color = 'var(--primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            <Menu size={22} />
                        </button>

                        {/* Breadcrumb */}
                        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{rootLabel}</span>
                            <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{section}</span>
                        </nav>
                        <span className="sm:hidden text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{section}</span>
                    </div>

                    {/* Right: Search + Bell + Theme + Avatar */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative hidden md:flex items-center">
                            {searchOpen ? (
                                <input
                                    autoFocus
                                    onBlur={() => setSearchOpen(false)}
                                    type="text"
                                    placeholder="Search students, notices..."
                                    className="w-52 text-sm px-3 py-1.5 rounded-lg outline-none transition-all"
                                    style={{
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-focus)',
                                        color: 'var(--text-primary)',
                                        boxShadow: '0 0 0 3px var(--primary-dim)'
                                    }}
                                />
                            ) : (
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    className="p-2 rounded-lg transition-all"
                                    style={{ color: 'var(--text-muted)' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dim)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    <Search size={19} />
                                </button>
                            )}
                        </div>

                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* User Avatar Chip */}
                        {user && (
                            <div
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-default transition-all ml-1"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                            >
                                {!avatarError ? (
                                    <img
                                        src={`http://localhost:8080/api/profile/avatar/${user.username}`}
                                        alt="Profile"
                                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                        onError={() => setAvatarError(true)}
                                    />
                                ) : (
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                        style={{
                                            background: isAdmin
                                                ? 'linear-gradient(135deg,#f59e0b,#ef4444)'
                                                : isStaff
                                                    ? 'linear-gradient(135deg,#10b981,#059669)'
                                                    : 'linear-gradient(135deg,#6366f1,#a855f7)'
                                        }}
                                    >
                                        {user.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span className="text-xs font-semibold hidden sm:block" style={{ color: 'var(--text-primary)', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.username}
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main
                    className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8"
                    style={{ minHeight: 0 }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

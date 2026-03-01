import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, ClipboardList, BarChart3,
    Bell, Settings, LogOut, X, GraduationCap, FileText, BookOpen,
    UserCheck, Clock, Download, UserCog
} from 'lucide-react';
import AuthService from '../../services/AuthService';
import AnnouncementService from '../../services/AnnouncementService';

const NavItem = ({ item, onClick }) => (
    <NavLink
        to={item.path}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${isActive
                ? 'bg-[var(--primary-dim)] text-[var(--primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--primary-dim)] hover:text-[var(--primary)]'
            }`
        }
    >
        {({ isActive }) => (
            <>
                {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full bg-[var(--primary)]" />
                )}
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--primary)] text-white">
                        {item.badge}
                    </span>
                )}
            </>
        )}
    </NavLink>
);

const NavSection = ({ title, items, onClick }) => (
    <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <div className="flex flex-col gap-0.5">
            {items.map(item => <NavItem key={item.path} item={item} onClick={onClick} />)}
        </div>
    </div>
);

const Sidebar = ({ isOpen, setIsOpen }) => {
    const [user, setUser] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [avatarError, setAvatarError] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
            const fetchCount = async () => {
                try {
                    const role = currentUser.roles?.includes('ROLE_ADMIN') ? 'ADMIN' : currentUser.roles?.includes('ROLE_STAFF') ? 'STAFF' : 'STUDENT';
                    const lastSeen = localStorage.getItem('lastSeenAnnouncement') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('.')[0];
                    const res = await AnnouncementService.getCount(lastSeen, role);
                    setUnreadCount(res.data.count || 0);
                } catch (e) { /* silent */ }
            };

            fetchCount();
            const interval = setInterval(fetchCount, 30000); // 30s poll
            return () => clearInterval(interval);
        }
    }, [location]);

    if (!user) return null;

    const isAdmin = user.roles?.includes('ROLE_ADMIN');
    const isStaff = user.roles?.includes('ROLE_STAFF');

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getRoleName = () => {
        if (isAdmin) return 'Administrator';
        if (isStaff) return 'Faculty';
        return 'Student';
    };

    const getRoleGradient = () => {
        if (isAdmin) return 'linear-gradient(135deg, #f59e0b, #ef4444)';
        if (isStaff) return 'linear-gradient(135deg, #10b981, #059669)';
        return 'linear-gradient(135deg, #6366f1, #a855f7)';
    };

    const dashboardPath = isAdmin ? '/admin-dashboard' : isStaff ? '/staff-dashboard' : '/student-dashboard';

    const coreNav = [
        { path: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/notices', label: 'Notices', icon: <Bell size={18} />, badge: unreadCount > 0 ? unreadCount : null },
        { path: '/assignments', label: 'Assignments', icon: <ClipboardList size={18} /> },
    ];

    const academicNav = [];
    if (!isAdmin) {
        academicNav.push({ path: '/attendance', label: 'Attendance', icon: <UserCheck size={18} /> });
        academicNav.push({ path: '/marks', label: 'Marks & Grades', icon: <BookOpen size={18} /> });
        academicNav.push({ path: '/leaves', label: 'Leave Requests', icon: <Clock size={18} /> });
    }

    if (isStaff) {
        academicNav.push({ path: '/students', label: 'Students', icon: <Users size={18} /> });
        academicNav.push({ path: '/user-management', label: 'User Management', icon: <UserCog size={18} /> });
    }

    const adminNav = [];
    if (isAdmin) {
        adminNav.push({ path: '/students', label: 'Students', icon: <Users size={18} /> });
        adminNav.push({ path: '/calendar', label: 'Calendar', icon: <Calendar size={18} /> });
        adminNav.push({ path: '/user-management', label: 'User Management', icon: <UserCog size={18} /> });
        adminNav.push({ path: '/reports', label: 'Reports', icon: <FileText size={18} /> });
        adminNav.push({ path: '/export', label: 'Export Data', icon: <Download size={18} /> });
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
                style={{
                    background: 'var(--glass-bg-strong)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)'
                }}
            >
                {/* Brand Bar */}
                <div
                    className="h-16 flex items-center justify-between px-5 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--glass-border)' }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                            style={{ background: 'var(--gradient-primary)', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' }}
                        >
                            <GraduationCap size={18} />
                        </div>
                        <div>
                            <span
                                className="font-black tracking-tight text-sm block"
                                style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                            >
                                MEC
                            </span>
                            <span className="text-[9px] font-semibold uppercase tracking-widest block" style={{ color: 'var(--text-muted)', marginTop: '-1px' }}>Management Portal</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-0">
                    <NavSection title="Main" items={coreNav} onClick={() => setIsOpen(false)} />
                    {academicNav.length > 0 && (
                        <NavSection title="Academic" items={academicNav} onClick={() => setIsOpen(false)} />
                    )}
                    {adminNav.length > 0 && (
                        <NavSection title="Administration" items={adminNav} onClick={() => setIsOpen(false)} />
                    )}

                    <div className="mt-auto pt-2">
                        <NavLink
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-[var(--primary-dim)] text-[var(--primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--primary-dim)] hover:text-[var(--primary)]'
                                }`
                            }
                        >
                            <Settings size={18} />
                            Settings
                        </NavLink>
                    </div>
                </nav>

                {/* User Profile Footer */}
                <div
                    className="p-3 flex-shrink-0"
                    style={{ borderTop: '1px solid var(--glass-border)' }}
                >
                    <div
                        className="flex items-center gap-3 p-2.5 rounded-xl"
                        style={{ background: 'var(--bg-elevated)' }}
                    >
                        {!avatarError ? (
                            <img
                                src={`http://localhost:8080/api/profile/avatar/${user.username}`}
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover shadow-md flex-shrink-0"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                                style={{ background: getRoleGradient(), boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                            >
                                {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{getRoleName()}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-1.5 rounded-lg transition-all flex-shrink-0"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-dim)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

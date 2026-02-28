import { useEffect, useState } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import AdminCalendarPanel from './admin/AdminCalendarPanel';
import ThemeToggle from './ThemeToggle';

const API = 'http://localhost:8080/api';

const AdminDashboard = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'STUDENT' });
    const [msg, setMsg] = useState('');
    const [editingRole, setEditingRole] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [clock, setClock] = useState(new Date());
    const navigate = useNavigate();
    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData();
        const timer = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                axios.get(`${API}/admin/users`, { headers }),
                axios.get(`${API}/admin/stats`, { headers })
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (e) { console.error(e); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            await axios.post(`${API}/admin/users`, form, { headers });
            setMsg('✅ User created successfully!');
            setShowForm(false);
            setForm({ username: '', password: '', role: 'STUDENT' });
            fetchData();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { setMsg('❌ ' + (err.response?.data?.message || err.message)); }
    };

    const handleRoleUpdate = async (id, role) => {
        try {
            await axios.put(`${API}/admin/users/${id}/role`, { role }, { headers });
            setEditingRole(null);
            fetchData();
        } catch (e) { alert('Failed to update role'); }
    };

    const handleDelete = (id) => { setDeleteId(id); };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${API}/admin/users/${deleteId}`, { headers });
            setMsg('✅ User deleted successfully');
            fetchData();
        } catch (e) { setMsg('❌ Delete failed'); }
        setDeleteId(null);
        setTimeout(() => setMsg(''), 3000);
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'ALL' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const totalUsers = stats.totalUsers || 0;
    const studentsCount = stats.students || 0;
    const staffCount = stats.staff || 0;
    const adminsCount = stats.admins || 0;

    const studentPct = totalUsers ? ((studentsCount / totalUsers) * 100).toFixed(1) : 0;
    const staffPct = totalUsers ? ((staffCount / totalUsers) * 100).toFixed(1) : 0;
    const adminPct = totalUsers ? ((adminsCount / totalUsers) * 100).toFixed(1) : 0;

    const quickLinks = [
        { title: 'Students', desc: 'Manage student records and profiles', icon: '🎓', link: '/students', color: '#00e5c8' },
        { title: 'Attendance', desc: 'Track and manage daily attendance', icon: '📊', link: '/attendance', color: '#3b82f6' },
        { title: 'Marks', desc: 'Grade management and assessment', icon: '📝', link: '/marks', color: '#22c55e' },
        { title: 'Analytics', desc: 'Performance insights and reports', icon: '📈', link: '/analytics', color: '#ec4899' },
        { title: 'Notice Board', desc: 'Announcements and notifications', icon: '📌', link: '/notices', color: '#f43f5e' },
        { title: 'Assignments', desc: 'Task assignment and submissions', icon: '📚', link: '/assignments', color: '#f59e0b' },
        { title: 'Leaves', desc: 'Leave management and approvals', icon: '📋', link: '/leaves', color: '#8b5cf6' },
        { title: 'Export', desc: 'Download CSV and PDF reports', icon: '📥', link: '/export', color: '#06b6d4' },
        { title: 'Academic Calendar', desc: 'Institution events and schedules', icon: '🗓️', link: '/calendar', color: '#10b981' },
    ];

    const sideLinks = [
        {
            id: 'dashboard', label: 'Command Center', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            )
        },
        {
            id: 'users', label: 'User Registry', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            )
        },
        {
            id: 'modules', label: 'Modules', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
            )
        },
        {
            id: 'calendar', label: 'Calendar Planner', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            )
        }
    ];

    const formatTime = (d) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--mc-bg)', color: 'var(--mc-text)' }}>
            {/* ===== SIDEBAR ===== */}
            <aside className="mc-sidebar">
                {/* Logo */}
                <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--mc-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(59,130,246,0.3)', flexShrink: 0
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                            </svg>
                        </div>
                        <div className="sidebar-text">
                            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--mc-text)', letterSpacing: '-0.01em' }}>Mission Control</div>
                            <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', marginTop: '0.125rem' }}>ADMIN PANEL</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-dim)', letterSpacing: '0.1em', padding: '0.5rem 0.75rem', marginBottom: '0.25rem' }} className="sidebar-text">
                        NAVIGATION
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {sideLinks.map(link => (
                            <button key={link.id} onClick={() => setActiveView(link.id)}
                                className={`sidebar-nav-item ${activeView === link.id ? 'active' : ''}`}>
                                <span style={{ flexShrink: 0 }}>{link.icon}</span>
                                <span className="sidebar-text">{link.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Clock */}
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--mc-border)' }} className="sidebar-text">
                    <div className="clock-display" style={{ textAlign: 'center' }}>
                        {formatTime(clock)}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--mc-text-muted)', marginTop: '0.375rem' }}>
                        {formatDate(clock)}
                    </div>
                </div>

                {/* User Profile */}
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--mc-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8125rem', fontWeight: 700, color: '#fff'
                            }}>
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: 10, height: 10, borderRadius: '50%',
                                background: '#22c55e', border: '2px solid var(--mc-surface)'
                            }} />
                        </div>
                        <div className="sidebar-text" style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mc-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.username}
                            </div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--mc-text-muted)' }}>Root Admin</div>
                        </div>
                        <ThemeToggle />
                        <NotificationBell />
                    </div>
                    <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}
                        style={{
                            width: '100%', marginTop: '0.75rem', padding: '0.5rem',
                            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.12)',
                            borderRadius: '0.5rem', color: '#fb7185', fontSize: '0.75rem', fontWeight: 500,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem'
                        }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span className="sidebar-text">Disconnect</span>
                    </button>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="mc-main" style={{ padding: '1.5rem 2rem' }}>
                {/* Page Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--mc-text)', margin: 0 }}>
                            {activeView === 'dashboard' && '⚡ Command Center'}
                            {activeView === 'users' && '👥 User Registry'}
                            {activeView === 'modules' && '🔧 Module Hub'}
                            {activeView === 'calendar' && '📅 Academic Calendar'}
                        </h1>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--mc-text-muted)', marginTop: '0.25rem' }}>
                            {activeView === 'dashboard' && 'System overview and real-time statistics'}
                            {activeView === 'users' && 'Create, edit, and manage user accounts'}
                            {activeView === 'modules' && `System online • Operator: @${user?.username} • ${formatDate(clock)}`}
                            {activeView === 'calendar' && 'Centralized scheduling, assignment tracking, and leave management'}
                        </p>
                    </div>
                    {activeView === 'modules' ? (
                        <span style={{
                            background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)',
                            borderRadius: '9999px', padding: '0.375rem 0.875rem', fontSize: '0.75rem', fontWeight: 600
                        }}>
                            ✓ All Systems Nominal
                        </span>
                    ) : (
                        <span className="badge-live">Real-Time</span>
                    )}
                </div>

                {/* ========= COMMAND CENTER VIEW ========= */}
                {activeView === 'dashboard' && (
                    <div className="animate-fadeIn">
                        {/* Stat Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                            <StatCardMC label="Total Users" value={totalUsers} color="#3b82f6" icon={
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            } />
                            <StatCardMC label="Students" value={studentsCount} color="#00e5c8" icon={
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
                            } />
                            <StatCardMC label="Staff" value={staffCount} color="#22c55e" icon={
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            } />
                            <StatCardMC label="Admins" value={adminsCount} color="#f59e0b" icon={
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            } />
                        </div>

                        {/* Telemetry Bar */}
                        <div className="telemetry-bar" style={{ marginBottom: '1.25rem' }}>
                            <div className="telemetry-item"><div className="telemetry-dot" /><span>Uptime</span><strong style={{ color: '#00e5c8' }}>99.9%</strong></div>
                            <div className="telemetry-item"><div className="telemetry-dot" /><span>Latency</span><strong style={{ color: '#00e5c8' }}>42ms</strong></div>
                            <div className="telemetry-item"><div className="telemetry-dot" /><span>Database</span><strong style={{ color: '#22c55e' }}>Connected</strong></div>
                            <div className="telemetry-item"><div className="telemetry-dot warning" /><span>Memory</span><strong style={{ color: '#f59e0b' }}>64%</strong></div>
                            <div className="telemetry-item"><div className="telemetry-dot" /><span>Security</span><strong style={{ color: '#22c55e' }}>Active</strong></div>
                            <div className="telemetry-item"><div className="telemetry-dot" /><span>Sessions</span><strong style={{ color: '#00e5c8' }}>{users.length}</strong></div>
                            <div style={{ marginLeft: 'auto' }}><span className="badge-live">Real-Time</span></div>
                        </div>

                        {/* Three-column section */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                            {/* User Registry List */}
                            <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mc-text)', margin: 0 }}>User Registry</h3>
                                    <span style={{ fontSize: '0.6875rem', color: 'var(--mc-text-muted)' }}>{users.length} total records</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 300, overflowY: 'auto' }}>
                                    {users.slice(0, 10).map((u, i) => (
                                        <div key={u.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
                                            background: 'rgba(255,255,255,0.02)'
                                        }}>
                                            <span style={{ fontSize: '0.6875rem', color: 'var(--mc-text-dim)', minWidth: 20, fontWeight: 600 }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                                background: u.role === 'ADMIN' ? 'rgba(244,63,94,0.15)' : u.role === 'STAFF' ? 'rgba(59,130,246,0.15)' : 'rgba(0,229,200,0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.6875rem', fontWeight: 700,
                                                color: u.role === 'ADMIN' ? '#fb7185' : u.role === 'STAFF' ? '#60a5fa' : '#00e5c8'
                                            }}>
                                                {u.username[0]?.toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--mc-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {u.username}
                                                </div>
                                            </div>
                                            <RoleBadge role={u.role} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Distribution Donut */}
                            <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: '0 0 1.25rem 0', alignSelf: 'flex-start' }}>Distribution</h3>
                                {/* CSS Donut */}
                                <div style={{
                                    width: 160, height: 160, borderRadius: '50%', position: 'relative',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: `conic-gradient(
                                        #00e5c8 0deg ${(studentsCount / (totalUsers || 1)) * 360}deg,
                                        #3b82f6 ${(studentsCount / (totalUsers || 1)) * 360}deg ${((studentsCount + staffCount) / (totalUsers || 1)) * 360}deg,
                                        #f59e0b ${((studentsCount + staffCount) / (totalUsers || 1)) * 360}deg 360deg
                                    )`,
                                    marginBottom: '1.25rem'
                                }}>
                                    <div style={{
                                        width: 100, height: 100, borderRadius: '50%', background: 'var(--mc-card)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--mc-text)' }}>{totalUsers}</span>
                                        <span style={{ fontSize: '0.625rem', color: 'var(--mc-text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL</span>
                                    </div>
                                </div>
                                {/* Legend */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                    <LegendItem color="#00e5c8" label="Students" value={studentsCount} pct={studentPct} />
                                    <LegendItem color="#3b82f6" label="Staff" value={staffCount} pct={staffPct} />
                                    <LegendItem color="#f59e0b" label="Admins" value={adminsCount} pct={adminPct} />
                                </div>
                            </div>

                            {/* Activity Log */}
                            <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mc-text)', margin: 0 }}>Activity Log</h3>
                                    <span className="badge-live">Live</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 300, overflowY: 'auto' }}>
                                    {users.slice(-5).reverse().map(u => (
                                        <div key={u.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                                                background: u.role === 'ADMIN' ? '#f43f5e' : u.role === 'STAFF' ? '#3b82f6' : '#00e5c8'
                                            }} />
                                            <div>
                                                <div style={{ fontSize: '0.8125rem', color: 'var(--mc-text)' }}>
                                                    <strong>{u.username}</strong> registered as {u.role.toLowerCase()}
                                                </div>
                                                <div style={{ fontSize: '0.6875rem', color: 'var(--mc-text-dim)', marginTop: '0.125rem' }}>
                                                    User ID: #{u.id} • Just now
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {users.length === 0 && (
                                        <div style={{ textAlign: 'center', color: 'var(--mc-text-dim)', fontSize: '0.8125rem', padding: '2rem 0' }}>
                                            No activity yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========= USER REGISTRY VIEW ========= */}
                {activeView === 'users' && (
                    <div className="animate-fadeIn">
                        {/* Toolbar */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                                <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--mc-text-muted)' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                </div>
                                <input type="text" placeholder="Search users..." value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pill-input-dark"
                                />
                            </div>
                            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                                style={{
                                    background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)',
                                    borderRadius: '9999px', padding: '0.5rem 1rem', color: 'var(--mc-text)',
                                    fontSize: '0.8125rem', outline: 'none'
                                }}>
                                <option value="ALL">All Roles</option>
                                <option value="STUDENT">Students</option>
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <button onClick={() => setShowForm(!showForm)}
                                className={showForm ? '' : 'btn-gradient-blue'}
                                style={showForm ? {
                                    background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)',
                                    borderRadius: '9999px', padding: '0.5rem 1.25rem', color: 'var(--mc-text)',
                                    fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer'
                                } : { padding: '0.5rem 1.25rem', fontSize: '0.8125rem', borderRadius: '9999px' }}>
                                {showForm ? '✕ Cancel' : '+ New User'}
                            </button>
                        </div>

                        {msg && (
                            <div style={{
                                marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: msg.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(244,63,94,0.08)',
                                border: `1px solid ${msg.startsWith('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)'}`,
                                color: msg.startsWith('✅') ? '#22c55e' : '#fb7185'
                            }}>
                                {msg}
                            </div>
                        )}

                        {/* Create User Form */}
                        {showForm && (
                            <form onSubmit={handleCreate} style={{
                                background: 'var(--mc-card)', border: '1px solid var(--mc-border)',
                                borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.25rem'
                            }}>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mc-text)', margin: '0 0 1rem 0' }}>Create New User</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.625rem', color: 'var(--mc-text-muted)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.375rem' }}>USERNAME</label>
                                        <input type="text" placeholder="Enter username" required value={form.username}
                                            onChange={e => setForm({ ...form, username: e.target.value })}
                                            style={{
                                                width: '100%', background: 'var(--mc-bg)', border: '1px solid var(--mc-border-accent)',
                                                borderRadius: '0.5rem', padding: '0.625rem 0.875rem', color: 'var(--mc-text)',
                                                fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box'
                                            }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.625rem', color: 'var(--mc-text-muted)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.375rem' }}>PASSWORD</label>
                                        <input type="password" placeholder="Enter password" required value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            style={{
                                                width: '100%', background: 'var(--mc-bg)', border: '1px solid var(--mc-border-accent)',
                                                borderRadius: '0.5rem', padding: '0.625rem 0.875rem', color: 'var(--mc-text)',
                                                fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box'
                                            }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.625rem', color: 'var(--mc-text-muted)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.375rem' }}>ROLE</label>
                                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                            style={{
                                                width: '100%', background: 'var(--mc-bg)', border: '1px solid var(--mc-border-accent)',
                                                borderRadius: '0.5rem', padding: '0.625rem 0.875rem', color: 'var(--mc-text)',
                                                fontSize: '0.8125rem', outline: 'none'
                                            }}>
                                            <option value="STUDENT">Student</option>
                                            <option value="STAFF">Staff</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn-gradient-blue" style={{ padding: '0.625rem 1.5rem', fontSize: '0.8125rem' }}>
                                    Create User
                                </button>
                            </form>
                        )}

                        {/* Users Table */}
                        <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', overflow: 'hidden' }}>
                            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--mc-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--mc-text-muted)' }}>{filteredUsers.length} users found</span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--mc-border)' }}>
                                            <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>User</th>
                                            <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Role</th>
                                            <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: 34, height: 34, borderRadius: '0.5rem', flexShrink: 0,
                                                            background: u.role === 'ADMIN' ? 'rgba(244,63,94,0.1)' : u.role === 'STAFF' ? 'rgba(59,130,246,0.1)' : 'rgba(0,229,200,0.1)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.75rem', fontWeight: 700,
                                                            color: u.role === 'ADMIN' ? '#fb7185' : u.role === 'STAFF' ? '#60a5fa' : '#00e5c8'
                                                        }}>
                                                            {u.username[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{u.username}</div>
                                                            <div style={{ fontSize: '0.6875rem', color: 'var(--mc-text-dim)' }}>ID #{u.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    {editingRole === u.id ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <select defaultValue={u.role}
                                                                onChange={e => handleRoleUpdate(u.id, e.target.value)}
                                                                style={{
                                                                    background: 'var(--mc-bg)', border: '1px solid var(--mc-border-accent)',
                                                                    borderRadius: '0.375rem', padding: '0.25rem 0.5rem',
                                                                    color: 'var(--mc-text)', fontSize: '0.75rem', outline: 'none'
                                                                }}>
                                                                <option value="STUDENT">Student</option>
                                                                <option value="STAFF">Staff</option>
                                                                <option value="ADMIN">Admin</option>
                                                            </select>
                                                            <button onClick={() => setEditingRole(null)} style={{ background: 'none', border: 'none', color: 'var(--mc-text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                                                        </div>
                                                    ) : (
                                                        <RoleBadge role={u.role} />
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => setEditingRole(u.id)} title="Change Role"
                                                            style={{
                                                                width: 32, height: 32, borderRadius: '0.5rem', border: 'none',
                                                                background: 'rgba(255,255,255,0.04)', color: 'var(--mc-text-muted)',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(u.id)} title="Delete User"
                                                            style={{
                                                                width: 32, height: 32, borderRadius: '0.5rem', border: 'none',
                                                                background: 'rgba(255,255,255,0.04)', color: 'var(--mc-text-muted)',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========= MODULE HUB VIEW ========= */}
                {activeView === 'modules' && (
                    <div className="animate-fadeIn">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.25rem',
                            maxWidth: '1200px'
                        }}>
                            {quickLinks.map((ql, i) => (
                                <div key={i} className="module-card" onClick={() => navigate(ql.link)}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '50%',
                                        background: `${ql.color}15`, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem', marginBottom: '1rem'
                                    }}>
                                        {ql.icon}
                                    </div>
                                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--mc-text)', margin: '0 0 0.375rem 0' }}>{ql.title}</h3>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--mc-text-muted)', margin: '0 0 1rem 0', lineHeight: 1.4 }}>{ql.desc}</p>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mc-teal)', letterSpacing: '0.05em' }}>
                                        INITIALIZE →
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========= CALENDAR VIEW ========= */}
                {activeView === 'calendar' && (
                    <div className="animate-fadeIn" style={{ height: 'calc(100vh - 120px)' }}>
                        <AdminCalendarPanel />
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)',
                        borderRadius: '1.25rem', padding: '2rem', maxWidth: 380, width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'rgba(244,63,94,0.1)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, textAlign: 'center', margin: '0 0 0.5rem 0', color: 'var(--mc-text)' }}>Delete User?</h3>
                        <p style={{ textAlign: 'center', color: 'var(--mc-text-muted)', fontSize: '0.8125rem', margin: '0 0 1.5rem 0' }}>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setDeleteId(null)}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                    background: 'rgba(255,255,255,0.05)', border: 'none',
                                    color: 'var(--mc-text)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer'
                                }}>
                                Cancel
                            </button>
                            <button onClick={confirmDelete}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                                    background: 'linear-gradient(135deg, #f43f5e, #e11d48)', border: 'none',
                                    color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(244,63,94,0.3)'
                                }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ===== SUB-COMPONENTS ===== */

const StatCardMC = ({ label, value, color, icon }) => (
    <div className="mc-stat-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>{label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--mc-text)', margin: 0, lineHeight: 1 }}>{value}</p>
            </div>
            <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: `${color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color, position: 'relative'
            }}>
                {icon}
                <div style={{
                    position: 'absolute', top: 2, right: 2, width: 8, height: 8,
                    borderRadius: '50%', background: color
                }} />
            </div>
        </div>
    </div>
);

const LegendItem = ({ color, label, value, pct }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--mc-text)' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mc-text)' }}>{value}</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--mc-text-muted)' }}>({pct}%)</span>
        </div>
    </div>
);

const RoleBadge = ({ role }) => {
    const config = {
        ADMIN: { bg: 'rgba(244,63,94,0.1)', text: '#fb7185', border: 'rgba(244,63,94,0.15)', label: 'Admin' },
        STAFF: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.15)', label: 'Staff' },
        STUDENT: { bg: 'rgba(0,229,200,0.1)', text: '#00e5c8', border: 'rgba(0,229,200,0.15)', label: 'Student' }
    };
    const c = config[role] || config.STUDENT;
    return (
        <span className="role-badge" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
            {c.label}
        </span>
    );
};

export default AdminDashboard;

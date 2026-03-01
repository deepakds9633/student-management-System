import { useEffect, useState } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, GraduationCap, UserCheck, ShieldCheck, Activity, Database,
    Server, Clock, Plus, Trash2, Edit2, Search, Bell, TrendingUp, Zap
} from 'lucide-react';
import { Skeleton } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const API = 'http://localhost:8080/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

/* ── KPI Stat Card ── */
const StatCard = ({ loading, title, value, icon, gradient, trend }) => (
    <motion.div variants={fadeUp} className="stat-card">
        <div className="flex items-start justify-between mb-4">
            <div className="icon-chip" style={{ background: gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                {icon}
            </div>
            {trend && (
                <span className="pill-badge badge-success text-[10px]">
                    <TrendingUp size={10} /> {trend}
                </span>
            )}
        </div>
        {loading ? (
            <div className="skeleton-loading h-8 w-20 rounded-lg mb-1" />
        ) : (
            <p className="text-3xl font-black mb-0.5" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                {value || 0}
            </p>
        )}
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</p>
    </motion.div>
);

const AdminDashboard = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'STUDENT' });
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const navigate = useNavigate();
    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => {
        if (!user || !user.roles?.includes('ROLE_ADMIN')) { navigate('/login'); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, statsRes] = await Promise.all([
                axios.get(`${API}/admin/users`, { headers }),
                axios.get(`${API}/admin/stats`, { headers }).catch(() => ({ data: {} }))
            ]);
            setUsers(usersRes.data);
            const manual = {
                totalUsers: usersRes.data.length,
                students: usersRes.data.filter(u => u.role === 'STUDENT').length,
                staff: usersRes.data.filter(u => u.role === 'STAFF').length,
                admins: usersRes.data.filter(u => u.role === 'ADMIN').length
            };
            setStats(Object.keys(statsRes.data).length > 0 ? statsRes.data : manual);
        } catch (e) {
            showMsg('Failed to load dashboard data', 'error');
        } finally { setLoading(false); }
    };

    const showMsg = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/admin/users`, form, { headers });
            showMsg('User created successfully!');
            setShowForm(false);
            setForm({ username: '', password: '', role: 'STUDENT' });
            fetchData();
        } catch (err) { showMsg(err.response?.data?.message || 'Failed to create user', 'error'); }
    };

    const handleRoleUpdate = async (id, role) => {
        try {
            await axios.put(`${API}/admin/users/${id}/role`, { role }, { headers });
            showMsg('Role updated');
            fetchData();
        } catch { showMsg('Failed to update role', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await axios.delete(`${API}/admin/users/${id}`, { headers });
            showMsg('User deleted');
            fetchData();
        } catch { showMsg('Failed to delete', 'error'); }
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const pieData = [
        { name: 'Students', value: stats.students || 0, color: '#6366f1' },
        { name: 'Staff', value: stats.staff || 0, color: '#10b981' },
        { name: 'Admins', value: stats.admins || 0, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const kpis = [
        { title: 'Total Users', value: stats.totalUsers, icon: <Users size={20} className="text-white" />, gradient: 'linear-gradient(135deg,#6366f1,#a855f7)', trend: '+12%' },
        { title: 'Students', value: stats.students, icon: <GraduationCap size={20} className="text-white" />, gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)', trend: '+8%' },
        { title: 'Faculty & Staff', value: stats.staff, icon: <UserCheck size={20} className="text-white" />, gradient: 'linear-gradient(135deg,#10b981,#059669)', trend: '+3%' },
        { title: 'Administrators', value: stats.admins, icon: <ShieldCheck size={20} className="text-white" />, gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', trend: null },
    ];

    const getRoleBadge = (role) => {
        if (role === 'ADMIN') return 'badge-warning';
        if (role === 'STAFF') return 'badge-success';
        return 'badge-primary';
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={16} style={{ color: 'var(--primary)' }} />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Command Center</span>
                    </div>
                    <h1>System Administration</h1>
                    <p>Manage users, monitor system health, and configure platform settings.</p>
                </div>
            </div>

            {/* Toast */}
            {msg.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`toast mb-6 ${msg.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {msg.type === 'error' ? <ShieldCheck size={16} /> : <UserCheck size={16} />}
                    {msg.text}
                </motion.div>
            )}

            {/* Tabs */}
            <div className="tab-group mb-6">
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>User Registry</button>
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

                    {/* Platform Transformation Highlight */}
                    <motion.div variants={fadeUp} className="md-card p-6 border-l-4 overflow-hidden relative" style={{ borderColor: 'var(--primary)', background: 'var(--primary-dim)' }}>
                        <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                            <Zap size={120} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                            <div className="p-4 rounded-xl shadow-sm flex-shrink-0" style={{ background: 'var(--bg-surface)' }}>
                                <TrendingUp size={32} className="text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>EduVerse Portal Transformation</h2>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    The EduVerse Management Portal has been enhanced with a fully redesigned, premium, and adaptive user interface to deliver a modern, enterprise-grade digital experience. The system now features a dynamic light and dark theme architecture that automatically adjusts visual elements such as colors, typography, contrast, and component styling to ensure optimal readability, accessibility, and usability across different devices and environments.
                                </p>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    This adaptive design enables seamless switching between light and dark modes, providing users with personalized control and improved visual comfort. The interface is developed using modern design principles inspired by global technology leaders such as Google and Microsoft, ensuring a clean, responsive, and scalable user experience. All modules including Dashboard, Assignments, Attendance, Marks, Notifications, and Analytics are redesigned with consistent layouts, intuitive navigation, and premium UI components.
                                </p>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    The enhanced theme system ensures that all content, cards, charts, and banners remain clearly visible in both modes, eliminating readability issues and improving overall user engagement. The responsive layout dynamically adjusts to various screen sizes, making the platform suitable for desktop, tablet, and mobile devices.
                                </p>
                                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-xs font-bold font-mono tracking-widest uppercase" style={{ color: 'var(--primary)' }}>
                                        Elevating EduVerse into a top-level SaaS product • Ensuring scalability, accessibility & enterprise-grade UX.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpis.map((kpi, i) => <StatCard key={i} loading={loading} {...kpi} />)}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* System Telemetry */}
                        <motion.div variants={fadeUp} className="md-card p-6">
                            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)' }}>
                                <Server size={14} style={{ color: 'var(--primary)' }} /> System Telemetry
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                {[
                                    { label: 'API Status', value: 'Online', status: 'success' },
                                    { label: 'Database', value: 'Connected', status: 'success' },
                                    { label: 'Uptime', value: '99.9%', status: 'success' },
                                    { label: 'Load Balance', value: 'Optimal', status: 'success' },
                                    { label: 'Memory Usage', value: '48%', status: 'warning' },
                                    { label: 'Error Rate', value: '0.01%', status: 'success' },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{
                                                    background: item.status === 'success' ? 'var(--success)' : 'var(--warning)',
                                                    animation: 'pulse-dot 2s ease-in-out infinite'
                                                }}
                                            />
                                            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Activity Feed */}
                        <motion.div variants={fadeUp} className="md-card p-6 flex flex-col">
                            <h3 className="flex items-center justify-between text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)' }}>
                                <span className="flex items-center gap-2"><Activity size={14} style={{ color: 'var(--primary)' }} />Recent Activity</span>
                                <span className="pill-badge badge-success text-[9px]"><span className="status-dot live" style={{ width: 5, height: 5 }} />Live</span>
                            </h3>
                            <div className="flex-1 space-y-4">
                                {[
                                    { user: 'Admin', action: 'Created new Staff account', time: '2m ago', color: 'var(--success-dim)', textColor: 'var(--success)', icon: <Plus size={11} /> },
                                    { user: 'System', action: 'Daily database backup sync', time: '45m ago', color: 'var(--info-dim)', textColor: 'var(--info)', icon: <Database size={11} /> },
                                    { user: 'Staff_01', action: 'Graded Assignment #102', time: '1h ago', color: 'var(--primary-dim)', textColor: 'var(--primary)', icon: <Edit2 size={11} /> },
                                    { user: 'System', action: 'New notices broadcasted', time: '3h ago', color: 'var(--warning-dim)', textColor: 'var(--warning)', icon: <Bell size={11} /> },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: item.color, color: item.textColor }}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{item.action}</p>
                                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.user} · {item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 pt-4 text-[10px] font-bold uppercase tracking-widest text-center transition-colors"
                                style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                View All Audit Logs
                            </button>
                        </motion.div>

                        {/* Role Distribution Chart */}
                        <motion.div variants={fadeUp} className="md-card p-6 flex flex-col items-center">
                            <h3 className="text-xs font-bold uppercase tracking-widest w-full mb-4" style={{ color: 'var(--text-muted)' }}>Role Distribution</h3>
                            {loading ? (
                                <div className="skeleton-loading w-40 h-40 rounded-full my-4" />
                            ) : (
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={5} dataKey="value" stroke="none">
                                                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, fontWeight: 600 }}
                                                itemStyle={{ color: 'var(--text-primary)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            <div className="w-full grid grid-cols-3 gap-2 mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                {pieData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                                        <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* ── USER REGISTRY TAB ── */}
            {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <div className="relative max-w-xs flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
                                <input type="text" placeholder="Search users..." className="pill-input-dark !pl-9 !py-2"
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <select className="pill-input-dark !py-2 !w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                                <option value="ALL">All Roles</option>
                                <option value="STUDENT">Students</option>
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Administrators</option>
                            </select>
                        </div>
                        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                            {showForm ? 'Cancel' : <><Plus size={16} /> Add User</>}
                        </button>
                    </div>

                    {/* Create Form */}
                    {showForm && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                            <form onSubmit={handleCreate} className="md-card p-6">
                                <h3 className="font-bold text-base mb-5" style={{ color: 'var(--text-primary)' }}>Create New System User</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Username</label>
                                        <input required type="text" className="pill-input-dark" placeholder="student_id" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
                                        <input required type="password" className="pill-input-dark" placeholder="Initial password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>System Role</label>
                                        <select className="pill-input-dark" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                            <option value="STUDENT">Student</option>
                                            <option value="STAFF">Staff</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                    <button type="submit" className="btn-primary">Provision Account</button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Data Table */}
                    <div className="md-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="w-16 text-center">ID</th>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? Array(5).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td><div className="skeleton-loading h-4 w-8 mx-auto" /></td>
                                            <td><div className="flex items-center gap-3"><div className="skeleton-loading h-9 w-9 rounded-full" /><div className="skeleton-loading h-4 w-32" /></div></td>
                                            <td><div className="skeleton-loading h-5 w-16 rounded-full" /></td>
                                            <td className="text-right"><div className="skeleton-loading h-8 w-8 rounded-lg ml-auto" /></td>
                                        </tr>
                                    )) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan="4" className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users found.</td></tr>
                                    ) : filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td className="text-center font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                                                        style={{ background: u.role === 'ADMIN' ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : u.role === 'STAFF' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#a855f7)' }}>
                                                        {u.username[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active account</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <select
                                                    className={`pill-badge ${getRoleBadge(u.role)} cursor-pointer outline-none appearance-none text-center`}
                                                    value={u.role}
                                                    onChange={e => handleRoleUpdate(u.id, e.target.value)}
                                                >
                                                    <option value="STUDENT">Student</option>
                                                    <option value="STAFF">Staff</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    disabled={u.username === user.username}
                                                    className="p-2 rounded-lg transition-all disabled:opacity-30"
                                                    style={{ color: 'var(--text-muted)' }}
                                                    onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-dim)'; } }}
                                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminDashboard;

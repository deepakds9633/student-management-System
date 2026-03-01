import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserCog, ShieldCheck, UserPlus,
    Search, Trash2, Edit3, X, CheckCircle,
    AlertCircle, ChevronRight
} from 'lucide-react';

const UserManagementSystem = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [filterRole, setFilterRole] = useState('ALL');

    const [formData, setFormData] = useState({ username: '', password: '', role: 'STUDENT' });
    const [toast, setToast] = useState(null);

    const currentUser = AuthService.getCurrentUser();
    const headers = { Authorization: `Bearer ${currentUser?.token}` };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, statsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/admin/users', { headers }),
                axios.get('http://localhost:8080/api/admin/stats', { headers })
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching user data:', err);
            showToast('Failed to load system data', 'error');
        }
        setLoading(false);
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/admin/users', formData, { headers });
            showToast('User provisioned successfully');
            setShowForm(false);
            setFormData({ username: '', password: '', role: 'STUDENT' });
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to provision user', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/admin/users/${id}`, { headers });
            showToast('User account terminated');
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to terminate user', 'error');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/users/${id}/role`, { role: newRole }, { headers });
            showToast('Access control updated');
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update access control', 'error');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-default)' }}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronizing Global Directory...</p>
            </div>
        </div>
    );

    const statCards = stats ? [
        { label: 'Total Infrastructure Population', value: stats.totalUsers, icon: <Users size={18} />, color: 'primary' },
        { label: 'Active Academics (Students)', value: stats.students, icon: <Users size={18} />, color: 'success' },
        { label: 'Authorized Personnels (Staff)', value: stats.staff, icon: <UserCog size={18} />, color: 'accent' },
        { label: 'System Administrators', value: stats.admins, icon: <ShieldCheck size={18} />, color: 'danger' }
    ] : [];

    return (
        <div className="min-h-screen pb-20" style={{ background: 'var(--bg-surface)' }}>

            {/* Toast Notification Array */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed top-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border"
                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                        {toast.type === 'error' ? <AlertCircle className="text-danger" size={18} /> : <CheckCircle className="text-success" size={18} />}
                        <span className="text-xs font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{toast.msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">

                {/* Hero Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                            <UserCog className="text-primary" size={32} /> Central User Management
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Enterprise Access & Identity Control</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className="btn-primary flex items-center gap-2 !px-6 !py-2.5 !rounded-xl shadow-lg shadow-primary/20">
                        {showForm ? <X size={18} /> : <UserPlus size={18} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{showForm ? 'Abort Provisioning' : 'Provision Identity'}</span>
                    </button>
                </div>



                {/* Global Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((s, i) => (
                        <div key={i} className="md-card p-6 border-none shadow-xl relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 bg-${s.color}`} />
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">{s.label}</p>
                                    <h4 className="text-2xl font-black tabular-nums">{s.value}</h4>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl bg-${s.color}/10 text-${s.color} flex items-center justify-center shadow-inner`}>
                                    {s.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Control Panel & Directory */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Active Directory List - Takes up 2/3 on large screens */}
                    <div className={`md-card p-0 overflow-hidden ${showForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        <div className="p-6 border-b flex flex-col sm:flex-row items-center gap-4 justify-between" style={{ borderColor: 'var(--border)' }}>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                <input type="text" placeholder="Search global directory..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                                {['ALL', 'STUDENT', 'STAFF', 'ADMIN'].map(r => (
                                    <button key={r} onClick={() => setFilterRole(r)}
                                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                                        ${filterRole === r ? 'bg-primary text-white border-primary shadow-sm' : 'hover:border-[var(--border-strong)]'}`}
                                        style={filterRole !== r ? { background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' } : {}}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                                        {['Identity', 'Access Tier', 'Operations'].map(h => (
                                            <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-40">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {filteredUsers.map((u, i) => (
                                            <motion.tr key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                                                className="border-b last:border-0 hover:bg-[var(--primary-dim)] transition-colors group" style={{ borderColor: 'var(--border)' }}>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-inner
                                                            ${u.role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                                                                u.role === 'STAFF' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                                                                    'bg-gradient-to-br from-indigo-500 to-purple-500'}`}>
                                                            {u.username.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                                                            <p className="text-[10px] font-mono tracking-widest uppercase opacity-40">id: sys_{u.id}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                        disabled={u.username === currentUser.username}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50"
                                                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                        <option value="STUDENT">Student Tier</option>
                                                        <option value="STAFF">Faculty Tier</option>
                                                        <option value="ADMIN">Admin Tier</option>
                                                    </select>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <button onClick={() => handleDeleteUser(u.id)} disabled={u.username === currentUser.username}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger/10 transition-colors disabled:opacity-20">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>

                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>

                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center">
                                                <UserCheck className="mx-auto mb-3 opacity-20" size={32} />
                                                <p className="text-sm font-bold opacity-40">No matching identities found in directory.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Provisioning Form Panel */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="lg:col-span-1">
                                <form onSubmit={handleCreateUser} className="md-card p-6 border-t-4 shadow-2xl sticky top-8" style={{ borderColor: 'var(--primary)' }}>
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Provision Identity</h3>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Secure onboarding portal</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">System Username / ID</label>
                                            <input type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                                placeholder="e.g. 24IT001 or admin_jane" />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">Authentication Key (Password)</label>
                                            <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                                placeholder="Secure password..." />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">Access Tier (Role)</label>
                                            <div className="relative">
                                                <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none font-bold"
                                                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                                    <option value="STUDENT">Student Tier</option>
                                                    <option value="STAFF">Faculty Tier</option>
                                                    <option value="ADMIN">Administrative Tier</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 rotate-90" size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <button type="submit" className="btn-primary w-full flex justify-center items-center py-3.5 !rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform">
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Authorize & Provision</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
};

export default UserManagementSystem;

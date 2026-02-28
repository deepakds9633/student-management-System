import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { Users, ClipboardList, BarChart3, Bell, ChevronRight, BookOpen, Briefcase } from 'lucide-react';

const API = 'http://localhost:8080/api';
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } } };

const StaffDashboard = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [students, setStudents] = useState([]);
    const [notices, setNotices] = useState([]);
    const navigate = useNavigate();
    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        const fetch = async () => {
            try {
                const [sRes, nRes] = await Promise.all([
                    axios.get(`${API}/students`, { headers }).catch(() => ({ data: [] })),
                    axios.get(`${API}/notices`, { headers }).catch(() => ({ data: [] })),
                ]);
                setStudents(sRes.data);
                setNotices(nRes.data.slice(0, 4));
            } catch { /* silent */ }
        };
        fetch();
    }, []);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const actions = [
        { icon: <Users size={22} />, label: 'Student Roster', desc: 'Manage all students', color: '#6366f1', to: '/students' },
        { icon: <ClipboardList size={22} />, label: 'Assignments', desc: 'Review & grade work', color: '#10b981', to: '/assignments' },
        { icon: <BarChart3 size={22} />, label: 'Analytics', desc: 'Performance insights', color: '#06b6d4', to: '/analytics' },
        { icon: <Bell size={22} />, label: 'Notices', desc: 'Post announcements', color: '#f59e0b', to: '/notices' },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden"
                style={{ background: 'var(--gradient-hero)' }}
            >
                <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)', opacity: 0.6 }} />
                <div className="absolute right-8 top-4 opacity-10 hidden sm:block">
                    <Briefcase size={120} className="text-white" />
                </div>
                <div className="relative z-10">
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>Faculty Portal</span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-1">
                        {getGreeting()}, {user?.username}!
                    </h1>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        You have <strong className="text-white">{students.length} students</strong> in your roster. {notices.length} active notice{notices.length !== 1 ? 's' : ''}.
                    </p>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Quick Access</h2>
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    {actions.map((a, i) => (
                        <motion.button
                            key={i}
                            variants={fadeUp}
                            onClick={() => navigate(a.to)}
                            className="text-left p-5 rounded-2xl transition-all duration-200 w-full"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = a.color + '40'; e.currentTarget.style.boxShadow = `0 8px 24px ${a.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-3"
                                style={{ background: a.color, boxShadow: `0 4px 12px ${a.color}40` }}>
                                {a.icon}
                            </div>
                            <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{a.label}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Stats + Notices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total Students', value: students.length, color: '#6366f1', icon: <Users size={18} className="text-white" /> },
                    { label: 'Active Notices', value: notices.length, color: '#f59e0b', icon: <Bell size={18} className="text-white" /> },
                    { label: 'Courses', value: '—', color: '#10b981', icon: <BookOpen size={18} className="text-white" /> },
                ].map((s, i) => (
                    <motion.div key={i} variants={fadeUp} initial="hidden" animate="show"
                        className="stat-card flex items-center gap-4">
                        <div className="icon-chip" style={{ background: s.color, boxShadow: `0 4px 12px ${s.color}40` }}>{s.icon}</div>
                        <div>
                            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Notices */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md-card p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Notices</h3>
                    <button onClick={() => navigate('/notices')} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                        View all <ChevronRight size={14} />
                    </button>
                </div>
                <div className="space-y-3">
                    {notices.length === 0 ? (
                        <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No notices posted yet.</p>
                    ) : notices.map((n, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                            style={{ background: 'var(--bg-elevated)' }}
                            onClick={() => navigate(`/notices/${n.id}`)}>
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--primary)' }} />
                            <p className="font-medium text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                            <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default StaffDashboard;

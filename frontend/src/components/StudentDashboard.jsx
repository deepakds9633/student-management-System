import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import AuthService from '../services/AuthService';
import {
    BookOpen, UserCheck, ClipboardList, Bell, Calendar,
    TrendingUp, Award, Clock, ChevronRight, Sparkles
} from 'lucide-react';

const API = 'http://localhost:8080/api';
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const QuickAction = ({ icon, label, desc, to, color, onClick }) => (
    <motion.button
        variants={fadeUp}
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="text-left p-5 rounded-2xl transition-all duration-200 w-full"
        style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.boxShadow = `0 8px 24px ${color}18`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
            style={{ background: color, boxShadow: `0 4px 12px ${color}40` }}>
            {icon}
        </div>
        <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </motion.button>
);

const StudentDashboard = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [notices, setNotices] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const navigate = useNavigate();
    const headers = { Authorization: `Bearer ${user?.token}` };

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
        if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
        return { text: 'Good Evening', emoji: '🌙' };
    };

    const greeting = getGreeting();

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        const fetch = async () => {
            try {
                const [nRes, aRes] = await Promise.all([
                    axios.get(`${API}/notices`, { headers }).catch(() => ({ data: [] })),
                    axios.get(`${API}/assignments/student/${user.username}`, { headers }).catch(() => ({ data: [] })),
                ]);
                setNotices(nRes.data.slice(0, 3));
                setAssignments(aRes.data.slice(0, 4));
            } catch { /* silent */ }
        };
        fetch();
    }, []);

    const actions = [
        { icon: <UserCheck size={20} />, label: 'Attendance', desc: 'View your attendance record', color: '#10b981', to: '/attendance' },
        { icon: <BookOpen size={20} />, label: 'Marks & Grades', desc: 'Check your academic results', color: '#6366f1', to: '/marks' },
        { icon: <ClipboardList size={20} />, label: 'Assignments', desc: 'Submit pending tasks', color: '#06b6d4', to: '/assignments' },
        { icon: <Clock size={20} />, label: 'Leave Request', desc: 'Apply for leave', color: '#f59e0b', to: '/leaves' },
        { icon: <Bell size={20} />, label: 'Notice Board', desc: 'Latest announcements', color: '#ec4899', to: '/notices' },
        { icon: <Calendar size={20} />, label: 'Academic Calendar', desc: 'Events & important dates', color: '#8b5cf6', to: '/calendar' },
    ];

    const getStatusColor = (status) => {
        if (!status) return 'var(--warning)';
        const s = status.toLowerCase();
        if (s === 'submitted' || s === 'graded') return 'var(--success)';
        return 'var(--warning)';
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* ── Personalized Hero Greeting ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden"
                style={{ background: 'var(--gradient-hero)', minHeight: 140 }}
            >
                <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)', opacity: 0.6 }} />
                {/* Glow orb */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-20 hidden sm:block"
                    style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(30px)' }} />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>Student Portal</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                            {greeting.text}, {user?.username}! {greeting.emoji}
                        </h1>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            Stay on top of your academic journey. You have {assignments.filter(a => a.submissionStatus !== 'submitted').length || 0} pending assignments.
                        </p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        {[
                            { label: 'Notices', value: notices.length, icon: <Bell size={14} />, color: '#ec4899' },
                            { label: 'Due Tasks', value: assignments.length, icon: <ClipboardList size={14} />, color: '#f59e0b' },
                        ].map((s, i) => (
                            <div key={i} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', minWidth: 72 }}>
                                <div className="flex items-center justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                                <p className="text-lg font-black text-white">{s.value}</p>
                                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Quick Actions ── */}
            <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Quick Access</h2>
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
                >
                    {actions.map((a, i) => (
                        <QuickAction key={i} {...a} onClick={() => navigate(a.to)} />
                    ))}
                </motion.div>
            </div>

            {/* ── Content Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Notices */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Latest Notices</h3>
                        <button onClick={() => navigate('/notices')} className="text-xs font-semibold flex items-center gap-1 transition-colors"
                            style={{ color: 'var(--primary)' }}>
                            View all <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {notices.length === 0 ? (
                            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No notices yet.</p>
                        ) : notices.map((n, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                                style={{ background: 'var(--bg-elevated)' }}
                                onClick={() => navigate(`/notices/${n.id}`)}>
                                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--primary)' }} />
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                        {n.date ? new Date(n.date).toLocaleDateString() : 'Recently posted'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Assignments */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Assignments</h3>
                        <button onClick={() => navigate('/assignments')} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                            View all <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {assignments.length === 0 ? (
                            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No assignments found.</p>
                        ) : assignments.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getStatusColor(a.submissionStatus) }} />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                                    {a.dueDate && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Due: {new Date(a.dueDate).toLocaleDateString()}</p>}
                                </div>
                                <span className="pill-badge badge-muted text-[10px] flex-shrink-0 capitalize">{a.submissionStatus || 'Pending'}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentDashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import AuthService from '../services/AuthService';
import {
    BookOpen, UserCheck, ClipboardList, Bell, Calendar,
    TrendingUp, Award, Clock, ChevronRight, Sparkles, CheckCircle2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
    PieChart, Pie
} from 'recharts';

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
    const [marks, setMarks] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const navigate = useNavigate();
    const headers = { Authorization: `Bearer ${user?.token}` };

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return { text: 'Good Morning', emoji: '☀️' };
        if (h < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
        return { text: 'Good Evening', emoji: '🌙' };
    };

    const greeting = getGreeting();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        const fetchAllData = async () => {
            setIsRefreshing(true);
            try {
                const [nRes, aRes, mRes, attRes] = await Promise.all([
                    axios.get(`${API}/notices`, { headers }).catch(() => ({ data: [] })),
                    axios.get(`${API}/assignments/student/${user.username}`, { headers }).catch(() => ({ data: [] })),
                    axios.get(`${API}/marks/student/me`, { headers }).catch(() => ({ data: [] })),
                    axios.get(`${API}/attendance/student/me`, { headers }).catch(() => ({ data: [] })),
                ]);
                setNotices(nRes.data.slice(0, 3));
                setAssignments(aRes.data);
                setMarks(mRes.data);
                setAttendance(attRes.data);
                setLastUpdated(new Date());
            } catch { /* silent */ }
            setIsRefreshing(false);
        };

        fetchAllData();
        // Live data streaming simulation (polls every 30 seconds)
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, [user]);

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

    // --- Analytics Data Processing ---

    // 1. Performance Analytics (Marks Bar Chart)
    const gradeData = marks.map(m => ({
        subject: m.subject.length > 8 ? m.subject.substring(0, 8) + '..' : m.subject,
        score: m.maxMarks ? Math.round((m.marksObtained / m.maxMarks) * 100) : 0,
        fullSubject: m.subject
    }));

    // 2. Attendance Trends (Area Chart)
    const processAttendance = (records) => {
        if (!records.length) return [];
        const monthly = {};
        const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
        sorted.forEach(r => {
            const d = new Date(r.date);
            const m = d.toLocaleString('default', { month: 'short' });
            if (!monthly[m]) monthly[m] = { total: 0, present: 0 };
            monthly[m].total++;
            if (r.status === 'Present') monthly[m].present++;
        });
        return Object.keys(monthly).map(m => ({
            month: m,
            percentage: Math.round((monthly[m].present / monthly[m].total) * 100)
        }));
    };
    const attendanceData = processAttendance(attendance);

    // 3. Assignment Completion (Pie Chart)
    const pendingCount = assignments.filter(a => a.submissionStatus !== 'submitted').length;
    const completedCount = assignments.length - pendingCount;
    const assignmentStats = [
        { name: 'Completed', value: completedCount, color: '#10b981' },
        { name: 'Pending', value: pendingCount, color: '#f59e0b' }
    ];

    // 4. AI-Driven Smart Insights Generator
    const generateInsights = () => {
        if (!marks.length && !attendance.length && !assignments.length) return [];
        let insights = [];

        // Performance Insight
        if (marks.length > 0) {
            const total = marks.reduce((sum, m) => sum + (m.maxMarks ? (m.marksObtained / m.maxMarks) : 0), 0);
            const avg = Math.round((total / marks.length) * 100);
            if (avg >= 85) insights.push({ type: 'success', text: `Exceptional performance! You are averaging ${avg}% across all subjects.` });
            else if (avg >= 60) insights.push({ type: 'info', text: `Solid academic standing averaging ${avg}%. Focus on your lowest scoring subject to boost results.` });
            else insights.push({ type: 'warning', text: `Your average is currently ${avg}%. Consider scheduling a tutoring session.` });
        }

        // Attendance Insight
        if (attendance.length > 0) {
            const presentCount = attendance.filter(a => a.status === 'Present').length;
            const attPerc = Math.round((presentCount / attendance.length) * 100);
            if (attPerc < 75) insights.push({ type: 'danger', text: `Critical Warning: Your attendance (${attPerc}%) is below the required 75% threshold.` });
            else if (attPerc >= 90) insights.push({ type: 'success', text: `Excellent attendance record (${attPerc}%). Consistency is key to academic success.` });
        }

        // Workflow / Task Insight
        if (pendingCount > 0) insights.push({ type: 'warning', text: `Action Required: You have ${pendingCount} pending assignments approaching their due dates.` });
        else if (assignments.length > 0) insights.push({ type: 'success', text: `Outstanding time management. All active assignments have been submitted.` });

        return insights.slice(0, 2); // Return top 2 insights
    };
    const smartInsights = generateInsights();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ── Personalized Hero Greeting ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
                style={{ background: 'var(--gradient-hero)', minHeight: 140 }}
            >
                <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)', opacity: 0.6 }} />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-20 hidden sm:block"
                    style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(30px)' }} />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>Intelligent Student Portal</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                            {greeting.text}, {user?.username}! {greeting.emoji}
                        </h1>
                        <p className="text-sm flex flex-col sm:flex-row sm:items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            <span>Welcome to your real-time academic intelligence dashboard.</span>
                            <span className="flex items-center gap-1.5 text-xs bg-black/20 px-2 py-1 rounded-full w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRefreshing ? 'bg-yellow-400' : 'bg-emerald-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isRefreshing ? 'bg-yellow-500' : 'bg-emerald-500'}`}></span>
                                </span>
                                {isRefreshing ? 'Syncing live data...' : `Live Sync Active (Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                            </span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── AI-Driven Smart Insights Panel ── */}
            {smartInsights.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="md-card p-4 border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-indigo-500/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-purple-500" />
                        <h3 className="font-bold text-sm tracking-tight text-purple-600 dark:text-purple-400">AI-Driven Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {smartInsights.map((insight, idx) => {
                            const colors = {
                                success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                                warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                                danger: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
                                info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                            };
                            return (
                                <div key={idx} className={`p-3 rounded-lg border text-xs font-semibold flex items-start gap-2 ${colors[insight.type]}`}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 bg-current opacity-70" />
                                    <p className="leading-relaxed">{insight.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ── Quick Actions ── */}
            <div>
                <motion.div variants={stagger} initial="hidden" animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {actions.map((a, i) => <QuickAction key={i} {...a} onClick={() => navigate(a.to)} />)}
                </motion.div>
            </div>

            {/* ── Performance Analytics Visualizations ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Academic Progress Matrix */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="md-card p-6 border-t-4 border-indigo-500">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">Academic Progress Matrix</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Subject Performance Index</p>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500"><TrendingUp size={16} /></div>
                    </div>
                    {gradeData.length > 0 ? (
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} dy={10} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '11px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                    <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={16}>
                                        {gradeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score >= 80 ? 'var(--success)' : entry.score >= 60 ? 'var(--primary)' : 'var(--warning)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center opacity-40 text-xs font-bold">No academic data available.</div>
                    )}
                </motion.div>

                {/* Attendance Trends */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="md-card p-6 border-t-4 border-emerald-500">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">Attendance Dynamics</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Monthly Velocity</p>
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500"><Calendar size={16} /></div>
                    </div>
                    {attendanceData.length > 0 ? (
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} dy={10} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip cursor={{ stroke: '#10b981', strokeWidth: 1 }} border={0}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '11px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                    <Area type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center opacity-40 text-xs font-bold">No attendance records.</div>
                    )}
                </motion.div>

                {/* Assignment Task Ratio */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="md-card p-6 border-t-4 border-blue-500 flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-2">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">Task Completion</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Assignment Pipeline</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500"><ClipboardList size={16} /></div>
                    </div>
                    {assignments.length > 0 ? (
                        <>
                            <div className="h-[160px] w-full relative drop-shadow-md mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={assignmentStats.filter(s => s.value > 0)}
                                            cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                                            paddingAngle={4} dataKey="value" stroke="none"
                                        >
                                            {assignmentStats.filter(s => s.value > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '11px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black">{completedCount}</span>
                                    <span className="text-[8px] uppercase tracking-widest opacity-50 font-bold">Done</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-4 w-full">
                                {assignmentStats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: stat.color }} />
                                        <span className="text-[10px] font-bold tracking-wide uppercase">{stat.name}: {stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center opacity-40 text-xs font-bold w-full">No active assignments.</div>
                    )}
                </motion.div>
            </div>

            {/* ── Actionable Content Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pending Actions / Assignments */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-warning" />
                            <h3 className="font-bold text-sm">Action Items</h3>
                        </div>
                        <button onClick={() => navigate('/assignments')} className="text-xs font-semibold flex items-center gap-1 text-primary hover:opacity-70 transition-opacity">
                            View workflow <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {assignments.filter(a => a.submissionStatus !== 'submitted').slice(0, 4).length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center opacity-50">
                                <CheckCircle2 size={24} className="mb-2 text-success" />
                                <p className="text-sm font-bold">All caught up!</p>
                                <p className="text-xs">You have no pending action items.</p>
                            </div>
                        ) : assignments.filter(a => a.submissionStatus !== 'submitted').slice(0, 4).map((a, i) => (
                            <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl border border-warning/20 bg-warning/5 transition-all hover:border-warning/40 cursor-pointer"
                                onClick={() => navigate('/assignments')}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-warning/10 text-warning shadow-sm">
                                    <BookOpen size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-sm truncate">{a.title}</p>
                                    <p className="text-xs opacity-60 flex items-center gap-1.5 mt-0.5">
                                        <Clock size={10} /> Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <span className="pill-badge badge-warning text-[9px] uppercase tracking-widest">Pending</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Communications / Notices */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-primary" />
                            <h3 className="font-bold text-sm">Latest Broadcasts</h3>
                        </div>
                        <button onClick={() => navigate('/notices')} className="text-xs font-semibold flex items-center gap-1 text-primary hover:opacity-70 transition-opacity">
                            Board directory <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {notices.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center opacity-50">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3 border border-slate-200 dark:border-slate-800">📭</div>
                                <p className="text-sm font-bold">No recent broadcasts.</p>
                            </div>
                        ) : notices.map((n, i) => (
                            <div key={i} className="flex items-start gap-4 p-3.5 rounded-xl transition-all cursor-pointer group"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                                onClick={() => navigate(`/notices/${n.id}`)}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Bell size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{n.title}</p>
                                    <p className="text-xs opacity-60 mt-0.5 truncate">
                                        {n.date ? new Date(n.date).toLocaleDateString() : 'Recently posted'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentDashboard;

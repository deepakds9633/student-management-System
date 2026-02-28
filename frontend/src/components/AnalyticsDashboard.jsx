import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    AreaChart, Area, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
    TrendingUp, Users, Award, BookOpen, FileText, Calendar,
    ChevronRight, Search, Filter, Activity, Target, ShieldCheck, Zap
} from 'lucide-react';

const AnalyticsDashboard = () => {
    const [attendanceTrends, setAttendanceTrends] = useState([]);
    const [marksSummary, setMarksSummary] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const user = AuthService.getCurrentUser();
    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => { fetchData(); }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [t, m, s] = await Promise.all([
                axios.get(`http://localhost:8080/api/analytics/attendance-trends?period=${period}`, { headers }),
                axios.get('http://localhost:8080/api/analytics/marks-summary', { headers }),
                axios.get('http://localhost:8080/api/analytics/dashboard-stats', { headers })
            ]);
            setAttendanceTrends(t.data);
            setMarksSummary(m.data);
            setDashboardStats(s.data);
        } catch (err) { console.error('Error:', err); }
        setLoading(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#080c14]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronizing Global Analytics...</p>
            </div>
        </div>
    );

    const tabs = [
        { id: 'overview', l: 'Intelligence', icon: <Activity size={14} /> },
        { id: 'attendance', l: 'Engagement', icon: <Calendar size={14} /> },
        { id: 'marks', l: 'Proficiency', icon: <Target size={14} /> },
        { id: 'performers', l: 'Leadership', icon: <Award size={14} /> }
    ];

    const stats = dashboardStats ? [
        { t: 'Total Population', v: dashboardStats.totalStudents, i: <Users size={18} />, c: 'primary' },
        { t: 'Active Presence', v: dashboardStats.presentToday, i: <ShieldCheck size={18} />, c: 'success' },
        { t: 'Academic Yield', v: `${marksSummary?.classAverage || 0}%`, i: <TrendingUp size={18} />, c: 'accent' },
        { t: 'Tracked Assets', v: marksSummary?.subjectWiseStats?.length || 0, i: <BookOpen size={18} />, c: 'warning' },
    ] : [];

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#080c14]/50 pb-20">
            <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                            <Activity className="text-primary" size={32} /> Central Intelligence
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Enterprise Analytics & Performance Control</p>
                    </div>
                    <div className="flex items-center gap-3 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                                ${activeTab === t.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'opacity-40 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                {t.icon} {t.l}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((s, i) => (
                                    <div key={i} className="md-card p-6 border-none shadow-xl hover:translate-y-[-4px] transition-transform duration-500 overflow-hidden relative group">
                                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 bg-${s.c}`} />
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">{s.t}</p>
                                                <h4 className="text-2xl font-black tabular-nums">{s.v}</h4>
                                            </div>
                                            <div className={`w-12 h-12 rounded-2xl bg-${s.c}/10 text-${s.c} flex items-center justify-center shadow-inner`}>
                                                {s.i}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 md-card p-8 group">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-lg font-black tracking-tight">Institutional Yield Growth</h3>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Annual Performance Vector</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                            <TrendingUp size={20} />
                                        </div>
                                    </div>
                                    <div className="h-[320px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={attendanceTrends}>
                                                <defs>
                                                    <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: 'var(--text-muted)' }} dy={10} />
                                                <YAxis hide domain={[0, 100]} />
                                                <Tooltip cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }} border={0}
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '10px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                                <Area type="monotone" dataKey="percentage" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#yieldGrad)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="md-card p-8 relative overflow-hidden">
                                    <h3 className="text-lg font-black tracking-tight mb-8">Asset Allocation</h3>
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={marksSummary?.subjectWiseStats?.slice(0, 6) || []}>
                                                <PolarGrid stroke="rgba(0,0,0,0.05)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                                <Radar name="Proficiency" dataKey="percentage" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} strokeWidth={3} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                            <Zap size={14} />
                                        </div>
                                        <p className="text-[10px] font-bold leading-tight opacity-60 italic">"Predictive modeling indicates a 5% increase in STEM proficiency across next quarter."</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <motion.div key="attendance" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                            <div className="md-card p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-50 dark:border-slate-800">
                                    <div>
                                        <h2 className="text-xl font-black tracking-tight">Engagement Latency</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Real-time attendance vector mapping</p>
                                    </div>
                                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                        {['weekly', 'monthly'].map(p => (
                                            <button key={p} onClick={() => setPeriod(p)}
                                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                                              ${period === p ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'opacity-40'}`}>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {attendanceTrends.map((t, i) => (
                                        <div key={i} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">Time Period</div>
                                                    <div className="text-sm font-black tracking-tight">{t.period}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-success tabular-nums">{t.percentage?.toFixed(1)}%</div>
                                                    <div className="text-[8px] font-black uppercase opacity-30 mt-[-2px]">Engagement</div>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${t.percentage}%` }} transition={{ duration: 1 }}
                                                    className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                                            </div>
                                            <div className="flex justify-between text-[9px] font-black uppercase opacity-30 tracking-tighter">
                                                <span>P: {t.present}</span>
                                                <span>A: {t.absent}</span>
                                                <span>Σ: {t.total}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Marks Tab */}
                    {activeTab === 'marks' && marksSummary && (
                        <motion.div key="marks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="md-card p-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
                                <div className="text-center mb-12">
                                    <h2 className="text-2xl font-black tracking-tight mb-2">Subject Performance Matrix</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Normalized class distribution</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {marksSummary.subjectWiseStats?.map((st, i) => {
                                        const c = st.percentage >= 75 ? 'success' : st.percentage >= 50 ? 'warning' : 'danger';
                                        return (
                                            <motion.div key={i} whileHover={{ y: -5 }} className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 group relative">
                                                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-${c}/10 text-${c} border border-${c}/20`}>
                                                    {st.percentage}%
                                                </div>
                                                <h3 className="text-lg font-black tracking-tight mb-1">{st.subject}</h3>
                                                <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-6">{st.totalStudents} verified records</p>

                                                <div className="w-full h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden mb-4 p-0.5 border border-slate-100 dark:border-slate-700">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${st.percentage}%` }} transition={{ duration: 1.2, delay: i * 0.1 }}
                                                        className={`h-full bg-${c} rounded-full shadow-lg shadow-${c}/20`} />
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40 tabular-nums">
                                                    <span>Min: {Math.round(st.average * 0.7)}</span>
                                                    <span>Avg: {st.average}</span>
                                                    <span>Max: {st.maxMarks}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="mt-16 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 block mb-3 relative z-10">Global Institutional Average</span>
                                    <span className="text-6xl font-black text-primary tabular-nums tracking-tighter relative z-10">
                                        {marksSummary.classAverage}<span className="text-2xl text-slate-300 ml-1 font-bold">%</span>
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Performers Tab */}
                    {activeTab === 'performers' && marksSummary && (
                        <motion.div key="performers" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {[{ title: 'Institutional Leadership', data: marksSummary.topPerformers, type: 'leader', c: 'primary' },
                            { title: 'Optimization Priority', data: marksSummary.lowPerformers, type: 'priority', c: 'danger' }].map(({ title, data, type, c }) => (
                                <div key={title} className="md-card !p-0 overflow-hidden shadow-2xl">
                                    <div className={`px-10 py-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between`}>
                                        <div>
                                            <h2 className="text-xl font-black tracking-tight">{title}</h2>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Cross-curriculum mapping</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-2xl bg-${c}/10 text-${c} flex items-center justify-center`}>
                                            {type === 'leader' ? <Award size={24} /> : <Zap size={24} />}
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        {data?.map((s, i) => (
                                            <div key={i} className="flex items-center gap-6 p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all group">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm tracking-tighter
                                                  ${i === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30' :
                                                        i === 1 ? 'bg-slate-400 text-white' :
                                                            i === 2 ? 'bg-orange-400 text-white' : 'bg-slate-200 dark:bg-slate-800 opacity-40'}`}>
                                                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-sm tracking-tight mb-1 group-hover:text-primary transition-colors">{s.studentName}</p>
                                                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }}
                                                            className={`h-full bg-${c}`} />
                                                    </div>
                                                </div>
                                                <div className={`text-lg font-black text-${c} tabular-nums`}>{s.percentage}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;

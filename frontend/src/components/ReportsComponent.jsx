import React, { useState, useEffect } from 'react';
import AnalyticsService from '../services/AnalyticsService';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Download, TrendingUp, Users, Award, BookOpen, FileText, ChevronRight, Search, Filter } from 'lucide-react';

const ReportsComponent = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [marksData, setMarksData] = useState([]);
    const [topStudents, setTopStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const marksRes = await AnalyticsService.getMarksSummary();
                const marksStats = marksRes.data.subjectWiseStats || [];
                setMarksData(marksStats.map(item => ({ subject: item.subject, avg: Math.round(item.percentage) })));
                setTopStudents(marksRes.data.topPerformers || []);

                const attendanceRes = await AnalyticsService.getAttendanceTrends('monthly');
                const attendanceStats = attendanceRes.data || [];
                setAttendanceData(attendanceStats.map(item => {
                    const dateObj = new Date(item.period);
                    return {
                        month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
                        percentage: Math.round(item.percentage)
                    };
                }));
            } catch (error) {
                console.error("Error fetching report data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredStudents = topStudents.filter(s =>
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Compiling Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="flex items-center gap-3 tracking-tighter">
                        <TrendingUp size={28} className="text-primary" /> Reports & Insights
                    </h1>
                    <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Institutional Performance Intelligence</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                        <Filter size={14} /> Global Filters
                    </button>
                    <button className="flex-1 sm:flex-none btn-primary !px-8 !py-2.5 !rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <Download size={14} /> Export Dataset
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md-card p-6 bg-primary/5 border border-primary/10 relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Users size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Users size={16} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Avg. Attendance</span>
                        </div>
                        <div className="text-4xl font-black tabular-nums">92.4<span className="text-sm opacity-30">%</span></div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-success">
                            <TrendingUp size={12} /> +2.1% from last month
                        </div>
                    </div>
                </div>

                <div className="md-card p-6 border-b-4 border-accent relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Award size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><Award size={16} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Mean Proficiency</span>
                        </div>
                        <div className="text-4xl font-black tabular-nums">B+<span className="text-sm opacity-30 px-2 font-bold">(8Active)</span></div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary">
                            <BookOpen size={12} /> Across 12 academic modules
                        </div>
                    </div>
                </div>

                <div className="md-card p-6 bg-danger/5 border border-danger/10 relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <FileText size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-danger/10 text-danger flex items-center justify-center"><FileText size={16} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Completion Rate</span>
                        </div>
                        <div className="text-4xl font-black tabular-nums">88.5<span className="text-sm opacity-30">%</span></div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-danger/60">
                            <AlertCircle size={12} /> 12 pending submissions
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="md-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-black text-lg tracking-tight">Attendance Dynamics</h3>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Monthly engagement variance</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black text-primary">94.2%</div>
                            <div className="text-[9px] font-black uppercase opacity-30">Weighted Average</div>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData}>
                                <defs>
                                    <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 700 }} dy={10} />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }} border={0}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '10px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="percentage" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#attGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="md-card p-8 group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-black text-lg tracking-tight">Competency Heatmap</h3>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Subject-wise success metrics</p>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <BarChart2 size={18} className="text-accent" />
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={marksData}>
                                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 700 }} dy={10} />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '10px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                <Bar dataKey="avg" radius={[8, 8, 8, 8]} barSize={24}>
                                    {marksData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Top Students Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="md-card overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="font-black text-lg tracking-tight">Scholastic Leadership</h3>
                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-1">Top percentile performance directory</p>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" size={16} />
                        <input type="text" placeholder="Search by name or course..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="pill-input-dark !rounded-2xl !pl-12 !py-2.5 bg-slate-50 dark:bg-slate-900 border-none transition-all focus:ring-2 ring-primary/20" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="!w-20">Rank</th>
                                <th>Student Information</th>
                                <th>Institutional Course</th>
                                <th className="text-right">Academic Index</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((s, index) => {
                                const rank = index + 1;
                                return (
                                    <tr key={index} className="group cursor-pointer">
                                        <td className="font-black opacity-40 tabular-nums">#{rank.toString().padStart(2, '0')}</td>
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xl"
                                                    style={{ background: rank === 1 ? 'var(--gradient-primary)' : rank === 2 ? 'var(--gradient-accent)' : 'var(--bg-strong)' }}>
                                                    {s.studentName?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black tracking-tight">{s.studentName}</div>
                                                    <div className="text-[9px] font-black uppercase opacity-40">Verified Identity</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest opacity-60">
                                                {s.course || 'Independent Study'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-base font-black text-primary tabular-nums">{s.percentage}%</span>
                                                <div className="w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${s.percentage}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center justify-center gap-2 mx-auto transition-all">
                        View Full Scholastic Registry <ChevronRight size={14} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ReportsComponent;

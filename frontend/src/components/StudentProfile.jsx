import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent } from '../services/StudentService';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, BookOpen, Calendar, ArrowLeft,
    Award, CheckCircle2, TrendingUp, Clock,
    Phone, MapPin, Hash, Download, Edit3, Shield, Star
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock data for charts
    const attendanceData = [
        { month: 'Jan', percentage: 95 },
        { month: 'Feb', percentage: 92 },
        { month: 'Mar', percentage: 98 },
        { month: 'Apr', percentage: 89 },
        { month: 'May', percentage: 94 },
        { month: 'Jun', percentage: 96 },
    ];

    const [marks, setMarks] = useState([]);

    const currentUser = AuthService.getCurrentUser();
    const headers = { Authorization: `Bearer ${currentUser?.token}` };

    useEffect(() => {
        if (id) {
            setLoading(true);
            Promise.all([
                getStudent(id),
                axios.get(`http://localhost:8080/api/marks/student/${id}`, { headers }).catch(() => ({ data: [] }))
            ])
                .then(([studentRes, marksRes]) => {
                    setStudent(studentRes.data);

                    // Aggregate marks by subject, taking the average if multiple exist
                    const rawMarks = marksRes.data;
                    const subjectMap = {};
                    rawMarks.forEach(m => {
                        if (!subjectMap[m.subject]) {
                            subjectMap[m.subject] = { total: 0, count: 0 };
                        }
                        subjectMap[m.subject].total += m.marksObtained;
                        subjectMap[m.subject].count += 1;
                    });

                    const dynamicGradeData = Object.keys(subjectMap).map(subject => ({
                        subject: subject,
                        score: Math.round(subjectMap[subject].total / subjectMap[subject].count)
                    }));
                    setMarks(dynamicGradeData);
                })
                .catch(e => console.error(e))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-40">Synchronizing Profile...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 rounded-3xl bg-danger/10 text-danger flex items-center justify-center mb-4 border border-danger/20">
                    <Hash size={32} />
                </div>
                <h2 className="text-xl font-bold">Identity Not Found</h2>
                <p className="text-xs opacity-50 mt-1 max-w-sm">The student record associated with ID #{id} could not be retrieved from the central registry.</p>
                <button onClick={() => navigate('/students')} className="btn-primary mt-8 py-2 px-8">
                    Return to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button onClick={() => navigate('/students')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Student Registry
                </button>
                <div className="flex gap-2">
                    <button onClick={() => navigate(`/edit-student/${id}`)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        <Edit3 size={14} /> Edit Identity
                    </button>
                    <button className="btn-primary !px-6 !py-2 text-xs flex items-center gap-2">
                        <Download size={14} /> Academic Transcript
                    </button>
                </div>
            </div>

            {/* Profile Hero Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="md-card overflow-hidden !p-0 border-none shadow-2xl relative">
                <div className="h-40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-blue-500 animate-gradient-shift blur-3xl opacity-20 scale-150" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                </div>

                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
                        <div className="p-1.5 rounded-[2.5rem] shadow-2xl border relative group"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                            <div className="w-32 h-32 rounded-[2rem] flex items-center justify-center text-5xl font-black text-white shadow-inner overflow-hidden relative"
                                style={{ background: 'var(--gradient-primary)' }}>
                                {student.name?.[0]?.toUpperCase()}
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full border-4 flex items-center justify-center"
                                style={{ borderColor: 'var(--bg-surface)' }}>
                                <Shield size={14} className="text-white" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black tracking-tight">{student.name}</h1>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-success-dim text-success border border-success/20 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Verified Student
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 opacity-50">
                                <span className="flex items-center gap-1.5 text-xs font-bold"><Mail size={14} /> {student.email}</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold"><BookOpen size={14} /> {student.course}</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold"><Hash size={14} /> UID-{student.id}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-3xl backdrop-blur-md border"
                            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                            <div className="text-center px-4">
                                <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Attendance</div>
                                <div className="text-2xl font-black tabular-nums">94.5<span className="text-sm opacity-30">%</span></div>
                            </div>
                            <div className="w-px h-8" style={{ background: 'var(--border)' }} />
                            <div className="text-center px-4">
                                <div className="text-[9px] font-black text-warning uppercase tracking-widest mb-1 font-bold">GPA Index</div>
                                <div className="text-2xl font-black tabular-nums">3.88</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Information Sidebar */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="md-card p-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">Contact & Logistics</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-3 rounded-2xl border"
                                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                                <div className="p-2.5 rounded-xl shadow-sm border text-primary"
                                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}><Phone size={18} /></div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">Emergency Contact</div>
                                    <div className="text-sm font-bold">+1 (555) 000-0000</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 rounded-2xl border"
                                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                                <div className="p-2.5 rounded-xl shadow-sm border text-accent"
                                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}><MapPin size={18} /></div>
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">Primary Residence</div>
                                    <div className="text-sm font-bold leading-snug">123 Academic St, Newton Campus, NY 10001</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="md-card p-8 border border-primary/20 relative overflow-hidden group"
                        style={{ background: 'var(--bg-elevated)' }}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500"><Award size={80} /></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Star size={18} className="text-warning fill-warning" />
                                <h3 className="font-bold text-sm tracking-tight">Merit Achievement</h3>
                            </div>
                            <h3 className="font-black text-2xl tracking-tight mb-2">Dean's List '26</h3>
                            <p className="text-xs opacity-60 leading-relaxed mb-8">Maintaining excellence with a cumulative GPA above 3.5 across institutional modules.</p>
                            <button className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all"
                                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                                View Scholastic Awards
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Main Analytics Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="md-card p-6 border-b-4 border-primary/30">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Attendance Flow</h3>
                                <TrendingUp size={14} className="text-success" />
                            </div>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={attendanceData}>
                                        <defs>
                                            <linearGradient id="colorPerc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 600 }} dy={10} />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }} border={0}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '10px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                        <Area type="monotone" dataKey="percentage" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPerc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                            className="md-card p-6 border-b-4 border-accent/30">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Core Competencies</h3>
                                <Award size={14} className="text-accent" />
                            </div>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {marks.length > 0 ? (
                                        <BarChart data={marks} layout="vertical">
                                            <XAxis type="number" hide domain={[0, 100]} />
                                            <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 700 }} width={70} />
                                            <Tooltip cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '10px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                            <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={24}>
                                                {marks.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.score > 85 ? 'var(--success)' : entry.score > 70 ? 'var(--accent)' : 'var(--warning)'} opacity={0.8} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-xs text-center opacity-50 font-medium">No active term marks available</p>
                                        </div>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Timeline */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="md-card p-0 overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between"
                            style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Academic Timeline</h3>
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10 uppercase tracking-widest">Fall Term '26</span>
                        </div>
                        <div className="p-8 space-y-10 relative">
                            <div className="absolute top-10 bottom-10 left-[39px] w-px"
                                style={{ background: 'var(--border)' }} />
                            {[
                                { title: 'Scholastic Excellence', status: 'Graded', date: 'Oct 15, 2026', desc: 'Maintained 89.4% average across institutional modules in mid-term evaluations.', icon: <Award size={14} />, color: 'var(--success)' },
                                { title: 'Advanced Project Submission', status: 'Verification', date: 'Nov 02, 2026', desc: 'LMS-302 Backend Systems development final submission received.', icon: <Clock size={14} />, color: 'var(--warning)' },
                                { title: 'Logistics Update', status: 'Archived', date: 'Sep 28, 2026', desc: 'Administrative approval granted for medical absence during session week 3.', icon: <CheckCircle2 size={14} />, color: 'var(--primary)' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-8 items-start relative group">
                                    <div className="w-6 h-6 rounded-full border-2 relative z-10 mt-1 flex-shrink-0 flex items-center justify-center transition-all group-hover:border-primary group-hover:scale-110"
                                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <h4 className="font-black text-sm tracking-tight">{item.title}</h4>
                                            <span className="text-[10px] font-bold opacity-30">{item.date}</span>
                                        </div>
                                        <p className="text-xs opacity-50 leading-relaxed mb-4">{item.desc}</p>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest"
                                            style={{ color: item.color, borderColor: `${item.color}33`, background: `${item.color}08` }}>
                                            {item.icon} {item.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;

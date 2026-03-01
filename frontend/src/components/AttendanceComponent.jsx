import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { listStudents } from '../services/StudentService';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Users, Calendar, Filter, ChevronDown, Check, Info, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:8080/api';

const AttendanceComponent = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [isStudent] = useState(user?.roles?.includes('ROLE_STUDENT') || false);

    // Staff State
    const [students, setStudents] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [courseFilter, setCourseFilter] = useState('ALL');

    // Student State
    const [myAttendance, setMyAttendance] = useState([]);

    // Shared State
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => {
        const fetchAttendanceData = () => {
            if (isStudent) {
                axios.get(`${API}/attendance/student/me`, { headers })
                    .then(res => setMyAttendance(res.data))
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            } else {
                listStudents().then((response) => setStudents(response.data))
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            }
        };

        setLoading(true);
        fetchAttendanceData();

        // Live data synchronization (Polling every 15 seconds)
        const interval = setInterval(fetchAttendanceData, 15000);
        return () => clearInterval(interval);
    }, [isStudent]);

    // --- Staff Actions ---
    const markAttendance = (studentId, status) => {
        axios.post(`${API}/attendance`, {
            student: { id: studentId },
            date: attendanceDate,
            status: status
        }, { headers })
            .then(() => {
                setMessage(`Marked ${status} for student ID: ${studentId}`);
                setTimeout(() => setMessage(''), 3000);
            })
            .catch(error => {
                console.error(error);
                setMessage('Error marking attendance');
            });
    };

    const markBulkAttendance = (status) => {
        if (selectedIds.size === 0) return;
        const payload = Array.from(selectedIds).map(id => ({
            student: { id },
            date: attendanceDate,
            status: status
        }));

        axios.post(`${API}/attendance/bulk`, payload, { headers })
            .then(() => {
                setMessage(`Successfully marked ${status} for ${selectedIds.size} students`);
                setSelectedIds(new Set());
                setTimeout(() => setMessage(''), 3000);
            })
            .catch(error => {
                console.error(error);
                setMessage('Error processing bulk attendance');
            });
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const courses = [...new Set(students.map(s => s.course))].filter(Boolean);
    const filteredStudents = students.filter(s => courseFilter === 'ALL' || s.course === courseFilter);

    const toggleAll = () => {
        if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredStudents.map(s => s.id)));
        }
    };

    // --- Student Analytics Processing ---
    const processStudentAnalytics = () => {
        if (!myAttendance.length) return { present: 0, total: 0, percentage: 0, trend: [] };
        const total = myAttendance.length;
        const present = myAttendance.filter(a => a.status === 'Present').length;
        const percentage = Math.round((present / total) * 100);

        const monthly = {};
        const sorted = [...myAttendance].sort((a, b) => new Date(a.date) - new Date(b.date));
        sorted.forEach(r => {
            const m = new Date(r.date).toLocaleString('default', { month: 'short' });
            if (!monthly[m]) monthly[m] = { total: 0, present: 0 };
            monthly[m].total++;
            if (r.status === 'Present') monthly[m].present++;
        });
        const trend = Object.keys(monthly).map(m => ({
            month: m,
            percentage: Math.round((monthly[m].present / monthly[m].total) * 100)
        }));

        return { present, total, percentage, trend };
    };

    const studentStats = isStudent ? processStudentAnalytics() : null;

    // --- Renderers ---
    const renderMessage = () => (
        <AnimatePresence>
            {message && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className={`toast flex items-center gap-3 ${message.includes('Error') ? 'toast-error' : 'toast-success'}`}>
                    <Info size={16} />
                    <span className="font-bold">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (isStudent) {
        const sortedHistory = [...myAttendance].sort((a, b) => new Date(b.date) - new Date(a.date));

        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="page-header">
                    <h1 className="flex items-center gap-2">
                        <Calendar size={28} style={{ color: 'var(--primary)' }} /> My Attendance
                    </h1>
                    <p className="mt-1 text-sm opacity-80 max-w-3xl">
                        A real-time, dynamic academic tracking system. This platform integrates live data synchronization, analytics, and performance alerts to provide an enterprise-grade solution for accurate and transparent attendance monitoring.
                    </p>
                </div>

                {loading && myAttendance.length === 0 ? (
                    <div className="p-12 text-center opacity-50 font-bold">Loading attendance records...</div>
                ) : myAttendance.length === 0 ? (
                    <div className="md-card p-12 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-base mx-auto mb-4 flex items-center justify-center text-4xl grayscale opacity-50 border">📭</div>
                        <h3 className="font-bold mb-1">No Records Found</h3>
                        <p className="text-xs opacity-60">You do not have any registered attendance logs yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Status Alert Banner */}
                        {studentStats.percentage < 75 && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-start gap-3 w-full">
                                <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm">Action Required: Low Attendance Threshold</h4>
                                    <p className="text-xs opacity-80 mt-1 leading-relaxed">
                                        Your cumulative attendance has fallen to <strong>{studentStats.percentage}%</strong>, putting you below the mandated 75% institutional requirement. Please ensure immediate consistency or contact administration to avoid academic penalties.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                        {studentStats.percentage >= 90 && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-start gap-3 w-full">
                                <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-sm">Excellent Standing</h4>
                                    <p className="text-xs opacity-80 mt-1">Your attendance is outstanding at <strong>{studentStats.percentage}%</strong>. Keep up the phenomenal dedication.</p>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Analytics Panel */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="md-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
                                    style={{ minHeight: '220px', background: 'var(--gradient-card)' }}>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 absolute top-6 left-6">Aggregate Rate</h3>

                                    <div className="relative flex items-center justify-center w-32 h-32 mt-4">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                                            <circle cx="64" cy="64" r="56" stroke={studentStats.percentage >= 75 ? "var(--success)" : "var(--danger)"} strokeWidth="8" fill="transparent"
                                                strokeDasharray={`${(studentStats.percentage / 100) * 351} 351`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-3xl font-black">{studentStats.percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6 w-full justify-center">
                                        <div className="text-center px-4">
                                            <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Present</p>
                                            <p className="text-lg font-black text-success">{studentStats.present}</p>
                                        </div>
                                        <div className="w-px bg-slate-200 dark:bg-slate-800" />
                                        <div className="text-center px-4">
                                            <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Absent</p>
                                            <p className="text-lg font-black text-danger">{studentStats.total - studentStats.present}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="md-card p-6 h-[220px] flex flex-col border-t-4 border-primary/50">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">Monthly Trend Matrix</h3>
                                    <div className="flex-1 w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={studentStats.trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} dy={10} />
                                                <YAxis hide domain={[0, 100]} />
                                                <RechartsTooltip cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }} border={0}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: '11px', background: 'var(--bg-elevated)', fontWeight: 'bold' }} />
                                                <Area type="monotone" dataKey="percentage" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#trendColor)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Day-wise History */}
                            <div className="lg:col-span-2 md-card overflow-hidden flex flex-col max-h-[464px]">
                                <div className="p-5 border-b border-border flex items-center justify-between bg-surface bg-opacity-50">
                                    <div>
                                        <h3 className="font-bold text-sm mb-1">Day-wise History Log</h3>
                                        <p className="text-[10px] opacity-50 uppercase tracking-widest font-black text-muted">Chronological Record</p>
                                    </div>
                                    <div className="flex bg-elevated rounded-lg p-1 border border-border">
                                        <span className="px-3 py-1 text-[10px] font-bold uppercase rounded flex items-center gap-1.5"><CheckCircle2 size={10} className="text-success" /> Present</span>
                                        <span className="px-3 py-1 text-[10px] font-bold uppercase rounded flex items-center gap-1.5"><XCircle size={10} className="text-danger" /> Absent</span>
                                    </div>
                                </div>
                                <div className="overflow-y-auto w-full flex-1 p-2" style={{ maxHeight: '400px' }}>
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-base z-10 shadow-sm">
                                            <tr>
                                                <th className="p-3 text-[10px] font-black uppercase tracking-widest opacity-50">Date</th>
                                                <th className="p-3 text-[10px] font-black uppercase tracking-widest opacity-50">Status</th>
                                                <th className="p-3 text-[10px] font-black uppercase tracking-widest opacity-50">Record ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedHistory.map(row => (
                                                <tr key={row.id} className="border-b border-border hover:bg-elevated/50 transition-colors">
                                                    <td className="p-3">
                                                        <div className="font-semibold text-sm">{new Date(row.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        {row.status === 'Present' ? (
                                                            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-success/10 text-success border border-success/20">
                                                                <CheckCircle2 size={12} /> Present
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-danger/10 text-danger border border-danger/20">
                                                                <XCircle size={12} /> Absent
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-xs opacity-40 font-mono">
                                                        #{row.id.toString().padStart(5, '0')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // --- Administrator / Staff View (Bulk Grid Entry) ---
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="flex items-center gap-2">
                        <Users size={28} style={{ color: 'var(--primary)' }} /> Class Attendance Control
                    </h1>
                    <p className="mt-1 text-sm opacity-80 max-w-3xl">
                        A real-time, dynamic academic tracking system where faculty and administrators can record attendance. Instantly synchronizes with the student dashboard ensuring automated, transparent, and enterprise-grade monitoring.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Entry Date</label>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="pill-input-dark !py-1.5 !px-3 text-xs border border-primary/20 shadow-sm"
                            style={{ width: '150px' }}
                        />
                    </div>
                </div>
            </div>

            {renderMessage()}

            <div className="md-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between relative overflow-visible z-20 shadow-md">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-mc-text-muted" size={14} />
                        <select
                            value={courseFilter}
                            onChange={(e) => {
                                setCourseFilter(e.target.value);
                                setSelectedIds(new Set());
                            }}
                            className="pill-input-dark !pl-9 !py-2 text-sm appearance-none bg-surface border border-border shadow-sm hover:border-primary/50 transition-colors w-full"
                        >
                            <option value="ALL">All Courses & Tracks</option>
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={14} />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                            Roster Size
                        </p>
                        <p className="text-sm font-bold tracking-tight text-primary">
                            {filteredStudents.length} Students
                        </p>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedIds.size > 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-2 w-full sm:w-auto p-1.5 rounded-xl border border-primary/20 bg-primary/5">
                            <span className="text-[10px] font-black uppercase px-2 text-primary">{selectedIds.size} Selected</span>
                            <div className="h-4 w-[1px] bg-primary/20 mx-1" />
                            <button
                                onClick={() => markBulkAttendance('Present')}
                                className="btn-primary !py-1.5 !px-4 text-[10px] !rounded-lg flex items-center gap-1.5 shadow-md shadow-primary/20"
                            >
                                <CheckCircle2 size={12} /> Mark Present
                            </button>
                            <button
                                onClick={() => markBulkAttendance('Absent')}
                                className="btn-secondary !py-1.5 !px-4 text-[10px] !rounded-lg !border-danger/30 !text-danger hover:!bg-danger/10 hover:!text-danger flex items-center gap-1.5 shadow-md shadow-danger/10"
                            >
                                <XCircle size={12} /> Mark Absent
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="md-card overflow-hidden shadow-lg border border-border/50">
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto relative">
                    <table className="data-table w-full">
                        <thead className="sticky top-0 bg-base z-10">
                            <tr>
                                <th className="!w-12 !pr-0 text-center py-4 bg-surface border-b border-border shadow-sm">
                                    <div
                                        onClick={toggleAll}
                                        className="w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center transition-all mx-auto shadow-inner"
                                        style={{
                                            borderColor: selectedIds.size > 0 ? 'var(--primary)' : 'var(--border-strong)',
                                            background: filteredStudents.length > 0 && selectedIds.size === filteredStudents.length ? 'var(--primary)' : 'transparent'
                                        }}
                                    >
                                        {filteredStudents.length > 0 && selectedIds.size === filteredStudents.length && <Check size={12} className="text-white" />}
                                        {selectedIds.size > 0 && selectedIds.size < filteredStudents.length && <div className="w-2.5 h-0.5 bg-primary rounded-full" />}
                                    </div>
                                </th>
                                <th className="bg-surface py-4 border-b border-border shadow-sm font-black text-[11px] uppercase tracking-widest text-muted">Identity / Register</th>
                                <th className="bg-surface py-4 border-b border-border shadow-sm font-black text-[11px] uppercase tracking-widest text-muted">Academic Track</th>
                                <th className="text-right bg-surface py-4 border-b border-border shadow-sm font-black text-[11px] uppercase tracking-widest text-muted">Immediate Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(7).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={4} className="p-4">
                                            <div className="skeleton-loading h-12 w-full rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id}
                                        className={`transition-colors duration-150 border-b border-border/40 hover:bg-elevated/60 ${selectedIds.has(student.id) ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
                                        onClick={() => toggleSelection(student.id)}
                                    >
                                        <td className="!pr-0 py-4" onClick={e => e.stopPropagation()}>
                                            <div
                                                onClick={() => toggleSelection(student.id)}
                                                className="w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center transition-all mx-auto shadow-sm"
                                                style={{
                                                    borderColor: selectedIds.has(student.id) ? 'var(--primary)' : 'var(--border)',
                                                    background: selectedIds.has(student.id) ? 'var(--primary)' : 'var(--bg-base)'
                                                }}
                                            >
                                                {selectedIds.has(student.id) && <Check size={12} className="text-white" />}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md border border-white/10"
                                                    style={{ background: 'var(--gradient-primary)' }}>
                                                    {student.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm tracking-tight">{student.name}</span>
                                                    <span className="text-[10px] font-mono opacity-60 mt-0.5">{student.email?.split('@')[0] || student.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-secondary-dim text-secondary border border-secondary/10 shadow-sm"
                                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                                                {student.course}
                                            </span>
                                        </td>
                                        <td className="text-right py-4" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2 pr-2">
                                                <button
                                                    onClick={() => markAttendance(student.id, 'Present')}
                                                    className="p-1 px-3 w-20 flex justify-center rounded-lg text-[10px] font-black uppercase tracking-widest border border-success/30 text-success hover:bg-success hover:text-white shadow-sm transition-all"
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => markAttendance(student.id, 'Absent')}
                                                    className="p-1 px-3 w-20 flex justify-center rounded-lg text-[10px] font-black uppercase tracking-widest border border-danger/30 text-danger hover:bg-danger hover:text-white shadow-sm transition-all"
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-24 text-center">
                                        <div className="w-20 h-20 rounded-full bg-base mx-auto mb-5 flex items-center justify-center text-4xl grayscale opacity-30 shadow-inner border border-border">
                                            👥
                                        </div>
                                        <h3 className="font-bold opacity-60 text-lg tracking-tight mb-2">No Students Enrolled</h3>
                                        <p className="text-xs font-semibold opacity-40 uppercase tracking-widest">Adjust filters or register new profiles.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceComponent;

import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, CheckCircle2, XCircle, AlertCircle,
    Send, Plus, X, ChevronRight, User, MessageSquare,
    Filter, Search, Info, ShieldCheck
} from 'lucide-react';

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });

    const user = AuthService.getCurrentUser();
    const headers = { Authorization: `Bearer ${user?.token}` };
    const isStaff = user?.roles?.includes('ROLE_STAFF');

    useEffect(() => { fetchLeaves(); }, []);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            // For students, the ID in the URL is now ignored by the backend in favor of security context,
            // but we keep it for staff administrative views.
            const url = isStaff ? 'http://localhost:8080/api/leaves' : `http://localhost:8080/api/leaves/student/me`;
            const res = await axios.get(url, { headers });
            setLeaves(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            // Backend now resolves student identity from JWT for students. 
            // We only send the student object if we ever need staff to apply for them.
            const payload = isStaff ? { student: { id: user?.id }, ...formData } : formData;
            await axios.post('http://localhost:8080/api/leaves', payload, { headers });
            setShowForm(false);
            setFormData({ startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (err) { console.error('Error applying leave:', err.message); }
    };

    const handleAction = async (id, action) => {
        const remarks = prompt(`Enter remarks for ${action}:`) || '';
        if (remarks === null) return;
        try { await axios.put(`http://localhost:8080/api/leaves/${id}/${action}`, { remarks }, { headers }); fetchLeaves(); }
        catch (err) { console.error('Error:', err.message); }
    };

    const filtered = activeFilter === 'ALL' ? leaves : leaves.filter(l => l.status === activeFilter);

    const sc = {
        PENDING: { bg: 'var(--warning-dim)', c: 'var(--warning)', b: 'rgba(245,158,11,0.2)', icon: <Clock size={14} />, label: 'Pending Review' },
        APPROVED: { bg: 'var(--success-dim)', c: 'var(--success)', b: 'rgba(34,197,94,0.2)', icon: <CheckCircle2 size={14} />, label: 'Authorized' },
        REJECTED: { bg: 'var(--danger-dim)', c: 'var(--danger)', b: 'rgba(239, 68, 68, 0.2)', icon: <XCircle size={14} />, label: 'Declined' }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronizing Rosters...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <Calendar className="text-primary" size={32} /> Attendance Absence
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Institutional Leave Management Protocol</p>
                </div>
                {!isStaff && (
                    <button onClick={() => setShowForm(!showForm)}
                        className={`btn-primary !px-8 !py-3 !rounded-2x flex items-center gap-2 transition-all`}
                        style={showForm ? { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' } : {}}>
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{showForm ? 'Abort Request' : 'New Leave Voucher'}</span>
                    </button>
                )}
            </div>

            <div className="p-5 flex flex-col sm:flex-row gap-4 items-start items-center rounded-2xl" style={{ background: 'var(--primary-dim)', border: '1px solid var(--border)' }}>
                <div className="p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-shrink-0" style={{ background: 'var(--bg-surface)' }}>
                    <ShieldCheck size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>Adaptive Accessibility & Theming</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        The Leave Management and Attendance Absence module has been improved with an adaptive and accessibility-focused UI design to ensure optimal readability across both light and dark themes. Previously, certain UI components such as message blocks and status labels used low-contrast grey color combinations, which affected visibility in light mode. To address this issue, the system has been redesigned with dynamic theme-aware color tokens that automatically adjust text and background contrast based on the active theme.
                    </p>
                    <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
                        The updated interface now follows modern accessibility standards, ensuring that all content, including student leave reasons, admin remarks, and timeline details, remains clearly visible in both light and dark modes. High-contrast typography, semantic color palettes, and adaptive UI components have been implemented to enhance clarity, reduce eye strain, and improve overall user experience. This enhancement aligns the EduVerse platform with global enterprise UI practices used in leading SaaS products.
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {showForm && !isStaff && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="md-card overflow-hidden !p-0 border-none shadow-2xl">
                        <div className="p-8 bg-primary/5 border-b border-primary/10">
                            <h3 className="text-lg font-black tracking-tight">Leave Application Interface</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Submit formal absence documentation</p>
                        </div>
                        <form onSubmit={handleApply} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">TimeFrame Selection</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Commencement</label>
                                            <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                className="pill-input-dark !rounded-xl !py-2.5 transition-all focus:ring-2 ring-primary/20" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Termination</label>
                                            <input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                                className="pill-input-dark !rounded-xl !py-2.5 transition-all focus:ring-2 ring-primary/20" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">Protocol Justification</h4>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Primary Reason</label>
                                        <textarea required rows="1" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            placeholder="Explain your unavoidable absence..." className="pill-input-dark !rounded-xl !py-2.5 transition-all focus:ring-2 ring-primary/20 resize-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                <button type="submit" className="btn-primary !px-10 !py-3 !rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                    <Send size={16} /> Transmit Voucher
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Hub */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2
                        ${activeFilter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border opacity-50 hover:opacity-100 scale-95 hover:scale-100'}`}
                        style={activeFilter !== f ? { background: 'var(--bg-surface)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' } : {}}>
                        {f} <span className="opacity-40 tabular-nums">({f === 'ALL' ? leaves.length : leaves.filter(l => l.status === f).length})</span>
                    </button>
                ))}
            </div>

            {/* Leave Streams */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="md-card py-20 text-center space-y-4 opacity-40">
                        <AlertCircle className="mx-auto" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest">No matching vouchers in current stream</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filtered.map(leave => {
                            const cfg = sc[leave.status] || sc.PENDING;
                            return (
                                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    key={leave.id} className="md-card p-6 border-none shadow-xl hover:translate-x-1 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full group-hover:bg-primary transition-colors duration-300" style={{ background: 'var(--border-strong)' }} />

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                        <div className="flex items-start gap-6 flex-1">
                                            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner shrink-0" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                                <Calendar size={20} />
                                            </div>
                                            <div className="space-y-2">
                                                {isStaff && (
                                                    <div className="flex items-center gap-2 text-primary font-black text-sm tracking-tight capitalize">
                                                        <User size={14} /> {leave.student?.name || `Student_ID: ${leave.student?.id}`}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
                                                    {leave.startDate} <ChevronRight size={10} className="opacity-30" /> {leave.endDate}
                                                    <span className="text-[9px] font-black uppercase opacity-30 ml-2 tracking-widest">Timeline Block</span>
                                                </div>
                                                <div className="flex items-start gap-2 p-3 rounded-xl border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                                                    <MessageSquare size={12} className="opacity-50 mt-1 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                                                    <p className="text-[12px] font-medium italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{leave.reason}"</p>
                                                </div>
                                                {leave.remarks && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 w-fit">
                                                        <ShieldCheck size={12} className="text-primary" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-90">ADMIN: {leave.remarks}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                                            <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2"
                                                style={{ background: cfg.bg, color: cfg.c, borderColor: cfg.b }}>
                                                {cfg.icon} {cfg.label}
                                            </div>

                                            {isStaff && leave.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAction(leave.id, 'approve')}
                                                        className="p-2.5 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white transition-all shadow-lg shadow-success/10">
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleAction(leave.id, 'reject')}
                                                        className="p-2.5 rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white transition-all shadow-lg shadow-danger/10">
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Legend / System Policy */}
            <div className="md-card !bg-transparent border-dashed border-2 p-8 flex flex-col md:flex-row items-center gap-8 opacity-40 hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--border-strong)' }}>
                <div className="p-4 rounded-3xl" style={{ background: 'var(--bg-elevated)' }}><Info size={32} /></div>
                <div className="space-y-1 flex-1 text-center md:text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Extraction Protocol</h4>
                    <p className="text-xs font-medium">Leave vouchers are cross-referenced with your academic enrollment. Unauthorized absences might impact your proficiency scores. Ensure documentation is accurate.</p>
                </div>
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary border-2" style={{ borderColor: 'var(--bg-surface)' }} />
                    <div className="w-8 h-8 rounded-full bg-accent border-2" style={{ borderColor: 'var(--bg-surface)' }} />
                    <div className="w-8 h-8 rounded-full bg-success border-2" style={{ borderColor: 'var(--bg-surface)' }} />
                </div>
            </div>
        </div>
    );
};

export default LeaveManagement;

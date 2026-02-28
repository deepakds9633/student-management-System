import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnnouncementService from '../services/AnnouncementService';
import AuthService from '../services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Calendar, Pin, Bell, FileText, AlertTriangle, Paperclip, Download, ExternalLink, Maximize2, X, Users, ShieldAlert } from 'lucide-react';

const FILE_BASE_URL = 'http://localhost:8080';

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageZoom, setImageZoom] = useState(false);

    const user = AuthService.getCurrentUser();
    const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        fetchNotice();
    }, [id]);

    const fetchNotice = async () => {
        try {
            const res = await AnnouncementService.getById(id);
            setNotice(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isOwner = isStaffOrAdmin && notice?.postedBy?.toLowerCase() === user?.username?.toLowerCase();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await AnnouncementService.remove(id);
            navigate('/notices');
        } catch (e) {
            console.error(e);
        }
    };

    const categoryStyles = {
        NOTICE: { color: 'var(--primary)', bg: 'var(--primary-dim)', border: 'rgba(79, 70, 229, 0.2)', icon: <Pin size={16} /> },
        ANNOUNCEMENT: { color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'rgba(139, 92, 246, 0.2)', icon: <Bell size={16} /> },
        EXAM: { color: 'var(--danger)', bg: 'var(--danger-dim)', border: 'rgba(239, 68, 68, 0.2)', icon: <FileText size={16} /> },
        EVENT: { color: 'var(--success)', bg: 'var(--success-dim)', border: 'rgba(16, 185, 129, 0.2)', icon: <Calendar size={16} /> },
        URGENT: { color: 'var(--danger)', bg: 'var(--danger-dim)', border: 'rgba(239, 68, 68, 0.4)', icon: <AlertTriangle size={16} /> }
    };

    const priorityBadge = {
        URGENT: { bg: 'var(--danger-dim)', text: 'var(--danger)', border: 'rgba(239, 68, 68, 0.3)', label: 'Emergency Priority' },
        HIGH: { bg: 'var(--warning-dim)', text: 'var(--warning)', border: 'rgba(245, 158, 11, 0.3)', label: 'High Priority' }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Decrypting Announcement...</p>
                </div>
            </div>
        );
    }

    if (!notice) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] mx-auto flex items-center justify-center text-4xl opacity-20 border border-slate-200 dark:border-slate-700">
                    📭
                </div>
                <div>
                    <h2 className="text-2xl font-black">Transmission Lost</h2>
                    <p className="text-xs opacity-40 max-w-xs mx-auto mt-1">This announcement packet could not be verified or does not exist in the central archives.</p>
                </div>
                <button onClick={() => navigate('/notices')} className="btn-primary !px-8 flex items-center gap-2 mx-auto">
                    <ArrowLeft size={18} /> Board Directory
                </button>
            </div>
        );
    }

    const catStyle = categoryStyles[notice.category] || categoryStyles.NOTICE;
    const priStyle = notice.priority && notice.priority !== 'NORMAL' ? priorityBadge[notice.priority] : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/notices')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Notice Registry
                </button>
                {isOwner && (
                    <button onClick={handleDelete}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-danger opacity-50 hover:opacity-100 transition-all">
                        <Trash2 size={14} /> Delete Entry
                    </button>
                )}
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                className="md-card !p-0 overflow-hidden border-none shadow-2xl relative">

                {priStyle && (
                    <div className="px-6 py-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest z-10 relative border-b"
                        style={{ background: priStyle.bg, color: priStyle.text, borderColor: priStyle.border }}>
                        <ShieldAlert size={12} /> {priStyle.label}
                    </div>
                )}

                <div className="p-8 md:p-12 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                        {catStyle.icon && React.cloneElement(catStyle.icon, { size: 240 })}
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-2"
                                style={{ background: catStyle.bg, color: catStyle.color, borderColor: catStyle.border }}>
                                {catStyle.icon} {notice.category}
                            </span>
                            {notice.recipientRole && notice.recipientRole !== 'ALL' && (
                                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 opacity-60 flex items-center gap-2">
                                    <Users size={12} /> Target: {notice.recipientRole}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
                            {notice.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-lg"
                                    style={{ background: 'var(--gradient-primary)' }}>
                                    {notice.postedBy?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Authored By</div>
                                    <div className="text-xs font-bold">{notice.postedBy || 'Administrator'} <span className="opacity-40 font-medium">({notice.postedByRole})</span></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary border border-slate-200 dark:border-slate-700">
                                    <Calendar size={14} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Release Date</div>
                                    <div className="text-xs font-bold tabular-nums">
                                        {notice.timestamp && new Date(notice.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-sm md:text-base leading-[1.8] opacity-70 whitespace-pre-wrap font-medium">
                            {notice.message}
                        </p>
                    </div>

                    {notice.fileUrl && (
                        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Paperclip size={14} className="text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Document Transmission</h3>
                            </div>

                            {(notice.fileType === 'IMAGE' || notice.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                                <div className="relative group max-w-2xl">
                                    <div onClick={() => setImageZoom(true)}
                                        className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-zoom-in group-hover:shadow-2xl transition-all duration-500">
                                        <img src={`${FILE_BASE_URL}${notice.fileUrl}`} alt="Attachment"
                                            className="w-full max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="bg-white text-black px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                                                <Maximize2 size={14} /> Enlarge View
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="md-card !bg-slate-50 dark:!bg-slate-900/50 border-none !p-6 flex flex-col sm:flex-row items-center justify-between gap-6 group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight mb-0.5">{notice.fileUrl.split('/').pop() || 'Institutional_Payload.pdf'}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{notice.fileType || 'Unspecified'} Format</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <a href={`${FILE_BASE_URL}${notice.fileUrl}`} target="_blank" rel="noreferrer"
                                            className="flex-1 sm:flex-none btn-secondary !py-2.5 !px-6 !text-[10px] !rounded-xl flex items-center justify-center gap-2">
                                            <ExternalLink size={14} /> Open
                                        </a>
                                        <a href={`${FILE_BASE_URL}${notice.fileUrl}`} download
                                            className="flex-1 sm:flex-none btn-primary !py-2.5 !px-6 !text-[10px] !rounded-xl flex items-center justify-center gap-2">
                                            <Download size={14} /> Download
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {imageZoom && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                        <button onClick={() => setImageZoom(false)} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/20 text-white rounded-full transition-all border border-white/10">
                            <X size={24} />
                        </button>
                        <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            src={`${FILE_BASE_URL}${notice.fileUrl}`} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
                        <a href={`${FILE_BASE_URL}${notice.fileUrl}`} download
                            className="absolute bottom-10 px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform">
                            <Download size={16} /> Secure Archive Download
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NoticeDetail;

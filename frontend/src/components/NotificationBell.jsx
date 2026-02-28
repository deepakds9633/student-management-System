import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, ChevronRight, ShieldAlert, Zap, Pin, Calendar, FileText, X } from 'lucide-react';
import AnnouncementService from '../services/AnnouncementService';
import AuthService from '../services/AuthService';

const NotificationBell = () => {
    const [count, setCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        if (!user) return;
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getRole = () => {
        if (!user || !user.roles) return null;
        if (user.roles.includes('ROLE_ADMIN')) return 'ADMIN';
        if (user.roles.includes('ROLE_STAFF')) return 'STAFF';
        if (user.roles.includes('ROLE_STUDENT')) return 'STUDENT';
        return null;
    };

    const fetchCount = async () => {
        try {
            const lastSeen = localStorage.getItem('lastSeenAnnouncement') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('.')[0];
            const res = await AnnouncementService.getCount(lastSeen, getRole());
            setCount(res.data.count || 0);
        } catch (e) { /* silent */ }
    };

    const openDropdown = async () => {
        const nextState = !showDropdown;
        setShowDropdown(nextState);
        if (nextState) {
            setLoading(true);
            setCount(0);
            localStorage.setItem('lastSeenAnnouncement', new Date().toISOString().split('.')[0]);
            try {
                const res = await AnnouncementService.getAll(getRole());
                setRecent(res.data.slice(0, 5));
            } catch (e) { /* silent */ }
            setLoading(false);
        }
    };

    const handleViewAll = () => {
        localStorage.setItem('lastSeenAnnouncement', new Date().toISOString().split('.')[0]);
        setCount(0);
        setShowDropdown(false);
        navigate('/notices');
    };

    const handleClickItem = (id) => {
        setShowDropdown(false);
        navigate(`/notices/${id}`);
    };

    const priorityColor = {
        URGENT: 'var(--danger)',
        HIGH: 'var(--warning)',
        NORMAL: 'var(--primary)'
    };

    const categoryIcons = {
        NOTICE: <Pin size={12} />,
        ANNOUNCEMENT: <Bell size={12} />,
        EXAM: <FileText size={12} />,
        EVENT: <Calendar size={12} />,
        URGENT: <Zap size={12} />
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={openDropdown}
                className="relative p-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 group active:scale-95">
                <Bell size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                <AnimatePresence>
                    {count > 0 && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute top-2 right-2 min-w-[12px] h-[12px] bg-danger rounded-full border-2 border-white dark:border-[#0f172a] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden z-[100]">

                        <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Intelligence Feed</h3>
                            {recent.length > 0 && (
                                <button onClick={() => setRecent([])} className="text-[9px] font-black uppercase tracking-widest text-primary opacity-60 hover:opacity-100">Clear</button>
                            )}
                        </div>

                        <div className="max-h-[360px] overflow-y-auto scrollbar-hide py-2">
                            {loading ? (
                                <div className="p-10 flex flex-col items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-20">Fetching Data...</p>
                                </div>
                            ) : recent.length === 0 ? (
                                <div className="p-10 text-center space-y-3 opacity-30">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl mx-auto flex items-center justify-center"><Bell size={20} /></div>
                                    <p className="text-[9px] font-black uppercase tracking-widest">No active transmissions</p>
                                </div>
                            ) : (
                                recent.map((item, idx) => (
                                    <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                        key={item.id} onClick={() => handleClickItem(item.id)}
                                        className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-b border-slate-50 dark:border-slate-800/30 last:border-0 group">
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: priorityColor[item.priority] || priorityColor.NORMAL, boxShadow: `0 0 8px ${priorityColor[item.priority] || priorityColor.NORMAL}` }} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="opacity-40">{categoryIcons[item.category]}</span>
                                                    <p className="text-[11px] font-black tracking-tight truncate group-hover:text-primary transition-colors">{item.title}</p>
                                                </div>
                                                <p className="text-[10px] font-medium opacity-50 line-clamp-1">{item.message}</p>
                                                <div className="flex items-center gap-2 pt-1 text-[9px] font-black uppercase tracking-widest opacity-20">
                                                    <Clock size={8} /> {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Just now'}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800/50">
                            <button onClick={handleViewAll}
                                className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                Expand Registry <ChevronRight size={12} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;

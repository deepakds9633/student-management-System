import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Clock, ShieldAlert, Zap, Pin, Calendar,
    FileText, Search, Filter, CheckCircle2, AlertCircle,
    Inbox, ChevronRight, MoreVertical
} from 'lucide-react';

const NotificationComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            const isStudent = currentUser.roles && currentUser.roles.includes('ROLE_STUDENT');
            fetchNotifications(isStudent ? 'STUDENT' : 'STAFF');
        }
    }, []);

    const fetchNotifications = async (role) => {
        setLoading(true);
        const user = AuthService.getCurrentUser();
        if (user && user.token) {
            try {
                const response = await axios.get(`http://localhost:8080/api/notifications/role/${role}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        }
        setLoading(false);
    }

    const priorityColors = {
        URGENT: 'text-danger bg-danger/10 border-danger/20',
        HIGH: 'text-warning bg-warning/10 border-warning/20',
        NORMAL: 'text-primary bg-primary/10 border-primary/20',
        INFO: 'text-accent bg-accent/10 border-accent/20'
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' || n.priority === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronizing Transmissions...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <Inbox className="text-primary" size={32} /> Intelligence Center
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Institutional Communication Log</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-primary transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Filter by keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pill-input-dark !pl-10 !pr-4 !py-2 !rounded-xl !text-[10px] !bg-white dark:!bg-slate-900 border-none transition-all focus:ring-2 ring-primary/20 w-48 md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['ALL', 'URGENT', 'HIGH', 'NORMAL', 'INFO'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 opacity-50 hover:opacity-100'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="md-card py-24 text-center space-y-4 opacity-40">
                            <AlertCircle className="mx-auto" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest">No matching transmissions found</p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((n, idx) => (
                            <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}
                                key={n.id} className="md-card p-6 border-none shadow-xl hover:translate-x-1 transition-all group relative overflow-hidden flex items-start gap-6">

                                <div className={`p-3 rounded-2xl ${priorityColors[n.priority] || priorityColors.NORMAL} border shrink-0 transition-transform group-hover:scale-110 shadow-inner`}>
                                    {n.priority === 'URGENT' ? <Zap size={18} /> : n.priority === 'HIGH' ? <ShieldAlert size={18} /> : <Bell size={18} />}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${priorityColors[n.priority] || priorityColors.NORMAL}`}>
                                                {n.priority || 'NORMAL'}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-20 flex items-center gap-1">
                                                <Clock size={10} /> {new Date(n.timestamp).toLocaleDateString()} • {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                            <MoreVertical size={14} className="opacity-30" />
                                        </button>
                                    </div>

                                    <p className="text-sm font-semibold tracking-tight leading-relaxed group-hover:text-primary transition-colors pr-8">
                                        {n.message}
                                    </p>

                                    <div className="flex items-center gap-4 pt-1">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50">
                                            <CheckCircle2 size={10} className="text-success" />
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Delivered</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-0 group-hover:opacity-10 group-hover:translate-x-2 transition-all">
                                    <ChevronRight size={48} />
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Subscription Footer */}
            <div className="md-card !bg-transparent border-dashed border-2 border-slate-200 dark:border-slate-800 p-8 flex flex-col md:flex-row items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl"><Zap size={32} /></div>
                <div className="space-y-1 flex-1 text-center md:text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Management</h4>
                    <p className="text-xs font-medium">You are currently subscribed to the primary institutional intelligence stream. Urgent alerts bypass normal delivery latency.</p>
                </div>
                <button className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
                    Settings
                </button>
            </div>
        </div>
    );
};

export default NotificationComponent;

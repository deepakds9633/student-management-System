import { useEffect, useState } from 'react';
import AnnouncementService from '../services/AnnouncementService';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, X, Pin, Bell, FileText, Calendar, AlertTriangle, Paperclip, Trash2 } from 'lucide-react';

const NoticeBoard = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [notices, setNotices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', category: 'ANNOUNCEMENT', priority: 'NORMAL', recipientRole: 'ALL' });
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isStaff = user?.roles?.includes('ROLE_STAFF');
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const canPost = isStaff || isAdmin;

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchNotices();
        localStorage.setItem('lastSeenAnnouncement', new Date().toISOString().split('.')[0]);
    }, []);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const role = isAdmin ? 'ADMIN' : (isStaff ? 'STAFF' : 'STUDENT');
            const res = await AnnouncementService.getAll(role, 'MANUAL');
            setNotices(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('message', form.message);
            formData.append('category', form.category);
            formData.append('priority', form.priority);
            formData.append('recipientRole', form.recipientRole);
            formData.append('postedBy', user.username);
            if (file) formData.append('file', file);
            await AnnouncementService.create(formData);
            setMsg('success');
            setShowForm(false);
            setForm({ title: '', message: '', category: 'ANNOUNCEMENT', priority: 'NORMAL', recipientRole: 'ALL' });
            setFile(null);
            fetchNotices();
            setTimeout(() => setMsg(''), 4000);
        } catch (err) { setMsg('error'); }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this notice?')) return;
        try { await AnnouncementService.remove(id); fetchNotices(); } catch { /* */ }
    };

    const categories = [
        { key: 'ALL', label: 'All' },
        { key: 'ANNOUNCEMENT', label: 'Announcements', icon: <Bell size={13} /> },
        { key: 'NOTICE', label: 'Notices', icon: <Pin size={13} /> },
        { key: 'EXAM', label: 'Exams', icon: <FileText size={13} /> },
        { key: 'EVENT', label: 'Events', icon: <Calendar size={13} /> },
        { key: 'URGENT', label: 'Urgent', icon: <AlertTriangle size={13} /> },
    ];

    const getCategoryStyle = (cat) => {
        const map = {
            NOTICE: { color: 'var(--info)', bg: 'var(--info-dim)', icon: <Pin size={16} /> },
            ANNOUNCEMENT: { color: 'var(--primary)', bg: 'var(--primary-dim)', icon: <Bell size={16} /> },
            EXAM: { color: 'var(--danger)', bg: 'var(--danger-dim)', icon: <FileText size={16} /> },
            EVENT: { color: 'var(--success)', bg: 'var(--success-dim)', icon: <Calendar size={16} /> },
            URGENT: { color: 'var(--danger)', bg: 'var(--danger-dim)', icon: <AlertTriangle size={16} /> },
        };
        return map[cat] || map.ANNOUNCEMENT;
    };

    const filtered = notices.filter(n => {
        const matchCat = activeCategory === 'ALL' || n.category === activeCategory;
        const matchSearch = !searchTerm || n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || n.message?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="flex items-center gap-2"><Bell size={22} style={{ color: 'var(--primary)' }} /> Notice Board</h1>
                    <p>Stay updated with the latest institutional announcements.</p>
                </div>
                {canPost && (
                    <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
                        {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Post Notice</>}
                    </button>
                )}
            </div>

            {/* Toast */}
            {msg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`toast ${msg === 'success' ? 'toast-success' : 'toast-error'}`}>
                    {msg === 'success' ? '✅ Announcement published successfully.' : '❌ Failed to publish announcement.'}
                </motion.div>
            )}

            {/* Post Form */}
            {showForm && canPost && (
                <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="md-card p-6 overflow-hidden" onSubmit={handleSubmit}>
                    <h3 className="font-bold text-base mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Plus size={18} style={{ color: 'var(--primary)' }} /> Create Announcement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Title *</label>
                            <input required type="text" className="pill-input-dark" placeholder="Enter title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
                            <select className="pill-input-dark" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="ANNOUNCEMENT">Announcement</option>
                                <option value="NOTICE">Notice</option>
                                <option value="EXAM">Exam</option>
                                <option value="EVENT">Event</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Message *</label>
                        <textarea required rows={4} className="pill-input-dark resize-y" placeholder="Write your message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Priority</label>
                            <select className="pill-input-dark" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High Priority</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Audience</label>
                            <select className="pill-input-dark" value={form.recipientRole} onChange={e => setForm({ ...form, recipientRole: e.target.value })}>
                                <option value="ALL">Everyone</option>
                                <option value="STUDENT">Students Only</option>
                                <option value="STAFF">Staff Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Attachment</label>
                            <input type="file" className="pill-input-dark !p-[7px] text-sm" onChange={e => setFile(e.target.files[0])} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                        <button type="submit" className="btn-primary">Publish</button>
                    </div>
                </motion.form>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Search notices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pill-input-dark !pl-9 !py-2" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
                    {categories.map(cat => (
                        <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                            style={activeCategory === cat.key ? {
                                background: 'var(--primary-dim)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.25)'
                            } : {
                                background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)'
                            }}>
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notices List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="md-card p-6 flex gap-4">
                            <div className="skeleton-loading w-11 h-11 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton-loading h-4 w-1/3 rounded" />
                                <div className="skeleton-loading h-3 w-full rounded" />
                                <div className="skeleton-loading h-3 w-2/3 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {filtered.map((notice, i) => {
                        const cs = getCategoryStyle(notice.category);
                        const isUrgent = notice.priority === 'URGENT';
                        return (
                            <motion.div
                                key={notice.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={e => { if (e.target.closest('button')) return; navigate(`/notices/${notice.id}`); }}
                                className="md-card p-5 cursor-pointer group flex gap-4 overflow-hidden relative"
                                style={isUrgent ? { borderLeft: `3px solid var(--danger)` } : { borderLeft: `3px solid ${cs.color}` }}
                            >
                                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                                    style={{ background: cs.bg, color: cs.color }}>
                                    {cs.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="pill-badge text-[10px]" style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.color}25` }}>
                                            {notice.category}
                                        </span>
                                        {isUrgent && (
                                            <span className="pill-badge badge-danger text-[10px]">🔴 URGENT</span>
                                        )}
                                        {notice.priority === 'HIGH' && !isUrgent && (
                                            <span className="pill-badge badge-warning text-[10px]">🟡 HIGH</span>
                                        )}
                                        {notice.fileUrl && (
                                            <span className="pill-badge badge-accent text-[10px] flex items-center gap-1">
                                                <Paperclip size={9} /> Attachment
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-sm mb-1 truncate transition-colors"
                                        style={{ color: 'var(--text-primary)' }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                                        {notice.title}
                                    </h3>
                                    <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{notice.message}</p>
                                    <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-white text-[8px]"
                                            style={{ background: 'var(--gradient-primary)' }}>
                                            {notice.postedBy?.[0]?.toUpperCase()}
                                        </div>
                                        {notice.postedBy || 'Admin'} · {new Date(notice.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                {canPost && (
                                    <button onClick={e => handleDelete(notice.id, e)}
                                        className="self-start p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        style={{ color: 'var(--text-muted)' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-dim)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : (
                <div className="md-card p-14 text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>📭</div>
                    <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No notices found</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {searchTerm || activeCategory !== 'ALL' ? 'Try adjusting your filters.' : 'No active announcements yet.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;

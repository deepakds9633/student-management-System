import { useEffect, useState } from 'react';
import AnnouncementService from '../services/AnnouncementService';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const inp = { background: 'var(--mc-bg)', border: '1px solid var(--mc-border-accent)', borderRadius: '0.75rem', padding: '0.625rem 1rem', color: 'var(--mc-text)', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' };

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

    useEffect(() => { if (!user) { navigate('/login'); return; } fetchNotices(); localStorage.setItem('lastSeenAnnouncement', new Date().toISOString().split('.')[0]); }, []);

    const fetchNotices = async () => { setLoading(true); try { const role = isAdmin ? 'ADMIN' : (isStaff ? 'STAFF' : 'STUDENT'); const res = await AnnouncementService.getAll(role, 'MANUAL'); setNotices(res.data); } catch (e) { console.error(e); } setLoading(false); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setMsg('');
        try {
            const formData = new FormData();
            formData.append('title', form.title); formData.append('message', form.message);
            formData.append('category', form.category); formData.append('priority', form.priority);
            formData.append('recipientRole', form.recipientRole); formData.append('postedBy', user.username);
            if (file) formData.append('file', file);
            await AnnouncementService.create(formData);
            setMsg('✅ Announcement published!'); setShowForm(false);
            setForm({ title: '', message: '', category: 'ANNOUNCEMENT', priority: 'NORMAL', recipientRole: 'ALL' }); setFile(null);
            fetchNotices(); setTimeout(() => setMsg(''), 4000);
        } catch (err) { setMsg('❌ ' + (err.response?.data || err.message)); }
    };

    const handleDelete = async (id) => { if (!confirm('Delete this announcement?')) return; try { await AnnouncementService.remove(id); setMsg('✅ Deleted'); fetchNotices(); setTimeout(() => setMsg(''), 3000); } catch (e) { console.error(e); } };

    const categories = [{ key: 'ALL', l: 'All', i: '📋' }, { key: 'ANNOUNCEMENT', l: 'Announcements', i: '📢' }, { key: 'NOTICE', l: 'Notices', i: '📌' }, { key: 'EXAM', l: 'Exams', i: '📝' }, { key: 'EVENT', l: 'Events', i: '🎉' }, { key: 'URGENT', l: 'Urgent', i: '⚠️' }];
    const catIcons = { NOTICE: '📌', ANNOUNCEMENT: '📢', EXAM: '📝', EVENT: '🎉', URGENT: '⚠️' };
    const catColors = { NOTICE: '#3b82f6', ANNOUNCEMENT: '#8b5cf6', EXAM: '#f43f5e', EVENT: '#22c55e', URGENT: '#ef4444' };
    const priBadge = { URGENT: { bg: 'rgba(239,68,68,0.1)', c: '#f87171', b: 'rgba(239,68,68,0.2)', i: '🔴' }, HIGH: { bg: 'rgba(245,158,11,0.1)', c: '#fbbf24', b: 'rgba(245,158,11,0.2)', i: '🟡' } };

    const filteredNotices = notices.filter(n => {
        const matchCat = activeCategory === 'ALL' || n.category === activeCategory;
        const matchSearch = !searchTerm || n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || n.message?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', color: 'var(--mc-text)' }}>
            {/* Header Bar */}
            <div style={{ background: 'var(--mc-surface)', borderBottom: '1px solid var(--mc-border)', padding: '1.25rem 1.5rem' }}>
                <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>📢 Announcements</h1>
                        <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Stay updated with the latest notices</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)', borderRadius: '9999px', padding: '0.5rem 1rem', color: 'var(--mc-text)', fontSize: '0.8125rem', cursor: 'pointer' }}>← Back</button>
                        {canPost && <button onClick={() => setShowForm(!showForm)} className={showForm ? '' : 'btn-gradient-purple'} style={showForm ? { borderRadius: '9999px', background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)', padding: '0.5rem 1rem', color: 'var(--mc-text)', fontSize: '0.8125rem', cursor: 'pointer' } : { padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>{showForm ? '✕ Cancel' : '+ Post Announcement'}</button>}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>
                {msg && <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.8125rem', background: msg.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(244,63,94,0.08)', color: msg.startsWith('✅') ? '#22c55e' : '#fb7185', border: `1px solid ${msg.startsWith('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)'}` }}>{msg}</div>}

                {/* Post Form */}
                {showForm && canPost && (
                    <form onSubmit={handleSubmit} style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: '0 0 1.25rem 0' }}>✏️ Create Announcement</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div><label style={lbl}>Title *</label><input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter title..." style={inp} /></div>
                            <div><label style={lbl}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inp}><option value="ANNOUNCEMENT">📢 Announcement</option><option value="NOTICE">📌 Notice</option><option value="EXAM">📝 Exam</option><option value="EVENT">🎉 Event</option><option value="URGENT">⚠️ Urgent</option></select></div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}><label style={lbl}>Message *</label><textarea required rows="4" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Write your announcement..." style={{ ...inp, resize: 'vertical', minHeight: 100 }} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div><label style={lbl}>Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inp}><option value="NORMAL">Normal</option><option value="HIGH">🟡 High</option><option value="URGENT">🔴 Urgent</option></select></div>
                            <div><label style={lbl}>Audience</label><select value={form.recipientRole} onChange={e => setForm({ ...form, recipientRole: e.target.value })} style={inp}><option value="ALL">👥 Everyone</option><option value="STUDENT">🎓 Students</option><option value="STAFF">👨‍🏫 Staff</option></select></div>
                            <div><label style={lbl}>Attachment</label><input type="file" onChange={e => setFile(e.target.files[0])} style={{ ...inp, padding: '0.5rem', fontSize: '0.75rem' }} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn-gradient-purple" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>📤 Publish</button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ borderRadius: '9999px', background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)', padding: '0.625rem 1.5rem', color: 'var(--mc-text)', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                )}

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--mc-text-muted)' }}>🔍</span>
                    <input type="text" placeholder="Search announcements..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pill-input-dark" />
                </div>

                {/* Category Tabs */}
                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {categories.map(cat => (
                        <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
                            borderRadius: '9999px', padding: '0.375rem 0.875rem', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                            background: activeCategory === cat.key ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                            color: activeCategory === cat.key ? '#a78bfa' : 'var(--mc-text-muted)',
                            border: `1px solid ${activeCategory === cat.key ? 'rgba(139,92,246,0.25)' : 'var(--mc-border)'}`,
                            display: 'flex', alignItems: 'center', gap: '0.375rem'
                        }}>{cat.i} {cat.l}</button>
                    ))}
                </div>

                {/* Notices */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--mc-border)', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : filteredNotices.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredNotices.map(notice => {
                            const cc = catColors[notice.category] || '#3b82f6';
                            const pb = notice.priority && notice.priority !== 'NORMAL' ? priBadge[notice.priority] : null;
                            return (
                                <div key={notice.id} onClick={e => { if (e.target.tagName === 'BUTTON') return; navigate(`/notices/${notice.id}`); }}
                                    style={{
                                        background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer',
                                        transition: 'border-color 0.2s', borderLeft: `3px solid ${notice.priority === 'URGENT' ? '#ef4444' : notice.priority === 'HIGH' ? '#f59e0b' : cc}`, position: 'relative'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--mc-border-accent)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--mc-border)'}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '1.125rem' }}>{catIcons[notice.category] || '📌'}</span>
                                                <span style={{ borderRadius: '9999px', padding: '0.2rem 0.625rem', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: `${cc}15`, color: cc, border: `1px solid ${cc}30` }}>{notice.category || 'NOTICE'}</span>
                                                {pb && <span style={{ borderRadius: '9999px', padding: '0.2rem 0.625rem', fontSize: '0.625rem', fontWeight: 600, background: pb.bg, color: pb.c, border: `1px solid ${pb.b}` }}>{pb.i} {notice.priority}</span>}
                                                {notice.recipientRole && notice.recipientRole !== 'ALL' && <span style={{ fontSize: '0.625rem', color: 'var(--mc-text-dim)' }}>👥 {notice.recipientRole}</span>}
                                                {notice.fileUrl && <span style={{ fontSize: '0.625rem', color: '#06b6d4' }}>📎 Attachment</span>}
                                            </div>
                                            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#fff', margin: '0 0 0.375rem' }}>{notice.title || 'Notice'}</h3>
                                            <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.8125rem', margin: '0 0 0.625rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{notice.message}</p>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.6875rem', color: 'var(--mc-text-dim)' }}>
                                                {notice.timestamp && <span>🕐 {new Date(notice.timestamp).toLocaleString()}</span>}
                                                {notice.postedBy && <span>{notice.postedByRole === 'ADMIN' ? '🛡️' : '👨‍🏫'} {notice.postedBy}</span>}
                                            </div>
                                        </div>
                                        {canPost && <button onClick={e => { e.stopPropagation(); handleDelete(notice.id); }} style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.12)', borderRadius: '0.5rem', padding: '0.375rem', color: '#fb7185', cursor: 'pointer', flexShrink: 0, fontSize: '0.875rem' }}>🗑</button>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '4rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📭</span>
                        <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.875rem' }}>No announcements found</p>
                        <p style={{ color: 'var(--mc-text-dim)', fontSize: '0.75rem', marginTop: '0.375rem' }}>{searchTerm || activeCategory !== 'ALL' ? 'Try adjusting your filters' : 'Check back later'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticeBoard;

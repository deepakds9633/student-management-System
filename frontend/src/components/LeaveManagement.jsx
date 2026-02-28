import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';

const S = {
    card: { background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.5rem' },
    pill: { borderRadius: '9999px' }, inp: { background: 'var(--mc-bg)', border: '1px solid var(--mc-border-accent)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', color: 'var(--mc-text)', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' }
};

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
            const url = isStaff ? 'http://localhost:8080/api/leaves' : `http://localhost:8080/api/leaves/student/${user?.id}`;
            const res = await axios.get(url, { headers });
            setLeaves(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/leaves', { student: { id: user?.id }, ...formData }, { headers });
            setShowForm(false);
            setFormData({ startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (err) { alert('Error applying leave: ' + (err.response?.data?.message || err.message)); }
    };

    const handleAction = async (id, action) => {
        const remarks = prompt(`Enter remarks for ${action}:`) || '';
        try { await axios.put(`http://localhost:8080/api/leaves/${id}/${action}`, { remarks }, { headers }); fetchLeaves(); }
        catch (err) { alert('Error: ' + err.message); }
    };

    const filtered = activeFilter === 'ALL' ? leaves : leaves.filter(l => l.status === activeFilter);
    const sc = { PENDING: { bg: 'rgba(245,158,11,0.1)', c: '#f59e0b', b: 'rgba(245,158,11,0.2)', i: '⏳' }, APPROVED: { bg: 'rgba(34,197,94,0.1)', c: '#22c55e', b: 'rgba(34,197,94,0.2)', i: '✅' }, REJECTED: { bg: 'rgba(244,63,94,0.1)', c: '#fb7185', b: 'rgba(244,63,94,0.2)', i: '❌' } };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--mc-border)', borderTopColor: 'var(--mc-teal)', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', padding: '2rem 1.5rem', color: 'var(--mc-text)' }}>
            <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📅 Leave Management</h1>
                        <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{isStaff ? 'Review and manage student leave requests' : 'Apply and track your leave requests'}</p>
                    </div>
                    {!isStaff && <button onClick={() => setShowForm(!showForm)} className={showForm ? '' : 'btn-gradient-blue'} style={showForm ? { ...S.pill, background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)', padding: '0.625rem 1.5rem', color: 'var(--mc-text)', fontSize: '0.875rem', cursor: 'pointer' } : { padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>{showForm ? '✕ Cancel' : '+ Apply Leave'}</button>}
                </div>

                {showForm && !isStaff && (
                    <form onSubmit={handleApply} style={{ ...S.card, marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: '0 0 1rem 0' }}>New Leave Application</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginBottom: '0.375rem' }}>Start Date</label><input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} style={{ ...S.inp, ...S.pill }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginBottom: '0.375rem' }}>End Date</label><input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} style={{ ...S.inp, ...S.pill }} /></div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginBottom: '0.375rem' }}>Reason</label><textarea required rows="3" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="Enter your reason..." style={{ ...S.inp, borderRadius: '0.75rem', resize: 'vertical' }} /></div>
                        <button type="submit" style={{ ...S.pill, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '0.625rem 1.5rem', color: '#22c55e', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Submit Application</button>
                    </form>
                )}

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                        <button key={f} onClick={() => setActiveFilter(f)} style={{ ...S.pill, padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', border: activeFilter === f ? 'none' : '1px solid var(--mc-border)', background: activeFilter === f ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'var(--mc-card)', color: activeFilter === f ? '#fff' : 'var(--mc-text-muted)', boxShadow: activeFilter === f ? '0 4px 15px rgba(59,130,246,0.25)' : 'none' }}>
                            {f} ({f === 'ALL' ? leaves.length : leaves.filter(l => l.status === f).length})
                        </button>
                    ))}
                </div>

                {/* Leave List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filtered.length === 0 ? (
                        <div style={{ ...S.card, textAlign: 'center', color: 'var(--mc-text-dim)', padding: '3rem' }}>No leave requests found.</div>
                    ) : filtered.map(leave => {
                        const cfg = sc[leave.status] || sc.PENDING;
                        return (
                            <div key={leave.id} style={{ ...S.card, transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--mc-border-accent)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--mc-border)'}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        {isStaff && <p style={{ color: '#60a5fa', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.9375rem' }}>👤 {leave.student?.name || `Student #${leave.student?.id}`}</p>}
                                        <p style={{ color: 'var(--mc-text)', marginBottom: '0.25rem' }}>📅 {leave.startDate} → {leave.endDate}</p>
                                        <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.8125rem' }}>💬 {leave.reason}</p>
                                        {leave.remarks && <p style={{ color: 'var(--mc-text-dim)', fontSize: '0.75rem', fontStyle: 'italic', marginTop: '0.375rem' }}>Staff: {leave.remarks}</p>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ ...S.pill, padding: '0.375rem 0.875rem', fontSize: '0.75rem', fontWeight: 600, background: cfg.bg, color: cfg.c, border: `1px solid ${cfg.b}` }}>{cfg.i} {leave.status}</span>
                                        {isStaff && leave.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleAction(leave.id, 'approve')} style={{ ...S.pill, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '0.375rem 0.875rem', color: '#22c55e', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>✅ Approve</button>
                                                <button onClick={() => handleAction(leave.id, 'reject')} style={{ ...S.pill, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '0.375rem 0.875rem', color: '#fb7185', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>❌ Reject</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LeaveManagement;

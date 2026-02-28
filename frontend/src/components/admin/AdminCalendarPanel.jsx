import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../../services/AuthService';

const S = {
    card: {
        background: 'var(--mc-card)',
        border: '1px solid var(--mc-border)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
    },
    pill: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.625rem',
        fontWeight: 600,
        color: '#fff',
        letterSpacing: '0.02em',
        width: '100%',
        marginBottom: '0.25rem',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    gridDay: {
        minHeight: '100px',
        padding: '0.5rem',
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.125rem'
    }
};

const AdminCalendarPanel = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = AuthService.getCurrentUser();
    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate]);

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            // We fetch everything generically to display on the calendar
            const [usersRes, leavesRes, assignRes, noticeRes] = await Promise.all([
                axios.get('http://localhost:8080/api/admin/users', { headers }).catch(() => ({ data: [] })),
                axios.get('http://localhost:8080/api/leaves', { headers }).catch(() => ({ data: [] })),
                axios.get('http://localhost:8080/api/assignments', { headers }).catch(() => ({ data: [] })),
                axios.get('http://localhost:8080/api/announcements', { headers }).catch(() => ({ data: [] }))
            ]);

            const newEvents = [];

            // Example formatting logic (assuming standard fields)
            leavesRes.data.forEach(l => {
                if (l.startDate) {
                    newEvents.push({
                        date: new Date(l.startDate),
                        title: `Leave: ${l.studentName}`,
                        type: 'leave',
                        color: l.status === 'APPROVED' ? '#22c55e' : '#f59e0b' // Green or Amber
                    });
                }
            });

            assignRes.data.forEach(a => {
                if (a.dueDate) {
                    newEvents.push({
                        date: new Date(a.dueDate),
                        title: `Due: ${a.title}`,
                        type: 'assignment',
                        color: '#3b82f6' // Blue
                    });
                }
            });

            noticeRes.data.forEach(n => {
                if (n.timestamp) {
                    newEvents.push({
                        date: new Date(n.timestamp),
                        title: `Notice: ${n.title}`,
                        type: 'notice',
                        color: '#8b5cf6' // Purple
                    });
                }
            });

            setEvents(newEvents);
        } catch (err) {
            console.error('Failed to fetch calendar data', err);
        }
        setLoading(false);
    };

    // Calendar Generation
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ ...S.gridDay, opacity: 0.3 }}></div>);
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(year, month, day).toDateString();
            const dayEvents = events.filter(e => e.date.toDateString() === dateStr);

            days.push(
                <div key={day} style={S.gridDay}>
                    <div style={{ textAlign: 'right', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                        {day}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {dayEvents.map((evt, i) => (
                            <div key={i} title={evt.title} style={{ ...S.pill, background: `${evt.color}25`, borderLeft: `2px solid ${evt.color}`, color: evt.color }}>
                                {evt.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const today = () => setCurrentDate(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Header Controls */}
            <div style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: 'var(--mc-teal)', fontWeight: 600 }}>ACADEMIC PLANNER</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>←</button>
                    <button onClick={today} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>Today</button>
                    <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>→</button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ ...S.card, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,26,0.6)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }} />
                    </div>
                )}

                {/* Days of Week */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '0.5rem' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ textAlign: 'center', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--mc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Day Cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--mc-border)', border: '1px solid var(--mc-border)', borderRadius: '0.5rem', overflow: 'hidden', flex: 1 }}>
                    {renderCalendarGrid()}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#3b82f6' }} /> Assignments
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#8b5cf6' }} /> Notices
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#22c55e' }} /> Leaves (Approved)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '2px', background: '#f59e0b' }} /> Leaves (Pending)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCalendarPanel;

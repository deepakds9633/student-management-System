import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';

const S = { card: { background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.5rem' }, pill: { borderRadius: '9999px' } };

const AnalyticsDashboard = () => {
    const [attendanceTrends, setAttendanceTrends] = useState([]);
    const [marksSummary, setMarksSummary] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const user = AuthService.getCurrentUser();
    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => { fetchData(); }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [t, m, s] = await Promise.all([
                axios.get(`http://localhost:8080/api/analytics/attendance-trends?period=${period}`, { headers }),
                axios.get('http://localhost:8080/api/analytics/marks-summary', { headers }),
                axios.get('http://localhost:8080/api/analytics/dashboard-stats', { headers })
            ]);
            setAttendanceTrends(t.data); setMarksSummary(m.data); setDashboardStats(s.data);
        } catch (err) { console.error('Error:', err); }
        setLoading(false);
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--mc-border)', borderTopColor: '#3b82f6', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    const tabs = [{ id: 'overview', l: '📊 Overview' }, { id: 'attendance', l: '📅 Attendance' }, { id: 'marks', l: '📈 Marks' }, { id: 'performers', l: '🏆 Performers' }];
    const statColors = ['#3b82f6', '#22c55e', '#fb7185', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#f97316'];

    const stats = dashboardStats ? [
        { t: 'Total Students', v: dashboardStats.totalStudents, i: '👩‍🎓' },
        { t: 'Present Today', v: dashboardStats.presentToday, i: '✅' },
        { t: 'Absent Today', v: dashboardStats.absentToday, i: '❌' },
        { t: 'Class Average', v: `${marksSummary?.classAverage || 0}%`, i: '📈' },
        ...(marksSummary ? [
            { t: 'Attendance Rate (30d)', v: `${marksSummary.attendanceRate}%`, i: '📅' },
            { t: 'Marks Entries', v: dashboardStats.totalMarksEntries, i: '📝' },
            { t: 'Subjects Tracked', v: marksSummary.subjectWiseStats?.length || 0, i: '📚' },
            { t: 'Students Graded', v: marksSummary.topPerformers?.length || 0, i: '🏆' }
        ] : [])
    ] : [];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', padding: '2rem 1.5rem', color: 'var(--mc-text)' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.375rem', background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📊 Analytics Dashboard</h1>
                <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Real-time insights into student performance</p>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
                    {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ ...S.pill, padding: '0.625rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: activeTab === t.id ? 'none' : '1px solid var(--mc-border)', background: activeTab === t.id ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'var(--mc-card)', color: activeTab === t.id ? '#fff' : 'var(--mc-text-muted)', boxShadow: activeTab === t.id ? '0 4px 15px rgba(59,130,246,0.25)' : 'none' }}>{t.l}</button>)}
                </div>

                {/* Overview */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.t}</p>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>{s.v}</p>
                                </div>
                                <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: `${statColors[i]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{s.i}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Attendance */}
                {activeTab === 'attendance' && (
                    <div style={S.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', margin: 0 }}>Attendance Trends</h2>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                {['weekly', 'monthly'].map(p => <button key={p} onClick={() => setPeriod(p)} style={{ ...S.pill, padding: '0.375rem 0.875rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: period === p ? '#3b82f6' : 'var(--mc-bg)', color: period === p ? '#fff' : 'var(--mc-text-muted)', border: '1px solid var(--mc-border)' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>)}
                            </div>
                        </div>
                        {attendanceTrends.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {attendanceTrends.map((t, i) => (
                                    <div key={i} style={{ background: 'var(--mc-bg)', borderRadius: '0.75rem', padding: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}><span style={{ fontWeight: 500 }}>{t.period}</span><span style={{ color: '#22c55e', fontWeight: 700 }}>{t.percentage?.toFixed(1)}% Present</span></div>
                                        <div style={{ width: '100%', height: 12, background: 'var(--mc-card)', borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg,#22c55e,#10b981)', width: `${t.percentage || 0}%`, transition: 'width 0.5s' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--mc-text-dim)' }}>
                                            <span>Present: {t.present}</span><span>Absent: {t.absent}</span><span>Total: {t.total}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ textAlign: 'center', color: 'var(--mc-text-dim)', padding: '3rem' }}>No data available.</p>}
                    </div>
                )}

                {/* Marks */}
                {activeTab === 'marks' && marksSummary && (
                    <div style={S.card}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', margin: '0 0 1.5rem' }}>Subject-wise Performance</h2>
                        {marksSummary.subjectWiseStats?.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
                                {marksSummary.subjectWiseStats.map((st, i) => {
                                    const c = st.percentage >= 75 ? '#22c55e' : st.percentage >= 50 ? '#f59e0b' : '#fb7185';
                                    return (
                                        <div key={i} style={{ background: 'var(--mc-bg)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--mc-border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#fff', margin: 0 }}>{st.subject}</h3>
                                                <span style={{ ...S.pill, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, background: `${c}15`, color: c }}>{st.percentage}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: 10, background: 'var(--mc-card)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                                                <div style={{ height: '100%', borderRadius: '9999px', background: `linear-gradient(90deg,${c},${c}aa)`, width: `${st.percentage}%`, transition: 'width 0.5s' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--mc-text-muted)' }}>
                                                <span>Avg: {st.average}/{st.maxMarks}</span><span>{st.totalStudents} students</span>
                                            </div>
                                        </div>);
                                })}
                            </div>
                        ) : <p style={{ textAlign: 'center', color: 'var(--mc-text-dim)', padding: '3rem' }}>No marks data available.</p>}
                        <div style={{ marginTop: '1.5rem', background: 'var(--mc-bg)', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center' }}>
                            <span style={{ color: 'var(--mc-text-muted)', marginRight: '0.5rem' }}>Class Average:</span>
                            <span style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{marksSummary.classAverage}%</span>
                        </div>
                    </div>
                )}

                {/* Performers */}
                {activeTab === 'performers' && marksSummary && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {[{ title: '🏆 Top Performers', data: marksSummary.topPerformers, c: '#22c55e' }, { title: '⚠️ Need Improvement', data: marksSummary.lowPerformers, c: '#fb7185' }].map(({ title, data, c }) => (
                            <div key={title} style={S.card}>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: c, margin: '0 0 1rem' }}>{title}</h2>
                                {data?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {data.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--mc-bg)', borderRadius: '0.625rem', padding: '0.75rem' }}>
                                                <span style={{ width: 32, textAlign: 'center', fontSize: i < 3 ? '1.25rem' : '0.875rem', color: i >= 3 ? 'var(--mc-text-dim)' : undefined }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 500, margin: '0 0 0.25rem', fontSize: '0.875rem' }}>{s.studentName}</p>
                                                    <div style={{ width: '100%', height: 6, background: 'var(--mc-card)', borderRadius: '9999px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', borderRadius: '9999px', background: c, width: `${s.percentage}%` }} />
                                                    </div>
                                                </div>
                                                <span style={{ fontWeight: 700, color: c, fontSize: '0.875rem' }}>{s.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p style={{ textAlign: 'center', color: 'var(--mc-text-dim)', padding: '2rem' }}>No data available.</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;

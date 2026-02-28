import React, { useState, useEffect } from 'react';
import AnalyticsService from '../services/AnalyticsService';

const ReportsComponent = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [marksData, setMarksData] = useState([]);
    const [topStudents, setTopStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const marksRes = await AnalyticsService.getMarksSummary();
                const marksStats = marksRes.data.subjectWiseStats || [];
                setMarksData(marksStats.map(item => ({ subject: item.subject, avg: item.percentage })));

                setTopStudents(marksRes.data.topPerformers || []);

                const attendanceRes = await AnalyticsService.getAttendanceTrends('monthly');
                const attendanceStats = attendanceRes.data || [];
                setAttendanceData(attendanceStats.map(item => {
                    const dateObj = new Date(item.period);
                    const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return { month: shortDate, percentage: Math.round(item.percentage) };
                }));
            } catch (error) {
                console.error("Error fetching report data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const barColors = ['#3b82f6', '#00e5c8', '#8b5cf6', '#f59e0b', '#ec4899'];
    const getColor = (index) => barColors[index % barColors.length];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', padding: '2rem 1.5rem', color: 'var(--mc-text)' }}>
            <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{
                        fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.375rem 0',
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>Reports & Analytics</h2>
                    <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.875rem' }}>Institution-wide insights and performance data</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    {/* Attendance Bars */}
                    <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mc-text)', margin: '0 0 1.25rem 0' }}>Attendance Trends</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 200 }}>
                            {attendanceData.map((d, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        width: '100%', borderRadius: '0.375rem 0.375rem 0 0',
                                        background: `linear-gradient(180deg, ${getColor(i)}, ${getColor(i)}88)`,
                                        height: `${d.percentage}%`, transition: 'height 0.8s ease',
                                        minHeight: 16
                                    }} />
                                    <span style={{ fontSize: '0.6875rem', color: 'var(--mc-text-muted)', marginTop: '0.5rem' }}>{d.month}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mc-text)' }}>{d.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marks Progress */}
                    <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mc-text)', margin: '0 0 1.25rem 0' }}>Average Marks by Subject</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {marksData.map((d, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                                        <span style={{ fontWeight: 500 }}>{d.subject}</span>
                                        <span style={{ fontWeight: 700, color: getColor(i) }}>{d.avg}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: 8, background: 'var(--mc-bg)', borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: '9999px',
                                            background: `linear-gradient(90deg, ${getColor(i)}, ${getColor(i)}aa)`,
                                            width: `${d.avg}%`, transition: 'width 1s ease'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Students */}
                <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--mc-border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mc-text)', margin: 0 }}>Top Performing Students</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--mc-border)' }}>
                                {['Rank', 'Name', 'Course', 'Avg Marks'].map(h => (
                                    <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topStudents.map((s, index) => {
                                const rank = index + 1;
                                const color = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7f32' : getColor(index);
                                return (
                                    <tr key={rank} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: `${color}20`, color: color, fontWeight: 800, fontSize: '0.75rem' }}>
                                                {rank}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem', fontWeight: 600 }}>{s.studentName}</td>
                                        <td style={{ padding: '0.875rem 1.5rem', color: 'var(--mc-text-muted)' }}>{s.course || 'Unassigned'}</td>
                                        <td style={{ padding: '0.875rem 1.5rem', fontWeight: 700, color: '#22c55e' }}>{s.percentage}%</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Download Button */}
                <div style={{ textAlign: 'right' }}>
                    <button className="btn-gradient-blue" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                        📥 Download Report (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsComponent;

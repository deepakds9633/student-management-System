import { useState } from 'react';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:8080/api';

const ExportReports = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [loading, setLoading] = useState('');
    const navigate = useNavigate();
    const isStaff = user?.roles?.includes('ROLE_STAFF');

    const downloadFile = async (url, filename) => {
        setLoading(filename);
        try {
            const res = await fetch(`${API}${url}`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (e) { alert('Export failed: ' + e.message); }
        setLoading('');
    };

    const reports = [
        ...(isStaff ? [{ title: 'All Students', desc: 'Complete student list with courses', icon: '👥', csv: '/export/students/csv', csvFile: 'students.csv' }] : []),
        { title: 'Marks Report', desc: 'Subject-wise marks breakdown', icon: '📝', csv: `/export/marks/csv/${user?.id}`, csvFile: 'marks.csv' },
        { title: 'Attendance Report', desc: 'Date-wise attendance record', icon: '📅', csv: `/export/attendance/csv/${user?.id}`, csvFile: 'attendance.csv' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', padding: '2rem 1.5rem', color: 'var(--mc-text)' }}>
            <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem 0' }}>📥 Export Reports</h1>
                        <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.8125rem' }}>Download CSV reports (open in Excel)</p>
                    </div>
                    <button onClick={() => navigate(-1)} style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)', borderRadius: '9999px', padding: '0.5rem 1.25rem', color: 'var(--mc-text)', fontSize: '0.8125rem', cursor: 'pointer' }}>← Back</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {reports.map((r, i) => (
                        <div key={i} style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.75rem' }}>{r.icon}</span>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>{r.title}</h3>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--mc-text-muted)', margin: '0.125rem 0 0' }}>{r.desc}</p>
                                </div>
                            </div>
                            <button onClick={() => downloadFile(r.csv, r.csvFile)} disabled={loading === r.csvFile}
                                style={{
                                    width: '100%', padding: '0.625rem', borderRadius: '9999px',
                                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                    color: '#22c55e', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                                    opacity: loading === r.csvFile ? 0.5 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}>
                                {loading === r.csvFile ? '⏳' : '📊'} Download CSV
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff', margin: '0 0 0.75rem 0' }}>ℹ️ About Exports</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--mc-text-muted)' }}>
                        <span>📊 <strong>CSV</strong> — Opens directly in Microsoft Excel, Google Sheets, etc.</span>
                        <span>🔒 Reports are generated with your current data in real-time</span>
                        <span>📁 Files can be used for further analysis and record-keeping</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportReports;

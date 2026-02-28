import { useEffect, useState } from 'react'
import AuthService from '../services/AuthService'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from './NotificationBell';
import AnnouncementService from '../services/AnnouncementService';
import StudentOverview from './student/StudentOverview';
import StudentAttendance from './student/StudentAttendance';
import StudentMarks from './student/StudentMarks';
import StudentLeaves from './student/StudentLeaves';
import ThemeToggle from './ThemeToggle';

const API = 'http://localhost:8080/api';

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [marks, setMarks] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigator = useNavigate();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) { navigator("/login"); return; }
        setUser(currentUser);
        fetchAllData(currentUser);
    }, []);

    const fetchAllData = async (u) => {
        const headers = { Authorization: `Bearer ${u.token}` };
        setLoading(true);
        try {
            let sid = u.id;
            try {
                const studentRes = await axios.get(`${API}/students/user/${u.id}`, { headers });
                setStudentInfo(studentRes.data);
                sid = studentRes.data.id;
            } catch (e) { console.log('Student profile lookup by userId failed, using id directly'); }

            const [attRes, marksRes, leavesRes, annRes] = await Promise.allSettled([
                axios.get(`${API}/attendance/student/${sid}`, { headers }),
                axios.get(`${API}/marks/student/${sid}`, { headers }),
                axios.get(`${API}/leaves/student/${sid}`, { headers }),
                AnnouncementService.getAll('STUDENT', 'MANUAL')
            ]);

            if (attRes.status === 'fulfilled') setAttendance(attRes.value.data);
            if (marksRes.status === 'fulfilled') setMarks(marksRes.value.data);
            if (leavesRes.status === 'fulfilled') setLeaves(leavesRes.value.data);
            if (annRes.status === 'fulfilled') setNotifications(annRes.value.data);
        } catch (err) { console.error('Error:', err); }
        setLoading(false);
    };

    const handleCreateLeave = async (leaveData) => {
        try {
            const headers = { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' };
            await axios.post(`${API}/leaves`, {
                student: { id: studentInfo?.id || user.id },
                ...leaveData
            }, { headers });
            fetchAllData(user);
            alert('Leave application submitted successfully!');
        } catch (err) {
            alert('Failed to submit leave application: ' + (err.response?.data?.message || err.message));
        }
    };

    const tabs = [
        {
            id: 'overview', label: 'Dashboard', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            )
        },
        {
            id: 'attendance', label: 'Attendance', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            )
        },
        {
            id: 'marks', label: 'Marks', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            )
        },
        {
            id: 'assignments', label: 'Assignments', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
            )
        },
        {
            id: 'leaves', label: 'Leaves', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            )
        },
        {
            id: 'calendar', label: 'Calendar', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: 'var(--mc-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        border: '3px solid var(--mc-border)',
                        borderTopColor: 'var(--mc-teal)',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.875rem' }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', color: 'var(--mc-text)' }}>
            {/* Top Navigation */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'var(--mc-surface)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--mc-border)'
            }}>
                <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 15px rgba(59,130,246,0.25)'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--mc-text)' }}>Student Portal</span>
                            <span style={{ fontSize: '0.5625rem', fontWeight: 600, color: 'var(--mc-text-dim)', marginLeft: '0.5rem', letterSpacing: '0.08em' }}>ACADEMIC DASHBOARD</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ThemeToggle />
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mc-text)' }}>{studentInfo?.name || user?.username}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--mc-text-muted)' }}>{studentInfo?.rollNo || 'Student'}</div>
                        </div>
                        <div style={{ width: 1, height: 24, background: 'var(--mc-border)' }} />
                        <NotificationBell />
                        <button onClick={() => { localStorage.removeItem("user"); navigator("/login"); }}
                            style={{
                                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.12)',
                                borderRadius: '0.5rem', padding: '0.375rem 0.5rem', cursor: 'pointer',
                                color: '#fb7185', display: 'flex', alignItems: 'center'
                            }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
                {/* Greeting */}
                <div className="animate-fadeInUp" style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--mc-text)', margin: '0 0 0.375rem 0' }}>
                        Welcome back, <span style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {studentInfo?.name?.split(' ')[0] || user?.username}
                        </span> 👋
                    </h1>
                    <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.9rem' }}>Here's what's happening with your academic progress.</p>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.625rem 1.25rem', borderRadius: '9999px',
                                fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap',
                                cursor: 'pointer', border: 'none',
                                background: activeTab === tab.id ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'var(--mc-card)',
                                color: activeTab === tab.id ? '#fff' : 'var(--mc-text-muted)',
                                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(59,130,246,0.25)' : 'none',
                                ...(activeTab !== tab.id ? { border: '1px solid var(--mc-border)' } : {})
                            }}>
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ minHeight: 400 }}>
                    {activeTab === 'overview' && (
                        <StudentOverview
                            attendance={attendance}
                            marks={marks}
                            leaves={leaves}
                            notifications={notifications}
                        />
                    )}

                    {activeTab === 'attendance' && (
                        <StudentAttendance attendance={attendance} />
                    )}

                    {activeTab === 'marks' && (
                        <StudentMarks marks={marks} />
                    )}

                    {activeTab === 'assignments' && (
                        <div className="animate-fadeIn">
                            <button onClick={() => navigator('/assignments')}
                                className="btn-gradient-blue"
                                style={{ width: '100%', padding: '1rem', fontSize: '0.9375rem' }}>
                                Open Full Assignment Portal →
                            </button>
                        </div>
                    )}

                    {activeTab === 'leaves' && (
                        <StudentLeaves
                            leaves={leaves}
                            onCreateLeave={handleCreateLeave}
                        />
                    )}

                    {activeTab === 'calendar' && (
                        <div className="animate-fadeIn">
                            <button onClick={() => navigator('/calendar')}
                                className="btn-gradient-blue"
                                style={{ width: '100%', padding: '1rem', fontSize: '0.9375rem' }}>
                                Open Academic Calendar →
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;

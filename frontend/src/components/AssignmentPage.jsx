import { useEffect, useState } from 'react';
import AuthService from '../services/AuthService';
import AssignmentService from '../services/AssignmentService';
import { useNavigate } from 'react-router-dom';

const S = {
    card: { background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', padding: '1.5rem' },
    pill: { borderRadius: '9999px' }, muted: { color: 'var(--mc-text-muted)', fontSize: '0.8125rem' }
};

const AssignmentPage = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [tasks, setTasks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks');
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showSubmitForm, setShowSubmitForm] = useState(null);
    const [taskForm, setTaskForm] = useState({ subject: '', title: '', description: '', deadline: '' });
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [grading, setGrading] = useState(null);
    const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
    const navigate = useNavigate();
    const isStaff = user?.roles?.includes('ROLE_STAFF');

    useEffect(() => { if (!user) { navigate('/login'); return; } fetchData(); }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'tasks') { const r = await AssignmentService.getAllTasks(); setTasks(r.data); if (!isStaff) { const s = await AssignmentService.getStudentSubmissions(user.id); setSubmissions(s.data); } }
            else if (activeTab === 'submissions' && isStaff) { const r = await AssignmentService.getAllSubmissions(); setSubmissions(r.data); }
            else if (activeTab === 'reports' && isStaff) { const r = await AssignmentService.getAnalytics(); setAnalytics(r.data); }
        } catch (e) { console.error(e); }
    };

    const handleCreateTask = async (e) => { e.preventDefault(); try { await AssignmentService.createTask(taskForm); setMsg('✅ Assignment created!'); setShowTaskForm(false); setTaskForm({ subject: '', title: '', description: '', deadline: '' }); fetchData(); } catch (err) { setMsg('❌ Failed'); } };
    const handleSubmitSubmission = async (e) => { e.preventDefault(); try { const fd = new FormData(); fd.append('studentId', user.id); fd.append('taskId', showSubmitForm); if (file) fd.append('file', file); await AssignmentService.submitAssignment(fd); setMsg('✅ Submitted!'); setShowSubmitForm(null); setFile(null); fetchData(); } catch (err) { setMsg('❌ Failed'); } };
    const handleGrade = async (id) => { try { await AssignmentService.gradeAssignment(id, gradeForm); setGrading(null); setGradeForm({ grade: '', feedback: '' }); fetchData(); } catch (e) { console.error(e); } };
    const getStatusForTask = (tid) => { const s = submissions.find(x => x.task?.id === tid); return s ? s.status : 'PENDING'; };
    const getGradeForTask = (tid) => { const s = submissions.find(x => x.task?.id === tid); return s ? s.grade : null; };
    const getFeedbackForTask = (tid) => { const s = submissions.find(x => x.task?.id === tid); return s ? s.feedback : null; };

    const sc = { SUBMITTED: { bg: 'rgba(59,130,246,0.1)', c: '#60a5fa' }, GRADED: { bg: 'rgba(34,197,94,0.1)', c: '#22c55e' }, PENDING: { bg: 'rgba(245,158,11,0.1)', c: '#f59e0b' } };
    const tabs = [{ id: 'tasks', l: isStaff ? 'Manage Tasks' : 'My Assignments' }, ...(isStaff ? [{ id: 'submissions', l: 'Review Submissions' }, { id: 'reports', l: 'Reports & Analytics' }] : [])];
    const inp = { background: 'var(--mc-bg)', border: '1px solid var(--mc-border-accent)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', color: 'var(--mc-text)', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', color: 'var(--mc-text)', padding: '2rem 1.5rem' }}>
            <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LMS — Assignment Module</h1>
                        <p style={S.muted}>{isStaff ? 'Staff Dashboard' : 'Student Dashboard'}</p>
                    </div>
                    <button onClick={() => navigate(-1)} style={{ ...S.pill, background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)', padding: '0.5rem 1.25rem', color: 'var(--mc-text)', fontSize: '0.8125rem', cursor: 'pointer' }}>← Back</button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ ...S.pill, padding: '0.625rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', border: activeTab === t.id ? 'none' : '1px solid var(--mc-border)', background: activeTab === t.id ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'var(--mc-card)', color: activeTab === t.id ? '#fff' : 'var(--mc-text-muted)', boxShadow: activeTab === t.id ? '0 4px 15px rgba(59,130,246,0.25)' : 'none' }}>{t.l}</button>)}
                </div>

                {msg && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.8125rem', background: msg.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(244,63,94,0.08)', color: msg.startsWith('✅') ? '#22c55e' : '#fb7185', border: `1px solid ${msg.startsWith('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)'}` }}>{msg}</div>}

                {activeTab === 'tasks' && (<div className="animate-fadeIn">
                    {isStaff && <div style={{ marginBottom: '1.5rem' }}>
                        <button onClick={() => setShowTaskForm(!showTaskForm)} className={showTaskForm ? '' : 'btn-gradient-blue'} style={showTaskForm ? { ...S.pill, background: 'var(--mc-card)', border: '1px solid var(--mc-border-accent)', padding: '0.625rem 1.5rem', color: 'var(--mc-text)', fontSize: '0.875rem', cursor: 'pointer' } : { padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>{showTaskForm ? '✕ Cancel' : '+ Create New Assignment'}</button>
                        {showTaskForm && <form onSubmit={handleCreateTask} style={{ ...S.card, marginTop: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginBottom: '0.375rem' }}>Subject</label><input required style={inp} value={taskForm.subject} onChange={e => setTaskForm({ ...taskForm, subject: e.target.value })} placeholder="e.g. IT" /></div>
                                <div><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginBottom: '0.375rem' }}>Title</label><input required style={inp} value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Assignment Title" /></div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginBottom: '0.375rem' }}>Description</label><textarea style={{ ...inp, minHeight: 100, resize: 'vertical', borderRadius: '0.75rem' }} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Detailed instructions..." /></div>
                            <div style={{ marginBottom: '1.25rem' }}><label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginBottom: '0.375rem' }}>Deadline</label><input type="datetime-local" style={{ ...inp, ...S.pill, width: 'auto' }} value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} /></div>
                            <button type="submit" className="btn-gradient-blue" style={{ width: '100%', padding: '0.875rem' }}>Publish Assignment</button>
                        </form>}
                    </div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.map(t => {
                            const st = getStatusForTask(t.id), gr = getGradeForTask(t.id), fb = getFeedbackForTask(t.id), cfg = sc[st] || sc.PENDING; return (
                                <div key={t.id} style={{ ...S.card, transition: 'border-color 0.2s' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{ ...S.pill, padding: '0.25rem 0.75rem', fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.subject}</span>
                                                <span style={{ ...S.pill, padding: '0.25rem 0.75rem', fontSize: '0.6875rem', fontWeight: 600, background: cfg.bg, color: cfg.c }}>{st}</span>
                                            </div>
                                            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#fff', margin: '0 0 0.375rem' }}>{t.title}</h3>
                                            <p style={{ ...S.muted, margin: '0 0 0.75rem' }}>{t.description}</p>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--mc-text-dim)' }}>
                                                <span>📅 {new Date(t.createdAt).toLocaleDateString()}</span>
                                                <span style={{ color: '#fb7185' }}>⏰ {new Date(t.deadline).toLocaleString()}</span>
                                            </div>
                                            {fb && <div style={{ marginTop: '0.75rem', padding: '0.625rem', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '0.625rem', fontSize: '0.8125rem', color: '#a78bfa', fontStyle: 'italic' }}>"{fb}"</div>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', justifyContent: 'center' }}>
                                            {gr && <div style={{ textAlign: 'center', background: 'var(--mc-bg)', padding: '0.5rem 1.25rem', borderRadius: '1rem', border: '1px solid var(--mc-border)' }}><div style={{ fontSize: '0.5625rem', color: 'var(--mc-text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Grade</div><div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e' }}>{gr}</div></div>}
                                            {!isStaff && st === 'PENDING' && <button onClick={() => setShowSubmitForm(t.id)} className="btn-gradient-blue" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>Submit Work</button>}
                                        </div>
                                    </div>
                                    {showSubmitForm === t.id && <form onSubmit={handleSubmitSubmission} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--mc-border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <input type="file" required onChange={e => setFile(e.target.files[0])} style={{ flex: 1, ...inp, borderRadius: '0.5rem' }} />
                                        <button type="submit" style={{ ...S.pill, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '0.5rem 1rem', color: '#22c55e', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>Upload</button>
                                        <button type="button" onClick={() => setShowSubmitForm(null)} style={{ background: 'none', border: 'none', color: 'var(--mc-text-muted)', cursor: 'pointer' }}>✕</button>
                                    </form>}
                                </div>
                            );
                        })}
                    </div>
                </div>)}

                {activeTab === 'submissions' && (<div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {submissions.length === 0 && <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--mc-text-dim)' }}>No submissions to review.</div>}
                    {submissions.map(s => <div key={s.id} style={S.card}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
                            <div>
                                <div style={{ marginBottom: '0.375rem' }}><strong style={{ fontSize: '1rem' }}>{s.student?.name}</strong> <span style={{ color: 'var(--mc-text-dim)', fontSize: '0.8125rem' }}>• {s.student?.department} IT</span></div>
                                <div style={{ color: '#60a5fa', fontWeight: 500, marginBottom: '0.625rem' }}>{s.title} ({s.subject})</div>
                                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--mc-text-dim)' }}><span>📎 {s.fileName || 'No file'}</span><span>🕒 {new Date(s.submittedAt).toLocaleString()}</span></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {s.status === 'SUBMITTED' ? (grading === s.id ? <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <select value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })} style={{ ...inp, width: 'auto', borderRadius: '0.5rem', padding: '0.375rem 0.5rem' }}><option value="">Grade</option><option>A</option><option>B</option><option>C</option><option>D</option><option>F</option></select>
                                    <input placeholder="Feedback" value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} style={{ ...inp, width: 120, borderRadius: '0.5rem', padding: '0.375rem 0.625rem' }} />
                                    <button onClick={() => handleGrade(s.id)} style={{ ...S.pill, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '0.375rem 0.75rem', color: '#22c55e', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}>Save</button>
                                    <button onClick={() => setGrading(null)} style={{ background: 'none', border: 'none', color: 'var(--mc-text-muted)', cursor: 'pointer' }}>✕</button>
                                </div> : <button onClick={() => setGrading(s.id)} className="btn-gradient-blue" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>Review & Grade</button>
                                ) : <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', padding: '0.5rem 0.875rem', borderRadius: '1rem' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e' }}>{s.grade}</div>
                                    <div style={{ width: 1, height: 20, background: 'rgba(34,197,94,0.2)' }} />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--mc-text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.feedback}</div>
                                </div>}
                            </div>
                        </div>
                    </div>)}
                </div>)}

                {activeTab === 'reports' && (<div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
                        {analytics.map(st => <div key={st.subject} className="mc-stat-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                            <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{st.subject} Average</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#60a5fa', marginBottom: '0.5rem' }}>{st.averageGrade.toFixed(2)}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--mc-text-dim)' }}>{st.submissionCount} Submissions</div>
                        </div>)}
                    </div>
                    <div style={S.card}>
                        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem' }}>Course Performance</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {analytics.map(st => <div key={st.subject + 'b'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}><span style={{ fontWeight: 500 }}>{st.subject}</span><span style={{ color: 'var(--mc-text-muted)' }}>{st.averageGrade.toFixed(1)} / 4.0</span></div>
                                <div style={{ width: '100%', height: 8, background: 'var(--mc-bg)', borderRadius: '9999px', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg,#3b82f6,#60a5fa)', width: `${(st.averageGrade / 4) * 100}%`, transition: 'width 1s' }} /></div>
                            </div>)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button className="btn-gradient-blue" style={{ flex: 1, minWidth: 200, padding: '0.875rem' }}>📥 Download Excel</button>
                        <button style={{ flex: 1, minWidth: 200, padding: '0.875rem', ...S.pill, background: 'linear-gradient(135deg,#f43f5e,#e11d48)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>📄 Download PDF</button>
                    </div>
                </div>)}
            </div>
        </div>
    );
};

export default AssignmentPage;

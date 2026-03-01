import { useEffect, useState } from 'react';
import AuthService from '../services/AuthService';
import AssignmentService from '../services/AssignmentService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, FileText, Download, BarChart2, Plus, X, Upload, Calendar, Paperclip, AlertCircle, TrendingUp, Filter } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isStaff = user?.roles?.includes('ROLE_STAFF');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData();
    }, [activeTab, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tasks') {
                const r = await AssignmentService.getAllTasks();
                setTasks(r.data);
                if (!isStaff) {
                    const s = await AssignmentService.getStudentSubmissions(user.id);
                    setSubmissions(s.data);
                }
            } else if (activeTab === 'submissions' && isStaff) {
                const r = await AssignmentService.getAllSubmissions();
                setSubmissions(r.data);
            } else if (activeTab === 'reports' && isStaff) {
                const r = await AssignmentService.getAnalytics();
                setAnalytics(r.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await AssignmentService.createTask(taskForm);
            setMsg('✅ Assignment created successfully.');
            setShowTaskForm(false);
            setTaskForm({ subject: '', title: '', description: '', deadline: '' });
            fetchData();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { setMsg('❌ Failed to create assignment.'); }
    };

    const handleSubmitSubmission = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('studentId', user.id);
            fd.append('taskId', showSubmitForm);
            if (file) fd.append('file', file);
            await AssignmentService.submitAssignment(fd);
            setMsg('✅ Assignment submitted successfully.');
            setShowSubmitForm(null);
            setFile(null);
            fetchData();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { setMsg('❌ Failed to submit assignment.'); }
    };

    const handleGrade = async (id) => {
        try {
            await AssignmentService.gradeAssignment(id, gradeForm);
            setGrading(null);
            setGradeForm({ grade: '', feedback: '' });
            fetchData();
            setMsg('✅ Graded successfully.');
            setTimeout(() => setMsg(''), 3000);
        } catch (e) { setMsg('❌ Failed to grade.'); }
    };

    const statusConfig = {
        SUBMITTED: { bg: 'var(--primary-dim)', c: 'var(--primary)', border: 'rgba(79, 70, 229, 0.2)', icon: <CheckCircle size={12} /> },
        GRADED: { bg: 'var(--success-dim)', c: 'var(--success)', border: 'rgba(16, 185, 129, 0.2)', icon: <CheckCircle size={12} /> },
        PENDING: { bg: 'var(--warning-dim)', c: 'var(--warning)', border: 'rgba(245, 158, 11, 0.2)', icon: <Clock size={12} /> }
    };

    const tabs = [
        { id: 'tasks', label: isStaff ? 'Curriculum' : 'Assignments', icon: <BookOpen size={16} /> },
        ...(isStaff ? [
            { id: 'submissions', label: 'Grading Queue', icon: <FileText size={16} /> },
            { id: 'reports', label: 'Analytics', icon: <BarChart2 size={16} /> }
        ] : [])
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="flex items-center gap-2"><BookOpen size={24} className="text-primary" /> Learning Management</h1>
                    <p>Track assignments, submissions, and academic performance.</p>
                </div>
                {isStaff && activeTab === 'tasks' && (
                    <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn-primary flex items-center gap-2">
                        {showTaskForm ? <X size={18} /> : <Plus size={18} />} {showTaskForm ? 'Cancel' : 'Create Task'}
                    </button>
                )}
            </div>

            <div className="p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start mb-2" style={{ background: 'var(--primary-dim)', border: '1px solid var(--border)' }}>
                <div className="p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-shrink-0" style={{ background: 'var(--bg-surface)' }}>
                    <BookOpen size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>Adaptive Theme & Enterprise Experience</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        The Learning Management module now features an adaptive, theme-aware interface with enterprise-grade UI standards. The system dynamically adjusts contrast, typography, and component elevation to ensure optimal accessibility and readability in both light and dark modes. This enhancement improves user experience, engagement, and usability while aligning the platform with global SaaS product design principles.
                    </p>
                </div>
            </div>

            <div className="tab-group w-full sm:w-auto p-1 rounded-2xl border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`tab-btn flex items-center justify-center gap-2 px-6 py-2.5 !rounded-xl transition-all ${activeTab === t.id ? 'active' : ''}`}
                        style={activeTab === t.id ? { background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' } : {}}>
                        {t.icon} <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {msg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className={`toast p-4 flex items-center gap-3 ${msg.includes('✅') ? 'toast-success' : 'toast-error'}`}>
                        {msg.includes('✅') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="font-bold text-sm">{msg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {activeTab === 'tasks' && (
                <div className="space-y-6">
                    <AnimatePresence>
                        {showTaskForm && (
                            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                onSubmit={handleCreateTask} className="md-card p-6 border-2 border-primary/20 bg-primary/5 space-y-4 overflow-hidden">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary"><Plus size={16} /> New Assignment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-60">Subject Area</label>
                                        <input required className="pill-input-dark !rounded-xl text-xs" placeholder="e.g. Physics" value={taskForm.subject} onChange={e => setTaskForm({ ...taskForm, subject: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-60">Task Title</label>
                                        <input required className="pill-input-dark !rounded-xl text-xs" placeholder="Title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-60">Submission Deadline</label>
                                        <input required type="datetime-local" className="pill-input-dark !rounded-xl text-xs" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-60">Detailed Instructions</label>
                                    <textarea required rows={3} className="pill-input-dark !rounded-xl text-xs min-h-[100px]" placeholder="Add details..." value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                                </div>
                                <div className="flex justify-end pt-4 border-t border-primary/10">
                                    <button type="submit" className="btn-primary !py-2 !px-8">Publish Task</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => <div key={i} className="skeleton-loading h-48 rounded-2xl" />)}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="md-card py-20 text-center opacity-50">
                            <BookOpen size={48} className="mx-auto mb-4" />
                            <h3 className="font-bold">No tasks assigned</h3>
                            <p className="text-xs">Enjoy your free time!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {tasks.map(t => {
                                const sub = submissions.find(x => x.task?.id === t.id);
                                const st = sub ? sub.status : 'PENDING';
                                const cfg = statusConfig[st] || statusConfig.PENDING;
                                return (
                                    <motion.div key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="md-card p-5 group hover:border-primary/40 transition-all flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
                                                {t.subject}
                                            </span>
                                            {!isStaff && (
                                                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                                                    style={{ background: cfg.bg, color: cfg.c, borderColor: cfg.border }}>
                                                    {cfg.icon} {st}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors">{t.title}</h3>
                                        <p className="text-xs opacity-60 line-clamp-2 mb-6 flex-grow">{t.description}</p>

                                        <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                            <div className="flex justify-between items-center text-[10px] font-bold opacity-60">
                                                <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(t.createdAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5 text-danger"><Clock size={12} /> {new Date(t.deadline).toLocaleDateString()}</span>
                                            </div>

                                            {!isStaff && st === 'PENDING' && showSubmitForm !== t.id && (
                                                <button onClick={() => setShowSubmitForm(t.id)} className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-2 !rounded-xl">
                                                    <Upload size={14} /> Submit Work
                                                </button>
                                            )}

                                            {showSubmitForm === t.id && (
                                                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmitSubmission}
                                                    className="p-3 rounded-xl border border-dashed border-primary/30 space-y-3" style={{ background: 'var(--bg-elevated)' }}>
                                                    <input type="file" required onChange={e => setFile(e.target.files[0])} className="text-[10px] w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 file:text-primary file:font-bold" />
                                                    <div className="flex gap-2">
                                                        <button type="submit" className="btn-primary flex-1 text-xs py-1.5 !rounded-lg">Upload</button>
                                                        <button type="button" onClick={() => setShowSubmitForm(null)} className="p-1.5 rounded-lg border transition-colors hover:bg-primary/10" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}><X size={14} /></button>
                                                    </div>
                                                </motion.form>
                                            )}

                                            {sub?.grade && (
                                                <div className="p-3 rounded-xl bg-success-dim border border-success/20 flex items-center justify-between">
                                                    <div>
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-success block opacity-80">Final Grade</label>
                                                        <p className="text-xs italic opacity-60 truncate max-w-[150px]">{sub.feedback || 'Excellent work!'}</p>
                                                    </div>
                                                    <div className="text-xl font-black text-success pr-2">{sub.grade}</div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'submissions' && isStaff && (
                <div className="space-y-4">
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="skeleton-loading h-24 rounded-xl" />)
                    ) : submissions.length === 0 ? (
                        <div className="md-card py-20 text-center opacity-50">
                            <FileText size={48} className="mx-auto mb-4" />
                            <h3 className="font-bold">No submissions found</h3>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map(s => (
                                <div key={s.id} className="md-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white" style={{ background: 'var(--gradient-primary)' }}>
                                            {s.student?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-sm">{s.student?.name}</h4>
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{s.student?.department}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-bold opacity-60">
                                                <span className="flex items-center gap-1.5 text-primary"><BookOpen size={12} /> {s.title}</span>
                                                <span className="flex items-center gap-1.5"><Paperclip size={12} /> {s.fileName || 'Archive.zip'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-6" style={{ borderColor: 'var(--border)' }}>
                                        {s.status === 'SUBMITTED' ? (
                                            grading === s.id ? (
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <select value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })} className="pill-input-dark !py-1.5 !px-3 text-xs min-w-[80px]">
                                                        <option value="">Grade</option>
                                                        <option value="A+">A+</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="F">F</option>
                                                    </select>
                                                    <input placeholder="Short feedback..." value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} className="pill-input-dark !py-1.5 px-3 text-xs flex-1 sm:w-48" />
                                                    <button onClick={() => handleGrade(s.id)} className="btn-primary py-1.5 px-4 text-xs">Save</button>
                                                    <button onClick={() => setGrading(null)} className="p-1.5 rounded-lg border transition-colors hover:bg-primary/10" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setGrading(s.id)} className="btn-primary !py-2 !px-6 text-xs flex items-center gap-2">
                                                    <TrendingUp size={14} /> Grade Work
                                                </button>
                                            )
                                        ) : (
                                            <div className="flex items-center gap-5 bg-success-dim border border-success/20 px-5 py-2.5 rounded-2xl">
                                                <div className="text-2xl font-black text-success">{s.grade}</div>
                                                <div className="text-[10px] italic font-semibold opacity-60 max-w-[200px] leading-tight text-right">
                                                    {s.feedback || 'Successfully validated.'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'reports' && isStaff && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton-loading h-32 rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {analytics.map(st => (
                                        <div key={st.subject} className="md-card p-6 border-b-4 border-primary/20">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">{st.subject}</label>
                                            <div className="flex justify-between items-end">
                                                <div className="text-3xl font-black text-primary tracking-tighter">{st.averageGrade.toFixed(2)}</div>
                                                <div className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">
                                                    {st.submissionCount} submissions
                                                </div>
                                            </div>
                                            <div className="mt-4 w-full h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${(st.averageGrade / 100) * 100}%` }} className="h-full bg-primary rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-1 space-y-4">
                                <div className="md-card p-6 bg-primary/5 border border-primary/10">
                                    <h3 className="font-bold text-sm mb-4">Export Reports</h3>
                                    <div className="space-y-2">
                                        <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:border-primary transition-all group" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                            <span className="text-xs font-bold opacity-60">Full Academic Excel</span>
                                            <Download size={16} className="text-primary group-hover:scale-110 transition-transform" />
                                        </button>
                                        <button className="w-full flex items-center justify-between p-3 rounded-xl border hover:border-primary transition-all group" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                            <span className="text-xs font-bold opacity-60">Performance PDF</span>
                                            <FileText size={16} className="text-danger group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignmentPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { listStudents } from '../services/StudentService';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';

const MarkComponent = () => {
    const user = AuthService.getCurrentUser();
    const isStudent = user?.roles?.includes('ROLE_STUDENT');

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [subject, setSubject] = useState('');
    const [examType, setExamType] = useState('Internal');
    const [marksObtained, setMarksObtained] = useState('');
    const [maxMarks, setMaxMarks] = useState('50');
    const [message, setMessage] = useState('');

    // Student specific states
    const [myMarks, setMyMarks] = useState([]);
    const [loadingMarks, setLoadingMarks] = useState(isStudent);

    useEffect(() => {
        if (!isStudent) {
            listStudents().then(r => setStudents(r.data)).catch(console.error);
        } else {
            setLoadingMarks(true);
            axios.get('http://localhost:8080/api/marks/student/me', { headers: AuthService.authHeader() })
                .then(r => setMyMarks(r.data))
                .catch(console.error)
                .finally(() => setLoadingMarks(false));
        }
    }, [isStudent]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8080/api/marks', {
            student: { id: selectedStudent }, subject, examType, marksObtained, maxMarks
        }, { headers: AuthService.authHeader() })
            .then(() => {
                setMessage('success');
                setSubject('');
                setMarksObtained('');
                setTimeout(() => setMessage(''), 4000);
            })
            .catch(() => {
                setMessage('error');
                setTimeout(() => setMessage(''), 4000);
            });
    };

    const pct = maxMarks ? Math.round((marksObtained / maxMarks) * 100) : 0;

    const getGrade = (p) => {
        if (p >= 90) return { label: 'A+', color: 'var(--success)' };
        if (p >= 80) return { label: 'A', color: 'var(--success)' };
        if (p >= 70) return { label: 'B', color: 'var(--info)' };
        if (p >= 60) return { label: 'C', color: 'var(--warning)' };
        if (p >= 50) return { label: 'D', color: 'var(--warning)' };
        return { label: 'F', color: 'var(--danger)' };
    };

    const grade = marksObtained ? getGrade(pct) : null;

    const renderStudentView = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md-card p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-sm font-bold">My Academic Performance</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Subject-wise marks, grades, and assessment results.</p>
            </div>
            <div className="p-0 overflow-x-auto">
                {loadingMarks ? (
                    <div className="p-8 text-center text-xs opacity-50">Synchronizing records...</div>
                ) : myMarks.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center opacity-50">
                        <AlertCircle size={32} className="mb-3 opacity-50" />
                        <h4 className="font-bold mb-1">No Academic Records</h4>
                        <p className="text-xs">Your assessment scores haven't been published yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-widest bg-slate-50/30 dark:bg-slate-900/20" style={{ color: 'var(--text-muted)' }}>
                                <th className="p-4 font-semibold">Assessment / Subject</th>
                                <th className="p-4 font-semibold text-center">Score details</th>
                                <th className="p-4 font-semibold text-right">Achieved Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myMarks.map((m, i) => {
                                const m_pct = m.maxMarks ? Math.round((m.marksObtained / m.maxMarks) * 100) : 0;
                                const m_grade = m.marksObtained !== null ? getGrade(m_pct) : { label: 'AB', color: 'var(--text-muted)' };

                                return (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-sm mb-0.5">{m.subject}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50">{m.examType}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {m.marksObtained !== null ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="font-black text-lg leading-none">{m.marksObtained}<span className="text-xs opacity-40 font-bold ml-0.5">/{m.maxMarks}</span></span>
                                                    <div className="w-24 h-1.5 rounded-full mt-2 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                                        <div className="h-full rounded-full" style={{ width: `${m_pct}%`, background: m_grade.color }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="font-bold opacity-50 text-xs uppercase tracking-widest">Absent</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black text-white shadow-sm"
                                                style={{ background: m_grade.color, boxShadow: `0 4px 12px ${m_grade.color}40` }}>
                                                {m_grade.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    );

    const renderAdminView = () => (
        <div className="max-w-lg mx-auto">
            {/* Toast */}
            {message && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className={`toast mb-5 ${message === 'success' ? 'toast-success' : 'toast-error'}`}>
                    {message === 'success' ? <><CheckCircle2 size={16} /> Marks recorded successfully!</> : '❌ Failed to save marks.'}
                </motion.div>
            )}

            {/* Form Card */}
            <div className="md-card p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Student */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Student *</label>
                        <select required value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="pill-input-dark">
                            <option value="">Select Student</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.course})</option>)}
                        </select>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject *</label>
                        <input type="text" required className="pill-input-dark" placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} />
                    </div>

                    {/* Exam Type */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Exam Type</label>
                        <select value={examType} onChange={e => setExamType(e.target.value)} className="pill-input-dark">
                            <option value="Internal">Internal</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Final">Final</option>
                        </select>
                    </div>

                    {/* Marks Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Marks Obtained *</label>
                            <input type="number" required min="0" className="pill-input-dark" value={marksObtained} placeholder="0" onChange={e => setMarksObtained(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Max Marks *</label>
                            <input type="number" required min="1" className="pill-input-dark" value={maxMarks} placeholder="50" onChange={e => setMaxMarks(e.target.value)} />
                        </div>
                    </div>

                    {/* Live Grade Preview */}
                    {marksObtained && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-4 rounded-xl flex items-center justify-between"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Score Preview</p>
                                <div className="progress-bar" style={{ width: 160 }}>
                                    <div className="progress-fill" style={{ width: `${pct}%`, background: grade?.color }} />
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{marksObtained}/{maxMarks} — {pct}%</p>
                            </div>
                            {grade && (
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white"
                                    style={{ background: grade.color, boxShadow: `0 4px 12px ${grade.color}40` }}>
                                    {grade.label}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Submit */}
                    <button type="submit" className="btn-primary w-full !py-3">
                        <BarChart3 size={16} /> Save Marks
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div className={isStudent ? "max-w-4xl mx-auto" : "max-w-lg mx-auto"}>
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={16} style={{ color: 'var(--primary)' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Academic Assessment</span>
                </div>
                <h1 className="flex items-center gap-2">
                    <BookOpen size={22} style={{ color: 'var(--primary)' }} />
                    {isStudent ? 'Marks & Grades' : 'Enter Marks'}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {isStudent
                        ? 'View your academic performance, subject grades, and assessment results.'
                        : 'Record student assessment scores for the grading system.'}
                </p>
            </div>

            {/* Content Switcher */}
            {isStudent ? renderStudentView() : renderAdminView()}
        </div>
    );
};

export default MarkComponent;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { listStudents } from '../services/StudentService';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, CheckCircle2 } from 'lucide-react';

const MarkComponent = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [subject, setSubject] = useState('');
    const [examType, setExamType] = useState('Internal');
    const [marksObtained, setMarksObtained] = useState('');
    const [maxMarks, setMaxMarks] = useState('50');
    const [message, setMessage] = useState('');

    useEffect(() => {
        listStudents().then(r => setStudents(r.data)).catch(console.error);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = AuthService.getCurrentUser();
        axios.post('http://localhost:8080/api/marks', {
            student: { id: selectedStudent }, subject, examType, marksObtained, maxMarks
        }, { headers: { Authorization: `Bearer ${user.token}` } })
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

    return (
        <div className="max-w-lg mx-auto">
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={16} style={{ color: 'var(--primary)' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Assessment</span>
                </div>
                <h1 className="flex items-center gap-2">
                    <BookOpen size={22} style={{ color: 'var(--primary)' }} /> Enter Marks
                </h1>
                <p>Record student assessment scores for the grading system.</p>
            </div>

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
};

export default MarkComponent;

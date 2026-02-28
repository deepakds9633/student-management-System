import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { listStudents } from '../services/StudentService';

const MarkComponent = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [subject, setSubject] = useState('');
    const [examType, setExamType] = useState('Internal');
    const [marksObtained, setMarksObtained] = useState('');
    const [maxMarks, setMaxMarks] = useState('50');
    const [message, setMessage] = useState('');

    useEffect(() => {
        listStudents().then((response) => {
            setStudents(response.data);
        }).catch(error => console.error(error));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = AuthService.getCurrentUser();
        axios.post('http://localhost:8080/api/marks', {
            student: { id: selectedStudent },
            subject,
            examType,
            marksObtained,
            maxMarks
        }, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(response => {
                setMessage('Marks added successfully!');
                setSubject('');
                setMarksObtained('');
            })
            .catch(error => {
                console.error(error);
                setMessage('Error adding marks');
            });
    };

    return (
        <div className="light-page" style={{
            minHeight: '100vh', background: '#f5f5f7', padding: '2rem 1rem'
        }}>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                        fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0',
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Enter Internal Marks
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Record student assessment scores</p>
                </div>

                {/* Card */}
                <div style={{
                    background: '#fff', borderRadius: '1.5rem', padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.04)'
                }}>
                    {/* Section Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Assessment Entry</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Student Select */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>
                                Student
                            </label>
                            <select
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                required
                                style={{
                                    width: '100%', padding: '0.875rem 1rem',
                                    border: '1.5px solid #e2e8f0', borderRadius: '9999px',
                                    fontSize: '0.875rem', color: '#1e293b', background: '#fff',
                                    outline: 'none', appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 1rem center'
                                }}
                            >
                                <option value="">Select Student</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.course})</option>)}
                            </select>
                        </div>

                        {/* Subject */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>
                                Subject
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                                </div>
                                <input
                                    type="text" className="pill-input"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Mathematics"
                                    required
                                />
                            </div>
                        </div>

                        {/* Exam Type */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>
                                Exam Type
                            </label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.875rem 1rem',
                                    border: '1.5px solid #e2e8f0', borderRadius: '9999px',
                                    fontSize: '0.875rem', color: '#1e293b', background: '#fff',
                                    outline: 'none', appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 1rem center'
                                }}
                            >
                                <option value="Internal">Internal</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Final">Final</option>
                            </select>
                        </div>

                        {/* Marks Row */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>
                                    Marks Obtained
                                </label>
                                <input
                                    type="number" className="pill-input"
                                    value={marksObtained}
                                    onChange={(e) => setMarksObtained(e.target.value)}
                                    placeholder="0"
                                    required
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>
                                    Max Marks
                                </label>
                                <input
                                    type="number" className="pill-input"
                                    value={maxMarks}
                                    onChange={(e) => setMaxMarks(e.target.value)}
                                    placeholder="50"
                                    required
                                    style={{ paddingLeft: '1rem' }}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="btn-gradient-purple" style={{ width: '100%', padding: '0.9rem' }}>
                            Save Marks ➤
                        </button>

                        {/* Message */}
                        {message && (
                            <div style={{
                                marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                textAlign: 'center', fontSize: '0.8125rem',
                                background: message.includes('Error') ? 'rgba(244,63,94,0.08)' : 'rgba(34,197,94,0.08)',
                                color: message.includes('Error') ? '#e11d48' : '#16a34a',
                                border: `1px solid ${message.includes('Error') ? 'rgba(244,63,94,0.15)' : 'rgba(34,197,94,0.15)'}`
                            }}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MarkComponent;

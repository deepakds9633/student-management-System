import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { listStudents } from '../services/StudentService';

const AttendanceComponent = () => {
    const [students, setStudents] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
    const [message, setMessage] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [courseFilter, setCourseFilter] = useState('ALL');

    useEffect(() => {
        listStudents().then((response) => {
            setStudents(response.data);
        }).catch(error => console.error(error));
    }, []);

    const markAttendance = (studentId, status) => {
        const user = AuthService.getCurrentUser();
        axios.post('http://localhost:8080/api/attendance', {
            student: { id: studentId },
            date: attendanceDate,
            status: status
        }, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(response => {
                setMessage(`Marked ${status} for student ID: ${studentId}`);
                setTimeout(() => setMessage(''), 3000);
            })
            .catch(error => {
                console.error(error);
                setMessage('Error marking attendance');
            });
    };

    const markBulkAttendance = (status) => {
        if (selectedIds.size === 0) return;
        const user = AuthService.getCurrentUser();
        const payload = Array.from(selectedIds).map(id => ({
            student: { id },
            date: attendanceDate,
            status: status
        }));

        axios.post('http://localhost:8080/api/attendance/bulk', payload, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(() => {
                setMessage(`Successfully marked ${status} for ${selectedIds.size} students`);
                setSelectedIds(new Set()); // clear selection
                setTimeout(() => setMessage(''), 3000);
            })
            .catch(error => {
                console.error(error);
                setMessage('Error processing bulk attendance');
            });
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const courses = [...new Set(students.map(s => s.course))].filter(Boolean);
    const filteredStudents = students.filter(s => courseFilter === 'ALL' || s.course === courseFilter);

    const toggleAll = () => {
        if (selectedIds.size === filteredStudents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredStudents.map(s => s.id)));
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', padding: '2rem 1.5rem', color: 'var(--mc-text)', position: 'relative' }}>
            <div style={{ maxWidth: '56rem', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>📅 Attendance Entry</h2>
                        <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>Automated bulk selection and tracking</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>FILTER CLASS/COURSE</label>
                        <select
                            value={courseFilter}
                            onChange={(e) => {
                                setCourseFilter(e.target.value);
                                setSelectedIds(new Set()); // reset selection when changing filters
                            }}
                            className="pill-input-dark"
                            style={{ height: '38px', padding: '0 1rem' }}
                        >
                            <option value="ALL">All Courses</option>
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>DATE</label>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="pill-input-dark"
                            style={{ height: '38px', padding: '0 1rem', maxWidth: 180 }}
                        />
                    </div>
                </div>

                {/* Message Overlay */}
                {message && (
                    <div className="animate-fadeIn" style={{
                        marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                        fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: message.includes('Error') ? 'rgba(244,63,94,0.08)' : 'rgba(34,197,94,0.08)',
                        color: message.includes('Error') ? '#fb7185' : '#22c55e',
                        border: `1px solid ${message.includes('Error') ? 'rgba(244,63,94,0.15)' : 'rgba(34,197,94,0.15)'}`
                    }}>
                        {message}
                    </div>
                )}

                {/* Table */}
                <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', overflow: 'hidden' }}>

                    {/* Bulk Action Header attached to top of table */}
                    <div style={{
                        padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--mc-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: selectedIds.size > 0 ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        transition: 'background 0.2s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="checkbox"
                                checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length}
                                onChange={toggleAll}
                                style={{ accentColor: '#3b82f6', width: 16, height: 16, cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: selectedIds.size > 0 ? '#60a5fa' : 'var(--mc-text-muted)', fontWeight: 500 }}>
                                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select All'}
                            </span>
                        </div>

                        {/* Bulk Actions fade in when selected */}
                        {selectedIds.size > 0 && (
                            <div className="animate-fadeIn" style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => markBulkAttendance('Present')} className="btn-gradient-blue" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '999px' }}>
                                    Mark Present
                                </button>
                                <button onClick={() => markBulkAttendance('Absent')} style={{
                                    background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(225,29,72,0.1))',
                                    border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185',
                                    padding: '0.4rem 1rem', fontSize: '0.75rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 600
                                }}>
                                    Mark Absent
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--mc-border)' }}>
                                    <th style={{ width: 40, padding: '0.75rem 0 0.75rem 1.25rem' }}></th>
                                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Name</th>
                                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Course</th>
                                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Individual Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            background: selectedIds.has(student.id) ? 'rgba(255,255,255,0.03)' : 'transparent',
                                            transition: 'background 0.1s'
                                        }}
                                        onMouseEnter={e => { if (!selectedIds.has(student.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                        onMouseLeave={e => { if (!selectedIds.has(student.id)) e.currentTarget.style.background = 'transparent' }}
                                    >
                                        <td style={{ padding: '0.75rem 0 0.75rem 1.25rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(student.id)}
                                                onChange={() => toggleSelection(student.id)}
                                                style={{ accentColor: '#3b82f6', width: 16, height: 16, cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%',
                                                    background: 'rgba(0,229,200,0.1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.6875rem', fontWeight: 700, color: '#00e5c8', flexShrink: 0
                                                }}>
                                                    {student.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{student.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem', color: 'var(--mc-text-muted)' }}>{student.course}</td>
                                        <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', opacity: selectedIds.size > 0 ? 0.3 : 1, pointerEvents: selectedIds.size > 0 ? 'none' : 'auto' }}>
                                                <button onClick={() => markAttendance(student.id, 'Present')}
                                                    style={{
                                                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                                        borderRadius: '0.375rem', padding: '0.25rem 0.5rem',
                                                        color: '#22c55e', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer'
                                                    }}>
                                                    Present
                                                </button>
                                                <button onClick={() => markAttendance(student.id, 'Absent')}
                                                    style={{
                                                        background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                                                        borderRadius: '0.375rem', padding: '0.25rem 0.5rem',
                                                        color: '#fb7185', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer'
                                                    }}>
                                                    Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredStudents.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--mc-text-dim)', fontSize: '0.8125rem' }}>
                                No students found for this filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceComponent;

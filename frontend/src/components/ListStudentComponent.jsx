import React, { useEffect, useState } from 'react'
import { deleteStudent, listStudents } from '../services/StudentService'
import { useNavigate } from 'react-router-dom'

const ListStudentComponent = () => {
    const [students, setStudents] = useState([])
    const navigator = useNavigate();

    useEffect(() => { getAllStudents(); }, [])

    function getAllStudents() {
        listStudents().then(r => setStudents(r.data)).catch(e => console.error(e))
    }
    function addNewStudent() { navigator('/add-student') }
    function updateStudent(id) { navigator(`/edit-student/${id}`) }
    function removeStudent(id) { deleteStudent(id).then(() => getAllStudents()).catch(e => console.error(e)) }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', padding: '2rem 1.5rem', color: 'var(--mc-text)' }}>
            <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>👥 Student Registry</h2>
                    <button className="btn-gradient-blue" onClick={addNewStudent} style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>+ Add Student</button>
                </div>

                <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', overflow: 'hidden' }}>
                    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--mc-border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--mc-text-muted)' }}>{students.length} students found</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--mc-border)' }}>
                                    {['ID', 'Name', 'Email', 'Course', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--mc-text-dim)', fontWeight: 600 }}>#{s.id}</td>
                                        <td style={{ padding: '0.875rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,229,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#00e5c8', flexShrink: 0 }}>
                                                    {s.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{s.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--mc-text-muted)' }}>{s.email}</td>
                                        <td style={{ padding: '0.875rem 1.25rem' }}>
                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>{s.course}</span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1.25rem' }}>
                                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                <button onClick={() => updateStudent(s.id)} style={{ width: 32, height: 32, borderRadius: '0.5rem', border: 'none', background: 'rgba(255,255,255,0.04)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                </button>
                                                <button onClick={() => removeStudent(s.id)} style={{ width: 32, height: 32, borderRadius: '0.5rem', border: 'none', background: 'rgba(255,255,255,0.04)', color: '#fb7185', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListStudentComponent

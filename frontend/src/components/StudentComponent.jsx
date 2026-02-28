import React, { useState, useEffect } from 'react'
import { createStudent, getStudent, updateStudent } from '../services/StudentService'
import { useNavigate, useParams } from 'react-router-dom'

const StudentComponent = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [course, setCourse] = useState('')
    const { id } = useParams();
    const [errors, setErrors] = useState({ name: '', email: '', course: '' })
    const navigator = useNavigate();

    useEffect(() => {
        if (id) {
            getStudent(id).then(r => { setName(r.data.name); setEmail(r.data.email); setCourse(r.data.course); }).catch(e => console.error(e))
        }
    }, [id])

    function saveOrUpdateStudent(e) {
        e.preventDefault();
        if (validateForm()) {
            const student = { name, email, course }
            if (id) { updateStudent(id, student).then(() => navigator('/students')).catch(e => console.error(e)) }
            else { createStudent(student).then(() => navigator('/students')).catch(e => console.error(e)) }
        }
    }

    function validateForm() {
        let valid = true;
        const ec = { ...errors }
        if (!name.trim()) { ec.name = 'Name is required'; valid = false; } else ec.name = '';
        if (!email.trim()) { ec.email = 'Email is required'; valid = false; } else ec.email = '';
        if (!course.trim()) { ec.course = 'Course is required'; valid = false; } else ec.course = '';
        setErrors(ec);
        return valid;
    }

    const fields = [
        { label: 'Name', value: name, set: setName, err: errors.name, placeholder: 'Enter Student Name', icon: '👤' },
        { label: 'Email', value: email, set: setEmail, err: errors.email, placeholder: 'Enter Student Email', icon: '✉️' },
        { label: 'Course', value: course, set: setCourse, err: errors.course, placeholder: 'Enter Student Course', icon: '📚' },
    ];

    return (
        <div className="light-page" style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 480, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                        fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>{id ? 'Update Student' : 'Add Student'}</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{id ? 'Modify student details' : 'Register a new student profile'}</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <form>
                        {fields.map((f, i) => (
                            <div key={i} style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem' }}>
                                    {f.icon} {f.label}
                                </label>
                                <input
                                    type="text" className="pill-input"
                                    placeholder={f.placeholder}
                                    value={f.value}
                                    onChange={e => f.set(e.target.value)}
                                    style={{ borderColor: f.err ? '#f43f5e' : undefined }}
                                />
                                {f.err && <p style={{ color: '#e11d48', fontSize: '0.75rem', marginTop: '0.25rem' }}>{f.err}</p>}
                            </div>
                        ))}
                        <button className="btn-gradient-blue" onClick={saveOrUpdateStudent}
                            style={{ width: '100%', padding: '0.9rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
                            {id ? 'Update Student' : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default StudentComponent

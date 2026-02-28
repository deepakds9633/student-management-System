import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';
import { listStudents } from '../services/StudentService';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Users, Calendar, Filter, ChevronDown, Check, Info } from 'lucide-react';

const AttendanceComponent = () => {
    const [students, setStudents] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
    const [message, setMessage] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [courseFilter, setCourseFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        listStudents().then((response) => {
            setStudents(response.data);
        }).catch(error => console.error(error))
            .finally(() => setLoading(false));
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
            .then(() => {
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
                setSelectedIds(new Set());
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
        if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredStudents.map(s => s.id)));
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="flex items-center gap-2">
                        <Calendar size={22} style={{ color: 'var(--primary)' }} /> Attendance Entry
                    </h1>
                    <p>Automated bulk selection and tracking for institutional attendance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Session Date</label>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="pill-input-dark !py-1.5 !px-3 text-xs"
                            style={{ width: '150px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Toolbar / Filters */}
            <div className="md-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-mc-text-muted" size={14} />
                        <select
                            value={courseFilter}
                            onChange={(e) => {
                                setCourseFilter(e.target.value);
                                setSelectedIds(new Set());
                            }}
                            className="pill-input-dark !pl-9 !py-2 text-sm appearance-none"
                        >
                            <option value="ALL">All Courses</option>
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={14} />
                    </div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                        {filteredStudents.length} Students found
                    </p>
                </div>

                <AnimatePresence>
                    {selectedIds.size > 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-2 w-full sm:w-auto p-1.5 rounded-xl border border-primary/20 bg-primary/5">
                            <span className="text-[10px] font-black uppercase px-2 text-primary">{selectedIds.size} Selected</span>
                            <div className="h-4 w-[1px] bg-primary/20 mx-1" />
                            <button
                                onClick={() => markBulkAttendance('Present')}
                                className="btn-primary !py-1.5 !px-4 text-[10px] !rounded-lg flex items-center gap-1.5"
                            >
                                <CheckCircle2 size={12} /> Mark Present
                            </button>
                            <button
                                onClick={() => markBulkAttendance('Absent')}
                                className="btn-secondary !py-1.5 !px-4 text-[10px] !rounded-lg !border-danger/30 !text-danger hover:!bg-danger/10 flex items-center gap-1.5"
                            >
                                <XCircle size={12} /> Mark Absent
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Message */}
            <AnimatePresence>
                {message && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className={`toast flex items-center gap-3 ${message.includes('Error') ? 'toast-error' : 'toast-success'}`}>
                        <Info size={16} />
                        <span className="font-bold">{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table Area */}
            <div className="md-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="!w-12 !pr-0">
                                    <div
                                        onClick={toggleAll}
                                        className="w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center transition-all mx-auto"
                                        style={{
                                            borderColor: selectedIds.size > 0 ? 'var(--primary)' : 'var(--border-strong)',
                                            background: filteredStudents.length > 0 && selectedIds.size === filteredStudents.length ? 'var(--primary)' : 'transparent'
                                        }}
                                    >
                                        {filteredStudents.length > 0 && selectedIds.size === filteredStudents.length && <Check size={12} className="text-white" />}
                                        {selectedIds.size > 0 && selectedIds.size < filteredStudents.length && <div className="w-2.5 h-0.5 bg-primary rounded-full" />}
                                    </div>
                                </th>
                                <th>Student Name</th>
                                <th>Course / Section</th>
                                <th className="text-right">Individual Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={4} className="p-4">
                                            <div className="skeleton-loading h-10 w-full rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id}
                                        className={`transition-colors duration-150 ${selectedIds.has(student.id) ? 'bg-primary/5' : ''}`}
                                        onClick={() => toggleSelection(student.id)}
                                    >
                                        <td className="!pr-0" onClick={e => e.stopPropagation()}>
                                            <div
                                                onClick={() => toggleSelection(student.id)}
                                                className="w-5 h-5 rounded-md border-2 cursor-pointer flex items-center justify-center transition-all mx-auto"
                                                style={{
                                                    borderColor: selectedIds.has(student.id) ? 'var(--primary)' : 'var(--border)',
                                                    background: selectedIds.has(student.id) ? 'var(--primary)' : 'transparent'
                                                }}
                                            >
                                                {selectedIds.has(student.id) && <Check size={12} className="text-white" />}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
                                                    style={{ background: 'var(--gradient-primary)' }}>
                                                    {student.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-sm">{student.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-secondary-dim text-secondary border border-secondary/10"
                                                style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                                                {student.course}
                                            </span>
                                        </td>
                                        <td className="text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => markAttendance(student.id, 'Present')}
                                                    className="p-1 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border border-success/30 text-success hover:bg-success/10 transition-all"
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    onClick={() => markAttendance(student.id, 'Absent')}
                                                    className="p-1 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border border-danger/30 text-danger hover:bg-danger/10 transition-all"
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-base mx-auto mb-4 flex items-center justify-center text-4xl grayscale opacity-50 border border-slate-200 dark:border-slate-800">
                                            👥
                                        </div>
                                        <h3 className="font-bold opacity-60">No students found</h3>
                                        <p className="text-xs opacity-40">Try adjusting your filters or search criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceComponent;

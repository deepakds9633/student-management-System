import React, { useEffect, useState } from 'react';
import { deleteStudent, listStudents } from '../services/StudentService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit2, Trash2, Users, GraduationCap,
    ChevronLeft, ChevronRight, Eye, Hash
} from 'lucide-react';

const ListStudentComponent = () => {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const navigator = useNavigate();

    useEffect(() => { getAllStudents(); }, []);

    const getAllStudents = () => {
        setLoading(true);
        listStudents().then(r => { setStudents(r.data); setLoading(false); }).catch(() => setLoading(false));
    };

    const addNewStudent = () => navigator('/add-student');
    const updateStudent = (id) => navigator(`/edit-student/${id}`);
    const viewProfile = (id) => navigator(`/students/${id}`);

    const removeStudent = (id) => {
        if (window.confirm("Remove this student?")) {
            deleteStudent(id).then(() => getAllStudents()).catch(console.error);
        }
    };

    const filtered = students.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.course?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginate = (p) => setCurrentPage(p);

    const gradients = [
        'linear-gradient(135deg,#6366f1,#a855f7)',
        'linear-gradient(135deg,#06b6d4,#3b82f6)',
        'linear-gradient(135deg,#10b981,#059669)',
        'linear-gradient(135deg,#f59e0b,#ef4444)',
        'linear-gradient(135deg,#ec4899,#d946ef)',
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="flex items-center gap-2">
                        <Users size={24} style={{ color: 'var(--primary)' }} />
                        Student Directory
                    </h1>
                    <p>Manage, search, and update student records.</p>
                </div>
                <button onClick={addNewStudent} className="btn-primary shrink-0">
                    <Plus size={16} /> Add Student
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="stat-card flex items-center gap-4">
                    <div className="icon-chip chip-primary"><Users size={18} className="text-white" /></div>
                    <div>
                        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{students.length}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Enrolled</p>
                    </div>
                </div>
                <div className="stat-card flex items-center gap-4">
                    <div className="icon-chip chip-success"><GraduationCap size={18} className="text-white" /></div>
                    <div>
                        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                            {[...new Set(students.map(s => s.course))].length}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Unique Courses</p>
                    </div>
                </div>
                <div className="stat-card hidden sm:flex items-center gap-4">
                    <div className="icon-chip chip-accent"><Hash size={18} className="text-white" /></div>
                    <div>
                        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{filtered.length}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Showing</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="md-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or course..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="pill-input-dark !pl-9 !py-2 !rounded-xl w-full"
                    />
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
                </div>
            </div>

            {/* Table */}
            <div className="md-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th className="hidden md:table-cell">Email</th>
                                <th>Course</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.05 }}
                        >
                            {loading ? Array(6).fill(0).map((_, i) => (
                                <tr key={i}>
                                    <td><div className="flex items-center gap-3"><div className="skeleton-loading w-9 h-9 rounded-full" /><div className="skeleton-loading h-4 w-32 rounded" /></div></td>
                                    <td className="hidden md:table-cell"><div className="skeleton-loading h-4 w-40 rounded" /></td>
                                    <td><div className="skeleton-loading h-5 w-24 rounded-full" /></td>
                                    <td><div className="skeleton-loading h-7 w-20 rounded-lg mx-auto" /></td>
                                </tr>
                            )) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                                <Search size={24} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>No students found</p>
                                            <button onClick={() => setSearchQuery('')} className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Clear search</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {currentItems.map((s, idx) => (
                                        <motion.tr
                                            key={s.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group"
                                        >
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        onClick={() => viewProfile(s.id)}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0 cursor-pointer"
                                                        style={{ background: gradients[s.id % gradients.length] }}
                                                    >
                                                        {s.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p
                                                            className="font-semibold text-sm cursor-pointer transition-colors"
                                                            style={{ color: 'var(--text-primary)' }}
                                                            onClick={() => viewProfile(s.id)}
                                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                                        >{s.name}</p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {s.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell text-sm" style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                                            <td>
                                                <span className="pill-badge badge-primary">
                                                    <GraduationCap size={10} /> {s.course}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => viewProfile(s.id)} className="p-1.5 rounded-lg transition-all" title="View"
                                                        style={{ color: 'var(--text-muted)' }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-dim)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                                                        <Eye size={15} />
                                                    </button>
                                                    <button onClick={() => updateStudent(s.id)} className="p-1.5 rounded-lg transition-all" title="Edit"
                                                        style={{ color: 'var(--text-muted)' }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-dim)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button onClick={() => removeStudent(s.id)} className="p-1.5 rounded-lg transition-all" title="Delete"
                                                        style={{ color: 'var(--text-muted)' }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-dim)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </motion.tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-3"
                    style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Showing {currentItems.length > 0 ? indexOfFirst + 1 : 0}–{Math.min(indexOfLast, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}
                            className="p-2 rounded-lg border transition-all disabled:opacity-30"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>
                            <ChevronLeft size={15} />
                        </button>
                        {[...Array(totalPages)].slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map((_, i) => {
                            const page = Math.max(0, currentPage - 3) + i + 1;
                            return (
                                <button key={page} onClick={() => paginate(page)}
                                    className="min-w-[32px] h-8 text-xs font-bold rounded-lg border transition-all"
                                    style={currentPage === page ? {
                                        background: 'var(--gradient-primary)', color: 'white', border: 'none', boxShadow: 'var(--shadow-colored)'
                                    } : {
                                        border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-surface)'
                                    }}>
                                    {page}
                                </button>
                            );
                        })}
                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border transition-all disabled:opacity-30"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListStudentComponent;

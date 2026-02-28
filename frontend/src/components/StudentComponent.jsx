import React, { useState, useEffect } from 'react';
import { createStudent, getStudent, updateStudent } from '../services/StudentService';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, BookOpen, ArrowLeft, Save, GraduationCap, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

const StudentComponent = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [course, setCourse] = useState('');
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [errors, setErrors] = useState({ name: '', email: '', course: '' });
    const navigator = useNavigate();

    useEffect(() => {
        if (id) {
            getStudent(id)
                .then(r => {
                    setName(r.data.name);
                    setEmail(r.data.email);
                    setCourse(r.data.course);
                })
                .catch(e => console.error(e));
        }
    }, [id]);

    function saveOrUpdateStudent(e) {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            const student = { name, email, course };
            if (id) {
                updateStudent(id, student)
                    .then(() => navigator('/students'))
                    .catch(e => { console.error(e); setLoading(false); });
            }
            else {
                createStudent(student)
                    .then(() => navigator('/students'))
                    .catch(e => { console.error(e); setLoading(false); });
            }
        }
    }

    function validateForm() {
        let valid = true;
        const ec = { ...errors };
        if (!name.trim()) { ec.name = 'Full name is strictly required'; valid = false; } else ec.name = '';
        if (!email.trim() || !email.includes('@')) { ec.email = 'Valid institutional email required'; valid = false; } else ec.email = '';
        if (!course.trim()) { ec.course = 'Academic course selection required'; valid = false; } else ec.course = '';
        setErrors(ec);
        return valid;
    }

    return (
        <div className="max-w-3xl mx-auto py-6 space-y-8">
            <button onClick={() => navigator('/students')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Registry Directory
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="md-card !p-0 overflow-hidden border-none shadow-2xl relative">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-shift" />

                <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-8 py-8 relative">
                    <div className="absolute top-4 right-8 opacity-10"><GraduationCap size={60} /></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-inner">
                            {id ? <Sparkles size={28} /> : <User size={28} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{id ? 'Update Identity' : 'Student Enrollment'}</h2>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Institutional Student Registry System</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={saveOrUpdateStudent} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Info Section */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                    <ShieldCheck size={14} /> Identity Details
                                </h3>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block transition-colors ${errors.name ? 'text-danger' : 'opacity-40 group-focus-within:text-primary'}`}>
                                            Full Legal Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" size={16} />
                                            <input type="text" placeholder="e.g. Alexander Hamilton" value={name}
                                                onChange={e => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: '' }); }}
                                                className={`pill-input-dark !rounded-2xl !pl-12 !py-3 bg-slate-50 dark:bg-slate-900 border-2 transition-all 
                                                ${errors.name ? 'border-danger/30 focus:border-danger' : 'border-transparent focus:border-primary/50'}`}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.name && (
                                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                                    className="text-[10px] text-danger font-bold mt-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="relative group">
                                        <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block transition-colors ${errors.email ? 'text-danger' : 'opacity-40 group-focus-within:text-primary'}`}>
                                            Institutional Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" size={16} />
                                            <input type="email" placeholder="student@academy.edu" value={email}
                                                onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                                                className={`pill-input-dark !rounded-2xl !pl-12 !py-3 bg-slate-50 dark:bg-slate-900 border-2 transition-all 
                                                ${errors.email ? 'border-danger/30 focus:border-danger' : 'border-transparent focus:border-primary/50'}`}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.email && (
                                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                                    className="text-[10px] text-danger font-bold mt-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.email}</motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Section */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                    <BookOpen size={14} /> Curriculum Path
                                </h3>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <label className={`text-[9px] font-black uppercase tracking-widest mb-1.5 block transition-colors ${errors.course ? 'text-danger' : 'opacity-40 group-focus-within:text-primary'}`}>
                                            Degree / Course Title
                                        </label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" size={16} />
                                            <input type="text" placeholder="B.Sc. Cyber Security" value={course}
                                                onChange={e => { setCourse(e.target.value); if (errors.course) setErrors({ ...errors, course: '' }); }}
                                                className={`pill-input-dark !rounded-2xl !pl-12 !py-3 bg-slate-50 dark:bg-slate-900 border-2 transition-all 
                                                ${errors.course ? 'border-danger/30 focus:border-danger' : 'border-transparent focus:border-primary/50'}`}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.course && (
                                                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                                    className="text-[10px] text-danger font-bold mt-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.course}</motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                            <AlertCircle size={14} />
                                        </div>
                                        <div className="text-[10px] leading-relaxed opacity-60">
                                            <span className="font-black text-primary uppercase block mb-1">Information</span>
                                            Registering a new student will automatically generate system credentials and academic tracking logs. Verify all details before final submission.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-3">
                            <button type="button" onClick={() => navigator('/students')}
                                className="px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-slate-500">
                                Terminate Session
                            </button>
                            <button type="submit" disabled={loading}
                                className="btn-primary !px-10 !py-3 flex items-center justify-center gap-3 disabled:opacity-50 !rounded-2xl">
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{id ? 'Save Identity' : 'Enroll Student'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default StudentComponent;

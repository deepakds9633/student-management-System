import React, { useState, useEffect } from 'react';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Edit2, Trash2, Clock, MapPin, Info } from 'lucide-react';

const AcademicCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({ id: null, title: '', description: '', type: 'Assignments' });
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user && user.roles) {
            if (user.roles.includes('ROLE_ADMIN')) setUserRole('ADMIN');
            else if (user.roles.includes('ROLE_STAFF')) setUserRole('STAFF');
            else setUserRole('STUDENT');
        }
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await EventService.getAllEvents();
            setEvents(response.data);
            if (selectedDate) {
                setSelectedEvents(response.data.filter(ev => ev.date === selectedDate));
            }
        } catch (error) {
            console.error("Error fetching events", error);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const getTypeColors = (type) => {
        const map = {
            'Examinations': { color: 'var(--danger)', bg: 'var(--danger-dim)', border: 'rgba(239, 68, 68, 0.2)' },
            'Assignments': { color: 'var(--primary)', bg: 'var(--primary-dim)', border: 'rgba(79, 70, 229, 0.2)' },
            'Internal assessments': { color: 'var(--warning)', bg: 'var(--warning-dim)', border: 'rgba(245, 158, 11, 0.2)' },
            'Holidays': { color: 'var(--success)', bg: 'var(--success-dim)', border: 'rgba(16, 185, 129, 0.2)' },
            'Meetings': { color: 'var(--info)', bg: 'var(--info-dim)', border: 'rgba(59, 130, 246, 0.2)' },
            'Notices': { color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'rgba(6, 182, 212, 0.2)' },
        };
        return map[type] || { color: 'var(--text-muted)', bg: 'var(--bg-elevated)', border: 'var(--border)' };
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderCalendar = () => {
        const days = [];
        // Padding
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[100px] border-r border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)', opacity: 0.3 }} />);
        }

        // Active days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const isSelected = selectedDate === dateStr;

            days.push(
                <div key={day} onClick={() => handleDateClick(dateStr, dayEvents)}
                    className="min-h-[120px] p-2 border-r border-b relative cursor-pointer transition-all duration-200 group overflow-hidden"
                    style={{
                        borderColor: 'var(--border)',
                        background: isSelected ? 'var(--primary-dim)' : 'var(--bg-surface)',
                    }}
                >
                    {isToday && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'var(--gradient-primary)' }} />}

                    <div className="flex justify-between items-start mb-2">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${isToday ? 'shadow-lg' : ''}`}
                            style={isToday ? {
                                background: 'var(--gradient-primary)', color: 'white'
                            } : {
                                color: isSelected ? 'var(--primary)' : 'var(--text-muted)'
                            }}>
                            {day}
                        </span>
                        {dayEvents.length > 0 && (
                            <span className="text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                                {dayEvents.length}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((ev, idx) => {
                            const cs = getTypeColors(ev.type);
                            return (
                                <div key={idx} className="text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium border"
                                    style={{ background: cs.bg, color: cs.color, borderColor: cs.border }}>
                                    {ev.title}
                                </div>
                            );
                        })}
                        {dayEvents.length > 2 && (
                            <div className="text-[9px] font-bold text-center py-0.5 opacity-60" style={{ color: 'var(--text-muted)' }}>
                                +{dayEvents.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return days;
    };

    const handleDateClick = (dateStr, dayEvents) => {
        setSelectedDate(dateStr);
        setSelectedEvents(dayEvents);
        setIsSidebarOpen(true);
        setShowForm(false);
        resetForm();
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ id: null, title: '', description: '', type: 'Assignments' });
    };

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        const eventPayload = { ...formData, date: selectedDate };
        try {
            if (isEditing) await EventService.updateEvent(formData.id, eventPayload);
            else await EventService.createEvent(eventPayload);
            setShowForm(false);
            fetchEvents();
        } catch (err) { console.error(err); }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await EventService.deleteEvent(id);
            fetchEvents();
        } catch (err) { console.error(err); }
    };

    const handleEditClick = (ev) => {
        setIsEditing(true);
        setFormData({ id: ev.id, title: ev.title, description: ev.description, type: ev.type });
        setShowForm(true);
    };

    const canManage = userRole === 'ADMIN' || userRole === 'STAFF';

    return (
        <div className="flex h-[calc(100vh-140px)] rounded-2xl border overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

            {/* Calendar Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-6 border-b flex justify-between items-center bg-white dark:bg-slate-900/50" style={{ borderColor: 'var(--border)' }}>
                    <div>
                        <h1 className="flex items-center gap-2"><CalendarIcon size={22} style={{ color: 'var(--primary)' }} /> Academic Calendar</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Institutional schedule and event management</p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-xs font-bold">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </button>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-slate-50/30 dark:bg-transparent">
                    <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                        {dayNames.map(day => (
                            <div key={day} className="py-2.5 text-center text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-fr">
                        {loading ? (
                            <div className="col-span-7 h-96 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            </div>
                        ) : renderCalendar()}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 380, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                        className="border-l relative flex flex-col bg-white dark:bg-slate-900" style={{ borderColor: 'var(--border)' }}>

                        <div className="p-5 border-b sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                    {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Schedule'}
                                </h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Daily Plan</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {canManage && (
                                showForm ? (
                                    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSaveEvent} className="p-4 rounded-xl border space-y-4 shadow-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-xs font-bold uppercase tracking-wider">{isEditing ? 'Edit Event' : 'New Event'}</h4>
                                            <X size={14} className="cursor-pointer opacity-50" onClick={() => setShowForm(false)} />
                                        </div>
                                        <input required className="pill-input-dark text-xs" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                        <select className="pill-input-dark text-xs" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option>Assignments</option><option>Examinations</option><option>Internal assessments</option><option>Notices</option><option>Holidays</option><option>Meetings</option>
                                        </select>
                                        <textarea required className="pill-input-dark text-xs min-h-[60px]" placeholder="Decription" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                        <button type="submit" className="btn-primary w-full text-xs py-2">{isEditing ? 'Update Event' : 'Create Event'}</button>
                                    </motion.form>
                                ) : (
                                    <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                        <Plus size={16} /> Add Event
                                    </button>
                                )
                            )}

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50">Timeline</h4>
                                {selectedEvents.length === 0 ? (
                                    <div className="py-12 text-center opacity-40">
                                        <CalendarIcon size={32} className="mx-auto mb-2" />
                                        <p className="text-xs">No scheduled events</p>
                                    </div>
                                ) : (
                                    selectedEvents.map((ev, i) => {
                                        const cs = getTypeColors(ev.type);
                                        return (
                                            <motion.div key={ev.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                className="p-4 rounded-xl border relative overflow-hidden group" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: cs.color }} />
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border" style={{ background: cs.bg, color: cs.color, borderColor: cs.border }}>{ev.type}</span>
                                                    {canManage && (
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button onClick={() => handleEditClick(ev)} className="p-1 hover:text-indigo-500"><Edit2 size={12} /></button>
                                                            <button onClick={() => handleDeleteEvent(ev.id)} className="p-1 hover:text-red-500"><Trash2 size={12} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                                <h5 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{ev.title}</h5>
                                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ev.description}</p>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AcademicCalendar;

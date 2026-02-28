import React, { useState, useEffect } from 'react';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';

const AcademicCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Form state for creating/editing events
    const [formData, setFormData] = useState({ id: null, title: '', description: '', type: 'Assignments' });
    const [isEditing, setIsEditing] = useState(false);

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
        try {
            const response = await EventService.getAllEvents();
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events", error);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const renderCalendar = () => {
        const days = [];
        const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            days.push(
                <div key={day} className="calendar-day" onClick={() => handleDateClick(dateStr, dayEvents)}
                    style={{
                        backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)',
                        minHeight: '100px', padding: '0.5rem', cursor: 'pointer',
                        transition: 'background-color 0.2s', position: 'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#243247'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                >
                    <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{day}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                        {dayEvents.slice(0, 3).map((ev, index) => (
                            <div key={index} style={{
                                fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                backgroundColor: getTypeColor(ev.type) + '33',
                                color: getTypeColor(ev.type), border: `1px solid ${getTypeColor(ev.type)}66`
                            }}>
                                {ev.title}
                            </div>
                        ))}
                        {dayEvents.length > 3 && (
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center' }}>
                                +{dayEvents.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Examinations': return '#ef4444'; // Red
            case 'Assignments': return '#8b5cf6'; // Purple
            case 'Internal assessments': return '#f59e0b'; // Amber
            case 'Holidays': return '#22c55e'; // Green
            case 'Meetings': return '#3b82f6'; // Blue
            default: return '#64748b'; // Slate
        }
    };

    const handleDateClick = (dateStr, dayEvents) => {
        setSelectedDate(dateStr);
        setSelectedEvents(dayEvents);
        setIsSidebarOpen(true);
        resetForm();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        const eventPayload = { ...formData, date: selectedDate };

        try {
            if (isEditing) {
                await EventService.updateEvent(formData.id, eventPayload);
            } else {
                await EventService.createEvent(eventPayload);
            }
            fetchEvents();
            // Refresh sidebar events for the selected date
            const updatedResponse = await EventService.getAllEvents();
            setEvents(updatedResponse.data);
            setSelectedEvents(updatedResponse.data.filter(ev => ev.date === selectedDate));
            resetForm();
        } catch (error) {
            console.error("Error saving event", error);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await EventService.deleteEvent(id);
            fetchEvents();
            setSelectedEvents(selectedEvents.filter(ev => ev.id !== id));
        } catch (error) {
            console.error("Error deleting event", error);
        }
    };

    const handleEditClick = (ev) => {
        setIsEditing(true);
        setFormData({ id: ev.id, title: ev.title, description: ev.description, type: ev.type });
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ id: null, title: '', description: '', type: 'Assignments' });
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: "'Inter', sans-serif" }}>

            {/* Main Calendar Area */}
            <div style={{ flex: 1, padding: '2rem', transition: 'margin-right 0.3s', marginRight: isSidebarOpen ? '350px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', margin: 0 }}>Academic Calendar</h1>
                        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Plan and monitor institutional events</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={handlePrevMonth} style={btnStyle}>&larr; Prev</button>
                        <h2 style={{ color: '#f8fafc', fontWeight: '600', minWidth: '150px', textAlign: 'center' }}>
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextMonth} style={btnStyle}>Next &rarr;</button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div style={{ backgroundColor: '#1e293b', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    {/* Days Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#94a3b8', fontSize: '0.875rem' }}>
                                {day}
                            </div>
                        ))}
                    </div>
                    {/* Date Cells */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {renderCalendar()}
                    </div>
                </div>
            </div>

            {/* Right Sidebar for Event Details */}
            <div style={{
                position: 'fixed', top: 0, right: isSidebarOpen ? 0 : '-350px',
                width: '350px', height: '100vh', backgroundColor: '#1e293b',
                borderLeft: '1px solid rgba(255,255,255,0.05)', transition: 'right 0.3s ease',
                padding: '2rem 1.5rem', overflowY: 'auto', zIndex: 50, boxShadow: '-5px 0 25px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Events'}
                    </h3>
                    <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>

                {/* Events List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {selectedEvents.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>No events scheduled for this day.</p>
                    ) : (
                        selectedEvents.map((ev) => (
                            <div key={ev.id} style={{
                                backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.75rem',
                                borderLeft: `4px solid ${getTypeColor(ev.type)}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h4 style={{ color: '#f8fafc', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{ev.title}</h4>
                                    {(userRole === 'ADMIN' || userRole === 'STAFF') && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEditClick(ev)} style={iconBtnStyle('text-blue-400')}>✎</button>
                                            <button onClick={() => handleDeleteEvent(ev.id)} style={iconBtnStyle('text-red-400')}>🗑</button>
                                        </div>
                                    )}
                                </div>
                                <span style={{
                                    fontSize: '0.7rem', color: getTypeColor(ev.type), backgroundColor: getTypeColor(ev.type) + '22',
                                    padding: '2px 6px', borderRadius: '10px', display: 'inline-block', marginBottom: '0.5rem'
                                }}>{ev.type}</span>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, lineHeight: '1.4' }}>{ev.description}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Add/Edit Form (Admin/Staff only) */}
                {(userRole === 'ADMIN' || userRole === 'STAFF') && (
                    <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ color: '#fff', margin: '0 0 1rem 0' }}>{isEditing ? 'Edit Event' : 'Add New Event'}</h4>
                        <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleFormChange} required style={inputStyle} />

                            <select name="type" value={formData.type} onChange={handleFormChange} style={inputStyle}>
                                <option>Assignments</option>
                                <option>Examinations</option>
                                <option>Internal assessments</option>
                                <option>Notices</option>
                                <option>Holidays</option>
                                <option>Meetings</option>
                            </select>

                            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleFormChange} required style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" style={{ ...btnStyle, flex: 1, backgroundColor: '#3b82f6', color: '#fff', border: 'none' }}>
                                    {isEditing ? 'Update' : 'Save'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={resetForm} style={{ ...btnStyle, backgroundColor: '#475569', color: '#fff', border: 'none' }}>Cancel</button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Overlay for mobile/sidebar */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
            )}
        </div>
    );
};

// Reusable inline styles
const btnStyle = {
    backgroundColor: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)',
    padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
    transition: 'all 0.2s'
};

const iconBtnStyle = (colorClass) => ({
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem',
    color: colorClass.includes('red') ? '#f87171' : '#60a5fa', opacity: 0.8
});

const inputStyle = {
    width: '100%', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem',
    padding: '0.75rem', color: '#fff', fontSize: '0.875rem', outline: 'none'
};

export default AcademicCalendar;

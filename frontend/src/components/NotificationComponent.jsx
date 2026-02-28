import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthService from '../services/AuthService';

const NotificationComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            const isStudent = currentUser.roles && currentUser.roles.includes('ROLE_STUDENT');
            fetchNotifications(isStudent ? 'STUDENT' : 'STAFF');
        }
    }, []);

    const fetchNotifications = (role) => {
        const user = AuthService.getCurrentUser();
        if (user && user.token) {
            axios.get(`http://localhost:8080/api/notifications/role/${role}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            }).then(response => setNotifications(response.data))
                .catch(error => console.error("Error fetching notifications", error));
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', padding: '2rem 1.5rem', color: 'var(--mc-text)' }}>
            <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem 0' }}>🔔 Announcements</h2>
                    <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.8125rem' }}>Latest notifications and updates</p>
                </div>

                <div style={{ background: 'var(--mc-card)', border: '1px solid var(--mc-border)', borderRadius: '1rem', overflow: 'hidden' }}>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--mc-text-dim)', fontSize: '0.875rem' }}>
                            No new announcements.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {notifications.map(n => (
                                <div key={n.id}
                                    style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'default' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0', margin: 0 }}>{n.message}</p>
                                        <span style={{
                                            flexShrink: 0, padding: '0.25rem 0.75rem', borderRadius: '9999px',
                                            fontSize: '0.6875rem', fontWeight: 600,
                                            background: 'rgba(34,197,94,0.1)', color: '#22c55e'
                                        }}>
                                            {new Date(n.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationComponent;

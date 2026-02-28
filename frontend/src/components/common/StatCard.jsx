import React from 'react';

const StatCard = ({ icon, title, value, sub, color }) => (
    <div className="mc-stat-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
                <p style={{
                    fontSize: '0.625rem', fontWeight: 600, color: 'var(--mc-text-muted)',
                    letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 0.5rem 0'
                }}>{title}</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1 }}>{value}</p>
                {sub && <p style={{ fontSize: '0.75rem', color: 'var(--mc-text-muted)', marginTop: '0.375rem' }}>{sub}</p>}
            </div>
            <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: color ? `${color}15` : 'rgba(59,130,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', position: 'relative'
            }}>
                {icon}
                <div style={{
                    position: 'absolute', top: 2, right: 2, width: 8, height: 8,
                    borderRadius: '50%', background: color || '#3b82f6'
                }} />
            </div>
        </div>
    </div>
);

export default StatCard;

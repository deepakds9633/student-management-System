import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Smartphone, Sun, Moon, CheckCircle } from 'lucide-react';
import AuthService from '../services/AuthService';
import { ThemeContext } from '../contexts/ThemeContext';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const user = AuthService.getCurrentUser();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
        { id: 'security', label: 'Security', icon: <Shield size={16} /> },
        { id: 'sessions', label: 'Sessions', icon: <Smartphone size={16} /> },
    ];

    const SectionHeader = ({ title, desc }) => (
        <div className="p-5 mb-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
        </div>
    );

    const roleGradient = user?.roles?.includes('ROLE_ADMIN')
        ? 'linear-gradient(135deg,#f59e0b,#ef4444)'
        : user?.roles?.includes('ROLE_STAFF')
            ? 'linear-gradient(135deg,#10b981,#059669)'
            : 'linear-gradient(135deg,#6366f1,#a855f7)';

    return (
        <div className="max-w-5xl mx-auto">
            <div className="page-header">
                <h1>Account Settings</h1>
                <p>Manage your profile, display preferences, and security options.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-56 flex-shrink-0">
                    <div className="md-card p-2 flex flex-col gap-0.5">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                                style={activeTab === tab.id ? {
                                    background: 'var(--gradient-primary)', color: 'white', fontWeight: 600
                                } : {
                                    color: 'var(--text-secondary)'
                                }}
                                onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'var(--primary-dim)'; e.currentTarget.style.color = 'var(--primary)'; } }}
                                onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}>
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }} className="md-card overflow-hidden">

                        {/* ── PROFILE TAB ── */}
                        {activeTab === 'profile' && (
                            <div>
                                <SectionHeader title="Public Profile" desc="This info is visible to staff and administrators." />
                                <div className="p-6 space-y-6">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-5 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white flex-shrink-0"
                                            style={{ background: roleGradient, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <button className="btn-secondary text-xs px-3 py-1.5">Change Avatar</button>
                                            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>JPG, GIF or PNG. Max 1MB.</p>
                                        </div>
                                    </div>
                                    {/* Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {[
                                            { label: 'Username', value: user?.username || '', type: 'text' },
                                            { label: 'Email Address', value: user?.email || 'student@university.edu', type: 'email' },
                                            { label: 'Role', value: user?.roles?.[0] || 'ROLE_STUDENT', type: 'text', disabled: true },
                                            { label: 'User ID', value: user?.id || '—', type: 'text', disabled: true },
                                        ].map(f => (
                                            <div key={f.label}>
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                                                <input type={f.type} defaultValue={f.value} disabled={f.disabled}
                                                    className="pill-input-dark"
                                                    style={f.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button className="btn-primary">Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── APPEARANCE TAB ── */}
                        {activeTab === 'appearance' && (
                            <div>
                                <SectionHeader title="Appearance" desc="Customize how the platform looks and feels." />
                                <div className="p-6">
                                    <div className="mb-6 p-5 rounded-xl flex items-start gap-4" style={{ background: 'var(--primary-dim)', border: '1px solid var(--border)' }}>
                                        <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'var(--primary)', color: 'white' }}>
                                            <Palette size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Adaptive Theming System</h3>
                                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                The UI is enhanced with an adaptive theming system to ensure accessibility and readability across both light and dark modes. Dynamic color contrast management is implemented so that text, icons, and interactive elements automatically adjust based on the active theme. This improves user experience, visual clarity, and accessibility standards. The system ensures that content remains clearly visible in all environments, making the interface more professional, premium, and user-friendly.
                                            </p>
                                        </div>
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Theme</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {[
                                            { id: 'light', label: 'Light Mode', preview: 'linear-gradient(135deg,#f0f4ff,#ffffff)', selected: !isDark },
                                            { id: 'dark', label: 'Dark Mode', preview: 'linear-gradient(135deg,#080c14,#0d1117)', selected: isDark },
                                            { id: 'auto', label: 'System', preview: 'linear-gradient(90deg,#f0f4ff 50%,#0d1117 50%)', selected: false },
                                        ].map(t => (
                                            <button key={t.id} onClick={t.id !== 'auto' ? toggleTheme : undefined}
                                                className="rounded-xl p-4 text-left transition-all"
                                                style={{
                                                    border: t.selected ? `2px solid var(--primary)` : '2px solid var(--border)',
                                                    background: 'var(--bg-surface)'
                                                }}>
                                                <div className="w-full h-16 rounded-lg mb-3" style={{ background: t.preview }} />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.label}</span>
                                                    {t.selected && <CheckCircle size={14} style={{ color: 'var(--primary)' }} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── NOTIFICATIONS TAB ── */}
                        {activeTab === 'notifications' && (
                            <div>
                                <SectionHeader title="Notifications" desc="Control which alerts you receive." />
                                <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--border)' }}>
                                    {['Assignment Deadlines', 'Grades Posted', 'New Announcements', 'System Updates', 'Leave Status Updates'].map(n => (
                                        <div key={n} className="flex items-center justify-between p-5">
                                            <div>
                                                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{n}</p>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Get notified about {n.toLowerCase()}.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={n !== 'System Updates'} />
                                                <div className="w-10 h-5 rounded-full peer transition-all"
                                                    style={{ background: 'var(--border-strong)' }}></div>
                                            </label>
                                        </div>
                                    ))}
                                    <div className="p-5 flex justify-end">
                                        <button className="btn-primary">Save Preferences</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── SECURITY TAB ── */}
                        {activeTab === 'security' && (
                            <div>
                                <SectionHeader title="Security" desc="Manage your account security." />
                                <div className="p-12 text-center flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                        style={{ background: 'var(--warning-dim)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                        <Shield size={24} style={{ color: 'var(--warning)' }} />
                                    </div>
                                    <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Security Dashboard</h3>
                                    <p className="text-sm mb-5 max-w-xs" style={{ color: 'var(--text-muted)' }}>
                                        Security actions require identity verification to proceed.
                                    </p>
                                    <button className="btn-primary">Verify Identity</button>
                                </div>
                            </div>
                        )}

                        {/* ── SESSIONS TAB ── */}
                        {activeTab === 'sessions' && (
                            <div>
                                <SectionHeader title="Active Sessions" desc="Manage devices logged into your account." />
                                <div className="p-6">
                                    <div className="p-4 rounded-xl flex items-center gap-4"
                                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: 'var(--success-dim)' }}>
                                            <Smartphone size={18} style={{ color: 'var(--success)' }} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Current Session</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Browser · Active now</p>
                                        </div>
                                        <span className="pill-badge badge-success text-[10px]">Active</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

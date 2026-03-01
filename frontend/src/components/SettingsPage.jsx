import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Palette, Smartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AuthService from '../services/AuthService';
import { ThemeContext } from '../contexts/ThemeContext';
import ProfileAvatarUploader from './ProfileAvatarUploader';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarKey, setAvatarKey] = useState(Date.now());
    const user = AuthService.getCurrentUser();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');

    const handleProfileUpdate = async () => {
        setIsSaving(true);
        setSaveError('');
        setSaveSuccess('');

        try {
            const res = await axios.put('http://localhost:8080/api/profile', {
                username,
                email
            }, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            // Update local storage with new token and details
            const updatedUser = {
                ...user,
                token: res.data.token,
                username: res.data.username,
                email: res.data.email
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setSaveSuccess('Profile details updated successfully!');
            setTimeout(() => {
                setSaveSuccess('');
                if (res.data.username !== user.username) {
                    window.location.reload();
                }
            }, 1000);

        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

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
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 pb-6 justify-center sm:justify-start" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <ProfileAvatarUploader
                                            currentAvatarUrl={`http://localhost:8080/api/profile/avatar/${user?.username}?v=${avatarKey}`}
                                            onUploadSuccess={() => setAvatarKey(Date.now())}
                                        />
                                        <div className="text-center sm:text-left pt-2">
                                            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Profile Picture</h3>
                                            <p className="text-xs mt-1.5 max-w-xs" style={{ color: 'var(--text-muted)' }}>We support custom avatars for all users. Please upload a JPG, GIF or PNG. Max size is 5MB.</p>
                                        </div>
                                    </div>
                                    {/* Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Username</label>
                                            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                                                className="pill-input-dark" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                                className="pill-input-dark" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Role</label>
                                            <input type="text" value={user?.roles?.[0] || 'ROLE_STUDENT'} disabled
                                                className="pill-input-dark" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>User ID</label>
                                            <input type="text" value={user?.id || '—'} disabled
                                                className="pill-input-dark" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {saveError && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[10px] font-bold text-danger bg-danger/10 px-4 py-2 rounded-lg border border-danger/20">
                                                <AlertCircle size={14} /> {saveError}
                                            </motion.div>
                                        )}
                                        {saveSuccess && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[10px] font-bold text-success bg-success/10 px-4 py-2 rounded-lg border border-success/20">
                                                <CheckCircle size={14} /> {saveSuccess}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleProfileUpdate}
                                            disabled={isSaving}
                                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── APPEARANCE TAB ── */}
                        {activeTab === 'appearance' && (
                            <div>
                                <SectionHeader title="Appearance" desc="Customize how the platform looks and feels." />
                                <div className="p-6">

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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const LoginComponent = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        AuthService.login(username, password).then(
            (data) => {
                const userRoles = data.roles;
                if (userRoles.includes("ROLE_" + role)) {
                    if (role === "ADMIN") {
                        navigate("/admin-dashboard");
                    } else if (role === "STAFF") {
                        navigate("/staff-dashboard");
                    } else {
                        navigate("/student-dashboard");
                    }
                    window.location.reload();
                } else {
                    setLoading(false);
                    setMessage("Role mismatch! Please select correct role.");
                    AuthService.logout();
                }
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                setLoading(false);
                setMessage(resMessage);
            }
        );
    };

    const roles = [
        {
            key: 'STUDENT', label: 'Student', desc: 'Academics',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>,
            color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.4)'
        },
        {
            key: 'STAFF', label: 'Staff', desc: 'Management',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
            color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.4)'
        },
        {
            key: 'ADMIN', label: 'Admin', desc: 'System',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
            color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.4)'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Ambient Background */}
            <div className="ambient-bg">
                <div className="ambient-orb ambient-orb-1"></div>
                <div className="ambient-orb ambient-orb-2"></div>
                <div className="ambient-orb ambient-orb-3"></div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: 420, width: '100%' }} className="animate-fadeInUp">

                    {/* Premium Glass Card */}
                    <div className="premium-glass" style={{ padding: '2.5rem 2rem' }}>

                        {/* Logo & Heading */}
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '1rem',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.25rem',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 2px 0 0 rgba(255,255,255,0.05)'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                                </svg>
                            </div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                Welcome Back
                            </h1>
                            <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                Sign in to your portal
                            </p>
                        </div>

                        {/* Role Selector Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                            {roles.map(r => (
                                <button
                                    key={r.key}
                                    type="button"
                                    onClick={() => setRole(r.key)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.875rem 0.25rem',
                                        borderRadius: '1rem',
                                        background: role === r.key ? r.bg : 'rgba(255,255,255,0.02)',
                                        border: role === r.key ? `1px solid ${r.border}` : '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        color: role === r.key ? r.color : '#64748b',
                                        transform: role === r.key ? 'translateY(-2px)' : 'none',
                                        boxShadow: role === r.key ? `0 8px 20px -5px ${r.bg}` : 'none'
                                    }}
                                >
                                    <div style={{ transform: role === r.key ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s ease' }}>
                                        {r.icon}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                                        {r.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleLogin}>
                            {/* Username */}
                            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                                <div style={{
                                    position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)',
                                    color: '#64748b', display: 'flex', alignItems: 'center'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="pill-input-dark"
                                    style={{ paddingLeft: '3rem', height: '3.25rem', background: 'rgba(0,0,0,0.2)' }}
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <div style={{
                                    position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)',
                                    color: '#64748b', display: 'flex', alignItems: 'center'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="pill-input-dark"
                                    style={{ paddingLeft: '3rem', paddingRight: '3rem', height: '3.25rem', background: 'rgba(0,0,0,0.2)' }}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#64748b', display: 'flex', alignItems: 'center', padding: 0,
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Options */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', fontSize: '0.8125rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        style={{ accentColor: '#3b82f6', width: 16, height: 16, cursor: 'pointer' }}
                                    />
                                    Remember me
                                </label>
                                <a href="#" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, opacity: 0.8, transition: 'opacity 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}>
                                    Recovery
                                </a>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="btn-gradient-blue" disabled={loading}
                                style={{
                                    width: '100%', padding: '1rem', fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                    boxShadow: '0 8px 25px -5px rgba(59, 130, 246, 0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
                                }}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                                            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15" />
                                        </svg>
                                        Authenticating...
                                    </span>
                                ) : "Sign In"}
                            </button>

                            {/* Error Message */}
                            {message && (
                                <div style={{
                                    marginTop: '1.25rem', padding: '0.875rem',
                                    background: 'rgba(244, 63, 94, 0.1)',
                                    border: '1px solid rgba(244, 63, 94, 0.2)',
                                    borderRadius: '0.75rem', color: '#fda4af',
                                    fontSize: '0.8125rem', textAlign: 'center',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    {message}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Contact Info Footer */}
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                            Secure Portal Access • <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>Help</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginComponent;

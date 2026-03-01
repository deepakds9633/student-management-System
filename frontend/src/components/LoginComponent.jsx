import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, Users, BarChart3, Award } from "lucide-react";

/* ── Floating Particle ── */
const Particle = ({ style }) => (
    <div
        className="absolute rounded-full pointer-events-none"
        style={{
            ...style,
            animation: `particle-float ${style.duration}s linear infinite`,
            animationDelay: `${style.delay}s`,
        }}
    />
);

/* ── Hero Feature Card ── */
const FeatureCard = ({ icon, title, value, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="flex items-center gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            {icon}
        </div>
        <div>
            <p className="text-white font-bold text-sm">{value}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{title}</p>
        </div>
    </motion.div>
);

const LoginComponent = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const particles = Array.from({ length: 18 }, (_, i) => ({
        width: Math.random() * 6 + 2,
        left: Math.random() * 100,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * -20,
        background: i % 3 === 0
            ? 'rgba(99,102,241,0.6)'
            : i % 3 === 1
                ? 'rgba(34,211,238,0.5)'
                : 'rgba(168,85,247,0.5)',
    }));

    const handleLogin = (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        AuthService.login(username, password).then(
            (data) => {
                const userRoles = data.roles;
                if (userRoles.includes("ROLE_" + role)) {
                    if (role === "ADMIN") navigate("/admin-dashboard");
                    else if (role === "STAFF") navigate("/staff-dashboard");
                    else navigate("/student-dashboard");
                    window.location.reload();
                } else {
                    setLoading(false);
                    setMessage("Role mismatch! Please select the correct role.");
                    AuthService.logout();
                }
            },
            (error) => {
                const resMessage =
                    (error.response?.data?.message) || error.message || error.toString();
                setLoading(false);
                setMessage(resMessage);
            }
        );
    };

    const roles = [
        { key: 'STUDENT', label: 'Student', icon: <GraduationCap size={16} />, color: '#6366f1' },
        { key: 'STAFF', label: 'Faculty', icon: <Briefcase size={16} />, color: '#10b981' },
        { key: 'ADMIN', label: 'Admin', icon: <ShieldCheck size={16} />, color: '#f59e0b' },
    ];

    const activeRole = roles.find(r => r.key === role);

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

            {/* ── LEFT HERO PANEL ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-10"
                style={{ background: 'var(--gradient-hero)' }}
            >
                {/* Mesh gradient overlay */}
                <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)', opacity: 0.8 }} />

                {/* Particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {particles.map((p, i) => (
                        <Particle key={i} style={{
                            width: p.width,
                            height: p.width,
                            left: `${p.left}%`,
                            bottom: '-20px',
                            background: p.background,
                            duration: p.duration,
                            delay: p.delay,
                        }} />
                    ))}
                </div>

                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(40px)', animation: 'breathe 6s ease-in-out infinite' }} />
                <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full opacity-8 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)', filter: 'blur(40px)', animation: 'breathe 8s ease-in-out infinite 2s' }} />

                {/* Brand */}
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)', boxShadow: '0 4px 16px rgba(79,70,229,0.5)' }}>
                            <GraduationCap size={20} className="text-white" />
                        </div>
                        <span className="text-white font-black text-xl tracking-tight">MEC</span>
                    </motion.div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Management Portal</p>
                </div>

                {/* Hero Headline */}
                <div className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-black text-white leading-tight mb-4"
                    >
                        Your Academic<br />
                        <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Universe Awaits
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm leading-relaxed mb-8"
                        style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 320 }}
                    >
                        A unified enterprise platform for students, faculty, and administrators to manage the full academic lifecycle.
                    </motion.p>

                    {/* Feature stats */}
                    <div className="grid grid-cols-1 gap-3 max-w-xs">
                        <FeatureCard icon={<Users size={16} className="text-white" />} title="Active Users" value="2,400+ Members" delay={0.5} />
                        <FeatureCard icon={<BarChart3 size={16} className="text-white" />} title="Analytics" value="Real-time Insights" delay={0.65} />
                        <FeatureCard icon={<Award size={16} className="text-white" />} title="Institution Grade" value="Enterprise Platform" delay={0.8} />
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        © 2026 MEC. Enterprise-grade academic management.
                    </p>
                </div>
            </div>

            {/* ── RIGHT AUTH PANEL ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">

                {/* Background subtle gradient */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse at 60% 30%, var(--primary-dim) 0%, transparent 60%)'
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[400px] relative z-10"
                >
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                            <GraduationCap size={16} className="text-white" />
                        </div>
                        <span className="font-black text-lg tracking-tight" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>MEC</span>
                    </div>

                    {/* Header */}
                    <div className="mb-7">
                        <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your {activeRole?.label.toLowerCase()} account</p>
                    </div>

                    {/* Glass Card */}
                    <div
                        className="p-6 rounded-2xl"
                        style={{
                            background: 'var(--glass-bg-strong)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid var(--glass-border)',
                            boxShadow: 'var(--glass-shadow)'
                        }}
                    >
                        {/* Role selector */}
                        <div
                            className="grid grid-cols-3 gap-1.5 p-1 rounded-xl mb-6"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                        >
                            {roles.map(r => (
                                <button
                                    key={r.key}
                                    type="button"
                                    onClick={() => setRole(r.key)}
                                    className="flex flex-col items-center justify-center py-2.5 px-1 rounded-lg text-xs font-semibold transition-all duration-200"
                                    style={role === r.key ? {
                                        background: 'var(--bg-surface)',
                                        color: r.color,
                                        boxShadow: 'var(--shadow-sm)',
                                        border: `1px solid ${r.color}30`
                                    } : {
                                        color: 'var(--text-muted)',
                                        border: '1px solid transparent'
                                    }}
                                >
                                    <span className="mb-1">{r.icon}</span>
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        className="pill-input-dark !rounded-xl !pl-9"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="pill-input-dark !rounded-xl !pl-9 !pr-10"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded accent-[var(--primary)]"
                                    />
                                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
                                </label>
                                <a href="#" className="text-xs font-semibold transition-colors" style={{ color: 'var(--primary)' }}>
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary !py-3 !rounded-xl text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        Authenticating...
                                    </span>
                                ) : `Sign In as ${activeRole?.label}`}
                            </button>

                            {/* Error */}
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="toast toast-error text-sm"
                                    >
                                        {message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>

                    <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
                        © 2026 MEC Student Management System
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginComponent;

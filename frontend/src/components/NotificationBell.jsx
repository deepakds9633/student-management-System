import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementService from '../services/AnnouncementService';
import AuthService from '../services/AuthService';

const NotificationBell = () => {
    const [count, setCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        if (!user) return;
        fetchCount();
        const interval = setInterval(fetchCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getRole = () => {
        if (!user || !user.roles) return null;
        if (user.roles.includes('ROLE_ADMIN')) return 'ADMIN';
        if (user.roles.includes('ROLE_STAFF')) return 'STAFF';
        if (user.roles.includes('ROLE_STUDENT')) return 'STUDENT';
        return null;
    };

    const fetchCount = async () => {
        try {
            const lastSeen = localStorage.getItem('lastSeenAnnouncement') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('.')[0];
            const res = await AnnouncementService.getCount(lastSeen, getRole());
            setCount(res.data.count || 0);
        } catch (e) { /* silent */ }
    };

    const openDropdown = async () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            setLoading(true);
            // Clear count immediately on open for responsiveness
            setCount(0);
            localStorage.setItem('lastSeenAnnouncement', new Date().toISOString().split('.')[0]);
            try {
                const res = await AnnouncementService.getAll(getRole());
                setRecent(res.data.slice(0, 5));
            } catch (e) { /* silent */ }
            setLoading(false);
        }
    };

    const handleViewAll = () => {
        // Mark as seen
        localStorage.setItem('lastSeenAnnouncement', new Date().toISOString().split('.')[0]);
        setCount(0);
        setShowDropdown(false);
        navigate('/notices');
    };

    const handleClickItem = (id) => {
        setShowDropdown(false);
        navigate(`/notices/${id}`);
    };

    const priorityDot = {
        URGENT: 'bg-red-500',
        HIGH: 'bg-amber-500',
        NORMAL: 'bg-blue-500'
    };

    const categoryIcons = { NOTICE: '📌', ANNOUNCEMENT: '📢', EXAM: '📝', EVENT: '🎉', URGENT: '⚠️' };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={openDropdown}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-all group"
                title="Notifications"
            >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Badge */}
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse shadow-lg shadow-red-500/50">
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {count > 0 && (
                            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                                {count} new
                            </span>
                        )}
                    </div>

                    {/* Items */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
                        ) : recent.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">No announcements yet</div>
                        ) : (
                            recent.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleClickItem(item.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/[0.03] last:border-0 group/item"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            <div className={`w-2 h-2 rounded-full ${priorityDot[item.priority] || priorityDot.NORMAL}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-xs">{categoryIcons[item.category] || '📌'}</span>
                                                <p className="text-xs font-medium text-white truncate">{item.title}</p>
                                            </div>
                                            <p className="text-[11px] text-gray-500 line-clamp-1">{item.message}</p>
                                            <p className="text-[10px] text-gray-600 mt-1">
                                                {item.timestamp && new Date(item.timestamp).toLocaleDateString()} • {item.postedBy}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-white/5">
                        <button
                            onClick={handleViewAll}
                            className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 transition-colors"
                        >
                            View All Announcements →
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes animate-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-in { animation: animate-in 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default NotificationBell;

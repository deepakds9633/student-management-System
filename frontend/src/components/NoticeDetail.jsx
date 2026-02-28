import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnnouncementService from '../services/AnnouncementService';
import AuthService from '../services/AuthService';

const FILE_BASE_URL = 'http://localhost:8080';

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageZoom, setImageZoom] = useState(false);
    const user = AuthService.getCurrentUser();
    const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        fetchNotice();
    }, [id]);

    const fetchNotice = async () => {
        try {
            const res = await AnnouncementService.getById(id);
            setNotice(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Ownership check: only the original poster can delete
    console.log('DEBUG: User:', user?.username, 'PostedBy:', notice?.postedBy, 'Roles:', user?.roles);
    const isOwner = isStaffOrAdmin && notice?.postedBy?.toLowerCase() === user?.username?.toLowerCase();
    console.log('DEBUG: isOwner?', isOwner);

    const handleDelete = async () => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await AnnouncementService.remove(id);
            navigate('/notices');
        } catch (e) {
            const msg = e.response?.status === 403
                ? '⛔ You can only delete your own announcements'
                : '❌ Failed to delete announcement';
            alert(msg);
        }
    };

    const categoryStyles = {
        NOTICE: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
        ANNOUNCEMENT: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/20' },
        EXAM: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
        EVENT: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        URGENT: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/20' },
    };

    const priorityStyles = {
        URGENT: { bg: 'bg-red-500/10', text: 'text-red-400', label: '🔴 Urgent Priority' },
        HIGH: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: '🟡 High Priority' },
        NORMAL: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: '' },
    };

    const categoryIcons = { NOTICE: '📌', ANNOUNCEMENT: '📢', EXAM: '📝', EVENT: '🎉', URGENT: '⚠️' };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f1a] text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading announcement...</p>
                </div>
            </div>
        );
    }

    if (!notice) {
        return (
            <div className="min-h-screen bg-[#0f0f1a] text-white flex items-center justify-center">
                <div className="text-center">
                    <span className="text-5xl block mb-3">📭</span>
                    <h2 className="text-lg font-semibold mb-1">Announcement Not Found</h2>
                    <p className="text-gray-500 text-sm mb-4">This announcement may have been removed</p>
                    <button onClick={() => navigate('/notices')}
                        className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-sm hover:bg-indigo-500/30 transition-colors">
                        ← Back to Announcements
                    </button>
                </div>
            </div>
        );
    }

    const catStyle = categoryStyles[notice.category] || categoryStyles.NOTICE;
    const priStyle = priorityStyles[notice.priority] || priorityStyles.NORMAL;

    return (
        <div className="min-h-screen bg-[#0f0f1a] text-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button onClick={() => navigate('/notices')}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Announcements
                </button>

                <div className="bg-[#161628] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Priority Banner */}
                    {notice.priority && notice.priority !== 'NORMAL' && (
                        <div className={`px-6 py-2 ${priStyle.bg} border-b border-white/5 flex items-center gap-2`}>
                            <span className={`text-xs font-medium ${priStyle.text}`}>{priStyle.label}</span>
                        </div>
                    )}

                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-white/5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-3">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                                        {categoryIcons[notice.category]} {notice.category}
                                    </span>
                                    {notice.recipientRole && notice.recipientRole !== 'ALL' && (
                                        <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-full border border-white/5">
                                            👥 {notice.recipientRole} only
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">{notice.title}</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${notice.postedByRole === 'ADMIN' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {notice.postedBy?.[0]?.toUpperCase()}
                                        </span>
                                        {notice.postedBy || 'Admin'}
                                    </span>
                                    <span>•</span>
                                    <span>{notice.timestamp && new Date(notice.timestamp).toLocaleDateString('en-US', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}</span>
                                    {notice.updatedAt && <span className="text-xs">(edited)</span>}
                                </div>
                            </div>
                            {isOwner && (
                                <button onClick={handleDelete}
                                    className="text-red-400/50 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-all"
                                    title="Delete announcement">
                                    🗑
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">{notice.message}</p>
                        </div>

                        {/* Attachment */}
                        {notice.fileUrl && (
                            <div className="mt-8 border-t border-white/5 pt-6">
                                <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-5 h-5 bg-cyan-500/20 rounded flex items-center justify-center text-[10px]">📎</span>
                                    Attachment
                                </h3>

                                {/* Image attachment */}
                                {(notice.fileType === 'IMAGE' || notice.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                                    <div>
                                        <div className={`rounded-xl overflow-hidden border border-white/10 bg-black/20 cursor-pointer transition-all hover:border-white/20 ${imageZoom ? 'fixed inset-4 z-50 flex items-center justify-center bg-black/90' : 'relative'}`}
                                            onClick={() => setImageZoom(!imageZoom)}>
                                            <img
                                                src={`${FILE_BASE_URL}${notice.fileUrl}`}
                                                alt="Announcement Attachment"
                                                className={`${imageZoom ? 'max-w-full max-h-full object-contain' : 'w-full max-h-[500px] object-contain'}`}
                                            />
                                            {!imageZoom && (
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                                    <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg">🔍 Click to zoom</span>
                                                </div>
                                            )}
                                        </div>
                                        {imageZoom && (
                                            <div className="fixed inset-0 z-40 bg-black/80" onClick={() => setImageZoom(false)} />
                                        )}
                                    </div>
                                ) : notice.fileType === 'PDF' || notice.fileUrl?.endsWith('.pdf') ? (
                                    /* PDF attachment */
                                    <div className="space-y-3">
                                        <div className="bg-[#0f0f1a] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-lg">📄</div>
                                                <div>
                                                    <p className="text-sm font-medium">PDF Document</p>
                                                    <p className="text-[11px] text-gray-500">Click to view or download</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={`${FILE_BASE_URL}${notice.fileUrl}`} target="_blank" rel="noopener noreferrer"
                                                    className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg text-xs hover:bg-indigo-500/30 transition-colors font-medium">
                                                    Open PDF ↗
                                                </a>
                                                <a href={`${FILE_BASE_URL}${notice.fileUrl}`} download
                                                    className="bg-white/5 text-gray-400 px-4 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors">
                                                    ⬇ Download
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Other attachments */
                                    <div className="bg-[#0f0f1a] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-lg">📁</div>
                                            <div>
                                                <p className="text-sm font-medium">File Attachment</p>
                                                <p className="text-[11px] text-gray-500">Download to view</p>
                                            </div>
                                        </div>
                                        <a href={`${FILE_BASE_URL}${notice.fileUrl}`} download
                                            className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg text-xs hover:bg-indigo-500/30 transition-colors font-medium">
                                            ⬇ Download
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticeDetail;

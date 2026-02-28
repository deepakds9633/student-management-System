import { useState } from 'react';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileText, Users, Calendar, ArrowLeft,
    Info, CheckCircle2, ShieldCheck, Loader2, Sparkles,
    ChevronRight, FileSpreadsheet, HardDrive
} from 'lucide-react';

const API = 'http://localhost:8080/api';

const ExportReports = () => {
    const [user] = useState(AuthService.getCurrentUser());
    const [loading, setLoading] = useState('');
    const navigate = useNavigate();
    const isStaff = user?.roles?.includes('ROLE_STAFF');

    const downloadFile = async (url, filename) => {
        setLoading(filename);
        try {
            const res = await fetch(`${API}${url}`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (e) {
            console.error('Export failed:', e.message);
        }
        setLoading('');
    };

    const reports = [
        ...(isStaff ? [{
            title: 'Student Census',
            desc: 'Comprehensive directory including enrollment metadata',
            icon: <Users size={24} />,
            color: 'primary',
            csv: '/export/students/csv',
            csvFile: 'Institutional_Student_Census.csv'
        }] : []),
        {
            title: 'Scholastic Audit',
            desc: 'Subject-wise proficiency and granular mark breakdown',
            icon: <FileSpreadsheet size={24} />,
            color: 'accent',
            csv: `/export/marks/csv/${user?.id}`,
            csvFile: 'Scholastic_Audit_Report.csv'
        },
        {
            title: 'Engagement Log',
            desc: 'Chronological attendance tracking and participation metrics',
            icon: <Calendar size={24} />,
            color: 'success',
            csv: `/export/attendance/csv/${user?.id}`,
            csvFile: 'Engagement_Lifecycle_Log.csv'
        },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <HardDrive className="text-primary" size={32} /> Data Extraction
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Secure Institutional Archive Export</p>
                </div>
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Dashboard
                </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reports.map((r, i) => (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} className="md-card !p-0 overflow-hidden border-none shadow-2xl group flex flex-col">

                        <div className={`p-8 bg-${r.color}/5 border-b border-${r.color}/10 relative overflow-hidden flex-1`}>
                            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-${r.color}/10 blur-2xl group-hover:scale-150 transition-transform duration-700`} />

                            <div className="relative z-10 space-y-6">
                                <div className={`w-14 h-14 rounded-2xl bg-${r.color}/10 text-${r.color} flex items-center justify-center shadow-inner`}>
                                    {r.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight mb-1">{r.title}</h3>
                                    <p className="text-xs font-medium opacity-50 leading-relaxed">{r.desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 pt-0 bg-white dark:bg-slate-900/50">
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 space-y-4">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-30">
                                    <span>Format: .CSV</span>
                                    <span>Status: Verified</span>
                                </div>

                                <button onClick={() => downloadFile(r.csv, r.csvFile)} disabled={loading === r.csvFile}
                                    className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                                      ${loading === r.csvFile
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                            : `bg-${r.color}/10 text-${r.color} hover:bg-${r.color} hover:text-white shadow-lg shadow-${r.color}/10`}`}>
                                    {loading === r.csvFile ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Extracting...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} />
                                            Initiate Download
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Info Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="md-card p-10 bg-slate-50 dark:bg-[#0c121e] border-none shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10 group-hover:rotate-12 transition-transform duration-700">
                    <ShieldCheck size={200} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3">
                            <Info className="text-primary" size={24} />
                            <h3 className="text-xl font-black tracking-tight">Security & Protocol</h3>
                        </div>
                        <p className="text-sm font-medium opacity-60 leading-relaxed max-w-2xl">
                            All data extractions are cryptographically verified and contain real-time state snapshots from the institutional database.
                            CSV payloads are optimized for integration with Microsoft Excel, Google Sheets, and other advanced analytical platforms.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <CheckCircle2 size={14} className="text-success" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Real-time Sync</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <CheckCircle2 size={14} className="text-success" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Excel Compatible</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <CheckCircle2 size={14} className="text-success" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Origin</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-auto p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center text-white shadow-2xl shadow-primary/30">
                        <Sparkles size={40} className="mb-4" />
                        <div className="text-center">
                            <div className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-1">System Health</div>
                            <div className="text-3xl font-black tracking-tighter">OPTIMAL</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExportReports;

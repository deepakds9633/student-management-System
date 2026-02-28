import React from 'react';
import StatCard from '../common/StatCard';

const StudentOverview = ({ attendance, marks, leaves, notifications }) => {
    // Calculate stats
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const totalAtt = attendance.length;
    const attPercentage = totalAtt > 0 ? ((presentCount / totalAtt) * 100).toFixed(1) : 0;

    const totalMarksObtained = marks.reduce((s, m) => s + m.marksObtained, 0);
    const totalMaxMarks = marks.reduce((s, m) => s + m.maxMarks, 0);
    const marksPercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1) : 0;

    const subjectMap = {};
    marks.forEach(m => {
        if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
        subjectMap[m.subject].push(m);
    });

    const pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="📅"
                    title="Attendance"
                    value={`${attPercentage}%`}
                    sub={`${presentCount}/${totalAtt} days`}
                    color={attPercentage >= 75 ? 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' : 'from-rose-500/20 to-orange-500/20 border-rose-500/30'}
                />
                <StatCard
                    icon="📝"
                    title="Overall Marks"
                    value={`${marksPercentage}%`}
                    sub={`${totalMarksObtained}/${totalMaxMarks}`}
                    color="from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                />
                <StatCard
                    icon="📋"
                    title="Leaves"
                    value={leaves.length}
                    sub={`${pendingLeaves} pending`}
                    color="from-amber-500/20 to-yellow-500/20 border-amber-500/30"
                />
                <StatCard
                    icon="🔔"
                    title="Notifications"
                    value={notifications.length}
                    sub="announcements"
                    color="from-purple-500/20 to-pink-500/20 border-purple-500/30"
                />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Performance */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="text-blue-400">📈</span> Subject Performance
                    </h3>
                    {Object.keys(subjectMap).length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(subjectMap).map(([subject, mks]) => {
                                const avg = mks.reduce((s, m) => s + m.marksObtained, 0) / mks.length;
                                const maxAvg = mks.reduce((s, m) => s + m.maxMarks, 0) / mks.length;
                                const pct = maxAvg > 0 ? (avg / maxAvg * 100).toFixed(0) : 0;

                                let colorClass = 'bg-rose-500';
                                if (pct >= 75) colorClass = 'bg-emerald-500';
                                else if (pct >= 50) colorClass = 'bg-amber-500';

                                return (
                                    <div key={subject}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-slate-200 font-medium">{subject}</span>
                                            <span className={`font-bold ${pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{pct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-slate-400 text-center py-4">No marks data yet</p>}
                </div>

                {/* Attendance Summary */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-white mb-6 w-full flex items-center gap-2">
                        <span className="text-emerald-400">📅</span> Attendance Summary
                    </h3>
                    {totalAtt > 0 ? (
                        <div className="text-center">
                            <div className="relative inline-flex items-center justify-center w-40 h-40">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="2.5" />
                                    <circle cx="18" cy="18" r="15.9" fill="none"
                                        stroke={attPercentage >= 75 ? '#10b981' : '#ef4444'}
                                        strokeWidth="2.5"
                                        strokeDasharray={`${attPercentage} ${100 - attPercentage}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-white">{attPercentage}%</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Attendance</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-4 mt-8">
                                <Badge value={presentCount} label="Present" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
                                <Badge value={attendance.filter(a => a.status === 'Absent').length} label="Absent" color="bg-rose-500/10 text-rose-400 border-rose-500/20" />
                                <Badge value={attendance.filter(a => a.status === 'Leave').length} label="Leave" color="bg-amber-500/10 text-amber-400 border-amber-500/20" />
                            </div>
                        </div>
                    ) : <p className="text-slate-400 text-center py-4">No attendance records yet</p>}
                </div>
            </div>

            {/* Recent Notifications */}
            {notifications.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-purple-400">📢</span> Recent Announcements
                    </h3>
                    <div className="space-y-3">
                        {notifications.slice(0, 3).map((n, i) => (
                            <div key={i} className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 flex items-start gap-4 hover:bg-slate-700/50 transition-colors">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <span className="text-xl">📣</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">{n.message}</p>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">{n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Badge = ({ value, label, color }) => (
    <div className={`px-4 py-2 rounded-xl border ${color} flex flex-col items-center min-w-[80px]`}>
        <span className="text-lg font-bold">{value}</span>
        <span className="text-[10px] uppercase tracking-wider opacity-80">{label}</span>
    </div>
);

export default StudentOverview;

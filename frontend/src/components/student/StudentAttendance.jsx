import React from 'react';

const StudentAttendance = ({ attendance }) => {
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const totalAtt = attendance.length;
    const attPercentage = totalAtt > 0 ? ((presentCount / totalAtt) * 100).toFixed(1) : 0;

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">📅</span> Attendance Records
                </h2>

                <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl">
                    <SummaryPill label="Present" value={presentCount} color="text-emerald-400 bg-emerald-500/10" />
                    <SummaryPill label="Absent" value={attendance.filter(a => a.status === 'Absent').length} color="text-rose-400 bg-rose-500/10" />
                    <SummaryPill label="Overall" value={`${attPercentage}%`} color="text-blue-400 bg-blue-500/10" />
                </div>
            </div>

            {attendance.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-700/50">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="py-3 px-4 text-left">Date</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left hidden sm:table-cell">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {attendance.sort((a, b) => new Date(b.date) - new Date(a.date)).map((a, i) => (
                                <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="py-3 px-4 text-slate-200 font-medium">
                                        {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="py-3 px-4">
                                        <StatusBadge status={a.status} />
                                    </td>
                                    <td className="py-3 px-4 text-slate-500 hidden sm:table-cell italic">
                                        {a.status === 'Present' ? 'On Time' : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-slate-400 bg-slate-900/20 rounded-xl border border-slate-800 border-dashed">
                    <p>No attendance records found yet.</p>
                </div>
            )}
        </div>
    );
};

const SummaryPill = ({ label, value, color }) => (
    <div className={`px-4 py-1.5 rounded-lg flex items-center gap-2 ${color}`}>
        <span className="text-xs font-semibold uppercase">{label}</span>
        <span className="font-bold">{value}</span>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Present: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Absent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        Leave: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.Absent}`}>
            {status}
        </span>
    );
};

export default StudentAttendance;

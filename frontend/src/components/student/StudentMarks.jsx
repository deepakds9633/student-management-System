import React from 'react';

const StudentMarks = ({ marks }) => {
    const subjectMap = {};
    marks.forEach(m => {
        if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
        subjectMap[m.subject].push(m);
    });

    const totalMarksObtained = marks.reduce((s, m) => s + m.marksObtained, 0);
    const totalMaxMarks = marks.reduce((s, m) => s + m.maxMarks, 0);
    const overallPercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Summary */}
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Academic Performance</h2>
                    <p className="text-blue-200/60 text-sm">Cumulative grade based on all subjects</p>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-bold text-white tracking-tight">{overallPercentage}%</p>
                    <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Overall Score</p>
                </div>
            </div>

            {/* Subject Cards */}
            {Object.keys(subjectMap).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(subjectMap).map(([subject, mks]) => {
                        const subTotal = mks.reduce((s, m) => s + m.marksObtained, 0);
                        const subMax = mks.reduce((s, m) => s + m.maxMarks, 0);
                        const subPct = subMax > 0 ? (subTotal / subMax * 100).toFixed(1) : 0;

                        return (
                            <div key={subject} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-white">{subject}</h3>
                                    <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${subPct >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            subPct >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        }`}>
                                        {subPct}%
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {mks.map((m, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                                            <span className="text-sm text-slate-300 font-medium">{m.examType}</span>
                                            <div className="text-right">
                                                <div className="flex items-end gap-1 justify-end">
                                                    <span className="text-white font-bold">{m.marksObtained}</span>
                                                    <span className="text-slate-500 text-xs mb-0.5">/ {m.maxMarks}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-slate-400 bg-slate-900/20 rounded-xl border border-slate-800 border-dashed">
                    <p>No marks data available yet.</p>
                </div>
            )}
        </div>
    );
};

export default StudentMarks;

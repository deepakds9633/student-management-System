import React, { useState } from 'react';

const StudentLeaves = ({ leaves, onCreateLeave, onFetchLeaves }) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onCreateLeave(formData);
        setShowForm(false);
        setFormData({ startDate: '', endDate: '', reason: '' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-amber-400">📋</span> Leave Applications
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 ${showForm
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                        }`}
                >
                    {showForm ? 'Cancel' : '+ New Application'}
                </button>
            </div>

            {showForm && (
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Request Leave</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Reason</label>
                            <textarea
                                required
                                rows="3"
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Please explain why you need leave..."
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all">
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {leaves.length > 0 ? (
                    leaves.map((leave) => (
                        <div key={leave.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800/60 transition-colors">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700/50">
                                            <span className="text-slate-200 font-mono text-sm">{leave.startDate}</span>
                                            <span className="text-slate-500 mx-2">to</span>
                                            <span className="text-slate-200 font-mono text-sm">{leave.endDate}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{leave.reason}</p>

                                    {leave.remarks && (
                                        <div className="mt-3 flex items-start gap-2 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                                            <span className="text-indigo-400 text-xs mt-0.5">💬 Staff Comment:</span>
                                            <p className="text-indigo-200 text-sm">{leave.remarks}</p>
                                        </div>
                                    )}
                                </div>

                                <StatusBadge status={leave.status} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-400 bg-slate-900/20 rounded-xl border border-slate-800 border-dashed">
                        <p>No leave applications history.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        APPROVED: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '✅' },
        REJECTED: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: '❌' },
        PENDING: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: '⏳' }
    };

    const style = config[status] || config.PENDING;

    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 w-fit ${style.color}`}>
            <span>{style.icon}</span>
            {status}
        </span>
    );
};

export default StudentLeaves;


import React from 'react';
import { TrendingUp, Target, Award, ArrowUpRight, CheckCircle2, AlertCircle, Info, Mail, BrainCircuit } from 'lucide-react';

interface WeeklyReportProps {
  report: any;
  userEmail: string;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ report, userEmail }) => {
  if (!report) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8">
           <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
             <Mail size={14} /> Sent to {userEmail}
           </div>
        </div>
        
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Weekly Strategic Review</h2>
          <p className="text-slate-500 font-medium text-lg">Analysis for the week of {report.weekStartDate || 'N/A'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Score & Insight */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Current Level Estimate</span>
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black">Band {(report.currentBandEstimate || 0).toFixed(1)}</span>
                    <ArrowUpRight className="text-emerald-400 w-10 h-10" />
                  </div>
                </div>
                <Award className="w-16 h-16 text-indigo-400 opacity-20" />
              </div>
              <p className="text-indigo-100 text-lg leading-relaxed font-medium">
                "{report.progressInsight || 'No insight available yet.'}"
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="text-emerald-600 w-6 h-6" />
                <h4 className="font-black text-emerald-900 text-xl tracking-tight uppercase">Vocabulary Focus</h4>
              </div>
              <p className="text-emerald-800 text-lg font-medium">
                {report.vocabularyFocus || "Reviewing academic collocations for Topic: Environment."}
              </p>
            </div>
          </div>

          {/* Next Week Strategy */}
          <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-indigo-200 w-6 h-6" />
                <h4 className="font-black text-white text-xl tracking-tight uppercase">Strategy for Next Week</h4>
              </div>
              <p className="text-indigo-50 text-base leading-relaxed font-medium mb-8">
                {report.studyStrategyForNextWeek || 'Keep practicing your daily lessons to improve.'}
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-3">
              <Info className="text-indigo-200 shrink-0" size={20} />
              <p className="text-xs text-indigo-100">Following this strategy can improve your next weekly band estimate by 0.3-0.5.</p>
            </div>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <CheckCircle2 className="text-indigo-600" /> Skill Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report.skillBreakdown || []).map((s: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-black text-slate-900 text-lg">{s?.skill || 'Skill'}</h5>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    s?.status === 'Improving' ? 'bg-emerald-100 text-emerald-700' : 
                    s?.status === 'Focus Needed' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {s?.status || 'Active'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{s?.feedback || 'Continue working on your skills.'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;

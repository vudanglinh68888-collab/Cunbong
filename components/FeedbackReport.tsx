
import React from 'react';
import { Feedback } from '../types';
import { CheckCircle2, Calendar, TrendingUp, Info, AlertTriangle, BookOpen, Star, Layers, Cpu } from 'lucide-react';

interface FeedbackReportProps {
  feedback: Feedback;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-10 -mt-10"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Star className="text-yellow-500 w-8 h-8" /> Official Examiner Report
              </h3>
              <p className="text-slate-500 font-medium">Standardized IELTS Assessment Engine v2.5</p>
            </div>
            <div className="flex flex-col items-center bg-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-200">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Overall Band</span>
              <span className="text-5xl font-black leading-none">{(feedback.overallScore || 0).toFixed(1)}</span>
            </div>
          </div>

          {/* Academic Core Breakdown */}
          {feedback.academic_core_usage && (
            <div className="mb-10 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
               <Cpu className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-2xl font-black flex items-center gap-2">
                      <Layers className="text-indigo-400" /> Academic Core Density
                    </h4>
                    <p className="text-slate-400 text-sm font-medium">Functional vocabulary efficiency analysis</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-3xl font-black text-indigo-400">{feedback.academic_core_usage.count || 0}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Units Detected</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Successfully Utilized</span>
                    <div className="flex flex-wrap gap-2">
                      {(feedback.academic_core_usage.used_words || []).map((w, i) => (
                        <span key={i} className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-500/20">{w}</span>
                      ))}
                      {(!feedback.academic_core_usage.used_words || feedback.academic_core_usage.used_words.length === 0) && <span className="text-slate-500 italic text-sm">No functional units detected.</span>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Suggested High-Impact Units</span>
                    <div className="flex flex-wrap gap-2">
                      {(feedback.academic_core_usage.suggested_words || []).map((w, i) => (
                        <span key={i} className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg text-xs font-bold border border-amber-500/20">{w}</span>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* Criteria Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {(feedback.criteria || []).map((c, idx) => (
              <div key={idx} className="group p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{c?.label || 'Criterion'}</h4>
                  <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-black">{c?.score || 0}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{c?.feedback || ''}</p>
              </div>
            ))}
          </div>

          <div className="mb-10 bg-red-50/50 border border-red-100 rounded-[2.5rem] p-8">
            <h4 className="font-black text-red-900 text-xl mb-6 flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Error Analysis (Band Impact)
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {(feedback.specificErrors || []).map((error, i) => (
                <li key={i} className="flex gap-3 text-red-800 text-sm font-bold">
                  <span className="text-red-400">•</span> {error}
                </li>
              ))}
              {(!feedback.specificErrors || feedback.specificErrors.length === 0) && <li className="text-emerald-700 text-sm font-bold">No major errors identified. Excellent work!</li>}
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-10">
            <h4 className="font-black text-emerald-900 text-xl mb-6 flex items-center gap-2">
              <BookOpen className="text-emerald-600" /> Band 8.5+ Benchmark
            </h4>
            <div className="prose prose-emerald max-w-none text-emerald-900 text-lg leading-[1.8] font-serif bg-white/50 p-8 rounded-[2rem] border border-emerald-100 shadow-inner whitespace-pre-wrap italic">
              {feedback.sampleAnswer || 'Sample answer not available.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;

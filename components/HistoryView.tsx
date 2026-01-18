
import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, ChevronRight, BookOpen, MessageSquare, PenTool, Headphones, Award, Filter, BrainCircuit } from 'lucide-react';
import { dbService } from '../services/dbService';
import { DailyLessonRecord, WritingSubmission, Skill } from '../types';

interface HistoryViewProps {
  userId: string;
  onViewLesson: (lesson: DailyLessonRecord) => void;
  onViewWriting: (submission: WritingSubmission) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ userId, onViewLesson, onViewWriting }) => {
  const [filter, setFilter] = useState<'all' | 'lessons' | 'writing'>('all');
  const lessons = dbService.getLessons(userId);
  const writing = dbService.getWritingSubmissions(userId);

  // Updated to support Skill | 'Vocabulary'
  const getIcon = (skill: Skill | 'Vocabulary') => {
    switch (skill) {
      case 'Writing': return <PenTool className="w-5 h-5" />;
      case 'Speaking': return <MessageSquare className="w-5 h-5" />;
      case 'Listening': return <Headphones className="w-5 h-5" />;
      case 'Reading': return <BookOpen className="w-5 h-5" />;
      case 'Vocabulary': return <BrainCircuit className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const hasHistory = lessons.length > 0 || writing.length > 0;

  if (!hasHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No History Found</h3>
        <p className="text-slate-500 max-w-xs">Start your first lesson or writing task to begin building your study profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Personal Portfolio</h2>
          <p className="text-slate-500">A complete record of your IELTS training journey.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {(['all', 'lessons', 'writing'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {(filter === 'all' || filter === 'lessons') && lessons.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <BookOpen className="w-4 h-4" /> AI Daily Lessons
          </h3>
          <div className="space-y-3">
            {lessons.map((record) => (
              <div 
                key={record.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${getSkillColor(record.focus_skill)}`}>
                    {getIcon(record.focus_skill)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">{record.focus_skill} {record.sub_type}</h4>
                      {record.completed ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          <Circle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(record.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onViewLesson(record)}
                  className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {(filter === 'all' || filter === 'writing') && writing.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <PenTool className="w-4 h-4" /> Writing Portfolio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {writing.map((sub) => (
              <div 
                key={sub.id}
                onClick={() => onViewWriting(sub)}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-[10px] font-bold opacity-80 leading-none">BAND</span>
                    <span className="text-lg font-black leading-none">{sub.band_score.toFixed(1)}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{sub.task_type}</span>
                  <h4 className="mt-2 font-bold text-slate-900 line-clamp-1">{sub.content.substring(0, 40)}...</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(sub.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-xs text-slate-400 line-clamp-2 italic leading-relaxed">
                  "{sub.content.substring(0, 100)}..."
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-indigo-600 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Review Submission <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Updated to support Skill | 'Vocabulary'
const getSkillColor = (skill: Skill | 'Vocabulary') => {
  switch (skill) {
    case 'Writing': return 'bg-orange-100 text-orange-600';
    case 'Speaking': return 'bg-purple-100 text-purple-600';
    case 'Listening': return 'bg-blue-100 text-blue-600';
    case 'Reading': return 'bg-emerald-100 text-emerald-600';
    case 'Vocabulary': return 'bg-indigo-100 text-indigo-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

export default HistoryView;

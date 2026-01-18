
import React, { useState } from 'react';
import { LearningPath, Skill } from '../types';
import { Map, Calendar, Target, CheckCircle2, ChevronRight, ChevronDown, Sparkles, Star, BookOpen, RefreshCw, Layers } from 'lucide-react';

interface Props {
  roadmap: LearningPath;
  onStartLesson: (skill: Skill) => void;
}

const LearningPathView: React.FC<Props> = ({ roadmap, onStartLesson }) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="bg-indigo-600 rounded-[50px] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Layers size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles size={16} className="text-yellow-300" /> AI Sequence Builder
            </div>
            <h2 className="text-4xl md:text-5xl font-kids leading-tight">Chuỗi bài học thông minh của bé</h2>
            <p className="text-indigo-100 text-xl font-medium max-w-lg">
              Mỗi bài học được thiết kế để kế thừa kiến thức từ bài trước, giúp bé học sâu và nhớ lâu.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 text-center">
            <div className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Tốc độ lộ trình</div>
            <div className="text-3xl font-kids">{roadmap.pace}</div>
          </div>
        </div>
      </div>

      {/* Roadmap Path */}
      <div className="space-y-8">
        {roadmap.weeks.map((week) => (
          <div 
            key={week.weekNumber}
            className={`bg-white rounded-[40px] border-4 transition-all duration-300 overflow-hidden ${expandedWeek === week.weekNumber ? 'border-indigo-400 shadow-xl' : 'border-gray-50 hover:border-gray-200'}`}
          >
            <button 
              onClick={() => setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
              className="w-full p-8 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[25px] flex items-center justify-center text-white shadow-lg ${week.weekNumber % 2 === 0 ? 'bg-sky-400' : 'bg-indigo-500'}`}>
                  <span className="text-2xl font-black">W{week.weekNumber}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-kids text-slate-800">{week.title}</h3>
                  <p className="text-gray-400 font-bold">{week.vietnameseTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                  <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Total Lessons</span>
                  <div className="text-indigo-500 font-bold">{week.lessons.length} bài học</div>
                </div>
                {expandedWeek === week.weekNumber ? <ChevronDown /> : <ChevronRight />}
              </div>
            </button>

            {expandedWeek === week.weekNumber && (
              <div className="p-8 pt-0 border-t border-gray-50 animate-in slide-in-from-top-4 duration-500 space-y-8">
                {week.lessons.map((lesson, idx) => (
                  <div key={lesson.lesson_id} className="relative pl-10 border-l-4 border-dashed border-gray-100 pb-8 last:pb-0">
                    <div className="absolute -left-[22px] top-0 w-10 h-10 bg-white border-4 border-indigo-400 rounded-full flex items-center justify-center text-indigo-500 font-black shadow-sm">
                      {idx + 1}
                    </div>
                    
                    <div className="bg-gray-50/50 p-6 rounded-[30px] border border-gray-100 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xl font-kids text-slate-800">{lesson.objective}</h4>
                          <p className="text-sm text-gray-500 italic">{lesson.vietnamese_objective}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-sky-600 border border-sky-100">{lesson.focus_skill}</span>
                          <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-orange-600 border border-orange-100">{lesson.estimated_time}m</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50">
                          <h5 className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-3 flex items-center gap-2">
                            <RefreshCw size={14} /> Review (Ôn tập)
                          </h5>
                          <ul className="space-y-2">
                            {lesson.review_content.map((item, i) => (
                              <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 mt-1.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50">
                          <h5 className="text-xs font-black uppercase text-emerald-500 tracking-widest mb-3 flex items-center gap-2">
                            <Sparkles size={14} /> New Content (Kiến thức mới)
                          </h5>
                          <ul className="space-y-2">
                            {lesson.new_content.map((item, i) => (
                              <li key={i} className="text-sm text-slate-700 font-medium flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button 
                        onClick={() => onStartLesson(lesson.focus_skill)}
                        className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                      >
                        Bắt đầu học bài {lesson.lesson_id} <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checkpoints */}
      <div className="bg-slate-900 text-white p-10 rounded-[50px] shadow-2xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="relative z-10 space-y-6">
          <h3 className="text-2xl font-kids flex items-center gap-3">
            <Target className="text-emerald-400" /> Các cột mốc quan trọng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmap.checkpoints.map((cp, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black">
                  {i + 1}
                </div>
                <p className="font-medium text-indigo-100">{cp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathView;

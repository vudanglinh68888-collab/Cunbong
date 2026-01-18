
import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Target, BookOpen, ChevronRight, Loader2, FileText, CheckCircle, Lightbulb, ListTodo, Zap, PenTool, Mic, Brain, ArrowLeft, ArrowRight } from 'lucide-react';
import { generatePersonalizedLesson, generateDailyFlow } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { User, Skill, DailyLessonRecord, DailyFlowLesson } from '../types';

interface Props {
  user: User;
  initialLesson?: DailyLessonRecord;
}

const DailyLessonGenerator: React.FC<Props> = ({ user, initialLesson }) => {
  const [mode, setMode] = useState<'single' | 'flow'>('flow');
  const [skill, setSkill] = useState<Skill>('Writing');
  const [minutes, setMinutes] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonContent, setLessonContent] = useState<string | null>(initialLesson?.lesson_content || null);
  const [flowLesson, setFlowLesson] = useState<DailyFlowLesson | null>(null);
  const [flowStep, setFlowStep] = useState(0); // 0: Vocab, 1: Reading, 2: Output
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setLessonContent(null);
    setFlowLesson(null);
    setFlowStep(0);
    try {
      if (mode === 'single') {
        const content = await generatePersonalizedLesson(user.current_band, user.target_band, skill, minutes);
        dbService.saveLesson({
          user_id: user.id,
          focus_skill: skill,
          lesson_content: content,
          completed: false
        });
        setLessonContent(content);
      } else {
        // Fetch words needing review for Spaced Repetition
        const atRisk = dbService.getAtRiskVocab(user.id);
        const reviewWords = atRisk.map(v => v.word);
        
        const data = await generateDailyFlow(user.target_band, "Sustainable Development", reviewWords);
        setFlowLesson(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeFlow = () => {
    if (flowLesson) {
      // Record progress for all words used
      flowLesson.vocabulary.words.forEach(word => {
        dbService.updateVocabFamiliarity(user.id, word, 1);
      });
      alert("Daily Flow Complete! Vocabulary familiarity updated.");
      setFlowLesson(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Config Header */}
      {!flowLesson && !lessonContent && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] -mr-40 -mt-40 opacity-70"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-2 flex items-center gap-4">
                  <Zap className="text-indigo-600 w-10 h-10" />
                  Training Ground
                </h2>
                <p className="text-slate-500 font-medium text-lg">
                  {mode === 'flow' ? "Integrated sequence: Vocab → Context → Practice." : "Focus on a single weak skill."}
                </p>
              </div>

              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button 
                  onClick={() => setMode('single')}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'single' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}
                >
                  Single Drill
                </button>
                <button 
                  onClick={() => setMode('flow')}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'flow' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}
                >
                  Daily Flow
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-3xl">
               {mode === 'single' ? (
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Focus Skill</label>
                   <select value={skill} onChange={e => setSkill(e.target.value as Skill)} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold">
                     <option value="Writing">Writing</option>
                     <option value="Speaking">Speaking</option>
                     <option value="Reading">Reading</option>
                     <option value="Listening">Listening</option>
                   </select>
                 </div>
               ) : (
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Theme</label>
                   <div className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-indigo-600">Global Economics</div>
                 </div>
               )}
               
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Intensity</label>
                  <select value={minutes} onChange={e => setMinutes(Number(e.target.value))} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold">
                    <option value={20}>20m (Standard)</option>
                    <option value={40}>40m (Deep)</option>
                  </select>
               </div>

               <div className="md:col-span-2 flex items-end">
                 <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                 >
                   {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                   {mode === 'flow' ? "Engage Daily Flow" : "Start Skill Drill"}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Flow Stepper UI */}
      {flowLesson && (
        <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-700">
           {/* Step Navigator */}
           <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
             <div className="flex items-center gap-8">
               {[
                 { icon: <Brain />, label: "Vocab Lab", time: "5m" },
                 { icon: <BookOpen />, label: "In Context", time: "7m" },
                 { icon: <PenTool />, label: "Output", time: "8m" }
               ].map((step, i) => (
                 <div key={i} className={`flex items-center gap-3 ${flowStep >= i ? 'text-indigo-600' : 'text-slate-300'}`}>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${flowStep >= i ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                     {step.icon}
                   </div>
                   <div className="hidden md:block">
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{step.time}</p>
                     <p className="font-bold text-sm leading-none">{step.label}</p>
                   </div>
                   {i < 2 && <div className={`h-0.5 w-8 ml-4 ${flowStep > i ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>}
                 </div>
               ))}
             </div>
             
             <div className="flex gap-3">
               {flowStep > 0 && (
                 <button onClick={() => setFlowStep(s => s - 1)} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-600">
                   <ArrowLeft size={20} />
                 </button>
               )}
               {flowStep < 2 ? (
                 <button onClick={() => setFlowStep(s => s + 1)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2">
                   Next Phase <ArrowRight size={18} />
                 </button>
               ) : (
                 <button onClick={completeFlow} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2">
                   Complete Flow <CheckCircle size={18} />
                 </button>
               )}
             </div>
           </div>

           {/* Content Display based on step */}
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden min-h-[500px]">
              {flowStep === 0 && (
                <div className="p-10 md:p-16 animate-in fade-in duration-500">
                  <h3 className="text-3xl font-black mb-8">Phase 1: Lexical Imprinting</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {flowLesson.vocabulary.words.map((w, i) => (
                      <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:border-indigo-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                           <h4 className="text-2xl font-black text-slate-900">{w.word}</h4>
                           <span className="bg-white px-3 py-1 rounded-lg text-xs font-mono text-slate-400">{w.ipa}</span>
                        </div>
                        <p className="text-indigo-600 font-bold mb-4">{w.meaning_vn}</p>
                        <div className="space-y-4">
                          <div className="text-sm">
                            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Collocations</span>
                            <div className="flex flex-wrap gap-2">
                              {w.collocations.map((c, idx) => <span key={idx} className="bg-white border border-slate-200 px-2 py-1 rounded-md font-medium text-slate-600">{c}</span>)}
                            </div>
                          </div>
                          <div className="text-sm bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 italic text-indigo-900">
                            "{w.example}"
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {flowStep === 1 && (
                <div className="p-10 md:p-16 animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <BookOpen className="text-indigo-600 w-8 h-8" />
                    <h3 className="text-3xl font-black">Phase 2: Semantic Context</h3>
                  </div>
                  <div className="prose prose-indigo max-w-none text-xl leading-relaxed font-serif text-slate-700 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 italic shadow-inner">
                    {flowLesson.reading_passage.split('\n').map((para, i) => <p key={i} className="mb-6">{para}</p>)}
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm italic">
                    <Lightbulb className="text-amber-500" /> Did you spot all 5 target words in this text?
                  </div>
                </div>
              )}

              {flowStep === 2 && (
                <div className="p-10 md:p-16 animate-in fade-in duration-500 space-y-12">
                   <h3 className="text-3xl font-black">Phase 3: Active Production</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-orange-600 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <PenTool className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-black mb-4 flex items-center gap-2"><PenTool size={20}/> Writing Studio</h4>
                        <p className="text-lg leading-relaxed font-medium italic mb-6">"{flowLesson.writing_prompt}"</p>
                        <button className="bg-white text-orange-600 px-6 py-2 rounded-xl font-black text-sm">Write Essay</button>
                      </div>
                      <div className="bg-purple-600 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <Mic className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-black mb-4 flex items-center gap-2"><Mic size={20}/> Speaking Center</h4>
                        <p className="text-lg leading-relaxed font-medium italic mb-6">"{flowLesson.speaking_cue_card}"</p>
                        <button className="bg-white text-purple-600 px-6 py-2 rounded-xl font-black text-sm">Record Speech</button>
                      </div>
                   </div>
                   <div className="bg-slate-900 text-white p-8 rounded-[2rem] border-l-8 border-indigo-500">
                     <h5 className="font-black mb-2 text-indigo-400 uppercase tracking-widest text-xs">Production Strategy</h5>
                     <p className="text-slate-300 italic">Try to include at least 3 of today's target words in your answer to maximize your Lexical Resource score.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Legacy single lesson view... */}
      {lessonContent && !flowLesson && (
        <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 md:p-16 shadow-2xl relative animate-in zoom-in-95 duration-700">
           <div className="max-w-3xl mx-auto whitespace-pre-wrap prose prose-slate">
             {lessonContent}
           </div>
        </div>
      )}
    </div>
  );
};

export default DailyLessonGenerator;

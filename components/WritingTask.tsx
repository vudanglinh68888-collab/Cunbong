
import React, { useState, useEffect, useCallback } from 'react';
import { evaluateWriting } from '../services/geminiService';
import { writingAssistant } from '../services/writingAssistant';
import { dbService } from '../services/dbService';
import { Feedback, WritingSubmission, User, WritingAnalysisResult } from '../types';
import { Loader2, Send, PenTool, History, Sparkles, Lightbulb, ChevronRight, BookOpen, AlertTriangle, Copy, Check } from 'lucide-react';
import FeedbackReport from './FeedbackReport';

interface Props {
  user: User;
  initialSubmission?: WritingSubmission;
}

const WritingTask: React.FC<Props> = ({ user, initialSubmission }) => {
  const [text, setText] = useState(initialSubmission?.content || '');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(initialSubmission?.feedback || null);
  
  // Assistant State
  const [analysis, setAnalysis] = useState<WritingAnalysisResult | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  const prompt = "Some people think that it is best to work in the same organization for one's whole life. Others think that it is better to change jobs frequently. Discuss both views and give your opinion.";

  // Real-time analysis debounce
  useEffect(() => {
    if (!text || initialSubmission) return;

    const timer = setTimeout(() => {
      const result = writingAssistant.analyze(text);
      setAnalysis(result);
    }, 1000); // Analyze 1s after typing stops

    return () => clearTimeout(timer);
  }, [text, initialSubmission]);

  const handleSubmit = async () => {
    const words = text.trim().split(/\s+/);
    if (words.length < 50) {
      return alert("Please write a more substantial response (at least 50 words) for evaluation.");
    }
    setIsEvaluating(true);
    try {
      const result = await evaluateWriting(prompt, text);
      dbService.saveWritingSubmission({
        user_id: user.id,
        task_type: 'Task 2',
        content: text,
        band_score: result.overallScore,
        feedback: result
      });
      setFeedback(result);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert("Evaluation failed. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopy = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="xl:col-span-3 space-y-8">
        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          {initialSubmission && (
            <div className="absolute top-8 right-8 flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              <History className="w-4 h-4" /> Portfolio Record
            </div>
          )}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-100">
              <PenTool className="text-white w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Writing Studio</h2>
              <p className="text-slate-500 font-medium italic">Academic Task 2: Critical Discussion</p>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] mb-8 shadow-inner">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-black text-xs uppercase tracking-widest">
              <BookOpen size={14} /> Official Task Prompt
            </div>
            <p className="text-slate-800 font-bold text-xl leading-relaxed italic">
              "{prompt}"
            </p>
          </div>

          <div className="relative group">
            <textarea
              disabled={!!initialSubmission}
              className="w-full h-[600px] p-10 rounded-[3rem] border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none font-serif text-2xl leading-[1.8] text-slate-700 placeholder:text-slate-300 shadow-inner disabled:bg-slate-50/50"
              placeholder="Start drafting your academic response..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="absolute bottom-8 right-10 flex items-center gap-4">
               {analysis && (
                 <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest animate-in fade-in">
                   <Sparkles size={12} /> Detected: {analysis.position}
                 </div>
               )}
               <div className={`px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all ${wordCount >= 250 ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
                  {wordCount} / 250 Words
               </div>
            </div>
          </div>
          
          {!initialSubmission && (
            <div className="flex items-center justify-between mt-12 p-2">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                <span className="text-xs font-bold uppercase tracking-widest">AI Scoring System Online</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isEvaluating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all shadow-2xl shadow-indigo-100 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Formal Evaluation...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    Submit Essay
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {feedback && <FeedbackReport feedback={feedback} />}
      </div>

      {/* Smart Context Assistant Sidebar */}
      {!initialSubmission && (
        <div className="space-y-6">
           <div className="bg-slate-900 text-white p-6 rounded-[3rem] shadow-2xl sticky top-6 border border-white/5 h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Sparkles className="text-indigo-400 w-5 h-5" /> Copilot
                </h3>
                {analysis && (
                  <span className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full text-indigo-300">
                    {analysis.position}
                  </span>
                )}
              </div>

              {!text ? (
                 <div className="text-center py-10 opacity-50">
                   <PenTool className="w-10 h-10 mx-auto mb-4" />
                   <p className="text-sm font-medium">Start typing to activate real-time Academic Core suggestions.</p>
                 </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  {/* Warnings Section */}
                  {analysis?.warnings.length ? (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                        <AlertTriangle size={12} /> Quality Control
                      </h4>
                      {analysis.warnings.map((warn, i) => (
                        <div key={i} className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                          <p className="text-xs text-amber-200 font-bold mb-2">{warn.message}</p>
                          <div className="flex flex-wrap gap-1">
                            {warn.alternatives.map((alt, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleCopy(alt)}
                                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 rounded text-[10px] font-bold text-amber-100 transition-colors"
                              >
                                {alt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Suggestions Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                       <Lightbulb size={12} /> Recommended Vocabulary
                    </h4>
                    {analysis?.suggestions.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No specific suggestions for this context yet.</p>
                    )}
                    {analysis?.suggestions.map((sugg, i) => (
                      <div key={i} className="group bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/50 p-4 rounded-2xl transition-all cursor-pointer" onClick={() => handleCopy(sugg.word)}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm text-indigo-100 group-hover:text-white transition-colors">{sugg.word}</span>
                          {copiedWord === sugg.word ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">{sugg.usage_tip}</p>
                        <div className="bg-black/20 p-2 rounded-lg text-[10px] text-slate-300 font-mono italic border-l-2 border-indigo-500">
                          {sugg.collocation}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                            {sugg.function.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default WritingTask;

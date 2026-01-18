
import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, RefreshCcw, Info, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { generateReadingPractice } from '../services/geminiService';
import { ReadingPractice } from '../types';

const ReadingTask: React.FC = () => {
  const [practice, setPractice] = useState<ReadingPractice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const fetchPractice = async () => {
    setIsLoading(true);
    setShowResults(false);
    setUserAnswers({});
    try {
      const data = await generateReadingPractice("5.0-7.5");
      setPractice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPractice();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800">Compiling Academic Journal...</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Gemini is searching for real-world academic data to build your passage.</p>
        </div>
      </div>
    );
  }

  if (!practice) return null;

  const calculateScore = () => {
    let score = 0;
    let total = 0;

    practice.matchingHeading.questions.forEach(q => {
      total++;
      if (userAnswers[`mh-${q.paragraphId}`] === q.answer) score++;
    });

    practice.multipleChoice.forEach(q => {
      total++;
      if (userAnswers[`mc-${q.id}`] === q.answer) score++;
    });

    practice.tfng.forEach(q => {
      total++;
      if (userAnswers[`tf-${q.id}`] === q.answer) score++;
    });

    return { score, total };
  };

  const { score, total } = calculateScore();

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen -mt-6 animate-in fade-in duration-700">
      {/* Passage Pane */}
      <div className="lg:w-1/2 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[85vh] sticky top-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <FileText className="text-indigo-600 w-5 h-5" />
            <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Reading Passage</span>
          </div>
          <span className="text-xs font-bold text-slate-400">Section 1 Practice</span>
        </div>
        <div className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth">
          <h2 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{practice.title}</h2>
          <div 
            className="prose prose-slate max-w-none text-slate-700 text-lg leading-[1.8] space-y-6 font-serif"
            dangerouslySetInnerHTML={{ 
              __html: practice.passage
                .replace(/\[([A-Z])\]/g, '<span class="inline-flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-lg font-black text-sm mr-3 mt-1 shadow-lg shadow-indigo-100">$1</span>')
                .replace(/\n\n/g, '</div><div class="mb-8">')
            }}
          />
        </div>
      </div>

      {/* Questions Pane */}
      <div className="lg:w-1/2 space-y-6 overflow-y-auto pb-20">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <HelpCircle className="text-indigo-600 w-6 h-6" />
              Task Sheet
            </h3>
            <button onClick={fetchPractice} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <RefreshCcw className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Matching Headings */}
          <section className="mb-12">
            <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4">List of Headings</h4>
              <ul className="space-y-2">
                {practice.matchingHeading.headings.map((h, i) => (
                  <li key={i} className="text-sm font-medium text-slate-600 flex gap-2">
                    <span className="text-indigo-600 font-bold">i.</span> {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              {practice.matchingHeading.questions.map((q, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="font-bold text-slate-800 shrink-0">Paragraph {q.paragraphId}</span>
                  <select 
                    disabled={showResults}
                    value={userAnswers[`mh-${q.paragraphId}`] || ''}
                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [`mh-${q.paragraphId}`]: e.target.value }))}
                    className={`flex-1 p-3 rounded-xl border-2 outline-none transition-all font-medium ${
                      showResults 
                        ? userAnswers[`mh-${q.paragraphId}`] === q.answer ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                        : 'bg-white border-slate-100 focus:border-indigo-500'
                    }`}
                  >
                    <option value="">Choose heading...</option>
                    {practice.matchingHeading.headings.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* Multiple Choice */}
          <section className="mb-12 space-y-10">
            {practice.multipleChoice.map(q => (
              <div key={q.id} className="space-y-4">
                <h5 className="font-bold text-slate-800 leading-snug">{q.id}. {q.question}</h5>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => !showResults && setUserAnswers(prev => ({ ...prev, [`mc-${q.id}`]: opt }))}
                      className={`text-left p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                        userAnswers[`mc-${q.id}`] === opt
                          ? showResults
                            ? opt === q.answer ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
                            : 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : showResults && opt === q.answer ? 'bg-green-50 border-green-500' : 'bg-white border-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {showResults && (
                   <div className="p-4 bg-slate-50 rounded-xl text-xs flex gap-2 border border-slate-100 italic text-slate-500">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" /> {q.explanation}
                   </div>
                )}
              </div>
            ))}
          </section>

          {/* TFNG */}
          <section className="space-y-10">
            {practice.tfng.map(q => (
              <div key={q.id} className="space-y-4">
                <p className="font-bold text-slate-800 italic leading-relaxed">"{q.statement}"</p>
                <div className="flex flex-wrap gap-2">
                  {['True', 'False', 'Not Given'].map(choice => (
                    <button
                      key={choice}
                      onClick={() => !showResults && setUserAnswers(prev => ({ ...prev, [`tf-${q.id}`]: choice }))}
                      className={`px-6 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                        userAnswers[`tf-${q.id}`] === choice
                          ? showResults
                            ? choice === q.answer ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'
                            : 'bg-indigo-600 border-indigo-600 text-white'
                          : showResults && choice === q.answer ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
                {showResults && (
                  <div className="p-4 bg-indigo-50/50 rounded-xl text-xs flex gap-2 text-indigo-700 border border-indigo-100">
                    <SparkleIcon /> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </section>

          <div className="mt-12 pt-8 border-t border-slate-100">
             {!showResults ? (
               <button 
                onClick={() => setShowResults(true)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
               >
                 Submit Test <ChevronRight className="w-5 h-5" />
               </button>
             ) : (
               <div className="p-8 bg-indigo-600 rounded-[2rem] text-white text-center">
                 <h4 className="text-3xl font-black mb-1">{score}/{total} Correct</h4>
                 <p className="text-indigo-100 mb-6 font-medium">Estimated Band: {score === total ? '8.5+' : score >= 4 ? '7.0' : '5.5'}</p>
                 <button onClick={fetchPractice} className="bg-white text-indigo-600 px-10 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">Start New Passage</button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SparkleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L14.5 9L21 11.5L14.5 14L12 21L9.5 14L3 11.5L9.5 9L12 3Z" fill="currentColor"/>
  </svg>
);

export default ReadingTask;

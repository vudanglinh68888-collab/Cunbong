
import React, { useState } from 'react';
import { generateAssessmentQuestion, finalizeAssessment, generateLearningPath } from '../services/geminiService';
import { UserProfile, AssessmentQuestion, AssessmentResult, LearningGoal, LearningPath } from '../types';
import { ShieldCheck, ArrowRight, Loader2, Target, Sparkles, CheckCircle, AlertCircle, BookOpen, MessageSquare, Briefcase, HelpCircle } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onComplete: (assessment: AssessmentResult, goal: LearningGoal, roadmap: LearningPath) => void;
}

const AssessmentCenter: React.FC<Props> = ({ profile, onComplete }) => {
  const [step, setStep] = useState<'intro' | 'testing' | 'goal' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [history, setHistory] = useState<{ question: string, correct: boolean, difficulty: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [roadmap, setRoadmap] = useState<LearningPath | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const TOTAL_QUESTIONS = 10;

  const fetchNextQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setFeedback(null);
    try {
      const q = await generateAssessmentQuestion(profile, history, difficulty);
      setCurrentQuestion(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStep('testing');
    fetchNextQuestion();
  };

  const handleAnswer = (ans: string) => {
    if (feedback) return;
    setSelectedAnswer(ans);
    const isCorrect = ans === currentQuestion?.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect && difficulty === 'easy') setDifficulty('medium');
    else if (isCorrect && difficulty === 'medium') setDifficulty('hard');
    else if (!isCorrect && difficulty === 'hard') setDifficulty('medium');
    else if (!isCorrect && difficulty === 'medium') setDifficulty('easy');

    setHistory([...history, { 
      question: currentQuestion?.question || '', 
      correct: isCorrect, 
      difficulty: difficulty 
    }]);

    setTimeout(() => {
      if (history.length + 1 >= TOTAL_QUESTIONS) {
        finishAssessment();
      } else {
        fetchNextQuestion();
      }
    }, 1500);
  };

  const finishAssessment = async () => {
    setLoading(true);
    try {
      const res = await finalizeAssessment(profile, history);
      setAssessment(res);
      setStep('goal');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSelect = async (goal: LearningGoal) => {
    setSelectedGoal(goal);
    setLoading(true);
    try {
      if (assessment) {
        const path = await generateLearningPath(profile, assessment, goal);
        setRoadmap(path);
        setStep('result');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'intro') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[50px] p-12 shadow-2xl border-8 border-white animate-fadeIn text-center space-y-8">
        <div className="w-24 h-24 bg-sky-100 rounded-[35px] flex items-center justify-center text-sky-600 mx-auto shadow-inner">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-4xl font-kids text-sky-600 leading-tight">AI Assessment Center</h2>
        <p className="text-gray-500 text-xl font-medium px-4">
          Chào bé! Hãy cùng kiểm tra năng lực tiếng Anh của bé để tạo lộ trình học tập riêng biệt nhé!
        </p>
        <button 
          onClick={handleStart}
          className="w-full py-5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-[30px] shadow-xl transition-all flex items-center justify-center gap-3 text-xl"
        >
          Bắt đầu ngay <ArrowRight />
        </button>
      </div>
    );
  }

  if (step === 'testing') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center bg-white p-6 rounded-[35px] shadow-xl border-4 border-sky-50">
          <div className="flex flex-col gap-2">
            <div className="text-sky-900 font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Câu hỏi {history.length + 1} / {TOTAL_QUESTIONS}
            </div>
            <div className="h-3 w-48 bg-sky-50 rounded-full overflow-hidden border border-sky-100 shadow-inner">
               <div className="h-full bg-sky-500 transition-all duration-500 rounded-full" style={{ width: `${((history.length + (loading ? 0 : 1)) / TOTAL_QUESTIONS) * 100}%` }}></div>
            </div>
          </div>
          <div className={`px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${
            difficulty === 'hard' ? 'bg-red-100 text-red-600' : 
            difficulty === 'medium' ? 'bg-orange-100 text-orange-600' : 
            'bg-green-100 text-green-600'
          } border-2 border-current shadow-sm`}>
            {difficulty} mode
          </div>
        </div>

        {loading && !currentQuestion ? (
          <div className="bg-white p-24 rounded-[50px] shadow-2xl flex flex-col items-center justify-center space-y-6 border-8 border-white">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-sky-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-yellow-400 animate-pulse" />
              </div>
            </div>
            <p className="font-kids text-2xl text-sky-600 animate-pulse">AI đang chuẩn bị câu hỏi...</p>
          </div>
        ) : currentQuestion && (
          <div className="bg-white rounded-[50px] p-12 shadow-2xl border-8 border-white space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <HelpCircle size={150} />
            </div>
            
            <div className="space-y-4 relative z-10">
              {currentQuestion.vietnameseInstruction && (
                <div className="inline-block bg-sky-50 text-sky-600 px-4 py-1 rounded-full text-sm font-bold border border-sky-100 mb-2">
                  {currentQuestion.vietnameseInstruction}
                </div>
              )}
              <h3 className="text-4xl md:text-5xl font-kids text-indigo-950 leading-tight">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={!!feedback}
                  onClick={() => handleAnswer(opt)}
                  className={`p-8 rounded-[40px] border-4 text-left font-bold text-2xl transition-all shadow-lg active:scale-95 ${
                    selectedAnswer === opt
                      ? feedback === 'correct' 
                        ? 'bg-green-500 border-green-200 text-white shadow-green-100 scale-105' 
                        : 'bg-red-500 border-red-200 text-white shadow-red-100'
                      : feedback === 'correct' && opt === currentQuestion.answer
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-white border-sky-50 hover:border-sky-400 text-indigo-900 hover:shadow-sky-100 hover:bg-sky-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 ${
                       selectedAnswer === opt ? 'bg-white/20 border-white' : 'bg-sky-50 border-sky-200 text-sky-400'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    {opt}
                  </div>
                </button>
              ))}
            </div>

            {feedback && (
              <div className={`p-6 rounded-[30px] border-4 animate-slideInUp flex items-center gap-4 text-xl font-bold ${
                feedback === 'correct' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md ${
                  feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {feedback === 'correct' ? <CheckCircle /> : <AlertCircle />}
                </div>
                <div>
                  {feedback === 'correct' ? 'Tuyệt vời! Bé đã trả lời đúng rồi!' : `Ồ! Đáp án đúng là: ${currentQuestion.answer}`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (step === 'goal') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[50px] p-12 shadow-2xl border-8 border-white animate-fadeIn text-center space-y-8">
        <div className="w-24 h-24 bg-indigo-100 rounded-[35px] flex items-center justify-center text-indigo-600 mx-auto">
          <Target size={48} />
        </div>
        <h2 className="text-4xl font-kids text-sky-600">Mục tiêu của bé là gì?</h2>
        <p className="text-gray-500 text-xl font-medium">Chọn mục tiêu để AI lên lộ trình phù hợp nhất.</p>
        
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'School Exams', name: 'Điểm cao trên lớp', icon: <BookOpen />, desc: 'Tập trung ngữ pháp và từ vựng sách giáo khoa.' },
            { id: 'Communication', name: 'Giao tiếp tự tin', icon: <MessageSquare />, desc: 'Tập trung nghe nói và phản xạ tự nhiên.' },
            { id: 'Both', name: 'Cả hai mục tiêu', icon: <Briefcase />, desc: 'Phát triển toàn diện 4 kỹ năng.' }
          ].map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleGoalSelect(goal.id as LearningGoal)}
              disabled={loading}
              className="p-6 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-indigo-400 rounded-3xl text-left transition-all flex items-center gap-6 group disabled:opacity-50"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                {goal.icon}
              </div>
              <div>
                <h4 className="font-bold text-xl text-slate-800">{goal.name}</h4>
                <p className="text-sm text-gray-500">{goal.desc}</p>
              </div>
              <ArrowRight className="ml-auto text-gray-300 group-hover:text-indigo-500" />
            </button>
          ))}
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-3 text-indigo-500 font-bold">
            <Loader2 className="animate-spin" />
            AI đang lên kế hoạch học tập...
          </div>
        )}
      </div>
    );
  }

  if (step === 'result' && assessment && roadmap && selectedGoal) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
        <div className="bg-white rounded-[50px] p-12 shadow-2xl border-8 border-white text-center space-y-8 relative overflow-hidden">
          <div className="inline-block px-8 py-3 rounded-full font-black text-xl uppercase tracking-widest bg-sky-100 text-sky-600 border-2 border-sky-200">
            Level: {assessment.proficiency}
          </div>
          <h2 className="text-4xl font-kids text-sky-600">Kết quả đánh giá</h2>
          <div className="bg-sky-50 p-8 rounded-[40px] border-2 border-sky-100 text-sky-700 font-medium text-xl leading-relaxed italic">
            "{assessment.explanation}"
          </div>
          <button 
            onClick={() => onComplete(assessment, selectedGoal, roadmap)}
            className="w-full py-5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-[30px] shadow-xl transition-all text-xl"
          >
            Xem Lộ trình Học tập <ArrowRight className="inline-block ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-12 h-12 text-sky-500" /></div>;
};

export default AssessmentCenter;

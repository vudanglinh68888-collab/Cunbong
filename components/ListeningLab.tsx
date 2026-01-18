
import React, { useState, useEffect } from 'react';
import { generateQuiz, generateImage, textToSpeech, playAudio } from '../services/geminiService';
import { QuizQuestion, UserProfile, AppMode } from '../types';
import { Volume2, Trophy, Zap, Star, ChevronLeft, Award } from 'lucide-react';

interface Props {
  profile: UserProfile;
  activeMode: AppMode;
  onComplete: (xp: number) => void;
}

const ListeningLab: React.FC<Props> = ({ profile, activeMode, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [optionImages, setOptionImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [perfectQuiz, setPerfectQuiz] = useState(true);

  const loadQuiz = async () => {
    setLoading(true);
    setSessionXP(0);
    setPerfectQuiz(true);
    try {
      const qz = await generateQuiz(profile, activeMode);
      setQuestions(qz);
      
      const imgs: Record<string, string> = {};
      const firstQ = qz[0];
      if (firstQ) {
        const imgPromises = firstQ.options.concat(firstQ.word).map(async (opt) => {
            imgs[opt] = await generateImage(opt);
        });
        await Promise.all(imgPromises);
      }
      setOptionImages(imgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!questions[currentIdx]) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audio = await textToSpeech(questions[currentIdx].word);
    await playAudio(audio, ctx);
  };

  const checkAnswer = async (ans: string) => {
    if (feedback) return;
    const isCorrect = ans === questions[currentIdx].word;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    // XP Logic based on Game Master Rules
    if (activeMode === 'Game') {
      if (isCorrect) {
        setSessionXP(prev => prev + 10);
      } else {
        setSessionXP(prev => prev + 5);
        setPerfectQuiz(false);
      }
    } else {
      if (isCorrect) setSessionXP(prev => prev + 20);
    }

    setTimeout(async () => {
      setFeedback(null);
      if (currentIdx < questions.length - 1) {
        const nextIdx = currentIdx + 1;
        setLoading(true);
        const nextQ = questions[nextIdx];
        const imgs: Record<string, string> = {};
        const imgPromises = nextQ.options.concat(nextQ.word).map(async (opt) => {
            imgs[opt] = await generateImage(opt);
        });
        await Promise.all(imgPromises);
        setOptionImages(imgs);
        setCurrentIdx(nextIdx);
        setLoading(false);
      } else {
        setCurrentIdx(currentIdx + 1);
      }
    }, 2000);
  };

  useEffect(() => {
    loadQuiz();
  }, [profile, activeMode]);

  if (loading && questions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-xl">
            <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="mt-4 font-kids text-sky-500">
              {activeMode === 'Game' ? '🎮 Game Master is loading your challenge...' : `Chuẩn bị bài nghe Lớp ${profile.grade}...`}
            </p>
        </div>
      );
  }

  if (questions.length > 0 && currentIdx >= questions.length) {
      const finalXP = (activeMode === 'Game' && perfectQuiz) ? sessionXP + 20 : sessionXP;
      return (
        <div className="text-center p-16 bg-white rounded-[50px] shadow-2xl space-y-8 border-8 border-white animate-fadeIn">
            <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner">
                <Trophy className="text-yellow-500" size={64} />
            </div>
            <h2 className="text-4xl font-kids text-sky-600">
              {activeMode === 'Game' ? 'Level Complete! 🎉🔥' : 'Tuyệt vời! Bé đã hoàn thành!'}
            </h2>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-2">
                <Zap className="text-yellow-400" /> +{finalXP} XP Earned!
              </p>
              {activeMode === 'Game' && perfectQuiz && (
                <p className="text-green-500 font-bold flex items-center justify-center gap-2">
                  <Star fill="currentColor" size={16} /> Perfect Quiz Bonus: +20 XP!
                </p>
              )}
            </div>
            <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100 text-sky-700 font-medium">
              {activeMode === 'Game' ? 'Game Master says: "Amazing performance! Ready for a level up? ⭐"' : 'Chúc mừng bé đã hoàn thành bài tập xuất sắc!'}
            </div>
            <button 
              onClick={() => onComplete(finalXP)} 
              className="px-10 py-4 bg-sky-500 text-white rounded-[25px] font-bold shadow-xl hover:bg-sky-600 transition-all"
            >
              Back to Dashboard
            </button>
        </div>
      );
  }

  const currentQ = questions[currentIdx];
  const allChoices = currentQ ? [...currentQ.options, currentQ.word].sort() : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-center bg-white/60 p-4 rounded-3xl backdrop-blur-md">
        <button onClick={() => onComplete(0)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-sky-600 transition-colors">
          <ChevronLeft /> Quay lại
        </button>
        <div className="flex items-center gap-2 bg-blue-400 text-white px-4 py-1 rounded-full font-bold shadow-sm">
          <Award size={18} /> Tiến độ: {currentIdx + 1}/{questions.length}
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-[30px] shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-sky-100 text-sky-600 px-6 py-2 rounded-full font-bold">Câu {currentIdx + 1}</div>
            <div className="text-gray-400 font-medium text-sm">Cấp độ {profile.level}</div>
          </div>
          <div className="text-orange-500 font-bold text-2xl flex items-center gap-2">
            <Zap size={24} className="text-yellow-400 fill-current" /> {profile.xp + sessionXP}
          </div>
      </div>

      <div className="bg-white rounded-[40px] p-12 shadow-xl border-4 border-sky-100 text-center space-y-8 relative overflow-hidden">
          {activeMode === 'Game' && (
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={120} />
            </div>
          )}
          <p className="text-2xl text-gray-500 font-medium">
            {activeMode === 'Game' ? 'Listen carefully and select the target! 🚀' : 'Bé hãy nghe và chọn hình đúng nhé!'}
          </p>
          <button 
            onClick={handleSpeak}
            className="w-32 h-32 bg-sky-500 rounded-[40px] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all mx-auto flex items-center justify-center group"
          >
            <Volume2 size={48} className="group-hover:animate-bounce" />
          </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
               Array(4).fill(0).map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-[30px] animate-pulse"></div>)
          ) : (
            allChoices.map((choice, i) => (
                <button
                    key={i}
                    onClick={() => checkAnswer(choice)}
                    className={`group relative aspect-square bg-white rounded-[30px] p-6 shadow-xl border-4 transition-all overflow-hidden ${feedback === 'correct' && choice === currentQ.word ? 'border-green-500 scale-105 shadow-green-100' : feedback === 'wrong' && choice !== currentQ.word ? 'border-red-200 opacity-50' : 'border-white hover:border-sky-300'}`}
                >
                    <img src={optionImages[choice]} alt={choice} className="w-full h-full object-contain mb-2" />
                    {feedback === 'correct' && choice === currentQ.word && (
                        <div className="absolute inset-0 bg-green-500/20 flex flex-col items-center justify-center">
                            <span className="text-6xl animate-bounce">✅</span>
                            {activeMode === 'Game' && <span className="text-green-600 font-black text-xl">+10 XP</span>}
                        </div>
                    )}
                    {feedback === 'wrong' && choice === currentQ.word && (
                        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                            <span className="text-2xl font-black text-red-500">Đúng là hình này!</span>
                        </div>
                    )}
                </button>
            ))
          )}
      </div>

      {feedback && activeMode === 'Game' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-sky-100 text-center animate-slideInUp">
           <p className="text-lg font-bold text-sky-600 italic">
             {feedback === 'correct' ? '🔥 Game Master: "Fantastic! Perfect accuracy!"' : '💡 Game Master: "Nice try! Every mistake is a step to victory. +5 XP!"'}
           </p>
        </div>
      )}
    </div>
  );
};

export default ListeningLab;

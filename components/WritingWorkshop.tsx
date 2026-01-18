
import React, { useState, useEffect } from 'react';
import { generateWritingTask, generateImage } from '../services/geminiService';
import { WritingTask, UserProfile, AppMode } from '../types';
import { CheckCircle, Info, RefreshCw, Zap, Trophy, ChevronLeft, Award } from 'lucide-react';

interface Props {
  profile: UserProfile;
  activeMode: AppMode;
  onComplete: (xp: number) => void;
}

const WritingWorkshop: React.FC<Props> = ({ profile, activeMode, onComplete }) => {
  const [task, setTask] = useState<WritingTask | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const loadTask = async () => {
    setLoading(true);
    setInputValue('');
    setIsSuccess(false);
    setAttempts(0);
    try {
      const t = await generateWritingTask(profile, activeMode);
      setTask(t);
      const img = await generateImage(t.imagePrompt);
      setImageUrl(img);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkText = () => {
    if (!task) return;
    if (inputValue.trim().toLowerCase() === task.targetText.toLowerCase()) {
      setIsSuccess(true);
    } else {
      setAttempts(a => a + 1);
    }
  };

  useEffect(() => {
    loadTask();
  }, [profile, activeMode]);

  const calculateXP = () => {
    if (activeMode === 'Game') {
      if (attempts === 0) return 30; // Perfect first try bonus
      if (attempts < 3) return 15;
      return 10;
    }
    return 50;
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white/60 p-4 rounded-3xl backdrop-blur-md">
        <button onClick={() => onComplete(0)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-sky-600 transition-colors">
          <ChevronLeft /> Quay lại
        </button>
        <div className="flex items-center gap-2 bg-pink-400 text-white px-4 py-1 rounded-full font-bold shadow-sm">
          <Award size={18} /> Luyện viết chữ
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="text-gray-400 font-kids">Lớp {profile.grade} • Cấp độ {profile.level}</div>
          <div className="text-orange-500 font-bold flex items-center gap-2">
            <Zap size={20} className="text-yellow-400 fill-current" /> {profile.xp} XP
          </div>
      </div>

      {loading ? (
        <div className="bg-white p-24 rounded-[40px] shadow-xl flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
             <p className="mt-4 font-kids text-sky-500">
               {activeMode === 'Game' ? 'Game Master is crafting a quest...' : `Đang chuẩn bị bài tập Lớp ${profile.grade}...`}
             </p>
        </div>
      ) : task && (
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-8 border-white overflow-hidden space-y-8 relative">
          <div className="aspect-video bg-gray-50 rounded-[30px] overflow-hidden border-2 border-sky-50 flex items-center justify-center relative">
              <img src={imageUrl} alt="Prompt" className="w-full h-full object-contain" />
              {activeMode === 'Game' && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg">
                  CHALLENGE
                </div>
              )}
          </div>
          
          <div className="text-center space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-kids text-sky-600">
                    {task.type === 'sentence' ? 'Hoàn thành câu sau:' : 'Đây là gì thế bé?'}
                </h3>
                <button onClick={loadTask} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-sky-50 transition-all"><RefreshCw /></button>
              </div>

              <div className="bg-sky-50 p-6 rounded-[30px] border-2 border-sky-100 flex items-start gap-4 text-left">
                  <span className="text-xl">💡</span>
                  <p className="text-sky-700 font-medium text-lg leading-relaxed">{task.hint}</p>
              </div>

              {task.type === 'word' ? (
                <div className="flex gap-2 justify-center flex-wrap">
                    {task.targetText.split('').map((char, i) => (
                        <div key={i} className="w-12 h-16 border-b-4 border-sky-200 flex items-center justify-center text-4xl font-bold text-sky-600 bg-gray-50 rounded-t-xl">
                            {isSuccess ? char : (inputValue[i] || '')}
                        </div>
                    ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-sky-100 min-h-[60px] flex items-center justify-center italic text-gray-400 text-2xl">
                    {isSuccess ? task.targetText : '...'}
                </div>
              )}

              <div className="relative">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSuccess}
                  onKeyPress={(e) => e.key === 'Enter' && checkText()}
                  placeholder={task.type === 'sentence' ? 'Viết lại câu hoàn chỉnh...' : 'Nhập chữ vào đây...'}
                  className={`w-full p-6 bg-gray-50 border-4 rounded-[30px] text-center text-2xl font-bold transition-all placeholder:text-gray-300 outline-none ${isSuccess ? 'border-green-400 text-green-600 bg-green-50' : 'border-transparent text-sky-600 focus:border-sky-400'}`}
                />
                {isSuccess && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckCircle size={32} />
                    </div>
                )}
              </div>

              {isSuccess ? (
                  <div className="space-y-6 animate-fadeIn">
                      <div className="bg-green-50 p-6 rounded-[30px] border-2 border-green-200">
                        <p className="text-green-600 font-bold text-2xl mb-2 flex items-center justify-center gap-2">
                           {activeMode === 'Game' ? <Trophy className="text-yellow-500" /> : '🌟'}
                           {activeMode === 'Game' ? 'Quest Completed!' : 'Chính xác! Bé giỏi lắm!'}
                        </p>
                        <p className="text-green-500 font-kids text-xl">+ {calculateXP()} XP Gained</p>
                        {activeMode === 'Game' && attempts === 0 && (
                          <p className="text-yellow-600 font-bold text-sm mt-1 animate-pulse">⭐ FLAME STREAK BONUS: +10 XP ⭐</p>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <button onClick={loadTask} className="flex-1 py-4 bg-sky-50 text-sky-600 rounded-[25px] font-bold border-2 border-sky-100 hover:bg-sky-100 transition-all">Bài tiếp theo</button>
                        <button onClick={() => onComplete(calculateXP() + (attempts === 0 ? 10 : 0))} className="flex-1 py-4 bg-sky-500 text-white rounded-[25px] font-bold shadow-xl hover:bg-sky-600 transition-all">Nhận thưởng</button>
                      </div>
                  </div>
              ) : (
                  <button 
                    onClick={checkText}
                    className="w-full py-5 bg-sky-500 text-white font-bold rounded-[30px] shadow-xl hover:bg-sky-600 active:scale-95 transition-all text-xl"
                  >
                    {activeMode === 'Game' ? 'Submit Answer' : 'Kiểm tra bài làm'}
                  </button>
              )}

              {attempts > 2 && !isSuccess && (
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 animate-pulse">
                    <p className="text-orange-500 font-bold">
                        {activeMode === 'Game' ? 'Game Master says: "Keep going! You are almost there! 💡"' : `Gợi ý: Cố lên bé ơi! ${task.type === 'word' ? `Từ này có ${task.targetText.length} chữ cái.` : 'Bé chú ý ngữ pháp nhé!'}`}
                    </p>
                  </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingWorkshop;

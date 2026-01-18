
import React from 'react';
import { AppMode } from '../types';
import { Sparkles, ShieldAlert, ShieldCheck, Gamepad2 } from 'lucide-react';

interface Props {
  activeMode: AppMode;
  onSelect: (mode: AppMode) => void;
}

const ModeSelector: React.FC<Props> = ({ activeMode, onSelect }) => {
  const modes: { id: AppMode; name: string; icon: React.ReactNode; desc: string; color: string }[] = [
    { id: 'Adventure', name: 'Học & Chơi', icon: <Gamepad2 />, desc: 'Học tập với trợ lý AI & Kiếm XP', color: 'text-sky-500' },
    { id: 'Test', name: 'Kiểm tra', icon: <ShieldAlert />, desc: 'Thử thách nâng cao', color: 'text-red-500' },
    { id: 'Assessment', name: 'Đánh giá', icon: <ShieldCheck />, desc: 'Kiểm tra trình độ đầu vào', color: 'text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {modes.map(mode => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className={`p-6 rounded-[35px] border-4 transition-all flex items-center gap-6 ${activeMode === mode.id ? 'bg-white border-sky-400 shadow-xl scale-105' : 'bg-gray-50 border-transparent hover:border-gray-200 opacity-60'}`}
        >
          <div className={`text-4xl p-4 bg-white rounded-2xl shadow-sm ${mode.color}`}>{mode.icon}</div>
          <div className="text-left">
            <p className="font-kids text-xl text-gray-700 leading-tight">{mode.name}</p>
            <p className="text-sm text-gray-400 font-medium mt-1">{mode.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;

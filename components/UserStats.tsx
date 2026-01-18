
import React from 'react';
import { UserProfile } from '../types';
import { Award, Zap, Clock, Calendar, Flame } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

const UserStats: React.FC<Props> = ({ profile }) => {
  const nextLevelXP = profile.level * 500;
  const currentLevelXP = (profile.level - 1) * 500;
  const progress = ((profile.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const formatTime = (seconds: number) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Award size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-kids shadow-inner border border-white/30">
              {profile.level}
            </div>
            <div>
              <h3 className="text-2xl font-kids">Cấp độ {profile.level}</h3>
              <p className="text-sky-100 font-medium flex items-center gap-1">
                <Zap size={16} className="text-yellow-300" /> {profile.xp} XP tích lũy
              </p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md space-y-2">
            <div className="flex justify-between text-sm font-bold opacity-80">
              <span>Tiến trình lên Cấp {profile.level + 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/20">
              <div 
                className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(253,224,71,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[30px] shadow-lg border-2 border-orange-50 flex items-center gap-4 group hover:scale-[1.02] transition-all">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-orange-500 group-hover:text-white transition-colors relative">
            <Flame size={28} className={profile.streak > 0 ? "fill-orange-500 text-orange-500 animate-pulse" : ""} />
            {profile.streak > 3 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            )}
          </div>
          <div>
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Chuỗi ngày</p>
            <p className="text-2xl font-black text-orange-600">{profile.streak || 0} Ngày</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[30px] shadow-lg border-2 border-sky-50 flex items-center gap-4 group hover:scale-[1.02] transition-all">
          <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-sky-500 group-hover:text-white transition-colors">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Hôm nay</p>
            <p className="text-2xl font-black text-sky-600">{formatTime(profile.dailyStudyTime)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[30px] shadow-lg border-2 border-indigo-50 flex items-center gap-4 group hover:scale-[1.02] transition-all">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Tuần này</p>
            <p className="text-2xl font-black text-indigo-600">{formatTime(profile.weeklyStudyTime)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[30px] shadow-lg border-2 border-purple-50 flex items-center gap-4 group hover:scale-[1.02] transition-all">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <Award size={28} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Tháng này</p>
            <p className="text-2xl font-black text-purple-600">{formatTime(profile.monthlyStudyTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;


import React, { useState } from 'react';
import { User, UserProfile, Skill } from '../types';
import { Sparkles, ArrowRight, Zap, Target, Award, PlayCircle, BookOpen, Mic, PenTool, Headphones, Calendar, Mail, Loader2, BrainCircuit } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/dbService';
import WeeklyReport from './WeeklyReport';

interface DashboardProps {
  profile: UserProfile;
  onStart: (skill: Skill) => void;
  // Support for IELTS user if needed
  user?: User;
  onNavigate?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onStart, user, onNavigate }) => {
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const vocabStats = dbService.getVocabStats(profile.id);

  const handleShowWeeklyReport = async () => {
    setIsGenerating(true);
    try {
      const lessons = dbService.getLessons(profile.id);
      const submissions = dbService.getWritingSubmissions(profile.id);
      
      // Convert UserProfile to User for the IELTS-focused reporting if necessary, or pass the profile
      const userObj: User = user || {
        id: profile.id,
        email: profile.email,
        current_band: 5.5, // Default for profile
        target_band: 7.5,
        created_at: new Date().toISOString()
      };

      const report = await geminiService.generateWeeklyReport(userObj, lessons, submissions);
      setWeeklyReport(report);
      setTimeout(() => {
        window.scrollTo({ top: 1000, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Could not generate report. Practice more to get enough data!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Welcome Header */}
      <header className="relative p-6 md:p-10 bg-indigo-600 rounded-[2.5rem] text-white overflow-hidden shadow-2xl shadow-indigo-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Hi, {profile.email.split('@')[0]}! 👋</h2>
            <p className="text-indigo-100 text-lg font-medium opacity-90">
              Lớp {profile.grade}. Hôm nay chúng ta sẽ chinh phục {profile.topic}.
            </p>
          </div>
          <button 
            onClick={() => onStart('Vocabulary')}
            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-xl w-fit"
          >
            Bắt đầu bài học <ArrowRight size={20} />
          </button>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Target className="text-indigo-600" />} label="Cấp độ" value={`${profile.level}`} color="bg-indigo-50" />
        <StatCard icon={<Zap className="text-orange-500" />} label="Chuỗi" value={`${profile.streak} Ngày`} color="bg-orange-50" />
        <StatCard icon={<BrainCircuit className="text-emerald-500" />} label="XP" value={`${profile.xp}`} color="bg-emerald-50" />
        <StatCard icon={<Award className="text-blue-500" />} label="Tiến trình" value="65%" color="bg-blue-50" />
      </div>

      {/* Weekly Insight Section */}
      <div className="bg-white p-1 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Calendar size={40} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Premium Weekly Review</span>
                 <span className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600">
                   <Mail size={12} /> Auto-dispatch: Sun 07:00 AM
                 </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Weekly Strategic Insight</h3>
              <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                Đánh giá tổng quát năng lực và lộ trình học tập được cá nhân hóa gửi trực tiếp vào email <strong>{profile.email}</strong> vào sáng Chủ Nhật hàng tuần.
              </p>
            </div>
          </div>
          <button 
            onClick={handleShowWeeklyReport}
            disabled={isGenerating}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {weeklyReport ? "Refresh Report" : "Generate Sunday Preview"}
          </button>
        </div>
      </div>

      {/* Skill Practice Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Sparkles size={20} className="text-yellow-500" /> Luyện tập 4 kỹ năng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PracticeCard 
            title="Listening Lab" 
            desc="Nghe Podcast & trả lời câu hỏi thực tế." 
            icon={<Headphones className="text-blue-600" />} 
            color="border-blue-100 hover:bg-blue-50"
            onClick={() => onStart('Listening')}
          />
          <PracticeCard 
            title="Reading Room" 
            desc="Đọc báo học thuật & Matching Headings." 
            icon={<BookOpen className="text-emerald-600" />} 
            color="border-emerald-100 hover:bg-emerald-50"
            onClick={() => onStart('Reading')}
          />
          <PracticeCard 
            title="Writing Studio" 
            desc="Viết Essay & AI chấm điểm tức thì." 
            icon={<PenTool className="text-orange-600" />} 
            color="border-orange-100 hover:bg-orange-50"
            onClick={() => onStart('Writing')}
          />
          <PracticeCard 
            title="Speaking Center" 
            desc="Ghi âm & phân tích phát âm AI." 
            icon={<Mic className="text-purple-600" />} 
            color="border-purple-100 hover:bg-purple-50"
            onClick={() => onStart('Speaking')}
          />
        </div>
      </div>

      {weeklyReport && <WeeklyReport report={weeklyReport} userEmail={profile.email} />}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className={`p-5 rounded-[2rem] border border-transparent shadow-sm ${color}`}>
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">{icon}</div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-black text-slate-900 mt-1">{value}</p>
  </div>
);

const PracticeCard = ({ title, desc, icon, color, onClick }: { title: string, desc: string, icon: React.ReactNode, color: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-6 bg-white border-2 rounded-[2.5rem] flex items-center gap-6 transition-all duration-300 text-left group ${color}`}
  >
    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-lg font-black text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
      <ArrowRight size={24} />
    </div>
  </button>
);

export default Dashboard;

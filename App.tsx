
import React, { useState, useEffect } from 'react';
import { UserProfile, AppMode, AssessmentResult, LearningGoal, LearningPath, Skill } from './types';
import Dashboard from './components/Dashboard';
import AssessmentCenter from './components/AssessmentCenter';
import VocabularyAdventure from './components/VocabularyAdventure';
import SpeakingStudio from './components/SpeakingStudio';
import ReadingRoom from './components/ReadingRoom';
import WritingWorkshop from './components/WritingWorkshop';
import AssistantChat from './components/AssistantChat';
import LearningPathView from './components/LearningPathView';
import { Sparkles, GraduationCap, Map, Gamepad2, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'landing' | 'assessment' | 'main'>('landing');
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'chat' | 'play'>('home');
  const [activeActivity, setActiveActivity] = useState<Skill | null>(null);

  // Form states for landing
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState<number>(2);

  const startAssessment = () => {
    if (!email) return alert("Nhập email để Gấu Teddy nhận ra bé nhé!");
    setProfile({
      id: crypto.randomUUID(),
      email,
      grade: grade as any,
      topic: 'School & Friends',
      mode: 'Bilingual',
      xp: 0,
      level: 1,
      streak: 0,
      dailyStudyTime: 0,
      weeklyStudyTime: 0,
      monthlyStudyTime: 0
    });
    setView('assessment');
  };

  const handleAssessmentComplete = (res: AssessmentResult, goal: LearningGoal, roadmap: LearningPath) => {
    setProfile(prev => prev ? ({
      ...prev,
      proficiency: res.proficiency as any,
      roadmap
    }) : null);
    setView('main');
  };

  const updateXP = (amount: number) => {
    if (!profile) return;
    const newXP = profile.xp + amount;
    const newLevel = Math.floor(newXP / 500) + 1;
    setProfile({ ...profile, xp: newXP, level: newLevel });
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[50px] p-10 shadow-2xl text-center space-y-8 border-8 border-white animate-fadeIn">
          <div className="w-24 h-24 bg-sky-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
             <GraduationCap className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-sky-600 tracking-tight">KidoEnglish AI</h1>
          <p className="text-gray-500 font-medium">Hành trình chinh phục Tiếng Anh bắt đầu từ đây!</p>
          
          <div className="space-y-4 text-left">
            <label className="text-xs font-black uppercase text-gray-400 ml-4 tracking-widest">Email của bé hoặc ba mẹ</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-5 bg-gray-50 border-4 border-transparent focus:border-sky-300 rounded-[30px] outline-none transition-all font-bold"
              placeholder="example@gmail.com"
            />
            
            <label className="text-xs font-black uppercase text-gray-400 ml-4 tracking-widest">Bé đang học lớp mấy?</label>
            <select 
              value={grade}
              onChange={e => setGrade(Number(e.target.value))}
              className="w-full p-5 bg-sky-50 border-4 border-transparent focus:border-sky-300 rounded-[30px] outline-none transition-all font-bold text-sky-600"
            >
              {[2,3,4,5,6,7,8,9].map(g => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
          </div>

          <button 
            onClick={startAssessment}
            className="w-full py-5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-[30px] shadow-xl shadow-sky-100 transition-all flex items-center justify-center gap-3 text-xl"
          >
            Bắt đầu khám phá <Sparkles />
          </button>
        </div>
      </div>
    );
  }

  if (view === 'assessment') {
    return (
      <div className="min-h-screen bg-sky-50 p-6">
        <AssessmentCenter profile={profile!} onComplete={handleAssessmentComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBFF] flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="fixed bottom-0 left-0 right-0 z-50 md:relative md:w-24 bg-white md:h-screen border-t md:border-t-0 md:border-r flex md:flex-col items-center justify-around md:justify-center gap-4 py-4 md:py-8">
        <NavIcon active={activeTab === 'home'} onClick={() => {setActiveTab('home'); setActiveActivity(null)}} icon={<Gamepad2 />} label="Home" />
        <NavIcon active={activeTab === 'map'} onClick={() => {setActiveTab('map'); setActiveActivity(null)}} icon={<Map />} label="Roadmap" />
        <NavIcon active={activeTab === 'chat'} onClick={() => {setActiveTab('chat'); setActiveActivity(null)}} icon={<Heart />} label="Teddy" />
      </aside>

      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        {activeActivity ? (
          <div>
            {activeActivity === 'Vocabulary' && <VocabularyAdventure profile={profile!} onComplete={(xp) => {updateXP(xp); setActiveActivity(null)}} />}
            {activeActivity === 'Speaking' && <SpeakingStudio profile={profile!} activeMode="Adventure" onComplete={(xp) => {updateXP(xp); setActiveActivity(null)}} />}
            {activeActivity === 'Reading' && <ReadingRoom profile={profile!} activeMode="Adventure" onComplete={(xp) => {updateXP(xp); setActiveActivity(null)}} />}
            {activeActivity === 'Writing' && <WritingWorkshop profile={profile!} activeMode="Adventure" onComplete={(xp) => {updateXP(xp); setActiveActivity(null)}} />}
          </div>
        ) : (
          <>
            {activeTab === 'home' && <Dashboard profile={profile!} onStart={(skill) => setActiveActivity(skill)} />}
            {activeTab === 'map' && <LearningPathView roadmap={profile!.roadmap!} onStartLesson={(skill) => setActiveActivity(skill)} />}
            {activeTab === 'chat' && <AssistantChat profile={profile!} />}
          </>
        )}
      </main>
    </div>
  );
};

const NavIcon = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${active ? 'bg-sky-100 text-sky-600 scale-110 shadow-sm' : 'text-slate-400 hover:text-sky-400'}`}>
    <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;

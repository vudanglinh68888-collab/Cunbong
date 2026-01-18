
import React from 'react';
import { Home, BookOpen, PenTool, Mic, Headphones, BarChart2, Settings, Server, Sparkles, Clock } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'ai-tutor', label: 'AI Personal Tutor', icon: Sparkles },
    { id: 'stats', label: 'Study History', icon: Clock },
    { id: 'lessons', label: 'Daily Resources', icon: BookOpen },
    { id: 'listening', label: 'Listening Lab', icon: Headphones },
    { id: 'reading', label: 'Reading Room', icon: BookOpen },
    { id: 'writing', label: 'Writing Studio', icon: PenTool },
    { id: 'speaking', label: 'Speaking Center', icon: Mic },
    { id: 'architecture', label: 'System Design', icon: Server },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 hidden md:flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <PenTool className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">IELTS Master</h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

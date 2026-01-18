
import React, { useState } from 'react';
import { askAssistant } from '../services/geminiService';
import { UserProfile, AssistantResponse } from '../types';
import { Send, MessageSquare, HelpCircle, Loader2, Heart, Sparkles, Languages } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

const AssistantChat: React.FC<Props> = ({ profile }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: AssistantResponse }[]>([
    {
      role: 'bot',
      content: {
        answer: profile.mode === 'Bilingual' 
          ? `Chào bé! Thầy là trợ lý AI. Thầy sẽ giúp bé học về chủ đề "${profile.topic}" hôm nay. Bé có thắc mắc gì không?`
          : `Hello! I'm your AI Tutor. Let's learn about "${profile.topic}". Ask me anything!`,
        hint: profile.mode === 'Bilingual'
          ? "Ví dụ: 'Con mèo tiếng Anh là gì?' hoặc 'Đặt câu với từ Cat'."
          : "Example: 'What is a Cat?' or 'Make a sentence with Cat'."
      }
    }
  ]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: { answer: userMsg } }]);
    setLoading(true);
    
    try {
      const botRes = await askAssistant(profile, userMsg);
      setMessages(prev => [...prev, { role: 'bot', content: botRes }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: { 
          answer: profile.mode === 'Bilingual'
            ? "Thầy đang nghĩ chút, bé hỏi lại nhé!"
            : "Thinking... ask me again please!" 
        } 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border-4 border-white h-[600px] flex flex-col overflow-hidden animate-fadeIn">
      <div className="p-6 bg-sky-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <MessageSquare />
          </div>
          <div>
            <h3 className="font-kids text-sky-600 text-xl flex items-center gap-2">
              AI Assistant <Heart size={16} className="text-pink-400 fill-current" />
            </h3>
            <p className="text-xs text-gray-400 font-medium">Supporting Lớp {profile.grade} • Topic: {profile.topic}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-sky-100 shadow-sm">
          {profile.mode === 'Bilingual' ? (
            <div className="flex items-center gap-2">
              <Languages size={14} className="text-indigo-500" />
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Bilingual Support</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest">English Only</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideInUp`}>
            <div className={`max-w-[85%] p-5 rounded-[30px] shadow-sm relative ${
              msg.role === 'user' 
                ? 'bg-sky-500 text-white rounded-tr-none' 
                : 'bg-white text-gray-700 rounded-tl-none border border-sky-100'
            }`}>
              <p className="text-lg leading-relaxed">{msg.content.answer}</p>
              {msg.role === 'bot' && (msg.content.hint || msg.content.example) && (
                <div className="mt-4 pt-4 border-t border-sky-50 space-y-3">
                  {msg.content.hint && (
                    <div className="flex gap-2 items-start text-sm italic text-sky-600 font-medium">
                      <span className="text-xl">💡</span>
                      <p>{msg.content.hint}</p>
                    </div>
                  )}
                  {msg.content.example && (
                    <div className="flex gap-2 items-start text-sm text-gray-500 bg-gray-50 p-3 rounded-2xl border border-dashed border-gray-200">
                      <span className="text-xl">📝</span>
                      <p><span className="font-bold text-gray-700">Example:</span> {msg.content.example}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-3xl flex items-center gap-3 shadow-sm border border-sky-50 animate-pulse">
                <Loader2 className="animate-spin text-sky-500" />
                <span className="text-sm text-gray-400 font-bold tracking-tight">Assistant is typing...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t flex gap-4">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={profile.mode === 'Bilingual' ? "Hỏi thầy bất cứ điều gì..." : "Ask me anything in English!"}
          className="flex-1 p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-sky-400 outline-none transition-all font-medium text-sky-800 placeholder:text-gray-300 shadow-inner"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="p-4 bg-sky-500 text-white rounded-2xl shadow-xl hover:bg-sky-600 disabled:opacity-50 active:scale-95 transition-all shadow-sky-100"
        >
          <Send />
        </button>
      </div>
    </div>
  );
};

export default AssistantChat;

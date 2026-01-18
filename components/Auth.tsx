
import React, { useState } from 'react';
import { Target, Mail, ArrowRight, Sparkles, Award } from 'lucide-react';
import { dbService } from '../services/dbService';
import { User } from '../types';

interface AuthProps {
  onAuth: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [currentBand, setCurrentBand] = useState('5.5');
  const [targetBand, setTargetBand] = useState('7.5');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      current_band: parseFloat(currentBand),
      target_band: parseFloat(targetBand),
      created_at: new Date().toISOString(),
    };
    dbService.saveUser(newUser);
    onAuth(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Award className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">IELTS Master AI</h2>
          <p className="text-slate-500 mt-2 font-medium">Define your roadmap to success.</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email Address
            </label>
            <input 
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. learner@example.com"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Target className="w-3 h-3" /> Current Band
              </label>
              <select 
                value={currentBand}
                onChange={e => setCurrentBand(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold transition-all"
              >
                {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0].map(b => <option key={b}>{b.toFixed(1)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Target Band
              </label>
              <select 
                value={targetBand}
                onChange={e => setTargetBand(e.target.value)}
                className="w-full p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-indigo-700 transition-all"
              >
                {[6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => <option key={b}>{b.toFixed(1)}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 group mt-4"
          >
            Start Learning
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          By continuing, you agree to our 2025 Study Policies.
        </p>
      </div>
    </div>
  );
};

export default Auth;

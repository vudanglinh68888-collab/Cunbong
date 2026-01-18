
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RefreshCw, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { evaluateSpeaking } from '../services/geminiService';
import { Feedback } from '../types';
import FeedbackReport from './FeedbackReport';

const SpeakingTask: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timerRef = useRef<number | null>(null);

  const topic = "Describe a place you visited that you would recommend to others. You should say: where it is, what it is like, what you did there, and explain why you would recommend it.";

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const startRecording = () => {
    setTimer(0);
    setAudioUrl(null);
    setFeedback(null);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioUrl('mock_url');
  };

  const handleAnalyze = async () => {
    setIsEvaluating(true);
    try {
      // For the sake of the demo, we use a mock transcript that would usually come from a STT service.
      const mockTranscript = `I would like to talk about Ha Long Bay, which is a very beautiful place in Vietnam. It's located in the northeast. I visited it last summer with my family. The scenery is amazing with thousands of limestone islands. We took a boat cruise and saw many caves. I recommend it because it is a UNESCO World Heritage site and the seafood there is quite delicious. Actually, the atmosphere is very peaceful and relaxing for tourists.`;
      
      const result = await evaluateSpeaking(topic, mockTranscript);
      setFeedback(result);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Speaking Simulator</h2>
        <p className="text-slate-500 font-medium">Practice Part 2: Individual Long Turn (1-2 minutes)</p>
      </div>

      <div className="glass-card p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden border-2 border-white/50">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
        
        <div className="mb-10">
          <span className="bg-indigo-100 text-indigo-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">Current Cue Card</span>
          <h3 className="text-3xl font-bold text-slate-800 mt-6 leading-tight max-w-2xl mx-auto">
            Describe a place you visited that you would recommend to others.
          </h3>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
            {["Where it is", "What it is like", "What you did there", "Explain why you recommend it"].map((point, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className={`relative transition-all duration-500 ${isRecording ? 'pulse-ring' : ''}`}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
              }`}
            >
              {isRecording ? (
                <Square className="text-white w-12 h-12 fill-white animate-pulse" />
              ) : (
                <Mic className="text-white w-12 h-12" />
              )}
            </button>
          </div>

          <div className={`text-6xl font-mono font-black transition-all ${isRecording ? 'text-red-500 scale-110' : 'text-slate-800'}`}>
            {formatTime(timer)}
          </div>

          {audioUrl && !isRecording && (
            <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center animate-in fade-in zoom-in duration-500">
              <button className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-[2rem] font-black transition-all">
                <Play className="w-5 h-5 fill-slate-700" />
                Listen Again
              </button>
              <button 
                onClick={handleAnalyze}
                disabled={isEvaluating}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-[2rem] font-black transition-all shadow-2xl shadow-indigo-200 hover:scale-[1.05]"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Examiner Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Get Detailed Evaluation
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {feedback && <FeedbackReport feedback={feedback} />}

      {!feedback && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {[
            { icon: Volume2, title: "Pronunciation", desc: "Clarity, intonation, and native-like rhythm" },
            { icon: RefreshCw, title: "Fluency & Coherence", desc: "Flow, speed, and logical connection of ideas" },
            { icon: Sparkles, title: "Lexical Resource", desc: "Range and precision of academic vocabulary" }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-50 group-hover:scale-110 transition-all">
                <item.icon className="w-8 h-8 text-indigo-500" />
              </div>
              <h4 className="font-black text-slate-800 mb-2 text-lg">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpeakingTask;

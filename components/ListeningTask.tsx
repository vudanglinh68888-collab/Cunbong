
import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Play, Pause, CheckCircle, Info, Loader2, Sparkles, RefreshCcw } from 'lucide-react';
import { generateListeningPractice, generateAudio } from '../services/geminiService';
import { ListeningPractice } from '../types';

const ListeningTask: React.FC = () => {
  const [practice, setPractice] = useState<ListeningPractice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const fetchPractice = async () => {
    setIsLoading(true);
    setShowResults(false);
    setUserAnswers({});
    setAudioBase64(null);
    setAudioBuffer(null);
    if (sourceRef.current) {
      sourceRef.current.stop();
      setIsPlaying(false);
    }

    try {
      const data = await generateListeningPractice("5.0-7.0");
      setPractice(data);
      const audio = await generateAudio(data.transcript);
      setAudioBase64(audio);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPractice();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Decode audio effect
  useEffect(() => {
    if (!audioBase64) return;

    const decode = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }

        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const dataInt16 = new Int16Array(bytes.buffer);
        // Create buffer with correct sample rate
        const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        setAudioBuffer(buffer);
      } catch (e) {
        console.error("Audio decoding error:", e);
      }
    };

    decode();
  }, [audioBase64]);

  const playAudio = async () => {
    if (!audioBuffer || !audioContextRef.current) return;
    
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    // Resume context if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
    sourceRef.current = source;
    setIsPlaying(true);
  };

  if (isLoading || (audioBase64 && !audioBuffer)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Headphones className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-8 h-8" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800">Scouring Podcasts...</h3>
          <p className="text-slate-500">Generating a real-world listening challenge for your band.</p>
        </div>
      </div>
    );
  }

  if (!practice) return null;

  const score = Object.keys(userAnswers).filter(id => userAnswers[Number(id)] === practice.questions.find(q => q.id === Number(id))?.answer).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-bl-[100px] -mr-16 -mt-16 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Listening Practice</span>
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Band 5.0 - 7.0</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{practice.title}</h2>
              <p className="text-slate-500 font-medium">Source: <span className="text-indigo-600 italic">{practice.source}</span></p>
            </div>
            <button onClick={fetchPractice} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-colors">
              <RefreshCcw className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-500 animate-pulse' : 'bg-white/10'}`}>
              <Headphones className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-xl font-bold mb-2">Audio Stream Ready</h4>
              <p className="text-slate-400 text-sm mb-6">Listen carefully. You can play the audio as many times as you need for this practice session.</p>
              <button 
                onClick={playAudio}
                disabled={!audioBuffer}
                className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-indigo-50 transition-all mx-auto md:mx-0 shadow-lg disabled:opacity-50"
              >
                {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
                {isPlaying ? "Pause Track" : (audioBuffer ? "Play Audio" : "Buffering...")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              <CheckCircle className="text-indigo-600 w-6 h-6" />
              Practice Questions
            </h3>
            <div className="space-y-10">
              {practice.questions.map((q) => (
                <div key={q.id} className="space-y-4">
                  <h5 className="font-bold text-slate-800 text-lg flex gap-3">
                    <span className="text-indigo-600">Q{q.id}.</span> {q.question}
                  </h5>
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => !showResults && setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`text-left p-4 rounded-2xl border-2 transition-all font-medium ${
                          userAnswers[q.id] === opt 
                            ? showResults 
                              ? opt === q.answer ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
                              : 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : showResults && opt === q.answer ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {showResults && (
                    <div className="p-4 bg-slate-50 rounded-2xl text-sm border border-slate-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
                      <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-700">Explanation:</span> {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100">
              {!showResults ? (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(userAnswers).length < 5}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  Check Answers
                </button>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-indigo-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center border-2 border-indigo-200">
                      <span className="text-xs font-bold text-slate-400">Score</span>
                      <span className="text-2xl font-black text-indigo-600">{score}/5</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-indigo-900">Session Complete!</h4>
                      <p className="text-indigo-600 text-sm font-medium">Estimated Band: {score >= 4 ? "7.0+" : score >= 2 ? "5.5-6.5" : "Below 5.0"}</p>
                    </div>
                  </div>
                  <button onClick={fetchPractice} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">New Task</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-yellow-500 w-5 h-5" />
              Listening Tips
            </h3>
            <div className="space-y-4">
              {[
                "Look for synonyms in questions. Audio rarely uses the exact words.",
                "Note down plurals (s/es) carefully in gap-fill tasks.",
                "Listen for signposting words like 'however', 'finally', or 'consequently'.",
                "Don't panic if you miss one answer. Focus immediately on the next."
              ].map((tip, idx) => (
                <div key={idx} className="flex gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {showResults && (
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl animate-in fade-in duration-500">
              <h3 className="text-lg font-bold mb-4">Transcript Reference</h3>
              <p className="text-slate-400 text-sm leading-relaxed italic">
                "{practice.transcript}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListeningTask;

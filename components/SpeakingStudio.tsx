
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { UserProfile, AppMode } from '../types';
import { Mic, Square, Sparkles, ChevronLeft, Award, RefreshCw } from 'lucide-react';

interface Props {
  profile: UserProfile;
  activeMode: AppMode;
  onComplete: (xp: number) => void;
}

const SpeakingStudio: React.FC<Props> = ({ profile, activeMode, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState(`Chào bé! Gấu Teddy Lớp ${profile.grade} đã sẵn sàng!`);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  // Optimization: Initialize AudioContexts once and reuse to prevent "Max AudioContexts" error limits
  const ensureAudioContexts = () => {
    if (!audioContextInRef.current || audioContextInRef.current.state === 'closed') {
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!audioContextOutRef.current || audioContextOutRef.current.state === 'closed') {
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    // Resume if suspended (browser policy)
    if (audioContextInRef.current.state === 'suspended') audioContextInRef.current.resume();
    if (audioContextOutRef.current.state === 'suspended') audioContextOutRef.current.resume();
  };

  const startSession = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setStatus('Đang kết nối với Gấu Teddy...');
    
    try {
      ensureAudioContexts();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Đang nghe...');
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!isActive && !sessionRef.current) return; // Prevent leak if stopped
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
            sessionRef.current = scriptProcessor;
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
                // Time sync optimization for unlimited playback
                const currentTime = audioContextOutRef.current.currentTime;
                if (nextStartTimeRef.current < currentTime) {
                    nextStartTimeRef.current = currentTime;
                }
                
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextOutRef.current, 24000);
                const source = audioContextOutRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextOutRef.current.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                if(text) setTranscriptions(prev => [...prev.slice(-4), text]); // Keep history manageable
            }
          },
          onerror: (e) => { 
            console.error(e);
            setStatus('Kết nối bị gián đoạn. Đang thử lại...');
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
            setStatus('Đã ngắt kết nối.');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `You are Teddy, a friendly English tutor for a Grade ${profile.grade} student.
          Topic: ${profile.topic}.
          Persona: Friendly, patient, encouraging.
          Format: Spoken conversation. Keep responses under 15 seconds.`
        }
      });
    } catch (err) {
      console.error(err);
      setStatus('Lỗi micrô hoặc mạng.');
      setIsConnecting(false);
      setIsActive(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // Do NOT close AudioContexts, just suspend them to allow reuse
    if (audioContextInRef.current?.state === 'running') audioContextInRef.current.suspend();
    if (audioContextOutRef.current?.state === 'running') audioContextOutRef.current.suspend();
    
    setIsActive(false);
    setIsConnecting(false);
    nextStartTimeRef.current = 0;
  };

  useEffect(() => {
    return () => {
        // Cleanup on unmount
        stopSession();
        audioContextInRef.current?.close();
        audioContextOutRef.current?.close();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-center bg-white/60 p-4 rounded-3xl backdrop-blur-md">
        <button onClick={() => onComplete(0)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-sky-600 transition-colors">
          <ChevronLeft /> Quay lại
        </button>
        <div className="flex items-center gap-2 bg-green-400 text-white px-4 py-1 rounded-full font-bold shadow-sm">
          <Award size={18} /> +30 XP / phút
        </div>
      </div>

      <div className="bg-white rounded-[50px] p-12 shadow-2xl text-center border-8 border-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 to-green-400"></div>
        <div className="relative inline-block mb-8">
          <div className={`w-48 h-48 bg-orange-100 rounded-[60px] flex items-center justify-center text-8xl transition-all duration-500 ${isActive ? 'scale-110 shadow-2xl animate-bounce' : 'grayscale'}`}>
            🧸
          </div>
          {isActive && (
            <div className="absolute -top-4 -right-4 flex space-x-2">
              <span className="w-6 h-6 bg-green-500 rounded-full animate-ping"></span>
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-kids text-sky-600 mb-2">Bạn Gấu Teddy</h2>
        <p className="text-gray-500 text-xl mb-10 px-6 leading-relaxed font-medium min-h-[3rem]">{status}</p>

        {isActive ? (
          <button 
            onClick={stopSession}
            className="w-full py-5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-[30px] shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <Square fill="white" size={24} />
            Dừng trò chuyện
          </button>
        ) : (
          <button 
            onClick={startSession}
            disabled={isConnecting}
            className={`w-full py-5 text-white font-bold rounded-[30px] shadow-xl transition-all flex items-center justify-center gap-3 ${isConnecting ? 'bg-gray-400' : 'bg-sky-500 hover:bg-sky-600'}`}
          >
            {isConnecting ? <RefreshCw className="animate-spin" /> : <Mic size={24} />}
            {isConnecting ? 'Đang kết nối...' : 'Bắt đầu nói chuyện'}
          </button>
        )}
      </div>

      {transcriptions.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border-4 border-sky-100 shadow-xl space-y-4">
            <h3 className="text-sky-500 font-bold flex items-center gap-2">
                <Sparkles size={20} />
                <span className="text-sm uppercase tracking-widest">Phụ đề AI (Live)</span>
            </h3>
            <div className="space-y-3">
                {transcriptions.map((t, i) => (
                    <p key={i} className="text-sky-800 text-xl font-medium animate-slideInRight">{t}</p>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingStudio;

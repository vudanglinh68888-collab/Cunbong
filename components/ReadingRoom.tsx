
import React, { useState, useEffect } from 'react';
import { generateStory, generateImage, textToSpeech, playAudio } from '../services/geminiService';
import { downloadService } from '../services/downloadService';
import { Story, UserProfile, AppMode } from '../types';
import { Volume2, RefreshCw, ChevronLeft, Award, Download } from 'lucide-react';

interface Props {
  profile: UserProfile;
  activeMode: AppMode;
  onComplete: (xp: number) => void;
}

const ReadingRoom: React.FC<Props> = ({ profile, activeMode, onComplete }) => {
  const [story, setStory] = useState<Story | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const loadStory = async () => {
    setLoading(true);
    try {
      const newStory = await generateStory(profile, activeMode);
      setStory(newStory);
      const img = await generateImage(newStory.imagePrompt);
      setImageUrl(img);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = async () => {
    if (!story || speaking) return;
    setSpeaking(true);
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audio = await textToSpeech(story.content);
    await playAudio(audio, ctx);
    setTimeout(() => setSpeaking(false), 5000);
  };
  
  const handleDownload = () => {
    if (story) {
      downloadService.downloadStory(story, imageUrl);
    }
  };

  useEffect(() => { loadStory(); }, []);

  const finishXP = activeMode === 'Game' ? 100 : activeMode === 'Test' ? 150 : 50;

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-center bg-white/60 p-4 rounded-3xl backdrop-blur-md">
        <button onClick={() => onComplete(0)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-sky-600 transition-colors">
          <ChevronLeft /> Quay lại
        </button>
        <div className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-1 rounded-full font-bold shadow-sm">
          <Award size={18} /> +{finishXP} XP
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] shadow-xl space-y-4">
          <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="text-sky-600 font-bold animate-pulse">AI {activeMode} đang chuẩn bị truyện...</p>
        </div>
      ) : story && (
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border-8 border-white group">
          <div className="w-full md:w-1/2 min-h-[400px] bg-gray-100 relative">
            <img src={imageUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute top-0 left-0 m-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl font-kids text-sky-600 shadow-lg">
               Grade {profile.grade}
            </div>
            
            <button 
              onClick={handleDownload}
              className="absolute top-0 right-0 m-6 bg-white/90 text-slate-700 p-3 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
              title="Tải truyện về đọc offline"
            >
              <Download size={24} />
            </button>
          </div>
          <div className="p-10 w-full md:w-1/2 flex flex-col space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-kids text-sky-600 leading-tight">{story.title}</h2>
                {profile.mode === 'Bilingual' && story.vietnameseTitle && (
                  <p className="text-gray-400 text-lg font-medium">{story.vietnameseTitle}</p>
                )}
              </div>
              <button onClick={loadStory} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-sky-50 hover:text-sky-600 transition-all">
                <RefreshCw size={24} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              <p className="text-xl leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">{story.content}</p>
              {profile.mode === 'Bilingual' && story.vietnameseContent && (
                <p className="text-lg leading-relaxed text-gray-400 italic bg-gray-50 p-4 rounded-2xl border-l-4 border-sky-200">
                  {story.vietnameseContent}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleReadAloud}
                disabled={speaking}
                className={`py-4 rounded-[25px] flex items-center justify-center gap-3 font-bold text-white transition-all ${speaking ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600 shadow-xl shadow-green-100 active:scale-95'}`}
              >
                <Volume2 size={24} />
                {speaking ? 'Đang đọc...' : 'Nghe AI'}
              </button>
              <button 
                onClick={() => onComplete(finishXP)}
                className="py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-[25px] shadow-xl shadow-sky-100 active:scale-95 transition-all"
              >
                Hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingRoom;

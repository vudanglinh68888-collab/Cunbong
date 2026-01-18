
import React, { useState, useEffect, useRef } from 'react';
import { generateVocabularyItems, generateImage, textToSpeech, playAudio } from '../services/geminiService';
import { downloadService } from '../services/downloadService';
import { VocabularyItem, UserProfile } from '../types';
import { ChevronLeft, Volume2, RefreshCw, Trophy, Zap, Layers, Sparkles, CheckCircle2, Info, BookOpen, Download } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onComplete: (xp: number) => void;
}

const VocabularyAdventure: React.FC<Props> = ({ profile, onComplete }) => {
  const [view, setView] = useState<'selection' | 'flashcards' | 'matching'>('selection');
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  
  // Optimization: Use Ref for AudioContext to prevent memory leaks/crashes
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Matching game state
  const [shuffledWords, setShuffledWords] = useState<{ id: string, text: string }[]>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<{ id: string, text: string }[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matches, setMatches] = useState<string[]>([]);
  const [xpEarned, setXpEarned] = useState(0);

  const loadVocabulary = async () => {
    setLoading(true);
    try {
      const data = await generateVocabularyItems(profile, profile.topic);
      setItems(data);
      
      // Load initial image for flashcards
      if (data.length > 0) {
        const img = await generateImage(data[0].imagePrompt);
        setImages({ [data[0].word]: img });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'selection') {
      loadVocabulary();
      // Initialize AudioContext only when needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
    }
    return () => {
      // Cleanup audio context if needed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // audioContextRef.current.close(); 
      }
    };
  }, [view]);

  const handleNextCard = async () => {
    setFlipped(false);
    const nextIdx = currentIndex + 1;
    if (nextIdx < items.length) {
      const nextWord = items[nextIdx].word;
      if (!images[nextWord]) {
        const img = await generateImage(items[nextIdx].imagePrompt);
        setImages(prev => ({ ...prev, [nextWord]: img }));
      }
      setCurrentIndex(nextIdx);
    } else {
      onComplete(50 + xpEarned);
    }
  };

  const handleDownload = () => {
    if (items.length > 0) {
      downloadService.downloadVocabulary(items, profile.topic, images);
    }
  };

  const handleSpeak = async (text: string) => {
    if (!audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    const audio = await textToSpeech(text);
    await playAudio(audio, audioContextRef.current);
  };

  const startMatchingGame = () => {
    const words = items.map(item => ({ id: item.word, text: item.word }));
    const meanings = items.map(item => ({ id: item.word, text: profile.mode === 'Bilingual' ? item.vietnamese : item.definition }));
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setShuffledMeanings([...meanings].sort(() => Math.random() - 0.5));
    setMatches([]);
    setView('matching');
  };

  const handleMatch = (type: 'word' | 'meaning', id: string) => {
    if (type === 'word') {
      setSelectedWord(id);
      if (selectedMeaning === id) {
        setMatches([...matches, id]);
        setSelectedWord(null);
        setSelectedMeaning(null);
        setXpEarned(prev => prev + 10);
      }
    } else {
      setSelectedMeaning(id);
      if (selectedWord === id) {
        setMatches([...matches, id]);
        setSelectedWord(null);
        setSelectedMeaning(null);
        setXpEarned(prev => prev + 10);
      }
    }
  };

  const renderHighlightedExample = (text: string) => {
    const parts = text.split(/(\*.*?\*)/g);
    return (
      <span className="leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <span key={i} className="text-yellow-400 font-black bg-indigo-900/30 px-1.5 py-0.5 rounded-lg mx-1 shadow-sm">
                {part.slice(1, -1)}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  if (view === 'selection') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
        <button onClick={() => onComplete(0)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-sky-600">
          <ChevronLeft /> Quay lại Dashboard
        </button>
        <div className="bg-white rounded-[50px] p-12 shadow-2xl border-8 border-white text-center space-y-8">
          <div className="w-24 h-24 bg-indigo-100 rounded-[35px] flex items-center justify-center text-indigo-600 mx-auto">
            <Layers size={48} />
          </div>
          <h2 className="text-4xl font-kids text-sky-600">Vocabulary Adventure</h2>
          <p className="text-gray-500 text-xl font-medium">Bé muốn học từ vựng về chủ đề "{profile.topic}" bằng cách nào?</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setView('flashcards')}
              className="p-8 bg-sky-50 hover:bg-sky-100 rounded-[40px] border-4 border-transparent hover:border-sky-200 transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🃏</div>
              <h3 className="text-2xl font-kids text-sky-600">Flashcards</h3>
              <p className="text-sm text-gray-400 mt-2">Học từ mới qua hình ảnh sinh động</p>
            </button>
            <button 
              onClick={() => {
                if (items.length > 0) startMatchingGame();
                else setView('flashcards');
              }}
              className="p-8 bg-indigo-50 hover:bg-indigo-100 rounded-[40px] border-4 border-transparent hover:border-indigo-200 transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🧩</div>
              <h3 className="text-2xl font-kids text-indigo-600">Matching Game</h3>
              <p className="text-sm text-gray-400 mt-2">Thử thách ghép từ cực vui</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-20 h-20 border-8 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-2xl font-kids text-sky-600 animate-pulse">AI đang chuẩn bị thẻ từ vựng...</p>
      </div>
    );
  }

  if (view === 'flashcards' && items.length > 0) {
    const current = items[currentIndex];
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center">
          <button onClick={() => setView('selection')} className="flex items-center gap-2 text-gray-500 font-bold">
            <ChevronLeft /> Quay lại
          </button>
          
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-full font-bold hover:bg-slate-200 transition-colors"
            title="Tải thẻ học về máy để in"
          >
             <Download size={18} /> <span className="hidden sm:inline">Tải về</span>
          </button>

          <div className="bg-sky-500 text-white px-6 py-2 rounded-full font-black shadow-lg">
            Thẻ {currentIndex + 1} / {items.length}
          </div>
        </div>

        <div 
          onClick={() => setFlipped(!flipped)}
          className={`relative w-full h-[600px] cursor-pointer transition-all duration-700 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front of card: Image + English Word */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[50px] shadow-2xl border-8 border-white flex flex-col items-center p-8 space-y-6">
            <div className="w-full aspect-square bg-gray-50 rounded-[40px] overflow-hidden border-2 border-sky-50 max-h-[300px] relative">
              {images[current.word] ? (
                 <img src={images[current.word]} alt={current.word} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">Loading image...</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <h3 className="text-5xl font-kids text-sky-600 mb-2">{current.word}</h3>
              <div className="flex items-center gap-3 bg-sky-50 px-4 py-2 rounded-2xl">
                 <span className="text-xl text-indigo-400 font-mono tracking-wider">/{current.phonetic}/</span>
                 <button 
                  onClick={(e) => { e.stopPropagation(); handleSpeak(current.word); }}
                  className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors shadow-md active:scale-95"
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2 italic">{current.readingGuide}</p>
            </div>
            
            <p className="text-gray-300 font-bold animate-pulse text-sm mt-auto">Chạm để xem dịch nghĩa & ví dụ</p>
          </div>

          {/* Back of card: Translation + Definition + Example */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[50px] shadow-2xl border-8 border-white flex flex-col p-8 text-center text-white space-y-6">
            
            <div className="bg-white/10 rounded-[30px] p-6 backdrop-blur-sm border border-white/20">
                <h4 className="text-4xl font-kids text-yellow-300 mb-2">{current.vietnamese}</h4>
                <div className="h-0.5 w-16 bg-white/30 mx-auto my-3"></div>
                <p className="text-sm text-indigo-100 font-medium opacity-90 italic">"{current.definition}"</p>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-indigo-200 font-bold uppercase tracking-widest text-sm">
                    <BookOpen size={16} /> Example Sentence
                </div>
                <div className="bg-white text-indigo-900 p-6 rounded-[30px] text-xl font-medium shadow-lg relative">
                    <div className="absolute -top-3 -left-3 text-4xl text-sky-300">❝</div>
                    {renderHighlightedExample(current.example)}
                    <div className="absolute -bottom-3 -right-3 text-4xl rotate-180 text-sky-300">❝</div>
                </div>
            </div>

            <div className="mt-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleSpeak(current.word); }}
                  className="flex items-center justify-center gap-2 text-indigo-200 hover:text-white transition-colors mx-auto"
                >
                  <Volume2 size={20} /> Nghe lại phát âm
                </button>
                <p className="text-indigo-300 font-bold text-sm mt-4">Chạm để xem hình ảnh</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleNextCard}
          className="w-full py-6 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-[30px] shadow-xl text-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          {currentIndex === items.length - 1 ? 'Hoàn thành!' : 'Thẻ tiếp theo'} <ChevronLeft className="rotate-180" />
        </button>
      </div>
    );
  }

  if (view === 'matching') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
        <div className="flex justify-between items-center bg-white p-6 rounded-[35px] shadow-xl border-4 border-indigo-50">
          <button onClick={() => setView('selection')} className="flex items-center gap-2 text-gray-500 font-bold">
            <ChevronLeft /> Thoát game
          </button>
          
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-full font-bold hover:bg-slate-200 transition-colors"
          >
             <Download size={18} /> <span className="hidden sm:inline">Tải về</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-indigo-600 font-black">
              <Zap className="text-yellow-400 fill-current" /> {xpEarned} XP
            </div>
            <div className="bg-indigo-500 text-white px-6 py-2 rounded-full font-black">
              Ghép đúng: {matches.length} / {items.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-center font-kids text-sky-600 text-xl uppercase tracking-widest">Từ vựng</h4>
            {shuffledWords.map((word) => {
              const isMatched = matches.includes(word.id);
              const isSelected = selectedWord === word.id;
              return (
                <button
                  key={word.id}
                  disabled={isMatched}
                  onClick={() => handleMatch('word', word.id)}
                  className={`w-full p-6 rounded-[30px] border-4 font-bold text-2xl transition-all ${
                    isMatched 
                      ? 'bg-green-500 border-green-200 text-white opacity-50' 
                      : isSelected 
                        ? 'bg-sky-500 border-sky-200 text-white shadow-xl scale-105' 
                        : 'bg-white border-sky-50 text-sky-600 hover:border-sky-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {word.text}
                    {isMatched && <CheckCircle2 size={24} />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <h4 className="text-center font-kids text-indigo-600 text-xl uppercase tracking-widest">Nghĩa của từ</h4>
            {shuffledMeanings.map((meaning) => {
              const isMatched = matches.includes(meaning.id);
              const isSelected = selectedMeaning === meaning.id;
              return (
                <button
                  key={meaning.id}
                  disabled={isMatched}
                  onClick={() => handleMatch('meaning', meaning.id)}
                  className={`w-full p-6 rounded-[30px] border-4 font-bold text-lg transition-all min-h-[100px] flex items-center justify-center ${
                    isMatched 
                      ? 'bg-green-500 border-green-200 text-white opacity-50' 
                      : isSelected 
                        ? 'bg-indigo-500 border-indigo-200 text-white shadow-xl scale-105' 
                        : 'bg-white border-indigo-50 text-indigo-600 hover:border-indigo-200'
                  }`}
                >
                  {meaning.text}
                </button>
              );
            })}
          </div>
        </div>

        {matches.length === items.length && (
          <div className="bg-white rounded-[50px] p-12 shadow-2xl text-center space-y-8 animate-slideInUp border-8 border-green-400">
            <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center text-6xl mx-auto">
              <Trophy className="text-yellow-500" />
            </div>
            <h2 className="text-4xl font-kids text-green-600">Tuyệt vời ông mặt trời!</h2>
            <p className="text-2xl font-bold text-orange-500">+{xpEarned + 50} XP Gained! 🚀</p>
            <button 
              onClick={() => onComplete(xpEarned + 50)}
              className="px-16 py-6 bg-green-500 text-white rounded-[30px] font-black text-2xl shadow-xl hover:bg-green-600 transition-all"
            >
              Hoàn thành
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default VocabularyAdventure;

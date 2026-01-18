
import React, { useEffect, useState } from 'react';
import { Volume2, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import { VocabularyItem } from '../types';
import { geminiService } from '../services/geminiService';

interface VocabViewProps {
  topic: string;
}

export const VocabView: React.FC<VocabViewProps> = ({ topic }) => {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVocab = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await geminiService.generateVocabulary(topic); // Use alias from service
      setItems(data);
    } catch (err) {
      setError("Không thể tạo từ vựng lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-xl font-medium text-gray-800">Đang tạo bài học AI...</h3>
        <p className="text-gray-500 mt-2">Gemini đang biên soạn từ vựng về "{topic}"</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchVocab}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Từ vựng: {topic}</h2>
        <button 
          onClick={fetchVocab}
          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Đổi từ mới
        </button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-2xl font-bold text-indigo-700">{item.word}</h3>
              <p className="text-sm text-gray-500 font-mono mt-1">{item.phonetic}</p>
            </div>
            <button
              onClick={() => speak(item.word)}
              className="p-2 bg-gray-100 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              title="Phát âm"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-3 space-y-2">
            <div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Nghĩa</span>
              <span className="ml-2 text-gray-800 font-medium">{item.vietnamese}</span>
            </div>
            
            <p className="text-sm text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
              "{item.example}"
            </p>
            
            <p className="text-xs text-gray-400 mt-2">
              💡 {item.readingGuide}
            </p>
          </div>
        </div>
      ))}
      
      <div className="h-16"></div> {/* Spacer for bottom nav visibility if needed */}
    </div>
  );
};

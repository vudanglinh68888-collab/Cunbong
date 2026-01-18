import React from 'react';
import { BookOpen, Briefcase, Coffee, Globe, Heart, Music, Plane, ShoppingCart } from 'lucide-react';

interface TopicSelectorProps {
  onSelectTopic: (topic: string) => void;
}

const TOPICS = [
  { id: 'travel', name: 'Du lịch', icon: <Plane className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600' },
  { id: 'business', name: 'Công việc', icon: <Briefcase className="w-6 h-6" />, color: 'bg-slate-100 text-slate-600' },
  { id: 'daily_life', name: 'Đời sống', icon: <Coffee className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600' },
  { id: 'shopping', name: 'Mua sắm', icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-green-100 text-green-600' },
  { id: 'relationships', name: 'Giao tiếp', icon: <Heart className="w-6 h-6" />, color: 'bg-red-100 text-red-600' },
  { id: 'education', name: 'Giáo dục', icon: <BookOpen className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'music', name: 'Giải trí', icon: <Music className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600' },
  { id: 'culture', name: 'Văn hóa', icon: <Globe className="w-6 h-6" />, color: 'bg-teal-100 text-teal-600' },
];

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic }) => {
  const [customTopic, setCustomTopic] = React.useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      onSelectTopic(customTopic.trim());
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Chọn chủ đề học tập</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.name)}
            className={`${topic.color} p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md`}
          >
            {topic.icon}
            <span className="font-medium">{topic.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Chủ đề khác</h3>
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Ví dụ: Lập trình, Nấu ăn..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!customTopic.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Bắt đầu
          </button>
        </form>
      </div>
    </div>
  );
};
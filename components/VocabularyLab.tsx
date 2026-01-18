
import React, { useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Book, Lightbulb, CheckCircle2, Loader2, BrainCircuit, Play, ChevronRight, Share2, Network, Star, Layers, Rocket, Search, Grid3X3, BookOpenCheck, ListFilter, GraduationCap, Leaf, Monitor, HeartPulse, Building2 } from 'lucide-react';
import { generateVocabularyLesson, generateAudio } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { User, VocabularyLesson, VocabularyWord, MindmapNode, AcademicFunction } from '../types';

// Audio helpers...
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}

const SemanticMindmap: React.FC<{ data: MindmapNode }> = ({ data }) => {
  return (
    <div className="bg-slate-900 text-white p-8 rounded-[3rem] overflow-hidden relative min-h-[400px] flex items-center justify-center border border-white/10">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="relative z-10 flex flex-col items-center gap-12 w-full">
        <div className="bg-indigo-600 px-8 py-4 rounded-2xl shadow-2xl border-2 border-indigo-400 font-black text-xl animate-pulse uppercase tracking-widest">
          {data?.center || 'Concept Map'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {(data?.branches || []).map((branch, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase mb-3 tracking-widest">
                <span>{branch?.icon_hint || '🔗'}</span>
                {branch?.label || 'Branch'}
              </div>
              <div className="flex flex-wrap gap-2">
                {(branch?.words || []).map((w, i) => (
                  <span key={i} className="text-sm text-slate-300 font-medium px-2 py-1 bg-white/5 rounded-lg border border-white/5 group-hover:border-indigo-500/30">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Expanded Topic Clusters for 5000 Core Words
const EXPANDED_CLUSTERS = [
  { label: "Education", icon: GraduationCap, desc: "Curriculum, Pedagogy, Literacy" },
  { label: "Environment", icon: Leaf, desc: "Sustainability, Erosion, Habitat" },
  { label: "Technology", icon: Monitor, desc: "Innovation, Artificial, Digital" },
  { label: "Health", icon: HeartPulse, desc: "Obesity, Epidemic, Nutrition" },
  { label: "Urban Life", icon: Building2, desc: "Infrastructure, Amenities, Transit" },
  { label: "Abstract Nouns", icon: BrainCircuit, desc: "Concept, Policy, Perspective" },
  { label: "Verbs of Change", icon: Rocket, desc: "Transform, Evolve, Adapt" },
  { label: "Crime & Law", icon: Book, desc: "Offender, Deterrent, Legislation" },
  { label: "Work & Business", icon: Layers, desc: "Entrepreneur, Revenue, Incentive" },
  { label: "Culture & Art", icon: Star, desc: "Heritage, Contemporary, Aesthetic" },
];

interface Props {
  user: User;
}

const VocabularyLab: React.FC<Props> = ({ user }) => {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'topic' | 'academic' | 'core5000'>('topic');
  const [wordCount, setWordCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lesson, setLesson] = useState<VocabularyLesson | null>(null);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [stats, setStats] = useState(dbService.getVocabStats(user.id));
  const [searchTerm, setSearchTerm] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);

  const handleGenerate = async (overrideTopic?: string) => {
    setIsGenerating(true);
    setLesson(null);
    setSelectedWord(null);
    try {
      const data = await generateVocabularyLesson(user.target_band, 20, overrideTopic || topic, mode, wordCount);
      setLesson(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const markWordLearned = (word: VocabularyWord) => {
    dbService.updateVocabFamiliarity(user.id, word, 1);
    setStats(dbService.getVocabStats(user.id));
  };

  const playPronunciation = async (word: string) => {
    try {
      const base64 = await generateAudio(word);
      if (!base64) return;
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioData = decode(base64);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (err) {}
  };

  const functionColors: Record<string, string> = {
    'Argument & Opinion': 'bg-blue-50 text-blue-700 border-blue-100',
    'Cause – Effect': 'bg-red-50 text-red-700 border-red-100',
    'Comparison & Contrast': 'bg-purple-50 text-purple-700 border-purple-100',
    'Process & Change': 'bg-orange-50 text-orange-700 border-orange-100',
    'Evaluation & Evidence': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Solution & Recommendation': 'bg-indigo-50 text-indigo-700 border-indigo-100'
  };

  const filteredClusters = EXPANDED_CLUSTERS.filter(c => c.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Mode Switcher */}
      <div className="bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm inline-flex flex-wrap gap-2">
        <button 
          onClick={() => { setMode('topic'); setLesson(null); setSelectedWord(null); }}
          className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'topic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          IELTS Topics
        </button>
        <button 
          onClick={() => { setMode('core5000'); setLesson(null); setSelectedWord(null); }}
          className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'core5000' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          5000 Words Core
        </button>
        <button 
          onClick={() => { setMode('academic'); setLesson(null); setSelectedWord(null); }}
          className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'academic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Academic Core 300
        </button>
      </div>

      <div className={`bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-80 h-80 ${mode === 'academic' ? 'bg-indigo-50' : mode === 'core5000' ? 'bg-cyan-50' : 'bg-emerald-50'} rounded-full blur-[100px] -mr-40 -mt-40 opacity-70`}></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">
                {mode === 'academic' ? 'Academic Master' : mode === 'core5000' ? '5000 Core Words' : 'Vocabulary Specialist'}
              </h2>
              <p className="text-slate-500 font-medium">
                {mode === 'academic' ? 'Functional words for high-scoring Task 2 essays.' : mode === 'core5000' ? 'The most frequent B2-C1 words for IELTS Reading & Listening.' : 'Semantic clustering for IELTS topics.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Batch Size Selector - Available in Core5000 & Topic Modes */}
              {(mode === 'core5000' || mode === 'topic') && (
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 self-start md:self-end">
                   {[10, 50, 100, 200, 500].map(count => (
                     <button 
                       key={count}
                       onClick={() => setWordCount(count)}
                       className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                         wordCount === count ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                       }`}
                     >
                       {count}
                     </button>
                   ))}
                </div>
              )}

              <div className="flex bg-slate-100 p-2 rounded-2xl gap-2">
                {mode === 'topic' && (
                  <input 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Health, Science"
                    className="bg-white px-4 py-2 rounded-xl outline-none border border-slate-200 font-bold"
                  />
                )}
                {mode !== 'core5000' && (
                  <button 
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className={`px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all ${
                      mode === 'academic' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    } text-white`}
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
                    {mode === 'academic' ? 'Unlock Functional Skill' : `Get ${wordCount} Words`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 5000 Core Specific UI */}
          {mode === 'core5000' && !lesson && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Find topic (e.g., Environment, Verbs...)"
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredClusters.map((cluster, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setTopic(cluster.label); handleGenerate(cluster.label); }}
                    disabled={isGenerating}
                    className="p-6 rounded-3xl border border-slate-100 hover:border-cyan-300 hover:bg-cyan-50/50 bg-white text-left transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center">
                        <cluster.icon size={18} />
                      </div>
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100">
                        <ListFilter size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600">{wordCount}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-cyan-800">{cluster.label}</h4>
                    <p className="text-xs text-slate-500 font-medium">{cluster.desc}</p>
                  </button>
                ))}
                {filteredClusters.length === 0 && (
                   <div className="col-span-4 text-center py-10 text-slate-400 italic">No topics found matching "{searchTerm}"</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {lesson && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black">{lesson.semantic_group_title || 'Vocabulary Group'}</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    {lesson.words?.length || 0} Words
                  </span>
                  {mode === 'academic' && (
                    <span className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      <Layers size={12} /> Writing Booster
                    </span>
                  )}
                  {mode === 'core5000' && (
                    <span className="flex items-center gap-2 bg-cyan-50 text-cyan-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-100">
                      <BookOpenCheck size={12} /> 5000 Core
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`grid gap-4 ${wordCount >= 200 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : wordCount > 20 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {(lesson.words || []).map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedWord(w)}
                    className={`p-4 rounded-3xl border-2 transition-all text-left group flex flex-col justify-between ${
                      wordCount >= 200 ? 'min-h-[80px]' : wordCount > 20 ? 'min-h-[100px]' : 'min-h-[160px] p-6'
                    } ${
                      selectedWord?.word === w?.word 
                      ? mode === 'academic' ? 'bg-indigo-50 border-indigo-500' : mode === 'core5000' ? 'bg-cyan-50 border-cyan-500' : 'bg-emerald-50 border-emerald-500'
                      : 'bg-white border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`${wordCount >= 200 ? 'text-sm' : 'text-xl'} font-black text-slate-800`}>{w?.word || 'Word'}</h4>
                        {w?.function_group && <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{w.function_group}</span>}
                      </div>
                      <p className={`font-bold ${wordCount >= 200 ? 'text-xs' : 'text-sm'} ${mode === 'academic' ? 'text-indigo-700' : mode === 'core5000' ? 'text-cyan-700' : 'text-emerald-700'}`}>{w?.meaning_vn || ''}</p>
                    </div>
                    {w?.writing_position && wordCount <= 20 && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="bg-white/50 border border-slate-100 px-2 py-0.5 rounded text-[9px] font-black uppercase text-slate-400">Position: {w.writing_position}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mindmap only for small detailed batches */}
            {wordCount <= 20 && (
              <div className="space-y-4">
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-6">
                   <Network size={16} /> Semantic Connectivity
                 </h3>
                 {lesson.mindmap_json && <SemanticMindmap data={lesson.mindmap_json} />}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {selectedWord ? (
              <div className={`bg-white p-8 rounded-[3rem] border-2 ${mode === 'academic' ? 'border-indigo-500' : mode === 'core5000' ? 'border-cyan-500' : 'border-emerald-500'} shadow-2xl sticky top-10 animate-in slide-in-from-right-8 duration-500`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black text-slate-900">{selectedWord.word}</h3>
                  <button onClick={() => playPronunciation(selectedWord.word)} className={`w-12 h-12 ${mode === 'academic' ? 'bg-indigo-100 text-indigo-600' : mode === 'core5000' ? 'bg-cyan-100 text-cyan-600' : 'bg-emerald-100 text-emerald-600'} rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-md`}>
                    <Play size={22} fill="currentColor" />
                  </button>
                </div>

                <div className="space-y-8">
                  {selectedWord.function_group && (
                    <section className={`${functionColors[selectedWord.function_group] || 'bg-slate-50'} p-5 rounded-2xl border`}>
                      <h5 className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Functional Role</h5>
                      <p className="text-sm font-black">{selectedWord.function_group}</p>
                    </section>
                  )}

                  {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
                    <section>
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Synonyms (B2-C1)</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedWord.synonyms.map((s, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-xs font-black">
                            {s}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedWord.image_description && (
                    <section className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                      <h5 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-3 flex items-center gap-2">
                        <ImageIcon size={14} /> Visual Memory Hook
                      </h5>
                      <p className="text-sm text-amber-900 leading-relaxed font-medium italic">
                        {selectedWord.image_description}
                      </p>
                    </section>
                  )}

                  {selectedWord.example && (
                    <section>
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Academic Production</h5>
                      <p className="text-slate-600 text-sm leading-relaxed border-l-4 border-indigo-500 pl-4 font-serif italic">
                        "{selectedWord.example}"
                      </p>
                    </section>
                  )}

                  <button 
                    onClick={() => markWordLearned(selectedWord)}
                    className={`w-full ${mode === 'academic' ? 'bg-indigo-600' : mode === 'core5000' ? 'bg-cyan-600' : 'bg-slate-900'} text-white py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <CheckCircle2 size={18} />
                    Mark as Familiar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-12 rounded-[3rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-4 h-[600px] sticky top-10">
                <BrainCircuit size={60} className="text-slate-200" />
                <h4 className="font-black text-slate-400 text-xl">Deep Dive Ready</h4>
                <p className="text-sm text-slate-400 font-medium px-8">Unlock synonyms, collocations, and visual hooks for Academic Band 7.5+.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyLab;

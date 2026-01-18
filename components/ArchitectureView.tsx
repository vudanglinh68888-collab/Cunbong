
import React from 'react';
import { Smartphone, Layout, Database, Cpu, ShieldCheck, Cloud, Cpu as AiIcon } from 'lucide-react';

const ArchitectureView: React.FC = () => {
  const layers = [
    {
      title: "Client Layer",
      icon: Smartphone,
      color: "bg-blue-500",
      tech: ["Flutter (iOS/Android)", "React (Web)", "Tailwind CSS"],
      description: "Responsive interfaces with shared business logic and real-time audio visualization."
    },
    {
      title: "Backend Layer",
      icon: Database,
      color: "bg-emerald-500",
      tech: ["Node.js (NestJS)", "FastAPI (Python)", "PostgreSQL", "Redis"],
      description: "Microservices for user management, lesson curation, and score tracking."
    },
    {
      title: "AI Services",
      icon: AiIcon,
      color: "bg-indigo-600",
      tech: ["Google Gemini 3 Pro", "Whisper v3 (STT)", "ElevenLabs (TTS)"],
      description: "Advanced NLP for IELTS evaluation, prompt grounding, and voice synthesis."
    },
    {
      title: "Infrastructure & Security",
      icon: ShieldCheck,
      color: "bg-slate-800",
      tech: ["Google Cloud (GCP)", "Docker/K8s", "AES-256 Encryption", "OAuth 2.0"],
      description: "Enterprise-grade hosting with strictly encrypted student data and AI safety guards."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">System Architecture Proposal</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          A high-performance, AI-native infrastructure designed to scale to millions of IELTS learners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {layers.map((layer, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className={`w-16 h-16 ${layer.color} text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform`}>
              <layer.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">{layer.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-6">{layer.description}</p>
            <div className="flex flex-wrap gap-2">
              {layer.tech.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-full text-xs font-bold uppercase tracking-wider">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-indigo-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h4 className="text-2xl font-black mb-2">Cloud-Native Scalability</h4>
          <p className="text-indigo-100 max-w-md">
            Our architecture leverages GCP's serverless functions to handle peak study times without latency, ensuring your AI examiner is always available.
          </p>
        </div>
        <button className="relative z-10 bg-white text-indigo-600 font-black px-10 py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transition-colors">
          Download PDF Specs
        </button>
      </div>
    </div>
  );
};

export default ArchitectureView;


import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { Chat } from '@google/genai';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your English tutor. How can I help you today? (Chào bạn! Mình là gia sư tiếng Anh. Mình có thể giúp gì cho bạn?)' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use a ref to keep the chat session active across renders
  const chatSessionRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize chat session once
    if (!chatSessionRef.current) {
      chatSessionRef.current = geminiService.createChatSession();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !chatSessionRef.current) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userText });
      const modelText = result.text || "Sorry, I couldn't understand that.";
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: modelText
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Xin lỗi, mình đang gặp sự cố kết nối. Vui lòng thử lại sau."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
      <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold">AI Tutor</h3>
          <p className="text-xs text-indigo-100">Luôn sẵn sàng hỗ trợ bạn</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm md:text-base leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
               <Bot className="w-5 h-5" />
             </div>
             <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
               <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

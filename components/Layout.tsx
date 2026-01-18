
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onHome: () => void;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onHome, title }) => {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
        <button 
          onClick={onHome}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-kids text-xl shadow-md group-hover:scale-110 transition-transform">
            K
          </div>
          <span className="font-kids text-2xl text-sky-600 hidden sm:block">KidoEnglish</span>
        </button>
        {title && <h1 className="text-xl font-bold text-gray-700 font-kids">{title}</h1>}
        <div className="flex gap-4">
            <div className="bg-orange-100 px-3 py-1 rounded-full text-orange-600 font-bold flex items-center gap-1 shadow-inner">
                ⭐ <span className="text-sm">120</span>
            </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>
      <footer className="p-4 text-center text-gray-400 text-sm">
        © 2024 KidoEnglish - Học là vui!
      </footer>
    </div>
  );
};

export default Layout;

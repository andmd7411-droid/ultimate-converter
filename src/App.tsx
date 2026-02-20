import React, { useState } from 'react';
import {
  Image as ImageIcon,
  FileText,
  Music,
  Video,
  Archive,
  Code,
  Zap,
  Settings,
  Github,
  ChevronRight,
  Info,
  Smartphone,
  BookOpen,
  Type,
  FileCode2,
  PenTool,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Converter from './components/Converter';
import type { FileFormat } from './types';

type Category = 'image' | 'document' | 'audio' | 'video' | 'archive' | 'dashboard' | 'developer' | 'apple' | 'pdf' | 'ebook' | 'font' | 'minifier' | 'vector' | '3d';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('dashboard');

  const categories = [
    {
      id: 'image',
      name: 'Images',
      icon: <ImageIcon size={24} />,
      description: 'JPG, PNG, WEBP, BMP, ICO',
      color: 'from-blue-500 to-cyan-500',
      formats: ['JPG', 'PNG', 'WEBP', 'BMP', 'ICO'] as FileFormat[]
    },
    {
      id: 'document',
      name: 'Documents',
      icon: <FileText size={24} />,
      description: 'PDF, TXT, MD, HTML',
      color: 'from-emerald-500 to-teal-500',
      formats: ['PDF', 'TXT', 'MD', 'HTML'] as FileFormat[]
    },
    {
      id: 'audio',
      name: 'Audio',
      icon: <Music size={24} />,
      description: 'MP3, WAV, OGG, AAC',
      color: 'from-purple-500 to-pink-500',
      formats: ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC'] as FileFormat[]
    },
    {
      id: 'video',
      name: 'Video',
      icon: <Video size={24} />,
      description: 'MP4, WEBM, GIF, AVI, MOV',
      color: 'from-orange-500 to-red-500',
      formats: ['MP4', 'WEBM', 'GIF', 'AVI', 'MOV'] as FileFormat[]
    },
    {
      id: 'archive',
      name: 'Archives',
      icon: <Archive size={24} />,
      description: 'ZIP Compression',
      color: 'from-indigo-500 to-blue-500',
      formats: ['ZIP'] as FileFormat[]
    },
    {
      id: 'developer',
      name: 'Developer & Data',
      icon: <Code size={24} />,
      description: 'JSON, CSV, XML, Base64',
      color: 'from-amber-500 to-orange-500',
      formats: ['JSON', 'CSV', 'XML', 'B64'] as FileFormat[]
    },
    {
      id: 'apple',
      name: 'Apple & Modern',
      icon: <Smartphone size={24} />,
      description: 'Convert iPhone HEIC/HEIF',
      color: 'from-zinc-400 to-zinc-600',
      formats: ['HEIC', 'HEIF', 'JPG', 'PNG'] as FileFormat[]
    },
    {
      id: 'pdf',
      name: 'Advanced PDF',
      icon: <FileText size={24} />,
      description: 'PDF ↔ Images',
      color: 'from-red-500 to-rose-600',
      formats: ['PDF', 'JPG', 'PNG'] as FileFormat[]
    },
    {
      id: 'ebook',
      name: 'E-book Studio',
      icon: <BookOpen size={24} />,
      description: 'EPUB to PDF/TXT',
      color: 'from-emerald-500 to-green-600',
      formats: ['EPUB', 'PDF', 'TXT', 'MD'] as FileFormat[]
    },
    {
      id: 'font',
      name: 'Font Studio',
      icon: <Type size={24} />,
      description: 'TTF/WOFF to CSS',
      color: 'from-pink-500 to-rose-500',
      formats: ['TTF', 'WOFF', 'WOFF2', 'CSS'] as FileFormat[]
    },
    {
      id: 'minifier',
      name: 'Code Minifier',
      icon: <FileCode2 size={24} />,
      description: 'JS, CSS, HTML',
      color: 'from-yellow-400 to-yellow-600',
      formats: ['JS', 'CSS', 'HTML'] as FileFormat[]
    },
    {
      id: 'vector',
      name: 'SVG Optimizer',
      icon: <PenTool size={24} />,
      description: 'Clean & Compress SVG',
      color: 'from-fuchsia-500 to-purple-600',
      formats: ['SVG'] as FileFormat[]
    },
    {
      id: '3d',
      name: '3D Model Studio',
      icon: <Box size={24} />,
      description: 'Clean & Compress OBJ',
      color: 'from-blue-600 to-cyan-600',
      formats: ['OBJ'] as FileFormat[]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center glass-card m-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveCategory('dashboard')}>
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-600/20">
            <Zap size={24} fill="white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Ultimate Converter</h1>
        </div>
        <nav className="flex gap-6 items-center">
          <button className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
            <Info size={18} /> How it works
          </button>
          <button className="text-text-secondary hover:text-text-primary transition-colors">
            <Settings size={18} />
          </button>
          <a href="#" className="p-2 glass-card hover:bg-white/10 transition-colors">
            <Github size={18} />
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeCategory === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 lg:col-span-3 p-10 glass-card bg-gradient-to-br from-indigo-900/40 via-slate-900/40 to-black/40 border-indigo-500/20">
                <h2 className="text-5xl font-extrabold mb-6 tracking-tight">The Professional Choice for <br /><span className="gradient-text">File Conversion.</span></h2>
                <p className="text-text-secondary text-xl max-w-2xl mb-8 leading-relaxed">
                  Fast, secure, and high-quality. No server uploads - your files never leave your machine.
                  Supports heavy batch processing for images, documents, and 4K media.
                </p>
                <div className="flex gap-4">
                  <button className="btn-primary py-3 px-8 text-lg" onClick={() => setActiveCategory('image')}>
                    Get Started Now
                  </button>
                  <button className="px-6 py-3 glass-card bg-white/5 hover:bg-white/10 transition-colors font-semibold">
                    View Formats
                  </button>
                </div>
              </div>

              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  onClick={() => setActiveCategory(cat.id as Category)}
                  className="glass-card p-6 cursor-pointer group relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} opacity-5 blur-3xl group-hover:opacity-15 transition-opacity`} />
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${cat.color} text-white inline-block mb-4 shadow-lg group-hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-text-secondary text-sm mb-4 leading-relaxed">{cat.description}</p>
                  <div className="flex items-center text-primary-color font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Open {cat.name} <ChevronRight size={16} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="tool"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 min-h-[650px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveCategory('dashboard')}
                    className="p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                  >
                    <ChevronRight size={24} className="rotate-180" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold">{categories.find(c => c.id === activeCategory)?.name} Studio</h2>
                    <p className="text-text-secondary text-sm">Professional file processing module</p>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold tracking-widest uppercase border border-indigo-500/30">ULTRA HQ ENGINE</span>
                  <span className="text-[10px] text-text-secondary mt-1">Status: Ready for processing</span>
                </div>
              </div>

              <div className="flex-1">
                <Converter
                  category={activeCategory}
                  allowedFormats={categories.find(c => c.id === activeCategory)?.formats || []}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-8 mt-auto border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Zap size={16} className="text-indigo-500" />
            <span className="text-sm font-medium">Ultimate Multi-Format Converter v1.0</span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-text-secondary">
            <a href="#" className="hover:text-text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary">Documentation</a>
            <a href="#" className="hover:text-text-primary">Support</a>
          </div>
          <p className="text-xs text-text-secondary opacity-50">Local WebAssembly Processing • No Data Leaves Browser</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

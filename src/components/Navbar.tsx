import React from 'react';
import { ModelTab } from '../types';
import { Sparkles, Layers, FileSpreadsheet, Eye } from 'lucide-react';

interface NavbarProps {
  activeTab: ModelTab;
  onTabChange: (tab: ModelTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('bigram');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-600 transition-colors"
        >
          Mini LLM Lab
        </a>

        {/* Zone 2: 4 Navigation Links / Mode Selectors */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => onTabChange('bigram')}
            className={`flex items-center gap-2 whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeTab === 'bigram'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bigram Text Model</span>
          </button>

          <button
            onClick={() => onTabChange('csv')}
            className={`flex items-center gap-2 whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeTab === 'csv'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Tabular CSV Model</span>
          </button>

          <button
            onClick={() => onTabChange('multimodal')}
            className={`flex items-center gap-2 whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
              activeTab === 'multimodal'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Image & Audio Model</span>
          </button>

          <a
            href="#documentation"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Theoretical Foundation
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#architecture-section"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>3 Predictive Architectures</span>
          </a>
        </div>
      </div>
    </header>
  );
};

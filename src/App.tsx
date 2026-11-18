/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ModelTab } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BigramModel } from './components/BigramModel';
import { CsvModel } from './components/CsvModel';
import { MultimodalModel } from './components/MultimodalModel';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { Sparkles, Layers, FileSpreadsheet, Eye } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModelTab>('bigram');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar with strict 3-zone contract */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Hero Header with Visual Anchor & Segmented Tab Switcher */}
      <Hero activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Interactive Stage Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-12">
        {/* Model Viewport Rendering */}
        <div className="transition-opacity duration-200">
          {activeTab === 'bigram' && <BigramModel />}
          {activeTab === 'csv' && <CsvModel />}
          {activeTab === 'multimodal' && <MultimodalModel />}
        </div>

        {/* Theoretical Framework & Comparative Documentation */}
        <ArchitectureDocs />
      </main>

      {/* Clean Footer (Anti-slop: zero ornamental fake status engines) */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Mini LLM & Predictive Intelligence Lab</span>
            <span aria-hidden="true">·</span>
            <span>Educational AI Demonstration</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setActiveTab('bigram')}
              className="hover:text-slate-900 transition-colors"
            >
              Bigram Next-Word
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('csv')}
              className="hover:text-slate-900 transition-colors"
            >
              Tabular CSV
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('multimodal')}
              className="hover:text-slate-900 transition-colors"
            >
              Multimodal Vision & Audio
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

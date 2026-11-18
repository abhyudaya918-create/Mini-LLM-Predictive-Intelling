import React from 'react';
import { ModelTab } from '../types';
import { Layers, FileSpreadsheet, Sparkles, Binary, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  activeTab: ModelTab;
  onSelectTab: (tab: ModelTab) => void;
}

export const Hero: React.FC<HeroProps> = ({ activeTab, onSelectTab }) => {
  return (
    <section className="bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
      {/* Background glow styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headlines & Concept */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="text-sky-400 font-semibold">Educational Machine Learning Sandbox</span>
              <span aria-hidden="true">·</span>
              <span>Next-Token & Predictive Inference</span>
              <span aria-hidden="true">·</span>
              <span>3 Model Variants</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
              Mini LLM & Predictive Intelligence Laboratory
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              Explore how artificial intelligence generates predictions from foundational mechanics to multimodal perception.
              Train statistical transition matrices, forecast custom tabular data columns, and analyze multimodal imagery and audio streams.
            </p>

            {/* Model Architecture Switcher (Interactive Segmented Control) */}
            <div className="pt-2">
              <div className="inline-flex flex-wrap p-1.5 bg-slate-800/90 rounded-xl border border-slate-700/80 gap-1.5">
                <button
                  onClick={() => onSelectTab('bigram')}
                  className={`px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'bigram'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>1. Bigram Language Model</span>
                </button>

                <button
                  onClick={() => onSelectTab('csv')}
                  className={`px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'csv'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>2. Tabular CSV Model</span>
                </button>

                <button
                  onClick={() => onSelectTab('multimodal')}
                  className={`px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'multimodal'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>3. Image & Audio Model</span>
                </button>
              </div>
            </div>

            {/* Quick Feature Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-medium">Bigram Text Predictor</strong>
                  Real-time transition matrix, Laplace smoothing, perplexity & next-word generation.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-medium">CSV Column Predictor</strong>
                  Select any target column, test single rows or custom lines, with confusion matrix.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-medium">Multimodal Perception</strong>
                  Comprehensive image and acoustic analysis powered by Gemini 3.8 Flash.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Graphic Visual */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group">
              <img
                src="/src/assets/images/mini_llm_hero_neural_1793193298892.jpg"
                alt="AI Learning & Prediction Visualization with tokenized embeddings and probability models"
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <Binary className="w-4 h-4 text-sky-400" />
                  Probabilistic Mathematical Foundation
                </span>
                <span className="text-[11px] text-slate-400 font-mono">P(w_t | w_t-1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

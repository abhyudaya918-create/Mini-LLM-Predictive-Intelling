import React from 'react';
import { Layers, FileSpreadsheet, Eye, BookOpen, Binary, Cpu } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <section id="architecture-section" className="border-t border-slate-200 pt-12 pb-16 space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-600">
          <span>Theoretical Foundations</span>
          <span aria-hidden="true">·</span>
          <span>Comparative Machine Learning</span>
          <span aria-hidden="true">·</span>
          <span>From Bigrams to Multimodality</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          How Predictive Models Evolve
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed">
          Compare the three evolutionary paradigms of predictive machine learning implemented in this laboratory: discrete Markov bigrams, supervised tabular feature mappers, and multimodal neural representations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model 1: Bigram Theory */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            1. First-Order Markov Bigrams
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The foundation of autoregressive sequence modeling. Under the Markov assumption:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs text-slate-800 border border-slate-200">
            P(w<sub>t</sub> | w<sub>1</sub>...w<sub>t-1</sub>) ≈ P(w<sub>t</sub> | w<sub>t-1</sub>)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Maximum Likelihood Estimation estimates transition counts with Laplace smoothing parameter α:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs text-slate-800 border border-slate-200">
            P(w<sub>t</sub>|w<sub>t-1</sub>) = (C(w<sub>t-1</sub>,w<sub>t</sub>) + α) / (C(w<sub>t-1</sub>) + α·|V|)
          </div>
          <p className="text-xs text-slate-500">
            Perplexity measures how surprised the model is when evaluating holdout test tokens.
          </p>
        </div>

        {/* Model 2: Tabular CSV Theory */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            2. Tabular Feature Forecasting
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Supervised inference on structured multi-attribute columns. Maps normalized feature vectors x into target space Y:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs text-slate-800 border border-slate-200">
            d(x, x') = √[ ∑ (x<sub>i</sub> - x'<sub>i</sub>)² / (max<sub>i</sub> - min<sub>i</sub>)² ]
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Performs inverse distance weighting over k-nearest neighbors with confusion matrix tracking:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs text-slate-800 border border-slate-200">
            F1 = 2 · (Precision · Recall) / (Precision + Recall)
          </div>
          <p className="text-xs text-slate-500">
            Evaluates test accuracy on unseen rows and explains predictions via nearest exemplar neighbors.
          </p>
        </div>

        {/* Model 3: Multimodal Theory */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            3. Multimodal Neural Perception
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deep cross-modal alignment bridging continuous sensory signals (pixels & acoustic waves) with discrete language:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs text-slate-800 border border-slate-200">
            z = CrossAttention( VisionAudioEnc(X), TextDec(Y) )
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Gemini 3.8 Flash extracts spatial layout, objects, lighting, acoustic formants, and musical tempo into unified structured descriptions:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs text-slate-800 border border-slate-200">
            Confidence = Softmax( Logits<sub>perceptual</sub> )
          </div>
          <p className="text-xs text-slate-500">
            Produces calibrated reliability benchmarks and attribute-level confidence matrices.
          </p>
        </div>
      </div>
    </section>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { BIGRAM_PRESETS } from '../data/bigramPresets';
import { trainBigramModel, sampleNextToken, BigramModelData } from '../utils/bigramEngine';
import { BigramPreset } from '../types';
import {
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  TrendingUp,
  FileText,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  BarChart3,
  Undo2,
} from 'lucide-react';

export const BigramModel: React.FC = () => {
  // Preset selection & training text state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(BIGRAM_PRESETS[0].id);
  const [corpusText, setCorpusText] = useState<string>(BIGRAM_PRESETS[0].text);
  const [smoothingAlpha, setSmoothingAlpha] = useState<number>(0.05);
  const [lowercase, setLowercase] = useState<boolean>(true);

  // Train the Bigram Model
  const modelData: BigramModelData = useMemo(() => {
    return trainBigramModel(corpusText, smoothingAlpha, lowercase);
  }, [corpusText, smoothingAlpha, lowercase]);

  // Generation / Prompt state
  const [currentWord, setCurrentWord] = useState<string>(BIGRAM_PRESETS[0].sampleStartWord);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([BIGRAM_PRESETS[0].sampleStartWord]);
  const [samplingMode, setSamplingMode] = useState<'greedy' | 'temperature' | 'topK'>('temperature');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topK, setTopK] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);
  const [hoveredMatrixCell, setHoveredMatrixCell] = useState<{ from: string; to: string; prob: number } | null>(null);

  // When preset changes, update text and reset starting word
  const handleSelectPreset = (preset: BigramPreset) => {
    setSelectedPresetId(preset.id);
    setCorpusText(preset.text);
    setCurrentWord(preset.sampleStartWord);
    setGeneratedTokens([preset.sampleStartWord]);
  };

  // Ensure currentWord is valid in vocabulary if possible
  useEffect(() => {
    if (modelData.vocabulary.length > 0 && !modelData.vocabSet.has(currentWord.toLowerCase())) {
      const fallback = modelData.vocabulary[0];
      setCurrentWord(fallback);
      setGeneratedTokens([fallback]);
    }
  }, [modelData]);

  // Current candidate predictions for next word
  const currentPrediction = useMemo(() => {
    return sampleNextToken(modelData, currentWord, samplingMode, temperature, topK);
  }, [modelData, currentWord, samplingMode, temperature, topK]);

  // Step next word
  const handleStepNextWord = () => {
    const nextToken = currentPrediction.selectedToken;
    setCurrentWord(nextToken);
    setGeneratedTokens((prev) => [...prev, nextToken]);
  };

  // Pick specific candidate word directly
  const handleChooseSpecificCandidate = (token: string) => {
    setCurrentWord(token);
    setGeneratedTokens((prev) => [...prev, token]);
  };

  // Auto-generate N words in loop
  const handleAutoGenerate = (count: number) => {
    let word = currentWord;
    const newTokens = [...generatedTokens];

    for (let i = 0; i < count; i++) {
      const pred = sampleNextToken(modelData, word, samplingMode, temperature, topK);
      word = pred.selectedToken;
      newTokens.push(word);
    }

    setCurrentWord(word);
    setGeneratedTokens(newTokens);
  };

  // Undo last word
  const handleUndo = () => {
    if (generatedTokens.length > 1) {
      const newTokens = generatedTokens.slice(0, -1);
      setGeneratedTokens(newTokens);
      setCurrentWord(newTokens[newTokens.length - 1]);
    }
  };

  // Reset sequence
  const handleResetSequence = () => {
    const start = modelData.vocabulary[0] || 'the';
    setCurrentWord(start);
    setGeneratedTokens([start]);
  };

  // Copy full generated text
  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedTokens.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* 1. Header & Overview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-600">
          <span>Model Architecture 01</span>
          <span aria-hidden="true">·</span>
          <span>First-Order Markov Chain</span>
          <span aria-hidden="true">·</span>
          <span>Autoregressive Token Generation</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Bigram Next-Word Language Model
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed">
          The bigram model calculates the conditional probability{' '}
          <code className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded text-xs font-mono">
            P(w<sub>t</sub> | w<sub>t-1</sub>) = C(w<sub>t-1</sub>, w<sub>t</sub>) / C(w<sub>t-1</sub>)
          </code>
          . Select any starting word to predict the next word step-by-step, adjust sampling entropy, and inspect mathematical transition matrices and holdout validation accuracies.
        </p>
      </div>

      {/* 2. Model Accuracy & Evaluation Scorecard */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Statistical Accuracy & Evaluation Metrics
            </h3>
            <span className="text-xs text-slate-500">
              Evaluated on 80/20 train/validation split with Laplace additive smoothing
            </span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span>
              Tokens Evaluated: <strong className="text-slate-800 tabular-nums">{modelData.metrics.validationTokensEvaluated}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Total Tokens: <strong className="text-slate-800 tabular-nums">{modelData.metrics.totalTokens}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Top-1 Accuracy</span>
            <span className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {modelData.metrics.top1Accuracy}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Exact next-token match</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Top-3 Accuracy</span>
            <span className="text-xl md:text-2xl font-bold text-sky-600 tabular-nums">
              {modelData.metrics.top3Accuracy}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">In top 3 candidates</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Perplexity (PP)</span>
            <span className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {modelData.metrics.perplexity}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Lower indicates better fit</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Cross-Entropy Loss</span>
            <span className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {modelData.metrics.crossEntropyLoss}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Bits per token</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Vocabulary Size (|V|)</span>
            <span className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {modelData.metrics.vocabularySize}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Unique tokens</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Matrix Sparsity</span>
            <span className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {modelData.metrics.sparsityPercent}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Zero transitions</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Two-Zone Layout (Left: Controls & Training Text, Right: Live Generator & Predictions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Training Corpus & Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                Training Data Corpus
              </h3>
              <span className="text-xs text-slate-500">
                {modelData.metrics.totalTokens} words
              </span>
            </div>

            {/* Presets Segmented Bar */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 block">
                Load Sample Training Corpus:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BIGRAM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                      selectedPresetId === preset.id
                        ? 'border-sky-500 bg-sky-50/70 text-slate-900 font-medium ring-1 ring-sky-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 truncate">{preset.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{preset.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Training Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Corpus Editor (Type or Paste Custom Text):
                </label>
                <button
                  onClick={() => {
                    const preset = BIGRAM_PRESETS.find((p) => p.id === selectedPresetId);
                    if (preset) setCorpusText(preset.text);
                  }}
                  className="text-[11px] text-sky-600 hover:text-sky-700 font-medium"
                >
                  Reset to Preset
                </button>
              </div>
              <textarea
                value={corpusText}
                onChange={(e) => setCorpusText(e.target.value)}
                rows={7}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 resize-y"
                placeholder="Enter or paste text corpus to train bigram probabilities..."
              />
            </div>

            {/* Hyperparameters: Smoothing Alpha & Normalization */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    Laplace Smoothing (α): <strong className="text-sky-600 font-mono">{smoothingAlpha}</strong>
                  </span>
                  <span className="text-[11px] text-slate-500">Mitigates zero-probability bigrams</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.01"
                  value={smoothingAlpha}
                  onChange={(e) => setSmoothingAlpha(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Case Normalization</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowercase}
                    onChange={(e) => setLowercase(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-slate-600">Lowercase tokens</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Interactive Word Selector & Next-Word Predictor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            {/* Top Bar: Starting Word Selector & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-900 block">
                  Select Context Word (w<sub>t-1</sub>):
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={currentWord}
                    onChange={(e) => {
                      setCurrentWord(e.target.value);
                      setGeneratedTokens((prev) => [...prev, e.target.value]);
                    }}
                    className="text-sm font-semibold bg-sky-50 text-sky-900 border border-sky-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {modelData.vocabulary.map((w) => (
                      <option key={w} value={w}>
                        {w} ({modelData.unigramCounts.get(w) || 0}×)
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-500">
                    Active Token: <strong className="text-slate-800 font-mono">"{currentWord}"</strong>
                  </span>
                </div>
              </div>

              {/* Quick Word Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 mr-1">Frequent:</span>
                {modelData.topWords.slice(0, 5).map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setCurrentWord(w);
                      setGeneratedTokens((prev) => [...prev, w]);
                    }}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      currentWord === w
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Sequence Display Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  Generated Text Sequence ({generatedTokens.length} words):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={generatedTokens.length <= 1}
                    className="text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-500 flex items-center gap-1 text-[11px]"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                  <button
                    onClick={handleResetSequence}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleCopyText}
                    className="text-sky-600 hover:text-sky-700 flex items-center gap-1 text-[11px] font-medium ml-2"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl min-h-[90px] text-sm leading-relaxed font-sans shadow-inner flex flex-wrap items-center gap-1.5">
                {generatedTokens.map((token, idx) => {
                  const isLatest = idx === generatedTokens.length - 1;
                  return (
                    <span
                      key={`${token}-${idx}`}
                      className={`px-2 py-0.5 rounded transition-all ${
                        isLatest
                          ? 'bg-sky-500 text-white font-bold ring-2 ring-sky-300'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {token}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleStepNextWord}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Predict Next Word</span>
                <span className="bg-sky-700/80 px-2 py-0.5 rounded text-[11px] font-mono">
                  "{currentPrediction.selectedToken}"
                </span>
              </button>

              <button
                onClick={() => handleAutoGenerate(5)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>+5 Words</span>
              </button>

              <button
                onClick={() => handleAutoGenerate(10)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>+10 Words</span>
              </button>
            </div>

            {/* Sampling Strategy Config */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Sampling Strategy & Entropy:
                </span>
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
                  <button
                    onClick={() => setSamplingMode('greedy')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      samplingMode === 'greedy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Greedy (Argmax)
                  </button>
                  <button
                    onClick={() => setSamplingMode('temperature')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      samplingMode === 'temperature' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Temperature
                  </button>
                  <button
                    onClick={() => setSamplingMode('topK')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      samplingMode === 'topK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Top-K
                  </button>
                </div>
              </div>

              {samplingMode === 'temperature' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      Temperature (T): <strong className="text-sky-600 font-mono">{temperature}</strong>
                    </span>
                    <span>
                      {temperature < 0.4 ? 'Deterministic' : temperature > 1.2 ? 'High Entropy / Creative' : 'Balanced'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.8"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
              )}

              {samplingMode === 'topK' && (
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span>Consider Top K Tokens:</span>
                  {[3, 5, 8].map((kVal) => (
                    <button
                      key={kVal}
                      onClick={() => setTopK(kVal)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        topK === kVal ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      K = {kVal}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Candidate Next Word Probability Distribution Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                  Next Word Probability Distribution given "{currentWord}":
                </span>
                <span className="text-slate-500">
                  {currentPrediction.candidates.length} observed candidates
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {currentPrediction.candidates.slice(0, 6).map((cand, idx) => {
                  const percent = (cand.probability * 100).toFixed(1);
                  const isSelected = cand.token === currentPrediction.selectedToken;
                  return (
                    <div
                      key={cand.token}
                      onClick={() => handleChooseSpecificCandidate(cand.token)}
                      className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-50/70 font-semibold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-5 text-slate-400 font-mono text-[11px]">#{idx + 1}</span>
                        <span className="font-mono text-sm text-slate-900">"{cand.token}"</span>
                        {isSelected && (
                          <span className="text-[10px] text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded font-sans">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-sky-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, cand.probability * 100)}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-mono tabular-nums text-slate-900 font-medium">
                          {percent}%
                        </span>
                        <span className="w-12 text-right text-slate-400 text-[11px] tabular-nums">
                          ({cand.count}×)
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bigram Transition Matrix / Heatmap Explorer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Interactive Bigram Transition Heatmap (Top Vocabulary Pairs)
            </h3>
            <p className="text-xs text-slate-500">
              Cell (row <i>w<sub>t-1</sub></i>, col <i>w<sub>t</sub></i>) displays transition probability <i>P(w<sub>t</sub> | w<sub>t-1</sub>)</i>. Click any cell to seed prediction.
            </p>
          </div>
          {hoveredMatrixCell && (
            <div className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-mono">
              P("{hoveredMatrixCell.to}" | "{hoveredMatrixCell.from}") = {(hoveredMatrixCell.prob * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-slate-200 bg-slate-100 text-slate-500 text-left font-sans">
                  From \ To
                </th>
                {modelData.transitionMatrix.words.map((w) => (
                  <th key={w} className="p-2 border border-slate-200 bg-slate-50 text-slate-700 font-bold text-center">
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelData.transitionMatrix.words.map((fromW, rowIdx) => (
                <tr key={fromW}>
                  <td className="p-2 border border-slate-200 bg-slate-50 text-slate-900 font-bold">
                    {fromW}
                  </td>
                  {modelData.transitionMatrix.words.map((toW, colIdx) => {
                    const prob = modelData.transitionMatrix.matrix[rowIdx]?.[colIdx] || 0;
                    const intensity = Math.min(1, prob * 3);
                    const isZero = prob === 0;

                    return (
                      <td
                        key={`${fromW}-${toW}`}
                        onMouseEnter={() => setHoveredMatrixCell({ from: fromW, to: toW, prob })}
                        onMouseLeave={() => setHoveredMatrixCell(null)}
                        onClick={() => {
                          setCurrentWord(fromW);
                          setGeneratedTokens([fromW, toW]);
                        }}
                        style={{
                          backgroundColor: isZero
                            ? 'transparent'
                            : `rgba(14, 165, 233, ${Math.max(0.12, intensity)})`,
                        }}
                        className={`p-2 border border-slate-200 text-center cursor-pointer transition-colors tabular-nums ${
                          intensity > 0.5 ? 'text-white font-bold' : isZero ? 'text-slate-300' : 'text-slate-900'
                        }`}
                      >
                        {isZero ? '·' : (prob * 100).toFixed(0) + '%'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

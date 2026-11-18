import React, { useState, useRef, useEffect } from 'react';
import { MultimodalAnalysis } from '../types';
import {
  generateGuitarArpeggio,
  generateNatureStream,
  generateSpeechUtterance,
} from '../utils/audioSynth';
import {
  Eye,
  Volume2,
  Upload,
  Mic,
  Square,
  Play,
  Pause,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Activity,
  FileAudio,
  Radio,
  BarChart2,
  Copy,
  Check,
} from 'lucide-react';

interface SampleItem {
  id: string;
  name: string;
  category: string;
  modality: 'image' | 'audio';
  src?: string; // image path
  audioGenerator?: () => { base64: string; mimeType: string };
}

const SAMPLE_BENCHMARKS: SampleItem[] = [
  {
    id: 'sample_cheetah',
    name: 'Savanna Cheetah Wildlife',
    category: 'Fauna / Wildlife',
    modality: 'image',
    src: '/src/assets/images/sample_wildlife_cheetah_1793193300090.jpg',
  },
  {
    id: 'sample_architecture',
    name: 'Modern Tokyo Facade',
    category: 'Urban Architecture',
    modality: 'image',
    src: '/src/assets/images/sample_urban_architecture_1793193300092.jpg',
  },
  {
    id: 'sample_microscopy',
    name: 'Botanical Cell Microscopy',
    category: 'Scientific / Biological',
    modality: 'image',
    src: '/src/assets/images/sample_scientific_microscopy_1793193300327.jpg',
  },
  {
    id: 'sample_neural',
    name: 'Neural Network Diagram',
    category: 'AI / Schematics',
    modality: 'image',
    src: '/src/assets/images/mini_llm_hero_neural_1793193298892.jpg',
  },
  {
    id: 'sample_guitar',
    name: 'Acoustic Guitar Arpeggio',
    category: 'Music / Acoustic',
    modality: 'audio',
    audioGenerator: generateGuitarArpeggio,
  },
  {
    id: 'sample_nature',
    name: 'Natural Stream & Birdsong',
    category: 'Environmental Soundscape',
    modality: 'audio',
    audioGenerator: generateNatureStream,
  },
  {
    id: 'sample_speech',
    name: 'Spoken Vocal Formants',
    category: 'Human Speech / Voice',
    modality: 'audio',
    audioGenerator: generateSpeechUtterance,
  },
];

export const MultimodalModel: React.FC = () => {
  const [activeModality, setActiveModality] = useState<'image' | 'audio'>('image');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample_cheetah');

  // Active Media Data
  const [currentMediaData, setCurrentMediaData] = useState<string>('');
  const [currentMimeType, setCurrentMimeType] = useState<string>('image/jpeg');
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const [mediaName, setMediaName] = useState<string>('Savanna Cheetah Wildlife');

  // Audio Recording & Playback state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<MultimodalAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [engineName, setEngineName] = useState<string>('Integrated Multimodal Perception Engine');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample on initial mount or change
  useEffect(() => {
    loadSample(SAMPLE_BENCHMARKS[0]);
  }, []);

  const loadSample = async (sample: SampleItem) => {
    setSelectedSampleId(sample.id);
    setActiveModality(sample.modality);
    setMediaName(sample.name);
    setAnalysisError(null);

    if (sample.modality === 'image' && sample.src) {
      setMediaPreviewUrl(sample.src);
      try {
        const response = await fetch(sample.src);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setCurrentMediaData(base64);
          setCurrentMimeType(blob.type || 'image/jpeg');
          triggerAnalysis(base64, blob.type || 'image/jpeg', 'image', sample.name, sample.id);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to load sample image blob:', err);
      }
    } else if (sample.modality === 'audio' && sample.audioGenerator) {
      const { base64, mimeType } = sample.audioGenerator();
      const dataUri = `data:${mimeType};base64,${base64}`;
      setCurrentMediaData(dataUri);
      setCurrentMimeType(mimeType);
      setMediaPreviewUrl(dataUri);
      triggerAnalysis(dataUri, mimeType, 'audio', sample.name, sample.id);
    }
  };

  // Trigger server-side analysis
  const triggerAnalysis = async (
    dataUri: string,
    mimeType: string,
    modality: 'image' | 'audio',
    name: string,
    sampleId?: string
  ) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/multimodal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modality,
          data: dataUri,
          mimeType,
          sampleName: name,
          sampleId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Server error during multimodal analysis.');
      }

      setAnalysisResult(json.data);
      if (json.engine) {
        setEngineName(json.engine);
      }
    } catch (err: any) {
      console.error('Multimodal analysis failed:', err);
      setAnalysisError(err?.message || 'Multimodal analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Custom File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');

    if (!isImage && !isAudio) {
      alert('Please upload a valid image (PNG/JPEG/WEBP) or audio (MP3/WAV/WEBM) file.');
      return;
    }

    const modality = isImage ? 'image' : 'audio';
    setActiveModality(modality);
    setSelectedSampleId('custom');
    setMediaName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setCurrentMediaData(dataUri);
      setCurrentMimeType(file.type);
      setMediaPreviewUrl(dataUri);
      triggerAnalysis(dataUri, file.type, modality, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Live Microphone Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          setActiveModality('audio');
          setSelectedSampleId('custom_mic');
          setMediaName(`Live Recording (${recordingSeconds}s)`);
          setCurrentMediaData(dataUri);
          setCurrentMimeType('audio/webm');
          setMediaPreviewUrl(dataUri);
          triggerAnalysis(dataUri, 'audio/webm', 'audio', 'Live Microphone Sample');
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or unavailable in this environment.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Audio Playback
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  return (
    <div className="space-y-10">
      {/* 1. Header & Overview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-600">
          <span>Model Architecture 03</span>
          <span aria-hidden="true">·</span>
          <span>Multimodal Perception</span>
          <span aria-hidden="true">·</span>
          <span>Computer Vision & Acoustic Understanding</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Image & Audio Multimodal Model
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed">
          Upload any image or audio file (or record live voice) to receive a comprehensive descriptive breakdown, detected visual/acoustic concepts with individual confidence scores, and quantified model accuracy evaluations powered by Gemini.
        </p>
      </div>

      {/* 2. Modality Switcher & Benchmark Presets */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          {/* Modality Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">Select Modality:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
              <button
                onClick={() => {
                  const firstImg = SAMPLE_BENCHMARKS.find((s) => s.modality === 'image');
                  if (firstImg) loadSample(firstImg);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeModality === 'image'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image Vision</span>
              </button>

              <button
                onClick={() => {
                  const firstAudio = SAMPLE_BENCHMARKS.find((s) => s.modality === 'audio');
                  if (firstAudio) loadSample(firstAudio);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeModality === 'audio'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Acoustics</span>
              </button>
            </div>
          </div>

          {/* Action buttons: Upload File & Record Audio */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,audio/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Upload File</span>
            </button>

            {activeModality === 'audio' && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop ({recordingSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Voice</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Sample Gallery Bar */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Curated Benchmark Samples (1-Click Analysis):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SAMPLE_BENCHMARKS.filter((s) => s.modality === activeModality).map((sample) => (
              <button
                key={sample.id}
                onClick={() => loadSample(sample)}
                className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                  selectedSampleId === sample.id
                    ? 'border-sky-500 bg-sky-50/70 text-slate-900 font-medium ring-1 ring-sky-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-semibold text-slate-900 truncate">{sample.name}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{sample.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: Two-Zone Layout (Left: Preview & Controls, Right: Descriptive Analysis & Accuracies) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Media Preview & Playback */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900 truncate">
                Active Media: {mediaName}
              </span>
              <span className="text-[11px] text-slate-400 font-mono uppercase">
                {activeModality}
              </span>
            </div>

            {/* Visual or Audio Container */}
            {activeModality === 'image' ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-4/3 flex items-center justify-center relative shadow-sm group">
                {mediaPreviewUrl ? (
                  <img
                    src={mediaPreviewUrl}
                    alt={mediaName}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    <span>No image loaded</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-6 border border-slate-200 bg-slate-900 text-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{mediaName}</div>
                      <div className="text-[11px] text-slate-400">Audio Waveform & Player</div>
                    </div>
                  </div>

                  <button
                    onClick={togglePlayAudio}
                    className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center transition-colors shadow-sm"
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Animated / Simulated Acoustic Waveform */}
                <div className="h-16 bg-slate-950 rounded-lg p-2 flex items-center justify-between gap-1 border border-slate-800">
                  {Array.from({ length: 32 }).map((_, i) => {
                    const height = isPlayingAudio
                      ? Math.floor(Math.sin(i * 0.4 + Date.now() * 0.005) * 40 + 50)
                      : Math.floor(Math.sin(i * 0.3) * 30 + 35);
                    return (
                      <div
                        key={i}
                        className={`w-full rounded-full transition-all duration-75 ${
                          isPlayingAudio ? 'bg-sky-400' : 'bg-slate-700'
                        }`}
                        style={{ height: `${Math.max(15, Math.min(100, height))}%` }}
                      />
                    );
                  })}
                </div>

                <audio
                  ref={audioPlayerRef}
                  src={mediaPreviewUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />
              </div>
            )}

            {/* Re-analyze Button */}
            <button
              onClick={() =>
                triggerAnalysis(currentMediaData, currentMimeType, activeModality, mediaName, selectedSampleId)
              }
              disabled={isAnalyzing || !currentMediaData}
              className="w-full py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>
                {isAnalyzing ? 'Analyzing with Multimodal Model...' : 'Run Multimodal Analysis'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Output Description & Accuracy Metrics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Loading State */}
          {isAnalyzing && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-sky-50 text-sky-600 animate-spin">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-slate-900">
                  Multimodal Processing in Progress
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Extracting sensory representations, parsing perceptual attributes, and calculating statistical accuracy metrics...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {analysisError && !isAnalyzing && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 space-y-2">
              <h4 className="text-sm font-semibold">Multimodal Analysis Error</h4>
              <p className="text-xs leading-relaxed">{analysisError}</p>
            </div>
          )}

          {/* Results Display */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-6">
              {/* Primary Description Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {analysisResult.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span>Category: <strong className="text-slate-800">{analysisResult.category}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Engine: <strong className="text-sky-700">{engineName}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Rating: <strong className="text-emerald-700">{analysisResult.accuracyMetrics.confidenceGrade}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Overall Confidence</span>
                    <span className="text-2xl font-bold text-sky-600 tabular-nums">
                      {analysisResult.confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* Paragraph Description */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-900 block">
                    Detailed Descriptive Analysis:
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {analysisResult.description}
                  </p>
                </div>

                {/* Audio specific transcription or music notes */}
                {activeModality === 'audio' && analysisResult.audioSpecifics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Estimated Tempo</span>
                      <span className="font-bold text-slate-800">
                        {analysisResult.audioSpecifics.tempoBpm ? `${analysisResult.audioSpecifics.tempoBpm} BPM` : 'Ambient'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Dominant Mood</span>
                      <span className="font-bold text-slate-800">
                        {analysisResult.audioSpecifics.mood || 'Neutral'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Ambient Noise</span>
                      <span className="font-bold text-slate-800">
                        {analysisResult.audioSpecifics.noiseLevel || 'Low'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Sound Sources</span>
                      <span className="font-bold text-slate-800">
                        {analysisResult.audioSpecifics.speakerOrSourceCount || 1}
                      </span>
                    </div>

                    {analysisResult.audioSpecifics.transcript && (
                      <div className="col-span-2 sm:col-span-4 bg-sky-50/70 p-3 rounded-xl border border-sky-100">
                        <span className="text-[11px] font-semibold text-sky-800 block mb-1">
                          Speech Transcript / Acoustic Content:
                        </span>
                        <p className="text-xs text-sky-950 font-mono">
                          "{analysisResult.audioSpecifics.transcript}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Image specific attributes: Palette & Scene */}
                {activeModality === 'image' && analysisResult.imageSpecifics && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Scene Type: <strong className="text-slate-800">{analysisResult.imageSpecifics.sceneType || 'Natural'}</strong>
                      </span>
                      <span className="text-slate-500">
                        Lighting: <strong className="text-slate-800">{analysisResult.imageSpecifics.lightingQuality || 'Standard'}</strong>
                      </span>
                    </div>

                    {analysisResult.imageSpecifics.dominantColors && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-900 block">
                          Extracted Dominant Color Palette:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {analysisResult.imageSpecifics.dominantColors.map((hex) => (
                            <button
                              key={hex}
                              onClick={() => copyColor(hex)}
                              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono transition-colors"
                            >
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-slate-700">{hex}</span>
                              {copiedColor === hex ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantitative Model Accuracy & Evaluation Scorecard */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                    Multimodal Accuracy & Fidelity Scorecard
                  </h4>
                  <span className="text-xs text-slate-500">
                    Confidence Grade: <strong className="text-sky-700">{analysisResult.accuracyMetrics.confidenceGrade}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Perceptual Score</span>
                    <span className="text-xl font-bold text-sky-600 tabular-nums">
                      {analysisResult.accuracyMetrics.perceptualScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Sensory alignment</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Semantic Completeness</span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {analysisResult.accuracyMetrics.semanticCompleteness}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Entity coverage</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Signal Clarity / SNR</span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {analysisResult.accuracyMetrics.signalClarity}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Resolution / noise</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-0.5">F1 Benchmark Rate</span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {analysisResult.accuracyMetrics.f1Benchmark}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Empirical precision</span>
                  </div>
                </div>

                {/* Top Class Probabilities Distribution */}
                {analysisResult.topClasses && analysisResult.topClasses.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-xs font-semibold text-slate-800 block">
                      Classification Probabilities (Softmax Spread):
                    </span>
                    <div className="space-y-1.5">
                      {analysisResult.topClasses.map((cls) => (
                        <div key={cls.className} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                          <span className="font-mono text-slate-800">{cls.className}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-sky-500 h-full rounded-full"
                                style={{ width: `${Math.min(100, cls.probability)}%` }}
                              />
                            </div>
                            <span className="w-12 text-right font-mono tabular-nums text-slate-700">
                              {cls.probability}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detected Concepts / Elements Matrix */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-600" />
                    Detected Concept Elements & Individual Confidences
                  </h4>
                  <span className="text-xs text-slate-500">
                    {analysisResult.detectedElements.length} elements detected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.detectedElements.map((elem, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{elem.name}</span>
                        <span className="font-mono text-sky-700 font-bold tabular-nums">
                          {elem.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{ width: `${elem.confidence}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>{elem.category}</span>
                        {elem.details && <span className="truncate max-w-[140px]">{elem.details}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

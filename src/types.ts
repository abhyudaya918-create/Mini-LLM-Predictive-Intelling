export type ModelTab = 'bigram' | 'csv' | 'multimodal';

// Bigram Model Types
export interface BigramTokenProb {
  token: string;
  count: number;
  probability: number;
  cumulativeProb: number;
}

export interface BigramMetrics {
  vocabularySize: number;
  totalTokens: number;
  totalBigrams: number;
  uniqueBigrams: number;
  sparsityPercent: number;
  perplexity: number;
  crossEntropyLoss: number;
  top1Accuracy: number;
  top3Accuracy: number;
  validationTokensEvaluated: number;
}

export interface BigramPreset {
  id: string;
  name: string;
  description: string;
  tag: string;
  sampleStartWord: string;
  text: string;
}

// CSV Model Types
export type ColumnType = 'numeric' | 'categorical';

export interface CsvColumnInfo {
  name: string;
  type: ColumnType;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
  categories?: string[];
}

export interface CsvDataset {
  id: string;
  name: string;
  description: string;
  taskType: 'classification' | 'regression';
  defaultTarget: string;
  headers: string[];
  rows: Record<string, any>[];
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][]; // [actual][predicted]
  totalSamples: number;
}

export interface CsvModelMetrics {
  taskType: 'classification' | 'regression';
  trainCount: number;
  testCount: number;
  accuracy?: number; // 0-100%
  precision?: number;
  recall?: number;
  f1Score?: number;
  confusionMatrix?: ConfusionMatrixData;
  r2Score?: number;
  mae?: number;
  rmse?: number;
}

export interface PredictionResult {
  predictedValue: string | number;
  confidence?: number; // 0-100%
  classProbabilities?: { label: string; probability: number }[];
  nearestNeighbors?: { row: Record<string, any>; distance: number; targetValue: any }[];
  groundTruth?: any;
  isMatch?: boolean;
}

// Multimodal Analysis Types
export interface MultimodalAnalysis {
  title: string;
  category: string;
  description: string;
  confidenceScore: number;
  detectedElements: {
    name: string;
    confidence: number;
    category: string;
    details?: string;
  }[];
  topClasses: {
    className: string;
    probability: number;
  }[];
  accuracyMetrics: {
    perceptualScore: number;
    semanticCompleteness: number;
    signalClarity: number;
    f1Benchmark: number;
    confidenceGrade: string;
  };
  imageSpecifics?: {
    sceneType: string;
    dominantColors: string[];
    lightingQuality: string;
    spatialLayout: string;
  };
  audioSpecifics?: {
    transcript?: string;
    tempoBpm?: number;
    mood?: string;
    noiseLevel?: string;
    speakerOrSourceCount?: number;
    acousticTexture?: string;
  };
}

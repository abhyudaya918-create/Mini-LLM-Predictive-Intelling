import { BigramMetrics, BigramTokenProb } from '../types';

export interface BigramModelData {
  vocabulary: string[];
  vocabSet: Set<string>;
  unigramCounts: Map<string, number>;
  bigramCounts: Map<string, Map<string, number>>;
  transitions: Map<string, BigramTokenProb[]>;
  metrics: BigramMetrics;
  topWords: string[];
  transitionMatrix: {
    words: string[];
    matrix: number[][]; // [from][to]
  };
}

/**
 * Tokenize raw text into word tokens.
 */
export function tokenizeText(text: string, lowercase: boolean = true): string[] {
  let processed = text;
  if (lowercase) {
    processed = processed.toLowerCase();
  }
  // Replace newlines and punctuation with space-separated tokens
  processed = processed
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!processed) return [];
  return processed.split(' ').filter((t) => t.length > 0);
}

/**
 * Train a Bigram Model from raw corpus text.
 * Uses 80% for training parameters and 20% validation for computing real hold-out accuracy.
 */
export function trainBigramModel(
  rawText: string,
  smoothingAlpha: number = 0.05,
  lowercase: boolean = true
): BigramModelData {
  const tokens = tokenizeText(rawText, lowercase);

  if (tokens.length < 4) {
    return {
      vocabulary: [],
      vocabSet: new Set(),
      unigramCounts: new Map(),
      bigramCounts: new Map(),
      transitions: new Map(),
      metrics: {
        vocabularySize: 0,
        totalTokens: tokens.length,
        totalBigrams: 0,
        uniqueBigrams: 0,
        sparsityPercent: 0,
        perplexity: 0,
        crossEntropyLoss: 0,
        top1Accuracy: 0,
        top3Accuracy: 0,
        validationTokensEvaluated: 0,
      },
      topWords: [],
      transitionMatrix: { words: [], matrix: [] },
    };
  }

  // 80/20 train/validation split
  const splitIdx = Math.max(3, Math.floor(tokens.length * 0.8));
  const trainTokens = tokens.slice(0, splitIdx);
  const valTokens = tokens.slice(splitIdx);

  const unigramCounts = new Map<string, number>();
  const bigramCounts = new Map<string, Map<string, number>>();

  // Count unigrams and bigrams from trainTokens
  for (let i = 0; i < trainTokens.length; i++) {
    const w = trainTokens[i];
    unigramCounts.set(w, (unigramCounts.get(w) || 0) + 1);

    if (i < trainTokens.length - 1) {
      const nextW = trainTokens[i + 1];
      if (!bigramCounts.has(w)) {
        bigramCounts.set(w, new Map());
      }
      const map = bigramCounts.get(w)!;
      map.set(nextW, (map.get(nextW) || 0) + 1);
    }
  }

  // Also include validation tokens into vocabulary so lookups are well-defined
  for (const w of valTokens) {
    if (!unigramCounts.has(w)) {
      unigramCounts.set(w, 0); // known in vocab
    }
  }

  const vocabulary = Array.from(unigramCounts.keys()).sort((a, b) => {
    const countA = unigramCounts.get(a) || 0;
    const countB = unigramCounts.get(b) || 0;
    if (countB !== countA) return countB - countA;
    return a.localeCompare(b);
  });
  const vocabSet = new Set(vocabulary);
  const V = vocabulary.length;

  let uniqueBigrams = 0;
  for (const [, nextMap] of bigramCounts.entries()) {
    uniqueBigrams += nextMap.size;
  }

  // Compute transition probabilities with Laplace smoothing
  // P(w_t | w_{t-1}) = (C(w_{t-1}, w_t) + alpha) / (C(w_{t-1}) + alpha * V)
  const transitions = new Map<string, BigramTokenProb[]>();

  for (const w of vocabulary) {
    const cW = unigramCounts.get(w) || 0;
    const nextMap = bigramCounts.get(w) || new Map<string, number>();
    const denominator = cW + smoothingAlpha * V;

    const list: BigramTokenProb[] = [];

    // Calculate for words observed following w
    let cumProb = 0;
    const seenWords = Array.from(nextMap.entries()).sort((a, b) => b[1] - a[1]);

    for (const [nextW, count] of seenWords) {
      const prob = denominator > 0 ? (count + smoothingAlpha) / denominator : 1 / V;
      cumProb += prob;
      list.push({
        token: nextW,
        count,
        probability: prob,
        cumulativeProb: cumProb,
      });
    }

    // Sort list by probability descending
    list.sort((a, b) => b.probability - a.probability);
    transitions.set(w, list);
  }

  // Evaluate on hold-out validation tokens
  let correctTop1 = 0;
  let correctTop3 = 0;
  let logLossSum = 0;
  let evaluatedCount = 0;

  for (let i = 0; i < valTokens.length - 1; i++) {
    const prevW = valTokens[i];
    const actualNext = valTokens[i + 1];

    evaluatedCount++;
    const nextProbs = transitions.get(prevW);

    if (nextProbs && nextProbs.length > 0) {
      if (nextProbs[0].token === actualNext) {
        correctTop1++;
      }
      const top3Candidates = nextProbs.slice(0, 3).map((item) => item.token);
      if (top3Candidates.includes(actualNext)) {
        correctTop3++;
      }

      const match = nextProbs.find((item) => item.token === actualNext);
      const prob = match ? match.probability : smoothingAlpha / (V * smoothingAlpha + 1);
      logLossSum += -Math.log2(Math.max(1e-12, prob));
    } else {
      const uniformProb = 1 / V;
      logLossSum += -Math.log2(uniformProb);
    }
  }

  const crossEntropyLoss = evaluatedCount > 0 ? logLossSum / evaluatedCount : 0;
  const perplexity = evaluatedCount > 0 ? Math.pow(2, Math.min(20, crossEntropyLoss)) : 1;
  const top1Accuracy = evaluatedCount > 0 ? (correctTop1 / evaluatedCount) * 100 : 0;
  const top3Accuracy = evaluatedCount > 0 ? (correctTop3 / evaluatedCount) * 100 : 0;

  const totalPossibleTransitions = Math.max(1, V * V);
  const sparsityPercent = Math.max(0, ((totalPossibleTransitions - uniqueBigrams) / totalPossibleTransitions) * 100);

  // Top 10 words for Transition Matrix heatmap
  const topWords = vocabulary.slice(0, 8);
  const matrix: number[][] = [];
  for (let i = 0; i < topWords.length; i++) {
    const row: number[] = [];
    const w1 = topWords[i];
    const cand = transitions.get(w1) || [];
    for (let j = 0; j < topWords.length; j++) {
      const w2 = topWords[j];
      const found = cand.find((c) => c.token === w2);
      row.push(found ? found.probability : 0);
    }
    matrix.push(row);
  }

  return {
    vocabulary,
    vocabSet,
    unigramCounts,
    bigramCounts,
    transitions,
    metrics: {
      vocabularySize: V,
      totalTokens: tokens.length,
      totalBigrams: tokens.length - 1,
      uniqueBigrams,
      sparsityPercent: Number(sparsityPercent.toFixed(1)),
      perplexity: Number(perplexity.toFixed(2)),
      crossEntropyLoss: Number(crossEntropyLoss.toFixed(2)),
      top1Accuracy: Number(top1Accuracy.toFixed(1)),
      top3Accuracy: Number(top3Accuracy.toFixed(1)),
      validationTokensEvaluated: evaluatedCount,
    },
    topWords,
    transitionMatrix: {
      words: topWords,
      matrix,
    },
  };
}

/**
 * Predict next token using Greedy, Temperature Softmax, or Top-K sampling.
 */
export function sampleNextToken(
  model: BigramModelData,
  currentWord: string,
  mode: 'greedy' | 'temperature' | 'topK' = 'temperature',
  temperature: number = 0.7,
  k: number = 3
): { selectedToken: string; probability: number; candidates: BigramTokenProb[] } {
  const normWord = currentWord.trim().toLowerCase();
  let candidates = model.transitions.get(normWord);

  // If word not found, fall back to top frequent vocabulary words
  if (!candidates || candidates.length === 0) {
    const fallbackTop = model.vocabulary.slice(0, 5);
    candidates = fallbackTop.map((w, idx) => ({
      token: w,
      count: model.unigramCounts.get(w) || 1,
      probability: (5 - idx) / 15,
      cumulativeProb: 1,
    }));
  }

  if (mode === 'greedy') {
    const best = candidates[0];
    return { selectedToken: best.token, probability: best.probability, candidates };
  }

  let pool = candidates;
  if (mode === 'topK') {
    pool = candidates.slice(0, Math.max(1, Math.min(k, candidates.length)));
  }

  // Temperature-scaled sampling
  // T -> 0 approaches argmax; high T spreads probability
  const temp = Math.max(0.1, temperature);
  const logits = pool.map((c) => Math.log(Math.max(1e-10, c.probability)) / temp);
  const maxLogit = Math.max(...logits);
  const expLogits = logits.map((l) => Math.exp(l - maxLogit));
  const sumExp = expLogits.reduce((acc, v) => acc + v, 0);
  const scaledProbs = expLogits.map((v) => v / sumExp);

  // Random roulette wheel sampling
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < pool.length; i++) {
    cumulative += scaledProbs[i];
    if (rand <= cumulative || i === pool.length - 1) {
      return {
        selectedToken: pool[i].token,
        probability: pool[i].probability,
        candidates,
      };
    }
  }

  return { selectedToken: pool[0].token, probability: pool[0].probability, candidates };
}

import React, { useState, useMemo, useRef } from 'react';
import { CSV_DATASETS } from '../data/csvDatasets';
import {
  parseCsvString,
  analyzeColumns,
  trainCsvModel,
  predictCsvRow,
  TrainedModelArtifacts,
} from '../utils/csvEngine';
import { CsvDataset, PredictionResult, CsvColumnInfo } from '../types';
import {
  FileSpreadsheet,
  Upload,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Table,
  Sliders,
  Sparkles,
  BarChart2,
  Shuffle,
  ChevronRight,
} from 'lucide-react';

export const CsvModel: React.FC = () => {
  // Dataset selection & upload state
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(CSV_DATASETS[0].id);
  const [customCsvDataset, setCustomCsvDataset] = useState<CsvDataset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active dataset
  const activeDataset: CsvDataset = useMemo(() => {
    if (selectedDatasetId === 'custom' && customCsvDataset) {
      return customCsvDataset;
    }
    const found = CSV_DATASETS.find((d) => d.id === selectedDatasetId);
    return found || CSV_DATASETS[0];
  }, [selectedDatasetId, customCsvDataset]);

  // Target column & Feature column selection
  const [targetColumn, setTargetColumn] = useState<string>(activeDataset.defaultTarget);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    activeDataset.headers.filter((h) => h !== activeDataset.defaultTarget && !h.toLowerCase().includes('id'))
  );

  // When active dataset changes, update target & features
  const handleDatasetChange = (dataset: CsvDataset) => {
    setSelectedDatasetId(dataset.id);
    setTargetColumn(dataset.defaultTarget);
    const validFeatures = dataset.headers.filter(
      (h) => h !== dataset.defaultTarget && !h.toLowerCase().includes('id')
    );
    setSelectedFeatures(validFeatures);
    setInputLineValues({});
    setPredictionResult(null);
  };

  // Analyze active columns
  const columnAnalysis: CsvColumnInfo[] = useMemo(() => {
    return analyzeColumns(activeDataset.headers, activeDataset.rows);
  }, [activeDataset]);

  // Train the model
  const trainedModel: TrainedModelArtifacts | null = useMemo(() => {
    if (!targetColumn || selectedFeatures.length === 0) return null;
    try {
      return trainCsvModel(activeDataset.rows, targetColumn, selectedFeatures);
    } catch (err) {
      console.error('Failed to train CSV model:', err);
      return null;
    }
  }, [activeDataset, targetColumn, selectedFeatures]);

  // Interactive Line Input for Prediction ("give it a Line or one of the things from the css")
  const [inputLineValues, setInputLineValues] = useState<Record<string, any>>({});
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Set default line values if empty
  const currentLineValues = useMemo(() => {
    const values: Record<string, any> = { ...inputLineValues };
    selectedFeatures.forEach((feat) => {
      if (values[feat] === undefined) {
        const info = columnAnalysis.find((c) => c.name === feat);
        if (info?.type === 'numeric') {
          values[feat] = info.mean !== undefined ? info.mean : 0;
        } else if (info?.categories && info.categories.length > 0) {
          values[feat] = info.categories[0];
        } else {
          values[feat] = '';
        }
      }
    });
    return values;
  }, [inputLineValues, selectedFeatures, columnAnalysis]);

  // Load a specific row from the CSV dataset into the line input
  const handleLoadRow = (row: Record<string, any>, index: number) => {
    setSelectedRowIndex(index);
    const newVals: Record<string, any> = {};
    activeDataset.headers.forEach((h) => {
      newVals[h] = row[h];
    });
    setInputLineValues(newVals);

    // If model exists, execute prediction immediately
    if (trainedModel) {
      const pred = predictCsvRow(row, trainedModel);
      setPredictionResult(pred);
    }
  };

  // Load a random row
  const handleLoadRandomRow = () => {
    const randIdx = Math.floor(Math.random() * activeDataset.rows.length);
    handleLoadRow(activeDataset.rows[randIdx], randIdx);
  };

  // Run prediction on current input line
  const handlePredict = () => {
    if (!trainedModel) return;
    const pred = predictCsvRow(currentLineValues, trainedModel);
    setPredictionResult(pred);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const { headers, rows } = parseCsvString(text);
      if (headers.length > 1 && rows.length > 2) {
        const lastCol = headers[headers.length - 1];
        const newDataset: CsvDataset = {
          id: 'custom',
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: `Custom uploaded dataset with ${rows.length} rows and ${headers.length} columns.`,
          taskType: 'classification',
          defaultTarget: lastCol,
          headers,
          rows,
        };
        setCustomCsvDataset(newDataset);
        handleDatasetChange(newDataset);
      } else {
        alert('Invalid CSV format: requires at least 2 columns and 3 data rows.');
      }
    };
    reader.readAsText(file);
  };

  // Toggle feature inclusion
  const toggleFeature = (col: string) => {
    if (selectedFeatures.includes(col)) {
      if (selectedFeatures.length > 1) {
        setSelectedFeatures(selectedFeatures.filter((f) => f !== col));
      }
    } else {
      setSelectedFeatures([...selectedFeatures, col]);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Header & Overview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-600">
          <span>Model Architecture 02</span>
          <span aria-hidden="true">·</span>
          <span>Tabular CSV Inference</span>
          <span aria-hidden="true">·</span>
          <span>Supervised Column Prediction</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Tabular CSV Predictive Model
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed">
          Upload any CSV spreadsheet or explore curated benchmarks. Choose <strong>any column as the target output</strong>, feed the model a single line/row (or customize input attributes), and receive instant predictions with class probabilities and holdout validation accuracies.
        </p>
      </div>

      {/* 2. Dataset Selection Bar & Upload */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              Dataset Source & Target Configuration
            </h3>
            <span className="text-xs text-slate-500">
              {activeDataset.rows.length} total rows · {activeDataset.headers.length} columns available
            </span>
          </div>

          {/* Upload Custom CSV Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,text/csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Upload Custom CSV</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CSV_DATASETS.map((ds) => (
            <button
              key={ds.id}
              onClick={() => handleDatasetChange(ds)}
              className={`p-3 text-left rounded-xl border text-xs transition-all ${
                selectedDatasetId === ds.id
                  ? 'border-sky-500 bg-sky-50/70 text-slate-900 font-medium ring-1 ring-sky-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-semibold text-slate-900 truncate">{ds.name}</div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                Target: {ds.defaultTarget}
              </div>
            </button>
          ))}
          {customCsvDataset && (
            <button
              onClick={() => handleDatasetChange(customCsvDataset)}
              className={`p-3 text-left rounded-xl border text-xs transition-all ${
                selectedDatasetId === 'custom'
                  ? 'border-sky-500 bg-sky-50/70 text-slate-900 font-medium ring-1 ring-sky-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-semibold text-slate-900 truncate">
                {customCsvDataset.name} (Custom)
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                Target: {customCsvDataset.defaultTarget}
              </div>
            </button>
          )}
        </div>

        {/* Target Column & Features Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Output Target Column Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 block">
              1. Choose Output Target Column:
            </label>
            <select
              value={targetColumn}
              onChange={(e) => {
                const newTarget = e.target.value;
                setTargetColumn(newTarget);
                setSelectedFeatures((prev) => prev.filter((f) => f !== newTarget));
                setPredictionResult(null);
              }}
              className="w-full text-sm font-semibold bg-sky-50 text-sky-900 border border-sky-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {activeDataset.headers.map((col) => {
                const info = columnAnalysis.find((c) => c.name === col);
                return (
                  <option key={col} value={col}>
                    {col} ({info?.type === 'categorical' ? 'Classification' : 'Continuous/Regression'})
                  </option>
                );
              })}
            </select>
            <span className="text-[11px] text-slate-500 block">
              The model will optimize predictions to forecast this column.
            </span>
          </div>

          {/* Feature Columns Toggles */}
          <div className="md:col-span-7 space-y-1.5">
            <label className="text-xs font-semibold text-slate-900 block">
              2. Selected Input Feature Columns:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {activeDataset.headers
                .filter((h) => h !== targetColumn)
                .map((col) => {
                  const isChecked = selectedFeatures.includes(col);
                  return (
                    <button
                      key={col}
                      onClick={() => toggleFeature(col)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900 font-medium'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {col}
                    </button>
                  );
                })}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Click to toggle features in or out of the training matrix.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Model Accuracy & Evaluation Scorecard */}
      {trainedModel && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-600" />
                Model Accuracy & Validation Metrics
              </h3>
              <span className="text-xs text-slate-500">
                Trained on {trainedModel.metrics.trainCount} samples · Evaluated on {trainedModel.metrics.testCount} holdout samples
              </span>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800">
              Task: {trainedModel.taskType.toUpperCase()}
            </div>
          </div>

          {trainedModel.taskType === 'classification' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Test Set Accuracy</span>
                <span className="text-2xl font-bold text-sky-600 tabular-nums">
                  {trainedModel.metrics.accuracy}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Holdout test split</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Precision Score</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {trainedModel.metrics.precision}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Macro-averaged precision</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Recall Score</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {trainedModel.metrics.recall}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Sensitivity rate</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">F1-Score</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {trainedModel.metrics.f1Score}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Harmonic mean balance</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">R² Explained Variance</span>
                <span className="text-2xl font-bold text-sky-600 tabular-nums">
                  {trainedModel.metrics.r2Score}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Variance explained</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Mean Absolute Error (MAE)</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {trainedModel.metrics.mae}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Average deviation</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Root Mean Squared (RMSE)</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {trainedModel.metrics.rmse}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Penalized outlier loss</span>
              </div>
            </div>
          )}

          {/* Interactive Confusion Matrix for Classification */}
          {trainedModel.metrics.confusionMatrix && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Confusion Matrix (Actual Rows vs. Predicted Columns):
              </span>
              <div className="overflow-x-auto">
                <table className="text-xs font-mono border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-200 bg-slate-100 text-slate-600 text-left">
                        Actual \ Pred
                      </th>
                      {trainedModel.metrics.confusionMatrix.labels.map((l) => (
                        <th key={l} className="p-2 border border-slate-200 bg-slate-100 text-slate-800 font-bold">
                          {l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trainedModel.metrics.confusionMatrix.labels.map((actualLabel, rIdx) => (
                      <tr key={actualLabel}>
                        <td className="p-2 border border-slate-200 bg-slate-50 text-slate-800 font-bold">
                          {actualLabel}
                        </td>
                        {trainedModel.metrics.confusionMatrix!.labels.map((predLabel, cIdx) => {
                          const count = trainedModel.metrics.confusionMatrix!.matrix[rIdx][cIdx];
                          const isDiagonal = rIdx === cIdx;
                          return (
                            <td
                              key={`${actualLabel}-${predLabel}`}
                              className={`p-2 border border-slate-200 text-center tabular-nums ${
                                isDiagonal && count > 0
                                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                                  : count > 0
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {count}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Inference Stage: Give it a Line or Choose from Dataset Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Line Input Form & Prediction Result */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-600" />
                  Feed a Line / Row Input
                </h3>
                <span className="text-[11px] text-slate-500">
                  {selectedRowIndex !== null ? `Loaded from Row #${selectedRowIndex + 1}` : 'Custom line parameters'}
                </span>
              </div>
              <button
                onClick={handleLoadRandomRow}
                className="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Shuffle className="w-3 h-3" />
                <span>Random Row</span>
              </button>
            </div>

            {/* Dynamic feature input sliders and dropdowns */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {selectedFeatures.map((feat) => {
                const info = columnAnalysis.find((c) => c.name === feat);
                const currentVal = currentLineValues[feat];

                if (info?.type === 'numeric') {
                  const min = info.min !== undefined ? info.min : 0;
                  const max = info.max !== undefined ? info.max : 100;
                  const step = (max - min) > 50 ? 1 : 0.1;

                  return (
                    <div key={feat} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{feat}:</span>
                        <input
                          type="number"
                          value={currentVal !== undefined ? currentVal : ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setInputLineValues((prev) => ({ ...prev, [feat]: isNaN(val) ? 0 : val }));
                          }}
                          className="w-20 text-right font-mono text-xs p-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={currentVal !== undefined ? currentVal : min}
                        onChange={(e) => {
                          setInputLineValues((prev) => ({ ...prev, [feat]: parseFloat(e.target.value) }));
                        }}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Min: {min}</span>
                        <span>Max: {max}</span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={feat} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <label className="text-xs font-medium text-slate-800 block">
                        {feat}:
                      </label>
                      <select
                        value={currentVal !== undefined ? currentVal : ''}
                        onChange={(e) => {
                          setInputLineValues((prev) => ({ ...prev, [feat]: e.target.value }));
                        }}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-sky-500"
                      >
                        {(info?.categories || []).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
              })}
            </div>

            {/* Run Prediction Button */}
            <button
              onClick={handlePredict}
              disabled={!trainedModel}
              className="w-full py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Predict Output Column ({targetColumn})</span>
            </button>

            {/* Prediction Output Display */}
            {predictionResult && (
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Model Predicted Result:</span>
                  <span className="font-mono text-sky-400">Target: {targetColumn}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-white">
                    {String(predictionResult.predictedValue)}
                  </div>
                  {predictionResult.confidence !== undefined && (
                    <div className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-mono">
                      {predictionResult.confidence}% confidence
                    </div>
                  )}
                </div>

                {/* Ground Truth Validation Match if loaded from dataset row */}
                {predictionResult.groundTruth !== undefined && (
                  <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Actual Dataset Ground Truth:</span>
                    <span className="flex items-center gap-1 font-semibold">
                      {predictionResult.isMatch ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Match ({String(predictionResult.groundTruth)})
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Deviation ({String(predictionResult.groundTruth)})
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Class Probabilities Distribution */}
                {predictionResult.classProbabilities && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Class Distribution:</span>
                    {predictionResult.classProbabilities.map((prob) => (
                      <div key={prob.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-mono">{prob.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-400 h-full rounded-full"
                              style={{ width: `${prob.probability}%` }}
                            />
                          </div>
                          <span className="w-10 text-right tabular-nums text-slate-200">
                            {prob.probability}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Dataset Table (Click Any Row to Load!) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Table className="w-4 h-4 text-sky-600" />
                  Dataset Rows Explorer
                </h3>
                <p className="text-xs text-slate-500">
                  Click on <strong>any row</strong> to load its line attributes into the predictor above.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                Displaying {activeDataset.rows.length} records
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[480px]">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="p-2.5 text-left font-semibold text-slate-500 w-10">#</th>
                    {activeDataset.headers.map((h) => {
                      const isTarget = h === targetColumn;
                      return (
                        <th
                          key={h}
                          className={`p-2.5 text-left font-semibold whitespace-nowrap ${
                            isTarget ? 'text-sky-700 bg-sky-50 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {h}
                          {isTarget && ' (Target)'}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeDataset.rows.map((row, idx) => {
                    const isSelected = selectedRowIndex === idx;
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleLoadRow(row, idx)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-50/80 font-medium'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="p-2.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        {activeDataset.headers.map((h) => {
                          const isTarget = h === targetColumn;
                          return (
                            <td
                              key={h}
                              className={`p-2.5 whitespace-nowrap ${
                                isTarget ? 'font-semibold text-sky-900 bg-sky-50/50' : 'text-slate-700'
                              }`}
                            >
                              {String(row[h])}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

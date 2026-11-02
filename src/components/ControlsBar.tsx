import React from 'react';
import { ToneType, ResponseLengthType, ModelType } from '../types/persona';
import {
  SlidersHorizontal,
  Globe,
  Brain,
  Zap,
  Sparkles,
  Info,
} from 'lucide-react';

interface ControlsBarProps {
  tone: ToneType;
  onChangeTone: (tone: ToneType) => void;
  length: ResponseLengthType;
  onChangeLength: (length: ResponseLengthType) => void;
  searchGrounding: boolean;
  onToggleSearchGrounding: () => void;
  thinkingMode: boolean;
  onToggleThinkingMode: () => void;
  model: ModelType;
  onChangeModel: (model: ModelType) => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  tone,
  onChangeTone,
  length,
  onChangeLength,
  searchGrounding,
  onToggleSearchGrounding,
  thinkingMode,
  onToggleThinkingMode,
  model,
  onChangeModel,
}) => {
  return (
    <div className="bg-neutral-900/60 border-y border-neutral-800/80 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side: Tone and Length */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tone Control */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">Tone:</span>
            <div className="inline-flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
              {(['friendly', 'professional', 'concise'] as ToneType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onChangeTone(t)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all duration-150 ${
                    tone === t
                      ? 'bg-neutral-200 text-black shadow-xs font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Response Length */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">Length:</span>
            <div className="inline-flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800">
              {(['short', 'detailed'] as ResponseLengthType[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onChangeLength(l)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all duration-150 ${
                    length === l
                      ? 'bg-neutral-200 text-black shadow-xs font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Search Grounding, High Thinking, Model */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Google Search Grounding toggle */}
          <button
            onClick={onToggleSearchGrounding}
            title="Enable live Google Search grounding for real-time web facts"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all duration-150 ${
              searchGrounding
                ? 'bg-white text-black border-white shadow-xs font-semibold'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search Grounding</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                searchGrounding ? 'bg-black' : 'bg-neutral-600'
              }`}
            />
          </button>

          {/* High Thinking toggle (gemini-4-argon) */}
          <button
            onClick={onToggleThinkingMode}
            title="Enable Deep Thinking Mode using Gemini 4 Argon for high reasoning tasks"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all duration-150 ${
              thinkingMode
                ? 'bg-white text-black border-white shadow-xs font-semibold'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Deep Thinking</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                thinkingMode ? 'bg-black' : 'bg-neutral-600'
              }`}
            />
          </button>

          {/* Speed / Model selector dropdown */}
          {!thinkingMode && !searchGrounding && (
            <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => onChangeModel('gemini-3.8-flash')}
                className={`px-2 py-0.5 rounded text-[10.5px] transition-colors ${
                  model === 'gemini-3.8-flash'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="Gemini 3.8 Flash: Balanced quality & speed"
              >
                Standard
              </button>
              <button
                onClick={() => onChangeModel('gemini-3.1-flash-lite')}
                className={`px-2 py-0.5 rounded text-[10.5px] transition-colors ${
                  model === 'gemini-3.1-flash-lite'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="Gemini 3.1 Flash-Lite: Ultra-fast low latency"
              >
                Fast
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

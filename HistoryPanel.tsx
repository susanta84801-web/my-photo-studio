/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EditorSnapshot } from '../types/editor';
import {
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Sun,
  Eye,
  CornerDownRight,
  ArrowUpRight,
} from 'lucide-react';

interface HistoryPanelProps {
  history: EditorSnapshot[];
  historyIndex: number;
  onJumpToHistory: (index: number) => void;
  onResetToOriginal: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  historyIndex,
  onJumpToHistory,
  onResetToOriginal,
}) => {
  const getActionIcon = (actionName: string) => {
    const lower = actionName.toLowerCase();
    if (lower.includes('original') || lower.includes('initial') || lower.includes('uploaded')) {
      return <Clock className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (lower.includes('filter')) {
      return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (lower.includes('rotate') || lower.includes('flip') || lower.includes('crop')) {
      return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (lower.includes('reset')) {
      return <RotateCcw className="w-3.5 h-3.5 text-rose-400" />;
    }
    return <Sun className="w-3.5 h-3.5 text-purple-400" />;
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-purple-200">Edit History</h3>
          <span className="text-[11px] font-mono text-purple-300/80 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
            {historyIndex + 1} / {history.length}
          </span>
        </div>

        {historyIndex > 0 && (
          <button
            onClick={onResetToOriginal}
            className="text-[11px] font-medium text-rose-300 hover:text-rose-200 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-rose-950/30 border border-rose-900/30"
            title="Jump back to the initial untouched photo"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Revert to Start</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        Click any historical step below to instantly jump back or forward to that point in your editing session:
      </p>

      {/* History List */}
      <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
        {history.map((snapshot, idx) => {
          const isCurrent = idx === historyIndex;
          const isFuture = idx > historyIndex;
          const isPast = idx < historyIndex;

          return (
            <div
              key={snapshot.id || `snapshot-${idx}`}
              onClick={() => onJumpToHistory(idx)}
              className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-purple-950/70 border-purple-500 shadow-md shadow-purple-900/40 ring-1 ring-purple-500/40'
                  : isFuture
                  ? 'bg-[#151624]/60 border-purple-950/40 text-gray-400 hover:border-purple-800/60 hover:text-gray-200'
                  : 'bg-[#171829] border-purple-900/30 text-gray-300 hover:border-purple-600/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-purple-600 text-white shadow'
                      : isFuture
                      ? 'bg-[#202138] text-gray-500'
                      : 'bg-purple-900/40 text-purple-300 border border-purple-800/40'
                  }`}
                >
                  {getActionIcon(snapshot.actionName)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isCurrent
                          ? 'text-white font-bold'
                          : isFuture
                          ? 'text-gray-400 line-through opacity-75'
                          : 'text-gray-200'
                      }`}
                    >
                      {snapshot.actionName}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Step {idx + 1} &bull; {formatTime(snapshot.timestamp)}
                  </span>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                {isCurrent ? (
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                ) : isPast ? (
                  <span className="text-[10px] text-gray-400 group-hover:text-purple-300 flex items-center gap-0.5">
                    Undo to here
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 group-hover:text-purple-300 flex items-center gap-0.5">
                    Redo to here
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

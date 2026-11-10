/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FILTER_PRESETS, FilterPreset } from '../types/editor';
import { Sparkles, Check } from 'lucide-react';

interface FiltersPanelProps {
  activeFilterId: string;
  onSelectFilter: (filterId: string, filterName: string) => void;
  previewImageUrl?: string;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  activeFilterId,
  onSelectFilter,
  previewImageUrl,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'classic' | 'stylized' | 'cinematic' | 'mood'>('all');

  const categories = [
    { id: 'all', label: 'All Filters' },
    { id: 'classic', label: 'Classic' },
    { id: 'stylized', label: 'Stylized' },
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'mood', label: 'Mood' },
  ] as const;

  const filteredPresets = activeCategory === 'all'
    ? FILTER_PRESETS
    : FILTER_PRESETS.filter((p) => p.category === activeCategory || p.id === 'none');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-purple-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Preset Filters</span>
        </h3>
        <span className="text-[11px] text-purple-300/70">
          {FILTER_PRESETS.length} presets
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'bg-[#18192a] text-gray-400 hover:text-white hover:bg-[#20223a]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Cards Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto p-1">
        {filteredPresets.map((preset) => {
          const isActive = activeFilterId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectFilter(preset.id, preset.name)}
              className={`group relative rounded-xl border p-1.5 flex flex-col items-center text-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500/50'
                  : 'bg-[#171829] border-purple-900/30 hover:border-purple-600/60 text-gray-300'
              }`}
            >
              {/* Mini Preview Box */}
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/40 relative mb-1.5 flex items-center justify-center">
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt={preset.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    style={{ filter: preset.cssFilter }}
                  />
                ) : (
                  <div
                    className="w-full h-full bg-gradient-to-tr from-purple-800 to-indigo-500"
                    style={{ filter: preset.cssFilter }}
                  />
                )}

                {isActive && (
                  <div className="absolute top-1 right-1 bg-purple-600 text-white rounded-full p-0.5 shadow">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              <span className={`text-[11px] font-semibold truncate w-full ${isActive ? 'text-purple-300' : 'text-gray-300'}`}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Adjustments, DEFAULT_ADJUSTMENTS } from '../types/editor';
import {
  Sun,
  Contrast,
  Droplets,
  EyeOff,
  Palette,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Disc,
} from 'lucide-react';

interface AdjustmentsPanelProps {
  adjustments: Adjustments;
  onChange: (adjustments: Adjustments) => void;
  onCommit: (adjustments: Adjustments, actionName: string) => void;
  onResetAdjustments: () => void;
}

export const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({
  adjustments,
  onChange,
  onCommit,
  onResetAdjustments,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = (key: keyof Adjustments, value: number) => {
    onChange({
      ...adjustments,
      [key]: value,
    });
  };

  const handleCommitField = (key: keyof Adjustments) => {
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
    const unit = key === 'blur' ? 'px' : key === 'hueRotate' ? '°' : '%';
    const val = adjustments[key];
    onCommit(adjustments, `Adjusted ${formattedKey} (${val}${unit})`);
  };

  const resetField = (key: keyof Adjustments) => {
    const next = {
      ...adjustments,
      [key]: DEFAULT_ADJUSTMENTS[key],
    };
    onChange(next);
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
    onCommit(next, `Reset ${formattedKey}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-purple-200 flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-purple-400" />
          <span>Image Adjustments</span>
        </h3>
        <button
          onClick={onResetAdjustments}
          className="text-[11px] font-medium text-gray-400 hover:text-purple-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-purple-900/20"
          title="Reset all adjustments to defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Primary Adjustments (Brightness, Contrast, Saturation, Blur) */}
      <div className="space-y-3.5 bg-[#171829] p-3.5 rounded-xl border border-purple-900/30">
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 flex items-center gap-1.5 font-medium">
              <Sun className="w-3.5 h-3.5 text-yellow-400/80" />
              Brightness
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                {adjustments.brightness}%
              </span>
              {adjustments.brightness !== 100 && (
                <button
                  onClick={() => resetField('brightness')}
                  className="text-gray-500 hover:text-white"
                  title="Reset to 100%"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={adjustments.brightness}
            onChange={(e) => updateField('brightness', Number(e.target.value))}
            onPointerUp={() => handleCommitField('brightness')}
            onKeyUp={() => handleCommitField('brightness')}
            className="w-full accent-purple-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 flex items-center gap-1.5 font-medium">
              <Contrast className="w-3.5 h-3.5 text-indigo-400/80" />
              Contrast
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                {adjustments.contrast}%
              </span>
              {adjustments.contrast !== 100 && (
                <button
                  onClick={() => resetField('contrast')}
                  className="text-gray-500 hover:text-white"
                  title="Reset to 100%"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={adjustments.contrast}
            onChange={(e) => updateField('contrast', Number(e.target.value))}
            onPointerUp={() => handleCommitField('contrast')}
            onKeyUp={() => handleCommitField('contrast')}
            className="w-full accent-purple-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 flex items-center gap-1.5 font-medium">
              <Droplets className="w-3.5 h-3.5 text-pink-400/80" />
              Saturation
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                {adjustments.saturation}%
              </span>
              {adjustments.saturation !== 100 && (
                <button
                  onClick={() => resetField('saturation')}
                  className="text-gray-500 hover:text-white"
                  title="Reset to 100%"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={adjustments.saturation}
            onChange={(e) => updateField('saturation', Number(e.target.value))}
            onPointerUp={() => handleCommitField('saturation')}
            onKeyUp={() => handleCommitField('saturation')}
            className="w-full accent-purple-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
          />
        </div>

        {/* Blur */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-300 flex items-center gap-1.5 font-medium">
              <EyeOff className="w-3.5 h-3.5 text-blue-400/80" />
              Blur
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                {adjustments.blur}px
              </span>
              {adjustments.blur !== 0 && (
                <button
                  onClick={() => resetField('blur')}
                  className="text-gray-500 hover:text-white"
                  title="Reset to 0px"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={adjustments.blur}
            onChange={(e) => updateField('blur', Number(e.target.value))}
            onPointerUp={() => handleCommitField('blur')}
            onKeyUp={() => handleCommitField('blur')}
            className="w-full accent-purple-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
          />
        </div>
      </div>

      {/* Advanced Adjustments Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full py-2 px-3 rounded-xl bg-[#171829]/60 hover:bg-[#1c1d33] border border-purple-900/30 text-xs font-medium text-purple-300 flex items-center justify-between transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-purple-400" />
          <span>Advanced Adjustments (Warmth, Vignette, Hue, Invert)</span>
        </span>
        {showAdvanced ? (
          <ChevronUp className="w-4 h-4 text-purple-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-purple-400" />
        )}
      </button>

      {/* Advanced Adjustments Section */}
      {showAdvanced && (
        <div className="space-y-3.5 bg-[#171829] p-3.5 rounded-xl border border-purple-900/30 animate-fade-in">
          {/* Warmth */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-orange-400/80" />
                Color Warmth
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                  {adjustments.warmth > 0 ? `+${adjustments.warmth}` : adjustments.warmth}
                </span>
                {adjustments.warmth !== 0 && (
                  <button
                    onClick={() => resetField('warmth')}
                    className="text-gray-500 hover:text-white"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.warmth}
              onChange={(e) => updateField('warmth', Number(e.target.value))}
              onPointerUp={() => handleCommitField('warmth')}
              onKeyUp={() => handleCommitField('warmth')}
              className="w-full accent-orange-400 cursor-pointer h-1.5 rounded-lg bg-gray-700"
            />
          </div>

          {/* Vignette */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                <Disc className="w-3.5 h-3.5 text-purple-400/80" />
                Vignette
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                  {adjustments.vignette}%
                </span>
                {adjustments.vignette !== 0 && (
                  <button
                    onClick={() => resetField('vignette')}
                    className="text-gray-500 hover:text-white"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adjustments.vignette}
              onChange={(e) => updateField('vignette', Number(e.target.value))}
              onPointerUp={() => handleCommitField('vignette')}
              onKeyUp={() => handleCommitField('vignette')}
              className="w-full accent-purple-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
            />
          </div>

          {/* Hue Rotate */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                <Palette className="w-3.5 h-3.5 text-emerald-400/80" />
                Hue Rotate
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                  {adjustments.hueRotate}&deg;
                </span>
                {adjustments.hueRotate !== 0 && (
                  <button
                    onClick={() => resetField('hueRotate')}
                    className="text-gray-500 hover:text-white"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={adjustments.hueRotate}
              onChange={(e) => updateField('hueRotate', Number(e.target.value))}
              onPointerUp={() => handleCommitField('hueRotate')}
              onKeyUp={() => handleCommitField('hueRotate')}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
            />
          </div>

          {/* Sepia */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Sepia Tone</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                  {adjustments.sepia}%
                </span>
                {adjustments.sepia !== 0 && (
                  <button onClick={() => resetField('sepia')} className="text-gray-500 hover:text-white">
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adjustments.sepia}
              onChange={(e) => updateField('sepia', Number(e.target.value))}
              onPointerUp={() => handleCommitField('sepia')}
              onKeyUp={() => handleCommitField('sepia')}
              className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
            />
          </div>

          {/* Grayscale */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Grayscale</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                  {adjustments.grayscale}%
                </span>
                {adjustments.grayscale !== 0 && (
                  <button onClick={() => resetField('grayscale')} className="text-gray-500 hover:text-white">
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adjustments.grayscale}
              onChange={(e) => updateField('grayscale', Number(e.target.value))}
              onPointerUp={() => handleCommitField('grayscale')}
              onKeyUp={() => handleCommitField('grayscale')}
              className="w-full accent-gray-400 cursor-pointer h-1.5 rounded-lg bg-gray-700"
            />
          </div>

          {/* Invert */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Color Inversion</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-purple-300 text-[11px] font-semibold w-10 text-right">
                  {adjustments.invert}%
                </span>
                {adjustments.invert !== 0 && (
                  <button onClick={() => resetField('invert')} className="text-gray-500 hover:text-white">
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={adjustments.invert}
              onChange={(e) => updateField('invert', Number(e.target.value))}
              onPointerUp={() => handleCommitField('invert')}
              onKeyUp={() => handleCommitField('invert')}
              className="w-full accent-purple-400 cursor-pointer h-1.5 rounded-lg bg-gray-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};

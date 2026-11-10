/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TransformState, AspectRatioType, DEFAULT_TRANSFORM } from '../types/editor';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Layers,
  RotateCcw as ResetIcon,
} from 'lucide-react';

interface TransformPanelProps {
  transform: TransformState;
  onChange: (transform: TransformState, actionName: string) => void;
  onResetTransform: () => void;
}

export const TransformPanel: React.FC<TransformPanelProps> = ({
  transform,
  onChange,
  onResetTransform,
}) => {
  const rotateClockwise = () => {
    const nextRot = (transform.rotation + 90) % 360;
    onChange(
      {
        ...transform,
        rotation: nextRot,
      },
      `Rotate 90° Clockwise (${nextRot}°)`
    );
  };

  const rotateCounterClockwise = () => {
    const nextRot = (transform.rotation - 90 + 360) % 360;
    onChange(
      {
        ...transform,
        rotation: nextRot,
      },
      `Rotate -90° (${nextRot}°)`
    );
  };

  const toggleFlipHorizontal = () => {
    const next = !transform.flipHorizontal;
    onChange(
      {
        ...transform,
        flipHorizontal: next,
      },
      next ? 'Flip Horizontal (On)' : 'Flip Horizontal (Off)'
    );
  };

  const toggleFlipVertical = () => {
    const next = !transform.flipVertical;
    onChange(
      {
        ...transform,
        flipVertical: next,
      },
      next ? 'Flip Vertical (On)' : 'Flip Vertical (Off)'
    );
  };

  const setAspectRatio = (ratio: AspectRatioType, label: string) => {
    onChange(
      {
        ...transform,
        aspectRatio: ratio,
      },
      `Crop Ratio: ${label}`
    );
  };

  const aspectRatios: { id: AspectRatioType; label: string; iconLabel: string }[] = [
    { id: 'original', label: 'Free / Original', iconLabel: 'Free' },
    { id: '1:1', label: 'Square (1:1)', iconLabel: '1:1' },
    { id: '4:5', label: 'Portrait (4:5)', iconLabel: '4:5' },
    { id: '16:9', label: 'Landscape (16:9)', iconLabel: '16:9' },
    { id: '9:16', label: 'Story / Reel (9:16)', iconLabel: '9:16' },
    { id: '4:3', label: 'Standard (4:3)', iconLabel: '4:3' },
    { id: '3:2', label: 'DSLR (3:2)', iconLabel: '3:2' },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-purple-200 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Transform &amp; Crop</span>
        </h3>
        <button
          onClick={onResetTransform}
          className="text-[11px] font-medium text-gray-400 hover:text-purple-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-purple-900/20"
          title="Reset rotation, flips, and crop"
        >
          <ResetIcon className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Rotation & Flip Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={rotateClockwise}
          className="p-2.5 rounded-xl bg-[#171829] hover:bg-purple-900/40 border border-purple-900/40 hover:border-purple-600 text-purple-200 flex flex-col items-center gap-1 text-xs font-medium transition-all active:scale-95"
          title="Rotate 90 degrees clockwise"
        >
          <RotateCw className="w-4 h-4 text-purple-400" />
          <span className="text-[10px]">Rotate 90&deg;</span>
        </button>

        <button
          onClick={rotateCounterClockwise}
          className="p-2.5 rounded-xl bg-[#171829] hover:bg-purple-900/40 border border-purple-900/40 hover:border-purple-600 text-purple-200 flex flex-col items-center gap-1 text-xs font-medium transition-all active:scale-95"
          title="Rotate 90 degrees counter-clockwise"
        >
          <RotateCcw className="w-4 h-4 text-purple-400" />
          <span className="text-[10px]">Rotate -90&deg;</span>
        </button>

        <button
          onClick={toggleFlipHorizontal}
          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all active:scale-95 ${
            transform.flipHorizontal
              ? 'bg-purple-900/60 border-purple-500 text-white shadow-md shadow-purple-900/30'
              : 'bg-[#171829] hover:bg-purple-900/40 border-purple-900/40 text-purple-200'
          }`}
          title="Flip horizontally"
        >
          <FlipHorizontal className="w-4 h-4 text-purple-400" />
          <span className="text-[10px]">Flip Horiz</span>
        </button>

        <button
          onClick={toggleFlipVertical}
          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all active:scale-95 ${
            transform.flipVertical
              ? 'bg-purple-900/60 border-purple-500 text-white shadow-md shadow-purple-900/30'
              : 'bg-[#171829] hover:bg-purple-900/40 border-purple-900/40 text-purple-200'
          }`}
          title="Flip vertically"
        >
          <FlipVertical className="w-4 h-4 text-purple-400" />
          <span className="text-[10px]">Flip Vert</span>
        </button>
      </div>

      {/* Aspect Ratio Crop Selection */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
          <Crop className="w-3.5 h-3.5 text-purple-400" />
          <span>Aspect Ratio Presets</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {aspectRatios.map((item) => {
            const isSelected = transform.aspectRatio === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAspectRatio(item.id, item.label)}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border transition-all truncate text-center ${
                  isSelected
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#171829] border-purple-900/30 text-gray-300 hover:border-purple-600/50'
                }`}
                title={item.label}
              >
                {item.iconLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

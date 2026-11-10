/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { SAMPLE_PHOTOS, SamplePhoto } from '../data/samplePhotos';

interface SamplePhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SamplePhoto) => void;
}

export const SamplePhotosModal: React.FC<SamplePhotosModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1a1b2d] border border-purple-800/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-[#161727]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-900/40 border border-purple-700/40 text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Choose a Sample Photo</h2>
              <p className="text-xs text-purple-300/70">
                Explore studio adjustments and filters right away with curated high-res photos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SAMPLE_PHOTOS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="group relative bg-[#131422] border border-purple-900/40 hover:border-purple-500 rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-900/30"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img
                  src={sample.thumbnail}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  crossOrigin="anonymous"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-purple-200 px-2 py-0.5 rounded-md">
                  {sample.category}
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  {sample.title}
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Photo by {sample.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

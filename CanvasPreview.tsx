/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Adjustments, TransformState, AspectRatioType } from '../types/editor';
import { buildFilterString, getCropDimensions } from '../utils/imageExport';
import {
  Upload,
  HardDrive,
  Sparkles,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface CanvasPreviewProps {
  imageSrc: string | null;
  adjustments: Adjustments;
  transform: TransformState;
  activeFilterId: string;
  onUploadFile: (file: File) => void;
  onOpenDriveModal: () => void;
  onOpenSampleModal: () => void;
  imgRef: React.RefObject<HTMLImageElement | null>;
  onImageLoad: () => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  imageSrc,
  adjustments,
  transform,
  activeFilterId,
  onUploadFile,
  onOpenDriveModal,
  onOpenSampleModal,
  imgRef,
  onImageLoad,
}) => {
  const [isComparing, setIsComparing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filterString = isComparing
    ? 'none'
    : buildFilterString(adjustments, activeFilterId);

  // Geometry transform
  const rotation = isComparing ? 0 : transform.rotation;
  const scaleX = isComparing ? 1 : transform.flipHorizontal ? -1 : 1;
  const scaleY = isComparing ? 1 : transform.flipVertical ? -1 : 1;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUploadFile(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  // Reset zoom whenever image changes
  useEffect(() => {
    setZoomLevel(1);
  }, [imageSrc]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl bg-[#131422] border transition-all overflow-hidden flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] ${
        isDragging
          ? 'border-purple-400 bg-purple-950/30 ring-2 ring-purple-500'
          : 'border-purple-900/40 shadow-2xl'
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Floating Controls (When photo is loaded) */}
      {imageSrc && (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          {/* Compare Button */}
          <button
            type="button"
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-lg transition-all active:scale-95 select-none"
            title="Press & hold to view original untouched photo"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>{isComparing ? 'Viewing Original' : 'Hold to Compare'}</span>
          </button>

          {/* Zoom & Dimensions */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
              className="p-1 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-purple-200 px-1 font-medium w-11 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
              className="p-1 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 text-purple-400 hover:text-purple-300 rounded-lg hover:bg-white/10 text-[10px] font-bold"
                title="Reset Zoom"
              >
                100%
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Image Display */}
      {imageSrc ? (
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Subtle checkerboard pattern behind transparent PNGs */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)`,
              backgroundSize: `20px 20px`,
              backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`,
            }}
          />

          <div
            className="relative transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-[460px] sm:max-h-[520px]"
            style={{
              transform: `scale(${zoomLevel})`,
            }}
          >
            {/* Visual Vignette Overlay */}
            {!isComparing && adjustments.vignette > 0 && (
              <div
                className="absolute inset-0 pointer-events-none rounded-lg z-10"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(0,0,0,0) ${100 - adjustments.vignette}%, rgba(0,0,0,${(adjustments.vignette / 100) * 0.85}) 100%)`,
                }}
              />
            )}

            {/* Visual Warmth Overlay */}
            {!isComparing && adjustments.warmth !== 0 && (
              <div
                className="absolute inset-0 pointer-events-none rounded-lg z-10 mix-blend-overlay"
                style={{
                  backgroundColor: adjustments.warmth > 0 ? '#ff7d00' : '#00a0ff',
                  opacity: Math.min(Math.abs(adjustments.warmth) / 100 * 0.35, 0.4),
                }}
              />
            )}

            <img
              ref={imgRef}
              src={imageSrc}
              alt="Photo for editing"
              onLoad={onImageLoad}
              crossOrigin="anonymous"
              className="max-w-full max-h-[440px] sm:max-h-[500px] object-contain rounded-lg shadow-2xl transition-all duration-200 select-none"
              style={{
                filter: filterString,
                transform: `rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
              }}
            />
          </div>
        </div>
      ) : (
        /* Empty State & Upload Dropzone */
        <div className="p-8 text-center max-w-md mx-auto space-y-5 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center mx-auto text-purple-300 shadow-xl shadow-purple-900/20">
            <ImageIcon className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-1.5">Upload Your Photo</h3>
            <p className="text-xs text-gray-400">
              Drag and drop an image anywhere, upload from your device, or open from Google Drive
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload from Device</span>
            </button>

            <button
              onClick={onOpenDriveModal}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1c1d30] hover:bg-[#252740] border border-purple-700/40 text-purple-200 font-semibold text-xs sm:text-sm transition-all active:scale-95"
            >
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>Google Drive</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenSampleModal}
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Or try with a sample photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Dragging Feedback Badge */}
      {isDragging && (
        <div className="absolute inset-0 bg-purple-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30">
          <Upload className="w-12 h-12 text-purple-300 animate-bounce mb-2" />
          <p className="text-base font-bold">Drop your image here to edit</p>
        </div>
      )}
    </div>
  );
};

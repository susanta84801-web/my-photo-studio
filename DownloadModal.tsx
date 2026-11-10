/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, X, Check, FileDown } from 'lucide-react';
import { canvasToBlob } from '../utils/imageExport';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  canvas,
}) => {
  const [fileName, setFileName] = useState(() => {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10);
    return `My-Edited-Photo-${dateStr}`;
  });
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState(92);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const getExtension = () => {
    switch (format) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/webp':
        return '.webp';
      case 'image/png':
      default:
        return '.png';
    }
  };

  const handleDownload = async () => {
    if (!canvas) return;
    setDownloading(true);

    try {
      const blob = await canvasToBlob(canvas, format, quality / 100);
      const url = URL.createObjectURL(blob);
      const fullFileName = fileName.trim().endsWith(getExtension())
        ? fileName.trim()
        : `${fileName.trim()}${getExtension()}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fullFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1a1b2d] border border-purple-800/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-[#161727]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-900/40 border border-purple-700/40 text-purple-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Save Photo to Device</h2>
              <p className="text-xs text-purple-300/70">Export full-resolution edited image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              File Name
            </label>
            <div className="flex items-center gap-1 bg-[#131422] border border-purple-800/40 rounded-xl px-3 py-2 focus-within:border-purple-500 transition-colors">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Photo name..."
                className="bg-transparent text-sm text-white w-full focus:outline-none"
              />
              <span className="text-xs text-purple-400 font-mono font-medium">{getExtension()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'image/png', label: 'PNG', desc: 'Lossless' },
                  { id: 'image/jpeg', label: 'JPEG', desc: 'Standard' },
                  { id: 'image/webp', label: 'WebP', desc: 'Compact' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormat(item.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    format === item.id
                      ? 'bg-purple-900/50 border-purple-500 text-white shadow-md shadow-purple-900/30'
                      : 'bg-[#131422] border-purple-900/30 text-gray-300 hover:border-purple-700/50'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-purple-300/60">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {format !== 'image/png' && (
            <div>
              <div className="flex justify-between text-xs text-purple-200 mb-1.5">
                <span>Quality</span>
                <span className="font-mono text-purple-400 font-semibold">{quality}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          )}

          {canvas && (
            <div className="flex items-center justify-between text-[11px] text-gray-400 bg-[#131422] p-2.5 rounded-xl border border-purple-900/20">
              <span>Resolution:</span>
              <span className="font-mono text-purple-300 font-medium">
                {canvas.width} &times; {canvas.height} px
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !fileName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

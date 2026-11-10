/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  X,
  FileImage,
  Sparkles,
} from 'lucide-react';
import { uploadImageToDrive } from '../services/driveService';
import { canvasToBlob } from '../utils/imageExport';

interface DriveSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  user: User | null;
  canvas: HTMLCanvasElement | null;
}

export const DriveSaveModal: React.FC<DriveSaveModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  user,
  canvas,
}) => {
  const [fileName, setFileName] = useState(() => {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10);
    return `Photo-Studio-Edit-${dateStr}`;
  });
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState(90);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResult, setSavedResult] = useState<{ id: string; name: string; webViewLink?: string } | null>(null);

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

  const fullFileName = fileName.trim().endsWith(getExtension())
    ? fileName.trim()
    : `${fileName.trim()}${getExtension()}`;

  const handleSaveToDrive = async () => {
    if (!canvas || !accessToken) {
      setError('Cannot save: photo canvas or authorization token is missing.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const blob = await canvasToBlob(canvas, format, quality / 100);
      const result = await uploadImageToDrive(accessToken, fullFileName, blob);
      setSavedResult(result);
    } catch (err: any) {
      console.error('Failed to save to Drive:', err);
      setError(err?.message || 'Failed to upload photo to Google Drive');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSavedResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1a1b2d] border border-purple-800/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-[#161727]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-900/40 border border-purple-700/40 text-purple-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Save to Google Drive</h2>
              <p className="text-xs text-purple-300/70">
                Save your high-resolution edited photo directly into your Drive
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {savedResult ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Saved to Google Drive!</h3>
              <p className="text-xs text-gray-300 mb-6">
                Your edited photo <strong className="text-purple-300 font-semibold">{savedResult.name}</strong> was
                successfully uploaded to your Google Drive account.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {savedResult.webViewLink && (
                  <a
                    href={savedResult.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-600/30"
                  >
                    <span>View in Google Drive</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Confirmation & Options Form */
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Explicit User Confirmation Notice per Workspace Skill Guidelines */}
              <div className="p-3.5 bg-purple-950/40 border border-purple-800/40 rounded-xl flex items-start gap-3 text-xs text-purple-200/90">
                <FileImage className="w-5 h-5 shrink-0 text-purple-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-0.5">Save confirmation</p>
                  <p className="text-purple-300/80">
                    This will create and upload a new photo file to Google Drive connected to account{' '}
                    <strong className="text-white font-medium">{user?.email || 'your account'}</strong>.
                  </p>
                </div>
              </div>

              {/* Filename Input */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  File Name
                </label>
                <div className="flex items-center gap-1 bg-[#131422] border border-purple-800/40 rounded-xl px-3 py-2 focus-within:border-purple-500 transition-colors">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name..."
                    className="bg-transparent text-sm text-white w-full focus:outline-none"
                  />
                  <span className="text-xs text-purple-400 font-mono font-medium">{getExtension()}</span>
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Image Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'image/png', label: 'PNG', desc: 'Lossless' },
                      { id: 'image/jpeg', label: 'JPEG', desc: 'Standard' },
                      { id: 'image/webp', label: 'WebP', desc: 'Optimized' },
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

              {/* Quality slider for JPG / WebP */}
              {format !== 'image/png' && (
                <div>
                  <div className="flex justify-between text-xs text-purple-200 mb-1.5">
                    <span>Export Quality</span>
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

              {/* Canvas Specs */}
              {canvas && (
                <div className="flex items-center justify-between text-[11px] text-gray-400 bg-[#131422] p-2.5 rounded-xl border border-purple-900/20">
                  <span>Target Resolution:</span>
                  <span className="font-mono text-purple-300 font-medium">
                    {canvas.width} &times; {canvas.height} px
                  </span>
                </div>
              )}

              {/* Confirmation Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/40">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveToDrive}
                  disabled={isSaving || !fileName.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Drive...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4" />
                      <span>Confirm &amp; Save to Drive</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

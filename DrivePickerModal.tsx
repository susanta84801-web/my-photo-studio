/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HardDrive, Search, RefreshCw, X, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';
import { DriveFile, listDriveImages, downloadDriveImageBlob } from '../services/driveService';

interface DrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  onSelectImage: (blob: Blob, fileName: string) => void;
}

export const DrivePickerModal: React.FC<DrivePickerModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  onSelectImage,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async (query = '') => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const items = await listDriveImages(accessToken, query);
      setFiles(items);
    } catch (err: any) {
      console.error('Failed to list drive files:', err);
      setError(err?.message || 'Failed to fetch files from Google Drive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchFiles(searchQuery);
    }
  }, [isOpen, accessToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(searchQuery);
  };

  const handleSelectFile = async (file: DriveFile) => {
    if (!accessToken) return;
    setDownloadingId(file.id);
    setError(null);
    try {
      const blob = await downloadDriveImageBlob(accessToken, file.id);
      onSelectImage(blob, file.name);
      onClose();
    } catch (err: any) {
      console.error('Failed to download drive image:', err);
      setError(err?.message || 'Could not download the selected photo from Google Drive');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '';
    const b = parseInt(bytes, 10);
    if (isNaN(b)) return '';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#1a1b2d] border border-purple-800/40 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-[#161727]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-900/40 border border-purple-700/40 text-purple-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google Drive Photos</h2>
              <p className="text-xs text-purple-300/70">
                Select an image file from your Google Drive to open in My Photo Studio
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

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-purple-900/30 bg-[#1e1f33] flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search images in Drive by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131422] border border-purple-800/40 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </form>
          <button
            onClick={() => fetchFiles(searchQuery)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/40 text-purple-200 text-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[300px]">
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl text-sm flex items-start justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-xs text-red-400 underline ml-2">
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-purple-300">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-purple-400" />
              <p className="text-sm font-medium">Loading photos from your Google Drive...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-900/20 border border-purple-800/30 flex items-center justify-center text-purple-400 mb-3">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-200 mb-1">No images found</h3>
              <p className="text-xs text-gray-400 max-w-sm mb-4">
                {searchQuery
                  ? `No photos matching "${searchQuery}" were found in your Google Drive.`
                  : 'No image files (JPEG, PNG, WebP) were detected in your Google Drive. Upload photos to your Drive or use the local upload button.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    fetchFiles('');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Clear search filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {files.map((file) => {
                const isDownloading = downloadingId === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => !isDownloading && handleSelectFile(file)}
                    className="group relative bg-[#131422] border border-purple-900/30 hover:border-purple-500 rounded-xl p-2.5 flex flex-col cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-900/20"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square w-full rounded-lg bg-black/40 overflow-hidden relative mb-2 flex items-center justify-center">
                      {file.thumbnailLink ? (
                        <img
                          src={file.thumbnailLink}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-purple-400/40" />
                      )}

                      {/* Download Spinner Overlay */}
                      {isDownloading && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-400 mb-1" />
                          <span className="text-[11px] font-medium">Opening...</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 flex flex-col justify-between">
                      <p
                        className="text-xs font-medium text-gray-200 group-hover:text-purple-300 truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.modifiedTime)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-purple-900/40 bg-[#161727] flex items-center justify-between text-xs text-gray-400">
          <span>{files.length} images available in Drive</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

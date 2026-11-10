/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebaseAuth';
import {
  Adjustments,
  TransformState,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_TRANSFORM,
  EditorSnapshot,
} from './types/editor';
import { renderToCanvas } from './utils/imageExport';
import { Header } from './components/Header';
import { CanvasPreview } from './components/CanvasPreview';
import { AdjustmentsPanel } from './components/AdjustmentsPanel';
import { FiltersPanel } from './components/FiltersPanel';
import { TransformPanel } from './components/TransformPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { DrivePickerModal } from './components/DrivePickerModal';
import { DriveSaveModal } from './components/DriveSaveModal';
import { DownloadModal } from './components/DownloadModal';
import { SamplePhotosModal } from './components/SamplePhotosModal';
import { SamplePhoto, SAMPLE_PHOTOS } from './data/samplePhotos';
import {
  RotateCcw,
  Undo2,
  Redo2,
  HardDrive,
  Download,
  Upload,
  Sparkles,
  Sliders,
  Layers,
  History,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Editor states
  const [imageSrc, setImageSrc] = useState<string | null>(SAMPLE_PHOTOS[0].url);
  const [currentFileName, setCurrentFileName] = useState<string>('sample-neon-portrait.jpg');
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [transform, setTransform] = useState<TransformState>(DEFAULT_TRANSFORM);
  const [activeFilterId, setActiveFilterId] = useState<string>('none');
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'transform' | 'history'>('adjust');

  // Notification badge for undo/redo actions
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showStatus = (msg: string) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    setStatusNotification(msg);
    statusTimerRef.current = setTimeout(() => {
      setStatusNotification(null);
    }, 2400);
  };

  // Undo / Redo History System
  const [history, setHistory] = useState<EditorSnapshot[]>([
    {
      id: 'initial-photo',
      actionName: 'Original Photo',
      timestamp: Date.now(),
      adjustments: DEFAULT_ADJUSTMENTS,
      transform: DEFAULT_TRANSFORM,
      activeFilterId: 'none',
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modals state
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [isDriveSaveOpen, setIsDriveSaveOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [exportCanvas, setExportCanvas] = useState<HTMLCanvasElement | null>(null);

  // Image Element Reference
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Login
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Push snapshot into history stack (caps at 50 to maintain performance)
  const pushHistorySnapshot = useCallback(
    (
      newAdj: Adjustments,
      newTrans: TransformState,
      newFilter: string,
      actionName: string
    ) => {
      const nextSnapshot: EditorSnapshot = {
        id: `snap-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        actionName,
        timestamp: Date.now(),
        adjustments: newAdj,
        transform: newTrans,
        activeFilterId: newFilter,
      };

      setHistory((prevHistory) => {
        const sliced = prevHistory.slice(0, historyIndex + 1);
        const capped = sliced.length >= 50 ? sliced.slice(sliced.length - 49) : sliced;
        return [...capped, nextSnapshot];
      });

      setHistoryIndex((prevIndex) => {
        const slicedLen = Math.min(prevIndex + 1, 49);
        return slicedLen;
      });

      showStatus(`Saved: ${actionName}`);
    },
    [historyIndex]
  );

  // Live adjustments change (smooth slider movement without flooding history)
  const handleAdjustmentsChange = (newAdj: Adjustments) => {
    setAdjustments(newAdj);
  };

  // Commit adjustment when user releases slider or clicks reset on a field
  const handleAdjustmentsCommit = (newAdj: Adjustments, actionName: string) => {
    setAdjustments(newAdj);
    pushHistorySnapshot(newAdj, transform, activeFilterId, actionName);
  };

  // Commit transform (rotate, flip, aspect ratio)
  const handleTransformChange = (newTrans: TransformState, actionName: string) => {
    setTransform(newTrans);
    pushHistorySnapshot(adjustments, newTrans, activeFilterId, actionName);
  };

  // Commit filter change
  const handleFilterSelect = (newFilterId: string, filterName: string) => {
    setActiveFilterId(newFilterId);
    pushHistorySnapshot(
      adjustments,
      transform,
      newFilterId,
      newFilterId === 'none' ? 'Removed Filter' : `Applied Filter: ${filterName}`
    );
  };

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const snapshot = history[targetIndex];
      setAdjustments(snapshot.adjustments);
      setTransform(snapshot.transform);
      setActiveFilterId(snapshot.activeFilterId);
      setHistoryIndex(targetIndex);
      showStatus(`Undo: ${history[historyIndex].actionName}`);
    }
  }, [historyIndex, history]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const snapshot = history[targetIndex];
      setAdjustments(snapshot.adjustments);
      setTransform(snapshot.transform);
      setActiveFilterId(snapshot.activeFilterId);
      setHistoryIndex(targetIndex);
      showStatus(`Redo: ${snapshot.actionName}`);
    }
  }, [historyIndex, history]);

  // Jump to specific point in history
  const handleJumpToHistory = (index: number) => {
    if (index >= 0 && index < history.length) {
      const snapshot = history[index];
      setAdjustments(snapshot.adjustments);
      setTransform(snapshot.transform);
      setActiveFilterId(snapshot.activeFilterId);
      setHistoryIndex(index);
      showStatus(`Jumped to: ${snapshot.actionName}`);
    }
  };

  // Reset to original start
  const handleResetToStart = () => {
    handleJumpToHistory(0);
  };

  // Global keyboard shortcuts for Undo / Redo (Ctrl+Z, Ctrl+Y, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          // Redo on Mac (Cmd+Shift+Z) or Windows (Ctrl+Shift+Z)
          handleRedo();
        } else {
          // Undo (Cmd+Z or Ctrl+Z)
          handleUndo();
        }
      } else if (modifier && e.key.toLowerCase() === 'y') {
        // Redo on Windows (Ctrl+Y)
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Reset all edits and create a fresh history baseline
  const handleResetBaseline = (actionName = 'Reset All Edits') => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setTransform(DEFAULT_TRANSFORM);
    setActiveFilterId('none');
    pushHistorySnapshot(
      DEFAULT_ADJUSTMENTS,
      DEFAULT_TRANSFORM,
      'none',
      actionName
    );
  };

  // Upload photo from device
  const handleFileUpload = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setCurrentFileName(file.name);
    const initialSnap: EditorSnapshot = {
      id: `snap-${Date.now()}`,
      actionName: `Loaded "${file.name}"`,
      timestamp: Date.now(),
      adjustments: DEFAULT_ADJUSTMENTS,
      transform: DEFAULT_TRANSFORM,
      activeFilterId: 'none',
    };
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setTransform(DEFAULT_TRANSFORM);
    setActiveFilterId('none');
    setHistory([initialSnap]);
    setHistoryIndex(0);
    showStatus(`Opened "${file.name}"`);
  };

  // Select sample photo
  const handleSelectSample = (sample: SamplePhoto) => {
    setImageSrc(sample.url);
    setCurrentFileName(`${sample.id}.jpg`);
    const initialSnap: EditorSnapshot = {
      id: `snap-${Date.now()}`,
      actionName: `Sample: ${sample.title}`,
      timestamp: Date.now(),
      adjustments: DEFAULT_ADJUSTMENTS,
      transform: DEFAULT_TRANSFORM,
      activeFilterId: 'none',
    };
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setTransform(DEFAULT_TRANSFORM);
    setActiveFilterId('none');
    setHistory([initialSnap]);
    setHistoryIndex(0);
    showStatus(`Loaded ${sample.title}`);
  };

  // Select image from Google Drive
  const handleSelectDriveImage = (blob: Blob, fileName: string) => {
    const objectUrl = URL.createObjectURL(blob);
    setImageSrc(objectUrl);
    setCurrentFileName(fileName);
    const initialSnap: EditorSnapshot = {
      id: `snap-${Date.now()}`,
      actionName: `Drive: ${fileName}`,
      timestamp: Date.now(),
      adjustments: DEFAULT_ADJUSTMENTS,
      transform: DEFAULT_TRANSFORM,
      activeFilterId: 'none',
    };
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setTransform(DEFAULT_TRANSFORM);
    setActiveFilterId('none');
    setHistory([initialSnap]);
    setHistoryIndex(0);
    showStatus(`Loaded from Drive: ${fileName}`);
  };

  // Open Drive picker (prompts login if not authenticated)
  const handleOpenDrivePicker = async () => {
    const token = await getAccessToken();
    if (!token) {
      await handleGoogleSignIn();
    }
    setIsDrivePickerOpen(true);
  };

  // Open Drive Save modal
  const handleOpenDriveSave = async () => {
    if (!imgRef.current) return;
    const token = await getAccessToken();
    if (!token) {
      await handleGoogleSignIn();
    }

    try {
      const canvas = await renderToCanvas(
        imgRef.current,
        adjustments,
        transform,
        activeFilterId
      );
      setExportCanvas(canvas);
      setIsDriveSaveOpen(true);
    } catch (err) {
      console.error('Error preparing image for Drive save:', err);
    }
  };

  // Open local download modal
  const handleOpenDownload = async () => {
    if (!imgRef.current) return;
    try {
      const canvas = await renderToCanvas(
        imgRef.current,
        adjustments,
        transform,
        activeFilterId
      );
      setExportCanvas(canvas);
      setIsDownloadOpen(true);
    } catch (err) {
      console.error('Error preparing image for download:', err);
    }
  };

  const undoStepsAvailable = historyIndex;
  const redoStepsAvailable = history.length - 1 - historyIndex;

  return (
    <div className="min-h-screen bg-[#10111b] text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Hidden file input for main button */}
      <input
        ref={fileInputRef}
        type="file"
        id="upload"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Global Header */}
      <Header
        user={user}
        isLoggingIn={isLoggingIn}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        onOpenDriveModal={handleOpenDrivePicker}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        hasPhoto={!!imageSrc}
      />

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Canvas Preview & Quick Action Bar */}
        <section className="flex-1 flex flex-col gap-4">
          {/* Action Toolbar above canvas */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#171829] border border-purple-900/30 p-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <label
                htmlFor="upload"
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </label>

              <button
                onClick={handleOpenDrivePicker}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#212338] hover:bg-[#2c2f4a] border border-purple-700/40 text-purple-200 text-xs sm:text-sm font-semibold transition-all active:scale-95"
                title="Open photo from your Google Drive"
              >
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Drive Import</span>
              </button>
            </div>

            {/* Undo, Redo, History & Reset Toolbar */}
            <div className="flex items-center gap-1.5">
              {/* Undo Button */}
              <button
                onClick={handleUndo}
                disabled={undoStepsAvailable <= 0}
                className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-gray-200 hover:text-white bg-[#202138] hover:bg-[#2b2d4b] border border-purple-900/40 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                title={`Undo last action (Ctrl+Z or Cmd+Z)${
                  undoStepsAvailable > 0 ? ` - ${undoStepsAvailable} steps available` : ''
                }`}
              >
                <Undo2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold hidden sm:inline">Undo</span>
                {undoStepsAvailable > 0 && (
                  <span className="ml-0.5 text-[10px] font-mono bg-purple-900/80 text-purple-200 px-1.5 py-0.2 rounded-full border border-purple-700/40">
                    {undoStepsAvailable}
                  </span>
                )}
              </button>

              {/* Redo Button */}
              <button
                onClick={handleRedo}
                disabled={redoStepsAvailable <= 0}
                className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-gray-200 hover:text-white bg-[#202138] hover:bg-[#2b2d4b] border border-purple-900/40 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
                title={`Redo action (Ctrl+Y or Cmd+Shift+Z)${
                  redoStepsAvailable > 0 ? ` - ${redoStepsAvailable} steps available` : ''
                }`}
              >
                <Redo2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold hidden sm:inline">Redo</span>
                {redoStepsAvailable > 0 && (
                  <span className="ml-0.5 text-[10px] font-mono bg-purple-900/80 text-purple-200 px-1.5 py-0.2 rounded-full border border-purple-700/40">
                    {redoStepsAvailable}
                  </span>
                )}
              </button>

              {/* History Timeline Switch Button */}
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  activeTab === 'history'
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#202138] hover:bg-[#2b2d4b] border-purple-900/40 text-purple-200'
                }`}
                title="View complete edit history timeline"
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">History</span>
              </button>

              <div className="h-4 w-px bg-purple-900/40 mx-0.5" />

              {/* Reset to Default */}
              <button
                onClick={() => handleResetBaseline('Reset All Edits')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition-colors"
                title="Reset all adjustments, filters, and transforms"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Dynamic Status / Undo-Redo Feedback Banner */}
          {statusNotification && (
            <div className="px-4 py-1.5 bg-purple-950/80 border border-purple-600/40 rounded-xl text-xs text-purple-200 flex items-center justify-between shadow-lg shadow-purple-950/50 animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <strong className="font-medium">{statusNotification}</strong>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {historyIndex + 1} of {history.length}
              </span>
            </div>
          )}

          {/* Canvas Display */}
          <CanvasPreview
            imageSrc={imageSrc}
            adjustments={adjustments}
            transform={transform}
            activeFilterId={activeFilterId}
            onUploadFile={handleFileUpload}
            onOpenDriveModal={handleOpenDrivePicker}
            onOpenSampleModal={() => setIsSampleModalOpen(true)}
            imgRef={imgRef}
            onImageLoad={() => {}}
          />

          {/* Bottom Export Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#171829] border border-purple-900/30 p-3 rounded-2xl">
            <div className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md flex items-center gap-2">
              <span className="text-gray-500">File:</span>
              <span className="text-purple-300 font-medium truncate">{currentFileName}</span>
              <span className="text-[10px] bg-purple-900/30 px-2 py-0.5 rounded-md text-purple-300 font-mono">
                {historyIndex} changes applied
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenDriveSave}
                disabled={!imageSrc}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#212338] hover:bg-[#2c2f4a] border border-purple-700/50 text-purple-200 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-40"
              >
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span>Save to Drive</span>
              </button>

              <button
                onClick={handleOpenDownload}
                disabled={!imageSrc}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>Save Photo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Controls & History Sidebar */}
        <aside className="w-full lg:w-96 bg-[#1a1b2d] border border-purple-800/40 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
          {/* Navigation Tabs including History */}
          <div className="grid grid-cols-4 gap-1 bg-[#131422] p-1 rounded-xl border border-purple-900/40">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'adjust'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust</span>
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'filters'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
            <button
              onClick={() => setActiveTab('transform')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'transform'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Transform</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {history.length > 1 && (
                <span className="w-2 h-2 rounded-full bg-purple-400 absolute top-1.5 right-1.5" />
              )}
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-[360px]">
            {activeTab === 'adjust' && (
              <AdjustmentsPanel
                adjustments={adjustments}
                onChange={handleAdjustmentsChange}
                onCommit={handleAdjustmentsCommit}
                onResetAdjustments={() =>
                  handleAdjustmentsCommit(DEFAULT_ADJUSTMENTS, 'Reset Adjustments')
                }
              />
            )}

            {activeTab === 'filters' && (
              <FiltersPanel
                activeFilterId={activeFilterId}
                onSelectFilter={handleFilterSelect}
                previewImageUrl={imageSrc || undefined}
              />
            )}

            {activeTab === 'transform' && (
              <TransformPanel
                transform={transform}
                onChange={handleTransformChange}
                onResetTransform={() =>
                  handleTransformChange(DEFAULT_TRANSFORM, 'Reset Transform')
                }
              />
            )}

            {activeTab === 'history' && (
              <HistoryPanel
                history={history}
                historyIndex={historyIndex}
                onJumpToHistory={handleJumpToHistory}
                onResetToOriginal={handleResetToStart}
              />
            )}
          </div>

          {/* Quick Preset Quickbar */}
          <div className="pt-3 border-t border-purple-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-400">Quick Filters</span>
              <button
                onClick={() => setActiveTab('filters')}
                className="text-[10px] text-purple-400 hover:underline"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'none', label: 'Normal' },
                { id: 'bw', label: 'B&W' },
                { id: 'sepia', label: 'Vintage' },
                { id: 'vivid', label: 'Vivid' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleFilterSelect(item.id, item.label)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    activeFilterId === item.id
                      ? 'bg-purple-900/60 border-purple-500 text-white'
                      : 'bg-[#141525] border-purple-900/30 text-gray-300 hover:border-purple-600/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Modals */}
      <DrivePickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        accessToken={accessToken}
        onSelectImage={handleSelectDriveImage}
      />

      <DriveSaveModal
        isOpen={isDriveSaveOpen}
        onClose={() => setIsDriveSaveOpen(false)}
        accessToken={accessToken}
        user={user}
        canvas={exportCanvas}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        canvas={exportCanvas}
      />

      <SamplePhotosModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
      />
    </div>
  );
}

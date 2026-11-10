/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from 'firebase/auth';
import {
  Cloud,
  HardDrive,
  LogOut,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  isLoggingIn: boolean;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  onOpenDriveModal: () => void;
  onOpenSampleModal: () => void;
  hasPhoto: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoggingIn,
  onGoogleSignIn,
  onLogout,
  onOpenDriveModal,
  onOpenSampleModal,
  hasPhoto,
}) => {
  return (
    <header className="w-full border-b border-purple-900/30 bg-[#141524]/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-bold text-xl">
            📸
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-300 via-indigo-200 to-white bg-clip-text text-transparent">
              My Photo Studio
            </h1>
            <p className="text-xs text-purple-300/70">
              Professional Photo Editing &bull; Google Drive Enabled
            </p>
          </div>
        </div>

        {/* Right side controls: Drive & Auth */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {/* Sample Photos Button */}
          <button
            onClick={onOpenSampleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-[#222438] hover:bg-[#2c2e48] text-purple-200 border border-purple-800/40 transition-all hover:border-purple-600 active:scale-95"
            title="Choose from sample photos"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Samples</span>
          </button>

          {/* Drive status / Action */}
          {user ? (
            <div className="flex items-center gap-2 bg-[#1c1d30] border border-purple-700/40 rounded-xl p-1.5 pl-3">
              <button
                onClick={onOpenDriveModal}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-purple-200 hover:text-white px-2 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600/30 transition-all"
                title="Browse and open images from your Google Drive"
              >
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>Open from Drive</span>
              </button>

              <div className="h-4 w-px bg-purple-800/40" />

              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-purple-400/50 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold text-white">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left text-xs leading-tight pr-1">
                  <div className="font-semibold text-gray-200 truncate max-w-[120px]">
                    {user.displayName || 'User'}
                  </div>
                  <div className="text-[10px] text-purple-400 flex items-center gap-1">
                    <Cloud className="w-2.5 h-2.5" /> Drive Connected
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Sign out from Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              disabled={isLoggingIn}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-800 font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

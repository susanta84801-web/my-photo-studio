/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Adjustments {
  brightness: number;  // 0 - 200%, default 100%
  contrast: number;    // 0 - 200%, default 100%
  saturation: number;  // 0 - 200%, default 100%
  blur: number;        // 0 - 20px, default 0px
  hueRotate: number;   // 0 - 360deg, default 0deg
  sepia: number;       // 0 - 100%, default 0%
  grayscale: number;   // 0 - 100%, default 0%
  invert: number;      // 0 - 100%, default 0%
  vignette: number;    // 0 - 100%, default 0%
  warmth: number;      // -100 to 100, default 0
}

export type AspectRatioType = 'original' | '1:1' | '4:5' | '16:9' | '9:16' | '4:3' | '3:2';

export interface TransformState {
  rotation: number;        // 0, 90, 180, 270
  flipHorizontal: boolean; // boolean
  flipVertical: boolean;   // boolean
  aspectRatio: AspectRatioType;
}

export interface FilterPreset {
  id: string;
  name: string;
  category: 'classic' | 'stylized' | 'cinematic' | 'mood';
  cssFilter: string;
  description: string;
}

export interface EditorSnapshot {
  id: string;
  actionName: string;
  timestamp: number;
  adjustments: Adjustments;
  transform: TransformState;
  activeFilterId: string;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  hueRotate: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  vignette: 0,
  warmth: 0,
};

export const DEFAULT_TRANSFORM: TransformState = {
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  aspectRatio: 'original',
};

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'none',
    name: 'Normal',
    category: 'classic',
    cssFilter: 'none',
    description: 'Original colors and tone',
  },
  {
    id: 'bw',
    name: 'B&W Classic',
    category: 'classic',
    cssFilter: 'grayscale(100%)',
    description: 'Timeless monochrome',
  },
  {
    id: 'sepia',
    name: 'Vintage',
    category: 'classic',
    cssFilter: 'sepia(100%)',
    description: 'Warm antique photo finish',
  },
  {
    id: 'vivid',
    name: 'Vivid Pop',
    category: 'stylized',
    cssFilter: 'contrast(130%) saturate(145%)',
    description: 'Punchy colors and dynamic range',
  },
  {
    id: 'color',
    name: 'Color Boost',
    category: 'stylized',
    cssFilter: 'saturate(165%) brightness(105%)',
    description: 'Deepened vibrant saturation',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    category: 'mood',
    cssFilter: 'sepia(45%) saturate(135%) brightness(108%) contrast(105%)',
    description: 'Soft sunny afternoon glow',
  },
  {
    id: 'noir',
    name: 'Film Noir',
    category: 'cinematic',
    cssFilter: 'grayscale(100%) contrast(160%) brightness(88%)',
    description: 'High contrast dramatic shadow',
  },
  {
    id: 'cyber',
    name: 'Cyberpunk',
    category: 'stylized',
    cssFilter: 'hue-rotate(180deg) saturate(160%) contrast(125%)',
    description: 'Futuristic neon synthwave look',
  },
  {
    id: 'cool',
    name: 'Cool Nordic',
    category: 'mood',
    cssFilter: 'hue-rotate(190deg) saturate(95%) brightness(104%)',
    description: 'Crisp cold tones and subdued warmth',
  },
  {
    id: 'cinema',
    name: 'Cinema Teal',
    category: 'cinematic',
    cssFilter: 'contrast(120%) saturate(110%) brightness(96%)',
    description: 'Blockbuster movie palette',
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    category: 'mood',
    cssFilter: 'brightness(115%) saturate(85%) contrast(92%)',
    description: 'Soft dreamy low-contrast tones',
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    category: 'cinematic',
    cssFilter: 'contrast(140%) brightness(95%) saturate(120%)',
    description: 'Intense rich shadows and highlights',
  },
];

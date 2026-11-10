/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SamplePhoto {
  id: string;
  title: string;
  category: string;
  url: string;
  thumbnail: string;
  author: string;
}

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample-portrait',
    title: 'Neon Portrait',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    author: 'Aiony Haust',
  },
  {
    id: 'sample-landscape',
    title: 'Alpine Mountains',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
    author: 'Kalen Emsley',
  },
  {
    id: 'sample-city',
    title: 'Tokyo Night Cyber',
    category: 'Urban',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=80',
    author: 'Aleksandar Pasaric',
  },
  {
    id: 'sample-nature',
    title: 'Golden Forest Road',
    category: 'Autumn',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80',
    author: 'Luca Bravo',
  },
  {
    id: 'sample-vintage',
    title: 'Classic Sports Car',
    category: 'Retro',
    url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80',
    author: 'Stefan Rodriguez',
  },
];

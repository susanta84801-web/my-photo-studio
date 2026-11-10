/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Adjustments, TransformState, AspectRatioType, FILTER_PRESETS } from '../types/editor';

/**
 * Builds the CSS filter string corresponding to adjustments and active preset
 */
export function buildFilterString(adjustments: Adjustments, activeFilterId: string): string {
  const parts: string[] = [
    `brightness(${adjustments.brightness}%)`,
    `contrast(${adjustments.contrast}%)`,
    `saturate(${adjustments.saturation}%)`,
  ];

  if (adjustments.blur > 0) {
    parts.push(`blur(${adjustments.blur}px)`);
  }
  if (adjustments.hueRotate !== 0) {
    parts.push(`hue-rotate(${adjustments.hueRotate}deg)`);
  }
  if (adjustments.sepia > 0) {
    parts.push(`sepia(${adjustments.sepia}%)`);
  }
  if (adjustments.grayscale > 0) {
    parts.push(`grayscale(${adjustments.grayscale}%)`);
  }
  if (adjustments.invert > 0) {
    parts.push(`invert(${adjustments.invert}%)`);
  }

  // Active preset filter
  if (activeFilterId && activeFilterId !== 'none') {
    const preset = FILTER_PRESETS.find((p) => p.id === activeFilterId);
    if (preset && preset.cssFilter && preset.cssFilter !== 'none') {
      parts.push(preset.cssFilter);
    }
  }

  return parts.join(' ');
}

/**
 * Calculates cropped dimension and offset given source dimensions and target ratio
 */
export function getCropDimensions(
  srcW: number,
  srcH: number,
  aspectRatio: AspectRatioType
): { x: number; y: number; width: number; height: number } {
  if (aspectRatio === 'original') {
    return { x: 0, y: 0, width: srcW, height: srcH };
  }

  let ratio = 1;
  switch (aspectRatio) {
    case '1:1':
      ratio = 1;
      break;
    case '4:5':
      ratio = 4 / 5;
      break;
    case '16:9':
      ratio = 16 / 9;
      break;
    case '9:16':
      ratio = 9 / 16;
      break;
    case '4:3':
      ratio = 4 / 3;
      break;
    case '3:2':
      ratio = 3 / 2;
      break;
    default:
      return { x: 0, y: 0, width: srcW, height: srcH };
  }

  const srcRatio = srcW / srcH;
  let targetW = srcW;
  let targetH = srcH;

  if (srcRatio > ratio) {
    // Source is wider than target ratio
    targetW = Math.round(srcH * ratio);
    targetH = srcH;
  } else {
    // Source is taller than target ratio
    targetW = srcW;
    targetH = Math.round(srcW / ratio);
  }

  const cropX = Math.round((srcW - targetW) / 2);
  const cropY = Math.round((srcH - targetH) / 2);

  return { x: cropX, y: cropY, width: targetW, height: targetH };
}

/**
 * Renders the processed image onto an off-screen canvas at full resolution
 */
export async function renderToCanvas(
  imgElement: HTMLImageElement,
  adjustments: Adjustments,
  transform: TransformState,
  activeFilterId: string
): Promise<HTMLCanvasElement> {
  const origW = imgElement.naturalWidth || imgElement.width;
  const origH = imgElement.naturalHeight || imgElement.height;

  // 1. Calculate Crop
  const crop = getCropDimensions(origW, origH, transform.aspectRatio);

  // 2. Calculate canvas dimensions taking rotation into account
  const isRotatedSideways = Math.abs(transform.rotation % 180) === 90;
  const canvasW = isRotatedSideways ? crop.height : crop.width;
  const canvasH = isRotatedSideways ? crop.width : crop.height;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context could not be acquired');
  }

  ctx.save();

  // Move origin to center of canvas
  ctx.translate(canvasW / 2, canvasH / 2);

  // Apply Rotation
  const rad = (transform.rotation * Math.PI) / 180;
  ctx.rotate(rad);

  // Apply Flips
  const scaleX = transform.flipHorizontal ? -1 : 1;
  const scaleY = transform.flipVertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Apply CSS filters directly to canvas context
  const filterString = buildFilterString(adjustments, activeFilterId);
  ctx.filter = filterString;

  // Draw the cropped portion centered
  ctx.drawImage(
    imgElement,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    -crop.width / 2,
    -crop.height / 2,
    crop.width,
    crop.height
  );

  ctx.restore();

  // 3. Render Warmth overlay if applicable
  if (adjustments.warmth !== 0) {
    ctx.save();
    const warmthAlpha = Math.min(Math.abs(adjustments.warmth) / 100 * 0.28, 0.35);
    ctx.fillStyle = adjustments.warmth > 0
      ? `rgba(255, 125, 0, ${warmthAlpha})`
      : `rgba(0, 160, 255, ${warmthAlpha})`;
    ctx.globalCompositeOperation = adjustments.warmth > 0 ? 'overlay' : 'soft-light';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  }

  // 4. Render Vignette overlay if applicable
  if (adjustments.vignette > 0) {
    ctx.save();
    const radius = Math.sqrt(Math.pow(canvasW / 2, 2) + Math.pow(canvasH / 2, 2));
    const innerRadius = radius * (1 - adjustments.vignette / 120);
    const grad = ctx.createRadialGradient(
      canvasW / 2,
      canvasH / 2,
      Math.max(0, innerRadius),
      canvasW / 2,
      canvasH / 2,
      radius
    );
    const intensity = (adjustments.vignette / 100) * 0.9;
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${intensity})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  }

  return canvas;
}

/**
 * Exports canvas to Blob with requested mime-type and quality
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob from canvas'));
        }
      },
      format,
      quality
    );
  });
}

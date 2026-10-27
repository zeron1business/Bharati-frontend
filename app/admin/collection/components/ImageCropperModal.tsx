"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCcw,
  Check,
  X,
  Loader2,
  Crop,
  Sparkles,
} from "lucide-react";
import { CollectionSlotPosition } from "@/app/lib/types";

export interface SlotDimensions {
  width: number;
  height: number;
  aspect: number;
  label: string;
}

export const SLOT_TARGET_DIMENSIONS: Record<CollectionSlotPosition, SlotDimensions> = {
  BOX_1: {
    width: 550,
    height: 550,
    aspect: 1,
    label: "Top-Left (Box 1) — 550 × 550 px (1:1 Square)",
  },
  BOX_2: {
    width: 550,
    height: 550,
    aspect: 1,
    label: "Top-Middle (Box 2) — 550 × 550 px (1:1 Square)",
  },
  BOX_3: {
    width: 700,
    height: 450,
    aspect: 700 / 450, // 14 / 9 ≈ 1.556
    label: "Bottom-Wide (Box 3) — 700 × 450 px (Landscape 16:10)",
  },
  BOX_4: {
    width: 600,
    height: 800,
    aspect: 600 / 800, // 3 / 4 = 0.75
    label: "Right-Tall (Box 4) — 600 × 800 px (Portrait 3:4)",
  },
};

interface ImageCropperModalProps {
  imageSrc: string;
  fileName?: string;
  slotPosition: CollectionSlotPosition;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, croppedFile: File) => Promise<void>;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Crops the image to the exact target width & height based on user's pan/zoom/rotation
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  targetWidth: number,
  targetHeight: number,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get 2d context for canvas");
  }

  // Turn on high quality image rendering
  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;

  if (rotation === 0) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
  } else {
    // Calculate bounding box for rotated image
    const rotRad = getRadianAngle(rotation);
    const boundingBoxWidth =
      Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
    const boundingBoxHeight =
      Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = boundingBoxWidth;
    tempCanvas.height = boundingBoxHeight;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      throw new Error("Could not get temp 2d context");
    }

    tempCtx.imageSmoothingQuality = "high";
    tempCtx.imageSmoothingEnabled = true;

    tempCtx.translate(boundingBoxWidth / 2, boundingBoxHeight / 2);
    tempCtx.rotate(rotRad);
    tempCtx.translate(-image.width / 2, -image.height / 2);
    tempCtx.drawImage(image, 0, 0);

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(
      tempCanvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas conversion returned null"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.95 // High quality JPEG
    );
  });
}

export function ImageCropperModal({
  imageSrc,
  fileName = "bento_tile.jpg",
  slotPosition,
  isOpen,
  onClose,
  onCropComplete,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const slotInfo = SLOT_TARGET_DIMENSIONS[slotPosition] || SLOT_TARGET_DIMENSIONS.BOX_1;

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = (deg: number) => {
    setRotation((prev) => (prev + deg) % 360);
  };

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        slotInfo.width,
        slotInfo.height,
        rotation
      );

      // Create a clean File object from the blob with .jpg extension
      const cleanFileName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
      const croppedFile = new File([croppedBlob], cleanFileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      await onCropComplete(croppedBlob, croppedFile);
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bharati-teal/20 text-bharati-teal flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm sm:text-base flex items-center gap-2">
                Crop Photo for {slotPosition}
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-bharati-teal/20 text-bharati-teal border border-bharati-teal/30">
                  {slotInfo.width} × {slotInfo.height} px
                </span>
              </h3>
              <p className="text-xs text-white/50">{slotInfo.label}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Work Area */}
        <div className="relative w-full h-[360px] sm:h-[430px] bg-[#09090b]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={slotInfo.aspect}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={onZoomChange}
            showGrid={true}
            cropShape="rect"
            style={{
              containerStyle: {
                backgroundColor: "#09090b",
              },
              cropAreaStyle: {
                border: "2px solid #449188",
                boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.72)",
              },
            }}
          />

          {/* Quick instructions floating badge */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none px-3 py-1 rounded-full bg-black/75 border border-white/10 backdrop-blur-sm text-[11px] text-white/80 shadow-md">
            Drag to reposition • Scroll or use slider to zoom
          </div>
        </div>

        {/* Bottom Toolbar & Adjustments */}
        <div className="p-4 sm:p-5 bg-[#121215] border-t border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Zoom Slider Control */}
            <div className="flex items-center gap-3 w-full sm:w-72">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                className="p-1 text-white/60 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-bharati-teal"
              />

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                className="p-1 text-white/60 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-white/60 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotation & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotate(-90)}
                className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white/80 flex items-center gap-1.5 transition-colors"
                title="Rotate 90° Counter-Clockwise"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-90°</span>
              </button>

              <button
                type="button"
                onClick={() => handleRotate(90)}
                className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white/80 flex items-center gap-1.5 transition-colors"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Reset adjustments"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                Cropped to exact {slotInfo.width} × {slotInfo.height} px
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-bharati-teal text-white text-xs font-semibold hover:bg-bharati-teal/90 transition-all shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing & Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Crop & Upload Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

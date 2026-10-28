"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  AlertCircle,
} from "lucide-react";

export interface ProductCircularCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  productName?: string;
  onCancel?: () => void;
  onClose?: () => void;
  onSkip?: () => void;
  onSave?: (file: File) => Promise<void> | void;
  onCropComplete?: (file: File) => Promise<void> | void;
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

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Crops the image to a 600x600 square asset with bharati-ivory (#f5f3f0) background,
 * exporting as WebP (quality 0.90) with JPEG (quality 0.92) fallback.
 */
async function getCroppedCircularFile(
  imageSrc: string,
  pixelCrop: Area,
  targetWidth = 600,
  targetHeight = 600,
  rotation = 0,
  fileName = "circular_cover"
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get 2d context for canvas");
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 1. Fill solid bharati-ivory (#f5f3f0) background matching storefront circle background
  ctx.fillStyle = "#f5f3f0";
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 2. High quality smoothing
  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;

  // Destination transform: scale to target dimensions
  const scale = targetWidth / pixelCrop.width;

  if (rotation === 0) {
    ctx.drawImage(
      image,
      -pixelCrop.x * scale,
      -pixelCrop.y * scale,
      image.width * scale,
      image.height * scale
    );
  } else {
    // Calculate bounding box for rotated image
    const rotRad = getRadianAngle(rotation);
    const boundingBoxWidth =
      Math.abs(Math.cos(rotRad) * image.width) +
      Math.abs(Math.sin(rotRad) * image.height);
    const boundingBoxHeight =
      Math.abs(Math.sin(rotRad) * image.width) +
      Math.abs(Math.cos(rotRad) * image.height);

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

    ctx.drawImage(
      tempCanvas,
      -pixelCrop.x * scale,
      -pixelCrop.y * scale,
      boundingBoxWidth * scale,
      boundingBoxHeight * scale
    );
  }

  // 3. Export as WebP quality 0.90, with JPEG quality 0.92 fallback
  const webpBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/webp",
      0.90
    );
  });

  let finalBlob: Blob;
  let ext = "webp";

  if (webpBlob && webpBlob.type === "image/webp") {
    finalBlob = webpBlob;
    ext = "webp";
  } else {
    // Safari or browser without WebP canvas export support -> fallback to JPEG 0.92
    const jpegBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        0.92
      );
    });

    if (!jpegBlob) {
      throw new Error("Canvas conversion returned null");
    }
    finalBlob = jpegBlob;
    ext = "jpg";
  }

  return new File([finalBlob], `${fileName}.${ext}`, {
    type: finalBlob.type,
    lastModified: Date.now(),
  });
}

export function ProductCircularCropperModal({
  isOpen,
  imageSrc,
  productName,
  onCancel,
  onClose,
  onSkip,
  onSave,
  onCropComplete,
}: ProductCircularCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Responsive cropSize: 320px on desktop (>=640px viewport), 260px on mobile
  const [cropSize, setCropSize] = useState<number>(320);

  // Pre-fetched local blob URL for remote URLs (CORS protection)
  const [remoteBlobUrl, setRemoteBlobUrl] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle closing aliases
  const handleDismiss = useCallback(() => {
    if (isProcessing) return;
    if (onCancel) onCancel();
    else if (onClose) onClose();
  }, [isProcessing, onCancel, onClose]);

  // Handle skipping
  const handleSkip = useCallback(() => {
    if (isProcessing) return;
    if (onSkip) {
      onSkip();
    } else {
      handleDismiss();
    }
  }, [isProcessing, onSkip, handleDismiss]);

  // Viewport resize tracking for cropSize
  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== "undefined") {
        setCropSize(window.innerWidth < 640 ? 260 : 320);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Body scroll lock & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isProcessing) {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isProcessing, handleDismiss]);

  // CORS safety: convert remote Supabase URLs to local blob URLs to prevent canvas tainting
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    if (imageSrc.startsWith("blob:") || imageSrc.startsWith("data:")) {
      return;
    }

    let isMounted = true;
    let localCreatedUrl: string | null = null;
    const controller = new AbortController();

    fetch(imageSrc, { mode: "cors", signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!isMounted) return;
        localCreatedUrl = URL.createObjectURL(blob);
        setRemoteBlobUrl(localCreatedUrl);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.warn("Could not pre-fetch image as blob; using direct URL:", err);
      });

    return () => {
      isMounted = false;
      controller.abort();
      if (localCreatedUrl) {
        URL.revokeObjectURL(localCreatedUrl);
      }
    };
  }, [isOpen, imageSrc]);

  const onCropChange = (newCrop: Point) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setErrorMessage(null);
  };

  const handleRotate = (deg: number) => {
    setRotation((prev) => (prev + deg + 360) % 360);
  };

  // Safe image source to display in cropper
  const effectiveImageSrc = remoteBlobUrl || imageSrc;

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels || !effectiveImageSrc) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const croppedFile = await getCroppedCircularFile(
        effectiveImageSrc,
        croppedAreaPixels,
        600,
        600,
        rotation,
        "circular_cover"
      );

      if (onSave) {
        await onSave(croppedFile);
      } else if (onCropComplete) {
        await onCropComplete(croppedFile);
      }
      handleDismiss();
    } catch (err: unknown) {
      console.error("Failed to crop/save circular image:", err);
      const msg = err instanceof Error ? err.message : "Failed to process circular image. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const safeZoneDiameter = Math.round(cropSize * 0.9);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropper-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
    >
      <div
        ref={modalRef}
        className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bharati-mint/20 text-bharati-mint flex items-center justify-center shrink-0">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="cropper-modal-title"
                className="text-white font-medium text-sm sm:text-base flex items-center gap-2"
              >
                Adjust Shop by Products Framing
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-bharati-mint/20 text-bharati-mint border border-bharati-mint/30">
                  600 × 600 px
                </span>
              </h3>
              <p className="text-xs text-white/50 truncate max-w-xs sm:max-w-md">
                {productName ? `Framing for ${productName}` : "Position product inside the circle for the homepage carousel"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            disabled={isProcessing}
            aria-label="Close dialog"
            className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Work Area */}
        <div className="relative w-full h-[360px] sm:h-[420px] bg-[#09090b]">
          {effectiveImageSrc ? (
            <Cropper
              image={effectiveImageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              restrictPosition={false}
              minZoom={0.4}
              maxZoom={3}
              cropSize={{ width: cropSize, height: cropSize }}
              onCropChange={onCropChange}
              onCropComplete={handleCropComplete}
              onZoomChange={onZoomChange}
              style={{
                containerStyle: {
                  backgroundColor: "#09090b",
                },
                cropAreaStyle: {
                  border: "2px solid #77ACA2",
                  boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.75)",
                },
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/50 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-bharati-mint" />
              <span className="text-xs">Loading image...</span>
            </div>
          )}

          {/* 90% Safe-zone dashed ring overlay */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full border border-dashed border-bharati-mint/70 z-10"
            style={{
              width: `${safeZoneDiameter}px`,
              height: `${safeZoneDiameter}px`,
            }}
          />
        </div>

        {/* Bottom Toolbar & Adjustments */}
        <div className="p-4 sm:p-5 bg-[#121215] border-t border-white/10 space-y-3.5">
          {/* Inline error alert if save fails */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Guidance caption */}
          <p className="text-[11px] sm:text-xs text-white/50 text-center sm:text-left leading-relaxed">
            Drag to move • Scroll or pinch to zoom • Dashed ring = safe zone on hover
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Zoom Slider Control */}
            <div className="flex items-center gap-3 w-full sm:w-64">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(0.4, +(prev - 0.1).toFixed(2)))}
                disabled={zoom <= 0.4 || isProcessing}
                aria-label="Zoom out"
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors p-1"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={0.4}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                disabled={isProcessing}
                aria-label="Zoom slider"
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#77ACA2]"
              />
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.1).toFixed(2)))}
                disabled={zoom >= 3 || isProcessing}
                aria-label="Zoom in"
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors p-1"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/50 font-mono w-12 text-right">
                {zoom.toFixed(2)}x
              </span>
            </div>

            {/* Rotation & Reset Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotate(-90)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Rotate 90° Counter-Clockwise"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-90°</span>
              </button>
              <button
                type="button"
                onClick={() => handleRotate(90)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing || (zoom === 1 && rotation === 0 && crop.x === 0 && crop.y === 0)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 disabled:opacity-30 transition-colors cursor-pointer ml-1"
                title="Reset crop, zoom, and rotation"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
            <div>
              {onSkip ? (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                >
                  Skip Custom Framing
                </button>
              ) : (
                <span className="text-[11px] text-white/40">
                  Original cover remains uncropped
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={isProcessing || !effectiveImageSrc}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium bg-[#77ACA2] hover:bg-[#6fa89b] text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing & Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply Circular Framing</span>
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

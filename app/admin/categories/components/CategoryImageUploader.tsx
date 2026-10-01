"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  AlertCircle,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { adminUploadImage } from "@/app/lib/admin-api";
import { useToast } from "@/app/admin/ToastContext";

interface CategoryImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function CategoryImageUploader({
  value,
  onChange,
  disabled = false,
}: CategoryImageUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState(value || "");
  const [imageLoadError, setImageLoadError] = useState(false);

  // Sync manual input when value changes externally
  React.useEffect(() => {
    setManualUrlInput(value || "");
    setImageLoadError(false);
  }, [value]);

  const handleProcessFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      const err = "Only image files (PNG, JPG, WEBP, GIF, SVG) are allowed.";
      setUploadError(err);
      showToast(err, "error");
      return;
    }

    // Limit to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const err = "Image file size exceeds the 10MB limit.";
      setUploadError(err);
      showToast(err, "error");
      return;
    }

    setUploadError("");
    setIsUploading(true);
    setImageLoadError(false);

    try {
      const uploadedUrl = await adminUploadImage(file);
      onChange(uploadedUrl);
      showToast("Picture uploaded! Remember to click 'Save' / 'Update Category' below to apply.", "info");
    } catch (err: any) {
      const msg = err.message || "Failed to upload image. Please try again.";
      setUploadError(msg);
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      showToast("Only 1 single image is allowed. Selected the first file.", "info");
    }

    await handleProcessFile(files[0]);
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      showToast("Only 1 single image is allowed. Selected the first file.", "info");
    }

    await handleProcessFile(files[0]);
  };

  const handleRemove = () => {
    onChange("");
    setManualUrlInput("");
    setImageLoadError(false);
    setUploadError("");
    showToast("Picture removed. Remember to click 'Save' / 'Update Category' below to apply.", "info");
  };

  const handleApplyManualUrl = () => {
    const trimmed = manualUrlInput.trim();
    onChange(trimmed);
    setImageLoadError(false);
    showToast(trimmed ? "Image URL updated." : "Image URL cleared.", "info");
  };

  const isConfigured = Boolean(value && value.trim().length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-bharati-charcoal">
            Category Picture
          </label>
          <p className="text-xs text-bharati-ash">
            Upload a single cover picture (drag & drop) or enter an image URL
          </p>
        </div>

        {isConfigured && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check size={12} /> Picture Active
          </span>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs animate-fadeIn">
          <AlertCircle size={15} className="shrink-0" />
          <span className="flex-1">{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError("")}
            className="text-red-500 hover:text-red-800 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hidden single-file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
        className="hidden"
        multiple={false}
      />

      {/* When Image IS configured -> Direct Picture Preview Card */}
      {isConfigured ? (
        <div className="bg-white rounded-lg border border-bharati-mist overflow-hidden shadow-xs">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative p-5 flex flex-col md:flex-row items-center gap-6 transition-all ${
              isDragging
                ? "bg-bharati-cream/60 ring-2 ring-bharati-mint border-bharati-mint"
                : "bg-gradient-to-b from-bharati-cream/30 to-white"
            }`}
          >
            {/* Direct Picture Preview Container */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-lg bg-bharati-ivory border border-bharati-mist overflow-hidden shrink-0 shadow-xs flex items-center justify-center group">
              {!imageLoadError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={value}
                  alt="Category preview"
                  onError={() => setImageLoadError(true)}
                  className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="p-4 text-center text-xs text-red-500 space-y-1">
                  <AlertCircle size={24} className="mx-auto text-red-400" />
                  <p className="font-medium">Image failed to load</p>
                  <p className="text-[10px] text-bharati-ash font-mono break-all">{value}</p>
                </div>
              )}

              {/* Drag over overlay on top of existing image */}
              {isDragging && (
                <div className="absolute inset-0 bg-bharati-mint/80 text-white flex flex-col items-center justify-center p-3 text-center backdrop-blur-xs">
                  <Upload size={24} className="animate-bounce mb-1" />
                  <span className="text-xs font-semibold">Drop new picture to replace</span>
                </div>
              )}

              {/* Uploading overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center p-3 text-center backdrop-blur-xs">
                  <Loader2 size={24} className="animate-spin mb-1 text-bharati-mint" />
                  <span className="text-xs font-medium">Uploading new picture...</span>
                </div>
              )}
            </div>

            {/* Picture Details & Actions */}
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-bharati-ash">
                  Active Picture Source
                </span>
                <div className="flex items-center gap-2 p-2.5 bg-bharati-cream/40 rounded-md border border-bharati-mist/60 text-xs font-mono text-bharati-charcoal break-all">
                  <LinkIcon size={14} className="text-bharati-ash shrink-0" />
                  <span className="truncate flex-1">{value}</span>
                  {value.startsWith("http") && (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-bharati-ash hover:text-bharati-black transition-colors"
                      title="Open image in new tab"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons: Remove & Replace */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Replace Picture Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white hover:bg-bharati-cream text-bharati-charcoal border border-bharati-mist rounded-md shadow-2xs transition-colors disabled:opacity-50"
                >
                  <Upload size={14} />
                  <span>Replace Picture</span>
                </button>

                {/* Remove Picture Button (prominent in edit mode) */}
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md shadow-2xs transition-colors disabled:opacity-50"
                  title="Remove this category picture"
                >
                  <Trash2 size={14} />
                  <span>Remove Picture</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 p-2 bg-amber-50 border border-amber-200/80 rounded text-[11px] text-amber-800">
                <AlertCircle size={14} className="shrink-0 text-amber-600" />
                <span>Picture ready: Remember to click <strong>Save Category</strong> / <strong>Update Category</strong> below to save changes.</span>
              </div>

              <p className="text-[11px] text-bharati-ash italic">
                Tip: You can also drag and drop a new picture directly over the box to replace it.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* When NO image is configured -> Drag and Drop Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading && !disabled) fileInputRef.current?.click();
          }}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-bharati-mint bg-bharati-mint/10 ring-4 ring-bharati-mint/20 scale-[1.01]"
              : "border-bharati-mist hover:border-bharati-mint-dark hover:bg-bharati-cream/30 bg-white"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isUploading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2.5">
              <Loader2 size={32} className="animate-spin text-bharati-mint-dark" />
              <p className="text-sm font-medium text-bharati-charcoal">
                Uploading category picture...
              </p>
              <p className="text-xs text-bharati-ash">Connecting to cloud media storage</p>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-bharati-cream border border-bharati-mist/80 flex items-center justify-center text-bharati-charcoal group-hover:scale-105 transition-transform">
                <ImageIcon size={26} className="text-bharati-mint-dark" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-bharati-black">
                  <span className="text-bharati-mint-dark font-semibold underline underline-offset-2">
                    Click to browse
                  </span>{" "}
                  or drag & drop category picture here
                </p>
                <p className="text-xs text-bharati-ash">
                  Single image file only • PNG, JPG, WEBP, SVG up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual URL Expandable Accordion (Flexible Fallback) */}
      <div className="border-t border-bharati-mist/50 pt-3">
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="flex items-center gap-1.5 text-xs text-bharati-ash hover:text-bharati-charcoal transition-colors font-medium"
        >
          {showManualUrl ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{showManualUrl ? "Hide manual URL option" : "Or enter image URL manually"}</span>
        </button>

        {showManualUrl && (
          <div className="mt-3 p-4 bg-gray-50/70 border border-bharati-mist rounded-md space-y-3 animate-fadeIn">
            <label className="block text-xs font-medium text-bharati-charcoal">
              Image URL / Path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualUrlInput}
                onChange={(e) => setManualUrlInput(e.target.value)}
                placeholder="e.g. /products/Cooker-front.jpg or https://..."
                className="flex-1 p-2.5 border border-bharati-mist rounded-md text-xs font-mono bg-white focus:border-bharati-black transition-colors"
              />
              <button
                type="button"
                onClick={handleApplyManualUrl}
                className="px-4 py-2 text-xs font-medium bg-bharati-black text-white rounded-md hover:bg-bharati-charcoal transition-colors shrink-0"
              >
                Apply URL
              </button>
            </div>
            <p className="text-[11px] text-bharati-ash">
              You can reference local static paths (e.g. <code>/products/Cooker-front.jpg</code>) or remote Supabase/CDN URLs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

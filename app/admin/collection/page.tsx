"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  adminFetchCollectionTiles,
  adminCreateCollectionTile,
  adminUpdateCollectionTile,
  adminDeleteCollectionTile,
  adminUploadImage,
} from "@/app/lib/admin-api";
import {
  getSessionCache,
  setSessionCache,
  CACHE_KEYS,
} from "@/app/lib/cache";
import { CollectionTile, CollectionSlotPosition } from "@/app/lib/types";
import {
  LayoutGrid,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Eye,
  Check,
  Crop,
  Sparkles,
  Lock,
} from "lucide-react";
import { useToast } from "@/app/admin/ToastContext";
import { fetchProducts } from "@/app/lib/api";
import { products as fallbackProducts } from "@/app/data/products";
import { ImageCropperModal, SLOT_TARGET_DIMENSIONS } from "./components/ImageCropperModal";


export const SLOT_CONFIG: Record<
  CollectionSlotPosition,
  { name: string; visualDesc: string; recommendedSize: string; aspect: string }
> = {
  BOX_1: {
    name: "Top-Left (Box 1)",
    visualDesc: "Top left square card",
    recommendedSize: "550 × 550 px (1:1 Square)",
    aspect: "1:1",
  },
  BOX_2: {
    name: "Top-Middle (Box 2)",
    visualDesc: "Top right square card",
    recommendedSize: "550 × 550 px (1:1 Square)",
    aspect: "1:1",
  },
  BOX_3: {
    name: "Bottom-Wide (Box 3)",
    visualDesc: "Bottom wide banner card",
    recommendedSize: "700 × 450 px (~16:10 Landscape)",
    aspect: "16:10",
  },
  BOX_4: {
    name: "Right-Tall (Box 4)",
    visualDesc: "Right full-height portrait card",
    recommendedSize: "600 × 800 px (3:4 Portrait)",
    aspect: "3:4",
  },
};

interface BoxDraft {
  id?: string;
  title: string;
  linkUrl: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  isComplete: boolean;
}

const DEFAULT_EMPTY_BOX = (order: number): BoxDraft => ({
  title: "",
  linkUrl: "",
  imageUrl: "",
  isActive: true,
  sortOrder: order,
  isComplete: false,
});

export interface OptionProduct {
  id: string;
  name: string;
  slug: string;
  categoryName?: string;
  image?: string;
}

export default function AdminCollectionPage() {
  const { showToast } = useToast();

  const [tiles, setTiles] = useState<CollectionTile[]>(() => {
    return getSessionCache<CollectionTile[]>(CACHE_KEYS.ADMIN_COLLECTION_TILES) || [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !getSessionCache<CollectionTile[]>(CACHE_KEYS.ADMIN_COLLECTION_TILES);
  });
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced" | "idle">("syncing");
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Live active products fetched from database for autofill
  const [activeProducts, setActiveProducts] = useState<OptionProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Modal mode: "create_block" (4-box wizard) or "edit_tile" (single tile editor)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create_block" | "edit_tile">("create_block");
  const [selectedTile, setSelectedTile] = useState<CollectionTile | null>(null);

  // 4-Box Block Wizard States
  const [wizardBlockIndex, setWizardBlockIndex] = useState<number>(0);
  const [activeSlot, setActiveSlot] = useState<CollectionSlotPosition>("BOX_1");
  const [blockWizardBoxes, setBlockWizardBoxes] = useState<Record<CollectionSlotPosition, BoxDraft>>({
    BOX_1: DEFAULT_EMPTY_BOX(0),
    BOX_2: DEFAULT_EMPTY_BOX(1),
    BOX_3: DEFAULT_EMPTY_BOX(2),
    BOX_4: DEFAULT_EMPTY_BOX(3),
  });

  // Single Tile Edit States (for editing existing individual tiles)
  const [singleFormTitle, setSingleFormTitle] = useState("");
  const [singleFormImageUrl, setSingleFormImageUrl] = useState("");
  const [singleFormLinkUrl, setSingleFormLinkUrl] = useState("");
  const [singleFormIsActive, setSingleFormIsActive] = useState(true);
  const [singleFormSortOrder, setSingleFormSortOrder] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper Modal States
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropFileName, setCropFileName] = useState("");
  const [cropperTargetSlot, setCropperTargetSlot] = useState<CollectionSlotPosition>("BOX_1");

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tileToDelete, setTileToDelete] = useState<CollectionTile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Load collection tiles from server
  const loadTiles = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh && tiles.length === 0) {
        const cached = getSessionCache<CollectionTile[]>(CACHE_KEYS.ADMIN_COLLECTION_TILES);
        if (cached) {
          setTiles(cached);
          setLoading(false);
        }
      }

      setSyncStatus("syncing");
      if (tiles.length === 0 && !getSessionCache(CACHE_KEYS.ADMIN_COLLECTION_TILES)) {
        setLoading(true);
      }

      try {
        const res = await adminFetchCollectionTiles();
        const data: CollectionTile[] = res.data || [];
        setTiles(data);
        setSessionCache(CACHE_KEYS.ADMIN_COLLECTION_TILES, data);
        setSyncStatus("synced");
      } catch (err: any) {
        console.error("Failed to load collection tiles:", err);
        showToast(err.message || "Failed to load collection tiles", "error");
        setSyncStatus("idle");
      } finally {
        setLoading(false);
      }
    },
    [showToast, tiles.length]
  );

  useEffect(() => {
    loadTiles(true);

    // Fetch ONLY active products from live database
    fetchProducts()
      .then((liveList) => {
        if (liveList && liveList.length > 0) {
          setActiveProducts(
            liveList.map((p) => ({
              id: p.id,
              name: p.name || p.title,
              slug: p.slug,
              categoryName: p.categoryName,
              image: p.primaryImageUrl,
            }))
          );
        } else {
          setActiveProducts(
            fallbackProducts.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              categoryName: p.category,
              image: p.image,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch live products, using fallback:", err);
        setActiveProducts(
          fallbackProducts.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            categoryName: p.category,
            image: p.image,
          }))
        );
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);

  // Compute unique blocks
  const blockIndices = useMemo(() => {
    const indices = new Set<number>();
    tiles.forEach((t) => indices.add(t.blockIndex));
    indices.add(0);
    indices.add(1);
    return Array.from(indices).sort((a, b) => a - b);
  }, [tiles]);

  // Group tiles by block index
  const tilesByBlock = useMemo(() => {
    const map = new Map<number, Record<CollectionSlotPosition, CollectionTile | null>>();
    blockIndices.forEach((bIdx) => {
      map.set(bIdx, {
        BOX_1: null,
        BOX_2: null,
        BOX_3: null,
        BOX_4: null,
      });
    });

    tiles.forEach((tile) => {
      if (!map.has(tile.blockIndex)) {
        map.set(tile.blockIndex, {
          BOX_1: null,
          BOX_2: null,
          BOX_3: null,
          BOX_4: null,
        });
      }
      const blockSlots = map.get(tile.blockIndex)!;
      blockSlots[tile.slotPosition] = tile;
    });

    return map;
  }, [blockIndices, tiles]);

  // Filtered tiles for table
  const filteredTiles = useMemo(() => {
    return tiles.filter((t) => {
      const matchBlock =
        selectedBlockFilter === "all" || t.blockIndex === parseInt(selectedBlockFilter, 10);
      const matchSearch =
        search.trim() === "" ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.linkUrl.toLowerCase().includes(search.toLowerCase()) ||
        t.slotPosition.toLowerCase().includes(search.toLowerCase());
      return matchBlock && matchSearch;
    });
  }, [tiles, selectedBlockFilter, search]);

  // Completed count in 4-box wizard
  const completedBoxesCount = useMemo(() => {
    return (["BOX_1", "BOX_2", "BOX_3", "BOX_4"] as CollectionSlotPosition[]).filter(
      (slot) => blockWizardBoxes[slot]?.isComplete
    ).length;
  }, [blockWizardBoxes]);

  const isAllBoxesCompleted = completedBoxesCount === 4;

  // Open "Add New Bento Block" wizard
  const handleOpenCreateBlock = (prefillBlock?: number) => {
    const nextBlock =
      prefillBlock !== undefined
        ? prefillBlock
        : blockIndices.length > 0
        ? Math.max(...blockIndices) + 1
        : 0;

    // Check if block already has partial tiles in database
    const existingSlots = tilesByBlock.get(nextBlock);

    const initBoxes: Record<CollectionSlotPosition, BoxDraft> = {
      BOX_1: existingSlots?.BOX_1
        ? {
            id: existingSlots.BOX_1.id,
            title: existingSlots.BOX_1.title,
            linkUrl: existingSlots.BOX_1.linkUrl,
            imageUrl: existingSlots.BOX_1.imageUrl,
            isActive: existingSlots.BOX_1.isActive,
            sortOrder: existingSlots.BOX_1.sortOrder,
            isComplete: true,
          }
        : DEFAULT_EMPTY_BOX(0),
      BOX_2: existingSlots?.BOX_2
        ? {
            id: existingSlots.BOX_2.id,
            title: existingSlots.BOX_2.title,
            linkUrl: existingSlots.BOX_2.linkUrl,
            imageUrl: existingSlots.BOX_2.imageUrl,
            isActive: existingSlots.BOX_2.isActive,
            sortOrder: existingSlots.BOX_2.sortOrder,
            isComplete: true,
          }
        : DEFAULT_EMPTY_BOX(1),
      BOX_3: existingSlots?.BOX_3
        ? {
            id: existingSlots.BOX_3.id,
            title: existingSlots.BOX_3.title,
            linkUrl: existingSlots.BOX_3.linkUrl,
            imageUrl: existingSlots.BOX_3.imageUrl,
            isActive: existingSlots.BOX_3.isActive,
            sortOrder: existingSlots.BOX_3.sortOrder,
            isComplete: true,
          }
        : DEFAULT_EMPTY_BOX(2),
      BOX_4: existingSlots?.BOX_4
        ? {
            id: existingSlots.BOX_4.id,
            title: existingSlots.BOX_4.title,
            linkUrl: existingSlots.BOX_4.linkUrl,
            imageUrl: existingSlots.BOX_4.imageUrl,
            isActive: existingSlots.BOX_4.isActive,
            sortOrder: existingSlots.BOX_4.sortOrder,
            isComplete: true,
          }
        : DEFAULT_EMPTY_BOX(3),
    };

    setWizardBlockIndex(nextBlock);
    setBlockWizardBoxes(initBoxes);
    setActiveSlot("BOX_1");
    setModalMode("create_block");
    setSelectedTile(null);
    setShowModal(true);
  };

  // Open "Edit Tile" modal for a single existing tile
  const handleOpenEditTile = (tile: CollectionTile) => {
    setSelectedTile(tile);
    setSingleFormTitle(tile.title);
    setSingleFormImageUrl(tile.imageUrl);
    setSingleFormLinkUrl(tile.linkUrl);
    setSingleFormIsActive(tile.isActive);
    setSingleFormSortOrder(tile.sortOrder || 0);
    setModalMode("edit_tile");
    setShowModal(true);
  };

  // Switch active slot in the 4-box wizard
  const handleSelectSlot = (slot: CollectionSlotPosition) => {
    setActiveSlot(slot);
    // Fields for this slot are automatically displayed from blockWizardBoxes[slot].
    // If the box was not filled, its values are empty (""), fulfilling the requirement
    // to refresh and reset fields to default for new boxes!
  };

  // Update current slot field in block wizard
  const updateActiveSlotField = (updates: Partial<BoxDraft>) => {
    setBlockWizardBoxes((prev) => {
      const current = { ...prev[activeSlot], ...updates };
      // All mandatory fields: title, linkUrl, and cropped imageUrl
      const isComplete = Boolean(
        current.title.trim().length > 0 &&
        current.linkUrl.trim().length > 0 &&
        current.imageUrl.trim().length > 0
      );
      return {
        ...prev,
        [activeSlot]: { ...current, isComplete },
      };
    });
  };

  // Quick autofill from live active products in database
  const handleProductSelect = (productSlug: string) => {
    const prod = activeProducts.find((p) => p.slug === productSlug);
    if (!prod) return;

    if (modalMode === "create_block") {
      updateActiveSlotField({
        title: prod.name,
        linkUrl: `/products/${prod.slug}`,
      });
    } else {
      setSingleFormTitle(prod.name);
      setSingleFormLinkUrl(`/products/${prod.slug}`);
    }
  };

  // File selection -> opens ImageCropperModal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file (JPEG, PNG, WebP).", "error");
      return;
    }

    const currentSlot = modalMode === "create_block" ? activeSlot : selectedTile?.slotPosition || "BOX_1";
    setCropperTargetSlot(currentSlot);

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropFileName(file.name);
      setShowCropper(true);
    };
    reader.onerror = () => {
      showToast("Failed to read image file.", "error");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle successful crop & upload from ImageCropperModal
  const handleCropComplete = async (_blob: Blob, croppedFile: File) => {
    try {
      setIsUploading(true);
      const cdnUrl = await adminUploadImage(croppedFile);

      if (modalMode === "create_block") {
        updateActiveSlotField({ imageUrl: cdnUrl });
        setShowCropper(false);
        showToast(`Photo cropped to exact ${cropperTargetSlot} size & uploaded!`, "success");
      } else {
        setSingleFormImageUrl(cdnUrl);
        setShowCropper(false);
        showToast("Photo cropped & uploaded successfully!", "success");
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      showToast(err.message || "Failed to upload image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === "create_block") {
      if (!isAllBoxesCompleted) {
        showToast("Please complete all 4 boxes (upload photo, title, link) before saving.", "error");
        return;
      }

      try {
        setIsSubmitting(true);
        const slots: CollectionSlotPosition[] = ["BOX_1", "BOX_2", "BOX_3", "BOX_4"];

        // Save all 4 boxes in parallel
        await Promise.all(
          slots.map((slot) => {
            const box = blockWizardBoxes[slot];
            if (box.id) {
              // Update existing tile in this slot
              return adminUpdateCollectionTile(box.id, {
                title: box.title.trim(),
                imageUrl: box.imageUrl.trim(),
                linkUrl: box.linkUrl.trim(),
                isActive: box.isActive,
                sortOrder: box.sortOrder,
              });
            } else {
              // Create new tile
              return adminCreateCollectionTile({
                blockIndex: wizardBlockIndex,
                slotPosition: slot,
                title: box.title.trim(),
                imageUrl: box.imageUrl.trim(),
                linkUrl: box.linkUrl.trim(),
                isActive: box.isActive,
                sortOrder: box.sortOrder,
              });
            }
          })
        );

        showToast(`Bento Block ${wizardBlockIndex} saved with all 4 boxes!`, "success");
        setShowModal(false);
        loadTiles(true);
      } catch (err: any) {
        console.error("Failed to save block:", err);
        showToast(err.message || "Failed to save block tiles", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else if (modalMode === "edit_tile" && selectedTile) {
      if (!singleFormTitle.trim() || !singleFormImageUrl.trim() || !singleFormLinkUrl.trim()) {
        showToast("Title, Storefront Link, and Image are required.", "error");
        return;
      }

      try {
        setIsSubmitting(true);
        await adminUpdateCollectionTile(selectedTile.id, {
          title: singleFormTitle.trim(),
          imageUrl: singleFormImageUrl.trim(),
          linkUrl: singleFormLinkUrl.trim(),
          isActive: singleFormIsActive,
          sortOrder: singleFormSortOrder,
        });
        showToast("Collection tile updated successfully!", "success");
        setShowModal(false);
        loadTiles(true);
      } catch (err: any) {
        showToast(err.message || "Failed to update tile", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Toggle active status directly
  const handleToggleActive = async (tile: CollectionTile) => {
    try {
      await adminUpdateCollectionTile(tile.id, {
        isActive: !tile.isActive,
      });
      showToast(`Tile '${tile.title}' is now ${!tile.isActive ? "active" : "inactive"}`, "success");
      loadTiles(true);
    } catch (err: any) {
      showToast(err.message || "Failed to update tile status", "error");
    }
  };

  // Delete handler
  const handleOpenDelete = (tile: CollectionTile) => {
    setTileToDelete(tile);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!tileToDelete) return;
    if (deleteConfirmText.toUpperCase() !== "DELETE") {
      showToast("Please type DELETE to confirm", "error");
      return;
    }

    try {
      setIsDeleting(true);
      await adminDeleteCollectionTile(tileToDelete.id);
      showToast(`Tile '${tileToDelete.title}' deleted successfully!`, "success");
      setShowDeleteModal(false);
      setTileToDelete(null);
      loadTiles(true);
    } catch (err: any) {
      console.error("Failed to delete tile:", err);
      showToast(err.message || "Failed to delete tile", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeBoxDraft = blockWizardBoxes[activeSlot];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bharati-mist pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif text-bharati-charcoal flex items-center gap-2.5">
              <LayoutGrid className="w-7 h-7 text-bharati-teal" />
              Bento Collection Manager
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  syncStatus === "syncing"
                    ? "bg-amber-100 text-amber-800"
                    : syncStatus === "synced"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {syncStatus === "syncing" && (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                )}
                {syncStatus === "synced" && (
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                )}
                {syncStatus === "syncing"
                  ? "Syncing"
                  : syncStatus === "synced"
                  ? "Synced"
                  : "Idle"}
              </span>
            </div>
          </div>
          <p className="text-sm text-bharati-ash mt-1">
            Manage the luxury 4-card Bento Collage blocks displayed on your homepage. Add full blocks, crop photos to exact box sizes, and publish.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadTiles(true)}
            disabled={loading || syncStatus === "syncing"}
            className="p-2.5 rounded-xl border border-bharati-mist bg-white text-bharati-charcoal hover:bg-bharati-mist/30 transition-colors disabled:opacity-50"
            title="Refresh tiles from server"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={() => handleOpenCreateBlock()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bharati-teal text-white font-medium hover:bg-bharati-teal/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Bento Block</span>
          </button>
        </div>
      </div>

      {/* Visual Block Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif text-bharati-charcoal font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-bharati-teal" />
              Live Bento Blocks Layout
            </h2>
            <p className="text-xs text-bharati-ash">
              Click any block to manage its 4 slots, or click "+ Add New Block" to add a full set.
            </p>
          </div>

          <button
            onClick={() => {
              const nextBlockIdx =
                blockIndices.length > 0 ? Math.max(...blockIndices) + 1 : 0;
              handleOpenCreateBlock(nextBlockIdx);
            }}
            className="text-xs text-bharati-teal font-semibold hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bharati-teal/5 border border-bharati-teal/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Block (Block {blockIndices.length > 0 ? Math.max(...blockIndices) + 1 : 0})
          </button>
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Array.from(tilesByBlock.entries()).map(([blockIdx, slots]) => {
            const filledCount = Object.values(slots).filter(Boolean).length;
            return (
              <div
                key={blockIdx}
                className="bg-white rounded-2xl p-5 border border-bharati-mist shadow-xs flex flex-col space-y-4"
              >
                <div className="flex items-center justify-between border-b border-bharati-mist/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-bharati-teal/10 text-bharati-teal font-serif font-bold flex items-center justify-center text-sm">
                      {blockIdx}
                    </span>
                    <div>
                      <h3 className="font-semibold text-bharati-charcoal text-sm">
                        Bento Block {blockIdx}
                      </h3>
                      <span className="text-xs text-bharati-ash">
                        {filledCount} of 4 slots filled
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCreateBlock(blockIdx)}
                      className="text-xs text-bharati-teal hover:underline font-medium px-2.5 py-1 rounded-md hover:bg-bharati-teal/5 transition-colors"
                    >
                      Configure Block
                    </button>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        filledCount === 4
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {filledCount === 4 ? "Complete" : `${filledCount}/4 Slots`}
                    </span>
                  </div>
                </div>

                {/* 4-Card Mini Bento Grid */}
                <div className="w-full h-[280px] sm:h-[320px] grid grid-cols-[63%_37%] gap-2.5 p-2 rounded-xl bg-bharati-cream/40 border border-bharati-mist/40">
                  {/* Left Side: 2 Rows */}
                  <div className="flex flex-col gap-2.5 h-full">
                    {/* Top Row: Box 1 & Box 2 */}
                    <div className="grid grid-cols-2 gap-2.5 h-[48%]">
                      <MiniSlotCard
                        slot="BOX_1"
                        tile={slots.BOX_1}
                        onEdit={handleOpenEditTile}
                        onCreate={() => handleOpenCreateBlock(blockIdx)}
                      />
                      <MiniSlotCard
                        slot="BOX_2"
                        tile={slots.BOX_2}
                        onEdit={handleOpenEditTile}
                        onCreate={() => handleOpenCreateBlock(blockIdx)}
                      />
                    </div>

                    {/* Bottom Row: Box 3 (Wide) */}
                    <div className="h-[52%]">
                      <MiniSlotCard
                        slot="BOX_3"
                        tile={slots.BOX_3}
                        onEdit={handleOpenEditTile}
                        onCreate={() => handleOpenCreateBlock(blockIdx)}
                      />
                    </div>
                  </div>

                  {/* Right Side: Box 4 (Tall) */}
                  <div className="h-full">
                    <MiniSlotCard
                      slot="BOX_4"
                      tile={slots.BOX_4}
                      onEdit={handleOpenEditTile}
                      onCreate={() => handleOpenCreateBlock(blockIdx)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tiles Management Table */}
      <div className="bg-white rounded-2xl border border-bharati-mist shadow-xs overflow-hidden">
        <div className="p-5 border-b border-bharati-mist flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-semibold text-bharati-charcoal">
              All Collection Tiles ({tiles.length})
            </h2>
            <p className="text-xs text-bharati-ash mt-0.5">
              Browse, search, edit, or remove specific slot entries across all blocks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Block Filter */}
            <select
              value={selectedBlockFilter}
              onChange={(e) => setSelectedBlockFilter(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-bharati-mist bg-bharati-cream/40 focus:outline-none focus:ring-1 focus:ring-bharati-teal"
            >
              <option value="all">All Blocks</option>
              {blockIndices.map((b) => (
                <option key={b} value={b.toString()}>
                  Block {b}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by title, slot, or link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl border border-bharati-mist bg-bharati-cream/40 focus:outline-none focus:ring-1 focus:ring-bharati-teal w-full sm:w-56"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading && tiles.length === 0 ? (
          <div className="p-12 text-center text-bharati-ash">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-bharati-teal mb-3" />
            <p className="text-sm">Loading collection tiles...</p>
          </div>
        ) : filteredTiles.length === 0 ? (
          <div className="p-12 text-center text-bharati-ash">
            <LayoutGrid className="w-10 h-10 mx-auto text-bharati-mist mb-3" />
            <p className="text-sm font-medium text-bharati-charcoal">No collection tiles found</p>
            <p className="text-xs mt-1">
              {search || selectedBlockFilter !== "all"
                ? "Try adjusting your search or block filter."
                : "Get started by adding your first Bento block."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bharati-cream/60 border-b border-bharati-mist text-xs text-bharati-ash uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Block / Slot</th>
                  <th className="px-5 py-3.5">Preview</th>
                  <th className="px-5 py-3.5">Display Title</th>
                  <th className="px-5 py-3.5">Storefront Link</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bharati-mist/60 text-bharati-charcoal">
                {filteredTiles.map((tile) => (
                  <tr key={tile.id} className="hover:bg-bharati-cream/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-bharati-charcoal text-white text-xs font-semibold">
                          B{tile.blockIndex}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-bharati-teal/10 text-bharati-teal text-xs font-semibold font-mono">
                          {tile.slotPosition}
                        </span>
                      </div>
                      <span className="text-[11px] text-bharati-ash block mt-0.5">
                        {SLOT_CONFIG[tile.slotPosition]?.visualDesc}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-bharati-mist/30 border border-bharati-mist flex-shrink-0">
                        <Image
                          src={tile.imageUrl}
                          alt={tile.title}
                          fill
                          className="object-cover"
                          unoptimized={tile.imageUrl.startsWith("http")}
                        />
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-bharati-charcoal block">{tile.title}</span>
                      <span className="text-[11px] text-bharati-ash">
                        {SLOT_CONFIG[tile.slotPosition]?.recommendedSize}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <Link
                        href={tile.linkUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-bharati-teal hover:underline max-w-[200px] truncate"
                      >
                        {tile.linkUrl}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </Link>
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleActive(tile)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          tile.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title="Click to toggle active status"
                      >
                        {tile.isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditTile(tile)}
                        className="p-1.5 text-bharati-ash hover:text-bharati-teal hover:bg-bharati-mist/40 rounded-lg transition-colors"
                        title="Edit Tile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(tile)}
                        className="p-1.5 text-bharati-ash hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Tile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4-BOX BENTO BLOCK CREATOR WIZARD MODAL                                  */}
      {/* ========================================================================= */}
      {showModal && modalMode === "create_block" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl border border-bharati-mist shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-bharati-mist flex items-center justify-between bg-bharati-cream/40 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-bharati-teal/10 text-bharati-teal flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-bharati-charcoal flex items-center gap-2">
                    Configure Bento Block #{wizardBlockIndex}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        isAllBoxesCompleted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {completedBoxesCount} of 4 Boxes Completed
                    </span>
                  </h3>
                  <p className="text-xs text-bharati-ash mt-0.5">
                    Click each box below, fill in the details, and crop its photo. A green tick marks each completed box.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-bharati-ash hover:text-bharati-charcoal rounded-lg hover:bg-bharati-mist/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Interactive 4-Box Bento Grid with Green Ticks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-bharati-ash tracking-wider">
                    1. Click a Box to Configure:
                  </span>
                  <span className="text-xs font-medium text-bharati-teal flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Currently Editing:{" "}
                    <strong>{SLOT_CONFIG[activeSlot].name}</strong>
                  </span>
                </div>

                <div className="w-full h-[220px] sm:h-[260px] grid grid-cols-[63%_37%] gap-3 p-3 rounded-2xl bg-bharati-charcoal/5 border border-bharati-mist">
                  {/* Left Side: 2 Rows */}
                  <div className="flex flex-col gap-3 h-full">
                    {/* Top Row: Box 1 & Box 2 */}
                    <div className="grid grid-cols-2 gap-3 h-[48%]">
                      <WizardBoxSlot
                        slot="BOX_1"
                        box={blockWizardBoxes.BOX_1}
                        isActive={activeSlot === "BOX_1"}
                        onClick={() => handleSelectSlot("BOX_1")}
                      />
                      <WizardBoxSlot
                        slot="BOX_2"
                        box={blockWizardBoxes.BOX_2}
                        isActive={activeSlot === "BOX_2"}
                        onClick={() => handleSelectSlot("BOX_2")}
                      />
                    </div>

                    {/* Bottom Row: Box 3 (Wide) */}
                    <div className="h-[52%]">
                      <WizardBoxSlot
                        slot="BOX_3"
                        box={blockWizardBoxes.BOX_3}
                        isActive={activeSlot === "BOX_3"}
                        onClick={() => handleSelectSlot("BOX_3")}
                      />
                    </div>
                  </div>

                  {/* Right Side: Box 4 (Tall) */}
                  <div className="h-full">
                    <WizardBoxSlot
                      slot="BOX_4"
                      box={blockWizardBoxes.BOX_4}
                      isActive={activeSlot === "BOX_4"}
                      onClick={() => handleSelectSlot("BOX_4")}
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields for Active Slot */}
              <div className="p-5 rounded-2xl border border-bharati-teal/20 bg-bharati-teal/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bharati-teal/15 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-bharati-charcoal flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-bharati-teal animate-pulse" />
                      Box Details: {SLOT_CONFIG[activeSlot].name}
                    </h4>
                    <p className="text-xs text-bharati-ash mt-0.5">
                      Required pixel size:{" "}
                      <strong className="text-bharati-teal">
                        {SLOT_TARGET_DIMENSIONS[activeSlot].width} ×{" "}
                        {SLOT_TARGET_DIMENSIONS[activeSlot].height} px
                      </strong>
                    </p>
                  </div>

                  {/* Quick Product Autofill Helper */}
                  <div className="w-full sm:w-64">
                    <select
                      onChange={(e) => handleProductSelect(e.target.value)}
                      defaultValue=""
                      className="w-full text-xs px-3 py-2 rounded-xl border border-bharati-mist bg-white focus:ring-1 focus:ring-bharati-teal"
                    >
                      <option value="" disabled>
                        {loadingProducts
                          ? "Loading active products..."
                          : `⚡ Autofill from live products (${activeProducts.length} active)...`}
                      </option>
                      {activeProducts.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name} {p.categoryName ? `(${p.categoryName})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-bharati-ash tracking-wider mb-1.5">
                      Display Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Triply Kadhai"
                      value={activeBoxDraft.title}
                      onChange={(e) => updateActiveSlotField({ title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bharati-mist bg-white text-sm focus:ring-1 focus:ring-bharati-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-bharati-ash tracking-wider mb-1.5">
                      Storefront Link *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. /products/triply-kadhai"
                      value={activeBoxDraft.linkUrl}
                      onChange={(e) => updateActiveSlotField({ linkUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-bharati-mist bg-white text-sm focus:ring-1 focus:ring-bharati-teal"
                    />
                  </div>
                </div>

                {/* Image Upload with Cropper */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-bharati-ash tracking-wider mb-1.5">
                    Box Photo (Auto-Crop to {SLOT_TARGET_DIMENSIONS[activeSlot].width} ×{" "}
                    {SLOT_TARGET_DIMENSIONS[activeSlot].height} px) *
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-bharati-mist">
                    {/* Thumbnail Preview */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-bharati-mist/30 border border-bharati-mist flex-shrink-0 flex items-center justify-center">
                      {activeBoxDraft.imageUrl ? (
                        <Image
                          src={activeBoxDraft.imageUrl}
                          alt="Tile preview"
                          fill
                          className="object-cover"
                          unoptimized={activeBoxDraft.imageUrl.startsWith("http")}
                        />
                      ) : (
                        <Crop className="w-7 h-7 text-bharati-mist" />
                      )}
                    </div>

                    {/* Upload & Crop Buttons */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-bharati-teal/40 bg-bharati-teal/10 text-xs font-semibold text-bharati-teal hover:bg-bharati-teal/20 transition-colors disabled:opacity-50"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-bharati-teal" />
                              Uploading to CDN...
                            </>
                          ) : (
                            <>
                              <Crop className="w-3.5 h-3.5 text-bharati-teal" />
                              Upload & Crop Photo
                            </>
                          )}
                        </button>

                        {activeBoxDraft.imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setCropImageSrc(activeBoxDraft.imageUrl);
                              setCropFileName(`${activeSlot.toLowerCase()}_tile.jpg`);
                              setCropperTargetSlot(activeSlot);
                              setShowCropper(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-bharati-mist bg-white text-xs font-medium text-bharati-charcoal hover:bg-bharati-cream transition-colors"
                          >
                            <Crop className="w-3.5 h-3.5 text-bharati-ash" />
                            Adjust Crop
                          </button>
                        )}

                        <span className="text-xs text-bharati-ash">
                          or enter image URL:
                        </span>
                      </div>

                      <input
                        type="text"
                        placeholder="https://... or /masonry/..."
                        value={activeBoxDraft.imageUrl}
                        onChange={(e) => updateActiveSlotField({ imageUrl: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-bharati-mist bg-white text-xs focus:ring-1 focus:ring-bharati-teal"
                      />
                    </div>
                  </div>
                </div>

                {/* Completion feedback */}
                <div className="flex items-center justify-between text-xs pt-1">
                  {activeBoxDraft.isComplete ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {activeSlot} is complete! Click the next box above to continue.
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Add a title, link, and upload a cropped photo to complete {activeSlot}.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer / Save Action */}
            <div className="px-6 py-4 border-t border-bharati-mist bg-bharati-cream/40 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-bharati-ash font-medium">
                  Progress:
                </span>
                <div className="flex items-center gap-1.5">
                  {(["BOX_1", "BOX_2", "BOX_3", "BOX_4"] as CollectionSlotPosition[]).map(
                    (slot) => (
                      <span
                        key={slot}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          blockWizardBoxes[slot].isComplete
                            ? "bg-emerald-500 ring-2 ring-emerald-200"
                            : "bg-gray-300"
                        }`}
                        title={`${slot}: ${
                          blockWizardBoxes[slot].isComplete ? "Completed" : "Incomplete"
                        }`}
                      />
                    )
                  )}
                </div>
                <span className="text-xs font-semibold text-bharati-charcoal ml-1">
                  {completedBoxesCount}/4 Ready
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-bharati-mist bg-white text-xs font-semibold text-bharati-charcoal hover:bg-bharati-mist/30 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isAllBoxesCompleted || isSubmitting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    isAllBoxesCompleted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer"
                      : "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed opacity-80"
                  }`}
                  title={
                    !isAllBoxesCompleted
                      ? "Complete all 4 boxes to enable Save"
                      : "Publish this Bento Block"
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving All 4 Tiles...</span>
                    </>
                  ) : !isAllBoxesCompleted ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Complete all 4 boxes to save ({completedBoxesCount}/4)</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Save & Publish Bento Block #{wizardBlockIndex}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE TILE EDIT MODAL                                                    */}
      {/* ========================================================================= */}
      {showModal && modalMode === "edit_tile" && selectedTile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl border border-bharati-mist shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-bharati-mist flex items-center justify-between bg-bharati-cream/40">
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-5 h-5 text-bharati-teal" />
                <h3 className="font-serif text-lg font-semibold text-bharati-charcoal">
                  Edit Bento Tile — {selectedTile.title} ({selectedTile.slotPosition})
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-bharati-ash hover:text-bharati-charcoal rounded-lg hover:bg-bharati-mist/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Quick Product Autofill Helper */}
              <div>
                <label className="block text-xs font-semibold uppercase text-bharati-ash tracking-wider mb-1.5">
                  Autofill from Live Products
                </label>
                <select
                  onChange={(e) => handleProductSelect(e.target.value)}
                  defaultValue=""
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-bharati-mist bg-white focus:ring-1 focus:ring-bharati-teal"
                >
                  <option value="" disabled>
                    {loadingProducts
                      ? "Loading active products..."
                      : `⚡ Select active product (${activeProducts.length} active)...`}
                  </option>
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} {p.categoryName ? `(${p.categoryName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-bharati-ash tracking-wider mb-1.5">
                  Display Title *
                </label>
                <input
                  type="text"
                  required
                  value={singleFormTitle}
                  onChange={(e) => setSingleFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-bharati-mist bg-white text-sm focus:ring-1 focus:ring-bharati-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-bharati-ash tracking-wider mb-1.5">
                  Storefront Link *
                </label>
                <input
                  type="text"
                  required
                  value={singleFormLinkUrl}
                  onChange={(e) => setSingleFormLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-bharati-mist bg-white text-sm focus:ring-1 focus:ring-bharati-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-bharati-ash tracking-wider mb-1.5">
                  Photo (Recommended:{" "}
                  {SLOT_TARGET_DIMENSIONS[selectedTile.slotPosition].width} ×{" "}
                  {SLOT_TARGET_DIMENSIONS[selectedTile.slotPosition].height} px) *
                </label>

                <div className="flex items-center gap-4 bg-bharati-cream/40 p-3 rounded-xl border border-bharati-mist">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-bharati-mist/30 border border-bharati-mist flex-shrink-0">
                    <Image
                      src={singleFormImageUrl}
                      alt="Tile preview"
                      fill
                      className="object-cover"
                      unoptimized={singleFormImageUrl.startsWith("http")}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-bharati-teal/40 bg-bharati-teal/10 text-xs font-semibold text-bharati-teal hover:bg-bharati-teal/20 transition-colors"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        Crop New Photo
                      </button>

                      {singleFormImageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setCropImageSrc(singleFormImageUrl);
                            setCropFileName(`tile_${selectedTile.slotPosition}.jpg`);
                            setCropperTargetSlot(selectedTile.slotPosition);
                            setShowCropper(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bharati-mist bg-white text-xs font-medium text-bharati-charcoal hover:bg-bharati-cream transition-colors"
                        >
                          <Crop className="w-3.5 h-3.5 text-bharati-ash" />
                          Adjust Crop
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={singleFormImageUrl}
                      onChange={(e) => setSingleFormImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-bharati-mist bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-bharati-mist/60">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={singleFormIsActive}
                    onChange={(e) => setSingleFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-bharati-teal rounded border-bharati-mist focus:ring-bharati-teal"
                  />
                  <span className="text-sm font-medium text-bharati-charcoal">
                    Active (visible on storefront)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-bharati-ash font-medium">Sort Order:</label>
                  <input
                    type="number"
                    value={singleFormSortOrder}
                    onChange={(e) => setSingleFormSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-16 px-2 py-1 rounded-lg border border-bharati-mist text-xs text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bharati-mist">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-bharati-mist bg-white text-xs font-semibold text-bharati-charcoal hover:bg-bharati-mist/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-bharati-teal text-white text-xs font-semibold hover:bg-bharati-teal/90 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md border border-bharati-mist shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-serif text-lg font-bold text-bharati-charcoal">
                Delete Bento Tile?
              </h3>
              <p className="text-xs text-bharati-ash mt-1">
                Are you sure you want to remove <strong>'{tileToDelete.title}'</strong> (Block {tileToDelete.blockIndex}, {tileToDelete.slotPosition})?
              </p>
            </div>

            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs text-red-700">
              Type <strong className="font-mono">DELETE</strong> below to confirm deletion.
            </div>

            <input
              type="text"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-bharati-mist text-sm text-center uppercase tracking-wider focus:ring-1 focus:ring-red-500"
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTileToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-bharati-mist text-xs font-semibold text-bharati-charcoal hover:bg-bharati-mist/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || deleteConfirmText.toUpperCase() !== "DELETE"}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Tile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive WhatsApp/Instagram Style Image Cropper Modal */}
      {showCropper && (
        <ImageCropperModal
          isOpen={showCropper}
          imageSrc={cropImageSrc}
          fileName={cropFileName}
          slotPosition={cropperTargetSlot}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

/** Interactive Box Slot inside the Block Creator Wizard Modal */
function WizardBoxSlot({
  slot,
  box,
  isActive,
  onClick,
}: {
  slot: CollectionSlotPosition;
  box: BoxDraft;
  isActive: boolean;
  onClick: () => void;
}) {
  const isComplete = box?.isComplete;

  return (
    <div
      onClick={onClick}
      className={`group relative w-full h-full rounded-xl overflow-hidden cursor-pointer transition-all ${
        isActive
          ? "ring-3 ring-bharati-teal shadow-lg scale-[1.01]"
          : "hover:ring-2 hover:ring-bharati-teal/50"
      } ${isComplete ? "bg-bharati-charcoal" : "bg-white border-2 border-dashed border-bharati-mist hover:border-bharati-teal"}`}
    >
      {/* Background image if cropped/uploaded */}
      {box?.imageUrl ? (
        <>
          <Image
            src={box.imageUrl}
            alt={box.title || slot}
            fill
            className="object-cover"
            unoptimized={box.imageUrl.startsWith("http")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
          <span className="text-[11px] font-mono font-bold text-bharati-charcoal">
            {slot}
          </span>
          <span className="text-[10px] text-bharati-ash mt-0.5">
            {slot === "BOX_1" || slot === "BOX_2"
              ? "1:1 Square"
              : slot === "BOX_3"
              ? "Wide Banner"
              : "Tall Portrait"}
          </span>
          <span className="text-[9px] text-bharati-teal font-medium mt-1">
            + Click to edit
          </span>
        </div>
      )}

      {/* Top Left Slot Tag */}
      <div className="absolute top-1.5 left-1.5 z-10">
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold backdrop-blur-xs ${
            isActive
              ? "bg-bharati-teal text-white"
              : isComplete
              ? "bg-black/60 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {slot}
        </span>
      </div>

      {/* PROMINENT GREEN TICK ON TOP-RIGHT OF COMPLETED BOX */}
      {isComplete && (
        <div
          className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-scale-in border-2 border-white"
          title={`${slot} is complete! Photo cropped and uploaded.`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Bottom Title if present */}
      {box?.title && (
        <div className="absolute bottom-1.5 inset-x-1.5 z-10 truncate">
          <p className="text-[10px] font-medium text-white truncate leading-tight drop-shadow-sm">
            {box.title}
          </p>
        </div>
      )}
    </div>
  );
}

/** Mini Bento slot card rendered inside the live block preview on page */
function MiniSlotCard({
  slot,
  tile,
  onEdit,
  onCreate,
}: {
  slot: CollectionSlotPosition;
  tile: CollectionTile | null;
  onEdit: (tile: CollectionTile) => void;
  onCreate: () => void;
}) {
  if (!tile) {
    return (
      <button
        type="button"
        onClick={onCreate}
        className="w-full h-full rounded-xl border-2 border-dashed border-bharati-mist hover:border-bharati-teal bg-white/60 hover:bg-bharati-teal/5 flex flex-col items-center justify-center gap-1 transition-all group"
      >
        <Plus className="w-4 h-4 text-bharati-mist group-hover:text-bharati-teal transition-colors" />
        <span className="text-[10px] font-mono text-bharati-ash group-hover:text-bharati-teal font-medium">
          + {slot}
        </span>
      </button>
    );
  }

  return (
    <div
      onClick={() => onEdit(tile)}
      className="group relative w-full h-full rounded-xl overflow-hidden bg-bharati-charcoal border border-black/10 shadow-xs cursor-pointer hover:shadow-md transition-all"
    >
      <Image
        src={tile.imageUrl}
        alt={tile.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        unoptimized={tile.imageUrl.startsWith("http")}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 text-white backdrop-blur-xs">
          {slot}
        </span>
        {!tile.isActive && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-500/80 text-white backdrop-blur-xs">
            Inactive
          </span>
        )}
      </div>

      <div className="absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1 rounded-full bg-white/80 text-bharati-charcoal backdrop-blur-xs">
          <Edit2 className="w-3 h-3" />
        </div>
      </div>

      <div className="absolute bottom-1.5 inset-x-1.5 z-10 truncate">
        <p className="text-[11px] font-medium text-white truncate leading-tight">
          {tile.title}
        </p>
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { Heart, ImagePlus, Trash2, X } from "lucide-react";
import { API_BASE } from "../config/api";

const MAX_UPLOAD_BYTES = 1_500_000;
const MAX_HAPPY_COUPLES = 10;

async function compressCoupleImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read selected image."));
    reader.readAsDataURL(file);
  });

  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  const maxEdge = 1400;
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.85, 0.72, 0.58]) {
    const compressed = canvas.toDataURL("image/jpeg", quality);
    if (compressed.length <= MAX_UPLOAD_BYTES) {
      return compressed;
    }
  }

  return canvas.toDataURL("image/jpeg", 0.5);
}

export default function AdminHappyCouplesTab({
  couples,
  token,
  fetchAsAdmin,
  onRefresh,
  showToast,
}) {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const isLimitReached = couples.length >= MAX_HAPPY_COUPLES;

  const handleFileChange = async (file) => {
    if (isLimitReached) {
      showToast(`Maximum limit of ${MAX_HAPPY_COUPLES} images reached.`, "error");
      return;
    }
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Please select a JPEG, PNG, or WebP image.", "error");
      return;
    }
    try {
      const compressed = await compressCoupleImage(file);
      setPreviewImage(compressed);
      setFileName(file.name);
    } catch (err) {
      showToast(err?.message || "Unable to process image.", "error");
    }
  };

  const handleClearImage = () => {
    setPreviewImage("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLimitReached) {
      showToast(`Maximum limit of ${MAX_HAPPY_COUPLES} images reached. Remove one first.`, "error");
      return;
    }
    if (!previewImage) {
      showToast("Please select a couple image to upload.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetchAsAdmin(`${API_BASE}/happy-couples`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: previewImage,
          coupleName: coupleName.trim(),
          location: location.trim(),
          caption: caption.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Could not upload couple image.", "error");
        return;
      }

      handleClearImage();
      setCoupleName("");
      setLocation("");
      setCaption("");
      showToast("Happy Couple image added to homepage.");
      onRefresh?.();
    } catch {
      showToast("Network error while uploading image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetchAsAdmin(`${API_BASE}/happy-couples/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Could not remove couple image.", "error");
        return;
      }

      showToast("Happy Couple image removed.");
      onRefresh?.();
    } catch {
      showToast("Network error while removing image.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl bg-white p-5 sm:p-6 rounded-xl border border-[var(--admin-border)] shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--admin-surface)] text-[var(--admin-gold-ink)]">
              <Heart size={18} />
            </span>
            <div>
              <h3 className="text-lg sm:text-xl text-[var(--admin-gold-ink)]">
                Add Happy Couple Image
              </h3>
              <p className="text-xs text-[var(--admin-gold-text)]">
                Upload up to {MAX_HAPPY_COUPLES} couple photos to display on the homepage.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1 text-xs font-semibold text-[var(--admin-gold-ink)]">
            {couples.length} / {MAX_HAPPY_COUPLES}
          </span>
        </div>

        {isLimitReached && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
            Maximum limit of {MAX_HAPPY_COUPLES} Happy Couple images reached. Remove an existing image below to add a new one.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--admin-gold-ink)] mb-1.5">
              Couple Photo <span className="text-rose-600">*</span>
            </label>

            {previewImage ? (
              <div className="relative overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                <img
                  src={previewImage}
                  alt="Couple preview"
                  className="h-[360px] sm:h-[400px] w-full object-cover object-top"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white hover:bg-black/80 cursor-pointer"
                >
                  <X size={13} />
                  Remove
                </button>
                {fileName && (
                  <p className="border-t border-[var(--admin-border)] bg-white px-3 py-1.5 text-xs text-[var(--admin-gold-text)] truncate">
                    {fileName}
                  </p>
                )}
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)]/50 px-4 py-8 text-center transition hover:border-[var(--admin-gold-strong)] hover:bg-[var(--admin-surface)]">
                <ImagePlus size={28} className="text-[var(--admin-gold-text)]" />
                <span className="text-sm font-semibold text-[var(--admin-gold-ink)]">
                  Click to choose a couple photo
                </span>
                <span className="text-xs text-[var(--admin-gold-text)]">
                  JPEG, PNG, or WebP · Fixed card height: 430px (390 × 430 px recommended)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
              </label>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
                Couple Name (Optional)
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Anjali & Arun"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)]"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Kochi, Kerala"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
              Short Caption / Note (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={240}
              placeholder="e.g. Married in December 2026 with blessings from both families."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)]"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading || !previewImage || isLimitReached}
            className="min-h-11 w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer shadow"
          >
            {isUploading ? "Uploading..." : "Add to Happy Couples"}
          </button>
        </form>
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[var(--admin-border)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-semibold text-[var(--admin-gold-ink)]">
            Published Happy Couples ({couples.length} / {MAX_HAPPY_COUPLES})
          </h4>
        </div>

        {couples.length === 0 ? (
          <p className="text-sm text-[var(--admin-gold-text)] py-6 text-center">
            No happy couple images uploaded yet. Use the form above to add the first photo.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {couples.map((couple) => (
              <div
                key={couple._id}
                className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/40 flex flex-col"
              >
                <div className="relative h-[360px] sm:h-[400px] lg:h-[430px] w-full bg-[#f3ece0]">
                  <img
                    src={couple.image}
                    alt={couple.coupleName || "Happy Couple"}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    {couple.coupleName && (
                      <p className="font-semibold text-sm text-[var(--admin-gold-ink)]">
                        {couple.coupleName}
                      </p>
                    )}
                    {couple.location && (
                      <p className="text-xs text-[var(--admin-gold-text)]">
                        {couple.location}
                      </p>
                    )}
                    {couple.caption && (
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {couple.caption}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === couple._id}
                    onClick={() => handleDelete(couple._id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                    {deletingId === couple._id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useId, useRef, useState } from "react";
import { ImageUp, X } from "lucide-react";
import { API_BASE } from "../config/api";

const fields = [
  ["name", "Name", "name", true],
  ["age", "Age", "age", true],
  ["phone", "Mobile number", "contact", true],
  ["height", "Height", "height"],
  ["fatherName", "Father's name", "father_name"],
  ["education", "Education", "education"],
  ["religion", "Religion", "religion"],
  ["caste", "Caste", "caste"],
  ["star", "Birth star", "star"],
  ["district", "District", "district"],
];

const defaultCrop = { left: 0, top: 32, right: 30, bottom: 73 };
const MAX_STORED_PHOTO_BYTES = 5_000;

async function compressPhotoForSave(photo) {
  const image = new Image();
  image.src = photo;
  await image.decode();

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Photo compression is unavailable in this browser.");

  for (const edge of [320, 256, 192, 144, 96, 64, 32, 16]) {
    const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.84, 0.68, 0.52, 0.36]) {
      const jpeg = canvas.toDataURL("image/jpeg", quality);
      // The database stores the full ASCII data URL, including Base64 overhead.
      if (jpeg.startsWith("data:image/jpeg;base64,") && jpeg.length <= MAX_STORED_PHOTO_BYTES) {
        return jpeg;
      }
    }
  }
  throw new Error("Unable to compress the photo to 5 KB.");
}

function CardPhotoEditor({ file, initialCrop, onApply, onCancel }) {
  const imageRef = useRef(null);
  const [source, setSource] = useState("");
  const [crop, setCrop] = useState(initialCrop);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const { left, top, right, bottom } = crop;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function applyCrop() {
    const image = imageRef.current;
    const x = Math.floor(image.naturalWidth * left / 100);
    const y = Math.floor(image.naturalHeight * top / 100);
    const width = Math.ceil(image.naturalWidth * right / 100) - x;
    const height = Math.ceil(image.naturalHeight * bottom / 100) - y;
    const scale = Math.min(1, 1200 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      setError("Photo adjustment is unavailable in this browser.");
      return;
    }

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.92, 0.8, 0.65, 0.5]) {
      const jpeg = canvas.toDataURL("image/jpeg", quality);
      const encoded = jpeg.slice("data:image/jpeg;base64,".length);
      const bytes = encoded.length * 3 / 4 - (encoded.match(/=+$/)?.[0].length ?? 0);
      if (jpeg.startsWith("data:image/jpeg;base64,") && bytes <= 1_000_000) {
        onApply(jpeg, crop);
        return;
      }
    }
    setError("The cropped photo is too large. Select a smaller area.");
  }

  const edges = [
    ["left", "Left edge", 0, right - 1],
    ["right", "Right edge", left + 1, 100],
    ["top", "Top edge", 0, bottom - 1],
    ["bottom", "Bottom edge", top + 1, 100],
  ];

  return (
    <div className="space-y-3 rounded-xl border border-[var(--admin-border)] bg-slate-50 p-3">
      <p className="text-sm">Move the crop edges to frame the portrait.</p>
      {source && (
        <div className="flex justify-center overflow-hidden rounded-lg bg-slate-200">
          <div className="relative overflow-hidden">
            <img
              ref={imageRef}
              src={source}
              alt="Original card with the selected crop outlined"
              onLoad={() => setReady(true)}
              onError={() => setError("Unable to open the original card image.")}
              className="block h-auto max-h-80 max-w-full"
              style={{ width: "auto" }}
            />
            {ready && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute border-2 border-white ring-1 ring-black"
                style={{
                  inset: `${top}% ${100 - right}% ${100 - bottom}% ${left}%`,
                  boxShadow: "0 0 0 200vmax rgb(0 0 0 / 55%)",
                }}
              />
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {edges.map(([key, label, min, max]) => (
          <label key={key} className="grid gap-1 text-sm">
            <span>{label} · {crop[key]}%</span>
            <input
              type="range"
              min={min}
              max={max}
              value={crop[key]}
              onChange={(event) => {
                setCrop({ ...crop, [key]: Number(event.target.value) });
                setError("");
              }}
              className="w-full accent-[var(--admin-gold-strong)]"
            />
          </label>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border px-3 py-2 text-sm">Cancel crop</button>
        <button type="button" onClick={applyCrop} disabled={!ready} className="rounded-lg bg-[var(--admin-gold-strong)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Apply crop
        </button>
      </div>
    </div>
  );
}

export default function AdminBulkUploadModal({ token, onClose, onImportSuccess }) {
  const titleId = useId();
  const [file, setFile] = useState(null);
  const [details, setDetails] = useState(null);
  const [photo, setPhoto] = useState("");
  const [crop, setCrop] = useState(defaultCrop);
  const [adjustingPhoto, setAdjustingPhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function selectFile(image) {
    if (busy || !image) return;
    setFile(null);
    setDetails(null);
    setPhoto("");
    setCrop(defaultCrop);
    setAdjustingPhoto(false);
    setError("");
    if (!["image/jpeg", "image/png"].includes(image.type) || image.size > 1_000_000) {
      setError("Select a JPEG or PNG image up to 1 MB.");
      return;
    }
    setFile(image);
  }

  async function submit(event) {
    event.preventDefault();
    if (!file || busy || adjustingPhoto) return;
    setBusy(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const form = new FormData();
      form.append("image", file);
      const body = details
        ? JSON.stringify({ ...details, photo: await compressPhotoForSave(photo) })
        : form;
      const response = await fetch(`${API_BASE}/profiles/${details ? "card-save" : "card-extract"}`, {
        method: "POST",
        headers: details ? { ...headers, "Content-Type": "application/json" } : headers,
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to process the candidate card.");
      if (details) {
        onImportSuccess();
        onClose();
      } else {
        setPhoto(`data:${result.photo.mimeType};base64,${result.photo.base64}`);
        setDetails({
          ...Object.fromEntries(fields.map(([key, , source]) => [key, result.data[source] ?? ""])),
          gender: "",
        });
      }
    } catch (err) {
      setError(err.message || "Unable to process the candidate card.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--admin-border)] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-4">
          <h2 id={titleId} className="text-xl font-bold text-[var(--admin-gold-ink)]">
            Upload Candidate Card
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} disabled={busy} className="rounded-lg p-2 disabled:opacity-50">
            <X size={20} />
          </button>
        </header>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="space-y-4 p-5">
            <label
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center focus-within:ring-2 focus-within:ring-amber-600"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                selectFile(event.dataTransfer.files[0]);
              }}
            >
              <ImageUp size={28} className="text-[var(--admin-gold-text)]" />
              <span className="break-all font-semibold">{file?.name || "Drop a card image or browse files"}</span>
              <span className="text-sm text-slate-600">{file ? "Choose a different image" : "JPEG or PNG, up to 1 MB"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={(event) => {
                  selectFile(event.target.files[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {details && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img src={photo} alt="Cropped candidate portrait" className="h-28 w-24 rounded-lg border object-contain" />
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">Check the cropped photo and correct the extracted details before saving.</p>
                    {!adjustingPhoto && (
                      <button type="button" onClick={() => setAdjustingPhoto(true)} className="rounded-lg border border-[var(--admin-border)] px-3 py-2 text-sm font-semibold text-[var(--admin-gold-text)]">
                        Adjust photo
                      </button>
                    )}
                  </div>
                </div>
                {adjustingPhoto && (
                  <CardPhotoEditor
                    file={file}
                    initialCrop={crop}
                    onCancel={() => setAdjustingPhoto(false)}
                    onApply={(jpeg, appliedCrop) => {
                      setPhoto(jpeg);
                      setCrop(appliedCrop);
                      setAdjustingPhoto(false);
                    }}
                  />
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {fields.map(([key, label, , required]) => (
                    <label key={key} className="grid gap-1 text-sm font-medium">
                      {label}{required && " *"}
                      <input
                        type="text"
                        inputMode={key === "age" ? "numeric" : key === "phone" ? "tel" : undefined}
                        required={required}
                        maxLength={key === "name" ? 150 : 200}
                        value={details[key]}
                        onChange={(event) => setDetails({ ...details, [key]: event.target.value })}
                        className="min-w-0 rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </label>
                  ))}
                  <label className="grid gap-1 text-sm font-medium">
                    Gender *
                    <select
                      required
                      value={details.gender}
                      onChange={(event) => setDetails({ ...details, gender: event.target.value })}
                      className="rounded-lg border border-slate-300 px-3 py-2"
                    >
                      <option value="">Select gender</option>
                      <option>Bride</option>
                      <option>Groom</option>
                      <option>Other</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          </fieldset>
          <footer className="flex justify-end gap-2 border-t border-[var(--admin-border)] p-4">
            <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={!file || busy || adjustingPhoto} className="rounded-lg bg-[var(--admin-gold-strong)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {details ? (busy ? "Saving..." : "Approve & Save") : (busy ? "Extracting..." : "Extract Details")}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

import { useState } from "react";

const API = import.meta.env.VITE_BACKEND_URL || "";

/** importante
 * Props:
 *  onUpload(url)  — callback con la URL de Cloudinary
 *  currentUrl     — URL actual para preview inicial
 *  label          — texto del label
 *  shape          — "square" | "circle"
 *  previewWidth   — ancho del preview en px (default 120)
 *  previewHeight  — alto del preview en px (default 160)
 */
export const ImageUploader = ({
  onUpload,
  currentUrl = "",
  label = "Image",
  shape = "square",
  previewWidth = 120,
  previewHeight = 160,
}) => {
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isCircle = shape === "circle";

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local instantáneo
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError("");
    setUploading(true);

    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.msg || "Upload failed");

      setPreview(data.url);
      onUpload(data.url);
    } catch (err) {
      setError(err.message);
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label style={{ fontWeight: 600, fontSize: 14, color: "#F0F0F0", marginBottom: 0 }}>
        {label}
      </label>

      {preview && (
        <div
          style={{
            width: isCircle ? previewWidth : previewWidth,
            height: isCircle ? previewWidth : previewHeight,
            borderRadius: isCircle ? "50%" : 8,
            overflow: "hidden",
            border: "2px solid #7DD750",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <img
            src={preview}
            alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {uploading && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>
              ⏳
            </div>
          )}
        </div>
      )}

      <label
        style={{
          cursor: uploading ? "not-allowed" : "pointer",
          background: "#1a1c2e",
          border: "1.5px dashed #7DD750",
          borderRadius: 8,
          padding: "8px 16px",
          color: uploading ? "#555" : "#7DD750",
          fontSize: 14,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          userSelect: "none",
          transition: "opacity 0.2s",
        }}
      >
        {uploading ? "⏳ Uploading..." : "📁 Choose image"}
        <input
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          style={{ display: "none" }}
          onChange={handleFile}
          disabled={uploading}
        />
      </label>

      {error && (
        <p style={{ color: "#D64F82", fontSize: 13, margin: 0 }}>⚠ {error}</p>
      )}
    </div>
  );
};
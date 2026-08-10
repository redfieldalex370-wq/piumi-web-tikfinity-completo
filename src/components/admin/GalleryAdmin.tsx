"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

const MAX_ADMIN_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_SIDE = 1800;

interface Artwork {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  artist_name: string | null;
  artist_url: string | null;
  featured: boolean;
  active: boolean;
  sort_order: number;
  tags: string[];
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(response.ok ? "Respuesta invalida del servidor." : `El servidor respondio con error ${response.status}.`);
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen.")), "image/webp", quality);
  });
}

async function prepareImage(file: File): Promise<File> {
  if (file.size <= MAX_ADMIN_UPLOAD_BYTES) return file;

  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
      image.src = objectUrl;
    });

    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la imagen.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let blob = await canvasToBlob(canvas, 0.86);
    for (const quality of [0.76, 0.66, 0.56]) {
      if (blob.size <= MAX_ADMIN_UPLOAD_BYTES) break;
      blob = await canvasToBlob(canvas, quality);
    }
    if (blob.size > MAX_ADMIN_UPLOAD_BYTES) {
      throw new Error("La imagen sigue siendo demasiado pesada. Usa una imagen menor a 4 MB.");
    }
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function GalleryAdmin() {
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/portfolio")
      .then(async (response) => {
        const data = await parseResponse(response);
        if (!response.ok) throw new Error(data.error || "No se pudo cargar la galeria.");
        setItems(data.portfolio || []);
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const file = formData.get("file");
      if (!(file instanceof File)) throw new Error("Selecciona una imagen valida.");
      const preparedFile = await prepareImage(file);
      formData.set("file", preparedFile);

      const response = await fetch("/api/admin/portfolio", { method: "POST", body: formData });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || "No se pudo publicar.");
      setItems((current) => [data.item, ...current]);
      form.reset();
      setMessage(preparedFile.size < file.size ? "Dibujo publicado con imagen optimizada." : "Dibujo publicado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo publicar.");
    } finally {
      setSaving(false);
    }
  }

  function change(id: string, key: keyof Artwork, value: unknown) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  }

  async function save(item: Artwork) {
    const response = await fetch(`/api/admin/portfolio/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
    const data = await parseResponse(response);
    setMessage(response.ok ? `"${item.title}" actualizado.` : data.error || "No se pudo guardar.");
  }

  async function remove(item: Artwork) {
    if (!confirm(`Eliminar "${item.title}"?`)) return;
    const response = await fetch(`/api/admin/portfolio/${item.id}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((artwork) => artwork.id !== item.id));
  }

  return (
    <div className="admin-stack">
      {message && <p className="admin-message">{message}</p>}
      <section className="admin-card">
        <h2>Subir dibujo</h2>
        <form className="form-grid" onSubmit={create}>
          <Field label="Imagen *"><input className="input" type="file" name="file" accept="image/*" required /></Field>
          <Field label="Titulo *"><input className="input" name="title" required /></Field>
          <Field label="Etiquetas"><input className="input" name="tags" placeholder="Icon, Full color, Piumi" /></Field>
          <Field label="Orden"><input className="input" name="sort_order" type="number" defaultValue="0" /></Field>
          <Field label="Artista"><input className="input" name="artist_name" /></Field>
          <Field label="Enlace del artista"><input className="input" name="artist_url" type="url" /></Field>
          <Field label="Descripcion" wide><textarea className="input min-h-24" name="description" /></Field>
          <label className="terms-check"><input type="checkbox" name="featured" /><span>Destacado</span></label>
          <label className="terms-check"><input type="checkbox" name="active" defaultChecked /><span>Visible</span></label>
          <button className="btn-primary wide" disabled={saving}>{saving ? "Subiendo..." : "Publicar dibujo"}</button>
        </form>
      </section>

      <section>
        <div className="admin-section-title"><h2>Dibujos publicados</h2><span>{items.length}</span></div>
        {loading ? <p>Cargando...</p> : (
          <div className="admin-gallery-grid">
            {items.map((item) => (
              <article className="admin-art-card" key={item.id}>
                <img src={item.image_url} alt={item.title} />
                <div className="admin-art-form">
                  <input className="input" value={item.title} onChange={(event) => change(item.id, "title", event.target.value)} />
                  <textarea className="input" value={item.description || ""} onChange={(event) => change(item.id, "description", event.target.value || null)} />
                  <input className="input" value={item.tags.join(", ")} onChange={(event) => change(item.id, "tags", event.target.value.split(",").map((value) => value.trim()).filter(Boolean))} />
                  <div className="inline-fields">
                    <label><input type="checkbox" checked={item.featured} onChange={(event) => change(item.id, "featured", event.target.checked)} /> Destacado</label>
                    <label><input type="checkbox" checked={item.active} onChange={(event) => change(item.id, "active", event.target.checked)} /> Visible</label>
                  </div>
                  <div className="card-actions">
                    <button className="btn-primary" onClick={() => save(item)}>Guardar</button>
                    <button className="btn-secondary" onClick={() => remove(item)}>Eliminar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "field wide" : "field"}><span>{label}</span>{children}</label>;
}

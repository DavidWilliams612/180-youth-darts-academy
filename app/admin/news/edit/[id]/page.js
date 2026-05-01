"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EditUpdatePage({ params }) {
  const supabase = createClientBrowser();
  const router = useRouter();

  // Unwrap params (Next.js 13.1 gives params as a Promise)
  const [resolvedParams, setResolvedParams] = useState(null);

  // Form state
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [pinned, setPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  // Images
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // Unwrap params
  useEffect(() => {
    async function unwrap() {
      const p = await params;
      setResolvedParams(p);
    }
    unwrap();
  }, [params]);

  // Load update + images
  useEffect(() => {
    if (!resolvedParams) return;

    async function load() {
      const { data } = await supabase
        .from("news_updates")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

      if (data) {
        setTitle(data.title);
        setBody(data.body);
        setAudience(data.audience);
        setPinned(data.pinned);
        setExpiresAt(data.expires_at ? data.expires_at.slice(0, 16) : "");
      }

      const { data: imgs } = await supabase
        .from("news_update_images")
        .select("*")
        .eq("update_id", resolvedParams.id)
        .order("created_at", { ascending: true });

      setExistingImages(imgs || []);

      setLoading(false);
    }

    load();
  }, [resolvedParams]);

  // Upload new images
  async function uploadImages(updateId, files) {
    for (const file of files) {
      const filePath = `${updateId}/${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(filePath, file);

      if (!uploadError) {
        const publicUrl = supabase.storage
          .from("news-images")
          .getPublicUrl(filePath).data.publicUrl;

        await supabase.from("news_update_images").insert({
          update_id: updateId,
          image_url: publicUrl,
        });
      }
    }
  }

  // Delete an image
  async function deleteImage(image) {
    const confirmed = confirm("Delete this image?");
    if (!confirmed) return;

    // Remove from storage
    const path = image.image_url.split("/news-images/")[1];
    await supabase.storage.from("news-images").remove([path]);

    // Remove from DB
    await supabase
      .from("news_update_images")
      .delete()
      .eq("id", image.id);

    setExistingImages((prev) => prev.filter((img) => img.id !== image.id));
  }

  async function saveUpdate() {
    await supabase
      .from("news_updates")
      .update({
        title,
        body,
        audience,
        pinned,
        expires_at: expiresAt || null,
      })
      .eq("id", resolvedParams.id);

    if (newImages.length > 0) {
      await uploadImages(resolvedParams.id, newImages);
    }

    router.push("/admin/news");
  }

  if (!resolvedParams || loading) {
    return <div className="p-8 text-white">Loading…</div>;
  }

  return (
    <div className="p-8 text-white max-w-3xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold tracking-tight text-brand drop-shadow-[var(--brand-glow)]">
        Edit Update
      </h1>

      <div className="space-y-6 bg-white/5 border border-brand/30 p-6 rounded-xl backdrop-blur-md shadow-[0_0_12px_rgba(0,255,127,0.15)]">

        {/* Title */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Title</label>
          <input
            className="w-full p-3 rounded bg-black/40 border border-white/10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Body</label>
          <textarea
            className="w-full p-3 rounded bg-black/40 border border-white/10 h-40"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {/* Audience */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Audience</label>
          <select
            className="w-full p-3 rounded bg-black/40 border border-white/10"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="all">All Players</option>
            <option value="u10">U10</option>
            <option value="u14">U14</option>
            <option value="u18">U18</option>
            <option value="adult">Adult</option>
            <option value="gold">Gold Tier</option>
            <option value="silver">Silver Tier</option>
            <option value="bronze">Bronze Tier</option>
          </select>
        </div>

        {/* Pinned */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          <label className="text-white/70">Pin this update</label>
        </div>

        {/* Expires */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Expires At</label>
          <input
            type="datetime-local"
            className="w-full p-3 rounded bg-black/40 border border-white/10"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>

        {/* Existing Images */}
        <div>
          <label className="block text-sm text-white/70 mb-2">Existing Images</label>

          {existingImages.length === 0 && (
            <p className="text-white/50 text-sm">No images yet.</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.image_url}
                  className="w-full h-24 object-cover rounded border border-white/10"
                />
                <button
                  onClick={() => deleteImage(img)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-80 hover:opacity-100 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload New Images */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Add Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setNewImages([...e.target.files])}
            className="w-full p-3 rounded bg-black/40 border border-white/10"
          />

          {newImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Array.from(newImages).map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  className="w-full h-24 object-cover rounded border border-white/10"
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={saveUpdate}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

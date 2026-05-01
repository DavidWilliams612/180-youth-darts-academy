"use client";

import { useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CreateUpdatePage() {
  const supabase = createClientBrowser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [pinned, setPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [images, setImages] = useState([]);

  // Upload images to Supabase Storage + insert into DB
  async function uploadImages(updateId, files) {
    for (const file of files) {
      const filePath = `${updateId}/${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const publicUrl = supabase.storage
        .from("news-images")
        .getPublicUrl(filePath).data.publicUrl;

      const { error: insertError } = await supabase
        .from("news_update_images")
        .insert({
          update_id: updateId,
          image_url: publicUrl,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
      }
    }
  }

  async function createUpdate() {
    const { data, error } = await supabase
      .from("news_updates")
      .insert({
        title,
        body,
        audience,
        pinned,
        expires_at: expiresAt || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create update error:", error);
      return;
    }

    // Upload images AFTER update is created
    if (images.length > 0) {
      await uploadImages(data.id, images);
    }

    router.push("/admin/news");
  }

  return (
    <div className="p-8 text-white max-w-3xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold tracking-tight text-brand drop-shadow-[var(--brand-glow)]">
        Create Update
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

        {/* Image Upload */}
        <div>
          <label className="block text-sm text-white/70 mb-1">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages([...e.target.files])}
            className="w-full p-3 rounded bg-black/40 border border-white/10"
          />

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Array.from(images).map((img, i) => (
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
          onClick={createUpdate}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
        >
          Create Update
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function UpdateGallery({ updateId }) {
  const [images, setImages] = useState([]);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    async function loadImages() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/news_update_images?update_id=eq.${updateId}`,
        {
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
          cache: "no-store",
        }
      );

      const imgs = await res.json();
      setImages(imgs);
    }

    loadImages();
  }, [updateId]);

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-brand-light drop-shadow-[var(--brand-glow)]">
        Photos
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setModalImage(img.image_url)}
            className="group"
          >
            <img
  src={img.image_url}
  className="w-full h-40 object-contain bg-black/40 rounded-lg border border-white/10 shadow-[0_0_8px_rgba(0,255,127,0.15)] group-hover:opacity-80 transition"
/>

          </button>
        ))}
      </div>

      {/* Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-[0_0_20px_rgba(0,255,127,0.3)]"
          />
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

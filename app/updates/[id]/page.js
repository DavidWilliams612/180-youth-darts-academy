import UpdateGallery from "./UpdateGallery";
import MarkAsRead from "./MarkAsRead";

export default async function UpdatePage({ params }) {
  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/news_updates?id=eq.${id}`,
    {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      cache: "no-store",
    }
  );

  const data = await res.json();
  const update = data[0];

  if (!update) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold text-brand drop-shadow-[var(--brand-glow)]">
          Update not found
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Mark as read (client component) */}
      <MarkAsRead updateId={id} />

      {/* Title + Date */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand drop-shadow-[var(--brand-glow)]">
          {update.title}
        </h1>

        <p className="text-white/60 text-sm">
          {new Date(update.created_at).toLocaleString()}
        </p>
      </div>

      {/* Body */}
      <div className="bg-white/5 border border-brand/30 rounded-xl p-6 backdrop-blur-md shadow-[0_0_12px_rgba(0,255,127,0.15)]">
        <p className="whitespace-pre-wrap text-white/80">
          {update.body}
        </p>
      </div>

      {/* Image Gallery */}
      <UpdateGallery updateId={id} />

      {/* Back Link */}
      <a
        href="/updates"
        className="text-brand-light underline text-sm drop-shadow-[var(--brand-glow)]"
      >
        ← Back to all updates
      </a>
    </div>
  );
}

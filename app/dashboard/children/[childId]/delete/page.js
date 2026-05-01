"use client";

import { useRouter, useParams } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/client";

export default function DeleteChildPage() {
  const supabase = createClientBrowser();
  const router = useRouter();
  const { childId } = useParams();

  const handleDelete = async () => {
    await supabase.from("players").delete().eq("id", childId);
    router.push("/dashboard/children");
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Delete Child</h1>
      <p className="text-white/70 mb-6">
        Are you sure you want to delete this child? This action cannot be undone.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-black rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

"use client";

function getInitials(name) {
  if (!name) return "P";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, photo, size = 40 }) {
  const initials = getInitials(name);

  return (
    <div
      className="rounded-full overflow-hidden border border-white/20 shadow-lg bg-black/60 flex items-center justify-center font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

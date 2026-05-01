import Link from "next/link";
import clsx from "clsx";

export default function Button({ href, className, children, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition focus:outline-none";

  if (href) {
    return (
      <Link
        href={href}
        className={clsx(base, className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={clsx(base, className)}
      {...props}
    >
      {children}
    </button>
  );
}

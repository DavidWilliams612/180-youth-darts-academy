import "./globals.css";
import FetchLogger from "./FetchLogger";
import ClientRoot from "./ClientRoot";
import StagingAccessGate from "./staging-access-gate";

export const metadata = {
  title: "180 Darts Academy",
  description: "Play. Improve, Compete",
};

export default function RootLayout({ children }) {
  // Vercel sets NEXT_PUBLIC_VERCEL_ENV = "production" | "preview" | "development"
  const isStaging = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

  return (
    <html lang="en">
      <body className="min-h-screen text-white">
        {/* <FetchLogger /> */}
        <ClientRoot /> {/* ⭐ all global client logic lives here */}

        {isStaging ? (
          <StagingAccessGate>{children}</StagingAccessGate>
        ) : (
          children
        )}
      </body>
    </html>
  );
}

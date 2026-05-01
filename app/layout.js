import "./globals.css";
import FetchLogger from "./FetchLogger";
import ClientRoot from "./ClientRoot";

export const metadata = {
  title: "180 Darts Academy",
  description: "Play. Improve, Compete",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white">
        {/* <FetchLogger /> */}
        <ClientRoot />   {/* ⭐ all global client logic lives here */}
        {children}
      </body>
    </html>
  );
}

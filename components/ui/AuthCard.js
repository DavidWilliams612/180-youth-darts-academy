export default function AuthCard({ children }) {
  return (
    <div className="w-full max-w-lg mx-auto p-8 space-y-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-xl animate-fadeIn">
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

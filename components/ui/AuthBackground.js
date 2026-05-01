export default function AuthBackground({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-brand-soft overflow-hidden">
      
      {/* Background image */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src="/images/darting-bg.svg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Centered content + logo */}
      <div className="relative z-10 w-full flex flex-col items-center space-y-8">
        <img src="/logo.png" alt="Dartly" className="h-12 opacity-90" />
        {children}
      </div>
    </div>
  );
}

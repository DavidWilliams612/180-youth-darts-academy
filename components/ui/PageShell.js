export default function PageShell({ children, className = "" }) {
  return (
    <div
      className={`
        min-h-screen 
        flex 
        items-center 
        justify-center 
        px-4
      `}
    >
      <div className={`w-full max-w-md ${className}`}>
        {children}
      </div>
    </div>
  );
}

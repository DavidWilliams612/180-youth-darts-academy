export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white shadow-card rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

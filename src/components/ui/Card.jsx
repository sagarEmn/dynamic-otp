// Standard white surface. See documentation/design-system.md > Core Components.
export default function Card({ className = "", children }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

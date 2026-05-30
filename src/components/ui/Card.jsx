export default function Card({ className = "", children }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-card ${className}`}>
      {children}
    </div>
  );
}
